export async function submitDeletionRequest(email: string, confirmed: boolean, apiBase: string, fetchImpl: typeof fetch = fetch): Promise<void> {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) || email.trim().length > 254) throw new Error('Enter the email address for your GRIDGO account.');
  if (!confirmed) throw new Error('Confirm that you want to request account deletion.');
  const response = await fetchImpl(`${apiBase}/account-deletion-requests`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: email.trim(), confirmed: true }), signal: AbortSignal.timeout(20000),
  });
  if (response.status === 429) throw new Error('Too many requests. Please wait a few minutes and try again.');
  if (!response.ok) throw new Error('Could not send your request. Please try again.');
}
