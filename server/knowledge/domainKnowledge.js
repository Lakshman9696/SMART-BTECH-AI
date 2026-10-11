const sql = 'https://www.postgresql.org/docs/current/tutorial.html';
export const resources = [{ title: 'PostgreSQL Tutorial (official)', url: sql, topic: 'SQL' }, { title: 'SQLBolt interactive lessons', url: 'https://sqlbolt.com/', topic: 'SQL' }];
export function retrieveDomainKnowledge(intent, text) {
  const matchedResources = /\bsql\b/i.test(text) ? resources : [];
  return { intent: intent.id, suggestedDomainIds: intent.domainIds, resources: matchedResources, domainStatusNote: 'The listed domain entries are planned previews unless explicitly marked ready by the website registry. Do not claim their content is connected.' };
}
