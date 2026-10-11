import test from 'node:test';
import assert from 'node:assert/strict';
import { validateResponse } from '../services/validateResponse.js';

test('response validation preserves Markdown and limits recommendations to two enabled domains', () => {
  const markdown = `## Direct answer\n\n**SQL** stores structured data.\n\n1. Create a table.\n2. Query it with \`SELECT\`.\n\n\`\`\`sql\nSELECT * FROM students;\n\`\`\``;
  const result = validateResponse({
    reply: `  ${markdown}  `,
    recommendedDomainIds: ['coding', 'academic-learning', 'career', 'unknown'],
  });

  assert.equal(result.reply, markdown);
  assert.deepEqual(result.recommendedDomainIds, ['coding', 'academic-learning']);
});
