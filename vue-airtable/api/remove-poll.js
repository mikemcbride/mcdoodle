import airtable from './_airtable'
import filterByRelatedTable from './_filterByRelatedTable'

export default async (req, res) => {
    // this special route only accepts a DELETE request.
    // it will remove a poll and all associated data (questions, submissions, responses)
    if (req.method !== 'DELETE') {
        res.status(400)
        res.send('Bad request')
    }
    // removing a poll requires authorization
    const apiKeyHeaderIndex = req.rawHeaders.indexOf('x-mcdoodle-api-key')
    if (req.rawHeaders[apiKeyHeaderIndex + 1] !== process.env.API_SECRET || !req.rawHeaders.includes('x-mcdoodle-api-key')) {
        res.status(401)
        res.send('unauthorized request')
        return
    }
    try {
        // fetch related content
        const [poll, questions, submissions, responses] = await Promise.all([
            airtable.get('polls', req, res),
            airtable.get('questions', {}, res, filterByRelatedTable('poll_id', req.query.id)),
            airtable.get('submissions', {}, res, filterByRelatedTable('poll_id', req.query.id)),
            airtable.get('responses', {}, res, filterByRelatedTable('poll_id', req.query.id)),
        ])

        const questionIds = questions.map(it => it.id)
        const submissionIds = submissions.map(it => it.id)
        const responseIds = responses.map(it => it.id)

        // delete all records
        await Promise.all([
            airtable.delete('polls', { query: { id: poll.id }}, res),
            ...questionIds.map(it => airtable.delete('questions', { query: { id: it }}, res)),
            ...submissionIds.map(it => airtable.delete('submissions', { query: { id: it }}, res)),
            ...responseIds.map(it => airtable.delete('responses', { query: { id: it }}, res)),
        ])

        res.json({
            message: 'ok'
        })
    } catch (e) {
        console.error('error processing request:', e)
        res.status(500)
        res.send('error processing request')
    }
}
