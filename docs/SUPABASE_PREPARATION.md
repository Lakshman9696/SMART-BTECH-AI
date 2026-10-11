# Optional Supabase adapter notes

> Superseded by [`SUPABASE_SETUP.md`](./SUPABASE_SETUP.md), following the user's decision to use Supabase for authentication and student profile data.

The MVP currently saves questionnaire answers in browser local storage through `src/services/profileRepository.js`. This keeps the first-run demo usable without accounts or a backend. The questionnaire reads and writes through that boundary, so its UI can stay in place when persistence changes.

## When connecting a Supabase project

1. Create a Supabase project and install the pinned `@supabase/supabase-js` package version selected for the project.
2. Copy `.env.example` to `.env.local` and set `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` from the project's Connect panel. The publishable key is intended for the browser; database access must be protected with Row Level Security.
3. Add a client under `src/lib/` and implement `load` / `save` in `profileRepository.js` using the authenticated user's ID.
4. Enable email or OAuth sign-in before storing real student profiles. Keep the user ID as the profile table primary key.
5. Create the profile table with RLS and owner-scoped policies before exposing it through the Data API. Example starting SQL:

```sql
create table public.student_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  profile jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.student_profiles enable row level security;

grant select, insert, update on public.student_profiles to authenticated;

create policy "Students can read their profile"
  on public.student_profiles for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "Students can create their profile"
  on public.student_profiles for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Students can update their profile"
  on public.student_profiles for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
```

Apply and review policies in the Supabase project before storing real student data. Never use a service-role or secret key in a Vite `VITE_*` variable. AI provider credentials must stay on a trusted server or Edge Function; the browser should call that server endpoint.

## AI service boundary

`src/data/domains.js` exports `recommendDomains(text, profile)`, the current local demo matcher. Keep the `Assistant` component calling a small service interface; replace the local implementation with a request to a protected server endpoint when one exists. The central assistant uses registry IDs/routes and does not depend on domain-specific code.

Official setup references: [Supabase React quickstart](https://supabase.com/docs/guides/getting-started/quickstarts/reactjs), [Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security), and [API keys](https://supabase.com/docs/guides/getting-started/api-keys).
