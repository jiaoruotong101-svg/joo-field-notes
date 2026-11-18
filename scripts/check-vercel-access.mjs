// Diagnose project access without querying account-wide resources or logging credentials.
const token = process.env.VERCEL_TOKEN?.trim();
const project = process.env.VERCEL_PROJECT_ID;
const team = process.env.VERCEL_ORG_ID;
if (!token || !project || !team) throw new Error('Missing Vercel deployment configuration.');
const url = new URL(`https://api.vercel.com/v9/projects/${encodeURIComponent(project)}`);
url.searchParams.set('teamId', team);
const response = await fetch(url, {
  headers: { Authorization: `Bearer ${token}` },
  signal: AbortSignal.timeout(30_000),
});
if (!response.ok) {
  throw new Error(`Vercel project access check returned HTTP ${response.status}. No credential values were logged.`);
}
const data = await response.json();
if (data.id !== project || data.accountId !== team || data.name !== 'joo-field-notes') {
  throw new Error('Vercel project identity does not match the configured deployment target.');
}
console.log('Project-scoped API authentication passed for jdd12/joo-field-notes.');
