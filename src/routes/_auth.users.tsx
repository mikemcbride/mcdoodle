import { createFileRoute } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import UserList from '../components/UserList';
import User from '../services/users';
import { useAuth } from '../auth';

export const Route = createFileRoute('/_auth/users')({
    component: UserManagement,
});

function UserManagement() {
  const { user } = useAuth();
  const [localUsers, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    User.list().then(res => {
      setUsers(res);
      setLoading(false);
    }).catch(err => {
      console.error('Error fetching users:', err);
      setLoading(false);
    });
  }, []);

  async function handleToggleRole(userId: string, nextIsAdmin: boolean) {
    // optimistic update
    setUsers(prev => prev.map(u => (u.id === userId ? { ...u, isAdmin: nextIsAdmin } : u)));
    try {
      await User.update(userId, { isAdmin: nextIsAdmin });
    } catch (err) {
      console.error('Error updating user role:', err);
      // revert on failure
      setUsers(prev => prev.map(u => (u.id === userId ? { ...u, isAdmin: !nextIsAdmin } : u)));
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
      {!loading && (
        <UserList
          users={localUsers}
          currentUserId={user?.id}
          onToggleRole={handleToggleRole}
        />
      )}
      {loading && <p>Loading users...</p>}
    </div>
  );
} 
