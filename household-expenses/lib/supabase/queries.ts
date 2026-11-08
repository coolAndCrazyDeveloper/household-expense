import type {
  Expense,
  ExpenseDraft,
  HouseholdMember,
  UUID,
} from '../../common/types';

import { getSupabaseClient } from './client';

export async function loadHouseholdData() {
  const client = getSupabaseClient();

  const [memberResult, expenseResult] = await Promise.all([
    client
      .from('household_members')
      .select('*')
      .order('display_order'),

    client
      .from('household_expenses')
      .select('*')
      .order('expense_date', { ascending: false })
      .order('created_at', { ascending: false }),
  ]);

  if (memberResult.error) throw memberResult.error;
  if (expenseResult.error) throw expenseResult.error;

  return {
    members: (memberResult.data ?? []) as HouseholdMember[],
    expenses: (expenseResult.data ?? []) as Expense[],
  };
}

export async function addExpense(
  userId: UUID,
  draft: ExpenseDraft
): Promise<void> {
  const { error } = await getSupabaseClient()
    .from('household_expenses')
    .insert({
      created_by: userId,
      amount: draft.amount,
      item: draft.item.trim(),
      is_common: draft.isCommon,
      member_ids: draft.isCommon ? [] : draft.memberIds,
      expense_date: draft.expenseDate,
    });

  if (error) throw error;
}

export async function updateExpense(
  id: UUID,
  changes: {
    item: string;
    amount: number;
  }
): Promise<void> {
  const { error } = await getSupabaseClient()
    .from('household_expenses')
    .update({
      item: changes.item.trim(),
      amount: changes.amount,
    })
    .eq('id', id);

  if (error) throw error;
}

export async function deleteExpense(id: UUID): Promise<void> {
  const { error } = await getSupabaseClient()
    .from('household_expenses')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function deleteExpenseMonth(
  monthKey: string
): Promise<void> {
  const [year, month] = monthKey.split('-').map(Number);

  const start = `${monthKey}-01`;

  const lastDay = new Date(year, month, 0).getDate();

  const end = `${year}-${String(month).padStart(2, '0')}-${String(
    lastDay
  ).padStart(2, '0')}`;

  const { error } = await getSupabaseClient()
    .from('household_expenses')
    .delete()
    .gte('expense_date', start)
    .lte('expense_date', end);

  if (error) throw error;
}

export async function updateCommonShares(
  updates: Array<{
    id: string;
    common_share_percent: number;
  }>
): Promise<void> {
  const { error } = await getSupabaseClient().rpc(
    'update_household_common_shares',
    {
      p_shares: updates,
    }
  );

  if (error) throw error;
}