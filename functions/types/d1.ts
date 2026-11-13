// ============================================================================
// Cloudflare D1 SQLite Types & Edge Helpers for Pages Functions
// Zero external dependencies - uses standard Web Crypto & Cloudflare D1 APIs
// ============================================================================

export interface D1Meta {
  duration?: number;
  changes?: number;
  last_row_id?: number;
  rows_read?: number;
  rows_written?: number;
}

export interface D1Result<T = Record<string, unknown>> {
  results?: T[];
  success: boolean;
  meta: D1Meta;
  error?: string;
}

export interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement;
  first<T = Record<string, unknown>>(colName?: string): Promise<T | null>;
  run<T = Record<string, unknown>>(): Promise<D1Result<T>>;
  all<T = Record<string, unknown>>(): Promise<D1Result<T>>;
  raw<T = unknown[]>(): Promise<T[]>;
}

export interface D1Database {
  prepare(query: string): D1PreparedStatement;
  batch<T = Record<string, unknown>>(statements: D1PreparedStatement[]): Promise<D1Result<T>[]>;
  exec(query: string): Promise<{ count: number; duration: number }>;
  dump(): Promise<ArrayBuffer>;
}

export interface CloudflareEnv {
  DB?: D1Database;
  ENVIRONMENT?: string;
  ORGANIZATION?: string;
}

export interface PagesContext {
  env: CloudflareEnv;
  request: Request;
  params?: Record<string, string>;
}

export function jsonResponse(data: unknown, status = 200, headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'X-Powered-By': 'Cloudflare-D1-AppForge',
      ...headers,
    },
  });
}

export function d1MissingResponse(): Response {
  return jsonResponse(
    {
      success: false,
      connected: false,
      error: 'Cloudflare D1 binding "DB" is not configured. Bind your D1 database in Cloudflare Pages Settings -> Functions -> D1 database bindings (Variable name: DB).',
    },
    503
  );
}

export async function sha256Hex(input: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export function generateId(prefix: string): string {
  return `${prefix}-${crypto.randomUUID().slice(0, 12)}`;
}

/**
 * Ensures the D1 analytics snapshot for today is synchronized whenever mutations occur.
 */
export async function refreshDailyAnalyticsSnapshot(db: D1Database): Promise<void> {
  const today = new Date().toISOString().split('T')[0];
  try {
    const reqStats = await db
      .prepare(
        `SELECT
           COUNT(*) as total_requests,
           SUM(CASE WHEN current_sdlc_stage = 5 THEN 1 ELSE 0 END) as in_dev,
           SUM(CASE WHEN current_sdlc_stage = 6 THEN 1 ELSE 0 END) as in_testing,
           SUM(CASE WHEN current_sdlc_stage >= 8 THEN 1 ELSE 0 END) as in_prod,
           COALESCE(SUM(effort_estimate_days), 0) as total_effort,
           COALESCE(SUM(hours_saved_per_week), 0) as total_hours_saved
         FROM requests`
      )
      .first<{
        total_requests: number;
        in_dev: number;
        in_testing: number;
        in_prod: number;
        total_effort: number;
        total_hours_saved: number;
      }>();

    const taskStats = await db
      .prepare(
        `SELECT
           COUNT(*) as total_tasks,
           SUM(CASE WHEN status = 'Done' THEN 1 ELSE 0 END) as done_tasks
         FROM tasks`
      )
      .first<{ total_tasks: number; done_tasks: number }>();

    const userStats = await db
      .prepare(`SELECT COUNT(*) as active_users FROM users WHERE is_active = 1`)
      .first<{ active_users: number }>();

    const gateStats = await db
      .prepare(
        `SELECT
           COUNT(*) as eligible,
           SUM(CASE WHEN requirements_signed_off = 1 AND design_approved = 1 THEN 1 ELSE 0 END) as compliant
         FROM requests WHERE current_sdlc_stage >= 5 AND type != 'Quick Win'`
      )
      .first<{ eligible: number; compliant: number }>();

    const gatePct =
      gateStats && gateStats.eligible > 0
        ? Math.round((gateStats.compliant / gateStats.eligible) * 100)
        : 100;

    await db
      .prepare(
        `INSERT INTO analytics_daily_snapshots (
           snapshot_date, total_requests, in_dev_requests, in_testing_requests,
           in_production_requests, total_tasks, completed_tasks, total_effort_days,
           total_hours_saved_weekly, gate_compliance_pct, active_users_count, updated_at
         ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
         ON CONFLICT(snapshot_date) DO UPDATE SET
           total_requests = excluded.total_requests,
           in_dev_requests = excluded.in_dev_requests,
           in_testing_requests = excluded.in_testing_requests,
           in_production_requests = excluded.in_production_requests,
           total_tasks = excluded.total_tasks,
           completed_tasks = excluded.completed_tasks,
           total_effort_days = excluded.total_effort_days,
           total_hours_saved_weekly = excluded.total_hours_saved_weekly,
           gate_compliance_pct = excluded.gate_compliance_pct,
           active_users_count = excluded.active_users_count,
           updated_at = datetime('now')`
      )
      .bind(
        today,
        reqStats?.total_requests || 0,
        reqStats?.in_dev || 0,
        reqStats?.in_testing || 0,
        reqStats?.in_prod || 0,
        taskStats?.total_tasks || 0,
        taskStats?.done_tasks || 0,
        reqStats?.total_effort || 0,
        reqStats?.total_hours_saved || 0,
        gatePct,
        userStats?.active_users || 0
      )
      .run();
  } catch {
    // Non-fatal if snapshot table hasn't been migrated yet
  }
}
