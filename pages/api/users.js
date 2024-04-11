import { db } from '../../db/index.js';
import { users } from '../../db/schema/users';
import { verifications } from '../../db/schema/verifications';
import { eq } from 'drizzle-orm';
import { scryptSync } from 'crypto'
import { VerifyEmailTemplate } from '../../components/EmailTemplates';
import { Resend } from 'resend';

const PASSWORD_SALT = process.env.PASSWORD_SALT
const resend = new Resend(process.env.RESEND_API_KEY);

// TODO:
// allow updating a user. only themselves or admin can do this.
// we will use this on the settings page and on the user admin page.

export default async (req, res) => {
    if (req.method === 'GET') {
        // allow find by email or user_id
        let q = db.select().from(users)
        if (req?.query?.email) {
            q.where(eq(users.email, req.query.email))
        } else if (req?.query?.userId) {
            q.where(eq(users.id, req.query.userId))
        }

        let data = await q

        // remove the password
        if (Array.isArray(data)) {
            data = data.map(user => {
                delete user.password
                return user
            })
        } else {
            delete data.password
        }

        return res.status(200).json(data)
    } else if (req.method === 'PUT') {
        // check headers for user id
        // if user id is not the same as the user being updated, check for admin
        // header is x-mcdoodle-user-id
        try {
            const { id, ...data } = req.body
            if (data.password) {
                const saltedAndHashed = scryptSync(data.password, PASSWORD_SALT, 64).toString('hex')
                data.password = saltedAndHashed
            }
            let response = await db.update(users).set(data).where(eq(users.id, id)).returning();
            response = response[0]
            return res.status(200).json(response);
        } catch (err) {
            console.error(err);
            return res.status(500).json({ msg: 'Something went wrong' });
        }
    } else if (req.method === 'POST') {
        try {
            const data = req.body
            if (data.password) {
                const saltedAndHashed = scryptSync(data.password, PASSWORD_SALT, 64).toString('hex')
                data.password = saltedAndHashed
            } else {
                return res.status(400).json({ msg: 'Password is required' });
            }
            let response = await db.insert(users).values(data).returning();
            response = response[0]

            // send email verification here
            let [verificationRecord] = await db.insert(verifications).values({
                email: response.email,
                status: 'active'
            }).returning();

            await resend.emails.send({
                from: 'McDoodle <mcdoodle+registration@email.mcbrides.us>',
                to: [response.email],
                subject: 'McDoodle Account Verification',
                react: VerifyEmailTemplate({
                    email: response.email,
                    firstName: response.firstName,
                    lastName: response.lastName,
                    token: verificationRecord.id
                }),
            });

            return res.status(200).json(response);
        } catch (err) {
            console.error(err);
            return res.status(500).json({ msg: 'Something went wrong' });
        }
    }
}
