import apiClient from './client';

export const paymentApi = {
  createOrder: async (courseId: string, couponCode?: string, referralCode?: string, orderType?: 'FULL' | 'PARTIAL' | 'UPGRADE'): Promise<any> => {
    // POST /api/v1/payments/orders/:courseId
    return apiClient.post(`/payments/orders/${courseId}`, { couponCode, referralCode, orderType });
  },

  verifyPayment: async (data: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
    courseId: string;
    couponCode?: string;
    referralCode?: string;
    pricePaid?: number;
    orderType?: 'FULL' | 'PARTIAL' | 'UPGRADE';
  }): Promise<any> => {
    // Mapping frontend Razorpay names to backend expected names:
    // { courseId, orderId, paymentId, signature }
    return apiClient.post('/payments/verify', {
      courseId: data.courseId,
      orderId: data.razorpay_order_id,
      paymentId: data.razorpay_payment_id,
      signature: data.razorpay_signature,
      couponCode: data.couponCode,
      referralCode: data.referralCode,
      pricePaid: data.pricePaid || 0,
      orderType: data.orderType || 'FULL',
    });
  }
};

export const couponApi = {
  validateCoupon: async (code: string, courseId: string) => {
    const res: any = await apiClient.post('/coupons/validate', { code, courseId });
    return res.data || res;
  },
  createCoupon: async (courseId: string, data: any) => {
    const res: any = await apiClient.post(`/coupons/course/${courseId}`, data);
    return res.data || res;
  },
  getCourseCoupons: async (courseId: string) => {
    const res: any = await apiClient.get(`/coupons/course/${courseId}`);
    return res.data || res;
  }
};
