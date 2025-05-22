import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/polls/$id')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/polls/$id"!</div>
}
