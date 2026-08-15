'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useInstructorStore } from '@/store/useInstructorStore';
import { instructorApi } from '@/lib/api/instructor';
import axios from 'axios';
import { Image as ImageIcon, Upload, X, CheckCircle2 } from 'lucide-react';

export default function NewCoursePage() {
  const router = useRouter();
  const { createCourse, updateCourse } = useInstructorStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string>(''); // For progress display

  const [title, setTitle] = useState('');
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setThumbnailFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const removeFile = () => {
    setThumbnailFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return alert('Title is required');

    setIsSubmitting(true);
    try {
      // 1. Create the Course record (Title only for now)
      setUploadStatus('Initializing course record...');
      const course = await createCourse({
        title: title.trim(),
        category: 'Technology',
        price: 0,
        language: 'en',
        level: 'all_levels'
      });

      // 2. Upload Thumbnail if selected
      if (thumbnailFile) {
        setUploadStatus('Requesting secure S3 channel...');
        const uploadRes: any = await instructorApi.getThumbnailUploadUrl(course.id, thumbnailFile.name);
        const { uploadUrl, s3Key } = uploadRes.data;

        setUploadStatus('Uploading high-fidelity media...');
        await axios.put(uploadUrl, thumbnailFile, {
          headers: { 'Content-Type': thumbnailFile.type || 'image/jpeg' },
        });

        // 3. Final Sync — Register the S3 URL in the course record
        setUploadStatus('Synchronizing visual identity...');
        // Formation of the final URL: https://{bucket}.s3.{region}.amazonaws.com/{s3Key}
        const finalUrl = `https://emberquestvideodata.s3.ap-south-1.amazonaws.com/${s3Key}`;
        await updateCourse(course.id, { 
          thumbnailS3Key: s3Key, 
          thumbnailUrl: finalUrl 
        });
      }

      setUploadStatus('Complete! Finalizing workspace...');
      setTimeout(() => {
        router.push(`/instructor/courses/${course.id}/edit`);
      }, 500);
    } catch (err: any) {
      alert(err.message || 'Failed to create course');
      setUploadStatus('');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto py-20 px-4">
      <div className="bg-white dark:bg-slate-900 p-10 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-[0_30px_70px_rgba(0,0,0,0.1)] relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600" />
        
        <h1 className="text-4xl font-black text-slate-900 dark:text-slate-50 tracking-tighter mb-2 leading-tight">Create Workspace</h1>
        <p className="text-slate-500 mb-10 text-lg font-medium">Define your course title and brand identity.</p>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-3">
            <label className="block text-[10px] uppercase font-black tracking-[0.2em] text-slate-400 ml-1">Operational Title</label>
            <input
              disabled={isSubmitting}
              autoFocus
              type="text"
              className="w-full border-2 border-slate-100 dark:border-slate-800/50 bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-5 text-xl font-black text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all placeholder:text-slate-300"
              placeholder="e.g. Master NestJS Architecture"
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="space-y-3">
            <label className="block text-[10px] uppercase font-black tracking-[0.2em] text-slate-400 ml-1">Brand Thumbnail (Upload only)</label>
            
            {previewUrl ? (
              <div className="relative group aspect-video rounded-3xl overflow-hidden border-2 border-slate-100 dark:border-slate-800/50 shadow-inner">
                <img src={previewUrl} alt="Thumbnail preview" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center backdrop-blur-sm">
                   <button 
                     type="button" 
                     onClick={removeFile}
                     className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 p-3 rounded-full shadow-2xl hover:bg-red-50 hover:text-red-600 transition-all active:scale-90"
                   >
                     <X className="w-6 h-6" />
                   </button>
                </div>
              </div>
            ) : (
              <div 
                onClick={() => !isSubmitting && fileInputRef.current?.click()}
                className="cursor-pointer group aspect-video rounded-3xl border-3 border-dashed border-slate-100 dark:border-slate-800/50 bg-slate-50 dark:bg-slate-800/50/50 hover:bg-white dark:bg-slate-900 hover:border-blue-400 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500 flex flex-col items-center justify-center gap-4"
              >
                 <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800/50 group-hover:bg-blue-600 group-hover:text-white transition duration-500">
                    <Upload className="w-8 h-8 text-slate-400 group-hover:text-white transition duration-500" />
                 </div>
                 <div className="text-center">
                    <p className="text-sm font-black text-slate-800 dark:text-slate-200 uppercase tracking-tighter">Click to Select Thumbnail</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">16:9 Aspect Ratio recommended</p>
                 </div>
                 <input 
                   type="file" 
                   ref={fileInputRef} 
                   onChange={handleFileChange} 
                   className="hidden" 
                   accept="image/jpeg,image/png,image/webp" 
                 />
              </div>
            )}
          </div>

          <div className="pt-6 flex flex-col gap-4">
            <button
              type="submit"
              disabled={isSubmitting || !title.trim()}
              className="w-full relative py-5 rounded-2xl bg-blue-600 text-white font-black text-lg hover:bg-blue-700 transition transform hover:-translate-y-1 active:scale-95 shadow-[0_20px_50px_rgba(37,99,235,0.3)] disabled:opacity-50 disabled:transform-none overflow-hidden"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center gap-3">
                   <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                   <span>{uploadStatus}</span>
                </div>
              ) : (
                'Create Course & Continue'
              )}
            </button>
            
            <button
              type="button"
              onClick={() => router.back()}
              className="w-full py-4 text-slate-400 font-black text-[10px] uppercase tracking-widest hover:text-slate-800 dark:text-slate-200 transition"
              disabled={isSubmitting}
            >
              Wait, take me back
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
