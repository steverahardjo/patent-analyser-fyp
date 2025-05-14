import React, { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import ActionButtons from './ActionButtons';
import ChatMessage from './ChatMessage';
import { Message, PDFDocument, ActionType } from '../types';

interface ChatInterfaceProps {
  document: PDFDocument;
  messages: Message[];
  onSendMessage: (content: string) => void;
  onAction: (action: ActionType) => void;
  isAnalyzing: boolean;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  document,
  messages,
  onSendMessage,
  onAction,
  isAnalyzing
}) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isAnalyzing) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  return (
    <div className="w-full h-full flex flex-col rounded-lg border border-gray-200 bg-white shadow-sm">
      <div className="p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-medium text-gray-900">{document.name}</h2>
            <p className="text-sm text-gray-500">
              Uploaded on {document.uploadDate.toLocaleDateString()}
            </p>
          </div>
          <ActionButtons onAction={onAction} isDisabled={isAnalyzing} />
        </div>
      </div>
      
      <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
        <div className="space-y-4">
          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}
          <div ref={messagesEndRef} />
          
          {isAnalyzing && (
            <div className="flex items-center space-x-2 p-3 bg-white rounded-lg shadow-sm border border-gray-200 max-w-md">
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse delay-150"></div>
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse delay-300"></div>
              <span className="text-sm text-gray-500">Analyzing...</span>
            </div>
          )}
        </div>
      </div>
      
      <div className="border-t border-gray-200 p-4 bg-white">
        <form onSubmit={handleSubmit} className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isAnalyzing}
            placeholder={isAnalyzing ? "Processing..." : "Ask a question about this patent..."}
            className="flex-1 min-w-0 block w-full px-4 py-2 rounded-md border border-gray-300 focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100 disabled:text-gray-500"
          />
          <button
            type="submit"
            disabled={!input.trim() || isAnalyzing}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatInterface;