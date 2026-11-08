export type UUID = string;

export interface HouseholdMember {
  id: string;
  display_name: string;
  common_share_percent: number;
  created_at?: string;
}

export interface Expense {
  id: UUID;
  created_by: UUID;
  amount: number;
  item: string;
  is_common: boolean;
  member_ids: string[];
  expense_date: string;
  created_at: string;
}

export interface ExpenseDraft {
  amount: number;
  item: string;
  isCommon: boolean;
  memberIds: string[];
  expenseDate: string;
}

export interface MemberBreakdown {
  member: HouseholdMember;
  common: number;
  shared: number;
  individual: number;
  total: number;
}

export type AppTab = 'dashboard' | 'add' | 'history' | 'settings';
