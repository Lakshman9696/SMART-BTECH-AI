import { enabledDomainIds } from '../intents/registry.js';

export function validateResponse(result) {
  if (!result || typeof result.reply !== 'string' || !result.reply.trim()) throw new Error('The AI response was empty. Please try again.');
  // Trim only surrounding whitespace; do not cut through Markdown blocks, links, or code fences.
  const recommendedDomainIds = Array.isArray(result.recommendedDomainIds) ? [...new Set(result.recommendedDomainIds.filter(id => enabledDomainIds.has(id)))].slice(0, 2) : [];
  return { reply: result.reply.trim(), recommendedDomainIds };
}
