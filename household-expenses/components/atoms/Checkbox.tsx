import type { InputHTMLAttributes } from 'react';

interface Props extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  title: string;
  description?: string;
}

export function Checkbox({ title, description, className = '', ...props }: Props) {
  return <label className={`checkbox-card ${props.checked ? 'is-selected' : ''} ${props.disabled ? 'is-disabled' : ''} ${className}`}>
    <input type="checkbox" {...props} />
    <span><b>{title}</b>{description && <small>{description}</small>}</span>
  </label>;
}
