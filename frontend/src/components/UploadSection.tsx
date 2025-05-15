import { FileUp, Upload } from 'lucide-react';
import { useChatbot } from '../hooks/useChatbot';
import React, { useEffect, useState } from 'react';
import ProgressBar from './ProgressBar';

interface PdfUploadProps {
  onUploadSuccess: (doc: { id: string }) => void;
}

export default function UploadSection({ onUploadSuccess }: PdfUploadProps) {
  const { uploadFile, file, uploading, error, setError } = useChatbot();
  const [isDragging, setIsDragging] = useState(false);
  const [progress, setProgress] = useState(0);
  const [realProgress, setRealProgress] = useState(0);

  const MAX_FILE_SIZE_MB = 20;

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleFileValidationAndUpload = (selectedFile: File) => {
    const sizeInMB = selectedFile.size / (1024 * 1024);
    if (sizeInMB > MAX_FILE_SIZE_MB) {
      setError(`❌ File exceeds ${MAX_FILE_SIZE_MB}MB. Please upload a smaller file.`);
      return;
    }

    setProgress(0);
    setRealProgress(0);

    uploadFile(selectedFile, (p) => {
      setRealProgress(p);
      if (p === 100) setProgress(100);
    })
      .then((doc) => {
        onUploadSuccess(doc);
      })
      .catch(console.error);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileValidationAndUpload(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileValidationAndUpload(file);
  };

  // Smooth simulated progress
  useEffect(() => {
    if (!uploading) return;
    const interval = setInterval(() => {
      setProgress((prev) => (prev < realProgress - 1 ? prev + 1 : prev));
    }, 30);
    return () => clearInterval(interval);
  }, [uploading, realProgress]);

  const dragStyles = isDragging
    ? 'bg-blue-50 border-blue-300'
    : uploading
    ? 'bg-blue-50 border-blue-200'
    : 'hover:bg-gray-50 border-gray-200';

  return (
    <div className="flex items-center justify-center w-full h-full">
      <div className="flex flex-col items-center justify-center w-full h-full">
        
        <header className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Document Upload</h1>
          <p className="text-gray-600">Upload your patent documents for analysis</p>
        </header>

        <div className="w-full max-w-2xl bg-white border border-gray-100 rounded-lg p-6 shadow-sm">

          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <FileUp className="h-5 w-5 mr-2 text-blue-600" />
            Upload Patent Document
          </h2>

          <div
            className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all ${dragStyles}`}
            onClick={() => document.getElementById('file-upload')?.click()}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <Upload
              className={`h-8 w-8 mx-auto mb-2 ${
                uploading ? 'text-blue-500' : 'text-gray-400'
              }`}
            />
            <p className="text-sm text-gray-600 mb-1">
              {file ? file.name : 'Drag and drop your PDF file or click to browse'}
            </p>
            <p className="text-xs text-gray-500">
              Only PDF files up to {MAX_FILE_SIZE_MB}MB are supported
            </p>
            <input
              id="file-upload"
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={handleFileChange}
              disabled={uploading}
            />
          </div>

          {file && !uploading && (
            <div className="mt-3 flex items-center justify-between text-sm text-gray-700 bg-gray-50 p-2 rounded">
              <span className="truncate max-w-[180px]">{file.name}</span>
              <span className="text-xs text-gray-500">
                {(file.size / (1024 * 1024)).toFixed(2)}MB
              </span>
            </div>
          )}

          {error === `❌ File exceeds ${MAX_FILE_SIZE_MB}MB. Please upload a smaller file.` && (
            <div className="mt-3 text-sm text-red-600 bg-red-50 p-3 rounded">
              {error}
            </div>
          )}

          {uploading && (
            <div className="mt-4 space-y-1">
              <ProgressBar progress={progress} />
              <p className="text-xs text-center text-gray-600">
                Uploading... {progress}%
              </p>
            </div>
          )}

          {file && !uploading && !error && (
            <div className="mt-4 text-sm text-green-700 bg-green-50 p-3 rounded text-center">
              ✅ Upload Successful: <br />
              <strong>{file.name}</strong>
            </div>
          )}

          <button
            onClick={() => localStorage.clear()}
            className="mt-4 text-xs text-red-600 underline"
          >
            Clear localStorage
          </button>
        </div>
      </div>
    </div>
  );
}
