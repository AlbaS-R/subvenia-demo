
import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  style?: React.CSSProperties;
}

export const Card: React.FC<CardProps> = ({ children, className = '', onClick, style }) => {
  return (
    <div 
      className={`glass-panel text-card-foreground p-6 rounded-2xl shadow-xl transition-all duration-300 ${onClick ? 'cursor-pointer hover:-translate-y-1 hover:shadow-2xl hover:border-primary/30' : ''} ${className}`}
      onClick={onClick}
      style={style}
    >
      {children}
    </div>
  );
};
