import Link from 'next/link';
import { useState, useEffect } from 'react';

import LoginForm from '../components/LoginForm.js';
import NewPollForm from '../components/NewPollForm.js';

export default function NewPoll() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)

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

  return (
    <div>
        <Link href="/" className="mb-8 hover:text-blue-600 inline-block sm:text-lg">Back</Link>
        {isLoggedIn && <NewPollForm />}
        {!isLoggedIn && <LoginForm onLogin={handleLogin} />}
    </div>
  )
}
