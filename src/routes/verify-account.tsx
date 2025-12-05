import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import VerifyAccountForm from '../components/VerifyAccountForm'

const verifyAccountSearchSchema = z.object({
  token: z.string().optional(),
  email: z.string().optional(),
  action: z.string().optional(),
});

export const Route = createFileRoute('/verify-account')({
  validateSearch: (search) => verifyAccountSearchSchema.parse(search),
  component: RouteComponent,
})

function RouteComponent() {
  const { token, email, action } = Route.useSearch();
  if (!token || !email) {
    return (
      <div className="flex flex-col justify-center py-12 lg:mt-12 px-4 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Verify Account
          </h2>
        </div>
        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="rounded-md bg-red-50 p-4">
            <h3 className="text-sm font-medium text-red-800">Invalid verification link</h3>
            <p className="mt-2 text-sm text-red-700">Token and email are required for verification.</p>
          </div>
        </div>
      </div>
    );
  }
  return <VerifyAccountForm token={token} email={email} action={action} />
}
