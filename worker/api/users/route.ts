import { getDb } from '../../../db/index.js';
import { users } from '../../../db/schema/users.js';
import { eq } from 'drizzle-orm';
import { getCookie } from 'hono/cookie';
import { hashPassword, verifyPassword } from '../../password.js';
import { SESSION_COOKIE, revokeUserSessions } from '../../auth.js';
import { runInBackground } from '../../background.js';
import { createVerification, sendVerifyEmail, baseUrlFrom } from '../../emails.js';
import { registerSchema, updateProfileSchema, changeOwnPasswordSchema } from '../../schemas.js';
import type { HandlerContext, Env } from '../../types.js';

function isUniqueConstraintError(err: unknown): boolean {
    return err instanceof Error && err.message.includes('UNIQUE constraint failed');
}

export async function handleUsers(c: HandlerContext, env: Env) {
    const db = getDb(env.DB);
    const method = c.req.method;
    const PASSWORD_SALT = env.PASSWORD_SALT;

    if (method === 'GET') {
        // The user directory is admin-only: it exposes every account's email,
        // name, role, and verification status (and allows lookups by email,
        // which would otherwise enable account enumeration).
        const sessionUser = c.get('user');
        if (!sessionUser) {
            return c.json({ msg: 'Unauthorized' }, 401);
        }
        if (!sessionUser.isAdmin) {
            return c.json({ msg: 'Forbidden' }, 403);
        }

        const email = c.req.query('email');
        const userId = c.req.query('userId');

        // allow find by email or user_id
        let q: any = db.select().from(users);
        if (email) {
            q = q.where(eq(users.email, email));
        } else if (userId) {
            q = q.where(eq(users.id, userId));
        }

        let data: any = await q;

        // remove the password
        if (Array.isArray(data)) {
            data = data.map((user: any) => {
                const { password, ...userWithoutPassword } = user;
                return userWithoutPassword;
            });
        } else {
            const { password, ...userWithoutPassword } = data;
            data = userWithoutPassword;
        }

        return c.json(data, 200);
    }

    if (method === 'PUT') {
        // The caller is identified by their session cookie, never a client header.
        // Admins may update any user; everyone else may only update themselves.
        try {
            const body = await c.req.json();
            const id = typeof body?.id === 'string' ? body.id : null;
            if (!id) {
                return c.json({ msg: 'User id is required' }, 400);
            }

            const sessionUser = c.get('user');
            if (!sessionUser) {
                return c.json({ msg: 'Unauthorized' }, 401);
            }
            const isAdmin = sessionUser.isAdmin || false;
            const isCallingUser = sessionUser.id === id;
            if (!isAdmin && !isCallingUser) {
                return c.json({ msg: 'Unauthorized' }, 401);
            }

            const [targetUser] = await db.select().from(users).where(eq(users.id, id)).limit(1);
            if (!targetUser) {
                return c.json({ msg: 'Not found' }, 404);
            }

            // Build a whitelisted update payload — never spread the raw body.
            const updates: { email?: string; firstName?: string; lastName?: string; isAdmin?: boolean; isVerified?: boolean; password?: string } = {};

            const profile = updateProfileSchema.safeParse(body);
            if (!profile.success) {
                return c.json({ msg: 'Invalid request', errors: profile.error.flatten().fieldErrors }, 400);
            }
            if (profile.data.email !== undefined) updates.email = profile.data.email;
            if (profile.data.firstName !== undefined) updates.firstName = profile.data.firstName;
            if (profile.data.lastName !== undefined) updates.lastName = profile.data.lastName;

            // Role / verification changes are admin-only (closes self-promotion).
            if (isAdmin) {
                if (typeof body.isAdmin === 'boolean') updates.isAdmin = body.isAdmin;
                if (typeof body.isVerified === 'boolean') updates.isVerified = body.isVerified;
            }

            // Changing the account email invalidates its verified status: the new
            // address must be re-verified (otherwise anyone could park a verified
            // account on an address they don't own). An admin may still set
            // isVerified explicitly in the same request to override.
            const emailChanged = updates.email !== undefined && updates.email !== targetUser.email;
            if (emailChanged && updates.isVerified === undefined) {
                updates.isVerified = false;
            }

            // A password change is only ever allowed on your own account.
            let passwordChanged = false;
            if (body.currentPassword !== undefined || body.newPassword !== undefined) {
                if (!isCallingUser) {
                    return c.json({ msg: 'Unauthorized' }, 401);
                }
                const pw = changeOwnPasswordSchema.safeParse(body);
                if (!pw.success) {
                    return c.json({ msg: 'Invalid request', errors: pw.error.flatten().fieldErrors }, 400);
                }
                const check = await verifyPassword(pw.data.currentPassword, targetUser.password, PASSWORD_SALT);
                if (!check.valid) {
                    return c.json({ msg: 'Incorrect password' }, 401);
                }
                updates.password = await hashPassword(pw.data.newPassword);
                passwordChanged = true;
            }

            if (Object.keys(updates).length === 0) {
                return c.json({ msg: 'No valid fields to update' }, 400);
            }

            let response;
            try {
                response = await db.update(users).set(updates).where(eq(users.id, id)).returning();
            } catch (err) {
                if (isUniqueConstraintError(err)) {
                    return c.json({ msg: 'Email already exists.' }, 409);
                }
                throw err;
            }
            const updatedUser = Array.isArray(response) ? response[0] : response;

            // The password changed: revoke every *other* session so a stolen
            // session dies with the old credential (the caller keeps theirs).
            if (passwordChanged) {
                await revokeUserSessions(env, id, getCookie(c, SESSION_COOKIE));
            }

            // The email changed and wasn't admin-verified in the same request:
            // issue a fresh verification token and email the new address.
            if (emailChanged && updates.isVerified === false) {
                const verificationRecord = await createVerification(db, updatedUser.email, 'verify');
                const baseUrl = baseUrlFrom(c, env);
                runInBackground(c, 'verify-email (email change)', () =>
                    sendVerifyEmail(env, {
                        email: updatedUser.email,
                        firstName: updatedUser.firstName || '',
                        token: verificationRecord.id,
                        baseUrl,
                    }),
                );
            }

            // never return the password hash to the client
            if (updatedUser) {
                delete (updatedUser as { password?: string }).password;
            }

            return c.json(updatedUser, 200);
        } catch (err) {
            console.error(err);
            return c.json({ msg: 'Something went wrong' }, 500);
        }
    }

    if (method === 'POST') {
        try {
            const parsed = registerSchema.safeParse(await c.req.json());
            if (!parsed.success) {
                return c.json({ msg: 'Invalid request', errors: parsed.error.flatten().fieldErrors }, 400);
            }
            const input = parsed.data;
            // whitelist: never accept isAdmin/isVerified (or anything else) at signup
            const newUser = {
                email: input.email,
                password: await hashPassword(input.password),
                firstName: input.firstName ?? null,
                lastName: input.lastName ?? null,
            };

            let response;
            try {
                response = await db.insert(users).values(newUser).returning();
            } catch (err) {
                console.error('caught error:', err);
                return c.json({ msg: 'Email already exists.' }, 409);
            }
            const user = Array.isArray(response) ? response[0] : response;

            // Create the verification token in-request (durable), then send the
            // email after the response — a slow or failing Resend call should
            // neither delay signup nor 500 an already-created account.
            const verificationRecord = await createVerification(db, user.email, 'verify');
            const baseUrl = baseUrlFrom(c, env);
            runInBackground(c, 'verify-email (signup)', () =>
                sendVerifyEmail(env, {
                    email: user.email,
                    firstName: user.firstName || '',
                    token: verificationRecord.id,
                    baseUrl,
                }),
            );

            if (user) {
                delete (user as { password?: string }).password;
            }
            return c.json(user, 200);
        } catch (err) {
            console.error(err);
            return c.json({ msg: 'Something went wrong' }, 500);
        }
    }

    return c.json({ error: 'Method not allowed' }, 405);
}
