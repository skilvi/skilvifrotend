import React, { useState } from 'react';
import { instructorApi } from '@/lib/api/instructor';
import axios from 'axios';

import { convertToWebP } from '@/lib/utils/image-optimizer';

interface ImageUploaderProps {
  courseId: string;
  onSuccess: (s3Key: string, previewUrl: string) => void;
  currentPreviewUrl?: string;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ courseId, onSuccess, currentPreviewUrl }) => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState(currentPreviewUrl);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      
      // Local preview
      const objectUrl = URL.createObjectURL(selected);
      setPreview(objectUrl);

      // Start upload automatically
      setIsUploading(true);
      try {
        // OPTIMIZATION: Convert to WebP before upload
        const optimizedBlob = await convertToWebP(selected, 0.9); // 90% quality
        
        // Prepare the upload using the original name but potentially enforcing .webp
        const fileName = selected.name.replace(/\.[^/.]+$/, "") + ".webp";
        
        const res: any = await instructorApi.getThumbnailUploadUrl(courseId, fileName);
        const { uploadUrl, s3Key } = res.data;

        await axios.put(uploadUrl, optimizedBlob, {
          headers: { 'Content-Type': 'image/webp' },
        });

        // The URL format in S3 bucket (assuming public read for thumbnails, or presigned on fetch). For now pass objectUrl.
        onSuccess(s3Key, objectUrl);
      } catch (err) {
         console.error('Thumbnail upload error', err);
         alert('Failed to optimize or upload thumbnail');
      } finally {
         setIsUploading(false);
      }
    }
  };

  return (
    <div className="flex gap-6 items-start">
      <div className="w-1/2 aspect-video bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden relative group">
        {preview ? (
          <img src={preview} alt="Course thumbnail" className="w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400">
             <svg className="w-10 h-10 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
             </svg>
             <span className="text-sm font-medium">No Thumbnail</span>
          </div>
        )}
        <div className={`absolute inset-0 bg-slate-900/40 flex items-center justify-center ${preview ? 'opacity-0 group-hover:opacity-100' : 'opacity-100'} transition-opacity`}>
          <input type="file" accept="image/jpeg,image/png,image/webp" id="thumb-upload" className="hidden" onChange={handleFileChange} disabled={isUploading}/>
          <label htmlFor="thumb-upload" className="cursor-pointer px-4 py-2 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 text-sm font-semibold rounded-md shadow-sm">
            {isUploading ? 'Uploading...' : 'Upload Image'}
          </label>
        </div>
      </div>
      <div className="flex-1 space-y-2 text-sm text-slate-500 pt-2">
        <p className="font-semibold text-slate-700 dark:text-slate-300">Course Image Requirements</p>
        <p>16:9 ratio is recommended.</p>
        <p>JPEG, PNG, or WEBP.</p>
        <p>Minimum 1280x720 pixels.</p>
      </div>
    </div>
  );
};
