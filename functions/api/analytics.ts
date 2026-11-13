// Cloudflare Pages Function: /api/analytics
// Live D1 SQLite Analytics Engine, Event Telemetry, Daily Snapshots & Audit Logging

import {
  PagesContext,
  jsonResponse,
  d1MissingResponse,
  generateId,
  refreshDailyAnalyticsSnapshot,
} from '../types/d1';

export async function onRequestGet(context: PagesContext): Promise<Response> {
  const db = context.env.DB;
  if (!db) return d1MissingResponse();

  try {
    const [deptBreakdown, userWorkload, sdlcFunnel, snapshots, recentEvents, totals] =
      await Promise.all([
        db.prepare(`SELECT * FROM v_department_analytics ORDER BY total_initiatives DESC`).all(),
        db.prepare(`SELECT * FROM v_user_workload_analytics ORDER BY total_tasks DESC`).all(),
        db.prepare(`SELECT * FROM v_sdlc_funnel_analytics`).all(),
        db
          .prepare(`SELECT * FROM analytics_daily_snapshots ORDER BY snapshot_date DESC LIMIT 30`)
          .all(),
        db
          .prepare(`SELECT * FROM analytics_events ORDER BY created_at DESC LIMIT 50`)
          .all(),
        db
          .prepare(
            `SELECT
               (SELECT COUNT(*) FROM requests) as totalRequests,
               (SELECT COUNT(*) FROM tasks) as totalTasks,
               (SELECT COUNT(*) FROM tasks WHERE status = 'Done') as completedTasks,
               (SELECT COUNT(*) FROM users WHERE is_active = 1) as totalUsers,
               (SELECT COUNT(*) FROM workflows) as totalWorkflows,
               (SELECT COUNT(*) FROM activities) as totalActivities,
               (SELECT COUNT(*) FROM analytics_events) as totalEvents,
               (SELECT COALESCE(SUM(effort_estimate_days), 0) FROM requests) as totalEffortDays,
               (SELECT COALESCE(SUM(hours_saved_per_week), 0) FROM requests) as totalHoursSavedPerWeek`
          )
          .first(),
      ]);

    return jsonResponse({
      success: true,
      summary: totals || {},
      departmentAnalytics: deptBreakdown.results || [],
      userWorkloadAnalytics: userWorkload.results || [],
      sdlcFunnelAnalytics: sdlcFunnel.results || [],
      dailySnapshots: snapshots.results || [],
      recentEvents: recentEvents.results || [],
    });
  } catch (err) {
    return jsonResponse(
      { success: false, error: err instanceof Error ? err.message : 'Failed to query D1 analytics' },
      500
    );
  }
}

export async function onRequestPost(context: PagesContext): Promise<Response> {
  const db = context.env.DB;
  if (!db) return d1MissingResponse();

  try {
    const body = (await context.request.json()) as {
      kind?: 'event' | 'activity';
      // Event payload
      eventType?: string;
      userId?: string;
      userRole?: string;
      department?: string;
      entityType?: string;
      entityId?: string;
      metricValue?: number;
      metadata?: Record<string, unknown>;
      // Activity audit payload
      activity?: {
        id: string;
        type: string;
        actorId: string;
        actorName: string;
        actorAvatar: string;
        actorRole: string;
        targetId: string;
        targetCode: string;
        targetTitle: string;
        actionSummary: string;
        details?: string;
        timestamp: string;
        createdAt: number;
      };
    };

    const statements = [];

    if (body.activity) {
      const a = body.activity;
      statements.push(
        db
          .prepare(
            `INSERT OR REPLACE INTO activities (
               id, type, actor_id, actor_name, actor_avatar, actor_role,
               target_id, target_code, target_title, action_summary, details,
               timestamp_label, created_at_ms
             ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
          )
          .bind(
            a.id,
            a.type,
            a.actorId,
            a.actorName,
            a.actorAvatar || '',
            a.actorRole,
            a.targetId,
            a.targetCode,
            a.targetTitle,
            a.actionSummary,
            a.details || '',
            a.timestamp,
            a.createdAt
          )
      );
    }

    if (body.eventType) {
      statements.push(
        db
          .prepare(
            `INSERT INTO analytics_events (
               id, event_type, user_id, user_role, department, entity_type, entity_id, metric_value, metadata_json
             ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
          )
          .bind(
            generateId('evt'),
            body.eventType,
            body.userId || null,
            body.userRole || null,
            body.department || null,
            body.entityType || null,
            body.entityId || null,
            body.metricValue || 0,
            JSON.stringify(body.metadata || {})
          )
      );
    }

    if (statements.length > 0) {
      await db.batch(statements);
      await refreshDailyAnalyticsSnapshot(db);
    }

    return jsonResponse({ success: true });
  } catch (err) {
    return jsonResponse(
      { success: false, error: err instanceof Error ? err.message : 'Failed to log analytics in D1' },
      500
    );
  }
}
