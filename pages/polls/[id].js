import Link from 'next/link';
import { useState } from 'react';
import _orderBy from 'lodash/orderBy';
import RankedResults from '../../components/RankedResults';
import ResponsePill from '../../components/ResponsePill';
import SubmissionForm from '../../components/SubmissionForm';
import PencilSquareIcon from '@heroicons/react/24/solid/PencilSquareIcon.js';
import { getPolls } from '../api/polls';
import { getSubmissions } from '../api/submissions';
import { getQuestions } from '../api/questions';
import { getResponses } from '../api/responses';

const PollDetail = ({ poll, submissions}) => {
  const [isAddingSubmission, setIsAddingSubmission] = useState(false);
  const [localSubmissions, setLocalSubmissions] = useState(submissions);
  const [submissionToEdit, setSubmissionToEdit] = useState(null);

  function handleFormSubmission(data) {
    // check if local submissions includes the id.
    // if so, replace it. otherwise, add it.
    if (submissionToEdit !== null) {
      setLocalSubmissions(localSubmissions.map(s => {
        if (s.id === data.id) {
          return data
        } else {
          return s
        }
      }))
      setSubmissionToEdit(null);
    } else {
      setLocalSubmissions([...localSubmissions, data]);
    }
    setIsAddingSubmission(false);
  }

  function handleCancelSubmission() {
    setIsAddingSubmission(false);
    setSubmissionToEdit(null);
  }

  function handleEditSubmission(submission) {
    // don't allow editing if we're already editing.
    if (submissionToEdit !== null) {
      return
    }
    setSubmissionToEdit(submission);
    setIsAddingSubmission(true);
  }

  return (
    <section>
      <Link href="/" className="mb-8 hover:text-blue-600 inline-block sm:text-lg">Back</Link>
      <div>
        <h2 className="text-4xl font-black text-gray-900">{poll.title}</h2>
        <p className="mt-2 text-lg text-gray-700">{poll.description}</p>
      </div>
      {!isAddingSubmission && (
        <div className="mt-6">
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 w-full sm:w-auto"
            onClick={() => setIsAddingSubmission(true)}
          >Vote</button>
        </div>
      )}

      {isAddingSubmission && (
        <SubmissionForm poll={poll} submission={submissionToEdit} handleCancel={handleCancelSubmission} handleSubmitted={handleFormSubmission} />
      )}

      <h3 className="mt-8 mb-4 text-2xl font-bold">Responses</h3>
      <div className="flex flex-col">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Date</th>
                    {localSubmissions.map(submission => (
                      <th key={`col_${submission.id}`} scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        <button className="inline-flex items-center group" title="Edit response" onClick={() => handleEditSubmission(submission)}>{submission.person} <PencilSquareIcon className="opacity-0 group-hover:opacity-100 h-3 w-3 ml-1 text-gray-500" /></button>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {poll.questions.map((question) => {
                    return (
                      <tr key={question.id}>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">{question.value}</td>
                        {localSubmissions.map(submission => {
                          return (<td key={`row_${submission.id}`} className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            <ResponsePill questionId={question.id} responses={submission.responses} />
                          </td>)
                        })}
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div >
        </div >
      </div >
      {localSubmissions.length > 0 && poll.questions.length > 0 && (
        <div className="mt-20">
          <RankedResults questions={poll.questions} submissions={localSubmissions} />
        </div>
      )}
    </section>
  )
}

export default PollDetail

export async function getServerSideProps({ params }) {
  // poll has questions embedded,
  // submissions have responses embedded.
  const [{ data: pollData }, { data: submissionData }, { data: questionData }, { data: responseData }] = await Promise.all([
    getPolls({ id: params.id }),
    getSubmissions({ poll_id: params.id }),
    getQuestions({ poll_id: params.id }),
    getResponses({ poll_id: params.id }),
  ]);

  pollData.questions = _orderBy(questionData, 'value');
  submissionData.forEach(submission => {
    submission.responses = responseData.filter(response => response.submission_id === submission.id);
  });
  return {
    props: { poll: pollData, submissions: submissionData },
  };
}

