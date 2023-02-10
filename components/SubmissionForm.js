import clsx from 'clsx';
import { XCircleIcon } from '@heroicons/react/24/solid';
import { useState } from 'react';

import Spinner from './Spinner';
import DateResponse from './DateResponse';

import Submissions from '../services/submissions.js';
import Responses from '../services/responses.js';

const SubmissionForm = ({ poll, submission, handleCancel, handleSubmitted, }) => {
  // set up local component data
  const questions = poll.questions;
  let initialVotes = []
  if (submission === null) {
    initialVotes = questions.map(question => {
      return {
        question: question.id,
        date: question.value,
        response: null,
      }
    })
  } else {
    initialVotes = questions.map(question => {
      const found = submission.responses.find(r => r.question_id === question.id)
      const response = found ? found.value : null
      return {
        question: question.id,
        date: question.value,
        response: response
      }
    })
  }

  const [votes, setVotes] = useState(initialVotes)
  const [submittedBy, setSubmittedBy] = useState(submission === null ? '' : submission.person)
  const [submitting, setSubmitting] = useState(false)
  const [showInvalidMessage, setShowInvalidMessage] = useState(false)
  const [validationErrors, setValidationErrors] = useState([])

  // methods
  function setVote(payload) {
    let existing = votes.find(vote => vote.question === payload.question)
    if (!existing) {
      setVotes([...votes, payload])
    } else {
      setVotes(votes.map(vote => {
        if (vote.question === payload.question) {
          return payload
        }
        return vote
      }))
    }
  }

  function doValidation() {
    // reset errors before starting validation
    const localValidationErrors = []
    if (submittedBy === '') {
      localValidationErrors.push('Name is required')
    }

    let emptyVotes = votes.filter(vote => !vote.response)
    if (votes.length !== questions.length || emptyVotes.length > 0) {
      localValidationErrors.push('Must select an answer for every date')
    }

    setValidationErrors(localValidationErrors)
    return localValidationErrors.length === 0
  }

  function handleSubmit() {
    const isValid = doValidation()
    if (!isValid) {
      setShowInvalidMessage(true)
      return
    }
    setShowInvalidMessage(false)
    setSubmitting(true)

    if (submission !== null) {
      const newSubmission = {
        id: submission.id,
        person: submittedBy,
        poll_id: submission.poll_id
      }
      const updatedResponses = submission.responses.map(r => {
        let newVal = votes.find(v => v.question === r.question_id)
        if (newVal) {
          r.value = newVal.response
        }
        return r
      })

      Submissions.update(newSubmission).then(() => {
        Responses.update(updatedResponses).then(data => {
          newSubmission.responses = data
          console.log('data:', data)
          handleSubmitted(newSubmission)
          setSubmitting(false)
        })
      })
    } else {
      Submissions.create({ person: submittedBy, poll_id: poll.id }).then(data => {
        data.responses = votes.map(vote => ({
          question_id: vote.question,
          value: vote.response,
          submission_id: data.id
        }))
        Responses.create(data.responses).then(() => {
          handleSubmitted(data)
          setSubmitting(false)
        })
      })
    }
  }

  return (
    <div className="my-12 -mx-4 sm:-mx-6 lg:-mx-8">
      <div className="inline-block min-w-full align-middle md:px-6 lg:px-8">
        <div className="md:rounded-lg shadow ring-1 ring-black ring-opacity-5 bg-white p-4 md:p-6 space-y-6 md:space-y-8">
          <h2 className="font-bold text-2xl">{submission !== null ? `Edit your response` : `Add your response`}</h2>
          <div>
            <label htmlFor="submitter-name" className="block text-sm font-medium text-gray-700">Name</label>
            <div className="mt-1">
              <input
                type="text"
                name="name"
                value={submittedBy}
                onChange={e => setSubmittedBy(e.target.value)}
                id="submitter-name"
                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full max-w-lg sm:text-sm border-gray-300 rounded-md"
                placeholder="Mickey Mouse" />
            </div>
          </div>
          {votes.map(vote => {
            return <DateResponse key={vote.question} vote={vote} handleVote={setVote} />
          })}
          {showInvalidMessage &&
            <div className="rounded-md bg-red-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <XCircleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">There were errors with your submission</h3>
                  <div className="mt-2 text-sm text-red-700">
                    <ul role="list" className="list-disc pl-5 space-y-1">
                      {validationErrors.map(msg => {
                        return (<li key={msg}>{msg}</li>)
                      })}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          }
          <footer className="flex justify-end items-center space-x-4 mt-8">
            <button onClick={handleCancel}
              disabled={submitting}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">Cancel</button>
            <button onClick={handleSubmit}
              className={clsx("inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500", submitting ? 'cursor-not-allowed' : 'hover:bg-blue-700')}
              disabled={submitting}
            >{submitting && <Spinner className="text-white h-4 w-4 mr-2" />} {submitting ? 'Submitting' : 'Submit'}</button>
          </footer>
        </div>
      </div>
    </div>
  )
}

export default SubmissionForm

