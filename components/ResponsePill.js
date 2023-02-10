import clsx from 'clsx';

export default function ResponsePill({ questionId, responses }) {
  const response = responses.find(r => r.question_id === questionId);
  let text = ''
  if (response?.value) {
    text = response.value
  } else {
    text = 'null'
  }
  const formatted = !text ? null : text.split('_').map(word => `${word.charAt(0).toUpperCase()}${word.slice(1)}`).join(' ')
  let colors = ''
  if (text === 'yes') {
    colors = 'bg-emerald-100 text-emerald-800'
  } else if (text === 'no') {
    colors = 'bg-red-100 text-red-800'
  } else if (text === 'if_needed') {
    colors = 'bg-yellow-100 text-yellow-800'
  } else {
    colors = 'bg-gray-100 text-gray-800'
  }

  return (<span className={clsx("inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium", colors)}>{formatted}</span>)
}
