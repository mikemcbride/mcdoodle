import { useState } from 'react';
import _orderBy from 'lodash/orderBy'
import RankedResult from './RankedResult.js';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

export default function RankedResults({ submissions, questions }) {
  const [showNos, setShowNos] = useState(false);
  const questionMap = new Map()
  const questionValues = {}
  for (let q of questions) {
    const qid = q.id.toString()
    if (!questionMap.has(qid)) {
      questionMap.set(qid, q.value)
      questionValues[qid] = {
        yes: 0,
        no: 0,
        if_needed: 0,
      }
    }
  }

  for (let s of submissions) {
    for (let r of s.responses) {
      const qid = r.question_id.toString()
      if (questionValues[qid]) {
        questionValues[qid][r.value] += 1
      }
    }
  }

  // return value we'll use needs to be an array of objects
  // the objects will have a date key (the question value), then yes, no, if_needed, and total_responses, which are all numbers
  const responses = Object.keys(questionValues).map((key) => {
    return {
      date: questionMap.get(key),
      yes: questionValues[key].yes,
      no: questionValues[key].no,
      if_needed: questionValues[key].if_needed,
      not_no: questionValues[key].yes + questionValues[key].if_needed,
      total: submissions.length
    }
  })
  const sortedResponses = _orderBy(
    responses,
    ['not_no', 'yes'],
    ['desc', 'desc']
  )

  const [yesResponses, noResponses] = sortedResponses.reduce(([yes, no], row) => {
    if (row.no > 0) {
      no.push(row)
    } else {
      yes.push(row)
    }
    return [yes, no]
  }, [[], []])

  function toggleShowNos() {
    setShowNos(!showNos)
  }

  return (
    <>
      <h3 className="mt-8 mb-4 text-2xl font-bold">Suggested Dates</h3>
      <div className="-my-2 -mx-4 sm:-mx-6 lg:-mx-8">
        <div className="pt-2 pb-6 md:px-6 lg:px-8">
          <section className="shadow ring-1 ring-black ring-opacity-5 md:rounded-lg divide-y divide-gray-200 bg-white relative">
            {yesResponses.map(row => <RankedResult row={row} key={row.date} />)}
            <div className="relative -mb-px">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-full absolute" />
                <div className="relative flex justify-center">
                  <button
                    type="button"
                    className="inline-flex items-center gap-x-1.5 rounded-full bg-white px-3 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                    onClick={() => toggleShowNos()}
                  >
                    {!showNos && <EyeIcon aria-hidden="true" className="-ml-0.5 size-4 text-gray-400" />}
                    {showNos && <EyeSlashIcon aria-hidden="true" className="-ml-0.5 size-4 text-gray-400" />}
                    {showNos ? 'Hide' : 'Show'} Dates with &quot;No&quot; Responses
                  </button>
                </div>
              </div>
            </div>
            {showNos && noResponses.map(row => <RankedResult row={row} key={row.date} />)}
          </section>
        </div>
      </div>
    </>
  )
}
