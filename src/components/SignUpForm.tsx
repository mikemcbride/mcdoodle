import { useState } from 'react';
import clsx from 'clsx';
import User from '../services/users';
import LoginError from './LoginError';
import { Link } from '@tanstack/react-router';
import { CheckCircleIcon } from '@heroicons/react/24/solid';

export default function SignUpForm() {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false);

  function canSubmit() {
    return firstName && lastName && email && password && confirmPassword && (password === confirmPassword) && !submitting;
  }

  // TODO: change this to be the sign up flow
  // 1. check for required fields
  // 2. check for password match
  // 3. call the sign up endpoint
  // 4. handle the response - if successful, tell them to look for verification email to complete registration
  // 5. if unsuccessful, show an error message
  function doSignup() {
    if (!canSubmit()) {
      if (password !== confirmPassword) {
        setErrorMessage("Passwords do not match")
        return;
      }
      setErrorMessage("Please fill in all fields")
      return;
    }
    setSubmitting(true)
    User.register({ firstName, lastName, email, password }).then(user => {
      setSubmitting(false)
      if (user) {
        setShowSuccess(true)
        setErrorMessage('')
      } else {
        setErrorMessage("Error processing registration request.");
      }
    }).catch(e => {
      setSubmitting(false);
      console.error("Error registering:", e);
      setErrorMessage(e?.response?.data?.msg || "Error processing registration request.");
    })
  }

  return (
    <div className="flex flex-col justify-center py-12 lg:mt-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Sign Up
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        {!showSuccess && (
          <div className="bg-white py-8 px-4 shadow rounded-lg sm:px-10">
            <form className="space-y-6">
              <div>
                <label htmlFor="first_name" className="block text-sm font-medium text-gray-700">
                  First Name
                </label>
                <div className="mt-1">
                  <input
                    id="first_name"
                    name="first_name"
                    type="text"
                    value={firstName}
                    onChange={e => setFirstName(e.target.value)}
                    placeholder="What your mom calls you"
                    required={true}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue focus:border-blue sm:text-sm"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="last_name" className="block text-sm font-medium text-gray-700">
                  Last Name
                </label>
                <div className="mt-1">
                  <input
                    id="last_name"
                    name="last_name"
                    type="text"
                    value={lastName}
                    onChange={e => setLastName(e.target.value)}
                    placeholder="What your coach calls you"
                    required={true}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue focus:border-blue sm:text-sm"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <div className="mt-1">
                  <input
                    id="email"
                    name="email"
                    type="text"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@gmail.com"
                    required={true}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue focus:border-blue sm:text-sm"
                  />
                </div>
              </div>

              <div className="mt-4">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="mt-1">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Keep it secret"
                    required={true}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue focus:border-blue sm:text-sm"
                  />
                </div>
              </div>

              <div className="mt-4">
                <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700">
                  Confirm Password
                </label>
                <div className="mt-1">
                  <input
                    id="confirm-password"
                    name="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="Keep it safe"
                    required={true}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue focus:border-blue sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <button
                  type="button"
                  disabled={!canSubmit()}
                  className={clsx("w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600", !canSubmit() && 'bg-opacity-50 cursor-not-allowed')}
                  onClick={doSignup}
                >
                  Sign Up
                </button>
              </div>
              <p className="text-center text-sm text-gray-500">
                Already a member?{' '}
                <Link to="/login" className="font-semibold leading-6 text-blue-600 hover:text-blue-500">
                  Sign in here
                </Link>
              </p>

              <LoginError message={errorMessage} />
            </form>
          </div>
        )}
        {showSuccess && (
          <div className="rounded-md bg-green-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <CheckCircleIcon className="h-5 w-5 text-green-400" aria-hidden="true" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">Success</h3>
                <div className="mt-2 text-sm text-green-700">
                  <p>Your account was created! We have sent you an email to verify your account. Please check your email to continue.</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}


