// Cloudflare Pages Function: /api/health
// Checks Cloudflare D1 SQLite connectivity and reports live table row counts

import { PagesContext, jsonResponse, d1MissingResponse } from '../types/d1';

export async function onRequestGet(context: PagesContext): Promise<Response> {
  const db = context.env.DB;
  if (!db) {
    return d1MissingResponse();
  }

  try {
    await db.prepare('SELECT 1 as ok').first();

    const tableNames = [
      'users',
      'user_sessions',
      'workflows',
      'workflow_stages',
      'requests',
      'subtasks',
      'tasks',
      'comments',
      'activities',
      'analytics_events',
      'analytics_daily_snapshots',
    ];

    const counts: Record<string, number> = {};
    let schemaReady = true;

    for (const table of tableNames) {
      try {
        const res = await db
          .prepare(`SELECT COUNT(*) as count FROM ${table}`)
          .first<{ count: number }>();
        counts[table] = res?.count ?? 0;
      } catch {
        counts[table] = -1;
        schemaReady = false;
      }
    }

    return jsonResponse({
      success: true,
      connected: true,
      engine: 'Cloudflare D1 (SQLite)',
      environment: context.env.ENVIRONMENT || 'production',
      organization: context.env.ORGANIZATION || 'Uratex Philippines',
      schemaReady,
      tables: counts,
      checkedAt: new Date().toISOString(),
    });
  } catch (err) {
    return jsonResponse(
      {
        success: false,
        connected: false,
        error: err instanceof Error ? err.message : 'D1 database check failed',
      },
      500
    );
  }
}
