import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/verify-account')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/verify-account"!</div>
}
