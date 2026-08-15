import apiClient from './client';

export interface LectureProgress {
  watchTimeSeconds: number;
  isCompleted: boolean;
}

export interface Lecture {
  id: string;
  title: string;
  description: string;
  isPreview: boolean;
  isLocked: boolean;
  isPartialLock?: boolean;
  videoUrl?: string; // pre-signed stream url
  durationSeconds: number;
  contentType: 'video' | 'assignment';
  assignment?: any;
  progress?: {
    watchTimeSeconds: number;
    isCompleted: boolean;
  };
}

export interface PlaybackData {
  url: string;
  watermark: string;
  expiresIn?: number;
}

export interface Section {
  id: string;
  title: string;
  sortOrder: number;
  lectures: Lecture[];
}

export interface CourseView {
  courseId: string;
  title: string;
  subtitle?: string;
  description?: string;
  sections: Section[];
  isReviewed: boolean;
  reviewRating: number | null;
  pricing?: {
    price: number;
    discountedPrice: number | null;
    partialAmount: number | null;
    pricePaid: number;
  };
}

// ── Playback URL Cache ──────────────────────────────────────────────────────
// Signed S3 URLs are expensive to generate and are cached server-side in Redis.
// We also cache them client-side per lectureId so React re-mounts, strict mode
// double-invocations, and rapid lesson switches don't spam the backend.
// The cache entry is invalidated 5 minutes before the URL expires (300s buffer).
interface CachedPlayback extends PlaybackData {
  fetchedAt: number; // ms timestamp
}
const playbackCache = new Map<string, CachedPlayback>();

const REFRESH_BUFFER_SECONDS = 300; // 5 mins

// Track ongoing promises to prevent duplicate requests if called rapidly (e.g. React Strict Mode or fast re-renders)
const inflightRequests = new Map<string, Promise<PlaybackData>>();

export const learningApi = {
  /**
   * Fetches the full course layout including personalized lock states
   */
  getCourseView: async (courseId: string): Promise<CourseView> => {
    // Note: The global apiClient injects /api/v1 so we just prepend the route
    const res = await apiClient.get(`/learning/${courseId}`);
    return res.data || res;
  },

  /**
   * Syncs current video playback timestamp
   */
  syncProgress: async (courseId: string, lectureId: string, currentTime: number): Promise<void> => {
    await apiClient.patch(`/learning/${courseId}/${lectureId}/progress`, { currentTime });
  },

  /**
   * Formally completes a lecture
   */
  completeLecture: async (courseId: string, lectureId: string): Promise<void> => {
    await apiClient.post(`/learning/${courseId}/${lectureId}/complete`);
  },

  /**
   * Securely fetches signed playback URL and session watermark.
   * Client-side cached per lectureId — only calls the backend when the URL
   * is missing or within 5 minutes of expiry. This prevents redundant API
   * calls from React re-mounts, lesson switches, and retry loops.
   */
  getPlaybackUrl: async (lectureId: string, forceRefresh = false): Promise<PlaybackData> => {
    const now = Date.now();
    const cached = playbackCache.get(lectureId);

    if (!forceRefresh && cached) {
      const expiresIn = cached.expiresIn ?? 3600;
      const ageSeconds = (now - cached.fetchedAt) / 1000;
      const remainingSeconds = expiresIn - ageSeconds;

      // Serve from cache if more than REFRESH_BUFFER_SECONDS remaining
      if (remainingSeconds > REFRESH_BUFFER_SECONDS) {
        return { url: cached.url, watermark: cached.watermark, expiresIn: cached.expiresIn };
      }
    }

    // Check if there is already an ongoing request for this lecture
    if (!forceRefresh && inflightRequests.has(lectureId)) {
      return inflightRequests.get(lectureId)!;
    }

    const requestPromise = apiClient.get(`/video/${lectureId}/playback`).then(res => {
       const data: PlaybackData = res.data || res;
       playbackCache.set(lectureId, { ...data, fetchedAt: Date.now() });
       // BUG FIX #32: Evict oldest entries if cache grows too large (prevent memory leak)
       if (playbackCache.size > 20) {
         const firstKey = playbackCache.keys().next().value;
         if (firstKey) playbackCache.delete(firstKey);
       }
       return data;
    }).finally(() => {
       inflightRequests.delete(lectureId);
    });

    inflightRequests.set(lectureId, requestPromise);
    return requestPromise;
  },

  /**
   * Explicitly invalidates the cached playback URL for a lecture.
   * Call this when a video onerror fires (genuine expiry, not a no-asset case).
   */
  invalidatePlaybackCache: (lectureId: string): void => {
    playbackCache.delete(lectureId);
  },

  submitReview: async (courseId: string, rating: number, comment?: string): Promise<void> => {
    await apiClient.post(`/reviews/${courseId}`, { rating, comment });
  },

  submitAssignment: async (courseId: string, lectureId: string, answers: any) => {
    const res = await apiClient.post(`/learning/${courseId}/assignments/${lectureId}/submit`, { answers });
    return res.data || res;
  }
};

export default learningApi;
