-- ============================================================================
-- MIS AppForge - Uratex Philippines
-- Cloudflare D1 (SQLite) Seed Data
-- Migration: 0002_seed_uratex_data.sql
-- Default password for seeded accounts: uratex2026 (SHA-256 hashed)
-- ============================================================================

-- 1. Seed Users
INSERT OR IGNORE INTO users (
  id, name, email, password_hash, role, department, title, avatar,
  is_manager, is_it_lead, is_developer, is_qa, is_active, created_at
) VALUES
  (
    'usr-jenor', 'Jenor Ricafort', 'jenor.ricafort@uratex.com.ph',
    'bd858cf6c18386a7e89c533ee0f089ec0c9da5796fff2028012f614a412da371',
    'Admin', 'Management Information Systems (MIS)', 'MIS Systems Lead & IT Architect',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&h=120&q=80',
    1, 1, 0, 0, 1, '2025-01-10'
  ),
  (
    'usr-jona', 'Jona Dizon', 'jona.dizon@uratex.com.ph',
    'bd858cf6c18386a7e89c533ee0f089ec0c9da5796fff2028012f614a412da371',
    'Team Member', 'Sales & Logistics', 'Sales Operations Specialist',
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=120&h=120&q=80',
    0, 0, 0, 0, 1, '2025-02-01'
  ),
  (
    'usr-zyrin', 'Zyrin Yumul', 'zyrin.yumul@uratex.com.ph',
    'bd858cf6c18386a7e89c533ee0f089ec0c9da5796fff2028012f614a412da371',
    'Project Manager', 'Management Information Systems (MIS)', 'Product Owner',
    'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=120&h=120&q=80',
    1, 0, 0, 0, 1, '2025-01-15'
  ),
  (
    'usr-anton', 'Anton Medina', 'anton.medina@uratex.com.ph',
    'bd858cf6c18386a7e89c533ee0f089ec0c9da5796fff2028012f614a412da371',
    'Project Manager', 'Management Information Systems (MIS)', 'DT Manager (Digital Transformation)',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&h=120&q=80',
    1, 1, 0, 0, 1, '2025-01-15'
  ),
  (
    'usr-eric', 'Eric Borromeo', 'eric.borromeo@uratex.com.ph',
    'bd858cf6c18386a7e89c533ee0f089ec0c9da5796fff2028012f614a412da371',
    'Admin', 'Management Information Systems (MIS)', 'IT Manager',
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=120&h=120&q=80',
    1, 1, 0, 0, 1, '2025-01-05'
  ),
  (
    'usr-jhun', 'Jhun Espinosa', 'jhun.espinosa@uratex.com.ph',
    'bd858cf6c18386a7e89c533ee0f089ec0c9da5796fff2028012f614a412da371',
    'Project Manager', 'Management Information Systems (MIS)', 'App Dev Manager',
    'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=120&h=120&q=80',
    1, 1, 0, 0, 1, '2025-01-10'
  ),
  (
    'usr-garon', 'John Christian Garon', 'john.garon@uratex.com.ph',
    'bd858cf6c18386a7e89c533ee0f089ec0c9da5796fff2028012f614a412da371',
    'Team Member', 'Management Information Systems (MIS)', 'Application Developer',
    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=120&h=120&q=80',
    0, 0, 1, 0, 1, '2025-03-01'
  ),
  (
    'usr-nathaniel', 'Nathaniel Trinidad', 'nathaniel.trinidad@uratex.com.ph',
    'bd858cf6c18386a7e89c533ee0f089ec0c9da5796fff2028012f614a412da371',
    'Team Member', 'Quality Assurance & R&D', 'App Dev - QA',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&h=120&q=80',
    0, 0, 0, 1, 1, '2025-03-15'
  ),
  (
    'usr-carlos', 'Carlos Reyes', 'carlos.reyes@uratex.com.ph',
    'bd858cf6c18386a7e89c533ee0f089ec0c9da5796fff2028012f614a412da371',
    'Project Manager', 'Foam Plant & Production', 'Plant Foam Production Superintendent',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&h=120&q=80',
    1, 0, 0, 0, 1, '2025-03-01'
  );

-- 2. Seed Workflows
INSERT OR IGNORE INTO workflows (id, name, description, is_default, applicable_types_json, created_at, updated_at) VALUES
  (
    'wf-sdlc-11',
    'Official 11-Stage Uratex SDLC',
    'Comprehensive enterprise Software Development Life Cycle conforming to Uratex Group ISO governance standard.',
    1,
    '["New Application","Enhancement"]',
    '2026-01-15',
    '2026-10-01'
  ),
  (
    'wf-agile-4',
    'Core 4-Stage Agile Delivery',
    'Streamlined four-phase pipeline: Planning, Development, Testing, and Deployment. Ideal for fast sprint cycles and modular features.',
    0,
    '["Enhancement","New Application"]',
    '2026-03-10',
    '2026-10-15'
  ),
  (
    'wf-quick-3',
    'Quick Win Fast-Track Hotfix',
    'Ultra-lightweight 3-phase flow for urgent bug fixes and small enhancements under 3 days effort.',
    0,
    '["Quick Win"]',
    '2026-05-12',
    '2026-09-20'
  );

-- 3. Seed Workflow Stages
INSERT OR IGNORE INTO workflow_stages (id, workflow_id, name, description, badge_color, accent_bg, stage_order, is_gate, requires_signoff) VALUES
  ('stg-1', 'wf-sdlc-11', 'Conception / Ideation', 'Employee problem capture and benefit calculation', 'bg-sky-500 text-white', 'bg-sky-50 text-sky-800 border-sky-200', 1, 0, 0),
  ('stg-2', 'wf-sdlc-11', 'Planning & Review', 'Department manager and IT Lead triage & prioritization', 'bg-amber-500 text-white', 'bg-amber-50 text-amber-800 border-amber-200', 2, 1, 1),
  ('stg-3', 'wf-sdlc-11', 'Requirements Spec', 'Detailed functional specifications and user stories sign-off', 'bg-indigo-500 text-white', 'bg-indigo-50 text-indigo-800 border-indigo-200', 3, 1, 1),
  ('stg-4', 'wf-sdlc-11', 'Technical Design', 'Architecture, DB schemas, Figma mockups, and security review', 'bg-purple-500 text-white', 'bg-purple-50 text-purple-800 border-purple-200', 4, 1, 1),
  ('stg-5', 'wf-sdlc-11', 'Development', 'Sprint coding, version control, and developer milestone updates', 'bg-blue-600 text-white', 'bg-blue-50 text-blue-800 border-blue-200', 5, 0, 0),
  ('stg-6', 'wf-sdlc-11', 'Testing & QA', 'Test cases verification, bug fixes, and UAT sign-off', 'bg-teal-600 text-white', 'bg-teal-50 text-teal-800 border-teal-200', 6, 1, 1),
  ('stg-7', 'wf-sdlc-11', 'Documentation', 'User manual generation, system architecture, and knowledge base updates', 'bg-emerald-600 text-white', 'bg-emerald-50 text-emerald-800 border-emerald-200', 7, 0, 0),
  ('stg-8', 'wf-sdlc-11', 'Implementation', 'Production deployment checklist and go-live broadcast', 'bg-emerald-700 text-white', 'bg-emerald-50 text-emerald-900 border-emerald-300', 8, 1, 0),
  ('stg-9', 'wf-sdlc-11', 'Training', 'Plant and operational staff training sessions and attendance logging', 'bg-cyan-600 text-white', 'bg-cyan-50 text-cyan-800 border-cyan-200', 9, 0, 0),
  ('stg-10', 'wf-sdlc-11', 'Evaluation', 'Post-go-live stakeholder survey, hours saved, and ROI rating', 'bg-rose-600 text-white', 'bg-rose-50 text-rose-800 border-rose-200', 10, 0, 0),
  ('stg-11', 'wf-sdlc-11', 'System Maintenance', 'Ongoing SLA monitoring, bug maintenance, and health monitoring', 'bg-slate-700 text-white', 'bg-slate-100 text-slate-800 border-slate-300', 11, 0, 0),
  ('stg-a1', 'wf-agile-4', 'Planning', 'Scope backlog, sprint planning, and resource assignment', 'bg-amber-500 text-white', 'bg-amber-50 text-amber-800 border-amber-200', 1, 1, 1),
  ('stg-a2', 'wf-agile-4', 'Development', 'Active engineering, pull requests, and component integration', 'bg-blue-600 text-white', 'bg-blue-50 text-blue-800 border-blue-200', 2, 0, 0),
  ('stg-a3', 'wf-agile-4', 'Testing', 'Automated QA suite, integration testing, and bug verification', 'bg-teal-600 text-white', 'bg-teal-50 text-teal-800 border-teal-200', 3, 1, 1),
  ('stg-a4', 'wf-agile-4', 'Deployment', 'Continuous delivery release to Cloudflare Edge production environment', 'bg-emerald-600 text-white', 'bg-emerald-50 text-emerald-800 border-emerald-200', 4, 1, 0),
  ('stg-q1', 'wf-quick-3', 'Triage & Scope', 'Rapid issue verification and priority assessment', 'bg-rose-500 text-white', 'bg-rose-50 text-rose-800 border-rose-200', 1, 0, 0),
  ('stg-q2', 'wf-quick-3', 'Hotfix & Testing', 'Direct coding and smoke test verification in staging', 'bg-indigo-600 text-white', 'bg-indigo-50 text-indigo-800 border-indigo-200', 2, 1, 1),
  ('stg-q3', 'wf-quick-3', 'Production Deploy', 'Immediate edge rollout and sanity confirmation', 'bg-emerald-600 text-white', 'bg-emerald-50 text-emerald-800 border-emerald-200', 3, 0, 0);

-- 4. Seed Initial Analytics Event
INSERT OR IGNORE INTO analytics_events (
  id, event_type, user_id, user_role, department, entity_type, entity_id, metric_value, metadata_json
) VALUES (
  'evt-d1-init', 'system_initialized', 'usr-jenor', 'Admin', 'Management Information Systems (MIS)',
  'database', 'uratex-appforge-db', 1, '{"engine":"Cloudflare D1 SQLite","version":"2.4.0"}'
);
