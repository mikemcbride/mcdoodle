import { useState } from 'react';
import clsx from 'clsx';
import { useAuth } from '../context/AuthContext.js'
import Users from '../services/users.js';
import LoginError from '../components/LoginError.js';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [email, setEmail] = useState(user?.email)
  const [firstName, setFirstName] = useState(user?.firstName)
  const [lastName, setLastName] = useState(user?.lastName)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  function canSubmit() {
    return firstName && lastName && email && !submitting;
  }

  function handleSubmit() {
    if (!canSubmit()) return

    setShowSuccess(false)
    setSubmitting(true)

    const payload = {
      email,
      firstName,
      lastName,
    }

    if (password && password === confirmPassword) {
      payload.password = password;
    }

    Users.update(user.id, payload).then(val => {
      setSubmitting(false)
      setShowSuccess(true)
      setErrorMessage('')
      updateUser(val)
    }).catch(e => {
      setShowSuccess(false)
      setErrorMessage('Error updating profile')
    })
  }

  return (
    <div className="flex flex-col justify-center py-12 lg:mt-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
          Profile
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
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
                  required=""
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
                  required=""
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
                  required=""
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue focus:border-blue sm:text-sm"
                />
              </div>
            </div>

            <hr />
            <p className="text-gray-600 text-sm">If you want to change your password, you can do so here. If you leave the fields blank, we will leave it as-is.</p>
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
                  placeholder="Password"
                  required=""
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
                  placeholder="Password"
                  required=""
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue focus:border-blue sm:text-sm"
                />
              </div>
            </div>

            <div>
              <button
                type="button"
                disabled={!canSubmit()}
                className={clsx("w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600", !canSubmit() && 'bg-opacity-50 cursor-not-allowed')}
                onClick={handleSubmit}
              >
                Update Profile
              </button>
            </div>
            <LoginError message={errorMessage} />
            {showSuccess && (
              <div className="rounded-md bg-emerald-100 p-4">
                <h3 className="text-sm font-medium text-emerald-800">Profile successfully updated</h3>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  )
}

