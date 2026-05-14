
import React from 'react';

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  description?: string;
}

export const Checkbox: React.FC<CheckboxProps> = ({ label, description, ...props }) => {
  return (
    <div className="relative flex items-start">
      <div className="flex h-6 items-center">
        <input
          type="checkbox"
          className="h-4 w-4 rounded border-input text-primary focus:ring-ring bg-card"
          {...props}
        />
      </div>
      <div className="ml-3 text-base leading-6">
        <label htmlFor={props.id} className={`font-medium text-foreground font-poppins ${props.disabled ? 'cursor-not-allowed text-muted-foreground' : 'cursor-pointer'}`}>
          {label}
        </label>
        {description && <p className={`text-sm text-muted-foreground font-roboto ${props.disabled ? 'italic' : ''}`}>{description}</p>}
      </div>
    </div>
  );
};
