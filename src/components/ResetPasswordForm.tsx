import { useEffect, useState } from 'react';
import clsx from 'clsx';
import { Link } from '@tanstack/react-router';
import http from '../services/http';
import { useAuth } from '../auth';
import LoginError from './LoginError';
import { CheckCircleIcon } from '@heroicons/react/24/solid';

type ResetPasswordFormProps = {
  token: string;
};

export default function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const [verification, setVerification] = useState<any>(null);
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  const { logout } = useAuth();

  // Fetch verification data
  useEffect(() => {
    if (!token) {
      setError('Invalid token');
      setLoading(false);
      return;
    }

    http.get(`/verifications?id=${token}`)
      .then(({ data }) => {
        if (data.msg === 'Not found') {
          setError('Not found');
        } else {
          setVerification(data);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching verification:', err);
        setError('Error fetching verification');
        setLoading(false);
      });
  }, [token]);

  // Check verification status when data is loaded
  useEffect(() => {
    if (!verification || loading) return;
    
    if (verification.status !== 'active') {
      setError(`Verification token is expired with status: ${verification.status}`);
    }
  }, [verification, loading]);

  function handleSubmit() {
    if (submitting) return;
    if (!verification) {
      setError('Verification data not found');
      return;
    }
    if (verification.status !== 'active') {
      setError(`Verification token is expired with status: ${verification.status}`);
      return;
    }
    if (password !== passwordConfirmation) {
      setError('Passwords do not match');
      return;
    }
    const payload = {
      token: verification.id,
      email: verification.email,
      password: password
    };

    setSubmitting(true);
    http.post('/change-password', payload)
      .then(() => {
        setSubmitting(false);
        logout();
        setError('');
        setShowSuccess(true);
      })
      .catch((e) => {
        setSubmitting(false);
        console.error('Error resetting password:', e);
        setError(e?.response?.data?.message || 'Error resetting password');
      });
  }

  if (loading) {
    return (
      <div className="flex flex-col justify-center py-12 lg:mt-12 px-4 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Reset your password
          </h2>
        </div>
        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="rounded-md bg-blue-100 p-4">
            <h3 className="text-sm font-medium text-blue-800">Loading verification details...</h3>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col justify-center py-12 lg:mt-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Reset your password
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow rounded-lg sm:px-10">
          <form className="space-y-8">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="text"
                  value={verification?.email || ''}
                  placeholder=""
                  required
                  disabled
                  className="appearance-none cursor-not-allowed text-gray-500 bg-gray-50 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue focus:border-blue sm:text-sm"
                />
              </div>
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                New password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Password"
                  required
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue focus:border-blue sm:text-sm"
                />
              </div>
            </div>

            <div className="mt-4">
              <label htmlFor="password-confirmation" className="block text-sm font-medium text-gray-700">
                Confirm password
              </label>
              <div className="mt-1">
                <input
                  id="password-confirmation"
                  name="password-confirmation"
                  type="password"
                  value={passwordConfirmation}
                  onChange={e => setPasswordConfirmation(e.target.value)}
                  placeholder="Password confirmation"
                  required
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue focus:border-blue sm:text-sm"
                />
              </div>
            </div>

            <div>
              <button
                type="button"
                className={clsx(
                  "w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600",
                  submitting && 'bg-opacity-50 cursor-not-allowed'
                )}
                onClick={handleSubmit}
                disabled={submitting}
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
                    <h3 className="text-sm font-medium text-green-800">Success</h3>
                    <div className="mt-2 text-sm text-green-700">
                      <p>Your password has been successfully updated. Please login to continue.</p>
                    </div>
                    <div className="mt-4">
                      <div className="-mx-2 -my-1.5 flex">
                        <Link
                          to="/login"
                          className="rounded-md bg-green-50 px-2 py-1.5 text-sm font-medium text-green-800 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2 focus:ring-offset-green-50"
                        >
                          Go to login&nbsp;<span aria-hidden="true"> &rarr;</span>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}

