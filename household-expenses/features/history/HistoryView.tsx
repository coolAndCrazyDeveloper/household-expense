'use client';

import { useMemo, useState } from 'react';
import { ArrowLeft } from 'lucide-react';

import type { Expense, HouseholdMember } from '../../common/types';

import {
  getCurrentMonth,
  getMonthKey,
  formatMonth,
} from '../../common/utils/date';

import { formatMoney } from '../../common/utils/format';
import { getExpenseMemberLabel } from '../../common/utils/expense';

import { EmptyState } from '../../components/atoms/EmptyState';
import { MonthCard } from '../../components/molecules/MonthCard';
import { ExpenseRow } from '../../components/molecules/ExpenseRow';
import { SectionHeading } from '../../components/molecules/SectionHeading';
import { ConfirmDialog } from '../../components/molecules/ConfirmDialog';

interface Props {
  expenses: Expense[];
  members: HouseholdMember[];

  onDeleteMonth: (month: string) => Promise<void>;

  onUpdateExpense: (
    id: string,
    changes: { item: string; amount: number }
  ) => Promise<void>;

  onDeleteExpense: (id: string) => Promise<void>;
}

export function HistoryView({
  expenses,
  members,
  onDeleteMonth,
  onUpdateExpense,
  onDeleteExpense,
}: Props) {
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [deletingMonth, setDeletingMonth] = useState<string | null>(null);

  const [busy, setBusy] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const months = useMemo(
    () =>
      Array.from(
        new Set([
          getCurrentMonth(),
          ...expenses.map((expense) => getMonthKey(expense.expense_date)),
        ])
      ).sort((a, b) => b.localeCompare(a)),
    [expenses]
  );

  async function confirmDeleteMonth() {
    if (!deletingMonth) return;

    setBusy(true);
    setDeleteError('');

    try {
      await onDeleteMonth(deletingMonth);

      setDeletingMonth(null);
      setSelectedMonth(null);
    } catch (error) {
      setDeleteError(
        error instanceof Error ? error.message : 'Unable to delete month.'
      );
    } finally {
      setBusy(false);
    }
  }

  if (selectedMonth) {
    const monthExpenses = expenses.filter(
      (expense) => getMonthKey(expense.expense_date) === selectedMonth
    );

    const total = monthExpenses.reduce(
      (sum, expense) => sum + Number(expense.amount),
      0
    );

    return (
      <>
        <div className="page-heading">
          <div>
            <span className="eyebrow">MONTHLY DETAILS</span>
            <h1>{formatMonth(selectedMonth)}</h1>
          </div>

          <button
            className="icon-button"
            onClick={() => setSelectedMonth(null)}
            aria-label="Back"
          >
            <ArrowLeft size={18} />
          </button>
        </div>

        <section className="total-card compact-total">
          <span>Total expense</span>
          <strong>{formatMoney(total)}</strong>
          <small>{monthExpenses.length} transactions</small>
        </section>

        <SectionHeading title="All expenses" />

        {monthExpenses.length ? (
          <div className="expense-list">
            {monthExpenses.map((expense) => (
              <ExpenseRow
                key={expense.id}
                expense={expense}
                memberLabel={getExpenseMemberLabel(expense, members)}
                onUpdate={onUpdateExpense}
                onDelete={onDeleteExpense}
              />
            ))}
          </div>
        ) : (
          <EmptyState />
        )}
      </>
    );
  }

  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">YOUR RECORDS</span>
          <h1>History</h1>
        </div>

        <span className="month-chip">
          {months.length} months
        </span>
      </div>

      <p className="muted history-intro">
        Choose a month to see its expenses and total.
      </p>

      {months.length ? (
        <div className="month-list">
          {months.map((month) => {
            const list = expenses.filter(
              (expense) => getMonthKey(expense.expense_date) === month
            );

            const monthTotal = list.reduce(
              (sum, expense) => sum + Number(expense.amount),
              0
            );

            return (
              <MonthCard
                key={month}
                month={month}
                count={list.length}
                total={monthTotal}
                onOpen={() => setSelectedMonth(month)}
                onDelete={() => {
                  setDeleteError('');
                  setDeletingMonth(month);
                }}
              />
            );
          })}
        </div>
      ) : (
        <EmptyState />
      )}

      {deletingMonth && (
        <ConfirmDialog
          title={`Delete ${formatMonth(deletingMonth)}?`}
          description="All expenses from this month will be permanently deleted for everyone using this household tracker."
          confirmLabel="Delete month"
          busy={busy}
          error={deleteError}
          onCancel={() => setDeletingMonth(null)}
          onConfirm={confirmDeleteMonth}
        />
      )}
    </>
  );
}