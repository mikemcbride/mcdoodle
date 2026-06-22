import { getDb } from '../../../db/index.js';
import { users } from '../../../db/schema/users.js';
import { verifications } from '../../../db/schema/verifications.js';
import { eq } from 'drizzle-orm';
import { scrypt } from '@noble/hashes/scrypt.js';
import type { HandlerContext, Env } from '../../types.js';
import { Resend } from 'resend';

// Helper function to match scryptSync API from node:crypto
// Returns hex string directly (Cloudflare Workers compatible)
function scryptSync(password: string, salt: string, keylen: number): { toString(encoding: 'hex'): string } {
    // scrypt parameters: N=16384, r=8, p=1 are common defaults
    // These match Node.js scryptSync defaults
    const result = scrypt(password, salt, { N: 16384, r: 8, p: 1, dkLen: keylen });
    // Convert Uint8Array to hex string
    const hex = Array.from(result).map(b => b.toString(16).padStart(2, '0')).join('');
    return {
        toString(_encoding: 'hex'): string {
            return hex;
        }
    };
}

function saltAndHashPassword(password: string, salt: string) {
    return scryptSync(password, salt, 64).toString('hex');
}

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
            const { id, ...data } = body;

            const sessionUser = c.get('user');
            if (!sessionUser) {
                return c.json({ msg: 'Unauthorized' }, 401);
            }
            const isAdmin = sessionUser.isAdmin || false;
            const isCallingUser = sessionUser.id === id;

            if (!isAdmin && !isCallingUser) {
                return c.json({ msg: 'Unauthorized' }, 401);
            }

            if (data.currentPassword && data.newPassword) {
                // A password change is only ever allowed on your own account.
                if (!isCallingUser) {
                    return c.json({ msg: 'Unauthorized' }, 401);
                }
                const [dbUser] = await db.select().from(users).where(eq(users.id, sessionUser.id)).limit(1);
                const saltedAndHashed = saltAndHashPassword(data.currentPassword, PASSWORD_SALT);
                // check if the current password is correct
                if (!dbUser || saltedAndHashed !== dbUser.password) {
                    return c.json({ msg: 'Incorrect password' }, 401);
                }
                // if it is correct, hash the new password and set it.
                data.password = saltAndHashPassword(data.newPassword, PASSWORD_SALT);
            }

            // remove the currentPassword and newPassword from the data
            delete data.currentPassword;
            delete data.newPassword;

            const response = await db.update(users).set(data).where(eq(users.id, id)).returning();
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
            const data = await c.req.json();

            if (data.password) {
                data.password = saltAndHashPassword(data.password, PASSWORD_SALT);
            } else {
                return c.json({ msg: 'Password is required' }, 400);
            }

            let response;
            try {
                response = await db.insert(users).values(data).returning();
            } catch (err) {
                console.error('caught error:', err);
                return c.json({ msg: 'Email already exists.' }, 409);
            }
            const user = Array.isArray(response) ? response[0] : response;

            // send email verification here
            let [verificationRecord] = await db.insert(verifications).values({
                email: user.email,
                status: 'active'
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

            return c.json(user, 200);
        } catch (err) {
            console.error(err);
            return c.json({ msg: 'Something went wrong' }, 500);
        }
    }

    return c.json({ error: 'Method not allowed' }, 405);
}
