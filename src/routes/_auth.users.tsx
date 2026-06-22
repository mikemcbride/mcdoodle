import { createFileRoute } from '@tanstack/react-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import UserList from '../components/UserList';
import User from '../services/users';
import { useAuth } from '../auth';
import { User as UserType } from '../types';

export const Route = createFileRoute('/_auth/users')({
    component: UserManagement,
});

function UserManagement() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: localUsers = [], isLoading } = useQuery<UserType[]>({
    queryKey: ['users'],
    queryFn: User.list,
  });

  async function handleToggleRole(userId: string, nextIsAdmin: boolean) {
    // optimistically update the cached list
    queryClient.setQueryData<UserType[]>(['users'], (old = []) =>
      old.map((u) => (u.id === userId ? { ...u, isAdmin: nextIsAdmin } : u)),
    );
    try {
      await User.update(userId, { isAdmin: nextIsAdmin });
    } catch (err) {
      console.error('Error updating user role:', err);
      // roll back to the server's truth
      queryClient.invalidateQueries({ queryKey: ['users'] });
    }
  }

  return (
    <div>
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-4xl font-black text-gray-900">Users</h1>
          <p className="mt-2 text-sm text-gray-700">
            A list of all users including their name, email, and role, and verification status.
          </p>
        </div>
      </div>
      {!isLoading && (
        <UserList
          users={localUsers}
          currentUserId={user?.id}
          onToggleRole={handleToggleRole}
        />
      )}
      {isLoading && <p>Loading users...</p>}
    </div>
  );
}
