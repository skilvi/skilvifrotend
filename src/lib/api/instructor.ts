import apiClient from './client';
import { CourseNode, Edge } from '@/types'; // Or whatever necessary types

export const instructorApi = {
  // ── EARNINGS ──
  getEarnings: async () => apiClient.get('/instructor/earnings'),

  // ── COURSES ──
  getMyCourses: async () => apiClient.get('/courses/instructor/my-courses'),
  getInstructorReviews: async (limit: number = 20, offset: number = 0) => apiClient.get(`/reviews/instructor?limit=${limit}&offset=${offset}`),
  getArchivedCourses: async () => apiClient.get('/courses/instructor/archived-courses'),
  getCourseForEdit: async (id: string) => apiClient.get(`/courses/${id}/instructor-view`),
  createCourse: async (dto: any) => apiClient.post('/courses', dto),
  updateCourse: async (id: string, dto: any) => apiClient.put(`/courses/${id}`, dto),
  archiveCourse: async (id: string) => apiClient.patch(`/courses/${id}/archive`),
  restoreCourse: async (id: string) => apiClient.patch(`/courses/${id}/restore`),
  permanentDeleteCourse: async (id: string) => apiClient.delete(`/courses/${id}/permanent`),
  publishCourse: async (id: string) => apiClient.patch(`/courses/${id}/publish`),
  unpublishCourse: async (id: string) => apiClient.patch(`/courses/${id}/unpublish`),

  // ── SECTIONS ──
  addSection: async (courseId: string, dto: any) => apiClient.post(`/courses/${courseId}/sections`, dto),
  updateSection: async (courseId: string, sectionId: string, dto: any) => apiClient.put(`/courses/${courseId}/sections/${sectionId}`, dto),
  deleteSection: async (courseId: string, sectionId: string) => apiClient.delete(`/courses/${courseId}/sections/${sectionId}`),
  reorderSections: async (courseId: string, items: any) => apiClient.patch(`/courses/${courseId}/sections/reorder`, { items }),

  // ── LECTURES ──
  addLecture: async (courseId: string, sectionId: string, dto: any) => apiClient.post(`/courses/${courseId}/sections/${sectionId}/lectures`, dto),
  updateLecture: async (courseId: string, sectionId: string, lectureId: string, dto: any) => apiClient.put(`/courses/${courseId}/sections/${sectionId}/lectures/${lectureId}`, dto),
  deleteLecture: async (courseId: string, sectionId: string, lectureId: string) => apiClient.delete(`/courses/${courseId}/sections/${sectionId}/lectures/${lectureId}`),
  reorderLectures: async (courseId: string, sectionId: string, items: any) => apiClient.patch(`/courses/${courseId}/sections/${sectionId}/lectures/reorder`, { items }),
  attachVideoToLecture: async (courseId: string, sectionId: string, lectureId: string, s3Key: string) => apiClient.patch(`/courses/${courseId}/sections/${sectionId}/lectures/${lectureId}/attach-video`, { s3Key }),

  // ── UPLOADS ──
  getVideoUploadUrl: async (lectureId: string, fileName: string, mimeType: string) => apiClient.post('/video/upload-url', { lectureId, fileName, mimeType }),
  getThumbnailUploadUrl: async (courseId: string, fileName: string) => apiClient.post('/video/thumbnail-upload-url', { courseId, fileName }),
  getPromoUploadUrl: async (courseId: string, fileName: string, mimeType: string) => apiClient.post('/video/promo-upload-url', { courseId, fileName, mimeType }),
  confirmVideoUpload: async (dto: any) => apiClient.post('/video/confirm-upload', dto),
};
