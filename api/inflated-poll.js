import airtable from './_airtable'

export default async (req, res) => {
    // this special route only accepts a GET request and must always have an ID.
    // it's for fetching a poll detail with all attributes fully inflated.
    if (req.method !== 'GET') {
        res.status(400)
        res.send('Bad request')
    }
    try {
        const poll = await airtable.get('polls', req, res)

        const query = { poll: poll.id }
        const [questions, submissions, responses] = await Promise.all([
            airtable.get('questions', {}, res),
            airtable.get('submissions', {}, res),
            airtable.get('responses', {}, res),
        ])
        res.json({
            poll: poll,
            questions: questions.filter(q => q.poll.includes(poll.id)),
            submissions: submissions.filter(s => s.poll.includes(poll.id)),
            responses: responses.filter(r => r.poll.includes(poll.id))
        })
    } catch (e) {
        console.error('error processing request:', e)
        res.status(500)
        res.send('error processing request')
    }
}
