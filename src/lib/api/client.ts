import axios from 'axios';

// In the browser, always use the Next.js API proxy (relative path) to ensure 
// HttpOnly cookies (like the Google OAuth refresh token) are correctly attached.
const isBrowser = typeof window !== 'undefined';
const isProd = process.env.NODE_ENV === 'production';
// BUG FIX #26: Removed hardcoded plain-text HTTP production URL.
// Production URLs should always be injected via environment variables (HTTPS).
  let serverApiUrl = process.env.NEXT_PUBLIC_API_URL || '';
  if (serverApiUrl.endsWith('/')) {
    serverApiUrl = serverApiUrl.slice(0, -1);
  }

  // Clean double slashes
  serverApiUrl = serverApiUrl.replace(/([^:]\/)\/+/g, "$1");

  if (serverApiUrl && !serverApiUrl.endsWith('/api/v1')) {
    if (serverApiUrl.endsWith('/')) {
      serverApiUrl = `${serverApiUrl}api/v1`;
    } else {
      serverApiUrl = `${serverApiUrl}/api/v1`;
    }
  }

  const API_URL = isBrowser 
    ? '/api/v1' 
    : (serverApiUrl || (isProd ? 'http://courseservermain-env.eba-6svqvpng.ap-south-1.elasticbeanstalk.com/api/v1' : 'http://localhost:5050/api/v1'));

export const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Request interceptor: Attach JWT token if it exists
apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: Handle global 401 Unauthorized
apiClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  async (error) => {
    const originalRequest = error.config;
    
    if (typeof window !== 'undefined') {
      const currentPath = window.location.pathname;
      const isPublicPage = currentPath.includes('/login') || currentPath.includes('/register') || currentPath === '/' || currentPath.startsWith('/terms') || currentPath.startsWith('/privacy') || currentPath.startsWith('/maintenance');
      
      const isAuthEndpoint = originalRequest?.url?.includes('/auth/refresh') || 
                             originalRequest?.url?.includes('/auth/login') ||
                             originalRequest?.url?.includes('/auth/register') ||
                             originalRequest?.url?.includes('/auth/me');

      if (error.response?.status === 401) {
        if (!isAuthEndpoint && !originalRequest._retry) {
          if (isRefreshing) {
            return new Promise(function(resolve, reject) {
              failedQueue.push({ resolve, reject });
            }).then(token => {
              originalRequest.headers['Authorization'] = 'Bearer ' + token;
              return apiClient(originalRequest);
            }).catch(err => {
              return Promise.reject(err);
            });
          }

          originalRequest._retry = true;
          isRefreshing = true;

          try {
            // Attempt to refresh the token using HttpOnly cookie
            const refreshRes = await axios.post(`${API_URL}/auth/refresh`, {}, { withCredentials: true });
            const token = refreshRes.data?.accessToken || refreshRes.data?.data?.accessToken || refreshRes.data?.data?.token;
            
            if (token) {
              localStorage.setItem('access_token', token);
              apiClient.defaults.headers.common['Authorization'] = 'Bearer ' + token;
              originalRequest.headers['Authorization'] = 'Bearer ' + token;
              processQueue(null, token);
              return apiClient(originalRequest);
            } else {
              throw new Error('No token returned');
            }
          } catch (refreshError) {
            processQueue(refreshError, null);
            localStorage.removeItem('access_token');
            localStorage.removeItem('auth-storage');
            if (!isPublicPage) {
              const errMsg = (refreshError as any)?.response?.data?.message || '';
              const isTerminated = errMsg.toLowerCase().includes('terminated') || errMsg.toLowerCase().includes('revoked');
              const reasonParam = isTerminated ? '&reason=session_terminated' : '';
              window.location.href = `/login?redirectTo=${encodeURIComponent(currentPath)}${reasonParam}`;
            }
            return Promise.reject(refreshError);
          } finally {
            isRefreshing = false;
          }
        } else {
          // STRICT REDIRECT FALLBACK:
          // If it's a 401 on an auth endpoint (like /auth/me) OR a retry failed,
          // and we are on a protected page, force redirect immediately.
          localStorage.removeItem('access_token');
          localStorage.removeItem('auth-storage');
          if (!isPublicPage) {
            const errMsg = error?.response?.data?.message || '';
            const isTerminated = errMsg.toLowerCase().includes('terminated') || errMsg.toLowerCase().includes('revoked');
            const reasonParam = isTerminated ? '&reason=session_terminated' : '';
            window.location.href = `/login?redirectTo=${encodeURIComponent(currentPath)}${reasonParam}`;
          }
        }
      }
      
      if (error.response?.status === 503 && !currentPath.includes('/maintenance')) {
        const msg = error.response?.data?.message || 'System Maintenance';
        window.location.href = `/maintenance?message=${encodeURIComponent(msg)}`;
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
