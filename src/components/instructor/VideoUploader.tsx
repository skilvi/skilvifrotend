import React, { useCallback, useState, useImperativeHandle, forwardRef } from 'react';
import { instructorApi } from '@/lib/api/instructor';
import axios from 'axios';

interface VideoUploaderProps {
  lectureId?: string;
  courseId?: string;
  sectionId?: string;
  type: 'lecture' | 'promo';
  onSuccess: (assetInfo?: any) => void;
}

export interface VideoUploaderHandle {
  startUpload: () => Promise<void>;
  hasFile: boolean;
  status: 'idle' | 'uploading' | 'processing' | 'done' | 'error';
}

export const VideoUploader = forwardRef<VideoUploaderHandle, VideoUploaderProps>(({ 
  lectureId, courseId, sectionId, type, onSuccess 
}, ref) => {
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'processing' | 'done' | 'error'>('idle');
  const [errorDetails, setErrorDetails] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const startUpload = async () => {
    if (!file) return;
    setStatus('uploading');
    setProgress(0);
    setErrorDetails('');

    try {
      let uploadUrlData;
      
      // Step 1: Get presigned URL
      if (type === 'lecture' && lectureId) {
        const res: any = await instructorApi.getVideoUploadUrl(lectureId, file.name, file.type || 'video/mp4');
        uploadUrlData = res.data;
      } else if (type === 'promo' && courseId) {
        const res: any = await instructorApi.getPromoUploadUrl(courseId, file.name, file.type || 'video/mp4');
        uploadUrlData = res.data;
      } else {
        throw new Error('Missing ID for upload type');
      }

      const { uploadUrl, s3Key } = uploadUrlData;

      // Step 2: Upload to S3 directly tracking progress using Axios
      if (uploadUrl.includes('mock-s3.example.com')) {
        // Simulate upload for dev environments without S3
        for (let i = 10; i <= 100; i += 20) {
          setProgress(i);
          await new Promise(r => setTimeout(r, 200));
        }
      } else {
        await axios.put(uploadUrl, file, {
          headers: { 'Content-Type': file.type || 'video/mp4' },
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              setProgress(percentCompleted);
            }
          }
        });
      }

      setStatus('processing');
      
      // EmberQuest ENHANCEMENT: Extract duration from video file before confirmation
      let durationSeconds = 0;
      try {
        durationSeconds = await new Promise<number>((resolve) => {
          const video = document.createElement('video');
          video.preload = 'metadata';
          video.onloadedmetadata = () => {
            window.URL.revokeObjectURL(video.src);
            resolve(Math.round(video.duration));
          };
          video.onerror = () => resolve(0);
          video.src = URL.createObjectURL(file);
        });
      } catch (e) {
        console.warn('Failed to extract video duration', e);
      }

      // Step 3: Confirm with backend
      if (type === 'lecture' && lectureId) {
        const confirmRes: any = await instructorApi.confirmVideoUpload({
          lectureId,
          s3Key,
          originalName: file.name,
          mimeType: file.type,
          sizeBytes: file.size,
          durationSeconds, // Pass extracted duration
        });
        
        // Link the asset to the lecture
        await instructorApi.attachVideoToLecture(courseId as string, sectionId as string, lectureId, s3Key);

        setStatus('done');
        onSuccess(confirmRes.data);
      } else if (type === 'promo') {
        setStatus('done');
        onSuccess({ s3Key });
      }
      
    } catch (e: any) {
      console.error(e);
      setStatus('error');
      setErrorDetails(e.message || 'Upload failed');
      throw e; // Important so parent can catch error in auto-upload flow
    }
  };

  useImperativeHandle(ref, () => ({
    startUpload,
    hasFile: !!file,
    status
  }));

  return (
    <div className="border border-slate-200 dark:border-slate-800 border-dashed rounded-xl p-6 bg-slate-50 dark:bg-slate-800/50 text-center">
      {status === 'idle' && (
        <>
          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
             <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
             </svg>
          </div>
          <input type="file" accept="video/mp4,video/webm" className="hidden" id={`vid-upload-${lectureId||courseId}`} onChange={handleFileChange} />
          <label htmlFor={`vid-upload-${lectureId||courseId}`} className="cursor-pointer block">
            <span className="font-semibold text-blue-600 hover:text-blue-700">Choose a video file</span>
            <span className="text-slate-500 block text-sm mt-1">MP4 or WebM up to 2GB</span>
          </label>
          
          {file && (
            <div className="mt-4 p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg flex items-center justify-between">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">{file.name}</span>
              <button onClick={startUpload} className="px-4 py-1.5 bg-slate-900 text-white font-semibold text-sm rounded-md hover:bg-slate-800">
                Upload
              </button>
            </div>
          )}
        </>
      )}

      {status === 'uploading' && (
        <div className="py-4">
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Uploading ({progress}%)</p>
          <div className="w-full bg-slate-200 rounded-full h-2.5 mb-2">
            <div className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
          </div>
          <p className="text-[10px] text-slate-500 uppercase font-bold">Do not close this panel</p>
        </div>
      )}

      {status === 'processing' && (
        <div className="py-4 flex flex-col items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Finalizing attachment...</p>
          <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold">Saving to curriculum</p>
        </div>
      )}

      {status === 'done' && (
        <div className="py-4 text-emerald-600 flex flex-col items-center animate-in fade-in zoom-in duration-300">
          <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mb-2">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="font-bold">Upload Successful!</p>
        </div>
      )}

      {status === 'error' && (
         <div className="py-4 text-red-600 flex flex-col items-center">
            <svg className="w-12 h-12 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="font-semibold">Upload failed</p>
            <p className="text-xs mt-1">{errorDetails}</p>
            <button onClick={() => setStatus('idle')} className="mt-3 text-sm text-slate-600 dark:text-slate-400 underline hover:text-slate-900 dark:text-slate-50">Try again</button>
         </div>
      )}
    </div>
  );
});

VideoUploader.displayName = 'VideoUploader';
