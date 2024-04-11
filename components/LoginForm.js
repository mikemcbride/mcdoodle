import { useState } from 'react';
import clsx from 'clsx';
import Users from '../services/users.js';
import LoginError from './LoginError.js';
import Link from 'next/link.js';

export default function LoginForm({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  function canSubmit() {
    return email && password && !submitting;
  }
  function handleLogin(val) {
    onLogin(val)
  }

  function doLogin(e) {
    e.preventDefault()
    if (!email || !password) {
      setErrorMessage("Please fill in all fields")
      return;
    }
    setSubmitting(true)
    Users.login({ email, password }).then(user => {
      setSubmitting(false)
      if (user) {
        handleLogin(user)
      } else {
        setErrorMessage("Invalid credentials");
      }
    }).catch(e => {
      setSubmitting(false);
      console.error("Error logging in:", e);
      setErrorMessage(e.response.data.message);
    })
  }

  return (
    <div className="flex flex-col justify-center py-12 lg:mt-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Sign in to your account
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow rounded-lg sm:px-10">
          <form className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Username or email
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="text"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@gmail.com"
                  required=""
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue focus:border-blue sm:text-sm"
                />
              </div>
            </div>

            <div className="mt-4">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <Link href="/forgot-password" tabIndex="-1" className="text-sm text-blue-500 hover:underline">Forgot password?</Link>
              </div>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Password"
                  required=""
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue focus:border-blue sm:text-sm"
                />
              </div>
            </div>

            <LoginError message={errorMessage} />

            <div>
              <button
                type="button"
                disabled={!canSubmit()}
                className={clsx("w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600", !canSubmit() && 'bg-opacity-50 cursor-not-allowed')}
                onClick={doLogin}
              >
                Login
              </button>
            </div>
            <p className="text-center text-sm text-gray-500">
              Not a member?{' '}
              <Link href="/sign-up" className="font-semibold leading-6 text-blue-600 hover:text-blue-500">
                Sign up for a free account
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}

