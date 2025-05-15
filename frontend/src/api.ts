import axios from 'axios';

const BASE_URL = 'http://localhost:8000';

export const uploadPatentPDF = async (
  file: File,
  onProgress?: (percent: number) => void
) => {
  const formData = new FormData();
  formData.append("file", file);

  const res = await axios.post(`${BASE_URL}/upload`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
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
  const res = await axios.post(`${BASE_URL}/query`, { question });
  return res.data;
};
