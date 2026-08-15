import apiClient from './client';

/**
 * Bridges HTTP interactions strictly against specific endpoints mapped locally across 
 * our robust NestJS API monolith specifically focusing on the Learning / Video segments.
 */

export interface CourseNodeState {
  id: string;
  title: string;
  nodeType: string;
  sortOrder: number;
  isLocked: boolean;
  progress: {
    watchTimeSeconds?: number;
    isCompleted: boolean;
  } | null;
}

export const learningApi = {
  getCourseConsumptionState: async (courseId: string): Promise<any> => {
    // Maps exactly to `GET /api/v1/courses/:id/learn` (ConsumptionService) 
    return apiClient.get(`/courses/${courseId}/learn`);
  },

  resolveSecurePlayback: async (courseId: string, nodeId: string): Promise<any> => {
    // Maps to `GET /api/v1/videos/:nodeId/playback-url` (VideoService)
    return apiClient.get(`/videos/${nodeId}/playback-url`);
  },

  syncHeartbeat: async (courseId: string, nodeId: string, positionSeconds: number): Promise<any> => {
    // Maps to `POST /api/v1/progress/heartbeat` (ProgressService)
    return apiClient.post('/progress/heartbeat', {
      courseId,
      nodeId,
      positionSeconds
    });
  },

  markNodeComplete: async (courseId: string, nodeId: string): Promise<any> => {
    // Maps to progress completion endpoint
    return apiClient.post(`/progress/${nodeId}/complete`, { courseId });
  }
}
