# Smart Engineer AI Student Growth Hub

Smart Engineer AI is a React + Vite student platform with a progressive profile, a central intent-aware mentor, a searchable domain catalog and reusable domain routes. The mentor uses an Express API and Gemini when configured; it does not fabricate local AI replies.

## Run locally

1. Install Node.js 18 or newer.
2. In this folder run `npm install`.
3. Copy `.env.example` to `.env.local` if needed. Keep `GEMINI_API_KEY` in this server-side file; never prefix it with `VITE_`.
4. Add a Gemini API key to `GEMINI_API_KEY` in `.env.local`. If the key is absent, the assistant shows a setup message and Gemini answers are unavailable.
5. Run `npm.cmd run dev` from PowerShell (or `npm run dev` in shells that allow npm scripts) and open the Vite address. This starts Vite and the Express API together.
6. Run `npm.cmd test` and `npm.cmd run build` to check the app.

The frontend proxies `/api` to the local Express API at port 8788. `GEMINI_MODEL` defaults to `gemini-3.8-flash`; set `API_PORT` and comma-separated `API_ALLOWED_ORIGINS` for the server environment as needed.

## Student progress roadmap

- My Progress can create an eight-task, four-stage starter B.Tech roadmap. New tasks start as to do; completion is calculated from task statuses, not seeded percentages. Year applicability follows the profile's current year.
- Task status and roadmap details are stored inside the existing `student_profiles.profile` JSON. The existing owner-scoped RLS policy protects them, so no new table or database is required. In local demo mode, the existing browser profile record is used. Supabase users must sign in to save.
- Next steps are ordered using in-progress status, task priority, year stage and matches to the student's profile. Completed tasks are excluded.
- The central mentor receives the allowlisted profile and up to 40 structured task statuses when each message is sent. It does not persist chat or task data separately.

## Mentor behavior and privacy

- `server/intents/registry.js` and `classifyIntent.js` route messages across career, skills, programming, interviews, resumes, internships, exams, projects, learning resources and general questions.
- `followUps.js` asks only for details that affect the answer. Follow-up state is sent with current chat messages; a new topic takes precedence over a pending follow-up.
- `prepareContext.js` allows only degree, branch, year, skills, interests, career goals, challenges and requested help from the profile. It drops email and other fields and limits chat context to the most recent 12 messages.
- The browser holds chat messages in memory for the current page session. The API is stateless and does not store chat messages. A message and the allowlisted profile fields are sent to Gemini when the student submits it.
- The API applies an origin allowlist, request size limits and per-IP rate limiting. Provider keys stay on the server.
- For SQL learning, the mentor can cite the PostgreSQL tutorial and SQLBolt resources supplied in `server/knowledge/domainKnowledge.js`. Other sources are not invented.

## Tests

`npm test` exercises the requested A–F conversation cases, profile allowlisting, roadmap calculations and progress context using mocked model responses. These tests do not require a Gemini key and do not make live Gemini requests. `npm run build` checks the production frontend bundle.

## Supabase and student profile

Account Center supports Supabase email/password sign-up, sign-in, password reset and sign-out. Profile rows use owner-scoped Row Level Security. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` in the frontend environment and follow [`docs/SUPABASE_SETUP.md`](docs/SUPABASE_SETUP.md) to apply the SQL in `supabase/schema.sql`. Never put the Supabase service-role key or Gemini key in frontend variables.

## Domain integration

The centralized registry in `src/data/domains.js` gives each domain a stable `id`, `name`, `description`, `capabilities`, `route`, `enabled` flag and `status`. Fourteen supplied domains are currently listed; the source catalog did not include domain 10 or 12. Entries are planned previews until a working dedicated module is connected.

To add a domain, create a component in `src/domains/<id>/` that accepts `{ profile, domain }`, register it in `src/domains/index.js`, and add its metadata to the centralized registry. Keep its ID and route stable once published. The mentor refers to registry IDs and does not need domain-specific chatbot changes. Set `status: 'ready'` only after the domain task is functional. See [`docs/DOMAIN_INTEGRATION.md`](docs/DOMAIN_INTEGRATION.md).

## Deployment

The current Express API binds to `127.0.0.1` and is intended for local development. Do not expose this unauthenticated endpoint publicly: CORS is not an authentication mechanism. Before public deployment, add Supabase access-token verification (or equivalent API authentication) and host-appropriate rate limiting, then configure the frontend `/api` proxy to reach it. Set `GEMINI_API_KEY`, `GEMINI_MODEL`, `API_PORT`, and `API_ALLOWED_ORIGINS` in the API host's environment. A static-only host cannot run this Express server without adapting it to that host's protected serverless API format.

## Source documentation

The Smart BTech AI specification PDF referenced in the request was not present in the workspace. This implementation follows the pasted requirements and the existing project structure. The descriptions and capabilities for the supplied domain names are starter metadata until their detailed source documents are connected.

