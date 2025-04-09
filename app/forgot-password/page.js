'use client';

import http from '../../services/http';
import clsx from 'clsx';
import { useState } from 'react';
import LoginError from '../../components/LoginError.js';
import { useAuth } from '../../context/AuthContext.js';
import { CheckCircleIcon } from '@heroicons/react/24/solid';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false)

  const { logout } = useAuth();

  function handleSubmit() {
    if (submitting) return;
    if (!email) {
      setError('Email is required');
      return;
    }

    setError('');
    setSubmitting(true)
    http.post('/api/forgot-password', { email })
      .then(() => {
        setSubmitting(false)
        logout(false); // do logout, but don't redirect to /login page.
        setError('');
        setShowSuccess(true);
      })
      .catch((e) => {
        setSubmitting(false)
        console.error('Error resetting password:', e);
        setError('Error resetting password');
      });
  }
  
  return (
    <div className="flex flex-col justify-center py-12 lg:mt-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Forgot your password?
        </h2>
        <p className="mt-6 text-center text-lg text-gray-700">No problem, it happens to the best of us. Just enter your email address below and we&apos;ll send you a link to reset your password.</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow rounded-lg sm:px-10">
          <form submit="submit" className="space-y-8">
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
                  placeholder="you@probablygmail.com"
                  onChange={e => setEmail(e.target.value)}
                  required=""
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue focus:border-blue sm:text-sm"
                />
              </div>
            </div>
            <div>
              <button
                type="button"
                className={clsx("w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600", submitting && 'bg-opacity-50 cursor-not-allowed')}
                onClick={handleSubmit}
              >
                {submitting ? 'Submitting...' : 'Submit'}
              </button>
            </div>

            <LoginError message={error} />

            {showSuccess && (
              <div className="rounded-md bg-green-50 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <CheckCircleIcon className="h-5 w-5 text-green-400" aria-hidden="true" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-green-800">Request Submitted</h3>
                    <div className="mt-2 text-sm text-green-700">
                      <p>If you have an account with us, you should see an email with a link to reset your password momentarily.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  )
} 