import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../auth";

import PollList from "../components/PollList";
import Polls from "../services/polls";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const { user } = useAuth();

  const { data: polls = [], isLoading } = useQuery({
    queryKey: ["polls"],
    queryFn: Polls.listWithCounts,
  });

  return (
    <div className="min-h-full">
      <div>
        <div className="flex items-center justify-between">
          <h2 className="text-4xl font-black text-gray-900">Polls</h2>
          {user && (
            <Link
              to="/new-poll"
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Create Poll
            </Link>
          )}
        </div>
        {isLoading ? <p>Loading polls...</p> : <PollList polls={polls} />}
      </div>
    </div>
  );
}
