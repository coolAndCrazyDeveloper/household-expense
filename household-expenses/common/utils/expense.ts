import type { Expense, HouseholdMember, MemberBreakdown } from '../types';

/** Common: allocated by configured percentages. Shared: equally split among selected members. */
export function calculateBreakdown(expenses: Expense[], members: HouseholdMember[]): MemberBreakdown[] {
  const result = new Map<string, MemberBreakdown>();
  members.forEach((member) => result.set(member.id, { member, common: 0, shared: 0, individual: 0, total: 0 }));

  expenses.forEach((expense) => {
    if (expense.is_common) {
      members.forEach((member) => {
        const row = result.get(member.id);
        if (row) row.common += Number(expense.amount) * (Number(member.common_share_percent) / 100);
      });
      return;
    }

    const selected = expense.member_ids.map((id) => result.get(id)).filter((row): row is MemberBreakdown => Boolean(row));
    if (!selected.length) return;
    const share = Number(expense.amount) / selected.length;
    selected.forEach((row) => {
      if (selected.length === 1) row.individual += share;
      else row.shared += share;
    });
  });

  return Array.from(result.values()).map((row) => ({ ...row, total: row.common + row.shared + row.individual }));
}

export function getExpenseMemberLabel(expense: Expense, members: HouseholdMember[]): string {
  if (expense.is_common) return 'Common';
  return expense.member_ids.map((id) => members.find((member) => member.id === id)?.display_name).filter(Boolean).join(', ');
}
