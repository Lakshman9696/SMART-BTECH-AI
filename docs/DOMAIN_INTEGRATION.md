# Domain integration contract

The platform owns navigation, the student profile, the assistant, the registry, and shared UI. Each connected domain owns its task-specific screens and logic.

## Dashboard modules

The eight career-development cards on the dashboard are configured in `src/data/studentModules.js`. Each card uses a stable `id`, label, description, icon, related `domainId`, and a route generated as `/modules/<id>`. The shared route renders `src/pages/ModulePage.jsx`, which provides the module shell, an honest empty state, a link to the related domain preview, and the central demo assistant.

These dashboard modules are navigation shells, not completed feature implementations. Add module-specific UI and API calls only when those services exist. Keep empty, loading and error states visible, and do not show fabricated progress, resume content, recommendations or exam facts as live records.

## Registry entry

Maintain domain metadata in `src/data/domains.js`:

```js
{
  id: 'ai-tools-dictionary',
  name: 'AI Tools Dictionary',
  description: 'Short student-facing summary.',
  capabilities: ['AI tools', 'tool selection', 'productivity'],
  route: '/domains/ai-tools-dictionary',
  enabled: true,
  status: 'planned', // change to "ready" only after core task is connected
}
```

Use a unique stable ID. Keep each route unique. The `enabled` flag controls catalog visibility and prevents disabled routes from rendering their module. The registry is the supported configuration surface for add, edit, enable and disable operations.

## Connecting a React module

1. Create `src/domains/<id>/index.jsx` and any domain-specific UI/service modules alongside it.
2. Export a React component that accepts `{ profile, domain }`. Render inside the shared shell; do not add another global sidebar/header.
3. Register the component in `src/domains/index.js` by stable domain ID. App creates its route from the registry's `route` value.
4. Read shared profile data without changing it; the profile screen remains the platform's source of truth.
5. Keep domain-specific calls inside the module/service. Show loading, empty and error states for service data.
6. Set `status: 'ready'` only after the domain's core task works. Until registered, every supplied entry displays the shared placeholder and is identified as planned.

The chatbot reads domain capabilities and IDs from the registry. Add a domain's natural-language capabilities to its metadata so the demo matcher can discover it. No domain-specific UI belongs in chatbot code.

## Assistant service boundary

`recommendDomains(text, profile)` is the current deterministic local demo matcher in `src/data/domains.js`. Replace it with a service that calls a trusted server endpoint when available, returning `{ reply, recommendedDomainIds, followUpQuestion? }`. Render recommendations by looking up IDs in the registry. Never expose AI provider credentials in client code or `VITE_*` variables.

## Future profile API adapter

The questionnaire uses `src/services/profileRepository.js` and currently saves in browser local storage. Preserve its `load` and `save` behavior when switching to the authenticated user's API-backed profile. The current project specification recommends a Node/Express API and MongoDB Atlas. Keep database credentials on the server; do not put secrets in `VITE_*` variables.

