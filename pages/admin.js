import { useState, useEffect } from 'react'
import Link from 'next/link';
import PollList from '../components/PollList.js';
import LoginForm from '../components/LoginForm.js';
import prisma from '../lib/prisma';

export default function Admin({ polls }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [localPolls, setPolls] = useState(polls)

  // initial check to see if user is logged in.
  useEffect(() => {
    let LS_USER_ID = window.localStorage.getItem('mcdoodle.userId')
    let LS_API_KEY = window.localStorage.getItem('mcdoodle.apiKey')

    // user is logged in if there is a userId and apiKey in local storage
    if (LS_USER_ID !== null && LS_API_KEY !== null) {
      setIsLoggedIn(true)
    }
  }, [])

  function handleLogin(val) {
    setIsLoggedIn(val)
  }

  function handleRemove(pollId) {
    setPolls(localPolls.filter(p => p.id !== pollId))
  }

  return (
    <>
      {isLoggedIn && (
        <div>
          <div className="flex items-center justify-between">
            <h2 className="text-4xl font-black text-gray-900">Polls</h2>
            <Link href="/new-poll" className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">Create Poll</Link>
          </div>
          <PollList
            polls={localPolls}
            isAdmin={true}
            onRemovePoll={handleRemove}
          />
        </div>
      )}
      {!isLoggedIn && <LoginForm onLogin={handleLogin} />}
    </>
  )
}

export async function getServerSideProps({ query }) {
  let status = query.status || 'open'

  const polls = await prisma.poll.findMany({
    where: {
      status: status
    },
    include: {
      submissions: true,
    },
  });

  return {
    props: { polls },
  };
}
