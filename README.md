# Smart Engineer AI Student Growth Hub

Smart Engineer AI is the existing React + Vite student platform shell, redesigned around the project plan's career-development journey. It keeps the progressive student profile, central demo assistant, searchable domain catalog and reusable domain routes.

## Run locally

1. Install Node.js 18 or newer.
2. In this folder run `npm install`.
3. Run `npm run dev` and open the local address Vite prints.
4. Run `npm run build` to create a production site in `dist/`; use `npm run preview` to review it.

## Available checks

`npm run build` is the configured production check. There is no lint or automated test script in this project yet.

## Workspace navigation

The primary workspace navigation has three entries: Dashboard, All Domains and My Progress. The My Progress page includes the student profile summary, profile editing link, honest empty progress/milestone states, suggested roadmap and Account Center.

## Student flows

- Five-step profile: degree, branch, year, skills, interests, career goals, biggest challenge and requested help. Only degree, branch and year are required; later questions can be skipped.
- Account Center (`/account`) supports Supabase email/password sign-up, sign-in, password reset and sign-out. When Supabase is not configured, it clearly explains that only local demo storage is active.
- When configured, student profiles are stored in Supabase Postgres and protected by owner-scoped Row Level Security. The SQL is in `supabase/schema.sql`; follow `docs/SUPABASE_SETUP.md` to connect a project.
- `.env.local` needs `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`. A publishable key is intended for browser use; never expose a service-role key or AI provider key in frontend code.
- Without Supabase settings, profiles continue to use this browser's local demo storage. Existing browser profile data is not silently copied to an account.
- The dashboard provides the eight requested career-development module routes. Their shared preview page is in `src/pages/ModulePage.jsx`.
- The student roadmap is a general sequence from the project plan. It is not presented as completed personal progress.
- Learning progress and milestones show empty states because there is no activity/progress API in this project.
- The central assistant uses local rule-based recommendations and is clearly labeled DEMO. No Gemini or other AI backend is connected.
- The 14-entry domain catalog retains its supplied names and order. All entries remain previews until a dedicated module is connected.

## Adding a dashboard module

Add module metadata to `src/data/studentModules.js`. Each module receives a `/modules/<id>` route and uses the shared `ModulePage`. The module's `domainId` links to an existing entry in `src/data/domains.js`.

## Connecting a domain experience

- Edit/add/configure entries in `src/data/domains.js`. Each has a stable `id`, `name`, `description`, `capabilities`, `route`, `enabled`, `status`, category and presentation metadata.
- Change `enabled` to hide/show an entry in the catalog. Keep the route and ID stable after sharing links.
- Domain routes are generated from the registry. `src/domains/index.js` maps IDs to finished React modules; unmapped entries use the shared preview page.
- To connect a domain, create a module under `src/domains/<id>/`, export a React component accepting `{ profile, domain }`, register it in `src/domains/index.js`, and set registry `status` to `ready` only when its core task works.
- The assistant matches registry IDs and capabilities. A new domain does not require domain-specific chatbot logic.
- See [`docs/DOMAIN_INTEGRATION.md`](docs/DOMAIN_INTEGRATION.md) for the route and component contract.

## Backend and data status

Supabase Auth and profile storage are implemented but require the user's Supabase project settings and SQL setup before they can connect. Gemini or another AI backend, module content, saved resumes and learning activity are not available yet. Keep AI provider keys in a server/Edge Function. Do not present preview content as verified live facts.

## Source documentation

The Smart Engineer AI project plan supplies the product modules, user journey and technology direction. The separate 14-domain catalog list supplied earlier remains in `src/data/domains.js`; the detailed source documents for those 14 domain descriptions were not provided, so their summaries and capabilities remain starter metadata inferred from their names.

