# Vercel deployment

The frontend and mentor API deploy together from this repository. `api/health.js` provides the connection check, and `api/mentor/chat.js` runs the same mentor service used by local Express development. Vercel maps these files to `/api/health` and `/api/mentor/chat`.

## Required Vercel settings

In the Vercel project settings, add `GEMINI_API_KEY` as an encrypted environment variable for Production (and Preview if you use preview deployments). Optionally set `GEMINI_MODEL`; it defaults to `gemini-3.8-flash`. Never use a `VITE_` prefix for the Gemini key. Redeploy after changing environment variables.

The app checks `/api/health` and shows setup status. A successful check with `geminiConfigured: true` confirms that Vercel received the key; a real chat request confirms that Gemini accepts the key and model. Keep the endpoint same-origin and do not expose the key to browser code.

## Limits and production hardening

The chat function enforces request validation, same-origin requests, and a small per-instance rate limit. Serverless memory rate limits are best-effort and do not coordinate across instances. Before opening the mentor to broad public traffic, require a verified Supabase access token and use a shared rate limiter. Keep the Gemini API key restricted and monitor provider usage.

For local development, continue to use `npm.cmd run dev`; Vite proxies `/api` to the Express server at port 8788.
