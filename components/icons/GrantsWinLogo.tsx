
import React from 'react';

export const GrantsWinLogo: React.FC<{className?: string}> = ({ className }) => (
  <div className={`font-poppins font-bold text-xl leading-none tracking-wide grantswin-logo ${className}`}>
    <span className="text-tertiary grants-part">GRANTS</span>
    <span className="text-primary win-part">WIN.AI</span>
  </div>
);
