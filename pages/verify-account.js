import { getVerification } from "./api/verifications";
import Link from "next/link";
import http from '../services/http';
import { useEffect, useState } from 'react';
import LoginError from '../components/LoginError.js';

export default function VerifyAccount({ verification, email, action }) {
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(true);

  useEffect(() => {
    if (verification.msg) {
      setError(verification.msg);
      setSubmitting(false);
      return;
    } else if (verification.status !== 'active') {
      setError(`Verification token is inactive with status: ${verification.status}`);
      setSubmitting(false);
      return;
    }

    const payload = {
      token: verification.id,
      email: email,
      action: action
    }

    http.post('/verify-email', payload)
      .then(() => {
        setSubmitting(false)
        setError('');
        setShowSuccess(true);
      })
      .catch((e) => {
        setSubmitting(false)
        console.error('Error processing verification', e);
        setError('Error processing verification');
      });
  }, []);

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
          <div className="rounded-md bg-emerald-100 p-4">
            <h3 className="text-sm font-medium text-emerald-800">Your account verification was successfully processed! Please login to continue. <Link href="/login" className="underline">Go to login.</Link></h3>
          </div>
        )}
      </div>
    </div>
  )
}

// get token from url and check if it is valid.
export async function getServerSideProps({ query }) {
  if (!query.token) {
    return {
      props: { verification: { msg: 'Invalid token' } }
    };
  }

  const { status, data } = await getVerification(query.token)
  if (status !== 200) {
    return {
      props: { verification: { msg: 'Not found' } }
    };
  }

  if (data.email !== query.email) {
    return {
      props: { verification: { msg: 'Invalid token' } }
    };
  }

  return {
    props: { verification: data, action: query.action, email: query.email }
  };
}

