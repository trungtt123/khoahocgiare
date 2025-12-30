'use client';

import { useEffect, useRef, useState } from 'react';
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
              src={getVideoUrl()}
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

        {/* Mobile optimization indicators */}
        {isMobile && (
          <div className="mt-3 flex items-center justify-center text-xs text-gray-500">
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M7 2a2 2 0 00-2 2v12a2 2 0 002 2h6a2 2 0 002-2V4a2 2 0 00-2-2H7zm3 14a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
            </svg>
            Tối ưu cho thiết bị di động
          </div>
        )}
      </div>
    </ScreenRecordingProtection>
  );
}
