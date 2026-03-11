'use client';

import { forwardRef } from 'react';
import clsx from 'clsx';

type ButtonVariant = 'primary' | 'secondary' | 'accent' | 'ghost' | 'outline' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-rsk-primary text-rsk-bg hover:bg-rsk-primaryDark hover:shadow-rsk-glow active:scale-[0.98] border border-rsk-primary/30',
  secondary:
    'bg-rsk-secondary text-rsk-text hover:bg-[#232d3f] border border-rsk-border active:scale-[0.98]',
  accent:
    'bg-rsk-accent/20 text-rsk-accent hover:bg-rsk-accent/30 border border-rsk-accent/40 hover:shadow-rsk-glow-accent active:scale-[0.98]',
  ghost:
    'bg-transparent text-rsk-muted hover:text-rsk-text hover:bg-rsk-secondary/50 border border-transparent active:scale-[0.98]',
  outline:
    'bg-transparent text-rsk-primary border border-rsk-primary/60 hover:bg-rsk-primary/10 active:scale-[0.98]',
  danger:
    'bg-rsk-error/20 text-rsk-error border border-rsk-error/40 hover:bg-rsk-error/30 active:scale-[0.98]',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm rounded-lg',
  md: 'px-5 py-2.5 text-sm font-medium rounded-xl',
  lg: 'px-6 py-4 text-base font-semibold rounded-xl',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      fullWidth,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={clsx(
          'inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100',
          variantStyles[variant],
          sizeStyles[size],
          fullWidth && 'w-full',
          className
        )}
        {...props}
      >
        {isLoading ? (
          <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : (
          leftIcon
        )}
        {children}
        {!isLoading && rightIcon}
      </button>
    );
  }
);

Button.displayName = 'Button';
