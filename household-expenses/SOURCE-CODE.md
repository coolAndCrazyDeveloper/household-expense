# Updated source code

The complete file-by-file source is included in this project folder. Main changes:

- `features/AppShell.tsx`: opens directly on Dashboard; no room onboarding.
- `providers/AppProvider.tsx`: anonymous background session and global household data loading.
- `lib/supabase/queries.ts`: reads/writes `household_members` and `household_expenses`.
- `common/constants/app.ts`: fixed member configuration.
- `common/types/index.ts`: removed room-specific types.
- `features/settings/MemberSettingsView.tsx`: configures common shares for fixed members.
- `supabase/schema.sql`: single-household schema and seed data.

See each file in the project directory for its full contents.
