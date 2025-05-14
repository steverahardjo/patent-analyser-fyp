import { useEffect, useState } from 'react';
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

  // Restore patent info from localStorage
  useEffect(() => {
    if (!documentId) return;

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

  // Restore messages from localStorage only if empty
  useEffect(() => {
    if (!documentId || messages.length > 0) return;

    const stored = localStorage.getItem('chatHistory');
    if (stored) {
      const parsed = JSON.parse(stored);
      const existingMessages = parsed[documentId];
      if (existingMessages?.length) {
        // ✅ Hydrate timestamps back to Date objects
        const hydratedMessages = existingMessages.map((msg: Message) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        }));
      
        setMessages(hydratedMessages);
        console.log("✅ Restored chat messages from localStorage");
      }    
    }
  }, [documentId, messages.length]);

  // ✅ Persist messages to localStorage when they change
  useEffect(() => {
    if (!documentId || messages.length === 0) return;

    const existing = localStorage.getItem('chatHistory');
    const parsed = existing ? JSON.parse(existing) : {};

    parsed[documentId] = messages;
    localStorage.setItem('chatHistory', JSON.stringify(parsed));
  }, [messages, documentId]);

  const handleSendMessage = async (content: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);

    if (!patentInfo) {
      const noPDFReply: Message = {
        id: (Date.now() + 1).toString(),
        content: 'No PDF uploaded. Please upload a patent in the <a href="/upload" class="text-blue-600 underline">Upload Page</a> to continue.',
        sender: 'ai',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, noPDFReply]);
      return;
    }

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

      const errorMessageObject: Message = {
        id: (Date.now() + 3).toString(),
        content: `❌ Error: ${errorMessage}`,
        sender: 'ai',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMessageObject]);
    } finally {
      setIsAnalyzing(false);
    }
  };

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
