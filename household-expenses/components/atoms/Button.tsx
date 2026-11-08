import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  fullWidth?: boolean;
  children: ReactNode;
};

export function Button({ variant = 'primary', fullWidth = false, className = '', children, ...props }: Props) {
  return <button className={`button button-${variant}${fullWidth ? ' button-full' : ''} ${className}`} {...props}>{children}</button>;
}
