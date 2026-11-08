import { useState } from 'react';
import type { FormEvent } from 'react';
import { Pencil, Receipt, Trash2 } from 'lucide-react';

import type { Expense } from '../../common/types';
import { formatMoney } from '../../common/utils/format';

import { Button } from '../atoms/Button';
import { Input } from '../atoms/Input';
import { ConfirmDialog } from './ConfirmDialog';

interface Props {
  expense: Expense;
  memberLabel: string;

  onUpdate?: (
    id: string,
    changes: {
      item: string;
      amount: number;
    }
  ) => Promise<void>;

  onDelete?: (id: string) => Promise<void>;
}

export function ExpenseRow({
  expense,
  memberLabel,
  onUpdate,
  onDelete,
}: Props) {
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [item, setItem] = useState(expense.item);
  const [amount, setAmount] = useState(String(expense.amount));

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function saveEdit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!onUpdate || !item.trim()) return;

    const parsedAmount = Number(amount);

    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setError('Please enter a valid amount.');
      return;
    }

    setBusy(true);
    setError('');

    try {
      await onUpdate(expense.id, {
        item: item.trim(),
        amount: parsedAmount,
      });

      setEditing(false);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Unable to update expense.'
      );
    } finally {
      setBusy(false);
    }
  }

  async function confirmDelete() {
    if (!onDelete) return;

    setBusy(true);
    setError('');

    try {
      await onDelete(expense.id);
      setDeleting(false);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Unable to delete expense.'
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <article className="expense-row">
        <span className="expense-icon">
          <Receipt size={17} />
        </span>

        <span className="expense-meta">
          <b>{expense.item}</b>

          <small>
            {new Intl.DateTimeFormat('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            }).format(new Date(`${expense.expense_date}T00:00:00`))}
            {' · '}
            {memberLabel}
          </small>
        </span>

        <strong>{formatMoney(Number(expense.amount))}</strong>

        <span className="expense-actions">
          {onUpdate && (
            <button
              className="row-action"
              title="Edit expense"
              aria-label="Edit expense"
              onClick={() => {
                setItem(expense.item);
                setAmount(String(expense.amount));
                setError('');
                setEditing(true);
              }}
            >
              <Pencil size={15} />
            </button>
          )}

          {onDelete && (
            <button
              className="row-action row-action-danger"
              title="Delete expense"
              aria-label="Delete expense"
              onClick={() => {
                setError('');
                setDeleting(true);
              }}
            >
              <Trash2 size={15} />
            </button>
          )}
        </span>
      </article>

      {editing && (
        <div className="modal-backdrop">
          <form
            className="confirm-dialog expense-edit-dialog"
            onSubmit={saveEdit}
          >
            <h2>Edit expense</h2>

            <p>Update the expense name or amount.</p>

            <Input
              label="Expense name"
              value={item}
              onChange={(event) => setItem(event.target.value)}
              required
              autoFocus
            />

            <Input
              label="Amount (₹)"
              type="number"
              min="0.01"
              step="0.01"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              required
            />

            {error && <p className="inline-error">{error}</p>}

            <div className="dialog-actions">
              <Button
                type="button"
                variant="secondary"
                disabled={busy}
                onClick={() => setEditing(false)}
              >
                Cancel
              </Button>

              <Button
                type="submit"
                disabled={busy || !item.trim() || Number(amount) <= 0}
              >
                {busy ? 'Saving...' : 'Save changes'}
              </Button>
            </div>
          </form>
        </div>
      )}

      {deleting && (
        <ConfirmDialog
          title="Delete expense?"
          description={`Are you sure you want to delete "${expense.item}" (${formatMoney(
            Number(expense.amount)
          )})? This action cannot be undone.`}
          busy={busy}
          error={error}
          onCancel={() => setDeleting(false)}
          onConfirm={confirmDelete}
        />
      )}
    </>
  );
}