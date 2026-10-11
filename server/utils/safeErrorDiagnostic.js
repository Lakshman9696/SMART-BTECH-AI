/** Return only stable, non-sensitive provider diagnostics. Never log error.message. */
export function safeErrorDiagnostic(error) {
  const rawStatus = Number(error?.status ?? error?.statusCode);
  const status = Number.isInteger(rawStatus) && rawStatus >= 400 && rawStatus <= 599 ? rawStatus : 500;
  const rawCode = typeof error?.code === 'string' ? error.code : '';
  const code = status === 401 ? 'GEMINI_AUTH_REJECTED'
    : status === 403 ? 'GEMINI_ACCESS_DENIED'
      : /^[A-Z][A-Z0-9_.-]{0,63}$/.test(rawCode) ? rawCode : 'UNCLASSIFIED';
  return { status, code };
}

export function safeErrorMessage(error, { status, code }) {
  if (status === 401 || status === 403) return 'Gemini rejected the server credentials or API access. Check the server-side key and its Gemini API restrictions.';
  if (status === 503 && ['GEMINI_NOT_CONFIGURED', 'GEMINI_TEMPORARILY_UNAVAILABLE'].includes(code)) return error.message;
  if (status === 429) return 'Too many requests. Please wait a moment and try again.';
  return 'The mentor could not respond right now. Please try again shortly.';
}
