'use client';

import { useState, useEffect } from 'react';
import { authAPI, deviceAPI } from '@/lib/api';

interface User {
  id: number;
  username: string;
  role: string;
  maxDevices: number;
  createdAt: string;
}

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newUser, setNewUser] = useState({ username: '', password: '', role: 'user', maxDevices: 3 });
  const [creating, setCreating] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState<Partial<User>>({});
  const [updating, setUpdating] = useState(false);
  const [userDevices, setUserDevices] = useState<any[]>([]);
  const [loadingDevices, setLoadingDevices] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const response = await authAPI.getAllUsers();
      setUsers(response.users || []);
    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setError('');

    try {
      await authAPI.createUser(newUser);
      setNewUser({ username: '', password: '', role: 'user', maxDevices: 3 });
      setShowCreateForm(false);
      loadUsers();
    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to create user');
    } finally {
      setCreating(false);
    }
  };

  const loadUserDevices = async (userId: number) => {
    setLoadingDevices(true);
    try {
      const response = await deviceAPI.getByUser(userId);
      setUserDevices(response.devices || []);
    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to load devices');
    } finally {
      setLoadingDevices(false);
    }
  };

  const openEditModal = (user: User) => {
    setEditingUser(user);
    setEditFormData({
      username: user.username,
      role: user.role,
      maxDevices: user.maxDevices,
    });
    setShowEditModal(true);
    // Load devices for this user
    loadUserDevices(user.id);
  };

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    setUpdating(true);
    setError('');

    try {
      // Update role if changed
      if (editFormData.role !== editingUser.role) {
        await authAPI.updateUserRole(editingUser.id, editFormData.role!);
      }
      // Update max devices if changed
      if (editFormData.maxDevices !== editingUser.maxDevices) {
        await authAPI.updateUserMaxDevices(editingUser.id, editFormData.maxDevices!);
      }

      setShowEditModal(false);
      setEditingUser(null);
      setEditFormData({});
      loadUsers();
    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to update user');
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      await authAPI.deleteUser(userId);
      loadUsers();
    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to delete user');
    }
  };

  const handleDeleteDevice = async (deviceId: number) => {
    if (!confirm('Are you sure you want to delete this device? This will allow the user to login from a new device.')) {
      return;
    }

    try {
      await deviceAPI.delete(deviceId);
      // Reload devices for the current editing user
      if (editingUser) {
        loadUserDevices(editingUser.id);
      }
    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to delete device');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div>
      {error && (
        <div className="mb-4 bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">User Management</h2>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
        >
          {showCreateForm ? 'Cancel' : 'Create User'}
        </button>
      </div>

      {showCreateForm && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Create New User</h3>
          <form onSubmit={handleCreateUser} className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                Username
              </label>
              <input
                type="text"
                id="username"
                required
                value={newUser.username}
                onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                type="password"
                id="password"
                required
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                Role
              </label>
              <select
                id="role"
                value={newUser.role}
                onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div>
              <label htmlFor="maxDevices" className="block text-sm font-medium text-gray-700">
                Max Devices
              </label>
              <input
                type="number"
                id="maxDevices"
                required
                min="1"
                max="10"
                value={newUser.maxDevices}
                onChange={(e) => setNewUser({ ...newUser, maxDevices: parseInt(e.target.value) })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={creating}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50"
              >
                {creating ? 'Creating...' : 'Create User'}
              </button>
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {users.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No users found.</p>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {users.map((user) => (
              <li key={user.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{user.username}</p>
                    <p className="text-sm text-gray-500">
                      Role: <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.role === 'admin' 
                          ? 'bg-purple-100 text-purple-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {user.role}
                      </span>
                    </p>
                    <p className="text-sm text-gray-500">
                      Max Devices: {user.maxDevices}
                    </p>
                    <p className="text-sm text-gray-500">
                      Created: {new Date(user.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEditModal(user)}
                      className="text-sm text-indigo-600 hover:text-indigo-700"
                    >
                      Edit User
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user.id)}
                      className="text-sm text-red-600 hover:text-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && editingUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-6 border w-4/5 max-w-5xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Edit User: {editingUser.username}
              </h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column - User Info and Edit Form */}
                <div className="space-y-6">
                  {/* User Info */}
                  <div className="p-4 bg-gray-50 rounded-md">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Current Information</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium block">Username:</span>
                        <span className="text-gray-900">{editingUser.username}</span>
                      </div>
                      <div>
                        <span className="font-medium block">User ID:</span>
                        <span className="text-gray-900">#{editingUser.id}</span>
                      </div>
                      <div>
                        <span className="font-medium block">Role:</span>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          editingUser.role === 'admin' 
                            ? 'bg-purple-100 text-purple-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {editingUser.role}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium block">Max Devices:</span>
                        <span className="text-gray-900">{editingUser.maxDevices}</span>
                      </div>
                      <div className="col-span-2">
                        <span className="font-medium block">Created:</span>
                        <span className="text-gray-900">{new Date(editingUser.createdAt).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <form onSubmit={handleEditUser} className="space-y-4">
                    <div>
                      <label htmlFor="editUsername" className="block text-sm font-medium text-gray-700">
                        Username (Read-only)
                      </label>
                      <input
                        type="text"
                        id="editUsername"
                        value={editFormData.username || editingUser.username}
                        disabled
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="editRole" className="block text-sm font-medium text-gray-700">
                        Role
                      </label>
                      <select
                        id="editRole"
                        value={editFormData.role || editingUser.role}
                        onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value })}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                    
                    <div>
                      <label htmlFor="editMaxDevices" className="block text-sm font-medium text-gray-700">
                        Max Devices
                      </label>
                      <input
                        type="number"
                        id="editMaxDevices"
                        min="1"
                        max="10"
                        value={editFormData.maxDevices !== undefined ? editFormData.maxDevices : editingUser.maxDevices}
                        onChange={(e) => setEditFormData({ ...editFormData, maxDevices: parseInt(e.target.value) })}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>

                    <div className="flex gap-2 pt-2">
                      <button
                        type="submit"
                        disabled={updating}
                        className="px-6 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50"
                      >
                        {updating ? 'Updating...' : 'Update User'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowEditModal(false);
                          setEditingUser(null);
                          setEditFormData({});
                        }}
                        className="px-6 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>

                {/* Right Column - Devices Table */}
                <div>
                  <div className="mb-4 flex items-center justify-between">
                    <h4 className="text-sm font-medium text-gray-700">
                      User Devices ({userDevices.length}/{editingUser.maxDevices})
                    </h4>
                  </div>
                  {loadingDevices ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
                    </div>
                  ) : userDevices.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-md border-2 border-dashed border-gray-200">
                      <p className="text-sm text-gray-500">No devices found for this user.</p>
                    </div>
                  ) : (
                    <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              ID
                            </th>
                            <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Fingerprint
                            </th>
                            <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Browser
                            </th>
                            <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Platform
                            </th>
                            <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Screen
                            </th>
                            <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Timezone
                            </th>
                            <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Language
                            </th>
                            <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Created
                            </th>
                            <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Last Active
                            </th>
                            <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Action
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {userDevices.map((device) => {
                            const deviceInfo = typeof device.deviceInfo === 'string' 
                              ? JSON.parse(device.deviceInfo) 
                              : device.deviceInfo;
                            return (
                              <tr key={device.id} className="hover:bg-gray-50 text-xs">
                                <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-900 font-mono">
                                  #{device.id}
                                </td>
                                <td className="px-2 py-2 text-xs text-gray-900 font-mono">
                                  <div className="truncate max-w-20" title={device.fingerprint || 'N/A'}>
                                    {device.fingerprint ? device.fingerprint.substring(0, 8) + '...' : 'N/A'}
                                  </div>
                                </td>
                                <td className="px-2 py-2 text-xs text-gray-900">
                                  <div className="truncate max-w-32" title={deviceInfo?.userAgent || 'Unknown'}>
                                    {deviceInfo?.userAgent ? 
                                      deviceInfo.userAgent.split(' ')[0] : 'Unknown'
                                    }
                                  </div>
                                </td>
                                <td className="px-2 py-2 text-xs text-gray-900">
                                  {deviceInfo?.platform || 'Unknown'}
                                </td>
                                <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-900">
                                  {deviceInfo?.screenResolution || 'Unknown'}
                                </td>
                                <td className="px-2 py-2 text-xs text-gray-900">
                                  <div className="truncate max-w-24" title={deviceInfo?.timezone || 'Unknown'}>
                                    {deviceInfo?.timezone || 'Unknown'}
                                  </div>
                                </td>
                                <td className="px-2 py-2 text-xs text-gray-900">
                                  {deviceInfo?.language || 'Unknown'}
                                </td>
                                <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-900">
                                  {new Date(device.createdAt).toLocaleDateString()}
                                </td>
                                <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-900">
                                  {new Date(device.lastActive).toLocaleString()}
                                </td>
                                <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-900">
                                  <button
                                    onClick={() => handleDeleteDevice(device.id)}
                                    className="text-red-600 hover:text-red-900 font-medium"
                                    title="Delete device to allow user to login from new device"
                                  >
                                    Delete
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
