-- ============================================================================
-- MIS AppForge - Uratex Philippines
-- Cloudflare D1 (SQLite) Database Schema
-- Migration: 0001_init_d1_schema.sql
-- ============================================================================

PRAGMA foreign_keys = ON;

-- ----------------------------------------------------------------------------
-- 1. USERS & AUTHENTICATION
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('Admin', 'Project Manager', 'Team Member')),
  department TEXT NOT NULL,
  title TEXT NOT NULL,
  avatar TEXT,
  is_manager INTEGER NOT NULL DEFAULT 0,
  is_it_lead INTEGER NOT NULL DEFAULT 0,
  is_developer INTEGER NOT NULL DEFAULT 0,
  is_qa INTEGER NOT NULL DEFAULT 0,
  is_active INTEGER NOT NULL DEFAULT 1,
  last_login_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_department ON users(department);

-- ----------------------------------------------------------------------------
-- 2. USER SESSIONS (Edge Auth Tokens stored in D1)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS user_sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  user_agent TEXT,
  ip_address TEXT,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_user_sessions_user ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(token_hash);

-- ----------------------------------------------------------------------------
-- 3. CUSTOM PROJECT WORKFLOWS & STAGES
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS workflows (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  is_default INTEGER NOT NULL DEFAULT 0,
  applicable_types_json TEXT NOT NULL DEFAULT '["New Application","Enhancement"]',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS workflow_stages (
  id TEXT PRIMARY KEY,
  workflow_id TEXT NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  badge_color TEXT NOT NULL DEFAULT 'bg-blue-600 text-white',
  accent_bg TEXT NOT NULL DEFAULT 'bg-blue-50 text-blue-800 border-blue-200',
  stage_order INTEGER NOT NULL,
  is_gate INTEGER NOT NULL DEFAULT 0,
  requires_signoff INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_workflow_stages_wf ON workflow_stages(workflow_id, stage_order);

-- ----------------------------------------------------------------------------
-- 4. PROJECT INITIATIVES / CHANGE REQUESTS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS requests (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('New Application', 'Enhancement', 'Quick Win')),
  department TEXT NOT NULL,
  urgency TEXT NOT NULL CHECK (urgency IN ('Low', 'Medium', 'High', 'Critical')),
  status TEXT NOT NULL,
  current_sdlc_stage INTEGER NOT NULL DEFAULT 1,
  workflow_id TEXT NOT NULL REFERENCES workflows(id),
  requester_name TEXT NOT NULL,
  requester_email TEXT NOT NULL,
  requester_avatar TEXT,
  assigned_lead TEXT NOT NULL,
  assigned_lead_avatar TEXT,
  start_date TEXT NOT NULL,
  target_go_live_date TEXT NOT NULL,
  tags_json TEXT NOT NULL DEFAULT '[]',
  sdlc_json TEXT NOT NULL,
  -- Indexed analytics columns for fast SQL aggregation
  effort_estimate_days REAL NOT NULL DEFAULT 0,
  hours_saved_per_week REAL NOT NULL DEFAULT 0,
  percent_complete INTEGER NOT NULL DEFAULT 0,
  manager_approved INTEGER NOT NULL DEFAULT 0,
  requirements_signed_off INTEGER NOT NULL DEFAULT 0,
  design_approved INTEGER NOT NULL DEFAULT 0,
  uat_signed_off INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_requests_code ON requests(code);
CREATE INDEX IF NOT EXISTS idx_requests_department ON requests(department);
CREATE INDEX IF NOT EXISTS idx_requests_stage ON requests(current_sdlc_stage);
CREATE INDEX IF NOT EXISTS idx_requests_workflow ON requests(workflow_id);
CREATE INDEX IF NOT EXISTS idx_requests_urgency ON requests(urgency);

-- ----------------------------------------------------------------------------
-- 5. SUBTASKS (Work Breakdown Checklists per Initiative)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS subtasks (
  id TEXT PRIMARY KEY,
  request_id TEXT NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  completed INTEGER NOT NULL DEFAULT 0,
  assigned_to TEXT NOT NULL,
  due_date TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_subtasks_request ON subtasks(request_id);

-- ----------------------------------------------------------------------------
-- 6. PROJECT TASKS (Task Management Center)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
  project_code TEXT NOT NULL,
  project_title TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL CHECK (status IN ('To Do', 'In Progress', 'In Review', 'Done', 'Blocked')),
  priority TEXT NOT NULL CHECK (priority IN ('Critical', 'High', 'Medium', 'Low')),
  assigned_to_id TEXT NOT NULL,
  assigned_to_name TEXT NOT NULL,
  assigned_to_avatar TEXT,
  due_date TEXT NOT NULL,
  estimated_hours REAL NOT NULL DEFAULT 0,
  logged_hours REAL NOT NULL DEFAULT 0,
  tags_json TEXT NOT NULL DEFAULT '[]',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_tasks_project ON tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assignee ON tasks(assigned_to_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);

-- ----------------------------------------------------------------------------
-- 7. DISCUSSION COMMENTS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS comments (
  id TEXT PRIMARY KEY,
  request_id TEXT NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
  author_id TEXT NOT NULL,
  author_name TEXT NOT NULL,
  author_avatar TEXT,
  author_role TEXT NOT NULL,
  content TEXT NOT NULL,
  stage_tagged TEXT,
  timestamp_label TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_comments_request ON comments(request_id);

-- ----------------------------------------------------------------------------
-- 8. AUDIT TRAIL & ACTIVITY FEED
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS activities (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  actor_id TEXT NOT NULL,
  actor_name TEXT NOT NULL,
  actor_avatar TEXT,
  actor_role TEXT NOT NULL,
  target_id TEXT NOT NULL,
  target_code TEXT NOT NULL,
  target_title TEXT NOT NULL,
  action_summary TEXT NOT NULL,
  details TEXT,
  timestamp_label TEXT NOT NULL,
  created_at_ms INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_activities_created ON activities(created_at_ms DESC);
CREATE INDEX IF NOT EXISTS idx_activities_actor ON activities(actor_id);
CREATE INDEX IF NOT EXISTS idx_activities_target ON activities(target_id);

-- ----------------------------------------------------------------------------
-- 9. ANALYTICS EVENTS (User telemetry, stage velocity, ROI & feature usage)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS analytics_events (
  id TEXT PRIMARY KEY,
  event_type TEXT NOT NULL,
  user_id TEXT,
  user_role TEXT,
  department TEXT,
  entity_type TEXT,
  entity_id TEXT,
  metric_value REAL NOT NULL DEFAULT 0,
  metadata_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_analytics_events_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_user ON analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created ON analytics_events(created_at DESC);

-- ----------------------------------------------------------------------------
-- 10. ANALYTICS DAILY SNAPSHOTS (Historical KPI Rollups)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS analytics_daily_snapshots (
  snapshot_date TEXT PRIMARY KEY,
  total_requests INTEGER NOT NULL DEFAULT 0,
  in_dev_requests INTEGER NOT NULL DEFAULT 0,
  in_testing_requests INTEGER NOT NULL DEFAULT 0,
  in_production_requests INTEGER NOT NULL DEFAULT 0,
  total_tasks INTEGER NOT NULL DEFAULT 0,
  completed_tasks INTEGER NOT NULL DEFAULT 0,
  total_effort_days REAL NOT NULL DEFAULT 0,
  total_hours_saved_weekly REAL NOT NULL DEFAULT 0,
  gate_compliance_pct REAL NOT NULL DEFAULT 100,
  active_users_count INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ----------------------------------------------------------------------------
-- ANALYTICS SQL VIEWS FOR CLOUDFLARE D1 STUDIO & DASHBOARDS
-- ----------------------------------------------------------------------------

-- View 1: Department Resource & ROI Analytics
CREATE VIEW IF NOT EXISTS v_department_analytics AS
SELECT
  department,
  COUNT(*) AS total_initiatives,
  SUM(CASE WHEN current_sdlc_stage = 5 THEN 1 ELSE 0 END) AS in_development,
  SUM(CASE WHEN current_sdlc_stage = 6 THEN 1 ELSE 0 END) AS in_testing,
  SUM(CASE WHEN current_sdlc_stage >= 8 THEN 1 ELSE 0 END) AS in_production,
  ROUND(COALESCE(SUM(effort_estimate_days), 0), 1) AS total_effort_days,
  ROUND(COALESCE(SUM(hours_saved_per_week), 0), 1) AS total_weekly_hours_saved
FROM requests
GROUP BY department;

-- View 2: User Workload & Task Completion Analytics
CREATE VIEW IF NOT EXISTS v_user_workload_analytics AS
SELECT
  u.id AS user_id,
  u.name,
  u.email,
  u.role,
  u.department,
  u.title,
  COUNT(t.id) AS total_tasks,
  SUM(CASE WHEN t.status = 'Done' THEN 1 ELSE 0 END) AS completed_tasks,
  SUM(CASE WHEN t.status = 'In Progress' THEN 1 ELSE 0 END) AS in_progress_tasks,
  SUM(CASE WHEN t.status = 'Blocked' THEN 1 ELSE 0 END) AS blocked_tasks,
  ROUND(COALESCE(SUM(t.estimated_hours), 0), 1) AS total_estimated_hours,
  ROUND(COALESCE(SUM(t.logged_hours), 0), 1) AS total_logged_hours
FROM users u
LEFT JOIN tasks t ON u.id = t.assigned_to_id
GROUP BY u.id;

-- View 3: SDLC Pipeline Stage Distribution
CREATE VIEW IF NOT EXISTS v_sdlc_funnel_analytics AS
SELECT
  current_sdlc_stage AS stage_number,
  status AS stage_name,
  COUNT(*) AS request_count,
  ROUND(COALESCE(SUM(effort_estimate_days), 0), 1) AS effort_days,
  ROUND(COALESCE(AVG(percent_complete), 0), 1) AS avg_completion_pct
FROM requests
GROUP BY current_sdlc_stage, status
ORDER BY current_sdlc_stage ASC;
