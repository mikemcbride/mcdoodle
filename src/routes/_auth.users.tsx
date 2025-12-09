import { createFileRoute } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import UserList from '../components/UserList';
import User from '../services/users';

export const Route = createFileRoute('/_auth/users')({
    component: UserManagement,
});

function UserManagement() {
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
      {!loading && <UserList users={localUsers} />}
      {loading && <p>Loading users...</p>}
    </div>
  );
} 
