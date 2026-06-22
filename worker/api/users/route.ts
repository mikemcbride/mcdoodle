import { getDb } from '../../../db/index.js';
import { users } from '../../../db/schema/users.js';
import { verifications } from '../../../db/schema/verifications.js';
import { eq } from 'drizzle-orm';
import { hashPassword, verifyPassword } from '../../password.js';
import { registerSchema, updateProfileSchema, changeOwnPasswordSchema } from '../../schemas.js';
import type { HandlerContext, Env } from '../../types.js';
import { Resend } from 'resend';

export async function handleUsers(c: HandlerContext, env: Env) {
    const db = getDb(env.DB);
    const method = c.req.method;
    const PASSWORD_SALT = env.PASSWORD_SALT;

    if (method === 'GET') {
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

            // A password change is only ever allowed on your own account.
            if (body.currentPassword !== undefined || body.newPassword !== undefined) {
                if (!isCallingUser) {
                    return c.json({ msg: 'Unauthorized' }, 401);
                }
                const pw = changeOwnPasswordSchema.safeParse(body);
                if (!pw.success) {
                    return c.json({ msg: 'Invalid request', errors: pw.error.flatten().fieldErrors }, 400);
                }
                const [dbUser] = await db.select().from(users).where(eq(users.id, sessionUser.id)).limit(1);
                const check = dbUser ? verifyPassword(pw.data.currentPassword, dbUser.password, PASSWORD_SALT) : { valid: false };
                if (!check.valid) {
                    return c.json({ msg: 'Incorrect password' }, 401);
                }
                updates.password = hashPassword(pw.data.newPassword);
            }

            if (Object.keys(updates).length === 0) {
                return c.json({ msg: 'No valid fields to update' }, 400);
            }

            const response = await db.update(users).set(updates).where(eq(users.id, id)).returning();
            const updatedUser = Array.isArray(response) ? response[0] : response;

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
                password: hashPassword(input.password),
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

            // send email verification here
            const [verificationRecord] = await db.insert(verifications).values({
                email: user.email,
                status: 'active',
                purpose: 'verify',
                expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
            }).returning();

            const resend = new Resend(env.RESEND_API_KEY);
            // Get base URL from env or derive from request
            const baseUrl = env.BASE_URL || (() => {
                const url = new URL(c.req.url);
                return `${url.protocol}//${url.host}`;
            })();

            // Import email template dynamically - using @ts-ignore because we're importing React components in a worker
            // @ts-expect-error - importing React components in worker
            const VerifyEmailTemplate = await import('../../../emails/verify-email.tsx');
            
            await resend.emails.send({
                from: 'McDoodle <mcdoodle+registration@email.mcbrides.us>',
                to: [user.email],
                subject: 'McDoodle Account Verification',
            react: VerifyEmailTemplate.default({
                email: user.email,
                firstName: user.firstName || '',
                token: verificationRecord.id,
                baseUrl: baseUrl
            }),
            });

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
