import airtable from './_airtable'

export default async (req, res) => {
    // this special route only accepts a DELETE request.
    // it will remove a poll and all associated data (questions, submissions, responses)
    if (req.method !== 'DELETE') {
        res.status(400)
        res.send('Bad request')
    }
    try {
        // will return a single poll, since we have an ID parameter
        const poll = await airtable.get('polls', req, res)

        // fetch related content
        const [questions, submissions, responses] = await Promise.all([
            airtable.get('questions', {}, res),
            airtable.get('submissions', {}, res),
            airtable.get('responses', {}, res),
        ])

        const questionIds = questions.filter(q => q.poll.includes(poll.id)).map(it => it.id)
        const submissionIds = submissions.filter(s => s.poll.includes(poll.id)).map(it => it.id)
        const responseIds = responses.filter(r => r.poll.includes(poll.id)).map(it => it.id)

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
