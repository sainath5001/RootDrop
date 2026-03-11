'use client';

import clsx from 'clsx';

export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg' | 'full';
}

const sizeClasses = {
  sm: 'max-w-2xl',
  md: 'max-w-4xl',
  lg: 'max-w-7xl',
  full: 'max-w-[1400px]',
};

export function Container({
  className,
  size = 'lg',
  children,
  ...props
}: ContainerProps) {
  return (
    <div
      className={clsx(
        'mx-auto w-full px-4 sm:px-6 lg:px-8',
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
