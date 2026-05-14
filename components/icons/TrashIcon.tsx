import React from 'react';

export const TrashIcon: React.FC<{className?: string}> = ({ className }) => (
  <span className={`material-symbols-outlined ${className}`}>delete</span>
);