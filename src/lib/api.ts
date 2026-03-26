import { apiRequest } from './supabase';

// Auth
export const authApi = {
  register: (data: { email: string; password: string; name: string }) =>
    apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  login: (data: { email: string; password: string }) =>
    apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

// Accounts
export const accountsApi = {
  getAll: () => apiRequest('/accounts'),
  create: (data: any) => apiRequest('/accounts', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id: string, data: any) => apiRequest(`/accounts/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id: string) => apiRequest(`/accounts/${id}`, {
    method: 'DELETE',
  }),
  getBalance: () => apiRequest('/accounts/balance'),
};

// Categories
export const categoriesApi = {
  getAll: () => apiRequest('/categories'),
  create: (data: any) => apiRequest('/categories', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
};

// Transactions
export const transactionsApi = {
  getAll: (params?: { from?: string; to?: string; category_id?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.from) queryParams.append('from', params.from);
    if (params?.to) queryParams.append('to', params.to);
    if (params?.category_id) queryParams.append('category_id', params.category_id);
    
    const query = queryParams.toString();
    return apiRequest(`/transactions${query ? `?${query}` : ''}`);
  },
  
  getById: (id: string) => apiRequest(`/transactions/${id}`),
  
  create: (data: any) => apiRequest('/transactions', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  
  delete: (id: string) => apiRequest(`/transactions/${id}`, {
    method: 'DELETE',
  }),
};

// Dashboard
export const dashboardApi = {
  getSummary: (month?: string) => {
    const params = month ? `?month=${month}` : '';
    return apiRequest(`/dashboard/summary${params}`);
  },
};

// Timeline
export const timelineApi = {
  get: (period: string = 'month', date?: string) => {
    const params = new URLSearchParams({ period });
    if (date) params.append('date', date);
    return apiRequest(`/timeline?${params.toString()}`);
  },
};

// Budgets
export const budgetsApi = {
  getAll: (month?: string) => {
    const params = month ? `?month=${month}` : '';
    return apiRequest(`/budgets${params}`);
  },
  create: (data: any) => apiRequest('/budgets', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id: string, data: any) => apiRequest(`/budgets/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id: string) => apiRequest(`/budgets/${id}`, {
    method: 'DELETE',
  }),
};

// Savings Goals
export const goalsApi = {
  getAll: () => apiRequest('/goals'),
  create: (data: any) => apiRequest('/goals', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id: string, data: any) => apiRequest(`/goals/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  allocate: (id: string, amount: number) => apiRequest(`/goals/${id}/allocate`, {
    method: 'POST',
    body: JSON.stringify({ amount }),
  }),
  delete: (id: string) => apiRequest(`/goals/${id}`, {
    method: 'DELETE',
  }),
};

// Reminders
export const remindersApi = {
  getAll: () => apiRequest('/reminders'),
  create: (data: any) => apiRequest('/reminders', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id: string, data: any) => apiRequest(`/reminders/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id: string) => apiRequest(`/reminders/${id}`, {
    method: 'DELETE',
  }),
  checkIncome: () => apiRequest('/reminders/income-check'),
};

// Family
export const familyApi = {
  getGroup: () => apiRequest('/family/group'),
  createGroup: (data: { name: string }) => apiRequest('/family/groups', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  invite: (email: string) => apiRequest('/family/invite', {
    method: 'POST',
    body: JSON.stringify({ email }),
  }),
  leave: () => apiRequest('/family/leave', {
    method: 'POST',
  }),
};

// Export
export const exportApi = {
  excel: (type: string, year: number) => {
    return apiRequest(`/export/excel?type=${type}&year=${year}`);
  },
};

// AI Chatbot
export const chatApi = {
  sendMessage: (message: string, context?: any) => apiRequest('/chat', {
    method: 'POST',
    body: JSON.stringify({ message, context }),
  }),
  precompute: (month?: string) => {
    const params = month ? `?month=${month}` : '';
    return apiRequest(`/ai/precompute${params}`);
  },
};

// OCR
export const ocrApi = {
  scan: (imageBase64: string) => apiRequest('/ocr/scan', {
    method: 'POST',
    body: JSON.stringify({ imageBase64 }),
  }),
};