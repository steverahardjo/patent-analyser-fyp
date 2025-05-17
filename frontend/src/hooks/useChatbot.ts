// src/hooks/useChatbot.ts
import { useState } from 'react';
import { uploadPatentPDF, askQuery } from '../api';

export function useChatbot() {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [patentInfo, setPatentInfo] = useState<any>(null);
  const [answer, setAnswer] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  const uploadFile = async (
    selectedFile: File,
    onProgress?: (percent: number) => void
  ): Promise<{ id: string; [key: string]: any }> => {
    setFile(selectedFile);
    setError('');
    try {
      const data = await uploadPatentPDF(selectedFile, onProgress);
      const currentDate = new Date().toISOString().split('T')[0];
      const dataWithId = {
        ...data,
        id: `${data.patent_number}_${currentDate}`,
      };
      setPatentInfo(dataWithId);
      setAnswer('');
      return dataWithId;
    } catch (err: any) {
      setError(err.response?.data?.error || 'Upload failed');
      setPatentInfo(null);
      throw err;
    }
  };

  const sendQuestion = async (question: string) => {
    if (!question.trim()) return;
    setChatLoading(true);
    setError('');
    try {
      const res = await askQuery(question);
      setAnswer(res.answer);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Query failed');
    } finally {
      setChatLoading(false);
    }
  };

  return {
    file,
    setFile,
    error,
    setError,
    patentInfo,
    answer,
    chatLoading,
    uploadFile,
    sendQuestion,
  };
}
