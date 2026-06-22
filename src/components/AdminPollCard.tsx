import { useState } from "react";
import clsx from "clsx";
import { Dialog, DialogPanel, DialogTitle, Description } from "@headlessui/react";
import Spinner from "./Spinner.js";
import Polls from "../services/polls.js";

export default function AdminPollCard({
  poll,
  onRemovePoll,
}: {
  poll: any;
  onRemovePoll?: (id: string) => void;
}) {
  const submissions = poll.submissions.length > 0 ? poll.submissions.length : 0;
  const submissionText = submissions === 1 ? "submission" : "submissions";
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [status, setStatus] = useState<"open" | "closed">(poll.status);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  function toggleStatus() {
    const nextStatus = status === "open" ? "closed" : "open";
    setIsUpdatingStatus(true);
    Polls.setStatus(poll.id, nextStatus)
      .then(() => {
        setStatus(nextStatus);
      })
      .catch((e) => {
        console.error("unable to update poll status", e);
      })
      .finally(() => {
        setIsUpdatingStatus(false);
      });
  }

  function deletePoll() {
    setIsDeleting(true);
    Polls.remove(poll.id)
      .then(() => {
        setIsDeleting(true);
        setIsOpen(false);
        if (onRemovePoll) {
          onRemovePoll(poll.id);
        }
      })
      .catch((e) => {
        console.error("unable to remove poll", e);
      });
  }

  return (
    <li className="w-full relative flex items-center justify-between gap-x-6 px-4 py-5 hover:bg-gray-50 sm:px-6">
      <Dialog open={isOpen} onClose={setIsOpen} className="absolute z-50">
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex mt-24 items-start justify-center p-4">
          <DialogPanel className="w-full max-w-md rounded-lg shadow-md bg-white p-6">
            <DialogTitle className="text-2xl font-bold block text-red-600">
              Slow down!
            </DialogTitle>
            <Description className="text-lg mt-4">
              This will delete the poll and all submissions.
            </Description>

            <p className="text-sm mt-6">
              Are you sure you want to delete the poll? The poll and all
              questions and responses will be permanently deleted.
              <span className="text-red-600 font-semibold">
                This action cannot be undone.
              </span>
            </p>

            <footer className="mt-8 flex justify-end space-x-4">
              <button
                onClick={() => setIsOpen(false)}
                type="button"
                className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                onClick={() => deletePoll()}
                disabled={isDeleting}
                type="button"
                className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <Spinner show={isDeleting} className="h-4 w-4 mr-2 inline-block" />
                Delete
              </button>
            </footer>
          </DialogPanel>
        </div>
      </Dialog>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 text-base lg:text-lg">
          <p className="font-medium text-blue-600">{poll.title}</p>
          {status === "closed" && (
            <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">
              Closed
            </span>
          )}
        </div>
        <p className="text-sm lg:text-base text-gray-500">
          {poll.description || ""}
        </p>
      </div>
      <div className="hidden sm:block flex-shrink-0">
        <p className="text-sm text-gray-500">
          {submissions} {submissionText}
        </p>
      </div>
      <div className="flex-shrink-0 flex items-center gap-2">
        <button
          onClick={toggleStatus}
          disabled={isUpdatingStatus}
          type="button"
          className={clsx(
            "inline-flex items-center px-3 py-2 border text-sm leading-4 font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2",
            status === "open"
              ? "border-gray-300 text-gray-700 bg-white hover:bg-gray-50 focus:ring-blue-500"
              : "border-transparent text-white bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500",
            isUpdatingStatus && "opacity-60 cursor-not-allowed",
          )}
        >
          <Spinner show={isUpdatingStatus} className="h-4 w-4 mr-2 inline-block" />
          {status === "open" ? "Close" : "Reopen"}
        </button>
        <button
          onClick={() => setIsOpen(true)}
          type="button"
          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        >
          Delete poll
        </button>
      </div>
    </li>
  );
}
