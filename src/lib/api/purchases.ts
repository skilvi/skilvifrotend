import apiClient from './client';

export interface Purchase {
  orderId: string;
  paymentRef: string | null;
  courseId: string;
  courseTitle: string;
  amount: number;
  currency: string;
  purchaseDate: string;
  paymentStatus: string;
  paymentMethod: string;
}

export const purchasesApi = {
  /**
   * Fetches the user's purchase history.
   * Connects to: GET /api/v1/enrollments/purchases
   */
  getMyPurchases: async (): Promise<Purchase[]> => {
    const res = await apiClient.get('/enrollments/purchases');
    return res.data?.purchases || (res as any).purchases || [];
  }
};

export default purchasesApi;
