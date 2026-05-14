
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'dark' | 'outline' | 'destructive' | 'ghost' | 'hero-primary' | 'hero-outline' | 'color_secundario' | 'tertiary';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  className,
  ...props
}) => {
  const baseClasses = "inline-flex items-center justify-center font-semibold rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform-gpu font-poppins border border-white/10 backdrop-blur-md";

  const variantClasses = {
    // --- Standard Variants ---
    primary: 'bg-primary text-primary-foreground hover:bg-primary-hover focus:ring-primary shadow-[0_0_32px_rgba(68,237,204,0.25)] hover:-translate-y-0.5',
    secondary: 'bg-gradient-to-r from-secondary-500 to-primary-400 text-white hover:brightness-110 focus:ring-secondary-500 shadow-[0_12px_30px_rgba(59,130,246,0.3)] hover:-translate-y-0.5',
    dark: 'bg-white/10 text-neutral-100 hover:bg-white/15 focus:ring-white/30 shadow-[0_10px_24px_rgba(0,0,0,0.28)] hover:-translate-y-0.5',
    outline: 'bg-transparent text-neutral-200 border border-white/20 hover:bg-white/10 focus:ring-primary-400',
    color_secundario: 'bg-gradient-to-r from-secondary-500 to-primary-400 text-white hover:brightness-110 focus:ring-secondary-500 shadow-[0_12px_30px_rgba(59,130,246,0.3)] hover:-translate-y-0.5',
    tertiary: 'bg-tertiary text-tertiary-foreground hover:bg-tertiary-hover focus:ring-tertiary-500 shadow-[0_12px_30px_rgba(0,223,129,0.3)] hover:-translate-y-0.5',

    // --- NEW Utility Variants ---
    destructive: 'bg-gradient-to-r from-red-600 to-red-500 text-white hover:from-red-500 hover:to-red-400 focus:ring-red-500 shadow-[0_10px_24px_rgba(220,38,38,0.28)] hover:-translate-y-0.5',
    ghost: 'bg-transparent text-neutral-300 border-transparent hover:bg-white/10 hover:text-white',

    // --- NEW Hero Section Variants ---
    'hero-primary': 'bg-primary text-primary-foreground font-bold hover:brightness-110 hover:-translate-y-0.5 shadow-[0_0_40px_rgba(68,237,204,0.35)] border-transparent focus:ring-primary',
    'hero-outline': 'bg-white/10 text-white border border-white/40 hover:bg-white/20 hover:-translate-y-0.5 shadow-[0_10px_24px_rgba(0,0,0,0.3)] backdrop-blur-sm focus:ring-white/50',
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-base',
  };
   
  // Determine if spinner should be white or dark
  const useWhiteSpinner = ['primary', 'dark', 'destructive', 'hero-outline', 'color_secundario'].includes(variant);

  const loadingSpinner = (
    <span className={`material-symbols-outlined animate-spin -ml-1 mr-3 text-xl leading-none ${useWhiteSpinner ? 'text-white' : 'text-neutral-800 dark:text-neutral-100'}`}>progress_activity</span>
  );

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className || ''}`}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading && loadingSpinner}
      {children}
    </button>
  );
};
