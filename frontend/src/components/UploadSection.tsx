import { FileUp, Upload, Key } from 'lucide-react';
import { useChatbot } from '../hooks/useChatbot';
import React, { useEffect, useState } from 'react';
import ProgressBar from './ProgressBar';
import { setSessionKey } from '../api';

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
  const [sessionDialog, setSessionDialog] = useState(false);
  const [sessionKey, setSessionKeyInput] = useState('');

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
      setError(`File exceeds ${MAX_FILE_SIZE_MB}MB. Please upload a smaller file.`);
      setFile(null);
      return;
    }

    setProgress(0);
    setRealProgress(0);
    setError('');
    setUploading(true);

    let backendProgress = 60;

    const backendInterval = setInterval(() => {
      backendProgress += 0.1;
      setRealProgress((prev) => {
        const next = Math.min(backendProgress, 99);
        return prev < next ? next : prev;
      });

      if (backendProgress >= 99) {
        clearInterval(backendInterval);
      }
    }, 150);

    uploadFile(selectedFile, (p) => {
      const scaled = Math.floor((p / 100) * 60);
      setRealProgress((prev) => Math.max(prev, scaled));
    })
      .then((doc) => {
        setPendingDoc(doc);

        setTimeout(() => {
          setRealProgress(100);
          setUploading(false);
        }, 1000);

        const now = new Date();

        const metadataMsg = [
          '**Uploaded Patent Metadata**',
          `- **Patent Number:** ${doc.patent_number}`,
          `- **Title:** ${doc.title}`,
          `- **Inventors:** ${doc.Inventors}`,
          `- **Publication Date:** ${doc.publication_date}`
        ].join('\n');

        localStorage.setItem('chatHistory', JSON.stringify({
          [doc.id]: [
            {
              role: "assistant",
              content: "Patent processing complete. You may now start by asking a question or using the action buttons above to understand your patent.",
              timestamp: now.toISOString()
            },
            {
              role: "assistant",
              content: metadataMsg,
              timestamp: now.toISOString()
            }
          ]
        }));
      })
      .catch((err) => {
        console.error(err);
        clearInterval(backendInterval);
        setUploading(false);

        const backendMessage = err?.response?.data?.error || err.message || '';

        if (backendMessage === 'session_required') {
          setSessionDialog(true);
          setFile(null);
        } else if (backendMessage.includes("Problem Failed to parse problems dictionary") || backendMessage.includes("Failed to retrieve HTML content.")) {
          setError("The PDF uploaded appears to be an unsupported format. Please upload a USPTO patent to proceed.");
          setFile(null);
        } else if (backendMessage.includes("Problem extraction failed")) {
          setError("This patent PDF could not be proceed. Please ensure the uploaded patent related to eco-solutions to proceed.");
          setFile(null);
        } else if (err?.response?.status === 422) {
          setError("Invalid upload. Please make sure a valid patent PDF file is selected before uploading.");
          setFile(null);
        } else {
          setError("Upload failed. Please try again.");
          setFile(null);
        }
      });
  };

  const handleSubmitSessionKey = async () => {
    if (!sessionKey.trim()) return;
    try {
      await setSessionKey(sessionKey.trim());
      setSessionDialog(false);
      setSessionKeyInput('');
      setError('');
    } catch {
      setError("Failed to save session key. Please try again.");
    }
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
      }, 300);
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

          {error && (
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
                  ? `Processing patent PDF... ${progress}%`
                  : 'Patent processing complete!'}
              </p>
            </div>
          )}

          {file && !uploading && !error && !sessionDialog && (
            <div className="mt-4 text-sm text-green-700 bg-green-50 p-3 rounded text-center">
              Upload Successful: <br />
              <strong>{file.name}</strong>
            </div>
          )}
        </div>
      </div>

      {sessionDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center gap-3 mb-4">
              <Key className="h-6 w-6 text-amber-600" />
              <h3 className="text-lg font-semibold text-gray-900">USPTO Session Key Required</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              The USPTO patent database requires a session key to access patent data. 
              Please get your session JWT from{' '}
              <a href="https://ppubs.uspto.gov" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                USPTO Public Patent Search
              </a>
              , open DevTools (F12) &rarr; Application &rarr; Cookies, copy the session cookie value, and paste it below.
            </p>
            <textarea
              value={sessionKey}
              onChange={e => setSessionKeyInput(e.target.value)}
              placeholder="Paste your USPTO session JWT here..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 mb-4"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => { setSessionDialog(false); setSessionKeyInput(''); }}
                className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitSessionKey}
                disabled={!sessionKey.trim()}
                className="px-4 py-2 text-sm bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50"
              >
                Submit Key
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-3 text-center">
              After submitting the key, upload the patent PDF again.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
