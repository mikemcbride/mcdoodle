import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import ResetPasswordForm from '../components/ResetPasswordForm'

const resetPasswordSearchSchema = z.object({
  token: z.string().optional(),
});

export const Route = createFileRoute('/reset-password')({
  validateSearch: (search) => resetPasswordSearchSchema.parse(search),
  component: RouteComponent,
})

function RouteComponent() {
  const { token } = Route.useSearch();
  if (!token) {
    return (
      <div className="flex flex-col justify-center py-12 lg:mt-12 px-4 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Reset your password
          </h2>
        </div>
        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="rounded-md bg-red-50 p-4">
            <h3 className="text-sm font-medium text-red-800">Invalid reset link</h3>
            <p className="mt-2 text-sm text-red-700">A token is required to reset your password.</p>
          </div>
        </div>
      </div>
    );
  }
  return <ResetPasswordForm token={token} />
}
