'use client';

import Breadcrumbs from '../../components/Breadcrumbs.jsx';
import NewPollForm from '../../components/NewPollForm.js';

export default function NewPoll() {
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
