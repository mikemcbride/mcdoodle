import Link from 'next/link';
import { ChevronRightIcon } from '@heroicons/react/24/outline';

export default function PollCard({ poll }) {
  const submissions = poll.submissions.length > 0 ? poll.submissions.length : 0;
  const submissionText = submissions === 1 ? 'submission' : 'submissions';

  return (
    <li>
        <Link href={`/polls/${poll.id}`} className="block hover:bg-gray-50">
            <div className="px-4 py-4 flex items-center sm:px-6">
                <div className="flex-1">
                    <div className="flex text-base lg:text-lg">
                        <p className="font-medium text-blue-600">{poll.title}</p>
                    </div>
                    <p className="text-sm lg:text-base text-gray-500">{poll.description || ''}</p>
                </div>
                <div className="hidden sm:block flex-shrink-0 mt-0 sm:ml-5">
                    <p className="text-sm text-gray-500">{submissions} {submissionText}</p>
                </div>
                <div className="flex-shrink-0 ml-5">
                    <ChevronRightIcon className="w-5 h-5 text-gray-400" aria-hidden="true" />
                </div>
            </div>
        </Link>
    </li>
  )
}
