import apiClient from './client';

export interface CourseMinimal {
  id: string;
  title: string;
  subtitle?: string;
  price: number;
  thumbnailUrl?: string;
  promoVideoUrl?: string;
  description?: string;
  pricing?: any;
  metadata?: Record<string, any>;
}

/**
 * Standard Discovery HTTP layer pointing identically into NestJS /search boundaries
 */
export const discoveryApi = {
  
  getFeaturedCourses: async (page: number = 1, limit: number = 8): Promise<any> => {
    // Connects logically mapping to: /api/v1/search/courses?sortBy=rating&limit=8
    return apiClient.get(`/search/courses?sortBy=rating&limit=${limit}&page=${page}`);
  },

  getCategories: async (): Promise<any> => {
    return apiClient.get('/courses/categories');
  },

  searchCourses: async (filters: { 
    query?: string; 
    category?: string; 
    level?: string; 
    maxPrice?: number; 
    sortBy?: string 
  }): Promise<any> => {
    let url = `/search/courses?limit=20`;
    if (filters.query) url += `&q=${encodeURIComponent(filters.query)}`;
    if (filters.category) url += `&category=${encodeURIComponent(filters.category)}`;
    if (filters.level) url += `&level=${encodeURIComponent(filters.level)}`;
    if (filters.maxPrice) url += `&maxPrice=${filters.maxPrice}`;
    if (filters.sortBy) url += `&sortBy=${encodeURIComponent(filters.sortBy)}`;
    return apiClient.get(url);
  }
}

export default discoveryApi;
