import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import ChatInterface from '../components/ChatInterface';
import { Message, ActionType } from '../types';
import axios from 'axios';

const BACKEND_URL = 'http://localhost:8000';

const ChatbotPage = () => {
  const { documentId } = useParams();
  const [patentInfo, setPatentInfo] = useState<any>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState('');

  // Load patent from localStorage based on documentId
  useEffect(() => {
    const stored = localStorage.getItem('uploadedPatentInfo');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed?.uploadDate) {
        parsed.uploadDate = new Date(parsed.uploadDate);
      }

      if (parsed?.id === documentId) {
        setPatentInfo(parsed);
      }
    }
  }, [documentId]);

  // Handle sending user question
  const handleSendMessage = async (content: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsAnalyzing(true);
    setError('');

    try {
      const res = await axios.post(`${BACKEND_URL}/query`, {
        question: content,
      });

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: res.data.answer,
        sender: 'ai',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Query failed';
      setError(errorMessage);

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 2).toString(),
          content: `❌ Error: ${errorMessage}`,
          sender: 'ai',
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Handle simulated action responses
  const handleAction = (action: ActionType) => {
    const actionMessage: Message = {
      id: Date.now().toString(),
      content: `[Action requested: ${action}]`,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, actionMessage]);
    setIsAnalyzing(true);

    setTimeout(() => {
      let responseContent = '';
      if (!patentInfo) {
        responseContent = 'Please upload a patent document first.';
      } else {
        switch (action) {
          case 'summarise':
            responseContent = `📄 Summary for "${patentInfo.title}":\n${patentInfo.summ}`;
            break;
          case 'classify':
            responseContent = `📊 Classification: ${patentInfo.classification_result}`;
            break;
          case 'findSimilarity':
            responseContent = `🔍 Similar patents to "${patentInfo.title}" would be listed here. (Simulated)`;
            break;
        }
      }

      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: responseContent,
        sender: 'ai',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiResponse]);
      setIsAnalyzing(false);
    }, 1500);
  };

  if (!patentInfo) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">Please upload a patent first and access it through the Upload page.</p>
      </div>
    );
  }

  return (
    <ChatInterface
      document={patentInfo}
      messages={messages}
      onSendMessage={handleSendMessage}
      onAction={handleAction}
      isAnalyzing={isAnalyzing}
    />
  );
};

export default ChatbotPage;
