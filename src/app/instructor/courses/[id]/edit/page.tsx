'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useInstructorStore } from '@/store/useInstructorStore';
import { ImageUploader } from '@/components/instructor/ImageUploader';
import { VideoUploader } from '@/components/instructor/VideoUploader';
import { CourseStatusBadge } from '@/components/instructor/CourseStatusBadge';
import { toast } from 'react-hot-toast';

export default function EditCoursePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { currentCourse, fetchCourseForEdit, updateCourse, publishCourse, unpublishCourse } = useInstructorStore();
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    description: '',
    category: '',
    price: 0,
    discountedPrice: 0,
    partialAmount: 499,
    language: 'en',
    level: 'all_levels',
    objectives: '',
    requirements: '',
    targetAudience: '',
    instructorBio: '',
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchCourseForEdit(params.id);
  }, [params.id, fetchCourseForEdit]);

  useEffect(() => {
    if (currentCourse) {
      setFormData({
        title: currentCourse.title || '',
        subtitle: (currentCourse as any).subtitle || '',
        description: currentCourse.description || '',
        category: currentCourse.metadata?.category || '',
        price: currentCourse.price || 0,
        discountedPrice: currentCourse.discountedPrice || 0,
        partialAmount: currentCourse.partialAmount || 499,
        language: currentCourse.language || 'en',
        level: currentCourse.level || 'all_levels',
        objectives: (currentCourse.metadata?.objectives || []).join('\n'),
        requirements: (currentCourse.metadata?.requirements || []).join('\n'),
        targetAudience: (currentCourse.metadata?.targetAudience || []).join('\n'),
        instructorBio: currentCourse.metadata?.instructorBio || '',
      });
    }
  }, [currentCourse]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      // Parse bullet-line fields into arrays
      const parseLines = (s: string) => s.split('\n').map(l => l.trim()).filter(Boolean);
      const { objectives, requirements, targetAudience, instructorBio, ...restData } = formData;
      await updateCourse(params.id, {
        ...restData,
        metadata: {
          ...(currentCourse?.metadata || {}),
          category: formData.category,
          objectives: parseLines(formData.objectives),
          requirements: parseLines(formData.requirements),
          targetAudience: parseLines(formData.targetAudience),
          instructorBio: formData.instructorBio,
        },
      });
      toast.success('Course info updated successfully!');
    } catch (e: any) {
      toast.error(e.message || 'Failed to save changes');
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageSuccess = async (s3Key: string, previewUrl: string) => {
    try {
      await updateCourse(params.id, { thumbnailS3Key: s3Key });
    } catch (e) {
      console.error(e);
    }
  };

  const handlePromoSuccess = async (assetInfo: any) => {
    try {
      await updateCourse(params.id, { promoVideoS3Key: assetInfo.s3Key });
    } catch (e) {
      console.error('Failed to attach promo video', e);
    }
  };

  if (!currentCourse) return <div className="p-10 animate-pulse">Loading course data...</div>;

  return (
    <div className="max-w-4xl mx-auto pb-20">
      
      {/* Header Actions */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <button onClick={() => router.push('/instructor/courses')} className="w-8 h-8 flex items-center justify-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm rounded-full text-slate-500 hover:text-slate-900 dark:text-slate-50 transition">
             &larr;
          </button>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50 tracking-tight">Manage Course</h1>
          <CourseStatusBadge status={currentCourse.status} />
        </div>
        
        <div className="flex gap-3">
          <Link href={`/instructor/courses/${params.id}/curriculum`} className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold rounded-lg hover:bg-slate-200 transition">
            Curriculum Builder
          </Link>
          <Link href={`/instructor/courses/${params.id}/coupons`} className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold rounded-lg hover:bg-slate-200 transition">
            Manage Coupons
          </Link>
          <Link href={`/instructor/courses/${params.id}/announcements`} className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold rounded-lg hover:bg-slate-200 transition">
            Announcements
          </Link>
          
          {currentCourse.status === 'draft' ? (
             <button 
               onClick={async () => {
                 try {
                   await publishCourse(params.id);
                   toast.success('Course published successfully!');
                 } catch (e: any) {
                   toast.error(
                     `${e.message}. Hint: Go to Curriculum Builder to add content!`,
                     { duration: 5000 }
                   );
                 }
               }} 
               className="px-4 py-2 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 shadow shadow-emerald-600/20 transition"
             >
               Publish Course
             </button>
          ) : (
             <button 
               onClick={async () => {
                 try {
                   await unpublishCourse(params.id);
                   toast.success('Course moved back to draft.');
                 } catch (e: any) {
                   toast.error(e.message);
                 }
               }} 
               className="px-4 py-2 bg-amber-100 text-amber-700 font-semibold rounded-lg hover:bg-amber-200 transition border border-amber-200"
             >
               Unpublish
             </button>
          )}
        </div>
      </div>

      <div className="flex gap-6">
        {/* Main Form */}
        <div className="flex-1 space-y-6">
          <form id="edit-form" onSubmit={handleSave} className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Course Title</label>
              <input type="text" className="w-full border border-slate-300 dark:border-slate-700 rounded-lg p-2.5" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Subtitle (Optional)</label>
              <input type="text" className="w-full border border-slate-300 dark:border-slate-700 rounded-lg p-2.5" value={formData.subtitle} onChange={e => setFormData({...formData, subtitle: e.target.value})} placeholder="A catchy tagline for your course" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Description (Markdown supported)</label>
              <textarea className="w-full border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 min-h-[150px]" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
            </div>

            <div className="grid grid-cols-3 gap-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Category</label>
                <select className="w-full border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 bg-white dark:bg-slate-900" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                  <option value="Technology">Technology</option>
                  <option value="Business">Business</option>
                  <option value="Design">Design</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Personal Development">Personal Development</option>
                  <option value="Competative">Competative Exam</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Regular Price (INR ₹)</label>
                <input type="number" step="0.01" className="w-full border border-slate-300 dark:border-slate-700 rounded-lg p-2.5" value={formData.price} onChange={e => setFormData({...formData, price: parseFloat(e.target.value) || 0})} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Partial Amount (INR ₹)</label>
                <input type="number" step="1" className="w-full border border-slate-300 dark:border-slate-700 rounded-lg p-2.5" value={formData.partialAmount} onChange={e => setFormData({...formData, partialAmount: parseInt(e.target.value) || 0})} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Discounted Price (Optional)</label>
                <div className="relative">
                  <input type="number" step="0.01" className="w-full border border-slate-300 dark:border-slate-700 rounded-lg p-2.5" value={formData.discountedPrice} onChange={e => setFormData({...formData, discountedPrice: parseFloat(e.target.value) || 0})} />
                  {formData.price > 0 && formData.discountedPrice > 0 && formData.discountedPrice < formData.price && (
                    <div className="absolute right-3 top-2.5 px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-black rounded uppercase tracking-tighter">
                      Save {Math.round(((formData.price - formData.discountedPrice) / formData.price) * 100)}%
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Level</label>
                <select className="w-full border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 bg-white dark:bg-slate-900" value={formData.level} onChange={e => setFormData({...formData, level: e.target.value})}>
                  <option value="all_levels">All Levels</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Language</label>
                <select className="w-full border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 bg-white dark:bg-slate-900" value={formData.language} onChange={e => setFormData({...formData, language: e.target.value})}>
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="de">German</option>
                </select>
              </div>
            </div>
            
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800/50">
               <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 mb-4">What Students Will Learn</h3>
               <textarea
                 className="w-full border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 min-h-[100px] text-sm font-mono"
                 value={formData.objectives}
                 onChange={e => setFormData({...formData, objectives: e.target.value})}
                 placeholder="Enter each learning outcome on a new line:\nBuild production-ready REST APIs\nMaster TypeScript generics\nDeploy with Docker"
               />
               <p className="text-xs text-slate-400 mt-1">One item per line. These show as checkboxes on the course page.</p>
            </div>

            <div>
               <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 mb-4">Requirements / Prerequisites</h3>
               <textarea
                 className="w-full border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 min-h-[80px] text-sm font-mono"
                 value={formData.requirements}
                 onChange={e => setFormData({...formData, requirements: e.target.value})}
                 placeholder="Basic JavaScript knowledge\nNode.js installed\nA code editor"
               />
               <p className="text-xs text-slate-400 mt-1">One requirement per line.</p>
            </div>

            <div>
               <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 mb-4">Who This Course Is For</h3>
               <textarea
                 className="w-full border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 min-h-[80px] text-sm font-mono"
                 value={formData.targetAudience}
                 onChange={e => setFormData({...formData, targetAudience: e.target.value})}
                 placeholder="Beginners learning web development\nJunior developers wanting to specialize"
               />
               <p className="text-xs text-slate-400 mt-1">One audience segment per line.</p>
            </div>

            <div>
               <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 mb-4">Instructor Bio</h3>
               <textarea
                 className="w-full border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 min-h-[100px]"
                 value={formData.instructorBio}
                 onChange={e => setFormData({...formData, instructorBio: e.target.value})}
                 placeholder="Write a short bio about yourself — your experience, background, and why students should learn from you."
               />
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800/50 flex justify-end">
               <button type="submit" form="edit-form" disabled={isSaving} className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 shadow-md transition disabled:opacity-50">
                 {isSaving ? 'Saving...' : 'Save Changes'}
               </button>
            </div>
           </form>

          {/* Media Sections */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-50 mb-4 border-b border-slate-100 dark:border-slate-800/50 pb-2">Course Image</h2>
            <ImageUploader courseId={params.id} currentPreviewUrl={currentCourse.thumbnailUrl} onSuccess={handleImageSuccess} />
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-50 mb-4 border-b border-slate-100 dark:border-slate-800/50 pb-2">Promotional Video</h2>
            {currentCourse.promoVideoS3Key ? (
               <div className="p-4 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg flex items-center justify-between">
                 <span className="font-medium">Promo Video Uploaded</span>
                 <button onClick={() => updateCourse(params.id, { promoVideoS3Key: null })} className="text-sm font-semibold text-red-600 hover:underline">Remove</button>
               </div>
            ) : (
               <VideoUploader courseId={params.id} type="promo" onSuccess={handlePromoSuccess} />
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
