import { Dialog, DialogPanel, DialogTitle, DialogBackdrop } from '@headlessui/react';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext.js';
import Users from '../services/users.js';
import LoginError from './LoginError.js';
import Link from 'next/link';

export default function ChangePasswordForm() {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const { user, updateUser } = useAuth();

  function closeDialog() {
    setIsOpen(false)
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
    setErrorMessage('')
    setShowSuccess(false)
    setSubmitting(false)
  }

  function handleSubmit() {
    setErrorMessage('')
    setShowSuccess(false)
    setSubmitting(true)

    if (!currentPassword || !newPassword || !confirmPassword) {
      setSubmitting(false)
      setShowSuccess(false)
      setErrorMessage('All fields are required')
      return
    }

    if (newPassword && newPassword !== confirmPassword) {
      setSubmitting(false)
      setShowSuccess(false)
      setErrorMessage('Passwords do not match')
      return
    }

    if (currentPassword && newPassword && newPassword === confirmPassword) {
      Users.update(user.id, { currentPassword, newPassword }).then(val => {
        setSubmitting(false)
        setShowSuccess(true)
        setErrorMessage('')
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
        updateUser(val)
        setTimeout(() => {
          closeDialog()
        }, 2000)
      }).catch((e) => {
        console.error(e)
        const errMsg = e?.response?.data?.msg || 'Error updating password'
        setShowSuccess(false)
        setErrorMessage(errMsg)
      })
    }
  }
  return (
    <>
      <button type="button" onClick={() => setIsOpen(true)} className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">Change Password</button>
      <Dialog open={isOpen} onClose={() => setIsOpen(false)} className="relative z-50">
        <DialogBackdrop className="fixed inset-0 bg-black/30" />
        <div className="fixed inset-0 flex w-screen items-center justify-center p-4">
          <DialogPanel className="w-full max-w-xl space-y-4 bg-white p-12 rounded-lg shadow-lg">
            <DialogTitle className="font-bold text-4xl text-center mb-12">Change Password</DialogTitle>
            <div>
              <label htmlFor="current-password" className="block text-sm font-medium text-gray-700">
                Current Password
              </label>
              <div className="mt-1">
                <input
                  id="current-password"
                  name="current-password"
                  type="password"
                  value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                  required=""
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue focus:border-blue sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                New Password
              </label>
              <div className="mt-1">
                <input
                  id="new-password"
                  name="new-password"
                  type="password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  required=""
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue focus:border-blue sm:text-sm"
                />
              </div>
            </div>

            <div>
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
                  required=""
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue focus:border-blue sm:text-sm"
                />
              </div>
            </div>

            {!showSuccess && (
              <div className="flex items-center justify-end gap-3">
                <Link href="/forgot-password" className="text-sm font-medium mr-auto text-blue-600 hover:text-blue-500">Forgot Password?</Link>
                <button
                  type="button"
                  disabled={submitting}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  onClick={() => closeDialog()}
                >Cancel</button>
                <button
                  type="button"
                  disabled={submitting}
                  className="inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  onClick={() => handleSubmit()}
                >
                  Submit
                </button>
              </div>
            )}
            <LoginError message={errorMessage} />
            {showSuccess && (
              <div className="rounded-md bg-emerald-100 p-4">
                <h3 className="text-sm font-medium text-emerald-800">Password updated successfully</h3>
              </div>
            )}
          </DialogPanel>
        </div>
      </Dialog>
    </>
  )
}
