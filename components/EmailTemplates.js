import * as React from 'react';

// TODO: this will send a verification email to the user.
// the page we send them to will POST to our API to update the user to be verified.
// we should prevent login until the user is verified.
export const VerifyEmailTemplate = ({ firstName }) => {
  return (
    <div>
      <h1>Welcome, {firstName}!</h1>
    </div>
  )
}

export const ForgotPasswordTemplate = ({ token }) => {
  return (
    <div>
      <h1>Password Reset Request</h1>
      <p>To reset your password, please click the link below:</p>
      <br />
      <p><a href={`${process.env.NEXT_PUBLIC_BASE_URL}/reset-password?token=${token}`}>Reset Password</a></p>
    </div>
  )
}
