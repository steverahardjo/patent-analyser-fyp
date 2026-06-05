import axios from 'axios';

const BASE_URL = 'http://localhost:8000';

const api = axios.create({ baseURL: BASE_URL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const uploadPatentPDF = async (
  file: File,
  onProgress?: (percent: number) => void
) => {
  const formData = new FormData();
  formData.append("file", file);
  const res = await api.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (progressEvent) => {
      if (onProgress && progressEvent.total) {
        const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress(percent);
      }
    },
  });
  return res.data;
};

export const askQuery = async (question: string) => {
  const res = await api.post('/query', { question });
  return res.data;
};

export const setSessionKey = async (key: string) => {
  const res = await api.post('/session/key', { key });
  return res.data;
};

export const getSessionStatus = async () => {
  const res = await api.get('/session/status');
  return res.data;
};
