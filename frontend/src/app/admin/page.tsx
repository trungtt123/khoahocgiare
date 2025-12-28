'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated, isAdmin, getAuth, clearAuth } from '@/lib/auth';
import { videoAPI, deviceAPI, getDeviceInfo } from '@/lib/api';
import VideoList from '@/components/VideoList';
import UploadVideo from '@/components/UploadVideo';
import UserManagement from '@/components/UserManagement';
import ScreenRecordingProtection from '@/components/ScreenRecordingProtection';

interface Video {
  id: number;
  abyssVideoId: string;
  embedCode: string;
  title: string | null;
  createdAt: string;
}

interface Device {
  id: number;
  fingerprint: string;
  deviceInfo: any;
  lastActive: string;
  createdAt: string;
}

export default function AdminPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'videos' | 'upload' | 'users'>('videos');

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }

    if (!isAdmin()) {
      router.push('/');
      return;
    }

    const { user: authUser } = getAuth();
    setUser(authUser);

    // Check device on mount
    const checkDevice = async () => {
      try {
        const deviceInfo = getDeviceInfo();
        await deviceAPI.check(deviceInfo);
        await loadData();
      } catch (error: any) {
        if (error.response?.status === 401) {
          clearAuth();
          router.push('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    checkDevice();
  }, [router]);

  const loadData = async () => {
    try {
      const [videosRes, devicesRes] = await Promise.all([
        videoAPI.getAll(),
        deviceAPI.getAll(),
      ]);
      setVideos(videosRes.videos || []);
      setDevices(devicesRes.devices || []);
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  };

  const handleLogout = () => {
    clearAuth();
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Admin Dashboard
              </h1>
              <p className="text-sm text-gray-600">Manage users and videos</p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                Admin: {user?.username}
              </span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('users')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'users'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Users
            </button>
            <button
              onClick={() => setActiveTab('videos')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'videos'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Videos ({videos.length})
            </button>
            <button
              onClick={() => setActiveTab('upload')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'upload'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Upload Video
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className="mt-6">
          {activeTab === 'users' && <UserManagement />}
          {activeTab === 'videos' && (
            <VideoList videos={videos} onRefresh={loadData} />
          )}
          {activeTab === 'upload' && (
            <UploadVideo onUpload={loadData} />
          )}
        </div>
      </div>
    </div>
  );
}
