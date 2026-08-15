import apiClient from './client';

export interface SupportMessage {
  id: string;
  text: string;
  createdAt: string;
  sender: {
    id: string;
    displayName: string;
  };
}

export interface SupportTicket {
  id: string;
  subject: string;
  status: string;
  priority: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    displayName: string;
    email: string;
  };
  messages: SupportMessage[];
}

export const supportApi = {
  createTicket: async (subject: string, message: string) => {
    const res: any = await apiClient.post(`/support/tickets`, { subject, message });
    return res.data || res;
  },

  getMyTickets: async () => {
    const res: any = await apiClient.get(`/support/tickets/my`);
    return res.data || res;
  },

  addMessage: async (ticketId: string, text: string) => {
    const res: any = await apiClient.post(`/support/tickets/${ticketId}/messages`, { text });
    return res.data || res;
  },

  getAllTickets: async () => {
    const res: any = await apiClient.get(`/support/tickets/admin/all`);
    return res.data || res;
  },

  resolveTicket: async (ticketId: string) => {
    const res: any = await apiClient.post(`/support/tickets/admin/${ticketId}/resolve`, {});
    return res.data || res;
  }
};
