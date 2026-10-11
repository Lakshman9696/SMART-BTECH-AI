export async function getMentorStatus() {
  try { const response = await fetch('/api/health'); if (!response.ok) return { available: false, configured: false }; return { available: true, ...(await response.json()) }; }
  catch { return { available: false, configured: false }; }
}
export async function sendMentorMessage(payload) {
  const response = await fetch('/api/mentor/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) { const error = new Error(result.error || 'The mentor could not respond. Please try again.'); error.code = result.code; error.status = response.status; throw error; }
  return result;
}
