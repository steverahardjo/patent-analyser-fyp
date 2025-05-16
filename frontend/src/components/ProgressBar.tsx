import React, { useEffect, useState } from 'react';

interface ProgressBarProps {
  progress: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ progress }) => {
  const [width, setWidth] = useState(0);
  
  useEffect(() => {
    // Animate the progress change
    const timer = setTimeout(() => {
      setWidth(progress);
    }, 10);
    
    return () => clearTimeout(timer);
  }, [progress]);

  return (
    <div className="w-full">
      <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${
            width < 100 ? 'bg-blue-500' : 'bg-green-500'
          }`}
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;