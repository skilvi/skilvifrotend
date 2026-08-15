import { create } from 'zustand';
import { instructorApi } from '@/lib/api/instructor';

interface InstructorState {
  myCourses: any[];
  archivedCourses: any[];
  currentCourse: any | null;
  isLoading: boolean;
  
  fetchMyCourses: () => Promise<void>;
  fetchArchivedCourses: () => Promise<void>;
  fetchCourseForEdit: (id: string) => Promise<void>;
  createCourse: (dto: any) => Promise<any>;
  updateCourse: (id: string, dto: any) => Promise<any>;
  publishCourse: (id: string) => Promise<void>;
  unpublishCourse: (id: string) => Promise<void>;
  archiveCourse: (id: string) => Promise<void>;
  restoreCourse: (id: string) => Promise<void>;
  permanentDeleteCourse: (id: string) => Promise<void>;
}

export const useInstructorStore = create<InstructorState>((set, get) => ({
  myCourses: [],
  archivedCourses: [],
  currentCourse: null,
  isLoading: false,

  fetchMyCourses: async () => {
    set({ isLoading: true });
    try {
      const res: any = await instructorApi.getMyCourses();
      set({ myCourses: res.data || [] });
    } catch (e) {
      console.error(e);
    } finally {
      set({ isLoading: false });
    }
  },

  fetchArchivedCourses: async () => {
    set({ isLoading: true });
    try {
      const res: any = await instructorApi.getArchivedCourses();
      set({ archivedCourses: res.data || [] });
    } catch (e) {
      console.error(e);
    } finally {
      set({ isLoading: false });
    }
  },

  fetchCourseForEdit: async (id: string) => {
    set({ isLoading: true });
    try {
      const res: any = await instructorApi.getCourseForEdit(id);
      set({ currentCourse: res.data });
    } catch (e) {
      console.error(e);
    } finally {
      set({ isLoading: false });
    }
  },

  createCourse: async (dto: any) => {
    set({ isLoading: true });
    try {
      const res: any = await instructorApi.createCourse(dto);
      return res.data;
    } catch (e: any) {
      const msg = e.response?.data?.message || 'Failed to create course';
      throw new Error(msg);
    } finally {
      set({ isLoading: false });
    }
  },

  updateCourse: async (id: string, dto: any) => {
    set({ isLoading: true });
    try {
      const res: any = await instructorApi.updateCourse(id, dto);
      set({ currentCourse: res.data });
      return res.data;
    } finally {
      set({ isLoading: false });
    }
  },

  publishCourse: async (id: string) => {
    set({ isLoading: true });
    try {
      await instructorApi.publishCourse(id);
      await get().fetchCourseForEdit(id);
      await get().fetchMyCourses();
    } catch (e: any) {
      const errorData = e.response?.data;
      // Handle unified filter { success: false, error: { message: '...' } } 
      // OR standard NestJS { message: '...' }
      const rawMsg = errorData?.error?.message || errorData?.message || 'Publishing failed';
      const message = Array.isArray(rawMsg) ? rawMsg.join('. ') : rawMsg;
      throw new Error(message);
    } finally {
      set({ isLoading: false });
    }
  },

  unpublishCourse: async (id: string) => {
    set({ isLoading: true });
    try {
      await instructorApi.unpublishCourse(id);
      await get().fetchCourseForEdit(id);
      await get().fetchMyCourses();
    } catch (e: any) {
        const errorData = e.response?.data;
        const rawMsg = errorData?.error?.message || errorData?.message || 'Unpublishing failed';
        const message = Array.isArray(rawMsg) ? rawMsg.join('. ') : rawMsg;
        throw new Error(message);
    } finally {
      set({ isLoading: false });
    }
  },

  archiveCourse: async (id: string) => {
    set({ isLoading: true });
    try {
      await instructorApi.archiveCourse(id);
      await get().fetchMyCourses();
    } catch (e: any) {
      const msg = e.response?.data?.message || 'Archive failed';
      throw new Error(msg);
    } finally {
      set({ isLoading: false });
    }
  },

  restoreCourse: async (id: string) => {
    set({ isLoading: true });
    try {
      await instructorApi.restoreCourse(id);
      await get().fetchArchivedCourses();
      await get().fetchMyCourses();
    } catch (e: any) {
      const msg = e.response?.data?.message || 'Restore failed';
      throw new Error(msg);
    } finally {
      set({ isLoading: false });
    }
  },

  permanentDeleteCourse: async (id: string) => {
    set({ isLoading: true });
    try {
      await instructorApi.permanentDeleteCourse(id);
      await get().fetchArchivedCourses();
    } catch (e: any) {
      const msg = e.response?.data?.message || 'Deletion failed';
      throw new Error(msg);
    } finally {
      set({ isLoading: false });
    }
  }
}));
