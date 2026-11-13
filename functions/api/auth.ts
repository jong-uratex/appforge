// Cloudflare Pages Function: /api/auth
// Stores & verifies user details, credentials (SHA-256), sessions, and login analytics in Cloudflare D1

import {
  PagesContext,
  jsonResponse,
  d1MissingResponse,
  sha256Hex,
  generateId,
  refreshDailyAnalyticsSnapshot,
} from '../types/d1';

interface D1UserRow {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  role: 'Admin' | 'Project Manager' | 'Team Member';
  department: string;
  title: string;
  avatar: string;
  is_manager: number;
  is_it_lead: number;
  is_developer: number;
  is_qa: number;
  is_active: number;
  last_login_at: string | null;
  created_at: string;
}

function mapUserRow(row: D1UserRow) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    department: row.department,
    title: row.title,
    avatar: row.avatar,
    createdAt: row.created_at,
    lastLoginAt: row.last_login_at,
    isManager: row.is_manager === 1,
    isITLead: row.is_it_lead === 1,
    isDeveloper: row.is_developer === 1,
    isQA: row.is_qa === 1,
  };
}

export async function onRequestGet(context: PagesContext): Promise<Response> {
  const db = context.env.DB;
  if (!db) return d1MissingResponse();

  try {
    const result = await db
      .prepare(
        `SELECT id, name, email, role, department, title, avatar,
                is_manager, is_it_lead, is_developer, is_qa, is_active, last_login_at, created_at
         FROM users WHERE is_active = 1 ORDER BY created_at ASC`
      )
      .all<D1UserRow>();

    return jsonResponse({
      success: true,
      users: (result.results || []).map(mapUserRow),
    });
  } catch (err) {
    return jsonResponse(
      { success: false, error: err instanceof Error ? err.message : 'Failed to fetch users' },
      500
    );
  }
}

export async function onRequestPost(context: PagesContext): Promise<Response> {
  const db = context.env.DB;
  if (!db) return d1MissingResponse();

  try {
    const body = (await context.request.json()) as {
      action: 'login' | 'register' | 'logout' | 'verify' | 'update_profile' | 'change_password';
      email?: string;
      password?: string;
      currentPassword?: string;
      newPassword?: string;
      name?: string;
      role?: 'Admin' | 'Project Manager' | 'Team Member';
      department?: string;
      title?: string;
      avatar?: string;
      token?: string;
      userId?: string;
    };

    if (body.action === 'login') {
      const email = (body.email || '').trim().toLowerCase();
      if (!email) {
        return jsonResponse({ success: false, error: 'Email is required.' }, 400);
      }

      const user = await db
        .prepare(`SELECT * FROM users WHERE lower(email) = ? AND is_active = 1`)
        .bind(email)
        .first<D1UserRow>();

      if (!user) {
        return jsonResponse(
          { success: false, error: 'No account found with that email address.' },
          401
        );
      }

      if (body.password) {
        const inputHash = await sha256Hex(body.password);
        if (user.password_hash && user.password_hash !== inputHash) {
          return jsonResponse({ success: false, error: 'Invalid password.' }, 401);
        }
      }

      const rawToken = crypto.randomUUID() + '-' + crypto.randomUUID();
      const tokenHash = await sha256Hex(rawToken);
      const sessionId = generateId('sess');
      const expiresAt = new Date(Date.now() + 7 * 86400000).toISOString();
      const ua = context.request.headers.get('User-Agent') || 'unknown';
      const ip = context.request.headers.get('CF-Connecting-IP') || 'edge';

      await db.batch([
        db
          .prepare(`UPDATE users SET last_login_at = datetime('now'), updated_at = datetime('now') WHERE id = ?`)
          .bind(user.id),
        db
          .prepare(
            `INSERT INTO user_sessions (id, user_id, token_hash, user_agent, ip_address, expires_at)
             VALUES (?, ?, ?, ?, ?, ?)`
          )
          .bind(sessionId, user.id, tokenHash, ua.slice(0, 250), ip, expiresAt),
        db
          .prepare(
            `INSERT INTO analytics_events (id, event_type, user_id, user_role, department, entity_type, entity_id, metric_value, metadata_json)
             VALUES (?, 'user_login', ?, ?, ?, 'user', ?, 1, ?)`
          )
          .bind(
            generateId('evt'),
            user.id,
            user.role,
            user.department,
            user.id,
            JSON.stringify({ email: user.email, ip })
          ),
      ]);

      await refreshDailyAnalyticsSnapshot(db);

      return jsonResponse({
        success: true,
        user: mapUserRow(user),
        sessionToken: rawToken,
        expiresAt,
      });
    }

    if (body.action === 'register') {
      const name = (body.name || '').trim();
      const email = (body.email || '').trim().toLowerCase();
      const role = body.role || 'Team Member';
      const department = body.department || 'Management Information Systems (MIS)';
      const title = (body.title || '').trim() || `${role} in ${department}`;
      const password = body.password || 'uratex2026';

      if (!name || !email) {
        return jsonResponse({ success: false, error: 'Name and email are required.' }, 400);
      }

      const existing = await db
        .prepare(`SELECT id FROM users WHERE lower(email) = ?`)
        .bind(email)
        .first<{ id: string }>();

      if (existing) {
        return jsonResponse(
          { success: false, error: 'An account with this corporate email already exists.' },
          409
        );
      }

      const userId = generateId('usr');
      const passwordHash = await sha256Hex(password);
      const avatar = `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&h=120&q=80`;
      const isManager = role === 'Admin' || role === 'Project Manager' ? 1 : 0;
      const isItLead = role === 'Admin' ? 1 : 0;
      const isDev = role === 'Team Member' ? 1 : 0;
      const createdDate = new Date().toISOString().split('T')[0];

      const rawToken = crypto.randomUUID() + '-' + crypto.randomUUID();
      const tokenHash = await sha256Hex(rawToken);
      const sessionId = generateId('sess');
      const expiresAt = new Date(Date.now() + 7 * 86400000).toISOString();

      await db.batch([
        db
          .prepare(
            `INSERT INTO users (
               id, name, email, password_hash, role, department, title, avatar,
               is_manager, is_it_lead, is_developer, is_qa, is_active, last_login_at, created_at
             ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 1, datetime('now'), ?)`
          )
          .bind(userId, name, email, passwordHash, role, department, title, avatar, isManager, isItLead, isDev, createdDate),
        db
          .prepare(
            `INSERT INTO user_sessions (id, user_id, token_hash, expires_at) VALUES (?, ?, ?, ?)`
          )
          .bind(sessionId, userId, tokenHash, expiresAt),
        db
          .prepare(
            `INSERT INTO analytics_events (id, event_type, user_id, user_role, department, entity_type, entity_id, metric_value, metadata_json)
             VALUES (?, 'user_registered', ?, ?, ?, 'user', ?, 1, ?)`
          )
          .bind(generateId('evt'), userId, role, department, userId, JSON.stringify({ email, role })),
      ]);

      await refreshDailyAnalyticsSnapshot(db);

      return jsonResponse({
        success: true,
        user: {
          id: userId,
          name,
          email,
          role,
          department,
          title,
          avatar,
          createdAt: createdDate,
          isManager: isManager === 1,
          isITLead: isItLead === 1,
          isDeveloper: isDev === 1,
          isQA: false,
        },
        sessionToken: rawToken,
        expiresAt,
      });
    }

    if (body.action === 'logout') {
      if (body.token) {
        const tokenHash = await sha256Hex(body.token);
        await db.prepare(`DELETE FROM user_sessions WHERE token_hash = ?`).bind(tokenHash).run();
      }
      return jsonResponse({ success: true });
    }

    if (body.action === 'verify' && body.token) {
      const tokenHash = await sha256Hex(body.token);
      const sess = await db
        .prepare(
          `SELECT u.* FROM user_sessions s
           JOIN users u ON s.user_id = u.id
           WHERE s.token_hash = ? AND s.expires_at > datetime('now') AND u.is_active = 1`
        )
        .bind(tokenHash)
        .first<D1UserRow>();

      if (!sess) {
        return jsonResponse({ success: false, valid: false }, 401);
      }

      return jsonResponse({
        success: true,
        valid: true,
        user: mapUserRow(sess),
      });
    }

    if (body.action === 'update_profile') {
      let targetUserId = body.userId;

      if (body.token) {
        const tokenHash = await sha256Hex(body.token);
        const sess = await db
          .prepare(
            `SELECT user_id FROM user_sessions WHERE token_hash = ? AND expires_at > datetime('now')`
          )
          .bind(tokenHash)
          .first<{ user_id: string }>();
        if (sess?.user_id && !targetUserId) {
          targetUserId = sess.user_id;
        }
      }

      if (!targetUserId) {
        return jsonResponse({ success: false, error: 'User ID is required to update profile.' }, 400);
      }

      const existing = await db
        .prepare(`SELECT * FROM users WHERE id = ? AND is_active = 1`)
        .bind(targetUserId)
        .first<D1UserRow>();

      if (!existing) {
        return jsonResponse({ success: false, error: 'User account not found in Cloudflare D1.' }, 404);
      }

      const nextName = (body.name || existing.name).trim();
      const nextDept = (body.department || existing.department).trim();
      const nextTitle = (body.title || existing.title).trim();
      const nextAvatar = body.avatar !== undefined ? body.avatar.trim() : existing.avatar;

      // Only allow role updates if the existing user is an Admin (prevents privilege escalation)
      const nextRole =
        body.role && existing.role === 'Admin' ? body.role : existing.role;
      const isManager = nextRole === 'Admin' || nextRole === 'Project Manager' ? 1 : 0;
      const isItLead = nextRole === 'Admin' ? 1 : 0;
      const isDev = nextRole === 'Team Member' ? 1 : 0;

      if (!nextName) {
        return jsonResponse({ success: false, error: 'Full name cannot be empty.' }, 400);
      }

      await db.batch([
        db
          .prepare(
            `UPDATE users
             SET name = ?, role = ?, department = ?, title = ?, avatar = ?,
                 is_manager = ?, is_it_lead = ?, is_developer = ?, updated_at = datetime('now')
             WHERE id = ?`
          )
          .bind(
            nextName,
            nextRole,
            nextDept,
            nextTitle,
            nextAvatar,
            isManager,
            isItLead,
            isDev,
            existing.id
          ),
        db
          .prepare(
            `INSERT INTO analytics_events (id, event_type, user_id, user_role, department, entity_type, entity_id, metric_value, metadata_json)
             VALUES (?, 'profile_updated', ?, ?, ?, 'user', ?, 1, ?)`
          )
          .bind(
            generateId('evt'),
            existing.id,
            nextRole,
            nextDept,
            existing.id,
            JSON.stringify({ name: nextName, department: nextDept, title: nextTitle })
          ),
      ]);

      const updated = await db
        .prepare(`SELECT * FROM users WHERE id = ?`)
        .bind(existing.id)
        .first<D1UserRow>();

      return jsonResponse({
        success: true,
        user: updated ? mapUserRow(updated) : mapUserRow(existing),
      });
    }

    if (body.action === 'change_password') {
      let targetUserId = body.userId;

      if (body.token && !targetUserId) {
        const tokenHash = await sha256Hex(body.token);
        const sess = await db
          .prepare(
            `SELECT user_id FROM user_sessions WHERE token_hash = ? AND expires_at > datetime('now')`
          )
          .bind(tokenHash)
          .first<{ user_id: string }>();
        if (sess?.user_id) targetUserId = sess.user_id;
      }

      if (!targetUserId || !body.currentPassword || !body.newPassword) {
        return jsonResponse(
          { success: false, error: 'Current password and new password are required.' },
          400
        );
      }

      if (body.newPassword.length < 6) {
        return jsonResponse(
          { success: false, error: 'New password must be at least 6 characters long.' },
          400
        );
      }

      const existing = await db
        .prepare(`SELECT * FROM users WHERE id = ? AND is_active = 1`)
        .bind(targetUserId)
        .first<D1UserRow>();

      if (!existing) {
        return jsonResponse({ success: false, error: 'User account not found in Cloudflare D1.' }, 404);
      }

      const currentHash = await sha256Hex(body.currentPassword);
      if (existing.password_hash && existing.password_hash !== currentHash) {
        return jsonResponse(
          { success: false, error: 'Current password is incorrect.' },
          401
        );
      }

      const newHash = await sha256Hex(body.newPassword);
      await db.batch([
        db
          .prepare(`UPDATE users SET password_hash = ?, updated_at = datetime('now') WHERE id = ?`)
          .bind(newHash, existing.id),
        db
          .prepare(
            `INSERT INTO analytics_events (id, event_type, user_id, user_role, department, entity_type, entity_id, metric_value, metadata_json)
             VALUES (?, 'password_changed', ?, ?, ?, 'user', ?, 1, ?)`
          )
          .bind(
            generateId('evt'),
            existing.id,
            existing.role,
            existing.department,
            existing.id,
            JSON.stringify({ email: existing.email })
          ),
      ]);

      return jsonResponse({ success: true });
    }

    return jsonResponse({ success: false, error: 'Unsupported auth action' }, 400);
  } catch (err) {
    return jsonResponse(
      { success: false, error: err instanceof Error ? err.message : 'Authentication error' },
      500
    );
  }
}
