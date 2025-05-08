import axios from 'axios';

const BASE_URL = 'http://localhost:8000';

export const uploadPatentPDF = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
  
    // const response = await fetch("http://localhost:8000/upload", {
    //   method: "POST",
    //   body: formData,
    // });
  
    // const data = await response.json();
    // if (!response.ok) {
    //   throw new Error(data.error || "Upload failed");
    // }
  
    // return data;
    const res = await axios.post(`${BASE_URL}/upload`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return res.data;
  };
  
  export const askQuery = async (question: string) => {
    // const response = await fetch("http://localhost:8000/query", {
    //   method: "POST",
    //   headers: {
    //     "Content-Type": "application/json",
    //   },
    //   body: JSON.stringify({ question }),
    // });
  
    // const data = await response.json();
    // if (!response.ok) {
    //   throw new Error(data.error || "Failed to get answer");
    // }
  
    // return data.answer;
    const res = await axios.post(`${BASE_URL}/query`, { question });
    return res.data;
  };
  