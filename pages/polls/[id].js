import prisma from '../../lib/prisma';
import Link from 'next/link';
import { useState } from 'react';
import _orderBy from 'lodash/orderBy';
import RankedResults from '../../components/RankedResults';
import ResponsePill from '../../components/ResponsePill';
import SubmissionForm from '../../components/SubmissionForm';

const PollDetail = ({ poll, submissions }) => {
  const [isAddingSubmission, setIsAddingSubmission] = useState(false);
  const [localSubmissions, setLocalSubmissions] = useState(submissions);

  function handleFormSubmission(data) {
    console.log('data from submission:', data);
    setLocalSubmissions([...localSubmissions, data]);
    setIsAddingSubmission(false);
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
      <SubmissionForm poll={poll} handleCancel={() => setIsAddingSubmission(false)} handleSubmitted={handleFormSubmission} />
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
                      <th key={`col_${submission.id}`} scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">{submission.person}</th>
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
    </section >
  )
}

export default PollDetail

export async function getServerSideProps({ params }) {
  const [poll, submissions] = await Promise.all([
    prisma.poll.findUnique({
      where: {
        id: parseInt(params.id, 10)
      },
      include: {
        questions: true,
      },
    }),
    prisma.submission.findMany({
      where: {
        poll_id: parseInt(params.id, 10)
      },
      include: {
        responses: true
      }
    })
  ]);

  const sortedQuestions = _orderBy(poll.questions, 'value');
  poll.questions = sortedQuestions;

  return {
    props: { poll, submissions },
  };
}