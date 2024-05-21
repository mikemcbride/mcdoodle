import CheckCircleIcon from '@heroicons/react/20/solid/CheckCircleIcon.js';

export default function SuccessAlert({ show }) {
  if (!show) return null

  return (<div className="my-6 rounded-md bg-emerald-50 p-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <CheckCircleIcon
            className="h-5 w-5 text-emerald-400"
            aria-hidden="true"
          />
        </div>
        <div className="ml-3">
          <p className="text-sm font-medium text-emerald-800">
            Successfully uploaded
          </p>
        </div>
      </div>
    </div>)
}
