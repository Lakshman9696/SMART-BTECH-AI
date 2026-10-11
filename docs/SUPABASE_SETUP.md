# Supabase setup

The app can use Supabase Auth and Postgres for student profiles. Until the required project settings are provided, it remains in clearly labeled local demo mode.

## Connect your project

1. Create a Supabase project, then open its Connect panel and copy the Project URL and publishable key.
2. Copy `.env.example` to `.env.local` in this project root and set `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`.
3. In the Supabase SQL Editor, run [`../supabase/schema.sql`](../supabase/schema.sql). This creates the profile table and owner-only RLS policies.
4. In Supabase Auth settings, configure the site URL and allowed redirect URLs for local development and your deployed app. Keep email confirmation enabled.
5. Restart Vite. Open Account Center from the avatar to create an account or sign in.

The browser client uses only the publishable key. Never add a service-role or secret key to a `VITE_*` variable or frontend file. The table grants access only to signed-in users and every policy checks that `auth.uid()` matches the row owner. Anonymous access is revoked.

## What is stored

The questionnaire profile is stored as JSON in `public.student_profiles`, keyed by the Supabase Auth user ID. Roadmap tasks and task status are stored inside the same profile JSON, so the existing owner-only RLS policy protects progress too; no second table is required. Sign-up, sign-in, password reset, and local-device sign-out are provided. The existing browser demo profile is not automatically copied to an account; users can re-enter it after connecting and signing in.

## Operations to configure

- Use a strong password policy and configure SMTP/email templates before production use.
- Add the production domain and callback URLs to Supabase Auth redirect allowlists.
- Enable MFA in Supabase Auth before requiring stronger account assurance.
- Consider adding account deletion and session-management UI before public launch.
- AI provider secrets still belong in a server/Edge Function, never this browser app.

Supabase's official [React Auth quickstart](https://supabase.com/docs/guides/auth/quickstarts/react) and [Row Level Security guide](https://supabase.com/docs/guides/database/postgres/row-level-security) explain the platform setup.
