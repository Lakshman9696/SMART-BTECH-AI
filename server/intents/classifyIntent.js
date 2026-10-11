import { intentRegistry } from './registry.js';

export function classifyIntent(text = '') {
  const normalized = text.toLowerCase();
  const scored = intentRegistry.map((intent, order) => ({ intent, score: intent.terms.reduce((n, term) => n + (normalized.includes(term) ? (term.includes(' ') ? 3 : 1) : 0), 0), order }));
  scored.sort((a, b) => b.score - a.score || a.order - b.order);
  return scored[0]?.score ? scored[0].intent : intentRegistry.at(-1);
}
