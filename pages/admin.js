import { useState, useEffect } from 'react'
import Link from 'next/link';
import PollList from '../components/PollList.js';
import Polls from '../services/polls';
import Submission from '../services/submissions';

export default function Admin() {
  const [localPolls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      Polls.list(),
      Submission.find(),
    ]).then(([polls, submissions]) => {
      setPolls(polls.map((poll) => {
        poll.submissions = submissions.filter((submission) => submission.poll_id === poll.id);
        return poll;
      }));
      setLoading(false);
    });
  }, []);

  function handleRemove(pollId) {
    setPolls(localPolls.filter(p => p.id !== pollId))
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="text-4xl font-black text-gray-900">Polls</h2>
        <Link href="/new-poll" className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">Create Poll</Link>
      </div>
      {!loading && (<PollList
        polls={localPolls}
        isAdmin={true}
        onRemovePoll={handleRemove}
      />)}
    </div>
  )
}
