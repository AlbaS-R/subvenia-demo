
import React from 'react';

export const CoinsIcon: React.FC<{className?: string}> = ({ className }) => (
    <span className={`material-symbols-outlined leading-none ${className || ''}`}>paid</span>
);
