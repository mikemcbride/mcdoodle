import { useState, useEffect } from 'react';
import UserList from '../components/UserList.js'
import Users from '../services/users';

export default function UsersPage() {
  const [localUsers, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Users.list().then(res => {
      setUsers(res)
      setLoading(false)
    })
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
      {!loading && (<UserList
        users={localUsers}
      />)}
    </div>
  )
}


