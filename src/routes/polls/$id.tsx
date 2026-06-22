import { useState } from 'react';
import { createFileRoute, Link } from '@tanstack/react-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogPanel, DialogTitle, Description } from '@headlessui/react';
import _orderBy from 'lodash/orderBy';
import RankedResults from '../../components/RankedResults';
import ResponsePill from '../../components/ResponsePill';
import SubmissionForm from '../../components/SubmissionForm';
import Breadcrumbs from '../../components/Breadcrumbs';
import { PencilSquareIcon, ExclamationTriangleIcon } from '@heroicons/react/24/solid';
import Polls from '../../services/polls';
import CopyLinkButton from '../../components/CopyLinkButton';
import { useAuth } from '../../auth';
import { Poll, Submission } from '../../types';

export const Route = createFileRoute('/polls/$id')({
  component: RouteComponent,
})

function RouteComponent() {
  const { id } = Route.useParams();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isAddingSubmission, setIsAddingSubmission] = useState(false);
  const [submissionToEdit, setSubmissionToEdit] = useState<Submission | null>(null);
  const [showAccountPrompt, setShowAccountPrompt] = useState(false);

  // One composed request returns the poll with its questions and submissions
  // (each with their responses). React Query handles caching/refetching.
  const { data: poll, isLoading } = useQuery<Poll | null>({
    queryKey: ['poll', id],
    queryFn: () => Polls.findFull(id),
  });

  const questions = _orderBy(poll?.questions ?? [], 'value');
  const submissions = poll?.submissions ?? [];
  const isClosed = poll?.status === 'closed';
  // poll requires an account and the visitor isn't signed in
  const needsAccount = !!poll?.requiresAccount && !user;
  // SubmissionForm expects questions in display order.
  const pollForForm = poll ? { ...poll, questions } : null;

  function handleFormSubmission() {
    // The mutation already persisted; refetch the composed poll to reflect it.
    queryClient.invalidateQueries({ queryKey: ['poll', id] });
    setSubmissionToEdit(null);
    setIsAddingSubmission(false);
  }

  function handleCancelSubmission() {
    setIsAddingSubmission(false);
    setSubmissionToEdit(null);
  }

  function handleEditSubmission(submission: Submission) {
    // poll requires an account to participate.
    if (needsAccount) {
      setShowAccountPrompt(true);
      return;
    }
    // can't edit responses on a closed poll.
    if (isClosed) {
      return;
    }
    // don't allow editing if we're already editing.
    if (submissionToEdit !== null) {
      return;
    }
    setSubmissionToEdit(submission);
    setIsAddingSubmission(true);
  }

  if (isLoading) {
    return <div>Loading poll details...</div>;
  }

  if (!poll) {
    return <div>Poll not found</div>;
  }

  const crumbs = [
    { name: 'Polls', href: '/', current: false },
    { name: poll.title, href: `/polls/${poll.id}`, current: true },
  ];

  return (
    <section>
      <Dialog open={showAccountPrompt} onClose={setShowAccountPrompt} className="relative z-50">
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-start justify-center p-4 mt-24">
          <DialogPanel className="w-full max-w-md rounded-lg shadow-md bg-white p-6">
            <DialogTitle className="text-2xl font-bold text-gray-900">Create a free account</DialogTitle>
            <Description className="text-base mt-4 text-gray-600">
              This poll requires an account to participate. Create a free account to add your response.
            </Description>
            <footer className="mt-8 flex justify-end gap-3">
              <button
                onClick={() => setShowAccountPrompt(false)}
                type="button"
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <Link
                to="/sign-up"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Create free account
              </Link>
            </footer>
          </DialogPanel>
        </div>
      </Dialog>
      <Breadcrumbs pages={crumbs} />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-3xl font-black text-gray-900">{poll.title}</h2>
          <p className="mt-2 text-lg text-gray-700">{poll.description}</p>
        </div>
        <CopyLinkButton url={`${window.location.origin}/polls/${poll.id}`} />
      </div>

      {isClosed && (
        <div className="mt-4 rounded-md bg-yellow-50 p-4">
          <div className="flex">
            <div className="shrink-0">
              <ExclamationTriangleIcon aria-hidden="true" className="size-5 text-yellow-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-yellow-800">
                This poll is closed and is no longer accepting responses.
              </p>
            </div>
          </div>
        </div>
      )}

      {isAddingSubmission && pollForForm && (
        <SubmissionForm
          poll={pollForForm}
          submission={submissionToEdit}
          handleCancel={handleCancelSubmission}
          handleSubmitted={handleFormSubmission}
        />
      )}

      <div className="flex md:items-center justify-between flex-col-reverse md:flex-row mt-8 mb-4 gap-4">
        <h3 className="text-2xl font-bold">Responses</h3>
        {!isAddingSubmission && !isClosed && (
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 w-full sm:w-auto"
            onClick={() => (needsAccount ? setShowAccountPrompt(true) : setIsAddingSubmission(true))}
          >
            Vote
          </button>
        )}
      </div>
      <div className="flex flex-col">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden shadow-xs outline-1 outline-gray-900/5 md:rounded-xl">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Date</th>
                    {submissions.map(submission => (
                      <th key={`col_${submission.id}`} scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        <button
                          className="inline-flex items-center group"
                          title="Edit response"
                          onClick={() => handleEditSubmission(submission)}
                        >
                          {submission.person} <PencilSquareIcon className="opacity-0 group-hover:opacity-100 h-3 w-3 ml-1 text-gray-500" />
                        </button>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {questions.map((question) => {
                    return (
                      <tr key={question.id}>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">{question.value}</td>
                        {submissions.map(submission => {
                          return (
                            <td key={`row_${submission.id}`} className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                              <ResponsePill questionId={question.id} responses={submission.responses || []} />
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      {submissions.length > 0 && questions.length > 0 && (
        <div className="mt-20">
          <RankedResults questions={questions} submissions={submissions} />
        </div>
      )}
    </section>
  );
}
