import { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import ChatInterface from '../components/ChatInterface';
import ConfirmDialog from '../components/PopUpConfirm';
import { Message, ActionType } from '../types';
import { useNavigationRoute } from '../hooks/useNavigation';
import axios from 'axios';

const BACKEND_URL = 'http://localhost:8000';

const ChatbotPage = () => {
  const { documentId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [patentInfo, setPatentInfo] = useState<any>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [nextPath, setNextPath] = useState<string | null>(null);
  const [isForceNavigate, setIsForceNavigate] = useState(false);

  // Intercept navigation attempts if a patent is loaded
  useNavigationRoute(!!patentInfo, (newUrl) => {
    const newPath = new URL(newUrl, window.location.origin).pathname;

    if (isForceNavigate) return true;

    if (newPath !== location.pathname) {
      setNextPath(newPath);
      setIsDialogOpen(true);
      return false;
    }

    return true;
  });

  const handleLeavePage = () => {
    if (!nextPath) return;

    setIsForceNavigate(true);
    setTimeout(() => {
      navigate(nextPath);
      setIsDialogOpen(false);
      setNextPath(null);
      setIsForceNavigate(false);
    }, 0);
  };

  const handleCancel = () => {
    setIsDialogOpen(false);
    setNextPath(null);
  };

  // Load uploaded patent info
  useEffect(() => {
    if (!documentId) return;
    const stored = localStorage.getItem('uploadedPatentInfo');
    if (!stored) return;

    const parsed = JSON.parse(stored);
    if (parsed?.uploadDate) parsed.uploadDate = new Date(parsed.uploadDate);
    if (parsed?.id === documentId) setPatentInfo(parsed);
  }, [documentId]);

  // Restore chat history
  useEffect(() => {
    if (!documentId || messages.length > 0) return;
    const stored = localStorage.getItem('chatHistory');
    if (!stored) return;

    const parsed = JSON.parse(stored);
    const existingMessages = parsed[documentId];

    if (existingMessages?.length) {
      const hydrated = existingMessages.map((msg: Message) => ({
        ...msg,
        timestamp: new Date(msg.timestamp),
      }));
      setMessages(hydrated);
    }
  }, [documentId, messages.length]);

  // Persist messages
  useEffect(() => {
    if (!documentId || messages.length === 0) return;

    const stored = localStorage.getItem('chatHistory');
    const parsed = stored ? JSON.parse(stored) : {};
    parsed[documentId] = messages;

    localStorage.setItem('chatHistory', JSON.stringify(parsed));
  }, [messages, documentId]);

  // Handle user sending a message
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
        content: 'No PDF uploaded. Please upload a patent in the [Upload Page](/upload) to continue.',
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

  // Handle user-triggered actions
  const handleAction = (action: ActionType) => {
    const actionMessage: Message = {
      id: Date.now().toString(),
      content: `Action Requested: Can you ${action} this patent?`,
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
            responseContent = patentInfo.summ || 'No summary available.';
            break;
          case 'classify':
            responseContent = patentInfo.classification_result || 'No classification result.';
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
    <>
      <ChatInterface
        document={patentInfo}
        messages={messages}
        onSendMessage={handleSendMessage}
        onAction={handleAction}
        isAnalyzing={isAnalyzing}
      />

      <ConfirmDialog
        isOpen={isDialogOpen}
        title="Leave chat session?"
        message="This will discard your current chat history for this patent. Are you sure?"
        confirmLabel="Yes, leave"
        cancelLabel="Stay here"
        onConfirm={handleLeavePage}
        onCancel={handleCancel}
      />
    </>
  );
};

export default ChatbotPage;
