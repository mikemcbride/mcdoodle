import clsx from 'clsx';
import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

import Polls from '../services/polls';
import Questions from '../services/questions'
import CalendarGrid from './CalendarGrid.js'
import Spinner from './Spinner.js'
import SuccessAlert from './SuccessAlert.js'

export default function NewPollForm() {
  const router = useRouter()

  const [selected, setSelected] = useState([])
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [showSuccess, setShowSuccess] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  function updateSelected(val) {
    setSelected(val)
  }

  function handleSubmit() {
    setIsSubmitting(true)
    Polls.create({
      title: title,
      description: description,
      status: 'open', // new polls will default to being open
    }).then(newPoll => {
      console.log('new poll:', newPoll)
      Questions.create(selected.map((val, idx) => ({
        value: val,
        poll_id: newPoll.id,
        order: idx
      }))).then(() => {
        setIsSubmitting(false)
        flashSuccess()
      })
    })
  }

  function flashSuccess() {
    setShowSuccess(true)
    setTimeout(() => {
      setShowSuccess(false)
      router.push('/')
    }, 2000)
  }
  return (<div>
    <h2 className="text-4xl font-black text-gray-900">New Poll</h2>
    <section className="mt-8 space-y-6 max-w-lg">
      <div>
        <label
          htmlFor="title"
          className="block text-sm font-medium text-gray-700"
        >Title</label
        >
        <div className="mt-1">
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            name="title"
            id="title"
            className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
            placeholder="Your awesome poll"
          />
        </div>
      </div>
      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-gray-700"
        >Description (optional)</label
        >
        <div className="mt-1">
          <textarea
            rows="4"
            name="description"
            value={description}
            onChange={e => setDescription(e.target.value)}
            id="description"
            className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
          />
        </div>
      </div>
    </section>
    <section className="mt-4 sm:mt-8">
      <h3 className="hidden sm:block text-2xl font-bold">Choose Dates</h3>
      <CalendarGrid selected={selected} onUpdate={updateSelected} />
    </section>

    <SuccessAlert show={showSuccess} />

    <footer className="mt-4 flex flex-col-reverse sm:flex-row justify-end w-full max-w-3xl gap-4">
      <Link
        href="/"
        className="inline-flex items-center justify-center px-4 py-3 sm:py-2 text-center border border-gray-300 shadow-sm text-lg sm:text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >Cancel</Link>
      <button
        type="button"
        onClick={handleSubmit}
        disabled={isSubmitting}
        className={clsx("w-full sm:w-auto flex sm:inline-flex justify-center items-center px-4 py-3 sm:py-2 border border-transparent text-lg sm:text-sm text-center font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500", isSubmitting && 'bg-opacity-60 cursor-not-allowed')}
      >
        <Spinner className="text-white h-4 w-4 mr-2" show={isSubmitting} /> {isSubmitting ? 'Submitting' : 'Submit'}
      </button>
    </footer>
  </div>)
}
