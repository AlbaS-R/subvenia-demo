
import React from 'react';

export const CommentIcon: React.FC<{className?: string}> = ({ className }) => (
  <span className={`material-symbols-outlined leading-none ${className || ''}`}>chat_bubble</span>
);
