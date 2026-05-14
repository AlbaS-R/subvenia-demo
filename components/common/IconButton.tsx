
import React from 'react';
import { Tooltip } from './Tooltip';

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: string;
  tooltip?: string;
  tooltipPosition?: 'top' | 'bottom' | 'left' | 'right';
  isActive?: boolean;
}

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(({ icon, tooltip, tooltipPosition = 'right', className, isActive, ...props }, ref) => {
  const button = (
    <button
      ref={ref}
      className={`flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-300 border border-white/10 backdrop-blur-md shadow-[0_8px_22px_rgba(0,0,0,0.22)] ${
        isActive
          ? 'bg-primary/25 text-primary-100 border-primary/30 shadow-[0_8px_22px_rgba(139,92,246,0.3)]'
          : 'bg-white/5 text-neutral-300 hover:bg-white/10 hover:text-white hover:border-white/20 hover:-translate-y-0.5'
      } ${className}`}
      {...props}
    >
      <span className="material-symbols-outlined">{icon}</span>
    </button>
  );

  if (tooltip) {
    return (
      <Tooltip content={tooltip} position={tooltipPosition}>
        {button}
      </Tooltip>
    );
  }

  return button;
});
