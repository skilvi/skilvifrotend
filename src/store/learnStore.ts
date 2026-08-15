import { create } from 'zustand';
import { CourseView, Lecture } from '@/lib/api/learning';

type TabId = 'overview' | 'notes' | 'qa' | 'ide' | 'announcements' | 'syllabus';

interface LearnState {
  courseData: CourseView | null;
  activeLectureId: string | null;
  activeTab: TabId;
  theaterMode: boolean;
  currentTime: number;
  seekTarget: number | undefined;
  
  // Computed helpers that will be updated when data changes
  flatLectures: Lecture[];
  completionPct: number;

  // Actions
  setCourseData: (data: CourseView | null) => void;
  setActiveLectureId: (id: string | null) => void;
  setActiveTab: (tab: TabId) => void;
  toggleTheaterMode: () => void;
  setCurrentTime: (time: number) => void;
  requestSeek: (time: number) => void;
  clearSeek: () => void;
  completeActiveLecture: () => string | null;
}

export const useLearnStore = create<LearnState>((set, get) => ({
  courseData: null,
  activeLectureId: null,
  activeTab: 'overview',
  theaterMode: false,
  currentTime: 0,
  seekTarget: undefined,
  
  flatLectures: [],
  completionPct: 0,

  setCourseData: (data) => {
    if (!data) {
      set({ courseData: null, flatLectures: [], completionPct: 0 });
      return;
    }
    const flat = (data.sections || []).flatMap(s => s.lectures || []);
    const completedCount = flat.filter(l => l.progress?.isCompleted).length;
    const pct = flat.length ? (completedCount / flat.length) * 100 : 0;
    
    set({ 
      courseData: data, 
      flatLectures: flat,
      completionPct: pct
    });
  },

  setActiveLectureId: (id) => set({ activeLectureId: id }),
  
  setActiveTab: (tab) => set({ activeTab: tab }),
  
  toggleTheaterMode: () => set(state => ({ theaterMode: !state.theaterMode })),
  
  setCurrentTime: (time) => set({ currentTime: time }),
  
  requestSeek: (time) => set({ seekTarget: time }),
  
  clearSeek: () => set({ seekTarget: undefined }),

  completeActiveLecture: () => {
    const state = get();
    if (!state.courseData || !state.activeLectureId) return null;

    let nextLectureId: string | null = null;
    let markNextUnlocked = false;

    // BUG FIX #31: Optimized state update. Instead of deep copying every single
    // section and lecture array (O(N) object spreads), we only spread the elements
    // that actually change (the completed lecture and the newly unlocked lecture).
    const newSections = state.courseData.sections.map(section => {
      let sectionChanged = false;
      const newLectures = section.lectures.map(lecture => {
        let newLecture = lecture;
        if (markNextUnlocked) {
          newLecture = { ...newLecture, isLocked: false };
          markNextUnlocked = false;
          nextLectureId = newLecture.id;
          sectionChanged = true;
        }
        if (lecture.id === state.activeLectureId) {
          newLecture = { 
            ...lecture, 
            progress: { watchTimeSeconds: lecture.durationSeconds || 100, isCompleted: true } 
          };
          markNextUnlocked = true;
          sectionChanged = true;
        }
        return newLecture;
      });
      return sectionChanged ? { ...section, lectures: newLectures } : section;
    });

    const flat = newSections.flatMap(s => s.lectures || []);
    const completedCount = flat.filter(l => l.progress?.isCompleted).length;
    const pct = flat.length ? (completedCount / flat.length) * 100 : 0;

    set({ 
      courseData: { ...state.courseData, sections: newSections },
      flatLectures: flat,
      completionPct: pct
    });

    return nextLectureId;
  }
}));
