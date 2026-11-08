import { History, Home, Plus, Settings } from 'lucide-react';
import type { AppTab } from '../../common/types';
const ITEMS = [
  { id: 'dashboard' as const, label: 'Home', Icon: Home },
  { id: 'add' as const, label: 'Add', Icon: Plus },
  { id: 'history' as const, label: 'History', Icon: History },
  { id: 'settings' as const, label: 'Settings', Icon: Settings },
];
export function BottomNavigation({ active, onChange }: { active: AppTab; onChange: (tab: AppTab) => void }) {
  return <nav className="bottom-nav" aria-label="Main navigation">{ITEMS.map(({ id, label, Icon }) => <button key={id} className={active === id ? 'active' : ''} onClick={() => onChange(id)}><Icon size={19}/><span>{label}</span></button>)}</nav>;
}
