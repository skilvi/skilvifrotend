import apiClient from './client';

export interface Review {
  id: string;
  rating: number;
  comment: string;
  user?: {
    displayName?: string;
  };
}

export const courseApi = {
  getCourseDetails: async (id: string): Promise<any> => {
    // GET /api/v1/courses/:id
    return apiClient.get(`/courses/${id}`);
  },
  
  getPreviewCurriculum: async (id: string): Promise<any> => {
    // Specifically returning the curriculum for preview purposes (Consumption/Discovery)
    const res: any = await apiClient.get(`/courses/${id}/curriculum`);
    return res.data || [];
  },

  getReviews: async (id: string): Promise<any> => {
    // Standardizing on the shared return { success, data } format handled by apiClient response interceptor
    return apiClient.get(`/reviews/course/${id}`);
  },

  getAnnouncements: async (id: string): Promise<any> => {
    const res: any = await apiClient.get(`/announcements/${id}`);
    return res.data || res;
  },

  postAnnouncement: async (courseId: string, title: string, content: string): Promise<any> => {
    return apiClient.post(`/announcements/${courseId}`, { title, content });
  },

  deleteAnnouncement: async (announcementId: string): Promise<any> => {
    return apiClient.delete(`/announcements/${announcementId}`);
  }
};
