import apiClient from './client';

export interface InstructorDashboardMetrics {
  instructorId: string;
  metrics: {
    totalEnrollments: number;
    totalRevenue: number;
    averageCompletionRate: number;
  };
}

export interface CoursePerformanceData {
  courseId: string;
  kpis: {
    enrollments: number;
    revenue: number;
  };
  telemetry: {
    totalWatchTimeHours: string;
    courseCompletions: number;
  };
}

export const analyticsApi = {
  /**
   * GET /api/v1/analytics/dashboard
   * Returns high-level instructor metrics: totalEnrollments, totalRevenue, averageCompletionRate
   */
  getInstructorDashboard: async (): Promise<InstructorDashboardMetrics> => {
    const res: any = await apiClient.get('/analytics/dashboard');
    return res.data || res;
  },

  /**
   * GET /api/v1/analytics/courses/:courseId
   * Returns deep-dive telemetry for a specific course
   */
  getCoursePerformance: async (courseId: string): Promise<CoursePerformanceData> => {
    const res: any = await apiClient.get(`/analytics/courses/${courseId}`);
    return res.data || res;
  },
};

export default analyticsApi;
