import Link from 'next/link';
import NewPollForm from '../components/NewPollForm.js';

export default function NewPoll() {
  return (
    <div>
        <Link href="/" className="mb-8 hover:text-blue-600 inline-block sm:text-lg">Back</Link>
        <NewPollForm />
    </div>
  )
}
