import airtable from './_airtable'
import { scryptSync } from 'crypto'

const PASSWORD_SALT = process.env.AIRTABLE_PASSWORD_SALT
const table = 'users'

export default async (req, res) => {
    if (req.method !== 'POST') {
        return {}
    }

    let opts = {}

    if (req.body.email) {
        if (req.body.email.includes('@')) {
            // it's an email
            opts.filterByFormula = `{email} = "${req.body.email}"`
        } else {
            // it's a username
            opts.filterByFormula = `{userName} = "${req.body.email}"`
        }
    }

    let data = await airtable.get(table, req, res, opts)

    // if we are searching by email or user_id, this is essentially a find,
    // not a list - so just grab the first item in the array. also treat no items as a 404.
    if (opts.filterByFormula) {
        if (data.length > 0) {
            data = data[0]
        } else {
            res.statusCode = 404
            data = { message: 'user not found' }
        }
    }

    // now check if the password is valid.
    // we salt and hash passwords, so we'll have to do that with the text that was
    const saltedAndHashed = scryptSync(req.body.password, PASSWORD_SALT, 64).toString('hex')

    // if password from db doesn't match, they didn't successfully log in. Throw a 401.
    if (data.password !== saltedAndHashed) {
        res.status(401)
        data = { message: 'unauthorized' }
    } else {
        data.apiKey = process.env.API_SECRET
    }

    // remove the password before sending back
    delete data.password

    res.json(data)
}
