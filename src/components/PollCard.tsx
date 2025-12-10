import { Link } from '@tanstack/react-router';
import { ChevronRightIcon } from '@heroicons/react/24/outline';
import { Poll } from '../types';

export default function PollCard({ poll }: { poll: Poll }) {
    let submissions: number = poll?.submissions?.length || 0;
    const submissionText = submissions === 1 ? 'submission' : 'submissions';

    return (
        <li className="w-full relative flex justify-between gap-x-6 px-4 py-5 hover:bg-gray-50 sm:px-6">
            <Link
                to="/polls/$id"
                params={{ id: poll.id }}
                className="block w-full">
                <div className="flex min-w-0 gap-x-4 items-center">
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
