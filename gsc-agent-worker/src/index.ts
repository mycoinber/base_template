interface Env {
  BACKEND_URL: string;
  SITE_ID: string;
  GSC_AGENT_ID: string;
  GSC_AGENT_SECRET: string;
  GSC_SERVICE_ACCOUNT_JSON: string;
  GSC_DAYS_BACK?: string;
}

interface ServiceAccountJson {
  client_email: string;
  private_key: string;
  token_uri?: string;
}

interface AgentLeaseBinding {
  bindingId: string;
  siteUrl: string;
  type?: string;
  dataState?: string;
}

interface AgentLeaseResponse {
  due: boolean;
  nextSyncAt?: string;
  leaseUntil?: string;
  bindings?: AgentLeaseBinding[];
}

interface GscDailyRow {
  keys?: string[];
  clicks?: number;
  impressions?: number;
  ctr?: number;
  position?: number;
}

const GSC_SCOPE = 'https://www.googleapis.com/auth/webmasters.readonly';
const GSC_API_BASE = 'https://www.googleapis.com/webmasters/v3';

export default {
  async fetch(_request: Request, env: Env): Promise<Response> {
    return Response.json({ ok: true, siteId: env.SITE_ID, agentId: env.GSC_AGENT_ID });
  },

  scheduled(_controller: ScheduledController, env: Env, ctx: ExecutionContext): void {
    ctx.waitUntil(runScheduledSync(env));
  },
};

async function runScheduledSync(env: Env): Promise<void> {
  const lease = await requestLease(env);
  if (!lease.due) {
    console.log(JSON.stringify({ event: 'gsc_agent_not_due', nextSyncAt: lease.nextSyncAt }));
    return;
  }

  const bindings = Array.isArray(lease.bindings) ? lease.bindings : [];
  if (!bindings.length) {
    await heartbeat(env, 'No active GSC bindings returned by backend');
    return;
  }

  const serviceAccount = parseServiceAccount(env.GSC_SERVICE_ACCOUNT_JSON);
  const accessToken = await getAccessToken(serviceAccount);
  const daysBack = clampInt(env.GSC_DAYS_BACK, 1, 90, 14);
  const { startDate, endDate } = resolveFinalDateRange(daysBack);

  for (const binding of bindings) {
    try {
      const rows = await queryDailySummary({
        accessToken,
        siteUrl: binding.siteUrl,
        startDate,
        endDate,
        type: binding.type || 'web',
        dataState: binding.dataState || 'final',
      });
      await ingestDailySummary(env, binding, rows);
      console.log(
        JSON.stringify({
          event: 'gsc_agent_binding_synced',
          bindingId: binding.bindingId,
          siteUrl: binding.siteUrl,
          rows: rows.length,
          startDate,
          endDate,
        }),
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'GSC_AGENT_BINDING_SYNC_FAILED';
      await heartbeat(env, message);
      throw error;
    }
  }
}

async function requestLease(env: Env): Promise<AgentLeaseResponse> {
  const response = await fetch(`${trimTrailingSlash(env.BACKEND_URL)}/gsc/agent/lease`, {
    method: 'POST',
    headers: authHeaders(env),
    body: JSON.stringify({ websiteId: env.SITE_ID, agentId: env.GSC_AGENT_ID }),
  });
  const payload = await response.json().catch(() => null) as AgentLeaseResponse | { error?: string } | null;
  if (!response.ok) {
    throw new Error(`GSC_AGENT_LEASE_FAILED: ${payload && 'error' in payload ? payload.error : response.status}`);
  }
  return payload as AgentLeaseResponse;
}

async function ingestDailySummary(
  env: Env,
  binding: AgentLeaseBinding,
  rows: Array<{ date: string; clicks: number; impressions: number; ctr: number; position: number }>,
): Promise<void> {
  const response = await fetch(`${trimTrailingSlash(env.BACKEND_URL)}/gsc/agent/ingest/daily-summary`, {
    method: 'POST',
    headers: authHeaders(env),
    body: JSON.stringify({
      websiteId: env.SITE_ID,
      agentId: env.GSC_AGENT_ID,
      bindingId: binding.bindingId,
      siteUrl: binding.siteUrl,
      type: binding.type || 'web',
      dataState: binding.dataState || 'final',
      rows,
    }),
  });
  if (!response.ok) {
    const payload = await response.json().catch(() => null) as { error?: string } | null;
    throw new Error(`GSC_AGENT_INGEST_FAILED: ${payload?.error || response.status}`);
  }
}

async function heartbeat(env: Env, error?: string): Promise<void> {
  await fetch(`${trimTrailingSlash(env.BACKEND_URL)}/gsc/agent/heartbeat`, {
    method: 'POST',
    headers: authHeaders(env),
    body: JSON.stringify({ websiteId: env.SITE_ID, agentId: env.GSC_AGENT_ID, error: error || null }),
  });
}

async function queryDailySummary(params: {
  accessToken: string;
  siteUrl: string;
  startDate: string;
  endDate: string;
  type: string;
  dataState: string;
}): Promise<Array<{ date: string; clicks: number; impressions: number; ctr: number; position: number }>> {
  const response = await fetch(`${GSC_API_BASE}/sites/${encodeURIComponent(params.siteUrl)}/searchAnalytics/query`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${params.accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      startDate: params.startDate,
      endDate: params.endDate,
      dimensions: ['date'],
      type: params.type,
      aggregationType: 'byProperty',
      rowLimit: 25000,
      startRow: 0,
      dataState: params.dataState,
    }),
  });
  const payload = await response.json().catch(() => null) as { rows?: GscDailyRow[]; error?: { message?: string } } | null;
  if (!response.ok) {
    throw new Error(`GSC_QUERY_FAILED: ${payload?.error?.message || response.status}`);
  }
  return (Array.isArray(payload?.rows) ? payload.rows : [])
    .map((row) => ({
      date: Array.isArray(row.keys) ? String(row.keys[0] || '') : '',
      clicks: Number(row.clicks || 0),
      impressions: Number(row.impressions || 0),
      ctr: Number(row.ctr || 0),
      position: Number(row.position || 0),
    }))
    .filter((row) => Boolean(row.date));
}

async function getAccessToken(serviceAccount: ServiceAccountJson): Promise<string> {
  const tokenUri = serviceAccount.token_uri || 'https://oauth2.googleapis.com/token';
  const now = Math.floor(Date.now() / 1000);
  const assertion = await signJwt(serviceAccount, {
    iss: serviceAccount.client_email,
    scope: GSC_SCOPE,
    aud: tokenUri,
    exp: now + 3600,
    iat: now,
  });

  const response = await fetch(tokenUri, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion,
    }),
  });
  const payload = await response.json().catch(() => null) as { access_token?: string; error_description?: string; error?: string } | null;
  if (!response.ok || !payload?.access_token) {
    throw new Error(`GSC_SERVICE_ACCOUNT_AUTH_FAILED: ${payload?.error_description || payload?.error || response.status}`);
  }
  return payload.access_token;
}

async function signJwt(serviceAccount: ServiceAccountJson, claims: Record<string, unknown>): Promise<string> {
  const header = { alg: 'RS256', typ: 'JWT' };
  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedClaims = base64UrlEncode(JSON.stringify(claims));
  const signingInput = `${encodedHeader}.${encodedClaims}`;
  const keyData = pemToArrayBuffer(serviceAccount.private_key.replace(/\\n/g, '\n'));
  const key = await crypto.subtle.importKey(
    'pkcs8',
    keyData,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const signature = await crypto.subtle.sign(
    { name: 'RSASSA-PKCS1-v1_5' },
    key,
    new TextEncoder().encode(signingInput),
  );
  return `${signingInput}.${base64UrlEncode(signature)}`;
}

function parseServiceAccount(raw: string): ServiceAccountJson {
  const parsed = JSON.parse(raw) as Partial<ServiceAccountJson>;
  if (!parsed.client_email || !parsed.private_key) {
    throw new Error('GSC_SERVICE_ACCOUNT_JSON_INVALID');
  }
  return {
    client_email: parsed.client_email,
    private_key: parsed.private_key,
    token_uri: parsed.token_uri || 'https://oauth2.googleapis.com/token',
  };
}

function pemToArrayBuffer(pem: string): ArrayBuffer {
  const base64 = pem
    .replace('-----BEGIN PRIVATE KEY-----', '')
    .replace('-----END PRIVATE KEY-----', '')
    .replace(/\s+/g, '');
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

function base64UrlEncode(input: string | ArrayBuffer): string {
  const bytes = typeof input === 'string' ? new TextEncoder().encode(input) : new Uint8Array(input);
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

function resolveFinalDateRange(daysBack: number): { startDate: string; endDate: string } {
  const end = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
  const start = new Date(Date.now() - (daysBack + 3) * 24 * 60 * 60 * 1000);
  return { startDate: formatDate(start), endDate: formatDate(end) };
}

function formatDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function authHeaders(env: Env): HeadersInit {
  return {
    Authorization: `Bearer ${env.GSC_AGENT_SECRET}`,
    'Content-Type': 'application/json',
  };
}

function trimTrailingSlash(value: string): string {
  return String(value || '').replace(/\/+$/, '');
}

function clampInt(value: string | undefined, min: number, max: number, fallback: number): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, Math.floor(parsed)));
}
