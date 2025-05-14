import { FileUp, Upload } from 'lucide-react';
import { useChatbot } from '../hooks/useChatbot';
import React, { useState } from 'react';

interface PdfUploadProps {
  onUploadSuccess: (doc: { id: string }) => void;
}

export default function UploadSection({onUploadSuccess}: PdfUploadProps) {
  const { uploadFile, file, uploading, error } = useChatbot();
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      uploadFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      uploadFile(e.target.files[0])
        .then((doc) => onUploadSuccess(doc))
        .catch(console.error);
    }
  };

  const dragStyles = isDragging
    ? 'bg-blue-50 border-blue-300'
    : uploading
    ? 'bg-blue-50 border-blue-200'
    : 'hover:bg-gray-50 border-gray-200';

  return (
    <div className="flex items-center justify-center w-full h-full">
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
          <p className="text-xs text-gray-500">Only PDF files up to 10MB are supported</p>
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

        {error && (
          <div className="mt-3 text-sm text-red-600 bg-red-50 p-3 rounded">
            {error}
          </div>
        )}

        {uploading && (
          <div className="mt-4">
            <div className="h-1 w-full bg-gray-200 rounded overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded animate-pulse"
                style={{ width: '100%' }}
              />
            </div>
            <p className="text-xs text-center mt-1 text-gray-600">
              Uploading & Processing...
            </p>
          </div>
        )}

        {file && !uploading && !error && (
          <div className="mt-4 text-sm text-green-700 bg-green-50 p-3 rounded text-center">
            ✅ Upload Successful: <br /><strong>{file.name}</strong>
          </div>
        )}

      </div>
    </div>
  );
}
