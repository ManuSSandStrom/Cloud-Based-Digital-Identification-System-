import api from './api.js';

export const userService = {
  getDashboard: async () => {
    const response = await api.get('/user/dashboard');
    return response.data;
  },
  uploadDocuments: async (formData) => {
    const response = await api.post('/user/upload-documents', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  downloadId: async () => {
    const response = await api.get('/user/download-id', {
      responseType: 'blob',
    });
    return response.data;
  },
};
