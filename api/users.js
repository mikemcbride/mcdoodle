import airtable from './_airtable'

const table = 'users'

export default async (req, res) => {
    let opts = {}

    // allow find by email or user_id
    if (req?.query?.email) {
        opts.filterByFormula = `{email} = "${req.query.email}"`
    } else if (req?.query?.userId) {
        opts.filterByFormula = `{user_id} = "${req.query.userId}"`
    } else {
        // just finding all users, add a sortBy
        opts.sort = [{field: 'user_id', direction: 'asc'}]
    }

    let data = await airtable.process(table, req, res, opts)

    // remove the password
    if (Array.isArray(data)) {
        data = data.map(user => {
            delete user.password
        })
    } else {
        delete data.password
    }

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

    return data
}
