import PollCard from "./PollCard";
import AdminPollCard from "./AdminPollCard";

// TODO: add typing for entities
export default function PollList({
  polls,
  isAdmin,
  onRemovePoll,
}: {
  polls: any[];
  isAdmin?: boolean;
  onRemovePoll?: (id: string) => void;
}) {
  // TODO: Look into using this component:
  // https://tailwindcss.com/plus/ui-blocks/application-ui/lists/stacked-lists#component-f0f183415de745e81fa742d6e1df9e04
  return (
    <div className="bg-white shadow overflow:hidden rounded-md">
      <ul role="list" className="mt-6 divide-y divide-gray-200">
        {polls.length > 0 ? (
          polls.map((poll) => {
            if (isAdmin) {
              return (
                <AdminPollCard
                  key={poll.id}
                  poll={poll}
                  onRemovePoll={onRemovePoll}
                />
              );
            }
            return <PollCard key={poll.id} poll={poll} />;
          })
        ) : (
          <p className="text-xl font-bold px-6 py-12 text-center">
            No polls found
          </p>
        )}
      </ul>
    </div>
  );
}
