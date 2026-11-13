// Cloudflare Pages Function: /api/workflows
// Full CRUD for Custom Project Workflows & Stage Definitions in Cloudflare D1

import { PagesContext, jsonResponse, d1MissingResponse, generateId } from '../types/d1';

interface D1WorkflowRow {
  id: string;
  name: string;
  description: string | null;
  is_default: number;
  applicable_types_json: string;
  created_at: string;
  updated_at: string;
}

interface D1StageRow {
  id: string;
  workflow_id: string;
  name: string;
  description: string | null;
  badge_color: string;
  accent_bg: string;
  stage_order: number;
  is_gate: number;
  requires_signoff: number;
}

export async function onRequestGet(context: PagesContext): Promise<Response> {
  const db = context.env.DB;
  if (!db) return d1MissingResponse();

  try {
    const wfRows = (await db.prepare(`SELECT * FROM workflows ORDER BY is_default DESC, created_at ASC`).all<D1WorkflowRow>()).results || [];
    const stgRows = (await db.prepare(`SELECT * FROM workflow_stages ORDER BY stage_order ASC`).all<D1StageRow>()).results || [];

    const workflows = wfRows.map((wf) => ({
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

    return jsonResponse({ success: true, workflows });
  } catch (err) {
    return jsonResponse(
      { success: false, error: err instanceof Error ? err.message : 'Failed to fetch workflows from D1' },
      500
    );
  }
}

export async function onRequestPost(context: PagesContext): Promise<Response> {
  const db = context.env.DB;
  if (!db) return d1MissingResponse();

  try {
    const wf = (await context.request.json()) as {
      id: string;
      name: string;
      description?: string;
      isDefault?: boolean;
      applicableTypes?: string[];
      createdAt?: string;
      updatedAt?: string;
      stages: {
        id: string;
        name: string;
        description?: string;
        badgeColor: string;
        accentBg: string;
        order: number;
        isGate?: boolean;
        requiresSignoff?: boolean;
      }[];
    };

    const statements = [
      db
        .prepare(
          `INSERT INTO workflows (id, name, description, is_default, applicable_types_json, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?)
           ON CONFLICT(id) DO UPDATE SET
             name = excluded.name,
             description = excluded.description,
             applicable_types_json = excluded.applicable_types_json,
             updated_at = excluded.updated_at`
        )
        .bind(
          wf.id,
          wf.name,
          wf.description || '',
          wf.isDefault ? 1 : 0,
          JSON.stringify(wf.applicableTypes || ['New Application', 'Enhancement']),
          wf.createdAt || new Date().toISOString().split('T')[0],
          wf.updatedAt || new Date().toISOString().split('T')[0]
        ),
      db.prepare(`DELETE FROM workflow_stages WHERE workflow_id = ?`).bind(wf.id),
    ];

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

    statements.push(
      db
        .prepare(
          `INSERT INTO analytics_events (id, event_type, entity_type, entity_id, metric_value, metadata_json)
           VALUES (?, 'workflow_synced', 'workflow', ?, ?, ?)`
        )
        .bind(generateId('evt'), wf.id, wf.stages?.length || 0, JSON.stringify({ name: wf.name }))
    );

    await db.batch(statements);
    return jsonResponse({ success: true, id: wf.id });
  } catch (err) {
    return jsonResponse(
      { success: false, error: err instanceof Error ? err.message : 'Failed to save workflow in D1' },
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
    if (!id) return jsonResponse({ success: false, error: 'Missing workflow id' }, 400);

    await db.prepare(`DELETE FROM workflows WHERE id = ? AND is_default = 0`).bind(id).run();
    return jsonResponse({ success: true, deletedId: id });
  } catch (err) {
    return jsonResponse(
      { success: false, error: err instanceof Error ? err.message : 'Failed to delete workflow' },
      500
    );
  }
}
