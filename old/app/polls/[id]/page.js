'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import _orderBy from 'lodash/orderBy';
import RankedResults from '../../../components/RankedResults';
import ResponsePill from '../../../components/ResponsePill';
import SubmissionForm from '../../../components/SubmissionForm';
import Breadcrumbs from '../../../components/Breadcrumbs';
import { PencilSquareIcon } from '@heroicons/react/24/solid';
import Polls from '../../../services/polls';
import Submissions from '../../../services/submissions';
import Questions from '../../../services/questions';
import Responses from '../../../services/responses';

export default function PollDetail() {
  const [poll, setPoll] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [isAddingSubmission, setIsAddingSubmission] = useState(false);
  const [submissionToEdit, setSubmissionToEdit] = useState(null);
  const [loading, setLoading] = useState(true);
  const params = useParams();
  const [crumbs, setCrumbs] = useState([])

  useEffect(() => {
    async function fetchData() {
      try {
        // poll has questions embedded,
        // submissions have responses embedded.
        const [pollData, submissionData, questionData, responseData] =
          await Promise.all([
            Polls.findById(params.id, true), // true to bust cache
            Submissions.find({ poll_id: params.id }),
            Questions.find({ poll_id: params.id }),
            Responses.find({ poll_id: params.id }),
          ]);

        if (!pollData) {
          setLoading(false);
          return;
        }

        pollData.questions = _orderBy(questionData, 'value');
        submissionData.forEach(submission => {
          submission.responses = responseData.filter(response => response.submission_id === submission.id);
        });

        setPoll(pollData);
        setSubmissions(submissionData);
        setCrumbs([
          { name: 'Polls', href: '/', current: false },
          { name: pollData.title, href: `/polls/${pollData.id}`, current: true },
        ])
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [params.id]);

  function handleFormSubmission(data) {
    // check if local submissions includes the id.
    // if so, replace it. otherwise, add it.
    if (submissionToEdit !== null) {
      setSubmissions(submissions.map(s => {
        if (s.id === data.id) {
          return data
        } else {
          return s
        }
      }))
      setSubmissionToEdit(null);
    } else {
      setSubmissions([...submissions, data]);
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

  if (loading) {
    return <div>Loading poll details...</div>;
  }

  if (!poll) {
    return <div>Poll not found</div>;
  }

  return (
    <section>
      <Breadcrumbs pages={crumbs} />
      <h2 className="text-3xl font-black text-gray-900">{poll.title}</h2>
      <p className="mt-2 text-lg text-gray-700">{poll.description}</p>

      {isAddingSubmission && (
        <SubmissionForm poll={poll} submission={submissionToEdit} handleCancel={handleCancelSubmission} handleSubmitted={handleFormSubmission} />
      )}

      <div className="flex md:items-center justify-between flex-col-reverse md:flex-row mt-8 mb-4 gap-4">
        <h3 className="text-2xl font-bold">Responses</h3>
        {!isAddingSubmission && (
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 w-full sm:w-auto"
            onClick={() => setIsAddingSubmission(true)}
          >Vote</button>
        )}
      </div>
      <div className="flex flex-col">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Date</th>
                    {submissions.map(submission => (
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
                        {submissions.map(submission => {
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
          </div>
        </div>
      </div>
      {submissions.length > 0 && poll.questions.length > 0 && (
        <div className="mt-20">
          <RankedResults questions={poll.questions} submissions={submissions} />
        </div>
      )}
    </section>
  );
} 
