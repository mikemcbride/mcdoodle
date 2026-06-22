import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import PollList from "../components/PollList";
import Polls from "../services/polls";

export const Route = createFileRoute("/_auth/admin")({
  component: Admin,
});

function Admin() {
  const { data: localPolls = [], isLoading } = useQuery({
    queryKey: ["polls"],
    queryFn: Polls.listWithCounts,
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="text-4xl font-black text-gray-900">Polls</h2>
        <Link
          to="/new-poll"
          className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Create Poll
        </Link>
      </div>
      {!isLoading && <PollList polls={localPolls} isAdmin={true} />}
    </div>
  );
}
