import apiClient from './client';

export const enrollmentApi = {
  /**
   * Directly enrolls a student (standard free-path).
   * Securely guarded by backend price check.
   */
  enroll: async (courseId: string) => {
    const res = await apiClient.post('/enrollments', { courseId });
    return res.data;
  },
  
  /**
   * Checks if user has an active enrollment.
   */
  checkAccess: async (courseId: string) => {
    const res = await apiClient.get(`/enrollments/check/${courseId}`);
    return res.data?.hasAccess || false;
  }
};
