import { HeadContent, Scripts, createRootRoute } from '@tanstack/react-router'
import type { ReactNode } from 'react'
import AppHeader from '../components/AppHeader'

import appCss from '../index.css?url'

export const Route = createRootRoute({
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
  return (
    <html lang="en" className="h-full bg-gray-100">
      <head>
        <HeadContent />
      </head>
      <body className="h-full font-sans">
        <div className="min-h-screen flex flex-col">
          <AppHeader />
          <div className="w-full max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex-grow">
            {children}
          </div>
        </div>
        <Scripts />
      </body>
    </html>
  )
}
