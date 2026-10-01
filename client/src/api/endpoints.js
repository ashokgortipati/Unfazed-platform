import api from './axios';

// Auth Endpoints (Session-based, no JWT)
export const authApi = {
  registerTherapist: (data) => api.post('/auth/register-therapist', data),
  loginTherapist: (credentials) => api.post('/auth/login-therapist', credentials),
  loginClient: (credentials) => api.post('/auth/login-client', credentials),
  getCurrentSession: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
};

// Therapist Endpoints
export const therapistApi = {
  getProfile: () => api.get('/therapist/profile'),
  updateProfile: (data) => api.put('/therapist/profile', data),
  updateAvailability: (availability) => api.put('/therapist/availability', availability),
};

// Client Management Endpoints
export const clientApi = {
  getAll: (params) => api.get('/clients', { params }),
  getById: (id) => api.get(`/clients/${id}`),
  create: (data) => api.post('/clients', data),
  update: (id, data) => api.put(`/clients/${id}`, data),
  delete: (id) => api.delete(`/clients/${id}`),
  submitIntake: (clientId, data) => api.post(`/clients/${clientId}/intake`, data),
  submitConsent: (clientId, data) => api.post(`/clients/${clientId}/consent`, data),
};

// Appointments & Scheduling Endpoints
export const appointmentApi = {
  getAll: (params) => api.get('/appointments', { params }),
  getSlots: (therapistId, date) => api.get('/appointments/slots', { params: { therapistId, date } }),
  create: (data) => api.post('/appointments', data),
  reschedule: (id, data) => api.put(`/appointments/${id}/reschedule`, data),
  cancel: (id, data) => api.put(`/appointments/${id}/cancel`, data),
};

// Session Notes Endpoints
export const notesApi = {
  getAll: (params) => api.get('/notes', { params }),
  getById: (id) => api.get(`/notes/${id}`),
  create: (data) => api.post('/notes', data),
  update: (id, data) => api.put(`/notes/${id}`, data),
  delete: (id) => api.delete(`/notes/${id}`),
};

// Notifications Endpoints
export const notificationApi = {
  getAll: (params) => api.get('/notifications', { params }),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
  delete: (id) => api.delete(`/notifications/${id}`),
};

// File Management Endpoints
export const fileApi = {
  getAll: (params) => api.get('/files', { params }),
  upload: (formData) =>
    api.post('/files/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  downloadUrl: (id) => `${api.defaults.baseURL}/files/${id}/download`,
  delete: (id) => api.delete(`/files/${id}`),
};

// Dashboard Analytics
export const dashboardApi = {
  getStats: () => api.get('/dashboard/stats'),
};
