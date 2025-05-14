import axios from 'axios';

const BASE_URL = 'http://localhost:8000';

export const uploadPatentPDF = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
  
    const res = await axios.post(`${BASE_URL}/upload`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return res.data;
  };
  
  export const askQuery = async (question: string) => {
    const res = await axios.post(`${BASE_URL}/query`, { question });
    return res.data;
  };
  