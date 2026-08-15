import apiClient from './client';

export interface DashboardEnrollment {
  id: string;
  courseId: string;
  title: string;
  thumbnailUrl: string;
  progressPercent: number;
  lastAccessed: Date;
  enrolledAt?: Date | string;
  completedAt?: Date | string;
  isNew: boolean;
  isReviewed: boolean;
  reviewRating: number | null;
}

export const dashboardApi = {
  /**
   * Fetches active enrollments dynamically merged with progress stats.
   * Connects to: GET /api/v1/enrollments/me
   */
  getDashboardEnrollments: async (): Promise<DashboardEnrollment[]> => {
    const res = await apiClient.get('/enrollments/me');
    return res.data?.enrollments || (res as any).enrollments || [];
  }
};

export default dashboardApi;
