// Cloudflare Pages Function: /api/requests
// Full CRUD for Project Initiatives, Subtasks, Comments, SDLC Gates, and Audit/Analytics in Cloudflare D1

import {
  PagesContext,
  jsonResponse,
  d1MissingResponse,
  generateId,
  refreshDailyAnalyticsSnapshot,
} from '../types/d1';

interface D1RequestRow {
  id: string;
  code: string;
  title: string;
  type: string;
  department: string;
  urgency: string;
  status: string;
  current_sdlc_stage: number;
  workflow_id: string;
  requester_name: string;
  requester_email: string;
  requester_avatar: string;
  assigned_lead: string;
  assigned_lead_avatar: string;
  start_date: string;
  target_go_live_date: string;
  tags_json: string;
  sdlc_json: string;
}

interface D1SubtaskRow {
  id: string;
  request_id: string;
  title: string;
  completed: number;
  assigned_to: string;
  due_date: string;
}

interface D1CommentRow {
  id: string;
  request_id: string;
  author_id: string;
  author_name: string;
  author_avatar: string;
  author_role: string;
  content: string;
  stage_tagged: string | null;
  timestamp_label: string;
}

export async function onRequestGet(context: PagesContext): Promise<Response> {
  const db = context.env.DB;
  if (!db) return d1MissingResponse();

  try {
    const reqRows = (await db.prepare(`SELECT * FROM requests ORDER BY created_at DESC`).all<D1RequestRow>()).results || [];
    const subRows = (await db.prepare(`SELECT * FROM subtasks`).all<D1SubtaskRow>()).results || [];
    const comRows = (await db.prepare(`SELECT * FROM comments ORDER BY created_at ASC`).all<D1CommentRow>()).results || [];

    const requests = reqRows.map((row) => ({
      id: row.id,
      code: row.code,
      title: row.title,
      type: row.type,
      department: row.department,
      urgency: row.urgency,
      status: row.status,
      currentSDLCStage: row.current_sdlc_stage,
      workflowId: row.workflow_id,
      requesterName: row.requester_name,
      requesterEmail: row.requester_email,
      requesterAvatar: row.requester_avatar,
      assignedLead: row.assigned_lead,
      assignedLeadAvatar: row.assigned_lead_avatar,
      startDate: row.start_date,
      targetGoLiveDate: row.target_go_live_date,
      tags: JSON.parse(row.tags_json || '[]'),
      sdlc: JSON.parse(row.sdlc_json || '{}'),
      subtasks: subRows
        .filter((s) => s.request_id === row.id)
        .map((s) => ({
          id: s.id,
          title: s.title,
          completed: s.completed === 1,
          assignedTo: s.assigned_to,
          dueDate: s.due_date,
        })),
      comments: comRows
        .filter((c) => c.request_id === row.id)
        .map((c) => ({
          id: c.id,
          authorId: c.author_id,
          authorName: c.author_name,
          authorAvatar: c.author_avatar,
          authorRole: c.author_role,
          content: c.content,
          timestamp: c.timestamp_label,
          stageTagged: c.stage_tagged || undefined,
        })),
    }));

    return jsonResponse({ success: true, requests });
  } catch (err) {
    return jsonResponse(
      { success: false, error: err instanceof Error ? err.message : 'Failed to load requests from D1' },
      500
    );
  }
}

export async function onRequestPost(context: PagesContext): Promise<Response> {
  const db = context.env.DB;
  if (!db) return d1MissingResponse();

  try {
    const req = (await context.request.json()) as {
      id: string;
      code: string;
      title: string;
      type: string;
      department: string;
      urgency: string;
      status: string;
      currentSDLCStage: number;
      workflowId: string;
      requesterName: string;
      requesterEmail: string;
      requesterAvatar: string;
      assignedLead: string;
      assignedLeadAvatar: string;
      startDate: string;
      targetGoLiveDate: string;
      tags?: string[];
      sdlc?: Record<string, any>;
      subtasks?: { id: string; title: string; completed: boolean; assignedTo: string; dueDate: string }[];
      comments?: {
        id: string;
        authorId: string;
        authorName: string;
        authorAvatar: string;
        authorRole: string;
        content: string;
        timestamp: string;
        stageTagged?: string;
      }[];
      actorId?: string;
      actorRole?: string;
    };

    const sdlc = req.sdlc || {};
    const effortDays = sdlc.planning?.effortEstimateDays || 0;
    const hoursSaved = sdlc.evaluation?.hoursSavedPerWeek || 0;
    const pctComplete = sdlc.development?.percentComplete || 0;
    const mgrApproved = sdlc.planning?.managerApproved ? 1 : 0;
    const reqSigned = sdlc.requirements?.requesterSignedOff && sdlc.requirements?.analystSignedOff ? 1 : 0;
    const desApproved = sdlc.design?.designApproved ? 1 : 0;
    const uatSigned = sdlc.testing?.uatSignedOff ? 1 : 0;

    const statements = [
      db
        .prepare(
          `INSERT INTO requests (
             id, code, title, type, department, urgency, status, current_sdlc_stage,
             workflow_id, requester_name, requester_email, requester_avatar,
             assigned_lead, assigned_lead_avatar, start_date, target_go_live_date,
             tags_json, sdlc_json, effort_estimate_days, hours_saved_per_week,
             percent_complete, manager_approved, requirements_signed_off,
             design_approved, uat_signed_off, updated_at
           ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
           ON CONFLICT(id) DO UPDATE SET
             title = excluded.title,
             type = excluded.type,
             department = excluded.department,
             urgency = excluded.urgency,
             status = excluded.status,
             current_sdlc_stage = excluded.current_sdlc_stage,
             workflow_id = excluded.workflow_id,
             assigned_lead = excluded.assigned_lead,
             target_go_live_date = excluded.target_go_live_date,
             tags_json = excluded.tags_json,
             sdlc_json = excluded.sdlc_json,
             effort_estimate_days = excluded.effort_estimate_days,
             hours_saved_per_week = excluded.hours_saved_per_week,
             percent_complete = excluded.percent_complete,
             manager_approved = excluded.manager_approved,
             requirements_signed_off = excluded.requirements_signed_off,
             design_approved = excluded.design_approved,
             uat_signed_off = excluded.uat_signed_off,
             updated_at = datetime('now')`
        )
        .bind(
          req.id,
          req.code,
          req.title,
          req.type,
          req.department,
          req.urgency,
          req.status,
          req.currentSDLCStage,
          req.workflowId,
          req.requesterName,
          req.requesterEmail,
          req.requesterAvatar || '',
          req.assignedLead,
          req.assignedLeadAvatar || '',
          req.startDate,
          req.targetGoLiveDate,
          JSON.stringify(req.tags || []),
          JSON.stringify(sdlc),
          effortDays,
          hoursSaved,
          pctComplete,
          mgrApproved,
          reqSigned,
          desApproved,
          uatSigned
        ),
    ];

    if (Array.isArray(req.subtasks)) {
      statements.push(db.prepare(`DELETE FROM subtasks WHERE request_id = ?`).bind(req.id));
      for (const st of req.subtasks) {
        statements.push(
          db
            .prepare(
              `INSERT INTO subtasks (id, request_id, title, completed, assigned_to, due_date)
               VALUES (?, ?, ?, ?, ?, ?)`
            )
            .bind(st.id, req.id, st.title, st.completed ? 1 : 0, st.assignedTo, st.dueDate)
        );
      }
    }

    if (Array.isArray(req.comments)) {
      statements.push(db.prepare(`DELETE FROM comments WHERE request_id = ?`).bind(req.id));
      for (const c of req.comments) {
        statements.push(
          db
            .prepare(
              `INSERT INTO comments (id, request_id, author_id, author_name, author_avatar, author_role, content, stage_tagged, timestamp_label)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
            )
            .bind(
              c.id,
              req.id,
              c.authorId,
              c.authorName,
              c.authorAvatar || '',
              c.authorRole,
              c.content,
              c.stageTagged || null,
              c.timestamp
            )
        );
      }
    }

    statements.push(
      db
        .prepare(
          `INSERT INTO analytics_events (id, event_type, user_id, user_role, department, entity_type, entity_id, metric_value, metadata_json)
           VALUES (?, 'request_synced', ?, ?, ?, 'request', ?, ?, ?)`
        )
        .bind(
          generateId('evt'),
          req.actorId || 'system',
          req.actorRole || 'Admin',
          req.department,
          req.id,
          effortDays,
          JSON.stringify({ code: req.code, stage: req.currentSDLCStage, status: req.status })
        )
    );

    await db.batch(statements);
    await refreshDailyAnalyticsSnapshot(db);

    return jsonResponse({ success: true, id: req.id, code: req.code });
  } catch (err) {
    return jsonResponse(
      { success: false, error: err instanceof Error ? err.message : 'Failed to save request in D1' },
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
    if (!id) return jsonResponse({ success: false, error: 'Missing request id' }, 400);

    await db.prepare(`DELETE FROM requests WHERE id = ?`).bind(id).run();
    await refreshDailyAnalyticsSnapshot(db);

    return jsonResponse({ success: true, deletedId: id });
  } catch (err) {
    return jsonResponse(
      { success: false, error: err instanceof Error ? err.message : 'Failed to delete request' },
      500
    );
  }
}
