import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import PollList from "../components/PollList";
import Polls from "../services/polls";
import Submissions from "../services/submissions";

import { Poll, Submission } from "../types";

export const Route = createFileRoute("/_auth/admin")({
  component: Admin,
});

// TODO: add types for all data types
function Admin() {
  const [localPolls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([Polls.list(), Submissions.find()]).then(
      ([polls, submissions]) => {
        setPolls(
          polls.map((poll: Poll) => {
            poll.submissions = submissions.filter(
              (submission: Submission) => submission.poll_id === poll.id,
            );
            return poll;
          }),
        );
        setLoading(false);
      },
    );
  }, []);

  function handleRemove(pollId: string) {
    setPolls(localPolls.filter((p: Poll) => p.id !== pollId));
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="text-4xl font-black text-gray-900">Polls</h2>
        <Link
          to="/new-poll"
          className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Create Poll
        </Link>
      </div>
      {!loading && (
        <PollList
          polls={localPolls}
          isAdmin={true}
          onRemovePoll={handleRemove}
        />
      )}
    </div>
  );
}
