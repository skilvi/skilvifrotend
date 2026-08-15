'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useInstructorStore } from '@/store/useInstructorStore';
import { instructorApi } from '@/lib/api/instructor';
import { LectureEditorPanel } from './LectureEditorPanel';
import { CourseStatusBadge } from '@/components/instructor/CourseStatusBadge';
import { QuickInputModal } from '@/components/common/QuickInputModal';
import { toast } from 'react-hot-toast';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  defaultDropAnimationSideEffects
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// --- Sortable Components ---

function SortableLecture({ lecture, index, onClick, onDelete }: any) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: `lecture-${lecture.id}` });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const isTemp = lecture.id.toString().startsWith('temp-');

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className={`flex items-center justify-between p-3 bg-white dark:bg-slate-900 border ${(lecture.contentType === 'video' && lecture.videoAsset) || (lecture.contentType === 'assignment' && lecture.assignment?.instructions) || (lecture.contentType === 'assignment' && lecture.assignment?.questions?.length > 0) ? 'border-emerald-200' : 'border-red-200 border-dashed'} rounded-md transition-colors group z-10 relative ${isTemp ? 'opacity-70 pointer-events-none' : 'hover:border-blue-300 cursor-pointer'}`}
      onClick={isTemp ? undefined : onClick}
    >
      <div className="flex items-center gap-3">
        <button {...attributes} {...listeners} disabled={isTemp} className={`p-1 text-slate-400 hover:text-slate-600 dark:text-slate-400 ${isTemp ? 'cursor-not-allowed' : 'cursor-grab'}`} onClick={(e) => e.stopPropagation()}>
           <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" /></svg>
        </button>
        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${lecture.videoAsset || lecture.assignment?.instructions || lecture.assignment?.questions?.length > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'}`}>
          {index + 1}
        </div>
        <span className="font-medium text-slate-700 dark:text-slate-300 group-hover:text-blue-600 transition-colors">{lecture.title}</span>
        {isTemp && <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200 animate-pulse">Saving...</span>}
        {(lecture.assignment?.instructions || lecture.assignment?.questions?.length > 0) && <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">Assignment</span>}
        {lecture.isPreview && <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded border border-amber-200 font-semibold">Preview</span>}
      </div>

      <div className="flex items-center gap-4">
        {lecture.videoAsset ? (
          <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
             <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg> Video attached
          </span>
        ) : (lecture.assignment?.instructions || lecture.assignment?.questions?.length > 0) ? (
          <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
             <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> Assignment ready
          </span>
        ) : (
          <span className="text-xs font-medium text-red-500 whitespace-nowrap bg-red-50 px-2 py-1 rounded">Incomplete</span>
        )}
        <button 
          disabled={isTemp}
          onClick={onDelete} 
          className="p-1 text-slate-300 hover:text-red-500 transition-colors disabled:opacity-50"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
        </button>
      </div>
    </div>
  );
}

function SortableSection({ section, index, onAddLecture, onDeleteLecture, onDeleteSection, setSelectedLecture }: any) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: `section-${section.id}` });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  };

  const isTemp = section.id.toString().startsWith('temp-');

  return (
    <div ref={setNodeRef} style={style} className={`border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 rounded-lg p-1 ${isTemp ? 'opacity-70' : ''}`}>
      <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm rounded-md mb-2">
        <div className="flex items-center gap-3 font-semibold text-slate-800 dark:text-slate-200">
          <button {...attributes} {...listeners} disabled={isTemp} className={`p-1 text-slate-400 hover:text-slate-600 dark:text-slate-400 ${isTemp ? 'cursor-not-allowed' : 'cursor-grab'}`}>
             <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" /></svg>
          </button>
          <span className="text-slate-400">Section {index + 1}:</span> 
          {section.title}
          {isTemp && <span className="text-xs font-normal bg-slate-100 text-slate-600 px-2 py-0.5 rounded animate-pulse">Saving...</span>}
        </div>
        <div className="flex items-center gap-2">
          <button disabled={isTemp} onClick={() => onDeleteSection(section.id)} className="p-1.5 text-red-400 hover:bg-red-50 hover:text-red-600 rounded ml-2 disabled:opacity-50">Del</button>
        </div>
      </div>

      <div className="pl-6 space-y-2 pb-2">
        {(!section.lectures || section.lectures.length === 0) && (
          <div className="text-sm text-slate-500 italic py-2">Empty section.</div>
        )}
        
        <SortableContext items={section.lectures?.map((l: any) => `lecture-${l.id}`) || []} strategy={verticalListSortingStrategy}>
           {section.lectures?.map((lecture: any, lIdx: number) => (
              <SortableLecture 
                key={lecture.id} 
                lecture={lecture} 
                index={lIdx} 
                onClick={() => setSelectedLecture({lecture, sectionId: section.id})}
                onDelete={(e: any) => { e.stopPropagation(); onDeleteLecture(section.id, lecture.id); }}
              />
           ))}
        </SortableContext>

        <button 
          disabled={isTemp}
          onClick={() => onAddLecture(section.id)}
          className="mt-2 text-sm font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 py-1 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          + Add Lecture
        </button>
      </div>
    </div>
  );
}

// --- Main Page ---

export default function CurriculumPage({ params }: { params: { id: string } }) {
  const { currentCourse, fetchCourseForEdit, publishCourse } = useInstructorStore();
  const [sections, setSections] = useState<any[]>([]);
  const [selectedLecture, setSelectedLecture] = useState<{lecture: any, sectionId: string} | null>(null);
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  
  const [inputModal, setInputModal] = useState<{
    isOpen: boolean;
    title: string;
    description?: string;
    placeholder?: string;
    onConfirm: (val: string) => void;
  }>({
    isOpen: false,
    title: '',
    onConfirm: () => {}
  });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    fetchCourseForEdit(params.id);
  }, [params.id, fetchCourseForEdit]);

  useEffect(() => {
    if (currentCourse?.sections) {
      const sorted = [...currentCourse.sections].sort((a, b) => a.sortOrder - b.sortOrder);
      sorted.forEach(s => {
        if (s.lectures) s.lectures.sort((a: any, b: any) => a.sortOrder - b.sortOrder);
      });
      setSections(sorted);
    }
  }, [currentCourse]);

  const handleAddSection = () => {
    setInputModal({
      isOpen: true,
      title: 'New Section',
      description: 'Enter a clear title for this learning module.',
      placeholder: 'e.g. Fundamental Concepts',
      onConfirm: async (title) => {
        // Optimistic update
        const tempId = `temp-sec-${Date.now()}`;
        const newSection = { id: tempId, title, lectures: [], sortOrder: sections.length };
        setSections(prev => [...prev, newSection]);
        setInputModal(prev => ({ ...prev, isOpen: false }));
        
        try {
          const res: any = await instructorApi.addSection(params.id, { title });
          const createdSection = res.data?.data || res.data;
          // Upgrade temp ID to real ID silently
          setSections(prev => prev.map(s => s.id === tempId ? { ...s, id: createdSection.id } : s));
        } catch (err: any) {
          toast.error('Add Section Error: ' + (err.response?.data?.message || err.message));
          setSections(prev => prev.filter(s => s.id !== tempId)); // Revert on failure
        }
      }
    });
  };

  const handleAddLecture = (sectionId: string) => {
    setInputModal({
      isOpen: true,
      title: 'New Lecture',
      description: 'Give your lesson a compelling title.',
      placeholder: 'e.g. Intro to NestJS Hooks',
      onConfirm: async (title) => {
        // Optimistic update
        const tempId = `temp-lec-${Date.now()}`;
        setSections(prev => prev.map(s => {
          if (s.id === sectionId) {
            return { ...s, lectures: [...(s.lectures || []), { id: tempId, title, isPreview: false, contentType: 'video' }] };
          }
          return s;
        }));
        setInputModal(prev => ({ ...prev, isOpen: false }));

        try {
          const res: any = await instructorApi.addLecture(params.id, sectionId, { title, isPreview: false });
          const createdLecture = res.data?.data || res.data;
          // Upgrade temp ID to real ID silently
          setSections(prev => prev.map(s => {
            if (s.id === sectionId) {
              return { ...s, lectures: s.lectures.map((l: any) => l.id === tempId ? { ...l, id: createdLecture.id } : l) };
            }
            return s;
          }));
        } catch (err: any) {
          toast.error('Add Lecture Error: ' + (err.response?.data?.message || err.message));
          setSections(prev => prev.map(s => {
            if (s.id === sectionId) {
              return { ...s, lectures: s.lectures.filter((l: any) => l.id !== tempId) };
            }
            return s;
          })); // Revert on failure
        }
      }
    });
  };

  const handleDeleteSection = async (sectionId: string) => {
    if (!confirm('Are you sure you want to delete this entire section and all its lectures?')) return;
    
    // Optimistic delete
    const backup = [...sections];
    setSections(prev => prev.filter(s => s.id !== sectionId));
    
    try {
      await instructorApi.deleteSection(params.id, sectionId);
    } catch (e: any) {
      toast.error('Failed to delete section: ' + (e.response?.data?.message || e.message));
      setSections(backup); // Revert on failure
    }
  };

  const handleDeleteLecture = async (sectionId: string, lectureId: string) => {
    if (!confirm('Delete this lecture?')) return;
    
    // Optimistic delete
    const backup = [...sections];
    setSections(prev => prev.map(s => {
      if (s.id === sectionId) {
        return { ...s, lectures: (s.lectures || []).filter((l: any) => l.id !== lectureId) };
      }
      return s;
    }));
    
    try {
      await instructorApi.deleteLecture(params.id, sectionId, lectureId);
    } catch (e: any) {
      toast.error('Failed to delete lecture: ' + (e.response?.data?.message || e.message));
      setSections(backup); // Revert on failure
    }
  };

  const handleDragStart = (event: any) => {
    setActiveDragId(event.active.id);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveDragId(null);
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const activeId = active.id.toString();
    const overId = over.id.toString();

    const backup = [...sections];
    // Reorder Sections
    if (activeId.startsWith('section-') && overId.startsWith('section-')) {
       const oldIndex = sections.findIndex((s) => `section-${s.id}` === activeId);
       const newIndex = sections.findIndex((s) => `section-${s.id}` === overId);
       if (oldIndex === -1 || newIndex === -1) return;

       const newSections = arrayMove(sections, oldIndex, newIndex);
       setSections(newSections);
       
       const payload = newSections.map((s, idx) => ({ id: s.id, sortOrder: idx }));
       try {
         await instructorApi.reorderSections(params.id, payload);
       } catch (e: any) {
         setSections(backup);
         toast.error('Failed to reorder sections');
       }
       return;
    }

    // Reorder Lectures (must be within the same section for now)
    if (activeId.startsWith('lecture-') && overId.startsWith('lecture-')) {
       const section = sections.find(s => s.lectures?.some((l: any) => `lecture-${l.id}` === activeId));
       if (!section) return;
       
       // Verify the overId is in the same section
       const isSameSection = section.lectures?.some((l: any) => `lecture-${l.id}` === overId);
       if (!isSameSection) return;

       const oldIndex = section.lectures.findIndex((l: any) => `lecture-${l.id}` === activeId);
       const newIndex = section.lectures.findIndex((l: any) => `lecture-${l.id}` === overId);
       
       const newLectures = arrayMove(section.lectures, oldIndex, newIndex);
       
       const newSections = sections.map(s => s.id === section.id ? { ...s, lectures: newLectures } : s);
       setSections(newSections);

       const payload = newLectures.map((l: any, idx) => ({ id: l.id, sortOrder: idx }));
       try {
         await instructorApi.reorderLectures(params.id, section.id, payload);
       } catch (e: any) {
         setSections(backup);
         toast.error('Failed to reorder lectures');
       }
    }
  };

  if (!currentCourse) return <div className="p-10">Loading curriculum...</div>;

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <Link href={`/instructor/courses/${params.id}/edit`} className="text-blue-600 hover:text-blue-700 text-sm font-semibold mb-2 inline-block">
             &larr; Back to Course Info
          </Link>
          <div className="flex items-center gap-3">
             <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50 tracking-tight">Curriculum Builder</h1>
             <CourseStatusBadge status={currentCourse.status} />
          </div>
          <p className="text-slate-500 mt-1">Organize your course content with drag and drop capabilities.</p>
        </div>
        
        <button 
          onClick={async () => {
             try {
                if (sections.length === 0) throw new Error("Please add at least one section to publish.");
                await publishCourse(params.id);
                toast.success('Course published successfully!');
             } catch (e: any) {
                toast.error(e.message, { duration: 5000 });
             }
          }} 
          className="px-6 py-2.5 bg-slate-900 text-white font-semibold rounded-lg hover:bg-slate-800 transition shadow-sm"
        >
          Publish Course
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 overflow-hidden min-h-[500px]">
        {sections.length === 0 ? (
          <div className="text-center py-20">
             <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">No Content Yet</h3>
             <p className="text-slate-500 mb-6">Start building your curriculum by adding a section.</p>
             <button onClick={handleAddSection} className="px-6 py-2 bg-blue-100 text-blue-700 font-semibold rounded-lg hover:bg-blue-200 transition">
               + Add Section
             </button>
          </div>
        ) : (
          <div className="space-y-6">
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
              <SortableContext items={sections.map(s => `section-${s.id}`)} strategy={verticalListSortingStrategy}>
                {sections.map((section, sIdx) => (
                  <SortableSection 
                    key={`section-${section.id}`}
                    section={section}
                    index={sIdx}
                    onAddLecture={handleAddLecture}
                    onDeleteLecture={handleDeleteLecture}
                    onDeleteSection={handleDeleteSection}
                    setSelectedLecture={setSelectedLecture}
                  />
                ))}
              </SortableContext>
            </DndContext>

            <button 
              onClick={handleAddSection}
              className="w-full py-4 border-2 border-dashed border-slate-200 dark:border-slate-800 text-slate-500 font-semibold rounded-lg text-center hover:bg-slate-50 dark:bg-slate-800/50 hover:border-slate-300 dark:border-slate-700 hover:text-slate-700 dark:text-slate-300 transition"
            >
              + Add Another Section
            </button>
          </div>
        )}
      </div>

      {selectedLecture && (
        <>
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40" onClick={() => setSelectedLecture(null)} />
          <LectureEditorPanel 
            courseId={params.id}
            sectionId={selectedLecture.sectionId}
            lecture={selectedLecture.lecture}
            onClose={() => setSelectedLecture(null)}
            onUpdate={() => fetchCourseForEdit(params.id)}
          />
        </>
      )}

      <QuickInputModal 
        isOpen={inputModal.isOpen}
        title={inputModal.title}
        description={inputModal.description}
        placeholder={inputModal.placeholder}
        onCancel={() => setInputModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={inputModal.onConfirm}
      />
    </div>
  );
}
