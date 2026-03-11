'use client';

import clsx from 'clsx';

type AlertVariant = 'success' | 'error' | 'warning' | 'info';

const variantStyles: Record<AlertVariant, { container: string; icon: string }> = {
  success:
    { container: 'bg-rsk-primary/10 border-rsk-primary/40 text-rsk-primary', icon: 'text-rsk-primary' },
  error:
    { container: 'bg-rsk-error/10 border-rsk-error/40 text-rsk-error', icon: 'text-rsk-error' },
  warning:
    { container: 'bg-rsk-warning/10 border-rsk-warning/40 text-rsk-warning', icon: 'text-rsk-warning' },
  info:
    { container: 'bg-rsk-accent/10 border-rsk-accent/40 text-rsk-accent', icon: 'text-rsk-accent' },
};

const icons: Record<AlertVariant, React.ReactNode> = {
  success: (
    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  ),
  error: (
    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  warning: (
    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
      />
    </svg>
  ),
  info: (
    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  ),
};

export interface AlertProps {
  variant: AlertVariant;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export function Alert({ variant, title, children, className }: AlertProps) {
  const styles = variantStyles[variant];
  return (
    <div
      className={clsx(
        'rounded-xl border p-4 sm:p-5 flex gap-3 animate-fade-in',
        styles.container,
        className
      )}
    >
      <span className={styles.icon}>{icons[variant]}</span>
      <div className="flex-1 min-w-0">
        {title && <p className="font-semibold mb-1">{title}</p>}
        <div className="text-sm opacity-95">{children}</div>
      </div>
    </div>
  );
}
