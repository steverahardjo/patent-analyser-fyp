import React from 'react';
import { Message } from '../types';
import { User, Bot } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import type { Components } from 'react-markdown';

interface ChatMessageProps {
  message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.sender === 'user';
  
  // Custom components for markdown elements
  const components: Components = {
    // Style for headings with adjusted sizes and spacing
    h1: ({ children, ...props }) => (
      <h1 className="text-3xl font-bold mb-6 text-gray-900" {...props}>
        {children}
      </h1>
    ),
    h2: ({ children, ...props }) => (
      <h2 className="text-2xl font-semibold mb-5 text-gray-800" {...props}>
        {children}
      </h2>
    ),
    h3: ({ children, ...props }) => (
      <h3 className="text-xl font-medium mb-4 text-gray-700" {...props}>
        {children}
      </h3>
    ),
    
    // Style for paragraphs with good spacing
    p: ({ children, ...props }) => (
      <p className="mb-4 text-base leading-relaxed" {...props}>
        {children}
      </p>
    ),
    
    // Style for lists with proper spacing
    ul: ({ children, ...props }) => (
      <ul className="list-disc list-inside mb-4 space-y-2" {...props}>
        {children}
      </ul>
    ),
    ol: ({ children, ...props }) => (
      <ol className="list-decimal list-inside mb-4 space-y-2" {...props}>
        {children}
      </ol>
    ),
    li: ({ children, ...props }) => (
      <li className="ml-4 mb-2" {...props}>
        {children}
      </li>
    ),
    a: ({ children, href, ...props }) => (
      <a
        href={href}
        className="text-blue-600 underline hover:text-blue-800"
        {...props}
      >
        {children}
      </a>
    ),    
    
    // Style for code blocks with fixed TypeScript error
    code: ({ className, children, ...props }) => {
      const match = /language-(\w+)/.exec(className || '');
      return !match ? (
        <code className="bg-gray-100 rounded px-1.5 py-0.5 font-mono text-sm" {...props}>
          {children}
        </code>
      ) : (
        <code className="block bg-gray-100 rounded p-4 font-mono text-sm overflow-x-auto my-4" {...props}>
          {children}
        </code>
      );
    },
    
    // Style for emphasis
    em: ({ children, ...props }) => (
      <em className="italic" {...props}>
        {children}
      </em>
    ),
    strong: ({ children, ...props }) => (
      <strong className="font-bold" {...props}>
        {children}
      </strong>
    ),
  };
  
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex ${isUser ? 'flex-row-reverse max-w-md' : 'flex-row max-w-3xl'}`}>
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
          <div className={isUser ? 'text-white' : 'text-gray-800'}>
            {isUser ? (
              // message.content
              <div dangerouslySetInnerHTML={{ __html: message.content }} />
            ) : (
              <ReactMarkdown components={components}>{message.content}</ReactMarkdown>
            )}
          </div>
          <div className={`text-xs mt-1 ${isUser ? 'text-blue-200' : 'text-gray-500'}`}>
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;