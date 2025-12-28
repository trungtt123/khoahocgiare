'use client';

import { useState } from 'react';
import { deviceAPI } from '@/lib/api';

interface Device {
  id: number;
  fingerprint: string;
  deviceInfo: {
    userAgent: string;
    platform: string;
    screenResolution: string;
    timezone: string;
    language?: string;
  };
  lastActive: string;
  createdAt: string;
}

interface DeviceListProps {
  devices: Device[];
  onRefresh: () => void;
}

export default function DeviceList({ devices, onRefresh }: DeviceListProps) {
  const [deleting, setDeleting] = useState<number | null>(null);

  const handleDelete = async (deviceId: number) => {
    if (!confirm('Are you sure you want to remove this device?')) {
      return;
    }

    setDeleting(deviceId);
    try {
      await deviceAPI.delete(deviceId);
      onRefresh();
    } catch (error) {
      console.error('Failed to delete device:', error);
      alert('Failed to delete device');
    } finally {
      setDeleting(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  if (devices.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No devices registered yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">
          Registered Devices ({devices.length})
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Maximum 3 devices allowed. Oldest device will be removed when limit is reached.
        </p>
      </div>
      <div className="divide-y divide-gray-200">
        {devices.map((device) => (
          <div key={device.id} className="px-6 py-4 hover:bg-gray-50">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-medium text-gray-900">
                    Device {device.id}
                  </span>
                  {device.id === devices[0].id && (
                    <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">
                      Current
                    </span>
                  )}
                </div>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>
                    <span className="font-medium">Platform:</span>{' '}
                    {device.deviceInfo.platform}
                  </p>
                  <p>
                    <span className="font-medium">Resolution:</span>{' '}
                    {device.deviceInfo.screenResolution}
                  </p>
                  <p>
                    <span className="font-medium">Timezone:</span>{' '}
                    {device.deviceInfo.timezone}
                  </p>
                  <p>
                    <span className="font-medium">Last Active:</span>{' '}
                    {formatDate(device.lastActive)}
                  </p>
                  <p className="text-xs text-gray-400 mt-2">
                    Fingerprint: {device.fingerprint.substring(0, 16)}...
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleDelete(device.id)}
                disabled={deleting === device.id}
                className="ml-4 px-3 py-1 text-sm font-medium text-red-600 hover:text-red-700 disabled:opacity-50"
              >
                {deleting === device.id ? 'Removing...' : 'Remove'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

