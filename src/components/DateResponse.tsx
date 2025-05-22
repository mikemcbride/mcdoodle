import { useState } from 'react';
import clsx from 'clsx';
import { format } from 'date-fns/format';
import { addDays } from 'date-fns/addDays';
import { RadioGroup, Label, Radio } from '@headlessui/react';
import { ResponseOption, Vote } from '../types';

export default function DateResponse({ vote, handleVote }: { vote: Vote, handleVote: (vote: Vote) => void }) {
  const [answer, setAnswer] = useState(vote.response)
  const formattedDate = format(addDays(new Date(vote.date), 1), 'E, MMM do')

  function handleAnswerChange(val: ResponseOption) {
    setAnswer(val)
    handleVote({ question: vote.question, date: vote.date, response: val })
  }

  return (
    <div>
      <div className="sm:flex items-center justify-between max-w-xl">
        <h3 className="font-bold text-lg">{formattedDate}</h3>
        <div className="flex items-center">
          <RadioGroup value={answer} onChange={handleAnswerChange} className="mt-4 sm:mt-0">
            <Label className="sr-only">Choose an option</Label>
            <div className="grid grid-cols-3 gap-3">
              <Radio value="yes" className={({ focus, checked }) => clsx(focus ? 'ring-2 ring-offset-2 ring-emerald-500' : '', checked ? 'bg-emerald-100 border-transparent text-emerald-700 hover:bg-emerald-200' : 'bg-white border-gray-200 text-gray-900 hover:bg-gray-50', 'border rounded-md cursor-pointer py-3 px-3 flex items-center justify-center text-sm font-medium sm:flex-1 focus:outline-none')}>
                <Label as="span">Yes</Label>
              </Radio>
              <Radio value="if_needed" className={({ focus, checked }) => clsx(focus ? 'ring-2 ring-offset-2 ring-yellow-500' : '', checked ? 'bg-yellow-100 border-transparent text-yellow-700 hover:bg-yellow-200' : 'bg-white border-gray-200 text-gray-900 hover:bg-gray-50', 'border rounded-md cursor-pointer py-3 px-3 flex items-center justify-center text-sm font-medium sm:flex-1 focus:outline-none')}>
                <Label as="span">If Needed</Label>
              </Radio>
              <Radio value="no" className={({ focus, checked }) => clsx(focus ? 'ring-2 ring-offset-2 ring-red-500' : '', checked ? 'bg-red-100 border-transparent text-red-700 hover:bg-red-200' : 'bg-white border-gray-200 text-gray-900 hover:bg-gray-50', 'border rounded-md cursor-pointer py-3 px-3 flex items-center justify-center text-sm font-medium sm:flex-1 focus:outline-none')}>
                <Label as="span">No</Label>
              </Radio>
            </div>
          </RadioGroup>
        </div>
      </div>
    </div>
  )
}
