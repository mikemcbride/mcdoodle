import clsx from 'clsx'
import { PlusIcon, XMarkIcon } from '@heroicons/react/24/solid'
import { formatQuestionDate } from '../lib/questions'
import type { TimeMode, TimeSelection } from '../types'

type Props = {
  // selected dates (YYYY-MM-DD), any order
  dates: string[]
  value: TimeSelection
  onChange: (value: TimeSelection) => void
}

// Lets the poll creator attach optional times to the selected dates — either
// one shared set of times that applies to every date, or a separate list per
// date. Leaving a date with no times keeps it as an all-day option.
export default function TimeOptions({ dates, value, onChange }: Props) {
  const sortedDates = [...dates].sort()

  function setMode(mode: TimeMode) {
    if (mode === value.mode) return
    let perDate = value.perDate
    // Switching to per-date: seed each date with the shared times so the user
    // can tweak rather than start from scratch. Dates that already have their
    // own list are left alone.
    if (mode === 'per-date' && value.shared.length > 0) {
      perDate = { ...value.perDate }
      for (const date of sortedDates) {
        if (!perDate[date] || perDate[date].length === 0) {
          perDate[date] = [...value.shared]
        }
      }
    }
    onChange({ ...value, mode, perDate })
  }

  function setShared(times: string[]) {
    onChange({ ...value, shared: times })
  }

  function setForDate(date: string, times: string[]) {
    onChange({ ...value, perDate: { ...value.perDate, [date]: times } })
  }

  return (
    <div className="max-w-3xl">
      <h3 className="text-2xl font-bold">Add Times <span className="text-base font-medium text-gray-500">(optional)</span></h3>
      <p className="mt-1 text-sm text-gray-600">
        Leave this empty to let people vote on whole days. Each time you add becomes its own option.
      </p>

      {sortedDates.length === 0 ? (
        <p className="mt-4 text-sm text-gray-500 italic">Select at least one date above to add times.</p>
      ) : (
        <>
          <fieldset className="mt-4">
            <legend className="sr-only">How should times apply?</legend>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-6">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer">
                <input
                  type="radio"
                  name="time-mode"
                  value="shared"
                  checked={value.mode === 'shared'}
                  onChange={() => setMode('shared')}
                  className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                Same times for every date
              </label>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer">
                <input
                  type="radio"
                  name="time-mode"
                  value="per-date"
                  checked={value.mode === 'per-date'}
                  onChange={() => setMode('per-date')}
                  className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                Different times for each date
              </label>
            </div>
          </fieldset>

          {value.mode === 'shared' ? (
            <div className="mt-4">
              <TimeList
                id="shared"
                times={value.shared}
                onChange={setShared}
                emptyLabel="All day"
              />
            </div>
          ) : (
            <ul className="mt-4 divide-y divide-gray-200 rounded-md border border-gray-200">
              {sortedDates.map(date => (
                <li key={date} className="p-4">
                  <h4 className="font-semibold text-gray-900">{formatQuestionDate(date)}</h4>
                  <div className="mt-2">
                    <TimeList
                      id={date}
                      times={value.perDate[date] ?? []}
                      onChange={times => setForDate(date, times)}
                      emptyLabel="All day"
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  )
}

type TimeListProps = {
  id: string
  times: string[]
  onChange: (times: string[]) => void
  emptyLabel: string
}

// An editable list of <input type="time"> rows plus an "add" button. Blank
// rows are allowed while editing and are dropped when the poll is built.
function TimeList({ id, times, onChange, emptyLabel }: TimeListProps) {
  function update(idx: number, val: string) {
    onChange(times.map((t, i) => (i === idx ? val : t)))
  }

  function remove(idx: number) {
    onChange(times.filter((_, i) => i !== idx))
  }

  function add() {
    onChange([...times, ''])
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {times.length === 0 && (
        <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700">{emptyLabel}</span>
      )}
      {times.map((time, idx) => (
        <div key={`${id}-${idx}`} className="inline-flex items-center rounded-md border border-gray-300 bg-white shadow-sm">
          <label htmlFor={`time-${id}-${idx}`} className="sr-only">Time {idx + 1}</label>
          <input
            id={`time-${id}-${idx}`}
            type="time"
            value={time}
            onChange={e => update(idx, e.target.value)}
            className="border-0 rounded-l-md py-1.5 pl-3 pr-1 text-sm text-gray-900 focus:ring-2 focus:ring-inset focus:ring-blue-500"
          />
          <button
            type="button"
            onClick={() => remove(idx)}
            className="rounded-r-md px-2 py-1.5 text-gray-400 hover:text-red-600 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
          >
            <span className="sr-only">Remove time</span>
            <XMarkIcon className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={add}
        className={clsx(
          'inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500',
          'text-blue-700 bg-blue-50 hover:bg-blue-100',
        )}
      >
        <PlusIcon className="h-4 w-4" aria-hidden="true" />
        Add a time
      </button>
    </div>
  )
}
