
import React from 'react';

export const ImageIcon: React.FC<{className?: string}> = ({ className }) => (
  <span className={`material-symbols-outlined leading-none ${className || ''}`}>image</span>
);
