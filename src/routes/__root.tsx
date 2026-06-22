import { HeadContent, Scripts, createRootRoute } from '@tanstack/react-router'
import type { ReactNode } from 'react'
import AppHeader from '../components/AppHeader'
import { AuthProvider } from '../auth'
import { fetchCurrentUserServerFn } from '../server/auth'
import type { AuthUser } from '../types'

import appCss from '../index.css?url'

export const Route = createRootRoute({
  // Resolve the logged-in user from the session cookie during SSR so the first
  // paint reflects the real auth state (no logged-out flash).
  loader: async () => {
    const u = await fetchCurrentUserServerFn()
    const user: AuthUser | null = u
      ? {
          id: u.id,
          isAdmin: u.isAdmin,
          email: u.email,
          firstName: u.firstName ?? undefined,
          lastName: u.lastName ?? undefined,
        }
      : null
    return { user }
  },
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'McDoodle' },
    ],
    links: [{ rel: 'stylesheet', href: appCss }],
  }),
  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: ReactNode }) {
  const { user } = Route.useLoaderData()

  return (
    <html lang="en" className="h-full bg-gray-100">
      <head>
        <HeadContent />
      </head>
      <body className="h-full font-sans">
        <AuthProvider initialUser={user}>
          <div className="min-h-screen flex flex-col">
            <AppHeader />
            <div className="w-full max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex-grow">
              {children}
            </div>
          </div>
        </AuthProvider>
        <Scripts />
      </body>
    </html>
  )
}
