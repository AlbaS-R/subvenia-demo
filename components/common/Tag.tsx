
import React from 'react';

interface TagProps {
  children: React.ReactNode;
}

export const Tag: React.FC<TagProps> = ({ children }) => {
  return (
    <span className="inline-block bg-muted text-foreground/80 rounded-lg px-2.5 py-1 text-sm font-bold shadow-sm font-poppins">
      {children}
    </span>
  );
};
