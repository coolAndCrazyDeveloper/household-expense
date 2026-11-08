# Household Expenses

A mobile-first Next.js expense tracker for one shared household. The app opens directly on the dashboard. There are no login, signup, room creation, invite-code, or join-room screens.

## Fixed members

- Malkeet Singh — 33.3333% of Common expenses
- Priyanka Tyagi — 66.6667% of Common expenses
- Dheeraj Kumar — 0% of Common expenses

The member list is configured in `common/constants/app.ts` and seeded in `supabase/schema.sql`.

## Stack

- Next.js 15 / React 19 / TypeScript
- Supabase Postgres
- Supabase anonymous authentication (background only; no visible auth UI)
- Supabase Realtime

## Setup

1. Create a Supabase project.
2. In Supabase Authentication settings, enable **Allow anonymous sign-ins**.
3. In SQL Editor, run the complete `supabase/schema.sql` script. It creates `household_members` and `household_expenses`; the old room tables, if present, are left untouched and are no longer used by this frontend.
4. Copy `.env.local.example` to `.env.local` and set:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_PUBLISHABLE_OR_ANON_KEY
   ```

5. Install and run:

   ```bash
   npm install
   npm run dev
   ```

6. Open http://localhost:3000. The dashboard opens directly.

## Expense rules

- **Common:** allocated according to configured common percentages.
- **Shared:** equally split among selected members.
- **Individual:** if exactly one member is selected, that member carries the full amount.

## Important access/security note

This version intentionally has one shared dataset and no room/invite barrier. Any person who can access the public website can create an anonymous session and, under the included RLS policies, read or change this household's expenses. Use this only for a private/trusted group. Do not expose it as a public app with sensitive financial information. For stronger privacy, add a shared access code or proper user authentication later.

Supabase anonymous identities are stored per browser. Clearing browser data can create a new anonymous identity, but the household's expense records remain in the shared database.
