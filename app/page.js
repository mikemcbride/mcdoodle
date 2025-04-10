// This is a Client Component that uses the 'use client' directive
'use client';

import React from 'react';
import Link from 'next/link';
import PollList from '../components/PollList';
import { useAuth } from '../context/AuthContext';
import Polls from '../services/polls';
import Submissions from '../services/submissions';

export default function Home() {
  const { user } = useAuth();
  
  // Use React's useEffect or SWR to fetch data client-side
  // This replaces getServerSideProps which isn't available in App Router
  const [polls, setPolls] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  
  React.useEffect(() => {
    async function fetchData() {
      try {
        const [pollsData, submissionsData] = await Promise.all([
          Polls.list(),
          Submissions.find(),
        ]);
        
        // Enhance polls with submission data
        pollsData.forEach((poll) => {
          poll.submissions = submissionsData.filter((submission) => submission.poll_id === poll.id);
        });
        
        setPolls(pollsData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, []);

  return (
    <div className="min-h-full">
      <div>
        <div className="flex items-center justify-between">
          <h2 className="text-4xl font-black text-gray-900">Polls</h2>
          {user && <Link href="/new-poll" className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">Create Poll</Link>}
        </div>
        {loading ? (
          <p>Loading polls...</p>
        ) : (
          <PollList polls={polls} />
        )}
      </div>
    </div>
  );
} 
