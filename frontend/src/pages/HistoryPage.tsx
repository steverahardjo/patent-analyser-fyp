import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Calendar, ArrowRight } from 'lucide-react';

interface PatentDocument {
  id: string;
  name: string;
  size?: number;
  uploadDate?: string;
}

const formatDate = (dateString?: string) => {
  if (!dateString) return 'Unknown';
  const date = new Date(dateString);
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
};

const formatFileSize = (bytes?: number) => {
  if (!bytes) return 'N/A';
  const mb = bytes / (1024 * 1024);
  return `${mb.toFixed(2)} MB`;
};

const HistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState<PatentDocument[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem('uploadedPatentInfo');
    if (stored) {
      const doc = JSON.parse(stored);
      setDocuments([doc]); // support multiple in future
    }
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-medium text-gray-900">Recent Documents</h2>
      <div className="grid gap-4">
        {documents.length > 0 ? (
          documents.map((doc) => (
            <div
              key={doc.id}
              className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => navigate(`/chat/${doc.id}`)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <FileText className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">{doc.name || 'Untitled Patent'}</h3>
                    <p className="text-sm text-gray-500">{formatFileSize(doc.size)}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="w-4 h-4 mr-1" />
                    {formatDate(doc.uploadDate)}
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400" />
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500">No documents uploaded yet.</p>
        )}
      </div>
    </div>
  );
};

export default HistoryPage;
