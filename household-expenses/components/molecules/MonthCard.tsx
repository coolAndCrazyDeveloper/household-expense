import { CalendarDays, ChevronRight, Trash2 } from 'lucide-react';
import { formatMonth } from '../../common/utils/date';
import { formatMoney } from '../../common/utils/format';
import { Button } from '../atoms/Button';

export function MonthCard({ month, count, total, onOpen, onDelete }: {
  month: string; count: number; total: number; onOpen: () => void; onDelete: () => void;
}) {
  return <article className="month-card">
    <button className="month-open" onClick={onOpen}>
      <span className="month-icon"><CalendarDays size={18}/></span>
      <span className="month-info"><b>{formatMonth(month)}</b><small>{count} expenses</small></span>
      <strong>{formatMoney(total)}</strong><ChevronRight size={18}/>
    </button>
    <div className="month-actions"><Button variant="ghost" onClick={onDelete}><Trash2 size={14}/> Delete month</Button></div>
  </article>;
}
