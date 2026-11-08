import type { InputHTMLAttributes } from 'react';

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  hint?: string;
}

export function Input({ label, hint, id, className = '', ...props }: Props) {
  const inputId = id ?? props.name ?? label.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  return <div className="field">
    <label htmlFor={inputId}>{label}</label>
    <input id={inputId} className={className} {...props} />
    {hint && <small className="field-hint">{hint}</small>}
  </div>;
}
