
import React from 'react';

export const LayoutGridIcon: React.FC<{className?: string}> = ({ className }) => (
  <span className={`material-symbols-outlined leading-none ${className || ''}`}>grid_view</span>
);
