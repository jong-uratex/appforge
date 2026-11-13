// Cloudflare Pages Function: /api/bootstrap
// Hydrates full workspace from Cloudflare D1 SQLite or bulk-syncs/seeds initial records

import {
  PagesContext,
  jsonResponse,
  d1MissingResponse,
  sha256Hex,
  refreshDailyAnalyticsSnapshot,
} from '../types/d1';

export async function onRequestGet(context: PagesContext): Promise<Response> {
  const db = context.env.DB;
  if (!db) return d1MissingResponse();

  try {
    const [usersRes, wfRes, stgRes, reqRes, subRes, comRes, taskRes, actRes, evtRes, snapRes] =
      await Promise.all([
        db
          .prepare(
            `SELECT id, name, email, role, department, title, avatar,
                    is_manager, is_it_lead, is_developer, is_qa, last_login_at, created_at
             FROM users WHERE is_active = 1 ORDER BY created_at ASC`
          )
          .all<any>(),
        db.prepare(`SELECT * FROM workflows ORDER BY is_default DESC, created_at ASC`).all<any>(),
        db.prepare(`SELECT * FROM workflow_stages ORDER BY stage_order ASC`).all<any>(),
        db.prepare(`SELECT * FROM requests ORDER BY created_at DESC`).all<any>(),
        db.prepare(`SELECT * FROM subtasks`).all<any>(),
        db.prepare(`SELECT * FROM comments ORDER BY created_at ASC`).all<any>(),
        db.prepare(`SELECT * FROM tasks ORDER BY created_at DESC`).all<any>(),
        db.prepare(`SELECT * FROM activities ORDER BY created_at_ms DESC LIMIT 200`).all<any>(),
        db.prepare(`SELECT COUNT(*) as count FROM analytics_events`).first<{ count: number }>(),
        db
          .prepare(`SELECT * FROM analytics_daily_snapshots ORDER BY snapshot_date DESC LIMIT 14`)
          .all<any>(),
      ]);

    const users = (usersRes.results || []).map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      department: u.department,
      title: u.title,
      avatar: u.avatar,
      createdAt: u.created_at,
      lastLoginAt: u.last_login_at,
      isManager: u.is_manager === 1,
      isITLead: u.is_it_lead === 1,
      isDeveloper: u.is_developer === 1,
      isQA: u.is_qa === 1,
    }));

    const stgRows = stgRes.results || [];
    const workflows = (wfRes.results || []).map((wf) => ({
      id: wf.id,
      name: wf.name,
      description: wf.description || '',
      isDefault: wf.is_default === 1,
      applicableTypes: JSON.parse(wf.applicable_types_json || '[]'),
      createdAt: wf.created_at,
      updatedAt: wf.updated_at,
      stages: stgRows
        .filter((s) => s.workflow_id === wf.id)
        .map((s) => ({
          id: s.id,
          name: s.name,
          description: s.description || '',
          badgeColor: s.badge_color,
          accentBg: s.accent_bg,
          order: s.stage_order,
          isGate: s.is_gate === 1,
          requiresSignoff: s.requires_signoff === 1,
        })),
    }));

    const subRows = subRes.results || [];
    const comRows = comRes.results || [];
    const requests = (reqRes.results || []).map((row) => ({
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

    const tasks = (taskRes.results || []).map((t) => ({
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

    const activities = (actRes.results || []).map((a) => ({
      id: a.id,
      type: a.type,
      actorId: a.actor_id,
      actorName: a.actor_name,
      actorAvatar: a.actor_avatar || '',
      actorRole: a.actor_role,
      targetId: a.target_id,
      targetCode: a.target_code,
      targetTitle: a.target_title,
      actionSummary: a.action_summary,
      details: a.details || undefined,
      timestamp: a.timestamp_label,
      createdAt: a.created_at_ms,
    }));

    return jsonResponse({
      success: true,
      connected: true,
      seeded: users.length > 0 && workflows.length > 0 && requests.length > 0,
      users,
      workflows,
      requests,
      tasks,
      activities,
      analytics: {
        totalEvents: evtRes?.count ?? 0,
        dailySnapshots: snapRes.results || [],
      },
    });
  } catch (err) {
    return jsonResponse(
      {
        success: false,
        connected: false,
        error: err instanceof Error ? err.message : 'Failed to bootstrap from D1',
      },
      500
    );
  }
}

export async function onRequestPost(context: PagesContext): Promise<Response> {
  const db = context.env.DB;
  if (!db) return d1MissingResponse();

  try {
    const payload = (await context.request.json()) as {
      users?: any[];
      workflows?: any[];
      requests?: any[];
      tasks?: any[];
      activities?: any[];
    };

    const defaultPasswordHash = await sha256Hex('uratex2026');
    const statements = [];

    for (const u of payload.users || []) {
      statements.push(
        db
          .prepare(
            `INSERT OR IGNORE INTO users (
               id, name, email, password_hash, role, department, title, avatar,
               is_manager, is_it_lead, is_developer, is_qa, is_active, created_at
             ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)`
          )
          .bind(
            u.id,
            u.name,
            u.email,
            defaultPasswordHash,
            u.role,
            u.department,
            u.title || u.role,
            u.avatar || '',
            u.isManager ? 1 : 0,
            u.isITLead ? 1 : 0,
            u.isDeveloper ? 1 : 0,
            u.isQA ? 1 : 0,
            u.createdAt || new Date().toISOString().split('T')[0]
          )
      );
    }

    for (const wf of payload.workflows || []) {
      statements.push(
        db
          .prepare(
            `INSERT OR REPLACE INTO workflows (id, name, description, is_default, applicable_types_json, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, ?)`
          )
          .bind(
            wf.id,
            wf.name,
            wf.description || '',
            wf.isDefault ? 1 : 0,
            JSON.stringify(wf.applicableTypes || []),
            wf.createdAt || '2026-01-15',
            wf.updatedAt || '2026-10-01'
          )
      );
      statements.push(db.prepare(`DELETE FROM workflow_stages WHERE workflow_id = ?`).bind(wf.id));
      for (const stg of wf.stages || []) {
        statements.push(
          db
            .prepare(
              `INSERT INTO workflow_stages (id, workflow_id, name, description, badge_color, accent_bg, stage_order, is_gate, requires_signoff)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
            )
            .bind(
              stg.id,
              wf.id,
              stg.name,
              stg.description || '',
              stg.badgeColor,
              stg.accentBg,
              stg.order,
              stg.isGate ? 1 : 0,
              stg.requiresSignoff ? 1 : 0
            )
        );
      }
    }

    for (const req of payload.requests || []) {
      const sdlc = req.sdlc || {};
      statements.push(
        db
          .prepare(
            `INSERT OR REPLACE INTO requests (
               id, code, title, type, department, urgency, status, current_sdlc_stage,
               workflow_id, requester_name, requester_email, requester_avatar,
               assigned_lead, assigned_lead_avatar, start_date, target_go_live_date,
               tags_json, sdlc_json, effort_estimate_days, hours_saved_per_week,
               percent_complete, manager_approved, requirements_signed_off,
               design_approved, uat_signed_off
             ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
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
            sdlc.planning?.effortEstimateDays || 0,
            sdlc.evaluation?.hoursSavedPerWeek || 0,
            sdlc.development?.percentComplete || 0,
            sdlc.planning?.managerApproved ? 1 : 0,
            sdlc.requirements?.requesterSignedOff && sdlc.requirements?.analystSignedOff ? 1 : 0,
            sdlc.design?.designApproved ? 1 : 0,
            sdlc.testing?.uatSignedOff ? 1 : 0
          )
      );
      statements.push(db.prepare(`DELETE FROM subtasks WHERE request_id = ?`).bind(req.id));
      for (const st of req.subtasks || []) {
        statements.push(
          db
            .prepare(
              `INSERT OR REPLACE INTO subtasks (id, request_id, title, completed, assigned_to, due_date)
               VALUES (?, ?, ?, ?, ?, ?)`
            )
            .bind(st.id, req.id, st.title, st.completed ? 1 : 0, st.assignedTo, st.dueDate)
        );
      }
      statements.push(db.prepare(`DELETE FROM comments WHERE request_id = ?`).bind(req.id));
      for (const c of req.comments || []) {
        statements.push(
          db
            .prepare(
              `INSERT OR REPLACE INTO comments (id, request_id, author_id, author_name, author_avatar, author_role, content, stage_tagged, timestamp_label)
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

    for (const t of payload.tasks || []) {
      statements.push(
        db
          .prepare(
            `INSERT OR REPLACE INTO tasks (
               id, project_id, project_code, project_title, title, description,
               status, priority, assigned_to_id, assigned_to_name, assigned_to_avatar,
               due_date, estimated_hours, logged_hours, tags_json, created_at
             ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
          )
          .bind(
            t.id,
            t.projectId,
            t.projectCode,
            t.projectTitle,
            t.title,
            t.description || '',
            t.status,
            t.priority,
            t.assignedToId,
            t.assignedToName,
            t.assignedToAvatar || '',
            t.dueDate,
            t.estimatedHours || 0,
            t.loggedHours || 0,
            JSON.stringify(t.tags || []),
            t.createdAt || new Date().toISOString().split('T')[0]
          )
      );
    }

    for (const a of payload.activities || []) {
      statements.push(
        db
          .prepare(
            `INSERT OR IGNORE INTO activities (
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

    // D1 batch executes atomically in SQLite transaction chunks
    const CHUNK_SIZE = 50;
    for (let i = 0; i < statements.length; i += CHUNK_SIZE) {
      await db.batch(statements.slice(i, i + CHUNK_SIZE));
    }

    await refreshDailyAnalyticsSnapshot(db);

    return jsonResponse({
      success: true,
      synced: {
        users: (payload.users || []).length,
        workflows: (payload.workflows || []).length,
        requests: (payload.requests || []).length,
        tasks: (payload.tasks || []).length,
        activities: (payload.activities || []).length,
      },
    });
  } catch (err) {
    return jsonResponse(
      { success: false, error: err instanceof Error ? err.message : 'Bulk sync to D1 failed' },
      500
    );
  }
}
