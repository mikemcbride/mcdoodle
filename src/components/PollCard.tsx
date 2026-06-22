import { Link } from '@tanstack/react-router';
import clsx from 'clsx';
import { ChevronRightIcon } from '@heroicons/react/24/outline';
import { Poll } from '../types';

export default function PollCard({ poll }: { poll: Poll }) {
    const submissions: number = poll?.submissionCount ?? poll?.submissions?.length ?? 0;
    const submissionText = submissions === 1 ? 'submission' : 'submissions';
    const isClosed = poll?.status === 'closed';

    return (
        <li className={clsx(
            "w-full relative flex justify-between gap-x-6 px-4 py-5 hover:bg-gray-50 sm:px-6",
            isClosed && "opacity-60",
        )}>
            <Link
                to="/polls/$id"
                params={{ id: poll.id }}
                className="block w-full">
                <div className="flex min-w-0 gap-x-4 items-center">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 text-base lg:text-lg">
                            <p className={clsx("font-medium", isClosed ? "text-gray-500" : "text-blue-600")}>{poll.title}</p>
                            {isClosed && (
                                <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">
                                    Closed
                                </span>
                            )}
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
