export default function Poll({ poll }) {
  const { title, description, status, questions, submissions } = poll;

  return (
    <div
      className="max-w-[250px] rounded overflow-hidden shadow-lg"
      key={poll.id}
    >
      <div className="px-6 py-4">
        <div className="font-bold text-xl mb-2">{title}</div>
        <p className="text-gray-700 text-base">{description}</p>
        <p className="text-gray-900 text-xl">{status}</p>
      </div>
      <div className="px-6 pt-4 pb-2">
        {questions.map(question => {
          return (
            <span className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">
              {question.value}
            </span>
          )
        })}
      </div>
      <div className="px-6 pt-4 pb-2">
        {submissions.map(submission => {
          return (
            <span className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">
              {submission.person}
            </span>
          )
        })}
      </div>
    </div>
  );
}
