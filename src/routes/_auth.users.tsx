import { createFileRoute } from '@tanstack/react-router';
import { Link } from '@tanstack/react-router';
import { useState } from 'react';

export const Route = createFileRoute('/_auth/users')({
    component: UserManagement,
});

// Mock user data for demonstration
const mockUsers = [
  { id: '1', name: 'Admin User', email: 'admin@example.com', role: 'Admin', lastLogin: '2023-05-01' },
  { id: '2', name: 'Regular User', email: 'user@example.com', role: 'User', lastLogin: '2023-05-02' },
  { id: '3', name: 'Jane Smith', email: 'jane@example.com', role: 'User', lastLogin: '2023-04-28' },
  { id: '4', name: 'Bob Johnson', email: 'bob@example.com', role: 'User', lastLogin: '2023-04-30' },
  { id: '5', name: 'Alice Brown', email: 'alice@example.com', role: 'User', lastLogin: '2023-05-03' },
];

function UserManagement() {
  const [users, setUsers] = useState(mockUsers);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="user-management">
      <div className="user-management-header">
        <h1>User Management</h1>
        <Link to="/admin" className="back-to-admin">
          Back to Admin Dashboard
        </Link>
      </div>
      
      <div className="search-container">
        <input
          type="text"
          placeholder="Search users..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="user-search"
        />
      </div>
      
      <div className="users-table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Last Login</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(user => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.role}</td>
                <td>{user.lastLogin}</td>
                <td className="user-actions">
                  <button className="edit-user">Edit</button>
                  <button 
                    className="delete-user"
                    onClick={() => {
                      if (window.confirm(`Delete user ${user.name}?`)) {
                        setUsers(users.filter(u => u.id !== user.id));
                      }
                    }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {filteredUsers.length === 0 && (
        <div className="no-users-found">
          No users found matching "{searchTerm}"
        </div>
      )}
    </div>
  );
} 
