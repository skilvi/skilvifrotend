'use client';

import React, { useRef, useEffect, useState } from 'react';
import { learningApi } from '@/lib/api/learning';
import { useLearnStore } from '@/store/learnStore';

interface VideoPlayerProps {
  courseId: string;
  lectureId: string;
  resumeFrom: number;
  onComplete: () => void;
  fallbackUrl?: string;
}

export function VideoPlayer({ courseId, lectureId, resumeFrom, onComplete, fallbackUrl }: VideoPlayerProps) {
  const { seekTarget, clearSeek, setCurrentTime, requestSeek } = useLearnStore();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playbackUrl, setPlaybackUrl] = useState<string | null>(null);
  const [watermark, setWatermark] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEnded, setIsEnded] = useState(false);
  const [completionError, setCompletionError] = useState(false); // Bug 22: track handleNext failures
  
  // Anti-Recording states
  const [isObscured, setIsObscured] = useState(false);
  const [watermarkPos, setWatermarkPos] = useState({ top: 25, left: 25, rotate: 12 });

  // 1. Fetch secure playback credentials dynamically
  useEffect(() => {
    let mounted = true;
    const fetchPlayback = async () => {
      try {
        // INSTANT PLAYBACK OPTIMIZATION:
        // If a fallback/direct URL is provided, load it immediately to eliminate the loading spinner.
        if (fallbackUrl) {
          setPlaybackUrl(fallbackUrl);
          setLoading(false);
        } else {
          setLoading(true);
        }
        
        setError(null);
        setIsEnded(false); // Reset on lecture change
        
        const data = await learningApi.getPlaybackUrl(lectureId);
        if (!mounted) return;
        
        // Only update playbackUrl if it's strictly different to avoid interrupting ongoing playback
        if (data.url && data.url !== fallbackUrl) {
          setPlaybackUrl(data.url);
        }
        setWatermark(data.watermark);
      } catch (err: any) {
        console.error("Playback retrieval failure", err);
        if (!mounted) return;
        
        if (fallbackUrl) {
           setPlaybackUrl(fallbackUrl);
        } else {
           // Parse HTTP status for a meaningful error message
           const status = err.response?.status;
           const msg = err.response?.data?.message || err.message || 'Secure playback failed. Please try again.';
           if (status === 429) {
             setError('Too many requests. Please wait a moment, then click “Retry Connection”.');
           } else if (status === 400 || status === 404) {
             setError('No video has been uploaded for this lesson yet.');
           } else if (status === 403) {
             setError('You do not have access to this video. Please complete previous lessons.');
           } else {
             setError(msg);
           }
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchPlayback();

    // EXPLICITLY UNLOAD VIDEO ON LECTURE SWITCH / UNMOUNT
    return () => {
      mounted = false;
      // Keep a reference to the current element since the ref can change by the time cleanup runs
      const player = videoRef.current;
      if (player) {
         player.pause();
         player.removeAttribute('src'); // Instantly cut bandwidth stream
         player.load();
      }
    };
  }, [lectureId, fallbackUrl]);

  // 2. Initialize playback timestamp on mount
  useEffect(() => {
    if (videoRef.current && resumeFrom > 0 && playbackUrl) {
      videoRef.current.currentTime = resumeFrom;
    }
  }, [resumeFrom, playbackUrl]);

  // 3. Handle dynamic seeking
  useEffect(() => {
    if (videoRef.current && typeof seekTarget === 'number') {
      videoRef.current.currentTime = seekTarget;
      videoRef.current.play().catch(e => console.warn(e));
      clearSeek(); // Clear the target after consuming it
    }
  }, [seekTarget, clearSeek]);

  // Throttled time tracker — prevents Zustand storm (was firing ~4x/sec, now max 1/sec)
  const lastTimeUpdateRef = useRef<number>(0);

  // 2. Video Player Anti-Bypass Syncing mechanism
  // Heartbeat every 30s (was 15s) — halves API calls while still being granular enough for anti-bypass
  useEffect(() => {
    // BUG FIX #21: Old heartbeat had no mounted check — setInterval's callback kept
    // running and called learningApi.syncProgress() after unmount/lecture change,
    // creating in-flight requests on a stale lectureId and leaking API calls.
    // Fix: Track mount state inside the effect. Async calls check isMounted before firing.
    let isMounted = true;
    const interval = setInterval(() => {
       const currentTime = videoRef.current?.currentTime || 0;
       if (!isMounted) return; // Don't fire if already unmounted
       if (!videoRef.current?.paused && !videoRef.current?.ended) {
          learningApi.syncProgress(courseId, lectureId, currentTime).catch(err => console.warn(err));
       }
    }, 30000); // 30s interval — was 15s, halving network calls

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [courseId, lectureId]);

  const handleReplay = () => {
    if (videoRef.current) {
        videoRef.current.currentTime = 0;
        videoRef.current.play();
        setIsEnded(false);
    }
  };

  // DRM: Dynamic Watermark Movement
  useEffect(() => {
    if (!watermark) return;
    const interval = setInterval(() => {
       setWatermarkPos({
         top: 10 + Math.random() * 80, // 10% to 90%
         left: 10 + Math.random() * 80, // 10% to 90%
         rotate: -30 + Math.random() * 60, // -30 to +30 degrees
       });
    }, 5000); // move every 5 seconds
    return () => clearInterval(interval);
  }, [watermark]);

  // DRM: Visibility & Focus Obscuration (Blurs video when Snipping Tool opens or window loses focus)
  useEffect(() => {
    const handleBlur = () => setIsObscured(true);
    const handleFocus = () => setIsObscured(false);
    const handleVisibilityChange = () => {
       if (document.hidden) {
          setIsObscured(true);
          videoRef.current?.pause();
       } else {
          setIsObscured(false);
       }
    };

    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
       window.removeEventListener('blur', handleBlur);
       window.removeEventListener('focus', handleFocus);
       document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // 4. Handle Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input or textarea
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)) {
         return;
      }

      const video = videoRef.current;
      if (!video) return;

      // DRM: Aggressive Screenshot Shortcut Blocking
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const isScreenshotShortcut = 
        e.key === 'PrintScreen' || 
        (isMac && e.metaKey && e.shiftKey && ['3','4','5'].includes(e.key)) ||
        (!isMac && e.metaKey && e.shiftKey && e.key.toLowerCase() === 's');

      if (isScreenshotShortcut) {
         e.preventDefault();
         setIsObscured(true);
         // Attempt to clear clipboard (fails silently if permission denied)
         if (navigator.clipboard) {
            navigator.clipboard.writeText('Screenshots are disabled for copyrighted content.').catch(() => {});
         }
         return;
      }

      switch(e.key.toLowerCase()) {
         case ' ':
         case 'k':
            e.preventDefault();
            if (video.paused) video.play();
            else video.pause();
            break;
         case 'f':
            e.preventDefault();
            if (!document.fullscreenElement) {
               video.requestFullscreen().catch(err => console.error(err));
            } else {
               document.exitFullscreen();
            }
            break;
         case 'm':
            e.preventDefault();
            video.muted = !video.muted;
            break;
         case 'arrowleft':
            e.preventDefault();
            video.currentTime = Math.max(0, video.currentTime - 10);
            break;
         case 'arrowright':
            e.preventDefault();
            video.currentTime = Math.min(video.duration || 0, video.currentTime + 10);
            break;
         case 'arrowup':
            e.preventDefault();
            video.volume = Math.min(1, video.volume + 0.1);
            break;
         case 'arrowdown':
            e.preventDefault();
            video.volume = Math.max(0, video.volume - 0.1);
            break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleNext = async () => {
    // BUG FIX #22: Old code called onComplete() optimistically and silently swallowed
    // API errors with console.warn — if completeLecture() failed (network error, 403),
    // the UI showed the next lecture as complete but the DB was never updated.
    // On page reload the user would see the lecture marked incomplete again.
    //
    // Fix: Attempt the API call first. On success, call onComplete() optimistically.
    // On failure, show a visible error with a retry button instead of silent discard.
    setCompletionError(false);
    try {
      await learningApi.completeLecture(courseId, lectureId);
      onComplete();
    } catch (err) {
      console.warn('Lecture completion sync failed:', err);
      setCompletionError(true); // surfaced in UI below
    }
  };

  // BUG FIX #23: retryCount ref was declared outside any useEffect so it
  // persisted its value across lecture changes. After 3 retries on lecture A,
  // retryCount.current was already 3 when lecture B started — the first error
  // on lecture B immediately hit the "Max retries reached" path and showed a
  // permanent error instead of attempting a URL refresh.
  // Fix: Move retryCount inside a useEffect that resets it when lectureId changes.
  const retryCount = useRef(0);
  useEffect(() => {
    retryCount.current = 0; // Reset retry counter on every lecture change
  }, [lectureId]);

  const handleVideoError = async (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    const video = e.currentTarget;
    const errCode = video.error?.code;
    
    // If playbackUrl is falsy, the video has no asset — don't retry, just skip silently
    // (the error state was already set during the initial fetch)
    if (!playbackUrl) return;
    
    // MEDIA_ERR_NETWORK (2) or MEDIA_ERR_SRC_NOT_SUPPORTED (4) often happen on 403 Forbidden S3 Expirations
    if (errCode === 2 || errCode === 4) {
      if (retryCount.current > 3) {
         console.error('Max video retries reached. Stopping to prevent infinite loops.');
         setError("Video failed to load after multiple attempts. The file might be unavailable.");
         return;
      }
      retryCount.current++;
      
      console.warn(`Video stream interrupted (likely URL expiration). Refreshing secure session seamlessly... (Attempt ${retryCount.current})`);
      const currentTime = video.currentTime;
      try {
        setLoading(true);
        // Invalidate cache before retry so we get a fresh signed URL, not the stale one that just failed
        learningApi.invalidatePlaybackCache(lectureId);
        const data = await learningApi.getPlaybackUrl(lectureId, true);
        setPlaybackUrl(data.url);
        requestSeek(currentTime); // Auto-resume from exact spot
      } catch (err: any) {
        const status = err.response?.status;
        if (status === 429) {
          // Don't retry on rate limit — it will only make it worse
          retryCount.current = 99;
          setError('Too many requests. Please wait a moment, then click “Retry Connection”.');
        } else if (status === 400 || status === 404) {
          setError('No video has been uploaded for this lesson yet.');
        } else if (status === 403) {
          setError('You do not have access to this video. Please complete previous lessons.');
        } else {
          setError('Your secure video session expired and could not be refreshed automatically.');
        }
      } finally {
        setLoading(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="w-full aspect-video bg-black rounded-lg flex items-center justify-center">
         <div className="animate-spin h-10 w-10 border-4 border-blue-500 rounded-full border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full aspect-video bg-slate-900 rounded-lg flex flex-col items-center justify-center p-8 text-center border border-red-500/20">
         <div className="text-red-400 mb-4 font-bold">⚠️ Video Unavailable</div>
         <p className="text-slate-400 text-sm max-w-md">{error}</p>
         <button onClick={() => window.location.reload()} className="mt-6 px-4 py-2 bg-slate-800 rounded-lg text-xs font-semibold hover:bg-slate-700 transition">Retry Connection</button>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col justify-center items-center relative overflow-hidden group bg-slate-950 shadow-[inset_0_0_100px_rgba(0,0,0,0.8)]">
       {/* Premium gradient overlay */}
       <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

       {/* Post-Video completion interstitial */}
       {isEnded && (
          <div className="absolute inset-0 z-50 bg-slate-900/90 backdrop-blur-md flex flex-col items-center justify-center animate-in fade-in zoom-in duration-300">
             <div className="bg-blue-600/20 p-4 rounded-full mb-6 ring-1 ring-blue-500/30">
                <svg className="w-12 h-12 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
             </div>
             <h2 className="text-2xl font-bold text-white mb-2">Lecture Completed!</h2>
             <p className="text-slate-400 text-sm mb-8">Ready to move to the next topic?</p>
             
             {/* BUG FIX #22: Surface completion sync errors to the user */}
             {completionError && (
               <div className="mb-4 px-4 py-2 bg-red-500/20 border border-red-500/40 rounded-lg text-red-400 text-sm text-center max-w-sm">
                 ⚠️ Could not save progress. Please check your connection and try again.
               </div>
             )}

             <div className="flex gap-4">
                <button 
                  onClick={handleReplay}
                  className="px-6 py-2.5 rounded-xl bg-slate-800 text-white font-semibold hover:bg-slate-700 transition flex items-center gap-2"
                >
                   <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                   Replay
                </button>
                <button 
                  onClick={handleNext}
                  className="px-8 py-2.5 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-500 shadow-lg shadow-blue-600/30 transition flex items-center gap-2"
                >
                   {completionError ? 'Retry' : 'Next Video'}
                   <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                </button>
             </div>
          </div>
       )}

       {/* Anti-Recording Dynamic Session Watermark Overlay */}
       {watermark && (
         <div 
           className="absolute pointer-events-none z-10 opacity-20 select-none transition-all duration-1000 ease-in-out mix-blend-difference"
           style={{
             top: `${watermarkPos.top}%`,
             left: `${watermarkPos.left}%`,
             transform: `rotate(${watermarkPos.rotate}deg)`,
           }}
         >
            <span className="text-white text-sm font-mono font-bold tracking-tighter block whitespace-nowrap bg-black/30 px-2 py-1 rounded">skilvi.in_{watermark}</span>
         </div>
       )}

       {/* UI Placeholder for Resolution Switcher */}
       <div className="absolute top-4 right-4 z-20 pointer-events-auto opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 text-white/90 text-xs font-semibold flex items-center gap-2 cursor-pointer hover:bg-black/80 transition shadow-lg" title="Auto-switching based on bandwidth">
             <svg className="w-3.5 h-3.5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
             </svg>
             1080p (Auto)
          </div>
       </div>

       <video 
         ref={videoRef}
         src={playbackUrl || ''}
         controls
         controlsList="nodownload" 
         preload="none"
         onError={handleVideoError}
         onContextMenu={e => e.preventDefault()}
         onEnded={() => setIsEnded(true)}
         onTimeUpdate={(e) => {
            const now = Date.now();
            if (now - lastTimeUpdateRef.current >= 1000) {
               lastTimeUpdateRef.current = now;
               setCurrentTime(e.currentTarget.currentTime);
            }
         }}
         disablePictureInPicture
         disableRemotePlayback
         className={`w-full h-full object-contain transition-all duration-75 relative z-0 ${isObscured ? 'blur-xl brightness-50 opacity-0' : 'shadow-2xl'}`}
         autoPlay
       />
    </div>
  );
}
