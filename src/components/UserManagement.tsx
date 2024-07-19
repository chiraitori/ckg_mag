import React, { useState, useEffect } from 'react';
import { User } from '@/types/user';
import { Farm } from '@/types/farm';
import { Pencil, Trash2 } from 'lucide-react';

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [farms, setFarms] = useState<Farm[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchUsers();
    fetchFarms();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setUsers(data);
    } catch (err) {
      console.error('Failed to fetch users:', err);
      setError('Failed to load users. Please try again later.');
    }
  };

  const fetchFarms = async () => {
    try {
      const response = await fetch('/api/farm');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (!Array.isArray(data)) {
        throw new Error('Expected an array of farms');
      }
      setFarms(data);
    } catch (err) {
      console.error('Failed to fetch farms:', err);
      setError('Failed to load farms. Please try again later.');
    }
  };

  const handleEditClick = (user: User) => {
    setSelectedUser(user);
  };

  const handleDeleteClick = async (userId: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        const response = await fetch(`/api/users/${userId}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error('Failed to delete user');
        }

        setSuccess('User deleted successfully');
        fetchUsers();
      } catch (err) {
        console.error('Error deleting user:', err);
        setError('Failed to delete user. Please try again.');
      }
    }
  };

  const getFarmNames = (farmIds?: string[]) => {
    if (!farmIds || farmIds.length === 0) {
      return 'No farms assigned';
    }
    return farmIds.map(id => farms.find(farm => farm._id.toString() === id)?.name || 'Unknown Farm').join(', ');
  };

  const getUserRole = (user: User): string => {
    if (user.isAdmin) return 'Admin';
    if (user.isDirector) return 'Director';
    if (user.isManager) return 'Manager';
    if (user.isSeller) return 'Seller';
    return 'Member';
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    if (selectedUser) {
      setSelectedUser({
        ...selectedUser,
        [name]: checked
      });
    }
  };

  const handleFarmAssignment = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedFarmIds = Array.from(e.target.selectedOptions, option => option.value);
    if (selectedUser) {
      setSelectedUser({
        ...selectedUser,
        assignedFarms: selectedFarmIds
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    try {
      const response = await fetch(`/api/users/${selectedUser._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(selectedUser),
      });

      if (!response.ok) {
        throw new Error('Failed to update user');
      }

      setSuccess('User updated successfully');
      fetchUsers();
      setSelectedUser(null);
    } catch (err) {
      console.error('Error updating user:', err);
      setError('Failed to update user. Please try again.');
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">User Management</h2>
      <table className="min-w-full bg-white border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="py-2 px-4 border-b">Name</th>
            <th className="py-2 px-4 border-b">Role</th>
            <th className="py-2 px-4 border-b">Email</th>
            <th className="py-2 px-4 border-b">Assigned Farms</th>
            <th className="py-2 px-4 border-b">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user._id.toString()} className="hover:bg-gray-50">
              <td className="py-2 px-4 border-b">{user.name}</td>
              <td className="py-2 px-4 border-b">{getUserRole(user)}</td>
              <td className="py-2 px-4 border-b">{user.email}</td>
              <td className="py-2 px-4 border-b">{getFarmNames(user.assignedFarms)}</td>
              <td className="py-2 px-4 border-b">
                <button
                  onClick={() => handleEditClick(user)}
                  className="text-blue-600 hover:text-blue-800 mr-2"
                  title="Edit user"
                >
                  <Pencil size={18} />
                  <span className="ml-1">Edit</span>
                </button>
                <button
                  onClick={() => handleDeleteClick(user._id.toString())}
                  className="text-red-600 hover:text-red-800"
                  title="Delete user"
                >
                  <Trash2 size={18} />
                  <span className="ml-1">Delete</span>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {selectedUser && (
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <input
            type="text"
            name="name"
            value={selectedUser.name}
            onChange={(e) => setSelectedUser({...selectedUser, name: e.target.value})}
            className="w-full p-2 border rounded"
            placeholder="Name"
          />
          <input
            type="email"
            name="email"
            value={selectedUser.email}
            onChange={(e) => setSelectedUser({...selectedUser, email: e.target.value})}
            className="w-full p-2 border rounded"
            placeholder="Email"
          />
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="isAdmin"
                checked={selectedUser.isAdmin}
                onChange={handleInputChange}
              />
              <span className="ml-2">Admin</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                name="isDirector"
                checked={selectedUser.isDirector}
                onChange={handleInputChange}
              />
              <span className="ml-2">Director</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                name="isManager"
                checked={selectedUser.isManager}
                onChange={handleInputChange}
              />
              <span className="ml-2">Manager</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                name="isSeller"
                checked={selectedUser.isSeller}
                onChange={handleInputChange}
              />
              <span className="ml-2">Seller</span>
            </label>
          </div>
          <select
            multiple
            value={selectedUser.assignedFarms || []}
            onChange={handleFarmAssignment}
            className="w-full p-2 border rounded"
          >
            {farms.map(farm => (
              <option key={farm._id.toString()} value={farm._id.toString()}>
                {farm.name}
              </option>
            ))}
          </select>
          <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded">
            Update User
          </button>
        </form>
      )}
      {error && <p className="text-red-500">{error}</p>}
      {success && <p className="text-green-500">{success}</p>}
    </div>
  );
}