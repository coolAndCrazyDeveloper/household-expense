'use client';

import { useMemo } from 'react';
import { CalendarDays, Plus } from 'lucide-react';

import type { Expense, HouseholdMember } from '../../common/types';

import {
  getCurrentMonth,
  getMonthKey,
  formatMonth,
} from '../../common/utils/date';

import { formatMoney } from '../../common/utils/format';

import {
  calculateBreakdown,
  getExpenseMemberLabel,
} from '../../common/utils/expense';

import { Button } from '../../components/atoms/Button';
import { EmptyState } from '../../components/atoms/EmptyState';
import { SectionHeading } from '../../components/molecules/SectionHeading';
import { MemberSummary } from '../../components/molecules/MemberSummary';
import { ExpenseRow } from '../../components/molecules/ExpenseRow';

interface Props {
  expenses: Expense[];
  members: HouseholdMember[];
  onAdd: () => void;
  onHistory: () => void;

  onUpdateExpense: (
    id: string,
    changes: { item: string; amount: number }
  ) => Promise<void>;

  onDeleteExpense: (id: string) => Promise<void>;
}

export function DashboardView({
  expenses,
  members,
  onAdd,
  onHistory,
  onUpdateExpense,
  onDeleteExpense,
}: Props) {
  const currentMonth = getCurrentMonth();

  const currentExpenses = useMemo(
    () =>
      expenses.filter(
        (expense) => getMonthKey(expense.expense_date) === currentMonth
      ),
    [expenses, currentMonth]
  );

  const breakdown = useMemo(
    () => calculateBreakdown(currentExpenses, members),
    [currentExpenses, members]
  );

  const total = currentExpenses.reduce(
    (sum, expense) => sum + Number(expense.amount),
    0
  );

  const recent = currentExpenses.slice(0, 5);

  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">YOUR HOUSEHOLD</span>
          <h1>Dashboard</h1>
        </div>

        <span className="month-chip">
          <CalendarDays size={14} />
          {formatMonth(currentMonth)}
        </span>
      </div>

      <section className="total-card">
        <span>Total expense this month</span>
        <strong>{formatMoney(total)}</strong>
        <small>{currentExpenses.length} transactions</small>
      </section>

      <SectionHeading title="Member breakdown" />

      {members.length ? (
        <MemberSummary rows={breakdown} />
      ) : (
        <EmptyState title="No household members" />
      )}

      <p className="helper-note">
        Common expenses are allocated using each member's configured common
        share. Other expenses are split equally among selected members.
      </p>

      <SectionHeading
        title="Recent expenses"
        action={
          <button className="inline-link" onClick={onHistory}>
            View all →
          </button>
        }
      />

      {recent.length ? (
        <div className="expense-list">
          {recent.map((expense) => (
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

      <Button fullWidth onClick={onAdd}>
        <Plus size={18} />
        Add expense
      </Button>
    </>
  );
}