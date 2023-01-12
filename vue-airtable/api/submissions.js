import airtable from './_airtable'
const table = 'submissions'

export default async (req, res) => {
    try {
        const response = await airtable.process(table, req, res)
        res.json(response)
    } catch (e) {
        console.error('error processing request:', e)
        res.status(500)
        res.send('error processing request')
    }
}

