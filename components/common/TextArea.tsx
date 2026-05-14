
import React, { useRef, useEffect } from 'react';

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
}

export const TextArea: React.FC<TextAreaProps> = ({ label, className, onChange, ...props }) => {
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const baseClasses = "block w-full px-4 py-3 border rounded-xl shadow-sm focus:outline-none text-base border-white/10 bg-card/70 text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/40 focus:border-primary/60 resize-none overflow-hidden font-roboto backdrop-blur-md transition-all";

  const adjustHeight = () => {
    const el = textAreaRef.current;
    if (el) {
      el.style.height = 'auto';
      el.style.height = `${el.scrollHeight}px`;
    }
  };

  useEffect(() => {
    adjustHeight();
  }, [props.value]);

  // FIX: The component was using onInput which caused a type error, and its event handler was not being called
  // when parents used onChange. This has been refactored to use onChange consistently, which resolves the
  // type error and fixes the auto-height functionality.
  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    adjustHeight();
    if (onChange) {
      onChange(event);
    }
  };

  return (
    <div>
      {label && <label className="block text-base font-medium text-foreground mb-1 font-poppins">{label}</label>}
      <textarea
        ref={textAreaRef}
        className={`${baseClasses} ${className}`}
        onChange={handleChange}
        rows={1}
        {...props}
      />
    </div>
  );
};
