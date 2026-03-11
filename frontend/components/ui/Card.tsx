'use client';

import { forwardRef } from 'react';
import clsx from 'clsx';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'bordered';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', padding = 'md', children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={clsx(
          'rounded-2xl transition-all duration-300',
          variant === 'default' && 'bg-rsk-card border border-rsk-border shadow-rsk',
          variant === 'elevated' &&
            'bg-rsk-card border border-rsk-border shadow-rsk hover:shadow-rsk-glow hover:border-rsk-primary/20',
          variant === 'bordered' && 'bg-rsk-secondary/50 border border-rsk-border',
          padding === 'none' && 'p-0',
          padding === 'sm' && 'p-4',
          padding === 'md' && 'p-6 sm:p-8',
          padding === 'lg' && 'p-8 sm:p-10',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';
