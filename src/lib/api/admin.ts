import apiClient from './client';
import { UserRole } from '@/types';

export interface AdminStats {
  totalUsers: number;
  totalRevenue: number;
  activeCourses: number;
  totalEnrollments: number;
  completionRate: number;
}

export const adminApi = {
  // ANALYTICS
  getOverview: async (): Promise<AdminStats> => {
    const res: any = await apiClient.get('/admin/analytics/overview');
    return res.data || res;
  },

  getReport: async (type: string, timeframe: string) => {
    const res: any = await apiClient.get(`/admin/analytics/report?type=${type}&timeframe=${timeframe}`);
    return res.data || res;
  },

  // USERS
  getUsers: async (role?: UserRole, page: number = 1, limit: number = 20, q?: string) => {
    const params = new URLSearchParams();
    if (role) params.append('role', role);
    if (q) params.append('q', q);
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    const res: any = await apiClient.get(`/admin/users?${params.toString()}`);
    return res.data || res;
  },
  
  getUserDetails: async (id: string) => {
    const res: any = await apiClient.get(`/admin/users/${id}/details`);
    return res.data || res;
  },

  updateUserProfile: async (id: string, data: { displayName?: string; email?: string; bio?: string; certificateName?: string }) => {
    const res: any = await apiClient.patch(`/admin/users/${id}/profile`, data);
    return res.data || res;
  },

  getUserByStudentId: async (studentId: string) => {
    const res: any = await apiClient.get(`/admin/users/by-student-id/${studentId}`);
    return res.data || res;
  },

  suspendUser: async (id: string) => {
    const res: any = await apiClient.patch(`/admin/users/${id}/suspend`);
    return res.data || res;
  },

  activateUser: async (id: string) => {
    const res: any = await apiClient.patch(`/admin/users/${id}/activate`);
    return res.data || res;
  },

  // COURSES
  getCourses: async () => {
    const res: any = await apiClient.get('/admin/courses');
    return res.data || res;
  },

  publishCourse: async (id: string) => {
    const res: any = await apiClient.patch(`/admin/courses/${id}/publish`);
    return res.data || res;
  },

  unpublishCourse: async (id: string) => {
    const res: any = await apiClient.patch(`/admin/courses/${id}/unpublish`);
    return res.data || res;
  },

  flagCourse: async (id: string) => {
    const res: any = await apiClient.patch(`/admin/courses/${id}/flag`);
    return res.data || res;
  },

  updateCoursePurchases: async (id: string, count: number) => {
    const res: any = await apiClient.patch(`/admin/courses/${id}/purchases`, { count });
    return res.data || res;
  },

  updateCourseReviews: async (id: string, count: number) => {
    const res: any = await apiClient.patch(`/admin/courses/${id}/reviews`, { count });
    return res.data || res;
  },

  // PAYMENTS
  getPayments: async () => {
    const res: any = await apiClient.get('/admin/payments');
    return res.data || res;
  },

  getPaymentDetails: async (id: string) => {
    const res: any = await apiClient.get(`/admin/payments/${id}`);
    return res.data || res;
  },

  refundPayment: async (id: string) => {
    const res: any = await apiClient.post(`/admin/payments/${id}/refund`);
    return res.data || res;
  },

  // NEW GOVERNANCE FEATURES
  resetPassword: async (id: string, newPassword: string) => {
    const res: any = await apiClient.patch(`/admin/users/${id}/reset-password?newPassword=${newPassword}`);
    return res.data || res;
  },

  changeRole: async (id: string, role: string, adminId: string) => {
    const res: any = await apiClient.patch(`/admin/users/${id}/change-role?role=${role}&adminId=${adminId}`);
    return res.data || res;
  },

  archiveCourse: async (id: string) => {
    const res: any = await apiClient.patch(`/admin/courses/${id}/archive`);
    return res.data || res;
  },

  unarchiveCourse: async (id: string) => {
    const res: any = await apiClient.patch(`/admin/courses/${id}/unarchive`);
    return res.data || res;
  },

  deleteCourse: async (id: string) => {
    const res: any = await apiClient.patch(`/admin/courses/${id}/delete`);
    return res.data || res;
  },

  deleteUser: async (id: string) => {
    const res: any = await apiClient.patch(`/admin/users/${id}/delete`);
    return res.data || res;
  },

  forceEnroll: async (userId: string, courseId: string, pricePaid: number = 0) => {
    const res: any = await apiClient.post('/admin/enrollments/force', { userId, courseId, pricePaid });
    return res.data || res;
  },

  revokeEnrollment: async (id: string) => {
    const res: any = await apiClient.delete(`/admin/enrollments/${id}`);
    return res.data || res;
  },

  // NEW OPERATIONS
  getTemplates: async () => {
    const res: any = await apiClient.get('/admin/operations/templates');
    return res.data || res;
  },

  allocateCourse: async (data: any) => {
    const res: any = await apiClient.post('/admin/operations/allocate', data);
    return res.data || res;
  },

  processOfflineAdmission: async (data: any) => {
    const res: any = await apiClient.post('/admin/operations/offline-admission', data);
    return res.data || res;
  },
  
  updateEnrollmentStatus: async (id: string, status: string, reason?: string) => {
    const res: any = await apiClient.patch(`/admin/operations/enrollments/${id}/status`, { status, reason });
    return res.data || res;
  },

  cloneAccess: async (data: any) => {
    const res: any = await apiClient.post('/admin/operations/clone', data);
    return res.data || res;
  },

  transferAccess: async (data: any) => {
    const res: any = await apiClient.post('/admin/operations/transfer', data);
    return res.data || res;
  },

  updatePermissions: async (id: string, data: any) => {
    const res: any = await apiClient.patch(`/admin/operations/enrollments/${id}/permissions`, data);
    return res.data || res;
  },

  bulkAction: async (data: any) => {
    const res: any = await apiClient.post('/admin/operations/bulk', data);
    return res.data || res;
  },
  
  extendEnrollment: async (id: string, newExpiryDate: string, reason?: string) => {
    const res: any = await apiClient.patch(`/admin/operations/enrollments/${id}/extend`, { newExpiryDate, reason });
    return res.data || res;
  },
  
  addEnrollmentNote: async (id: string, text: string) => {
    const res: any = await apiClient.patch(`/admin/operations/enrollments/${id}/notes`, { text });
    return res.data || res;
  },

  resetProgress: async (enrollmentId: string, reason?: string) => {
    const res: any = await apiClient.post(`/admin/operations/enrollments/${enrollmentId}/reset-progress`, { reason });
    return res.data || res;
  },

  // FINANCE OPERATIONS
  getStudentFinances: async (studentId: string) => {
    const res: any = await apiClient.get(`/admin/finance/student/${studentId}`);
    return res.data || res;
  },

  collectInstallment: async (installmentId: string, data: any) => {
    const res: any = await apiClient.post(`/admin/finance/installments/${installmentId}/collect`, data);
    return res.data || res;
  },

  issueRefund: async (recordId: string, data: any) => {
    const res: any = await apiClient.post(`/admin/finance/records/${recordId}/refund`, data);
    return res.data || res;
  },

  // STUDENT OPERATIONS CENTER
  searchStudents: async (q: string) => {
    const res: any = await apiClient.get(`/admin/student-ops/search?q=${encodeURIComponent(q)}`);
    return res.data || res;
  },

  getUnlinkedPool: async () => {
    const res: any = await apiClient.get('/admin/student-ops/unlinked');
    return res.data || res;
  },

  getDuplicatesReport: async () => {
    const res: any = await apiClient.get('/admin/student-ops/duplicates');
    return res.data || res;
  },

  getStudentRecords: async (studentId: string) => {
    const res: any = await apiClient.get(`/admin/student-ops/records/${studentId}`);
    return res.data || res;
  },

  // STUDENT 360
  getStudent360: async (studentId: string) => {
    const res: any = await apiClient.get(`/admin/student-ops/${studentId}/360`);
    return res.data || res;
  },

  updateStudentIdentity: async (studentId: string, data: any) => {
    const res: any = await apiClient.patch(`/admin/student-ops/${studentId}/identity`, data);
    return res.data || res;
  },

  updateCrmPriority: async (studentId: string, priority: string) => {
    const res: any = await apiClient.patch(`/admin/student-ops/${studentId}/crm-priority`, { priority });
    return res.data || res;
  },

  // CRM Features
  getCrmDashboardStats: async () => {
    const res: any = await apiClient.get('/admin/crm/dashboard');
    return res.data || res;
  },

  getCrmData: async (studentId: string) => {
    const res: any = await apiClient.get(`/admin/student-ops/${studentId}/crm`);
    return res.data || res;
  },

  updateTags: async (studentId: string, tags: string[]) => {
    const res: any = await apiClient.patch(`/admin/student-ops/${studentId}/tags`, { tags });
    return res.data || res;
  },

  updateLifecycle: async (studentId: string, stage: string) => {
    const res: any = await apiClient.patch(`/admin/student-ops/${studentId}/lifecycle`, { stage });
    return res.data || res;
  },

  addNote: async (studentId: string, text: string) => {
    const res: any = await apiClient.patch(`/admin/student-ops/${studentId}/notes`, { text });
    return res.data || res;
  },

  // SYSTEM SETTINGS
  getSystemSettings: async () => {
    const res: any = await apiClient.get('/admin/system/settings');
    return res.data || res;
  },

  updateSystemSettings: async (updates: Record<string, any>) => {
    const res: any = await apiClient.patch('/admin/system/settings', updates);
    return res.data || res;
  }
};
