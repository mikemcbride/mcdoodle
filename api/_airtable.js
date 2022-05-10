// this file will give us some generic functions for CRUD operations against Airtable tables.
// it will serve as our proxy to the Airtable package. We should always be using this file.
// it will be a useful abstraction for the various API routes we'll have so we don't have to duplicate these basics.
import Airtable from 'airtable'
import formatRecord from './_formatRecord'
Airtable.configure({ apiKey: process.env.AIRTABLE_API_KEY })
const base = Airtable.base('appKddKCJHAkGLxIr')

export default {
    async process(table, req, res) {
        const { query } = req
        // this one can be super useful if you don't need any sorting or special options.
        // you can pass in the request and just let it get all basic CRUD based on the method.
        // the only thing you will need to build out is any query options for LIST endpoints.
        if (req.method === 'GET') {
            return await this.get(table, req, res, query)
        } else if (req.method === 'POST') {
            return await this.post(table, req, res)
        } else if (req.method === 'PUT' || req.method === 'PATCH') {
            return await this.put(table, req, res)
        } else if (req.method === 'DELETE') {
            return await this.delete(table, req, res)
        } else {
            res.status(200).send('success')
        }
    },
    async get(table, req, res, query) {
        // get method should handle list or show
        let errorMessage = `error fetching records from ${table}`
        try {
            if (req.query?.id) {
                errorMessage = `error fetching record from ${table} with id ${req.query?.id}`
                const data = await base(table).find(req.query?.id)
                return formatRecord(data)
            } else {
                if (!query) {
                    query = {}
                }
                const filters = []
                Object.keys(query).forEach(key => {
                    filters.push(`{${key}} = "${query[key]}"`)
                })
                let opts = {
                    filterByFormula: ''
                }
                if (filters.length > 1) {
                    opts.filterByFormula = `AND(${filters.join(', ')})`
                } else if (filters.length === 1) {
                    opts.filterByFormula = filters[0]
                }
                const data = await base(table).select(opts).all()
                return formatRecord(data)
            }
        } catch (err) {
            res.statusCode = err.statusCode || 500
            console.error(errorMessage, err)
            return err
        }
    },
    async post(table, req, res) {
        try {
            const exists = await this.get(table, req, res, { date: req.body.date })
            if (exists.length) {
                // if we have an existing row with the same date, let's do an update instead.
                const hoursToAdd = req.body.hours
                req.body = exists[0]
                req.body.hours += hoursToAdd
                return await this.put(table, req, res)
            } else {
                const data = await base(table).create(req.body)
                return formatRecord(data)
            }
        } catch (err) {
            res.statusCode = err.statusCode || 500
            console.error(`error creating record in table ${table}:`, err)
            return err
        }
    },
    async put(table, req, res) {
        const { id, ...payload } = req.body
        Object.keys(payload).forEach(key => {
            // Airtable will not allow updating computed fields.
            // As a convention, I'm making all fields ending in _id computed fields,
            // so we'll want to delete these in case it's included.
            // Ideally I'll only send over the data that needs to be updated,
            // but including this here just to be safe.
            if (key.endsWith('_id')) {
                delete payload[key]
            }
        })

        try {
            const data = await base(table).update(id, payload)
            return formatRecord(data)
        } catch (err) {
            res.statusCode = err.statusCode || 500
            console.error(`error updating record on table ${table} with id ${id}`, err)
            return err
        }
    },
    async delete(table, req, res) {
        try {
            return await base(table).destroy(req.query?.id)
        } catch (err) {
            res.statusCode = err.statusCode || 500
            console.error(`unable to delete record from table ${table} with id ${req.query?.id}`, err)
            return err
        }
    }
}
