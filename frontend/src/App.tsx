import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import { Leaf } from 'lucide-react';
import UploadPage from './pages/UploadPage';
import ChatbotPage from './pages/ChatbotPage';
import HomePage from './pages/HomePage';
import ChartsPage from './pages/ChartsPage';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-transparent flex flex-col overflow-y-auto">
        {/* Header */}
        <header className="bg-white border-b bg-transparent shadow-sm py-4 px-6 shrink-0">
          <div className="flex items-center space-x-2">
            <Leaf className="h-8 w-8 text-emerald-600" />
            <h1 className="ml-3 text-2xl font-semibold text-gray-900">EcoPatent Analyzer</h1>
          </div>
        </header>

        {/* Sidebar and Main Content */}
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
    </Router>
  );
}

export default App;
