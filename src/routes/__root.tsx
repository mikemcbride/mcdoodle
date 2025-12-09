import { Outlet, createRootRoute } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import AppHeader from '../components/AppHeader'

export const Route = createRootRoute({
  component: RootComponent,
})

function RootComponent() {
  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader />
      <div className="w-full max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex-grow">
        <Outlet />
      </div>
      <TanStackRouterDevtools position="bottom-right" initialIsOpen={false} />
    </div>
  )
}
