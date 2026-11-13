import React, { useState } from 'react';
import { useAppForge } from '../../context/AppForgeContext';
import {
  Cloud,
  X,
  Download,
  Upload,
  Copy,
  Database,
  ShieldCheck,
  Check,
  RefreshCw,
  Table2,
  BarChart3,
  Users,
  Terminal,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

const D1_SCHEMA_SQL = `-- MIS AppForge - Cloudflare D1 (SQLite) Schema
-- Paste into Cloudflare D1 Console or run:
-- npx wrangler d1 migrations apply uratex-appforge-db --remote

PRAGMA foreign_keys = ON;

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

CREATE TABLE IF NOT EXISTS user_sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  user_agent TEXT,
  ip_address TEXT,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

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

CREATE TABLE IF NOT EXISTS subtasks (
  id TEXT PRIMARY KEY,
  request_id TEXT NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  completed INTEGER NOT NULL DEFAULT 0,
  assigned_to TEXT NOT NULL,
  due_date TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

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

-- Analytics SQL Views
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

CREATE VIEW IF NOT EXISTS v_sdlc_funnel_analytics AS
SELECT
  current_sdlc_stage AS stage_number,
  status AS stage_name,
  COUNT(*) AS request_count,
  ROUND(COALESCE(SUM(effort_estimate_days), 0), 1) AS effort_days,
  ROUND(COALESCE(AVG(percent_complete), 0), 1) AS avg_completion_pct
FROM requests
GROUP BY current_sdlc_stage, status
ORDER BY current_sdlc_stage ASC;`;

const SCHEMA_TABLES = [
  { name: 'users', group: 'Auth & User Details', desc: 'Corporate accounts, SHA-256 credentials, RBAC roles, department & last login' },
  { name: 'user_sessions', group: 'Auth & User Details', desc: 'Edge authentication session tokens, IP address & expiry' },
  { name: 'workflows', group: 'Project Data', desc: 'Custom workflow templates and applicable initiative types' },
  { name: 'workflow_stages', group: 'Project Data', desc: 'Ordered stages, badge colors, and mandatory approval gates' },
  { name: 'requests', group: 'Project Data', desc: 'Change requests/initiatives, SDLC payloads, ROI & effort metrics' },
  { name: 'subtasks', group: 'Project Data', desc: 'Work breakdown subitems linked to each initiative' },
  { name: 'tasks', group: 'Project Data', desc: 'Sprint tasks, assignees, due dates, estimated & logged hours' },
  { name: 'comments', group: 'Collaboration', desc: 'Threaded team discussion messages per initiative' },
  { name: 'activities', group: 'Audit & Analytics', desc: 'Immutable audit trail of all project, gate & task mutations' },
  { name: 'analytics_events', group: 'Audit & Analytics', desc: 'Event stream tracking logins, page views, stage transitions & ROI' },
  { name: 'analytics_daily_snapshots', group: 'Audit & Analytics', desc: 'Daily KPI rollups (velocity, labor hours saved, gate compliance)' },
];

export const CloudflareDeployModal: React.FC = () => {
  const {
    isCloudflareModalOpen,
    setIsCloudflareModalOpen,
    exportData,
    importData,
    requests,
    tasks,
    users,
    workflows,
    activities,
    d1Status,
    d1Analytics,
    refreshD1Status,
    refreshFromD1,
    syncAllToD1,
  } = useAppForge();

  const [activeTab, setActiveTab] = useState<'overview' | 'schema' | 'wrangler' | 'backup'>('overview');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [importJsonText, setImportJsonText] = useState('');
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // User-customizable Wrangler D1 metadata
  const [dbName, setDbName] = useState('uratex-appforge-db');
  const [dbId, setDbId] = useState('your-d1-database-id-here');

  if (!isCloudflareModalOpen) return null;

  const wranglerTomlCode = `# Cloudflare Pages & Workers Configuration
name = "uratex-mis-appforge"
compatibility_date = "2026-11-09"
compatibility_flags = ["nodejs_compat"]
pages_build_output_dir = "dist"

# Cloudflare D1 Relational SQLite Database
[[d1_databases]]
binding = "DB"
database_name = "${dbName.trim() || 'uratex-appforge-db'}"
database_id = "${dbId.trim() || 'your-d1-database-id-here'}"
migrations_dir = "migrations"

[vars]
ENVIRONMENT = "production"
ORGANIZATION = "Uratex Philippines"`;

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handleDownloadSql = () => {
    const blob = new Blob([D1_SCHEMA_SQL], { type: 'text/sql' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = '0001_init_d1_schema.sql';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadBackup = () => {
    const data = exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `uratex-mis-appforge-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!importJsonText.trim()) return;
    const ok = importData(importJsonText.trim());
    if (ok) {
      setImportStatus('Successfully imported data!');
      setTimeout(() => setImportStatus(null), 3000);
    } else {
      setImportStatus('Error: Invalid JSON schema format.');
    }
  };

  const handleTestAndSync = async () => {
    setIsSyncing(true);
    setSyncMessage(null);
    await refreshD1Status();
    const res = await syncAllToD1();
    setSyncMessage(res.message);
    setIsSyncing(false);
  };

  const handleFetchFromD1 = async () => {
    setIsSyncing(true);
    setSyncMessage(null);
    const ok = await refreshFromD1();
    setSyncMessage(
      ok
        ? 'Refreshed live users, workflows, requests, tasks, audit logs & analytics from Cloudflare D1.'
        : 'Cloudflare D1 API not active in local preview runtime.'
    );
    setIsSyncing(false);
  };

  const isD1Connected = Boolean(d1Status?.connected && d1Status?.schemaReady);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full shadow-2xl border border-gray-200 border-t-4 border-t-amber-500 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded bg-amber-500 text-white flex items-center justify-center shadow-2xs">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">
                Cloudflare D1 SQLite Database & Serverless Deployment
              </h3>
              <p className="text-[11px] text-gray-500">
                Relational SQLite schema storing all project data, user details, audit trails, and analytics
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsCloudflareModalOpen(false)}
            className="text-gray-400 hover:text-gray-700 p-1 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 px-6 border-b border-gray-200 bg-white text-xs font-semibold text-gray-600 overflow-x-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 px-3 border-b-2 transition-colors shrink-0 ${
              activeTab === 'overview'
                ? 'border-amber-500 text-amber-700 font-bold'
                : 'border-transparent hover:text-gray-900'
            }`}
          >
            1. D1 Architecture & Sync
          </button>
          <button
            onClick={() => setActiveTab('schema')}
            className={`py-3 px-3 border-b-2 transition-colors shrink-0 ${
              activeTab === 'schema'
                ? 'border-amber-500 text-amber-700 font-bold'
                : 'border-transparent hover:text-gray-900'
            }`}
          >
            2. SQLite Schema (11 Tables)
          </button>
          <button
            onClick={() => setActiveTab('wrangler')}
            className={`py-3 px-3 border-b-2 transition-colors shrink-0 ${
              activeTab === 'wrangler'
                ? 'border-amber-500 text-amber-700 font-bold'
                : 'border-transparent hover:text-gray-900'
            }`}
          >
            3. Cloudflare Binding (wrangler.toml)
          </button>
          <button
            onClick={() => setActiveTab('backup')}
            className={`py-3 px-3 border-b-2 transition-colors shrink-0 ${
              activeTab === 'backup'
                ? 'border-amber-500 text-amber-700 font-bold'
                : 'border-transparent hover:text-gray-900'
            }`}
          >
            4. Export / Import JSON
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 space-y-4 text-xs text-gray-700 max-h-[75vh] overflow-y-auto">
          
          {/* TAB 1: ARCHITECTURE & LIVE SYNC */}
          {activeTab === 'overview' && (
            <div className="space-y-4">
              {/* Connection Status Banner */}
              <div
                className={`p-4 rounded border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  isD1Connected
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : 'bg-amber-50 border-amber-200 text-amber-900'
                }`}
              >
                <div className="flex items-start gap-3">
                  {isD1Connected ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <Cloud className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  )}
                  <div className="space-y-0.5">
                    <div className="font-bold">
                      {isD1Connected
                        ? 'Connected to Cloudflare D1 SQLite Edge Database'
                        : 'D1 Edge API Ready (Local Browser Preview Mode)'}
                    </div>
                    <p className="text-[11px] opacity-90 leading-relaxed">
                      {isD1Connected
                        ? 'All user credentials, project initiatives, tasks, audit logs, and analytics events are persisting live in Cloudflare D1.'
                        : 'Full Pages Functions (/api/auth, /api/requests, /api/tasks, /api/workflows, /api/analytics, /api/bootstrap) are built and ready. Bind your D1 database in Cloudflare Pages to enable live SQL persistence.'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={handleFetchFromD1}
                    disabled={isSyncing}
                    className="px-3 py-2 bg-white hover:bg-gray-100 text-gray-800 border border-gray-300 rounded font-bold text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                    <span>Fetch Latest</span>
                  </button>
                  <button
                    onClick={handleTestAndSync}
                    disabled={isSyncing}
                    className="px-3.5 py-2 bg-gray-900 hover:bg-black text-white rounded font-bold text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                    <span>{isSyncing ? 'Syncing...' : 'Sync to D1'}</span>
                  </button>
                </div>
              </div>

              {syncMessage && (
                <div className="p-3 bg-gray-50 border border-gray-200 rounded text-xs font-mono text-gray-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>{syncMessage}</span>
                </div>
              )}

              {/* Live Data Footprint Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-gray-50 border border-gray-200 rounded">
                  <div className="flex items-center gap-1.5 text-[11px] text-gray-500 font-semibold">
                    <Users className="w-3.5 h-3.5 text-purple-600" />
                    <span>Users Table</span>
                  </div>
                  <div className="text-xl font-extrabold text-gray-900 font-mono mt-1">
                    {d1Status?.tables?.users ?? users.length}
                  </div>
                  <div className="text-[10px] text-gray-500">Accounts & RBAC roles</div>
                </div>

                <div className="p-3 bg-gray-50 border border-gray-200 rounded">
                  <div className="flex items-center gap-1.5 text-[11px] text-gray-500 font-semibold">
                    <Table2 className="w-3.5 h-3.5 text-blue-600" />
                    <span>Requests & Tasks</span>
                  </div>
                  <div className="text-xl font-extrabold text-gray-900 font-mono mt-1">
                    {(d1Status?.tables?.requests ?? requests.length) + (d1Status?.tables?.tasks ?? tasks.length)}
                  </div>
                  <div className="text-[10px] text-gray-500">
                    {requests.length} requests · {tasks.length} tasks
                  </div>
                </div>

                <div className="p-3 bg-gray-50 border border-gray-200 rounded">
                  <div className="flex items-center gap-1.5 text-[11px] text-gray-500 font-semibold">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Workflows & Audit</span>
                  </div>
                  <div className="text-xl font-extrabold text-gray-900 font-mono mt-1">
                    {(d1Status?.tables?.workflows ?? workflows.length) + (d1Status?.tables?.activities ?? activities.length)}
                  </div>
                  <div className="text-[10px] text-gray-500">
                    {workflows.length} workflows · {activities.length} logs
                  </div>
                </div>

                <div className="p-3 bg-gray-50 border border-gray-200 rounded">
                  <div className="flex items-center gap-1.5 text-[11px] text-gray-500 font-semibold">
                    <BarChart3 className="w-3.5 h-3.5 text-amber-600" />
                    <span>Analytics Events</span>
                  </div>
                  <div className="text-xl font-extrabold text-gray-900 font-mono mt-1">
                    {d1Analytics?.summary?.totalEvents ?? d1Status?.tables?.analytics_events ?? 1}
                  </div>
                  <div className="text-[10px] text-gray-500">Daily KPIs & telemetry</div>
                </div>
              </div>

              {/* D1 Tables Summary Grid */}
              <div className="border border-gray-200 rounded overflow-hidden">
                <div className="px-4 py-2 bg-gray-50 border-b border-gray-200 font-bold text-gray-800 flex items-center justify-between">
                  <span>Designed Cloudflare D1 SQLite Tables & SQL Views</span>
                  <span className="text-[10px] font-mono text-gray-500">11 Tables · 3 Views</span>
                </div>
                <div className="divide-y divide-gray-100 max-h-60 overflow-y-auto">
                  {SCHEMA_TABLES.map((t) => (
                    <div key={t.name} className="px-4 py-2 flex items-center justify-between gap-3 text-xs">
                      <div className="min-w-0">
                        <span className="font-mono font-bold text-blue-700">{t.name}</span>
                        <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 font-semibold">
                          {t.group}
                        </span>
                        <p className="text-[11px] text-gray-500 truncate mt-0.5">{t.desc}</p>
                      </div>
                      {d1Status?.tables && d1Status.tables[t.name] >= 0 && (
                        <span className="font-mono font-bold text-gray-700 bg-gray-100 px-2 py-0.5 rounded shrink-0">
                          {d1Status.tables[t.name]} rows
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SQLITE SCHEMA SQL */}
          {activeTab === 'schema' && (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="font-bold text-gray-900">
                    Cloudflare D1 SQLite Schema (<code className="font-mono text-blue-700">migrations/0001_init_d1_schema.sql</code>)
                  </div>
                  <div className="text-[11px] text-gray-500">
                    Copy & paste into Cloudflare Dashboard → D1 SQLite Database → Console, or apply with Wrangler CLI.
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleDownloadSql}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded font-semibold text-xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download .sql</span>
                  </button>
                  <button
                    onClick={() => copyToClipboard(D1_SCHEMA_SQL, 'schema')}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded font-semibold text-gray-700 text-xs"
                  >
                    {copiedKey === 'schema' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy SQL</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <pre className="p-4 bg-slate-900 text-slate-100 rounded font-mono text-[11px] overflow-x-auto max-h-96 leading-relaxed">
                {D1_SCHEMA_SQL}
              </pre>
            </div>
          )}

          {/* TAB 3: WRANGLER & CLOUDFLARE SETUP */}
          {activeTab === 'wrangler' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-gray-50 border border-gray-200 rounded">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">D1 Database Name</label>
                  <input
                    type="text"
                    value={dbName}
                    onChange={(e) => setDbName(e.target.value)}
                    placeholder="uratex-appforge-db"
                    className="w-full px-3 py-1.5 bg-white border border-gray-300 rounded font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Cloudflare D1 Database ID (from D1 Dashboard)
                  </label>
                  <input
                    type="text"
                    value={dbId}
                    onChange={(e) => setDbId(e.target.value)}
                    placeholder="b0637d9d-e1ac-4b93-xxxx-xxxxxxxxxxxx"
                    className="w-full px-3 py-1.5 bg-white border border-gray-300 rounded font-mono text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="font-bold text-gray-900">
                  Generated <code className="font-mono text-amber-700">wrangler.toml</code>
                </span>
                <button
                  onClick={() => copyToClipboard(wranglerTomlCode, 'wrangler')}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded font-semibold text-gray-700 text-xs"
                >
                  {copiedKey === 'wrangler' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Config</span>
                    </>
                  )}
                </button>
              </div>

              <pre className="p-4 bg-slate-900 text-slate-100 rounded font-mono text-[11px] overflow-x-auto leading-relaxed">
                {wranglerTomlCode}
              </pre>

              <div className="p-4 bg-slate-900 text-slate-100 rounded font-mono text-[11px] space-y-1.5">
                <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                  <Terminal className="w-3.5 h-3.5" />
                  <span>Cloudflare D1 Setup & Deployment Commands</span>
                </div>
                <div className="text-emerald-400"># 1. Create the D1 SQLite database in Cloudflare</div>
                <div>npx wrangler d1 create {dbName || 'uratex-appforge-db'}</div>
                <div className="text-emerald-400 pt-1"># 2. Run schema & Uratex seed migrations on Cloudflare D1</div>
                <div>npx wrangler d1 migrations apply {dbName || 'uratex-appforge-db'} --remote</div>
                <div className="text-emerald-400 pt-1"># 3. Build & deploy frontend + Pages Functions</div>
                <div>npm run build && npx wrangler pages deploy dist --project-name=uratex-mis-appforge</div>
              </div>
            </div>
          )}

          {/* TAB 4: BACKUP / RESTORE */}
          {activeTab === 'backup' && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 border border-gray-200 rounded flex items-center justify-between">
                <div>
                  <div className="font-bold text-gray-900">Export All Requests & Workspace Data</div>
                  <div className="text-[11px] text-gray-500">
                    Currently tracking {requests.length} requests and {tasks.length} tasks
                  </div>
                </div>
                <button
                  onClick={handleDownloadBackup}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-bold text-xs shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download JSON</span>
                </button>
              </div>

              <form onSubmit={handleImportSubmit} className="space-y-2">
                <label className="font-bold text-gray-800 block">
                  Restore / Import JSON Database
                </label>
                <textarea
                  rows={4}
                  placeholder="Paste exported JSON array here to restore database..."
                  value={importJsonText}
                  onChange={(e) => setImportJsonText(e.target.value)}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded font-mono text-[11px] text-gray-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-amber-500 resize-none"
                />
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-emerald-700 font-semibold font-mono">
                    {importStatus}
                  </span>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-gray-800 hover:bg-gray-900 text-white rounded font-bold text-xs"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Import Data</span>
                  </button>
                </div>
              </form>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
