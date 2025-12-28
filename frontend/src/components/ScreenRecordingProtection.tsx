'use client';

import { useEffect, useRef } from 'react';

interface ScreenRecordingProtectionProps {
  children: React.ReactNode;
}

export default function ScreenRecordingProtection({ children }: ScreenRecordingProtectionProps) {
  const videoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Prevent screenshots and screen recording
    const preventScreenshot = (e: KeyboardEvent) => {
      // Prevent Print Screen (Windows/Linux/Mac)
      if (e.key === 'PrintScreen') {
        e.preventDefault();
        // Clear clipboard
        navigator.clipboard.writeText('');
        return false;
      }
    };

    // Prevent right-click context menu
    const preventContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    // Prevent text selection
    const preventSelection = (e: Event) => {
      e.preventDefault();
      return false;
    };

    // Prevent drag events
    const preventDrag = (e: DragEvent) => {
      e.preventDefault();
      return false;
    };

    // Detect developer tools and screen recording software
    const detectDevTools = () => {
      // const threshold = 160;
      // if (window.outerHeight - window.innerHeight > threshold || 
      //     window.outerWidth - window.innerWidth > threshold) {
      //   // Developer tools might be open
      //   document.body.style.display = 'none';
      //   setTimeout(() => {
      //     alert('Developer tools are not allowed on this page.');
      //     window.location.reload();
      //   }, 100);
      // }
    };

    // Detect screen recording apps (basic detection)
    const detectScreenRecording = () => {
      // Check for common screen recording indicators
      const indicators = [
        'ScreenRecorder',
        'OBS',
        'Camtasia',
        'Snagit',
        'Bandicam',
        ' Screencast',
        'RecordMyScreen',
        'Loom'
      ];

      // Check window titles and processes (limited in browser)
      indicators.forEach(indicator => {
        if (window.document.title.includes(indicator)) {
          document.body.innerHTML = '<h1>Screen recording detected. Please close recording software.</h1>';
          return false;
        }
      });
    };

    // Disable right-click on video container
    const preventVideoContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      return false;
    };

    // Add event listeners
    document.addEventListener('keydown', preventScreenshot);
    document.addEventListener('contextmenu', preventContextMenu);
    document.addEventListener('selectstart', preventSelection);
    document.addEventListener('dragstart', preventDrag);
    
    // Add specific protection to video container
    if (videoRef.current) {
      videoRef.current.addEventListener('contextmenu', preventVideoContextMenu);
    }

    // Periodic checks
    const intervalId = setInterval(() => {
      detectDevTools();
      detectScreenRecording();
    }, 1000);

    // Add CSS to prevent text selection and printing
    const style = document.createElement('style');
    style.textContent = `
      * {
        -webkit-user-select: none !important;
        -moz-user-select: none !important;
        -ms-user-select: none !important;
        user-select: none !important;
        -webkit-touch-callout: none !important;
        -webkit-tap-highlight-color: transparent !important;
      }
      
      body {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      
      @media print {
        body * {
          display: none !important;
        }
        body::after {
          content: "Screenshots and printing are disabled." !important;
          display: block !important;
          text-align: center !important;
          font-size: 24px !important;
          color: #000 !important;
          background: #fff !important;
          padding: 50px !important;
        }
      }
      
      iframe {
        pointer-events: auto !important;
      }
    `;
    document.head.appendChild(style);

    // Add watermark overlay
    const watermark = document.createElement('div');
    watermark.id = 'watermark';
    watermark.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 9999;
      background: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><text x="50%" y="50%" font-family="Arial" font-size="20" fill="rgba(0,0,0,0.1)" text-anchor="middle" dy=".3em">Protected Content</text></svg>') repeat;
      animation: watermarkMove 20s linear infinite;
    `;
    document.body.appendChild(watermark);

    // Add CSS animation for watermark
    const animationStyle = document.createElement('style');
    animationStyle.textContent = `
      @keyframes watermarkMove {
        0% { transform: translate(0, 0); }
        25% { transform: translate(-50px, -50px); }
        50% { transform: translate(50px, -50px); }
        75% { transform: translate(-50px, 50px); }
        100% { transform: translate(0, 0); }
      }
    `;
    document.head.appendChild(animationStyle);

    // Cleanup function
    return () => {
      document.removeEventListener('keydown', preventScreenshot);
      document.removeEventListener('contextmenu', preventContextMenu);
      document.removeEventListener('selectstart', preventSelection);
      document.removeEventListener('dragstart', preventDrag);
      
      if (videoRef.current) {
        videoRef.current.removeEventListener('contextmenu', preventVideoContextMenu);
      }
      
      clearInterval(intervalId);
      
      // Remove styles
      const styles = document.querySelectorAll('style');
      styles.forEach(s => {
        if (s.textContent?.includes('user-select: none') || 
            s.textContent?.includes('watermarkMove')) {
          s.remove();
        }
      });
      
      // Remove watermark
      const watermarkEl = document.getElementById('watermark');
      if (watermarkEl) {
        watermarkEl.remove();
      }
    };
  }, []);

  // Add mobile-specific protections
  useEffect(() => {
    // Disable long press on mobile
    const preventLongPress = (e: TouchEvent) => {
      if (e.touches.length > 1) {
        e.preventDefault();
        return false;
      }
    };

    // Prevent zoom gestures
    const preventZoom = (e: TouchEvent) => {
      if (e.touches.length > 1) {
        e.preventDefault();
        return false;
      }
    };

    document.addEventListener('touchstart', preventLongPress);
    document.addEventListener('touchmove', preventZoom);

    return () => {
      document.removeEventListener('touchstart', preventLongPress);
      document.removeEventListener('touchmove', preventZoom);
    };
  }, []);

  return (
    <div ref={videoRef} className="relative">
      {children}
      <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
        🔒 Protected
      </div>
    </div>
  );
}
