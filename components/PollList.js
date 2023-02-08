import PollCard from './PollCard'
import AdminPollCard from './AdminPollCard'

export default function PollList({ polls, isAdmin, onRemovePoll }) {
  return (
    <div className="bg-white shadow overflow:hidden rounded-md">
      <ul role="list" className="mt-6 divide-y divide-gray-200">
        {
          polls.length > 0 ? polls.map((poll, idx) => {
            if (isAdmin) {
              return (
                <AdminPollCard
                  key={poll.id}
                  poll={poll}
                  pollIndex={idx}
                  onRemovePoll={onRemovePoll}
                />
              )
            }
            return (
              <PollCard
                key={poll.id}
                poll={poll}
                pollIndex={idx}
              />
            )
          }) : <p className="text-xl font-bold px-6 py-12 text-center">No polls found</p>
        }
      </ul>
    </div>
  )
}
