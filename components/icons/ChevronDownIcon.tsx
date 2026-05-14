
import React from 'react';

export const ChevronDownIcon: React.FC<{className?: string}> = ({ className }) => (
  <span className={`material-symbols-outlined leading-none ${className || ''}`}>expand_more</span>
);
