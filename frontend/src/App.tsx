import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import { Leaf } from 'lucide-react';
import UploadPage from './pages/UploadPage';
import ChatbotPage from './pages/ChatbotPage';
import HomePage from './pages/HomePage';
import ChartsPage from './pages/ChartsPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';

function ProtectedLayout() {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return (
    <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
      <header className="bg-white border-b border-gray-200 shadow-sm py-4 px-6 shrink-0">
        <div className="flex items-center space-x-2">
          <Leaf className="h-8 w-8 text-emerald-600" />
          <h1 className="ml-3 text-2xl font-semibold text-gray-900">EcoPatent Analyzer</h1>
        </div>
      </header>
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-hidden p-4">
          <Routes>
            <Route path="/home" element={<HomePage />} />
            <Route path="/charts" element={<ChartsPage />} />
            <Route path="/upload" element={<UploadPage />} />
            <Route path="/chat/:documentId?" element={<ChatbotPage />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/*" element={<ProtectedLayout />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
