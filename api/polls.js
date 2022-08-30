import airtable from './_airtable'
const table = 'polls'

export default async (req, res) => {
    try {
        // create poll requires an API key to be passed as a header to prevent unauthorized poll creation.
        const apiKeyHeaderIndex = req.rawHeaders.indexOf('x-mcdoodle-api-key')
        if (req.method === 'POST' && (req.rawHeaders[apiKeyHeaderIndex + 1] !== process.env.API_SECRET || !req.rawHeaders.includes('x-mcdoodle-api-key'))) {
            res.status(401)
            res.send('unauthorized request')
        } else {
            const response = await airtable.process(table, req, res)
            res.json(response)
        }
    } catch (e) {
        console.error('error processing request:', e)
        res.status(500)
        res.send('error processing request')
    }
}
