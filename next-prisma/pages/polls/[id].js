const PollDetail = ({ poll, submissions }) => {
  const { id } = poll

  return <pre>poll: {JSON.stringify(poll, null, 4)}<br/>submissions: {submissions.map(it => JSON.stringify(it, null, 4)).join(', ')}</pre>
}

export default PollDetail

export async function getServerSideProps({ params }) {
  const [poll, submissions] = await Promise.all([
    prisma.poll.findUnique({
      where: {
        id: parseInt(params.id, 10)
      },
      include: {
        questions: true,
      },
    }),
    prisma.submission.findMany({
      where: {
        poll_id: parseInt(params.id, 10)
      },
      include: {
        responses: true
      }
    })
  ]);

  return {
    props: { poll, submissions },
  };
}
