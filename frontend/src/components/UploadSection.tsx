import { FileUp, Upload } from 'lucide-react';
import { useChatbot } from '../hooks/useChatbot';
import React, { useEffect, useState } from 'react';
import ProgressBar from './ProgressBar';

interface PdfUploadProps {
  onUploadSuccess: (doc: { id: string }) => void;
}

export default function UploadSection({ onUploadSuccess }: PdfUploadProps) {
  const { uploadFile, file, error, setError, setFile } = useChatbot();
  const [uploading, setUploading] = useState(false); 
  const [isDragging, setIsDragging] = useState(false);
  const [progress, setProgress] = useState(0);
  const [realProgress, setRealProgress] = useState(0);
  const [pendingDoc, setPendingDoc] = useState<any>(null);

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
      setFile(null);
      return;
    }
  
    setProgress(0);
    setRealProgress(0);
    setError('');
    setUploading(true);
  
    let backendProgress = 60;
  
    // ✅ Start backend progress simulation early (slow and smooth)
    const backendInterval = setInterval(() => {
      backendProgress += 0.1; // 🔄 slower step
      setRealProgress((prev) => {
        const next = Math.min(backendProgress, 99);
        return prev < next ? next : prev;
      });
  
      if (backendProgress >= 99) {
        clearInterval(backendInterval);
      }
    }, 150); // 🔄 slower tick
  
    // ✅ Start file upload
    uploadFile(selectedFile, (p) => {
      const scaled = Math.floor((p / 100) * 60);
      setRealProgress((prev) => Math.max(prev, scaled)); // Prevent regress
    })
      .then((doc) => {
        setPendingDoc(doc);
  
        // ✅ Delay final 100% for visual smoothing
        setTimeout(() => {
          setRealProgress(100);
          setUploading(false);
        }, 1000); // smooth finish
  
        // ✅ Store placeholder message
        const now = new Date();
        localStorage.setItem('chatHistory', JSON.stringify({
          [doc.id]: [
            {
              role: "assistant",
              content: "✅ Patent processing complete. You may now start by clicking on suggested questions or using the action buttons above to understand your patent.",
              timestamp: now.toISOString()
            }
          ]
        }));
      })
      .catch((err) => {
        console.error(err);
        clearInterval(backendInterval);
        setUploading(false);
      
        // Show user-friendly error message for eco-validation failure
        const backendMessage = err?.response?.data?.error || err.message || '';

        if (backendMessage.includes("Problem Failed to parse problems dictionary") || backendMessage.includes("Failed to retrieve HTML content.")) {
          setError("❌ The PDF uploaded appears to be an unsupported format. Please upload a USPTO patent to proceed.");
          setFile(null);
        } else if (backendMessage.includes("Problem extraction failed")) {
          setError("❌ This patent PDF could not be proceed. Please ensure the uploaded patent related to eco-solutions to proceed.");
          setFile(null);
        } else {
          setError("❌ Upload failed. Please try again.");
          setFile(null);
        }
      });      
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

  useEffect(() => {
    if (realProgress >= 100 && pendingDoc) {
      const timeout = setTimeout(() => {
        onUploadSuccess(pendingDoc);
        setPendingDoc(null);
      }, 300); // short delay to allow animation to catch up
  
      return () => clearTimeout(timeout);
    }
  }, [realProgress, pendingDoc, onUploadSuccess]);  

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

          {/* File size error */}
          {error === `❌ File exceeds ${MAX_FILE_SIZE_MB}MB. Please upload a smaller file.` && (
            <div className="mt-3 text-sm text-red-600 bg-red-50 p-3 rounded">
              {error}
            </div>
          )}

          {/* Any other backend error */}
          {error &&
            error !== `❌ File exceeds ${MAX_FILE_SIZE_MB}MB. Please upload a smaller file.` && (
              <div className="mt-3 text-sm text-red-600 bg-red-50 p-3 rounded">
                {error}
              </div>
          )}

          {uploading && (
            <div className="mt-4 space-y-1">
              <ProgressBar progress={progress} />
              <p className="text-xs text-center text-gray-600">
                {progress < 59
                  ? `Uploading... ${progress}%`
                  : progress < 100
                  ? `🔄 Processing patent PDF... ${progress}%`
                  : '✅ Patent processing complete!'}
              </p>
            </div>
          )}

          {file && !uploading && !error && (
            <div className="mt-4 text-sm text-green-700 bg-green-50 p-3 rounded text-center">
              ✅ Upload Successful: <br />
              <strong>{file.name}</strong>
            </div>
          )}

          {/* Uncomment for debugging */}
          {/* <button
            onClick={() => localStorage.clear()}
            className="mt-4 text-xs text-red-600 underline"
          >
            Clear localStorage
          </button> */}
        </div>
      </div>
    </div>
  );
}
