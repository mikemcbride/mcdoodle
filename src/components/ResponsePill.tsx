import clsx from 'clsx';
import { Response } from '../types';

export default function ResponsePill({ questionId, responses }: { questionId: string, responses: Response[] }) {
  const response = responses.find(r => r.question_id === questionId);
  let text = ''
  if (response?.value) {
    text = response.value
  } else {
    text = 'null'
  }
  const formatted = !text ? null : text.split('_').map(word => `${word.charAt(0).toUpperCase()}${word.slice(1)}`).join(' ')
  let colors = ''
  switch (text) {
    case 'yes':
      colors = 'bg-emerald-100 text-emerald-800'
      break;
    case 'no':
      colors = 'bg-red-100 text-red-800'
      break;
    case 'if_needed':
      colors = 'bg-yellow-100 text-yellow-800'
      break;
    default:
      colors = 'bg-gray-100 text-gray-800'
  }

  return (<span className={clsx("inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium", colors)}>{formatted}</span>)
}
