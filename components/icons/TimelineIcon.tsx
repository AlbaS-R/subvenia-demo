
import React from 'react';

export const TimelineIcon: React.FC<{className?: string}> = ({ className }) => (
  <span className={`material-symbols-outlined leading-none ${className || ''}`}>timeline</span>
);
