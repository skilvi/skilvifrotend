import React, { useState, useRef } from 'react';
import { VideoUploader, VideoUploaderHandle } from '@/components/instructor/VideoUploader';
import { instructorApi } from '@/lib/api/instructor';
import { MCQBuilderPopup, MCQQuestion } from '@/components/instructor/MCQBuilderPopup';

interface LectureEditorPanelProps {
  courseId: string;
  sectionId: string;
  lecture: any;
  onClose: () => void;
  onUpdate: () => void;
}

export const LectureEditorPanel: React.FC<LectureEditorPanelProps> = ({ courseId, sectionId, lecture, onClose, onUpdate }) => {
  const [formData, setFormData] = useState({
    title: lecture.title || '',
    description: lecture.description || '',
    isPreview: lecture.isPreview || false,
    contentType: lecture.contentType || 'video',
    assignmentMaxScore: lecture.assignment?.maxScore || 100,
    assignmentPassingScore: lecture.assignment?.passingScore || 50,
    assignmentQuestions: lecture.assignment?.questions || [],
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isMCQPopupOpen, setIsMCQPopupOpen] = useState(false);
  const uploaderRef = useRef<VideoUploaderHandle>(null);

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (formData.contentType === 'assignment') {
      if (!formData.assignmentQuestions || formData.assignmentQuestions.length === 0) {
        alert('Please add at least one question to the assignment.');
        return;
      }
    }

    setIsSaving(true);
    try {
      // Logic for Auto-Upload on Save
      if (formData.contentType === 'video' && uploaderRef.current?.hasFile && uploaderRef.current.status !== 'done') {
        try {
          await uploaderRef.current.startUpload();
          // After a successful upload, the VideoUploader calls onSuccess which we handle or we just proceed here
        } catch (uploadErr) {
          // If upload fails, we stop the save process so user can fix it
          setIsSaving(false);
          return;
        }
      }

      await instructorApi.updateLecture(courseId, sectionId, lecture.id, formData);
      onUpdate();
      onClose();
    } catch (e: any) {
      alert(e?.response?.data?.message || 'Failed to save lecture details');
    } finally {
      setIsSaving(false);
    }
  };

  const handleVideoSuccess = () => {
    // This is called by VideoUploader when it finishes its internal flow
    // If we are already in the middle of a "Save", the handleSave function above will continue naturally.
    onUpdate(); 
  };

  return (
    <div className="fixed inset-y-0 right-0 w-full md:w-[500px] bg-white dark:bg-slate-900 shadow-2xl border-l border-slate-200 dark:border-slate-800 z-50 flex flex-col transform transition-transform duration-300">
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
        <h2 className="font-bold text-lg text-slate-800 dark:text-slate-200">Edit Lecture</h2>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:text-slate-400 p-1">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        {/* Info Form */}
        <form id="lecture-form" onSubmit={handleSave} className="space-y-5">
           <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Lecture Title</label>
              <input type="text" className="w-full border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 font-semibold text-slate-800 dark:text-slate-200" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
           </div>

           <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Description (Optional)</label>
              <textarea className="w-full border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 min-h-[100px]" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
           </div>

           <div className="pt-2">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Content Type</label>
              <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                <button
                  type="button"
                  onClick={() => setFormData({...formData, contentType: 'video'})}
                  className={`flex-1 py-1.5 text-sm font-semibold rounded-md transition ${formData.contentType === 'video' ? 'bg-white dark:bg-slate-900 shadow text-slate-800 dark:text-slate-200' : 'text-slate-500 hover:text-slate-700 dark:text-slate-300'}`}
                >
                  Video
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({...formData, contentType: 'assignment'})}
                  className={`flex-1 py-1.5 text-sm font-semibold rounded-md transition ${formData.contentType === 'assignment' ? 'bg-white dark:bg-slate-900 shadow text-slate-800 dark:text-slate-200' : 'text-slate-500 hover:text-slate-700 dark:text-slate-300'}`}
                >
                  Assignment
                </button>
              </div>
           </div>

           <label className="flex items-center gap-3 p-3 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:bg-slate-800/50 cursor-pointer">
              <input type="checkbox" className="w-5 h-5 text-blue-600 rounded" checked={formData.isPreview} onChange={e => setFormData({...formData, isPreview: e.target.checked})} disabled={formData.contentType === 'assignment'} />
              <div>
                 <p className="font-semibold text-slate-800 dark:text-slate-200 text-sm">Free Preview</p>
                 <p className="text-xs text-slate-500">Allow students to watch this without purchasing.</p>
              </div>
           </label>
        </form>

        {/* Content Management */}
        <div className="border-t border-slate-100 dark:border-slate-800/50 pt-6">
           <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-4">{formData.contentType === 'video' ? 'Lecture Video' : 'Assignment Details'}</h3>
           
           {formData.contentType === 'video' ? (
             lecture.videoAsset ? (
               <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-lg flex items-center justify-between">
                 <div className="flex items-center gap-3">
                   <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center">
                     <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                       <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                     </svg>
                   </div>
                   <div>
                     <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 tracking-tight text-wrap break-all pr-2 max-w-[200px]">
                        {lecture.videoAsset.originalName || 'Video Attached'}
                     </p>
                     <p className="text-xs text-emerald-600 font-medium flex items-center gap-1 mt-0.5">
                       <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span> Ready
                     </p>
                   </div>
                 </div>
                 <button type="button" onClick={() => alert('To replace a video, delete the current one or re-upload.')} className="text-xs font-semibold text-blue-600 hover:text-blue-700">Info</button>
               </div>
             ) : (
               <VideoUploader 
                 ref={uploaderRef}
                 courseId={courseId} 
                 sectionId={sectionId} 
                 lectureId={lecture.id} 
                 type="lecture" 
                 onSuccess={handleVideoSuccess} 
               />
             )
           ) : (
             <div className="space-y-4">
                <div className="p-5 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900 relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-indigo-50 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative z-10 flex items-center justify-between">
                     <div>
                       <h4 className="font-bold text-slate-800 dark:text-slate-200">MCQ Configuration</h4>
                       <p className="text-sm text-slate-500 mt-1">
                         {formData.assignmentQuestions.length} Questions | Max Marks: {formData.assignmentMaxScore} | Pass: {formData.assignmentPassingScore} ({formData.assignmentMaxScore > 0 ? Math.round((formData.assignmentPassingScore / formData.assignmentMaxScore) * 100) : 0}%)
                       </p>
                     </div>
                     <button
                       type="button"
                       onClick={() => setIsMCQPopupOpen(true)}
                       className="px-4 py-2 bg-slate-900 text-white text-sm font-semibold rounded-lg hover:bg-slate-800 transition shadow-sm flex items-center gap-2"
                     >
                       <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                       Open Builder
                     </button>
                  </div>
                </div>
             </div>
           )}
        </div>
      </div>

      <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-end gap-3">
         <button onClick={onClose} className="px-5 py-2 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-200 rounded-lg transition" disabled={isSaving}>Cancel</button>
         <button type="submit" form="lecture-form" disabled={isSaving} className="px-5 py-2 text-sm font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50">
           {isSaving ? 'Uploading & Saving...' : 'Save Details'}
         </button>
      </div>

      {/* MCQ Builder Popup */}
      <MCQBuilderPopup 
        isOpen={isMCQPopupOpen} 
        onClose={() => setIsMCQPopupOpen(false)} 
        initialQuestions={formData.assignmentQuestions}
        initialPassingScore={formData.assignmentPassingScore}
        onSave={(questions, passingScore) => {
          setFormData({
            ...formData, 
            assignmentQuestions: questions,
            assignmentPassingScore: passingScore,
            // Calculate max score from questions natively
            assignmentMaxScore: questions.reduce((sum, q) => sum + (q.marks || 0), 0)
          });
          setIsMCQPopupOpen(false);
        }}
      />
    </div>
  );
};
