export const APP_NAME = 'Household Expenses';
export const CURRENCY = 'INR';
export const LOCALE = 'en-IN';
export const MAX_ITEM_LENGTH = 80;

// Fixed household members. Keep these IDs in sync with supabase/schema.sql.
export const HOUSEHOLD_MEMBERS = [
  { id: 'malkeet-singh', display_name: 'Malkeet Singh', common_share_percent: 33.3333 },
  { id: 'priyanka-tyagi', display_name: 'Priyanka Tyagi', common_share_percent: 66.6667 },
  { id: 'dheeraj-kumar', display_name: 'Dheeraj Kumar', common_share_percent: 0 },
] as const;
