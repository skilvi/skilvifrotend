import { z } from 'zod';
import apiClient from './client';

// Zod validation schemas mirroring backend requirements
export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  forceLogout: z.boolean().optional(),
});

export const registerSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  displayName: z.string().min(2, 'Display name must be at least 2 characters'),
  phone: z.string().optional(),
  role: z.enum(['student', 'instructor']).optional(),
  agreeToTerms: z.boolean().refine(val => val === true, {
    message: 'You must agree to the terms and policies',
  }),
});

export const instructorRegisterSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  displayName: z.string().min(2, 'Display name must be at least 2 characters'),
  phone: z.string().regex(/^\d{10}$/, 'Phone number must be exactly 10 digits'),
  role: z.enum(['student', 'instructor']).optional(),
  agreeToTerms: z.boolean().refine(val => val === true, {
    message: 'You must agree to the terms and policies',
  }),
});

export type LoginCredentials = z.infer<typeof loginSchema>;
export type RegisterCredentials = z.infer<typeof registerSchema>;
export type InstructorRegisterCredentials = z.infer<typeof instructorRegisterSchema>;

export const authApi = {
  /**
   * POST /api/v1/auth/login
   * Returns: { accessToken, refreshToken, user: { id, email, displayName, role } }
   */
  login: async (credentials: LoginCredentials): Promise<any> => {
    return apiClient.post('/auth/login', credentials);
  },

  /**
   * POST /api/v1/auth/register  (backend has this as an alias for /signup)
   * Returns: { accessToken, refreshToken, user: { id, email, displayName, role } }
   */
  register: async (data: RegisterCredentials | InstructorRegisterCredentials): Promise<any> => {
    const { agreeToTerms, ...payload } = data;
    return apiClient.post('/auth/register', payload);
  },

  /**
   * GET /api/v1/auth/me  — Validate existing token and get user profile
   * Called on app load to restore session from localStorage token.
   */
  getMe: async (): Promise<any> => {
    return apiClient.get('/auth/me');
  },

  /**
   * POST /api/v1/auth/refresh
   * Uses HttpOnly cookie to get a new access token
   */
  refresh: async (): Promise<any> => {
    return apiClient.post('/auth/refresh');
  },

  /**
   * POST /api/v1/auth/logout
   * Clears the HttpOnly refresh token cookie from the backend
   */
  logout: async (): Promise<any> => {
    return apiClient.post('/auth/logout');
  },

  /**
   * POST /api/v1/auth/sso-exchange
   * Exchanges an SSO code for a JWT token
   */
  ssoExchange: async (code: string): Promise<any> => {
    return apiClient.post('/auth/sso-exchange', { code });
  },

  /**
   * POST /api/v1/auth/forgot-password
   */
  forgotPassword: async (email: string): Promise<any> => {
    return apiClient.post('/auth/forgot-password', { email });
  },

  /**
   * POST /api/v1/auth/verify-reset-code
   */
  verifyResetCode: async (email: string, code: string): Promise<any> => {
    return apiClient.post('/auth/verify-reset-code', { email, code });
  },

  /**
   * POST /api/v1/auth/reset-password
   */
  resetPassword: async (email: string, code: string, newPassword: string): Promise<any> => {
    return apiClient.post('/auth/reset-password', { email, code, newPassword });
  },
};
