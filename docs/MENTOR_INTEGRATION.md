# Mentor API contract

The React assistant talks to the Express mentor API through the same-origin `/api` path. Vite proxies that path to `http://127.0.0.1:8788` during development.

## Request

`POST /api/mentor/chat` with JSON:

```json
{
  "text": "How can I learn SQL?",
  "profile": { "degree": "B.Tech", "branch": "Computer Science", "year": "2nd year", "semester": "3", "skills": ["Python"], "goalType": "placements", "availableTime": "2–4 hours" },
  "progressTasks": [{ "id": "year-2-technical-skill", "title": "Choose one technical skill", "status": "in_progress", "priority": "high", "stageYear": 2 }],
  "history": [{ "role": "user", "text": "I want to improve my technical skills" }]
}
```

Only profile and task fields in `server/context/prepareContext.js` are forwarded. Study details, skills, experience, goals and learning preferences are allowlisted. Support needs, challenges and requested help are forwarded only when `supportConsent` is true. Email and account identifiers are excluded. History is limited to the last 12 messages for model context (the HTTP schema accepts at most 30); at most 40 validated task summaries are included. The API keeps no conversation or profile database.

## Response

```json
{
  "intent": "learning-resources",
  "reply": "...",
  "recommendedDomainIds": ["academic-learning", "ai-tools-dictionary"],
  "followUpQuestion": null,
  "pendingIntent": "",
  "awaitingField": ""
}
```

When follow-up context is necessary, the response includes the question in `reply` and `followUpQuestion`, plus `pendingIntent` and `awaitingField`. The browser sends those fields back in the assistant message history on the next turn. A changed topic is reclassified from its latest message and does not continue the prior follow-up.

`GET /api/health` reports whether the API process is reachable and whether a Gemini key is configured. It never returns key material. A missing key makes model requests return `503` with `GEMINI_NOT_CONFIGURED`; the app does not synthesize a fallback AI answer.

## Add an intent/domain

Add supported intent IDs to the domain entry in `src/data/domains.js` and add a focused intent definition to `server/intents/registry.js` only when introducing a new intent. Intent-to-domain recommendations are resolved dynamically from the centralized registry, and only enabled IDs are returned. The UI resolves IDs to routes and labels unfinished entries as previews.

Keep model calls in `server/services/geminiClient.js`, context filtering in `server/context/prepareContext.js`, follow-up rules in `server/intents/followUps.js`, and retrieved references in `server/knowledge/domainKnowledge.js`. Never move provider keys into frontend variables or store chat history without an explicit privacy design.

## Production security

The current API binds to loopback for local development and has no user-token verification. Before making it public, verify Supabase access tokens (or another trusted identity) on the server and apply authenticated rate limits. An origin allowlist/CORS alone does not stop direct requests.

