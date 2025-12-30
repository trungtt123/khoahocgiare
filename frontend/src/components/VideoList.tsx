'use client';

import { useState } from 'react';
import { videoAPI } from '@/lib/api';
import VideoPlayer from './VideoPlayer';

interface Video {
  id: number;
  abyssVideoId: string;
  embedCode: string;
  title: string | null;
  createdAt: string;
}

interface VideoListProps {
  videos: Video[];
  onRefresh: () => void;
}

export default function VideoList({ videos, onRefresh }: VideoListProps) {
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [editingVideo, setEditingVideo] = useState<Video | null>(null);
  const [editForm, setEditForm] = useState({ title: '', videoUrl: '' });
  const [updating, setUpdating] = useState(false);

  const handleDelete = async (videoId: number) => {
    if (!confirm('Are you sure you want to delete this video?')) {
      return;
    }

    setDeleting(videoId);
    try {
      await videoAPI.delete(videoId);
      onRefresh();
    } catch (error) {
      console.error('Failed to delete video:', error);
      alert('Failed to delete video');
    } finally {
      setDeleting(null);
    }
  };

  const handleEdit = (video: Video) => {
    setEditingVideo(video);
    setEditForm({
      title: video.title || '',
      videoUrl: video.embedCode
    });
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVideo) return;

    setUpdating(true);
    try {
      await videoAPI.update(editingVideo.id, editForm);
      onRefresh();
      setEditingVideo(null);
      setEditForm({ title: '', videoUrl: '' });
    } catch (error: any) {
      console.error('Failed to update video:', error);
      alert(error.response?.data?.error || 'Failed to update video');
    } finally {
      setUpdating(false);
    }
  };

  const cancelEdit = () => {
    setEditingVideo(null);
    setEditForm({ title: '', videoUrl: '' });
  };

  if (videos.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No videos yet. Upload your first video!</p>
      </div>
    );
  }

  return (
    <div>
      {selectedVideo ? (
        <div>
          <button
            onClick={() => setSelectedVideo(null)}
            className="mb-4 text-sm text-indigo-600 hover:text-indigo-500"
          >
            ← Back to list
          </button>
          <VideoPlayer video={selectedVideo} />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {videos.map((video) => (
            <div
              key={video.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="aspect-[9/16] sm:aspect-video bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <svg className="w-12 h-12 sm:w-16 sm:h-16 text-white opacity-80" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="p-4">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                  {video.title || `Video ${video.id}`}
                </h3>
                <p className="text-xs sm:text-sm text-gray-500 mb-4">
                  {new Date(video.createdAt).toLocaleDateString()}
                </p>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <button
                    onClick={() => setSelectedVideo(video)}
                    className="flex-1 px-3 py-2 text-xs sm:text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
                  >
                    Watch
                  </button>
                  <button
                    onClick={() => handleEdit(video)}
                    className="px-3 py-2 text-xs sm:text-sm font-medium text-white bg-yellow-600 rounded-md hover:bg-yellow-700"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(video.id)}
                    disabled={deleting === video.id}
                    className="px-3 py-2 text-xs sm:text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50"
                  >
                    {deleting === video.id ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {editingVideo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Edit Video
            </h2>
            
            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label htmlFor="videoUrl" className="block text-sm font-medium text-gray-700 mb-1">
                  Abyss.to Video Link *
                </label>
                <input
                  id="videoUrl"
                  type="text"
                  required
                  value={editForm.videoUrl}
                  onChange={(e) => setEditForm({ ...editForm, videoUrl: e.target.value })}
                  placeholder="Any Abyss.to link (embed, short link, etc.)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Paste any Abyss.to video link. All formats are supported.
                </p>
              </div>

              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Title (optional)
                </label>
                <input
                  id="title"
                  type="text"
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  placeholder="My Video Title"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50"
                >
                  {updating ? 'Updating...' : 'Update Video'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
