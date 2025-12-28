'use client';

import { useState, useEffect } from 'react';
import { deviceAPI, authAPI } from '@/lib/api';

interface Device {
  id: number;
  fingerprint: string;
  deviceInfo: any;
  lastActive: string;
  createdAt: string;
}

interface User {
  id: number;
  username: string;
  role: string;
  maxDevices: number;
  createdAt: string;
}

export default function DeviceManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<number | null>(null);
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    if (selectedUser) {
      loadDevices(selectedUser);
    }
  }, [selectedUser]);

  const loadUsers = async () => {
    try {
      const response = await authAPI.getAllUsers();
      setUsers(response.users || []);
      if (response.users && response.users.length > 0) {
        setSelectedUser(response.users[0].id);
      }
    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const loadDevices = async (userId: number) => {
    try {
      const response = await deviceAPI.getByUser(userId);
      setDevices(response.devices || []);
    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to load devices');
    }
  };

  const handleDeleteDevice = async (deviceId: number) => {
    if (!confirm('Are you sure you want to delete this device?')) {
      return;
    }

    try {
      await deviceAPI.delete(deviceId);
      if (selectedUser) {
        loadDevices(selectedUser);
      }
    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to delete device');
    }
  };

  const renderDeviceInfo = (deviceInfo: any) => {
    // Nếu deviceInfo là string, parse nó
    if (typeof deviceInfo === 'string') {
      try {
        deviceInfo = JSON.parse(deviceInfo);
      } catch {
        return <span className="text-gray-500">{deviceInfo}</span>;
      }
    }

    // Nếu là object, render các trường an toàn
    if (typeof deviceInfo === 'object' && deviceInfo !== null) {
      return (
        <>
          <p className="text-sm text-gray-500">
            <span className="font-medium">Browser:</span> {deviceInfo.userAgent || 'Unknown'}
          </p>
          <p className="text-sm text-gray-500">
            <span className="font-medium">Platform:</span> {deviceInfo.platform || 'Unknown'}
          </p>
          <p className="text-sm text-gray-500">
            <span className="font-medium">Screen:</span> {deviceInfo.screenResolution || 'Unknown'}
          </p>
          <p className="text-sm text-gray-500">
            <span className="font-medium">Language:</span> {deviceInfo.language || 'Unknown'}
          </p>
          <p className="text-sm text-gray-500">
            <span className="font-medium">Timezone:</span> {deviceInfo.timezone || 'Unknown'}
          </p>
        </>
      );
    }

    // Fallback cho mọi trường hợp khác
    return <span className="text-gray-500">Unknown device</span>;
  };

  const getCurrentUserDevices = () => {
    if (!selectedUser) return [];
    return devices;
  };

  const getCurrentUserInfo = () => {
    return users.find(user => user.id === selectedUser);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  const currentUserInfo = getCurrentUserInfo();

  return (
    <div>
      {error && (
        <div className="mb-4 bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Device Management</h2>
      </div>

      {/* User Selector */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <label htmlFor="userSelect" className="block text-sm font-medium text-gray-700 mb-2">
          Select User
        </label>
        <select
          id="userSelect"
          value={selectedUser || ''}
          onChange={(e) => setSelectedUser(parseInt(e.target.value))}
          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        >
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.username} ({user.role}) - {devices.length} devices / {user.maxDevices} max
            </option>
          ))}
        </select>

        {currentUserInfo && (
          <div className="mt-4 p-4 bg-gray-50 rounded-md">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Username:</span> {currentUserInfo.username}
              </div>
              <div>
                <span className="font-medium">Role:</span>{' '}
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  currentUserInfo.role === 'admin' 
                    ? 'bg-purple-100 text-purple-800' 
                    : 'bg-green-100 text-green-800'
                }`}>
                  {currentUserInfo.role}
                </span>
              </div>
              <div>
                <span className="font-medium">Max Devices:</span> {currentUserInfo.maxDevices}
              </div>
              <div>
                <span className="font-medium">Current Devices:</span>{' '}
                <span className={`font-semibold ${
                  getCurrentUserDevices().length > currentUserInfo.maxDevices 
                    ? 'text-red-600' 
                    : 'text-green-600'
                }`}>
                  {getCurrentUserDevices().length}
                </span>
                {getCurrentUserDevices().length > currentUserInfo.maxDevices && (
                  <span className="text-red-600 ml-2">(⚠️ Exceeds limit)</span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Devices List */}
      {getCurrentUserDevices().length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-500">No devices found for this user.</p>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {getCurrentUserDevices().map((device) => (
              <li key={device.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      Device #{device.id}
                    </p>
                    <p className="text-sm text-gray-500">
                      <span className="font-medium">Fingerprint:</span> {device.fingerprint.substring(0, 20)}...
                    </p>
                    {renderDeviceInfo(device.deviceInfo)}
                    <p className="text-sm text-gray-500">
                      <span className="font-medium">Last Active:</span>{' '}
                      {new Date(device.lastActive).toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-500">
                      <span className="font-medium">Created:</span>{' '}
                      {new Date(device.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDeleteDevice(device.id)}
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
    </div>
  );
}
