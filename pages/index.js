import Head from 'next/head';
import Link from 'next/link';
import PollList from '../components/PollList';
import { getPolls } from './api/polls';
import { getSubmissions } from './api/submissions';
import { useAuth } from '../context/AuthContext';

export default function Home({ polls }) {
  const { user } = useAuth();
  if (user) {
    console.log('signed in, only show polls created by this user?')
  } else {
    console.log('not logged in, hide all polls?')
  }
  return (
    <div className="min-h-full">
      <Head>
        <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>📊</text></svg>" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>McDoodle</title>
      </Head>

      <div>
        <div className="flex items-center justify-between">
          <h2 className="text-4xl font-black text-gray-900">Polls</h2>
          {user && <Link href="/new-poll" className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">Create Poll</Link>}
        </div>
        <PollList polls={polls} />
      </div>
    </div>
  );
}

export async function getServerSideProps() {
  const [pollData, submissionData] = await Promise.all([
    getPolls(),
    getSubmissions(),
  ]);

  pollData.data.forEach((poll) => {
    poll.submissions = submissionData.data.filter((submission) => submission.poll_id === poll.id);
  })
  return {
    props: { polls: pollData.data },
  };
}
