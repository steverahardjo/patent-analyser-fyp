// import React from 'react';
// import Header from './components/Header';
// import SearchBar from './components/SearchBar';
// import UploadSection from './components/UploadSection';
// import DashboardLayout from './components/tester';
// import ChatbotDashboard from './components/Dashboard';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// import PDFUpload from './components/PDFUpload';
// import Main from './components/Dashboard';
import MainDashboard from './components/Dashboard';
import Chatbot from './components/ChatBot';
import Dashboard from './components/Dashboard';
import UploadSection from './components/UploadSection';

function App() {
  return (
    // <div className="min-h-screen bg-gray-50 min-w-[1024px]">
    //   {/* <Header /> */}
    //   <main className="h-screen w-screen">
    //     {/* <div className="text-center">
    //       <h2 className="text-4xl font-bold text-gray-900">
    //         Discover Sustainable Innovation
    //       </h2>
    //       <p className="mt-6 text-xl text-gray-600 max-w-4xl mx-auto">
    //         Analyze and explore eco-friendly patents to drive environmental innovation
    //       </p>
    //     </div> */}
    //     {/* <SearchBar /> */}
    //     {/* <UploadSection /> */}
    //     <ChatbotDashboard />
    //   </main>
    // </div>
    
    // <Router>
    //   <Routes>
    //     <Route path="/" element={<MainDashboard />}>
    //       {/* <Route path="pdf-upload" element={<PDFUpload />} /> */}
    //       <Route path="chat" element={<Chatbot />} />
    //     </Route>
    //   </Routes>
    // </Router>

    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full min-h-[90vh] max-w-6xl bg-white border border-gray-100 rounded-2xl shadow-xl p-8 space-y-6 overflow-y-auto">
        <div className="flex flex-col items-center justify-center text-center">
          <Dashboard />
          <Chatbot />
        </div>
      </div>
    </div>
  );
}
export default App;
