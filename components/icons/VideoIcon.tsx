
import React from 'react';

export const VideoIcon: React.FC<{className?: string}> = ({ className }) => (
    <span className={`material-symbols-outlined leading-none ${className || ''}`}>videocam</span>
);
