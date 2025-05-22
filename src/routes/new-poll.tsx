import { createFileRoute } from '@tanstack/react-router';
import Breadcrumbs from '../components/Breadcrumbs';
import NewPollForm from '../components/NewPollForm';

export const Route = createFileRoute('/new-poll')({
    component: NewPoll,
});

function NewPoll() {
  return (
    <div>
      <Breadcrumbs pages={[
        { name: 'Polls', href: '/', current: false },
        { name: 'Create New', href: '/new-poll', current: true },
      ]} />
      <NewPollForm />
    </div>
  )
} 
