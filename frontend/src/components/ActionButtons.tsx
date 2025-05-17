import React from 'react';
import { FileText, Tag } from 'lucide-react';
import { ActionType } from '../types';

interface ActionButtonsProps {
  onAction: (action: ActionType) => void;
  isDisabled: boolean;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({ onAction, isDisabled }) => {
  const buttons = [
    {
      label: 'Summarise',
      icon: <FileText className="w-4 h-4 mr-2" />,
      action: 'summarise' as ActionType,
      color: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500',
    },
    {
      label: 'Classify',
      icon: <Tag className="w-4 h-4 mr-2" />,
      action: 'classify' as ActionType,
      color: 'bg-purple-600 hover:bg-purple-700 focus:ring-purple-500',
    }
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {buttons.map((button) => (
        <button
          key={button.action}
          onClick={() => onAction(button.action)}
          disabled={isDisabled}
          className={`inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md shadow-sm text-white ${button.color} focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 active:scale-95`}
        >
          {button.icon}
          {button.label}
        </button>
      ))}
    </div>
  );
};

export default ActionButtons;