import React from 'react';
import { Message } from '../types';
import { User, Bot } from 'lucide-react';

interface ChatMessageProps {
  message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.sender === 'user';
  
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex max-w-md ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        <div 
          className={`flex items-center justify-center h-8 w-8 rounded-full flex-shrink-0 ${
            isUser ? 'bg-blue-100 ml-2' : 'bg-purple-100 mr-2'
          }`}
        >
          {isUser ? (
            <User className="h-4 w-4 text-blue-600" />
          ) : (
            <Bot className="h-4 w-4 text-purple-600" />
          )}
        </div>
        
        <div 
          className={`px-4 py-2 rounded-lg ${
            isUser 
              ? 'bg-blue-600 text-white rounded-tr-none' 
              : 'bg-white border border-gray-200 shadow-sm rounded-tl-none'
          }`}
        >
          <div
            className={isUser ? 'text-white' : 'text-gray-800'}
            dangerouslySetInnerHTML={{ __html: message.content }}
          />
          <div className={`text-xs mt-1 ${isUser ? 'text-blue-200' : 'text-gray-500'}`}>
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;