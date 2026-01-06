'use client';

import { useEffect, useRef, useState } from 'react';
import ScreenRecordingProtection from './ScreenRecordingProtection';

interface CustomYouTubePlayerProps {
  videoId: string;
  title?: string;
  autoplay?: boolean;
  muted?: boolean;
  controls?: boolean;
  showInfo?: boolean;
}

export default function CustomYouTubePlayer({
  videoId,
  title = "Video Player",
  autoplay = false,
  muted = true,
  controls = false,
  showInfo = false
}: CustomYouTubePlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const playerRef = useRef<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [volume, setVolume] = useState(50);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isMuted, setIsMuted] = useState(muted);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showControls, setShowControls] = useState(true);

  // Extract YouTube video ID from various URL formats
  const extractYouTubeId = (url: string): string => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /^([a-zA-Z0-9_-]{11})$/
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return url; // Return as-is if no pattern matches
  };

  const cleanVideoId = extractYouTubeId(videoId);

  // Load YouTube IFrame API
  useEffect(() => {
    // Load YouTube IFrame API if not already loaded
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      if (firstScriptTag.parentNode) {
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
      }
    }

    // This function creates an <iframe> (and YouTube player) after API code downloads.
    const onYouTubeIframeAPIReady = () => {
      if (playerRef.current) return; // Already initialized

      playerRef.current = new (window as any).YT.Player('youtube-player', {
        height: '100%',
        width: '100%',
        videoId: cleanVideoId,
        playerVars: {
          'modestbranding': 1,
          'showinfo': 0,
          'rel': 0,
          'fs': 0,
          'disablekb': 1,
          'iv_load_policy': 3,
          'cc_load_policy': 0,
          'hl': 'en',
          'color': 'white',
          'theme': 'light',
          'autohide': 1,
          'controls': 0,
          'mute': isMuted ? 1 : 0,
          'autoplay': autoplay ? 1 : 0,
          'loop': 1,
          'playlist': cleanVideoId,
          'origin': window.location.origin,
          'widget_referrer': window.location.href,
          'enablejsapi': 1,
          'widgetid': 1
        },
        events: {
          'onReady': (event: any) => {
            setIsLoading(false);
            setIsPlaying(autoplay);
            setVolume(event.target.getVolume());
            setDuration(event.target.getDuration());
            setCurrentTime(autoplay ? 0 : event.target.getCurrentTime());
          },
          'onStateChange': (event: any) => {
            switch (event.data) {
              case 1: // Playing
                setIsPlaying(true);
                break;
              case 2: // Paused
                setIsPlaying(false);
                break;
              case 0: // Ended
                setIsPlaying(false);
                break;
            }
          },
          'onPlaybackRateChange': (event: any) => {
            setPlaybackSpeed(event.data);
          },
          'onVolumeChange': (event: any) => {
            setVolume(event.data);
            setIsMuted(event.target.isMuted());
          }
        }
      });

      // Update progress every 100ms
      const progressInterval = setInterval(() => {
        if (playerRef.current && playerRef.current.getCurrentTime) {
          const currentTime = playerRef.current.getCurrentTime();
          const duration = playerRef.current.getDuration();
          setCurrentTime(currentTime);
          setDuration(duration);
          setProgress((currentTime / duration) * 100);
        }
      }, 100);

      return () => clearInterval(progressInterval);
    };

    // Set global ready function
    (window as any).onYouTubeIframeAPIReady = onYouTubeIframeAPIReady;

    // If API already loaded, initialize immediately
    if (window.YT && window.YT.Player) {
      onYouTubeIframeAPIReady();
    }

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
    };
  }, [cleanVideoId, autoplay, isMuted]);

  // Prevent right-click and other interactions
  useEffect(() => {
    const preventDefault = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
      return false;
    };

    const preventContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    const preventKeyboard = (e: KeyboardEvent) => {
      // Block common shortcuts that could reveal source
      const blockedKeys = ['F12', 'I', 'J', 'U', 'C', 'P', 'S', 'A'];
      if (blockedKeys.includes(e.key) && (e.ctrlKey || e.metaKey || e.shiftKey)) {
        e.preventDefault();
        return false;
      }
      if (e.key === 'PrintScreen') {
        e.preventDefault();
        navigator.clipboard.writeText('');
        return false;
      }
    };

    const container = containerRef.current;
    const overlay = overlayRef.current;
    
    if (container) {
      container.addEventListener('contextmenu', preventContextMenu);
      container.addEventListener('mousedown', preventDefault);
      container.addEventListener('selectstart', preventDefault);
    }

    if (overlay) {
      overlay.addEventListener('contextmenu', preventContextMenu);
    }

    document.addEventListener('keydown', preventKeyboard);

    return () => {
      if (container) {
        container.removeEventListener('contextmenu', preventContextMenu);
        container.removeEventListener('mousedown', preventDefault);
        container.removeEventListener('selectstart', preventDefault);
      }
      if (overlay) {
        overlay.removeEventListener('contextmenu', preventContextMenu);
      }
      document.removeEventListener('keydown', preventKeyboard);
    };
  }, []);

  // Custom control functions
  const togglePlay = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (playerRef.current) {
      if (isPlaying) {
        playerRef.current.pauseVideo();
      } else {
        playerRef.current.playVideo();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newProgress = parseFloat(e.target.value);
    setProgress(newProgress);
    
    if (playerRef.current && duration > 0) {
      const seekTime = (newProgress / 100) * duration;
      playerRef.current.seekTo(seekTime, true);
      setCurrentTime(seekTime);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseInt(e.target.value);
    setVolume(newVolume);
    
    if (playerRef.current) {
      playerRef.current.setVolume(newVolume);
      if (newVolume > 0 && isMuted) {
        playerRef.current.unMute();
        setIsMuted(false);
      }
    }
  };

  const toggleMute = () => {
    if (playerRef.current) {
      if (isMuted) {
        playerRef.current.unMute();
        setIsMuted(false);
      } else {
        playerRef.current.mute();
        setIsMuted(true);
      }
    }
  };

  const changePlaybackSpeed = () => {
    const speeds = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2];
    const currentIndex = speeds.indexOf(playbackSpeed);
    const nextSpeed = speeds[(currentIndex + 1) % speeds.length];
    setPlaybackSpeed(nextSpeed);
    
    if (playerRef.current) {
      playerRef.current.setPlaybackRate(nextSpeed);
    }
  };

  const skipBackward = () => {
    if (playerRef.current) {
      const newTime = Math.max(0, currentTime - 10);
      playerRef.current.seekTo(newTime, true);
      setCurrentTime(newTime);
    }
  };

  const skipForward = () => {
    if (playerRef.current) {
      const newTime = Math.min(duration, currentTime + 10);
      playerRef.current.seekTo(newTime, true);
      setCurrentTime(newTime);
    }
  };

  const formatTime = (seconds: number): string => {
    if (isNaN(seconds) || !isFinite(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <ScreenRecordingProtection>
      <div className="bg-white rounded-lg shadow-lg p-3 sm:p-4 md:p-6">
        <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-2 sm:mb-3 md:mb-4 select-none line-clamp-2">
          {title}
        </h2>
        
        {/* Custom Video Container */}
        <div 
          ref={containerRef}
          className="relative bg-black rounded-lg overflow-hidden w-full"
          style={{ 
            cursor: 'default',
            paddingBottom: '100%' /* 1:1 aspect ratio - very tall like mobile */
          }}
          onMouseEnter={() => setShowControls(true)}
          onMouseLeave={() => setShowControls(false)}
        >
          {/* YouTube Player Container */}
          <div 
            id="youtube-player"
            className="absolute inset-0 w-full h-full"
            style={{
              pointerEvents: 'none',
              userSelect: 'none',
              WebkitUserSelect: 'none',
              MozUserSelect: 'none',
              msUserSelect: 'none'
            }}
          />

          {/* Loading Overlay */}
          {isLoading && (
            <div className="absolute inset-0 bg-black flex items-center justify-center z-20">
              <div className="text-white text-center">
                <div className="animate-spin rounded-full h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 border-b-2 border-white mx-auto mb-2"></div>
                <p className="text-xs sm:text-sm">Loading video...</p>
              </div>
            </div>
          )}

          {/* Transparent Overlay to Prevent Direct Interaction - Only when playing */}
          {isPlaying && (
            <div 
              ref={overlayRef}
              className="absolute inset-0 z-10"
              style={{ 
                background: 'transparent',
                pointerEvents: 'auto'
              }}
            />
          )}

          {/* Custom Controls Overlay */}
          {!controls && (
            <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2 sm:p-3 md:p-4 z-30 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
              {/* Progress Bar */}
              <div className="mb-2 sm:mb-3">
                <div className="relative">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={progress}
                    onChange={handleProgressChange}
                    className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
                    style={{ pointerEvents: 'auto' }}
                  />
                </div>
                <div className="flex justify-between text-xs text-white mt-1">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              {/* Control Buttons */}
              <div className="flex items-center justify-between">
                {/* Left Controls */}
                <div className="flex items-center space-x-1 sm:space-x-2">
                  {/* Play/Pause Button */}
                  <button
                    onClick={togglePlay}
                    className="bg-white/20 hover:bg-white/30 text-white rounded-full p-1.5 sm:p-2 backdrop-blur-sm transition-all"
                    aria-label={isPlaying ? 'Pause' : 'Play'}
                    style={{ pointerEvents: 'auto' }}
                  >
                    {isPlaying ? (
                      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                      </svg>
                    ) : (
                      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                    )}
                  </button>

                  {/* Skip Backward */}
                  <button
                    onClick={skipBackward}
                    className="bg-white/20 hover:bg-white/30 text-white rounded-full p-1.5 sm:p-2 backdrop-blur-sm transition-all hidden sm:block"
                    aria-label="Skip backward 10s"
                    style={{ pointerEvents: 'auto' }}
                  >
                    <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M11 18V6l-8.5 6 8.5 6zm.5-6l8.5 6V6l-8.5 6z"/>
                    </svg>
                  </button>

                  {/* Skip Forward */}
                  <button
                    onClick={skipForward}
                    className="bg-white/20 hover:bg-white/30 text-white rounded-full p-1.5 sm:p-2 backdrop-blur-sm transition-all hidden sm:block"
                    aria-label="Skip forward 10s"
                    style={{ pointerEvents: 'auto' }}
                  >
                    <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M4 18l8.5-6L4 6v12zm9-12v12l8.5-6L13 6z"/>
                    </svg>
                  </button>

                  {/* Volume Control */}
                  <div className="flex items-center space-x-1 sm:space-x-2">
                    <button
                      onClick={toggleMute}
                      className="bg-white/20 hover:bg-white/30 text-white rounded-full p-1.5 sm:p-2 backdrop-blur-sm transition-all"
                      aria-label={isMuted ? 'Unmute' : 'Mute'}
                      style={{ pointerEvents: 'auto' }}
                    >
                      {isMuted ? (
                        <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
                        </svg>
                      ) : (
                        <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                        </svg>
                      )}
                    </button>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={volume}
                      onChange={handleVolumeChange}
                      className="w-12 sm:w-16 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer hidden sm:block"
                      style={{ pointerEvents: 'auto' }}
                    />
                  </div>
                </div>

                {/* Right Controls */}
                <div className="flex items-center space-x-1 sm:space-x-2">
                  {/* Playback Speed */}
                  <button
                    onClick={changePlaybackSpeed}
                    className="bg-white/20 hover:bg-white/30 text-white text-xs px-1.5 py-1 sm:px-2 sm:py-1 rounded backdrop-blur-sm transition-all"
                    aria-label="Change playback speed"
                    style={{ pointerEvents: 'auto' }}
                  >
                    {playbackSpeed}x
                  </button>

                  {/* Custom Branding */}
                  <div className="bg-black/50 backdrop-blur-sm text-white px-1.5 py-1 sm:px-2 sm:py-1 rounded text-xs">
                    📹
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Top Branding Overlay */}
          <div className="absolute top-2 sm:top-3 md:top-4 left-2 sm:left-3 md:left-4 z-20">
            <div className="bg-black/50 backdrop-blur-sm text-white px-2 py-1 sm:px-3 sm:py-1 rounded-lg text-xs sm:text-sm">
              📹
            </div>
          </div>

          {/* Center Play Overlay when Paused - Clickable */}
          {!isPlaying && !isLoading && (
            <div 
              className="absolute inset-0 flex items-center justify-center z-40"
              style={{ pointerEvents: 'auto' }}
              onClick={togglePlay}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  togglePlay(e);
                }}
                className="bg-black/95 hover:bg-black/90 backdrop-blur-md rounded-full p-4 sm:p-6 md:p-8 lg:p-10 transition-all transform hover:scale-105"
                aria-label="Play video"
                style={{ pointerEvents: 'auto' }}
              >
                <div className="text-white text-center">
                  <div className="mb-1 sm:mb-2 md:mb-3">
                    <svg className="w-8 h-8 sm:w-12 sm:h-12 md:w-16 md:h-16 lg:w-20 lg:h-20 mx-auto" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  </div>
                  <p className="text-xs sm:text-sm font-medium">Play Video</p>
                </div>
              </button>
            </div>
          )}

          {/* Left Side Black Bar - Responsive */}
          <div className="absolute top-0 left-0 bottom-0 w-16 sm:w-20 md:w-24 lg:w-32 xl:w-40 z-20 pointer-events-none bg-black">
          </div>

          {/* Right Side Black Bar - Responsive */}
          <div className="absolute top-0 right-0 bottom-0 w-16 sm:w-20 md:w-24 lg:w-32 xl:w-40 z-20 pointer-events-none bg-black">
          </div>
        </div>

        {/* Custom Video Info */}
        <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-gray-50 rounded-lg">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              {/* <h3 className="font-semibold text-gray-900 text-sm sm:text-base">{title}</h3> */}
              {/* <p className="text-xs sm:text-sm text-gray-600">High quality streaming experience with custom controls</p> */}
            </div>
            <div className="text-xs sm:text-sm text-gray-500">
              {/* HD Quality • {playbackSpeed}x Speed */}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 12px;
          height: 12px;
          background: #ef4444;
          cursor: pointer;
          border-radius: 50%;
        }
        .slider::-moz-range-thumb {
          width: 12px;
          height: 12px;
          background: #ef4444;
          cursor: pointer;
          border-radius: 50%;
          border: none;
        }
        
        @media (min-width: 640px) {
          .slider::-webkit-slider-thumb {
            width: 14px;
            height: 14px;
          }
          .slider::-moz-range-thumb {
            width: 14px;
            height: 14px;
          }
        }
      `}</style>
    </ScreenRecordingProtection>
  );
}

// Add TypeScript declarations for YouTube API
declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: (() => void) | null;
  }
}
