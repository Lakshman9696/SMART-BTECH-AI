export function validateResponse(result) {
  if (!result || typeof result.reply !== 'string' || !result.reply.trim()) throw new Error('The AI response was empty. Please try again.');
  return { reply: result.reply.trim().slice(0, 12000), recommendedDomainIds: Array.isArray(result.recommendedDomainIds) ? [...new Set(result.recommendedDomainIds)].slice(0, 3) : [] };
}
