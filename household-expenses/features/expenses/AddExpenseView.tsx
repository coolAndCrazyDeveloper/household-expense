'use client';
import { useState } from 'react';
import { Plus } from 'lucide-react';
import type { ExpenseDraft, HouseholdMember } from '../../common/types';
import { MAX_ITEM_LENGTH } from '../../common/constants/app';
import { toLocalDateString } from '../../common/utils/date';
import { Button } from '../../components/atoms/Button';
import { Input } from '../../components/atoms/Input';
import { Checkbox } from '../../components/atoms/Checkbox';
import { Alert } from '../../components/atoms/Alert';

export function AddExpenseView({ members, onSave, onCancel }: {
  members: HouseholdMember[]; onSave: (draft: ExpenseDraft) => Promise<void>; onCancel: () => void;
}) {
  const [amount, setAmount] = useState('');
  const [item, setItem] = useState('');
  const [isCommon, setIsCommon] = useState(true);
  const [memberIds, setMemberIds] = useState<string[]>([]);
  const [expenseDate, setExpenseDate] = useState(toLocalDateString());
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  function toggleMember(id: string) {
    setMemberIds((current) => current.includes(id) ? current.filter((memberId) => memberId !== id) : [...current, id]);
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault(); setError('');
    const numericAmount = Number(amount);
    if (!item.trim() || !Number.isFinite(numericAmount) || numericAmount <= 0) { setError('Enter a valid item name and amount.'); return; }
    if (!isCommon && memberIds.length === 0) { setError('Select at least one member.'); return; }
    setSaving(true);
    try { await onSave({ amount: numericAmount, item: item.trim(), isCommon, memberIds, expenseDate }); }
    catch (caught) { setError(caught instanceof Error ? caught.message : 'Unable to save expense.'); }
    finally { setSaving(false); }
  }

  return <>
    <div className="page-heading"><div><span className="eyebrow">NEW TRANSACTION</span><h1>Add expense</h1></div><button className="icon-button" onClick={onCancel} aria-label="Cancel">×</button></div>
    <form className="panel stack-form" onSubmit={submit}>
      <Input label="Amount (₹)" type="number" min="0.01" step="0.01" inputMode="decimal" placeholder="0.00" value={amount} onChange={(event) => setAmount(event.target.value)} required className="amount-input"/>
      <Input label="Item name" type="text" placeholder="e.g. Groceries, Electricity, Petrol" value={item} onChange={(event) => setItem(event.target.value)} maxLength={MAX_ITEM_LENGTH} required/>
      <div className="field"><label>Who should share this expense?</label>
        <Checkbox title="Common" description="Use the household's configured common split" checked={isCommon} onChange={(event) => setIsCommon(event.target.checked)}/>
        {members.map((member) => <Checkbox key={member.id} title={member.display_name} checked={!isCommon && memberIds.includes(member.id)} disabled={isCommon} onChange={() => toggleMember(member.id)}/>)}
      </div>
      {isCommon && <Alert tone="info">All household members are included automatically. Their configured common percentages determine responsibility.</Alert>}
      <Input label="Expense date" type="date" value={expenseDate} onChange={(event) => setExpenseDate(event.target.value)} required/>
      {error && <Alert>{error}</Alert>}
      <Button type="submit" fullWidth disabled={saving}><Plus size={18}/>{saving ? 'Saving…' : 'Save expense'}</Button>
    </form>
  </>;
}
