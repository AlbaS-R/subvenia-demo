
import React from 'react';

export const FileIcon: React.FC<{className?: string}> = ({ className }) => (
  <span className={`material-symbols-outlined leading-none ${className || ''}`}>article</span>
);
