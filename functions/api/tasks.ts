// Cloudflare Pages Function: /api/tasks
// Full CRUD for Project Tasks & Velocity Metrics in Cloudflare D1

import {
  PagesContext,
  jsonResponse,
  d1MissingResponse,
  generateId,
  refreshDailyAnalyticsSnapshot,
} from '../types/d1';

interface D1TaskRow {
  id: string;
  project_id: string;
  project_code: string;
  project_title: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  assigned_to_id: string;
  assigned_to_name: string;
  assigned_to_avatar: string | null;
  due_date: string;
  estimated_hours: number;
  logged_hours: number;
  tags_json: string;
  created_at: string;
}

export async function onRequestGet(context: PagesContext): Promise<Response> {
  const db = context.env.DB;
  if (!db) return d1MissingResponse();

  try {
    const rows = (await db.prepare(`SELECT * FROM tasks ORDER BY created_at DESC`).all<D1TaskRow>()).results || [];

    const tasks = rows.map((t) => ({
      id: t.id,
      projectId: t.project_id,
      projectCode: t.project_code,
      projectTitle: t.project_title,
      title: t.title,
      description: t.description || undefined,
      status: t.status,
      priority: t.priority,
      assignedToId: t.assigned_to_id,
      assignedToName: t.assigned_to_name,
      assignedToAvatar: t.assigned_to_avatar || '',
      dueDate: t.due_date,
      estimatedHours: t.estimated_hours,
      loggedHours: t.logged_hours,
      tags: JSON.parse(t.tags_json || '[]'),
      createdAt: t.created_at,
    }));

    return jsonResponse({ success: true, tasks });
  } catch (err) {
    return jsonResponse(
      { success: false, error: err instanceof Error ? err.message : 'Failed to load tasks from D1' },
      500
    );
  }
}

export async function onRequestPost(context: PagesContext): Promise<Response> {
  const db = context.env.DB;
  if (!db) return d1MissingResponse();

  try {
    const task = (await context.request.json()) as {
      id: string;
      projectId: string;
      projectCode: string;
      projectTitle: string;
      title: string;
      description?: string;
      status: string;
      priority: string;
      assignedToId: string;
      assignedToName: string;
      assignedToAvatar?: string;
      dueDate: string;
      estimatedHours: number;
      loggedHours: number;
      tags?: string[];
      createdAt?: string;
    };

    await db.batch([
      db
        .prepare(
          `INSERT INTO tasks (
             id, project_id, project_code, project_title, title, description,
             status, priority, assigned_to_id, assigned_to_name, assigned_to_avatar,
             due_date, estimated_hours, logged_hours, tags_json, created_at, updated_at
           ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
           ON CONFLICT(id) DO UPDATE SET
             title = excluded.title,
             description = excluded.description,
             status = excluded.status,
             priority = excluded.priority,
             assigned_to_id = excluded.assigned_to_id,
             assigned_to_name = excluded.assigned_to_name,
             due_date = excluded.due_date,
             estimated_hours = excluded.estimated_hours,
             logged_hours = excluded.logged_hours,
             tags_json = excluded.tags_json,
             updated_at = datetime('now')`
        )
        .bind(
          task.id,
          task.projectId,
          task.projectCode,
          task.projectTitle,
          task.title,
          task.description || '',
          task.status,
          task.priority,
          task.assignedToId,
          task.assignedToName,
          task.assignedToAvatar || '',
          task.dueDate,
          task.estimatedHours || 0,
          task.loggedHours || 0,
          JSON.stringify(task.tags || []),
          task.createdAt || new Date().toISOString().split('T')[0]
        ),
      db
        .prepare(
          `INSERT INTO analytics_events (id, event_type, user_id, entity_type, entity_id, metric_value, metadata_json)
           VALUES (?, ?, ?, 'task', ?, ?, ?)`
        )
        .bind(
          generateId('evt'),
          task.status === 'Done' ? 'task_completed' : 'task_synced',
          task.assignedToId,
          task.id,
          task.estimatedHours || 0,
          JSON.stringify({ status: task.status, priority: task.priority, projectCode: task.projectCode })
        ),
    ]);

    await refreshDailyAnalyticsSnapshot(db);
    return jsonResponse({ success: true, id: task.id });
  } catch (err) {
    return jsonResponse(
      { success: false, error: err instanceof Error ? err.message : 'Failed to save task in D1' },
      500
    );
  }
}

export async function onRequestDelete(context: PagesContext): Promise<Response> {
  const db = context.env.DB;
  if (!db) return d1MissingResponse();

  try {
    const url = new URL(context.request.url);
    const id = url.searchParams.get('id');
    if (!id) return jsonResponse({ success: false, error: 'Missing task id' }, 400);

    await db.prepare(`DELETE FROM tasks WHERE id = ?`).bind(id).run();
    await refreshDailyAnalyticsSnapshot(db);

    return jsonResponse({ success: true, deletedId: id });
  } catch (err) {
    return jsonResponse(
      { success: false, error: err instanceof Error ? err.message : 'Failed to delete task' },
      500
    );
  }
}
