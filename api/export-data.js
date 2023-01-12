import airtable from './_airtable'

function getIdByRecId(list, rec) {
    const found = list.findIndex(item => item.id === rec)
    return found >= 0 ? found + 1 : -1
}

export default async (req, res) => {
    // this special route only accepts a GET request and must always have an ID.
    // it's for fetching a poll detail with all attributes fully inflated.
    if (req.method !== 'GET') {
        res.status(400)
        res.send('Bad request')
    }
    try {
        let [polls, questions, submissions, responses] = await Promise.all([
            airtable.get('polls', {}, res),
            airtable.get('questions', {}, res),
            airtable.get('submissions', {}, res),
            airtable.get('responses', {}, res),
        ])
        res.json({
          polls: polls.map(poll => {
              return {
                  title: poll.title,
                  status: poll.status,
                  description: poll.description || ""
              }
          }),
          questions: questions.map(question => {
              return {
                  value: question.value,
                  poll_id: getIdByRecId(polls, question.poll_id[0])
              }
          }),
          submissions: submissions.map(submission => {
              return {
                  person: submission.person,
                  poll_id: getIdByRecId(polls, submission.poll_id[0]),
              }
          }),
          responses: responses.map(response => {
              return {
                  value: response.value,
                  question_id: getIdByRecId(questions, response.question[0]),
                  submission_id: getIdByRecId(submissions, response.submission[0])
              }
          })
        })
    } catch (e) {
        console.error('error processing request:', e)
        res.status(500)
        res.send('error processing request')
    }
}
