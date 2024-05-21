import { useState } from 'react';
import ChevronLeftIcon from '@heroicons/react/24/solid/ChevronLeftIcon.js'
import ChevronRightIcon from '@heroicons/react/24/solid/ChevronRightIcon.js'
import clsx from 'clsx';
import getDay from 'date-fns/getDay'
import addDays from 'date-fns/addDays'
import subDays from 'date-fns/subDays'
import eachDayOfInterval from 'date-fns/eachDayOfInterval'
import isToday from 'date-fns/isToday'
import isSameMonth from 'date-fns/isSameMonth'

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const CURRENT_MONTH = new Date().getMonth()
const CURRENT_YEAR = new Date().getFullYear()

export default function CalendarGrid({ selected, onUpdate }) {
  const [month, setMonth] = useState(CURRENT_MONTH)
  const [year, setYear] = useState(CURRENT_YEAR)
  const [monthName, setMonthName] = useState(MONTH_NAMES[CURRENT_MONTH])

  const INITIAL_DAYS = getDays(CURRENT_YEAR, CURRENT_MONTH)
  const [days, setDays] = useState(INITIAL_DAYS)

  function getDays(y, m) {
    const startOfMonth = new Date(y, m, 1)
    const firstDayWeekDay = getDay(startOfMonth) // 0 = Sunday, 6 = Saturday
    const daysToSub = firstDayWeekDay
    const intervalStart = subDays(startOfMonth, daysToSub)
    const intervalEnd = addDays(intervalStart, 41) // our grid is 6 rows with 7 days, so we have 42 cells. We need to add 41 days.
    const intervalDays = eachDayOfInterval({ start: intervalStart, end: intervalEnd }).map(day => {
      const date = day.toISOString().split('T')[0]
      return {
        date: date,
        isCurrentMonth: isSameMonth(day, startOfMonth),
        isToday: isToday(day)
      }
    })
    return intervalDays
  }

  function goToToday() {
    setYear(CURRENT_YEAR)
    setMonth(CURRENT_MONTH)
    const d = getDays(CURRENT_YEAR, CURRENT_MONTH)
    setDays(d)
    setMonthName(MONTH_NAMES[CURRENT_MONTH])
  }

  function subtractMonth() {
    let newMonth = null
    let newYear = year
    if (month === 0) {
      newMonth = 11
      newYear = year - 1
    } else {
      newMonth = month - 1
    }
    setMonth(newMonth)
    setMonthName(MONTH_NAMES[newMonth])
    setYear(newYear)
    const d = getDays(newYear, newMonth)
    setDays(d)
  }

  function addMonth() {
    let newMonth = null
    let newYear = year
    if (month === 11) {
      newMonth = 0
      newYear = year + 1
    } else {
      newMonth = month + 1
    }
    setMonth(newMonth)
    setMonthName(MONTH_NAMES[newMonth])
    setYear(newYear)
    const d = getDays(newYear, newMonth)
    setDays(d)
  }

  function toggleDate(day) {
    const uniq = new Set(selected)
    if (!uniq.has(day)) {
      uniq.add(day)
    } else {
      uniq.delete(day)
    }
    onUpdate([...uniq])
  }

  return (<div
    className="grid max-w-3xl grid-cols-1 gap-x-8 gap-y-16 py-6">
    <section className="text-center">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-xl text-gray-900">{`${monthName} ${year}`}</h2>
        <div className="flex items-center rounded-md shadow-sm md:items-stretch">
          <button type="button"
            onClick={subtractMonth}
            className="flex items-center justify-center rounded-l-md border border-r-0 border-gray-300 bg-white py-2 pl-3 pr-4 text-gray-400 hover:text-gray-500 focus:relative md:w-9 md:px-2 md:hover:bg-gray-50">
            <span className="sr-only">Previous month</span>
            <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
          </button>
          <button type="button"
            onClick={goToToday}
            className="border-t border-b border-gray-300 bg-white px-3.5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 focus:relative block">Today</button>
          <button type="button"
            onClick={addMonth}
            className="flex items-center justify-center rounded-r-md border border-l-0 border-gray-300 bg-white py-2 pl-4 pr-3 text-gray-400 hover:text-gray-500 focus:relative md:w-9 md:px-2 md:hover:bg-gray-50">
            <span className="sr-only">Next month</span>
            <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-7 text-xs font-semibold leading-6 text-gray-500">
        <div>S</div>
        <div>M</div>
        <div>T</div>
        <div>W</div>
        <div>T</div>
        <div>F</div>
        <div>S</div>
      </div>
      <div
        className="isolate mt-2 grid grid-cols-7 gap-px rounded-lg bg-gray-200 text-sm md:text-base shadow ring-1 ring-gray-200">
        {days.map((day, dayIdx) => (<button key={day.date} type="button"
          onClick={() => toggleDate(day.date)}
          className={clsx(day.isToday && 'bg-blue-50 text-blue-600', day.isCurrentMonth ? 'bg-white text-gray-900' : 'bg-gray-50 text-gray-400', dayIdx === 0 && 'rounded-tl-lg', dayIdx === 6 && 'rounded-tr-lg', dayIdx === days.length - 7 && 'rounded-bl-lg', dayIdx === days.length - 1 && 'rounded-br-lg', 'py-2 sm:py-4 hover:bg-gray-100 focus:z-10')}>
          <time dateTime={day.date}
            className={clsx(selected.includes(day.date) && 'bg-blue-600 !text-white font-semibold', 'mx-auto flex h-8 w-8 sm:h-12 sm:w-12 items-center justify-center rounded-full')}>{day.date.split('-').pop().replace(/^0/, '')}</time>
        </button>))}
      </div>
    </section>
  </div>)
}
