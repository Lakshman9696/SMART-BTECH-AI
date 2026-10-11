# Supabase setup

The app can use Supabase Auth and Postgres for student profiles. Until the required project settings are provided, it remains in clearly labeled local demo mode.

## Connect your project

1. Create a Supabase project, then open its Connect panel and copy the Project URL and publishable key.
2. Copy `.env.example` to `.env.local` in this project root and set `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`.
3. In the Supabase SQL Editor, run [`../supabase/schema.sql`](../supabase/schema.sql). This creates the profile table and owner-only RLS policies.
4. In Supabase Auth settings, configure the site URL and allowed redirect URLs for local development and your deployed app. Keep email confirmation enabled.
5. In **Authentication → Providers → Email**, set the minimum password length to **12**. Account creation and password recovery enforce the same minimum in the interface.
6. In **Authentication → Email Templates**, configure the sign-in email to include the OTP token (`{{ .Token }}`). Supabase's default magic-link template may send a link instead of a numeric code; this project is configured to accept Supabase's 8-digit email code. Save the template and test delivery before inviting students.
7. Set the local and production site/redirect URLs, then restart Vite. Open Account Center to create an account or sign in.

The browser client uses only the publishable key. Never add a service-role or secret key to a `VITE_*` variable or frontend file. The table grants access only to signed-in users and every policy checks that `auth.uid()` matches the row owner. Anonymous access is revoked.

## What is stored

The questionnaire profile is stored as JSON in `public.student_profiles`, keyed by the Supabase Auth user ID. Roadmap tasks and task status are stored inside the same profile JSON, so the existing owner-only RLS policy protects progress too; no second table is required. New account creation uses a password of at least 12 characters and requires email confirmation. Every login uses a one-time email code; password reset remains available for account recovery. The existing browser demo profile is not automatically copied to an account; users can re-enter it after connecting and signing in.

## Operations to configure

- Configure the Supabase password minimum to 12 characters and test the OTP email template and delivery. Supabase's default SMTP has delivery limits; use a trusted custom SMTP provider for production. New Free projects created from June 3, 2026 may require custom SMTP to customize Auth email templates.
- Add the production domain and callback URLs to Supabase Auth redirect allowlists.
- Enable MFA in Supabase Auth before requiring stronger account assurance.
- Consider adding account deletion and session-management UI before public launch.
- AI provider secrets still belong in a server/Edge Function, never this browser app.

Supabase's official [React Auth quickstart](https://supabase.com/docs/guides/auth/quickstarts/react) and [Row Level Security guide](https://supabase.com/docs/guides/database/postgres/row-level-security) explain the platform setup.

