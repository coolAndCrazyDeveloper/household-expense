import { ReceiptText } from 'lucide-react';
export function EmptyState({ title = 'No expenses yet', description = 'Add your first expense to get started.' }: { title?: string; description?: string }) {
  return <div className="empty-state"><ReceiptText size={24}/><b>{title}</b><span>{description}</span></div>;
}
