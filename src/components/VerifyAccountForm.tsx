import { useEffect, useState } from 'react';
import { Link } from '@tanstack/react-router';
import http from '../services/http';
import LoginError from './LoginError';
import { CheckCircleIcon } from '@heroicons/react/24/solid';

type VerifyAccountFormProps = {
  token: string;
  email: string;
  action?: string;
};

export default function VerifyAccountForm({ token, email, action }: VerifyAccountFormProps) {
  const [verification, setVerification] = useState<any>(null);
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(true);
  const [loading, setLoading] = useState(true);

  // First fetch verification details
  useEffect(() => {
    if (!token) {
      setError('Invalid token');
      setSubmitting(false);
      setLoading(false);
      return;
    }

    // Fetch verification data
    http.get(`/verifications?id=${token}`)
      .then(({ data }) => {
        if (data.msg === 'Not found') {
          setError('Not found');
          setSubmitting(false);
        } else if (data.email !== email) {
          setError('Invalid token');
          setSubmitting(false);
        } else {
          setVerification(data);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching verification:', err);
        setError('Error fetching verification');
        setSubmitting(false);
        setLoading(false);
      });
  }, [token, email]);

  // Process verification when verification data is loaded
  useEffect(() => {
    if (!verification || loading) return;
    
    if (verification.status !== 'active') {
      setError(`Verification token is inactive with status: ${verification.status}`);
      setSubmitting(false);
      return;
    }

    const payload = {
      token: verification.id,
      email: email,
      action: action || 'verify'
    };

    http.post('/verify-email', payload)
      .then(() => {
        setSubmitting(false);
        setError('');
        setShowSuccess(true);
      })
      .catch((e) => {
        setSubmitting(false);
        console.error('Error processing verification', e);
        setError(e?.response?.data?.error || 'Error processing verification');
      });
  }, [verification, loading, email, action]);

  if (loading) {
    return (
      <div className="flex flex-col justify-center py-12 lg:mt-12 px-4 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Verify Account
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
          Verify Account
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <LoginError message={error} />
        {submitting && (
          <div className="rounded-md bg-blue-100 p-4">
            <h3 className="text-sm font-medium text-blue-800">Processing verification...</h3>
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
                  <p>Your account verification was successfully processed. Please login to continue.</p>
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
      </div>
    </div>
  );
}

