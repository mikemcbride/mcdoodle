import airtable from './_airtable'
import filterByRelatedTable from './_filterByRelatedTable'

export default async (req, res) => {
    // this special route only accepts a GET request and must always have an ID.
    // it's for fetching a poll detail with all attributes fully inflated.
    if (req.method !== 'GET') {
        res.status(400)
        res.send('Bad request')
    }
    try {
        const [poll, questions, submissions, responses] = await Promise.all([
            airtable.get('polls', req, res),
            airtable.get('questions', {}, res, filterByRelatedTable('poll_id', req.query.id)),
            airtable.get('submissions', {}, res, filterByRelatedTable('poll_id', req.query.id)),
            airtable.get('responses', {}, res, filterByRelatedTable('poll_id', req.query.id)),
        ])
        res.json({
            poll: poll,
            questions: questions,
            submissions: submissions,
            responses: responses
        })
    } catch (e) {
        console.error('error processing request:', e)
        res.status(500)
        res.send('error processing request')
    }
}

