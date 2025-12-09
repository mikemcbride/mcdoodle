import { createFileRoute } from '@tanstack/react-router'
import SignUpForm from '../components/SignUpForm'

export const Route = createFileRoute('/sign-up')({
  component: RouteComponent,
})

function RouteComponent() {
  return <SignUpForm />
}
