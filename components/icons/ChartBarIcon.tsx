
import React from 'react';

export const ChartBarIcon: React.FC<{className?: string}> = ({ className }) => (
  <span className={`material-symbols-outlined leading-none ${className || ''}`}>bar_chart</span>
);
