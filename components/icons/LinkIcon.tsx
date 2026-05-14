
import React from 'react';

export const LinkIcon: React.FC<{className?: string}> = ({ className }) => (
  <span className={`material-symbols-outlined leading-none ${className || ''}`}>link</span>
);
