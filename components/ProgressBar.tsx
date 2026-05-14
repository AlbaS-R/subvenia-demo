import React from 'react';

interface ProgressBarProps {
  currentStage: number;
}

const TOTAL_STAGES = 6;

const ProgressBar: React.FC<ProgressBarProps> = ({ currentStage }) => {
  const progressPercentage = currentStage > 1 ? ((currentStage - 1) / (TOTAL_STAGES - 1)) * 100 : 0;

  return (
    <div className="w-full max-w-xs">
      <div className="w-full bg-muted rounded-full h-1.5">
        <div 
          className="bg-tertiary h-1.5 rounded-full transition-all duration-500 ease-out" 
          style={{ width: `${progressPercentage}%` }}>
        </div>
      </div>
    </div>
  );
};

export default ProgressBar;