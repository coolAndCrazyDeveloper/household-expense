export function Alert({ children, tone = 'error' }: { children: React.ReactNode; tone?: 'error' | 'success' | 'info' }) {
  return <div className={`alert alert-${tone}`} role="status">{children}</div>;
}
