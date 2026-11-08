export function Avatar({ name, index = 0 }: { name: string; index?: number }) {
  const initials = name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase()).join('');
  return <span className={`avatar avatar-${index % 5}`}>{initials || '?'}</span>;
}
