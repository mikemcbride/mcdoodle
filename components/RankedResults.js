import clsx from 'clsx';
import _orderBy from 'lodash/orderBy'

export default function RankedResults({ submissions, questions }) {
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

  return (
    <>
      <h3 className="mt-8 mb-4 text-2xl font-bold">Suggested Dates</h3>
      <div className="-my-2 -mx-4 sm:-mx-6 lg:-mx-8">
        <div className="py-2 md:px-6 lg:px-8">
          <section className="shadow ring-1 ring-black ring-opacity-5 md:rounded-lg divide-y divide-gray-200 bg-white">
            {sortedResponses.map(row => {
              return (
                <div
                  key={row.date}
                  className="p-4 md:py-6 lg:py-8 lg:px-6 flex items-center"
                >
                  <div className="font-bold text-sm md:text-base flex-shrink-0 text-right pr-4 md:pr-6 lg:pr-8">
                    {row.date}
                  </div>
                  <div className="flex h-3 md:h-6 flex-shrink rounded w-full">
                    {row.yes > 0 && (
                      <div
                        className={clsx("group relative bg-emerald-500", row.yes > 0 ? 'rounded-l' : '', row.yes === row.total ? 'rounded-r' : '')}
                        style={{width: `${(row.yes / row.total) * 100}%`}}
                      >
                        <span className="hidden group-hover:block px-2 py-1 rounded text-xs bg-gray-700 bg-opacity-90 text-white font-medium absolute -top-8 left-1/2 transform -translate-x-1/2">{row.yes}</span>
                      </div>
                    )}

                    {row.if_needed > 0 && (
                      <div
                        className={clsx("group relative bg-yellow-400", row.yes === 0 ? 'rounded-l' : '', row.no === 0 ? 'rounded-r' : '')}
                        style={{width: `${(row.if_needed / row.total) * 100}%`}}
                      >
                        <span className="hidden group-hover:block px-2 py-1 rounded text-xs bg-gray-700 bg-opacity-90 text-white font-medium absolute -top-8 left-1/2 transform -translate-x-1/2">{row.if_needed}</span>
                      </div>

                    )}

                    {row.no > 0 && (
                      <div
                        className={clsx("group relative bg-red-500", row.no > 0 ? 'rounded-r' : '', row.no === row.total ? 'rounded-l' : '')}
                        style={{width: `${(row.no / row.total) * 100}%`}}
                      >
                        <span className="hidden group-hover:block px-2 py-1 rounded text-xs bg-gray-700 bg-opacity-90 text-white font-medium absolute -top-8 left-1/2 transform -translate-x-1/2">{row.no}</span>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </section>
        </div>
      </div>
    </>
  )
}
