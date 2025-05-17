import { useNavigate } from 'react-router-dom';
import UploadSection from '../components/UploadSection';

const UploadPage = () => {
  const navigate = useNavigate();

  const handleUpload = (document: { id: string; [key: string]: any }) => {
    const now = new Date();
  
    const documentWithDate = {
      ...document,
      uploadDate: now.toISOString(), // ✅ store ISO string
    };
  
    localStorage.setItem('uploadedPatentInfo', JSON.stringify(documentWithDate));
    navigate(`/chat/${document.id}`);
  };  

  return (
    <div className="flex items-center justify-center py-12">
      <UploadSection onUploadSuccess={handleUpload} />
    </div>
  );
};

export default UploadPage;
