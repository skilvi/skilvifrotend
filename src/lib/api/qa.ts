import apiClient from './client';

export interface Answer {
  id: string;
  content: string;
  userId: string;
  createdAt: string;
  user: {
    displayName: string;
    avatarUrl?: string;
  };
}

export interface Question {
  id: string;
  content: string;
  studentId: string;
  lectureId?: string;
  createdAt: string;
  student: {
    displayName: string;
    avatarUrl?: string;
  };
  answers: Answer[];
  course?: {
    id: string;
    title: string;
  };
}

export const qaApi = {
  getQuestions: async (courseId: string): Promise<Question[]> => {
    const res: any = await apiClient.get(`/qa/courses/${courseId}/questions`);
    return res.data || res || [];
  },

  askQuestion: async (courseId: string, content: string, lectureId?: string): Promise<Question> => {
    const res: any = await apiClient.post(`/qa/courses/${courseId}/questions`, { content, lectureId });
    return res.data || res;
  },

  replyToQuestion: async (questionId: string, content: string): Promise<Answer> => {
    const res: any = await apiClient.post(`/qa/questions/${questionId}/answers`, { content });
    return res.data || res;
  },

  getInstructorQuestions: async (): Promise<Question[]> => {
    const res: any = await apiClient.get('/qa/instructor/questions');
    return res.data || res || [];
  }
};
