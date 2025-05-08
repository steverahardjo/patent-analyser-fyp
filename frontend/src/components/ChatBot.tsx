import React, { useState } from 'react';
import axios from 'axios';

const Chatbot: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [patentInfo, setPatentInfo] = useState<any>(null);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [error, setError] = useState('');

  const BACKEND_URL = 'http://localhost:8000';

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const uploadPDF = async () => {
    if (!file) return;

    setUploading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await axios.post(`${BACKEND_URL}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setPatentInfo(res.data);
      setAnswer('');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Upload failed');
      setPatentInfo(null);
    } finally {
      setUploading(false);
    }
  };

  const sendQuestion = async () => {
    if (!question.trim()) return;

    setChatLoading(true);
    setError('');
    try {
      const res = await axios.post(`${BACKEND_URL}/query`, {
        question,
      });

      setAnswer(res.data.answer);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Query failed');
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Patent Chatbot</h1>

      <div className="mb-4">
        <input type="file" accept="application/pdf" onChange={handleFileChange} />
        <button
          onClick={uploadPDF}
          disabled={uploading}
          className="ml-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          {uploading ? 'Uploading...' : 'Upload PDF'}
        </button>
      </div>

      {error && <div className="text-red-600 mb-4">{error}</div>}

      {patentInfo && (
        <div className="bg-gray-100 p-4 rounded mb-4">
          <h2 className="font-semibold text-lg mb-2">Patent Metadata</h2>
          <p><strong>Number:</strong> {patentInfo.patent_number}</p>
          <p><strong>Title:</strong> {patentInfo.title}</p>
          <p><strong>Inventors:</strong> {patentInfo.Inventors}</p>
          <p><strong>Publication Date:</strong> {patentInfo.publication_date}</p>
          <p><strong>Classification:</strong> {patentInfo.classification_result}</p>
          <p><strong>Summary:</strong> {patentInfo.summ}</p>
        </div>
      )}

      {patentInfo && (
        <div className="bg-white p-4 rounded shadow">
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            rows={4}
            placeholder="Ask something about the patent..."
            className="w-full p-2 border border-gray-300 rounded mb-2"
          />
          <button
            onClick={sendQuestion}
            disabled={chatLoading}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            {chatLoading ? 'Asking...' : 'Ask'}
          </button>

          {answer && (
            <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded">
              <strong>Answer:</strong>
              <p>{answer}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Chatbot;
