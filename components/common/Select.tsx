
import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  children: React.ReactNode;
}

export const Select: React.FC<SelectProps> = ({ label, children, className, ...props }) => {
  const baseClasses = "block w-full px-4 py-3 border rounded-xl shadow-sm focus:outline-none text-base border-white/10 bg-card/70 text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/40 focus:border-primary/60 font-roboto backdrop-blur-md transition-all";

  return (
    <div>
      <label className="block text-base font-medium text-foreground mb-1 font-poppins">{label}</label>
      <select
        className={`${baseClasses} ${className}`}
        {...props}
      >
        {children}
      </select>
    </div>
  );
};
