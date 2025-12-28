'use client';

import { useEffect, useRef } from 'react';
import ScreenRecordingProtection from './ScreenRecordingProtection';

interface Video {
  id: number;
  abyssVideoId: string;
  embedCode: string;
  title: string | null;
}

interface VideoPlayerProps {
  video: Video;
}

export default function VideoPlayer({ video }: VideoPlayerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Extract video ID from embed code
  const getVideoUrl = () => {
    // Abyss.to embed format: https://abyss.to/e/{videoId}
    if (video.embedCode) {
      return video.embedCode;
    }
    return `https://abyss.to/e/${video.abyssVideoId}`;
  };

  // Hide sensitive information when not interacting
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Clear sensitive data when tab is not visible
        document.title = 'Protected Video';
      } else {
        // Restore title when tab is visible
        document.title = video.title || `Video ${video.id}`;
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [video]);

  return (
    <ScreenRecordingProtection>
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 select-none">
          {video.title || `Video ${video.id}`}
        </h2>
        <div className="aspect-video bg-black rounded-lg overflow-hidden relative">
          <iframe
            ref={iframeRef}
            src={getVideoUrl()}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title={video.title || `Video ${video.id}`}
            onContextMenu={(e) => e.preventDefault()}
          />
        </div>
        <div className="mt-4 text-sm text-gray-600 select-none">
          <p>🔒 Nội dung này được bảo vệ. Quay phim và chụp màn hình bị vô hiệu hóa.</p>
        </div>
      </div>
    </ScreenRecordingProtection>
  );
}
