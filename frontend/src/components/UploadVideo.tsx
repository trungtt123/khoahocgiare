'use client';

import { useState } from 'react';
import { videoAPI } from '@/lib/api';

interface UploadVideoProps {
  onUpload: () => void;
}

export default function UploadVideo({ onUpload }: UploadVideoProps) {
  const [videoUrl, setVideoUrl] = useState('');
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    try {
      // Only accept Abyss.to URL
      const payload = { 
        videoUrl: videoUrl, 
        title: title || undefined 
      };
      
      await videoAPI.upload(payload);
      setSuccess(true);
      setVideoUrl('');
      setTitle('');
      onUpload();
      
      // Reset success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to add video');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Tải Video</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}
        
        {success && (
          <div className="bg-green-50 border border-green-400 text-green-700 px-4 py-3 rounded">
            Video đã được tải lên thành công! Đang xử lý có thể mất vài phút.
          </div>
        )}

        <div>
          <label htmlFor="videoUrl" className="block text-sm font-medium text-gray-700 mb-1">
            Link Video Abyss.to *
          </label>
          <input
            id="videoUrl"
            type="text"
            required
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            placeholder="Bất kỳ link Abyss.to (embed, short link, v.v.)"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
          <p className="mt-1 text-sm text-gray-500">
            Dán bất kỳ link video Abyss.to. Tất cả định dạng được hỗ trợ.
          </p>
        </div>

        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Tiêu đề (tùy chọn)
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Tiêu đề video của tôi"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full px-4 py-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {loading ? 'Đang tải lên...' : 'Tải Video'}
        </button>
      </form>

      <div className="mt-6 p-4 bg-gray-50 rounded-md">
        <h3 className="text-sm font-medium text-gray-900 mb-2">Cách sử dụng:</h3>
        <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
          <li>Truy cập <a href="https://abyss.to" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">abyss.to</a> và tải video của bạn lên</li>
          <li>Sau khi tải xong, sao chép bất kỳ link video (embed, short link, v.v.)</li>
          <li>Dán link vào ô trên</li>
          <li>Nhấn "Tải Video" để lưu vào tài khoản của bạn</li>
        </ol>
        <p className="text-xs text-gray-500 mt-2">
          Lưu ý: Tất cả định dạng link Abyss.to đều được hỗ trợ
        </p>
      </div>
    </div>
  );
}
