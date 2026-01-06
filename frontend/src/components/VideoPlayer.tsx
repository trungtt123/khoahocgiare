'use client';

import { useEffect, useRef, useState } from 'react';
import ScreenRecordingProtection from './ScreenRecordingProtection';
import CustomYouTubePlayer from './CustomYouTubePlayer';

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
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [videoOrientation, setVideoOrientation] = useState<'landscape' | 'portrait' | 'unknown'>('unknown');

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      const userAgent = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      setIsMobile(userAgent || isTouchDevice);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Check if the video is a YouTube link
  const isYouTubeVideo = (url: string): boolean => {
    const youtubePatterns = [
      /youtube\.com\/watch\?v=/,
      /youtu\.be\//,
      /youtube\.com\/embed\//
    ];
    return youtubePatterns.some(pattern => pattern.test(url));
  };

  // Extract YouTube video ID from URL
  const extractYouTubeId = (url: string): string => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /^([a-zA-Z0-9_-]{11})$/
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return url;
  };

  // Extract video ID from embed code
  const getVideoUrl = () => {
    // Check if it's a YouTube video
    if (video.embedCode && isYouTubeVideo(video.embedCode)) {
      return video.embedCode;
    }
    if (video.abyssVideoId && isYouTubeVideo(video.abyssVideoId)) {
      return video.abyssVideoId;
    }
    
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

  // Check if current video is YouTube
  const currentVideoUrl = getVideoUrl();
  const isCurrentYouTube = isYouTubeVideo(currentVideoUrl);

  // If it's a YouTube video, use the custom player
  if (isCurrentYouTube) {
    const youtubeId = extractYouTubeId(currentVideoUrl);
    return (
      <CustomYouTubePlayer
        videoId={youtubeId}
        title={video.title || `Video ${video.id}`}
        autoplay={false}
        muted={true}
        controls={false}
        showInfo={false}
      />
    );
  }

  // Get responsive container classes based on device and orientation
  const getContainerClasses = () => {
    const baseClasses = "bg-black rounded-lg overflow-hidden relative w-full";
    
    if (isMobile) {
      // On mobile, prioritize full width with appropriate height
      return `${baseClasses} max-w-full mx-auto`;
    }
    
    // On desktop, use more constrained layout
    return `${baseClasses} max-w-4xl mx-auto`;
  };

  // Get responsive iframe classes based on device
  const getIframeClasses = () => {
    const baseClasses = "w-full h-full object-cover";
    
    if (isMobile) {
      // On mobile, use full viewport height for better vertical video experience
      return `${baseClasses} min-h-[60vh] max-h-[80vh]`;
    }
    
    // On desktop, maintain reasonable aspect ratio
    return `${baseClasses} min-h-[400px] max-h-[600px]`;
  };

  // Get container aspect ratio classes
  const getAspectRatioClasses = () => {
    if (isMobile) {
      // On mobile, use a more flexible aspect ratio that works for both orientations
      return "aspect-[9/16] md:aspect-video";
    }
    
    // On desktop, stick with standard video aspect ratio
    return "aspect-video";
  };

  // Otherwise, use the original Abyss.to player
  return (
    <ScreenRecordingProtection>
      <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4 select-none line-clamp-2">
          {video.title || `Video ${video.id}`}
        </h2>
        
        {/* Video container with responsive design */}
        <div ref={containerRef} className={getContainerClasses()}>
          <div className={getAspectRatioClasses()}>
            <iframe
              ref={iframeRef}
              src={currentVideoUrl}
              className={getIframeClasses()}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title={video.title || `Video ${video.id}`}
              onContextMenu={(e) => e.preventDefault()}
              style={{
                // Additional responsive styles
                width: '100%',
                height: '100%',
                border: 'none'
              }}
            />
          </div>
        </div>

      </div>
    </ScreenRecordingProtection>
  );
}
