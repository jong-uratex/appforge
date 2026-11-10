import React, { useState, useMemo } from 'react';
import {
  Activity,
  X,
  Search,
  Download,
  Trash2,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
  GitCommit,
  GitBranch,
  MessageSquare,
  Star,
  FolderPlus,
  ListTodo,
  ExternalLink,
  ChevronDown,
  RefreshCw,
} from 'lucide-react';
import { useAppForge } from '../../context/AppForgeContext';
import { ActivityItem, ActivityType } from '../../types/appforge';

type ActivityFilterCategory = 'all' | 'gates' | 'tasks' | 'discussions' | 'workflows';

export const ActivityFeedSidebar: React.FC = () => {
  const {
    activities,
    isActivitySidebarOpen,
    setIsActivitySidebarOpen,
    clearActivities,
    requests,
    setSelectedRequest,
  } = useAppForge();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<ActivityFilterCategory>('all');
  const [showExportMenu, setShowExportMenu] = useState(false);

  // Filter activities
  const filteredActivities = useMemo(() => {
    return activities.filter((act) => {
      // Category filter
      if (activeCategory === 'gates') {
        if (act.type !== 'gate_signed' && act.type !== 'stage_changed') return false;
      } else if (activeCategory === 'tasks') {
        if (act.type !== 'task_created' && act.type !== 'task_status_changed') return false;
      } else if (activeCategory === 'discussions') {
        if (act.type !== 'comment_added') return false;
      } else if (activeCategory === 'workflows') {
        if (act.type !== 'workflow_changed' && act.type !== 'evaluation_submitted') return false;
      }

      // Search query filter
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        act.targetCode.toLowerCase().includes(q) ||
        act.targetTitle.toLowerCase().includes(q) ||
        act.actorName.toLowerCase().includes(q) ||
        act.actionSummary.toLowerCase().includes(q) ||
        (act.details && act.details.toLowerCase().includes(q))
      );
    });
  }, [activities, activeCategory, searchQuery]);

  // Click on target project to open detail drawer
  const handleOpenProject = (targetId: string, targetCode: string) => {
    const found =
      requests.find((r) => r.id === targetId) ||
      requests.find((r) => r.code.toLowerCase() === targetCode.toLowerCase());
    if (found) {
      setSelectedRequest(found);
      setIsActivitySidebarOpen(false);
    }
  };

  // Export audit trail to CSV
  const handleExportCSV = () => {
    const headers = [
      'Activity ID',
      'Timestamp',
      'Type',
      'Actor Name',
      'Actor Role',
      'Project Code',
      'Project Title',
      'Action Summary',
      'Details',
    ];

    const rows = activities.map((act) => [
      `"${act.id}"`,
      `"${new Date(act.createdAt).toISOString()}"`,
      `"${act.type}"`,
      `"${act.actorName.replace(/"/g, '""')}"`,
      `"${act.actorRole}"`,
      `"${act.targetCode}"`,
      `"${act.targetTitle.replace(/"/g, '""')}"`,
      `"${act.actionSummary.replace(/"/g, '""')}"`,
      `"${(act.details || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute(
      'download',
      `uratex_mis_audit_feed_${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setShowExportMenu(false);
  };

  // Export audit trail to JSON
  const handleExportJSON = () => {
    const exportObject = {
      auditSystem: 'Uratex MIS AppForge Enterprise Audit Trail',
      organization: 'Multiflex RNC Philippines, Inc. (Uratex Group)',
      exportedAt: new Date().toISOString(),
      recordCount: activities.length,
      activities,
    };
    const jsonStr = JSON.stringify(exportObject, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute(
      'download',
      `uratex_mis_audit_feed_${new Date().toISOString().split('T')[0]}.json`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setShowExportMenu(false);
  };

  if (!isActivitySidebarOpen) return null;

  const getActivityIcon = (type: ActivityType) => {
    switch (type) {
      case 'gate_signed':
      case 'gate_approved':
        return <ShieldCheck className="w-4 h-4 text-emerald-600" />;
      case 'stage_changed':
        return <GitCommit className="w-4 h-4 text-indigo-600" />;
      case 'task_created':
        return <ListTodo className="w-4 h-4 text-sky-600" />;
      case 'task_status_changed':
        return <CheckCircle2 className="w-4 h-4 text-teal-600" />;
      case 'comment_added':
        return <MessageSquare className="w-4 h-4 text-blue-600" />;
      case 'workflow_changed':
        return <GitBranch className="w-4 h-4 text-purple-600" />;
      case 'evaluation_submitted':
        return <Star className="w-4 h-4 text-amber-500 fill-amber-400" />;
      case 'project_created':
      default:
        return <FolderPlus className="w-4 h-4 text-blue-600" />;
    }
  };

  const getActivityBadge = (type: ActivityType) => {
    switch (type) {
      case 'gate_signed':
      case 'gate_approved':
        return (
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
            Stage Gate Sign-off
          </span>
        );
      case 'stage_changed':
        return (
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
            Stage Transition
          </span>
        );
      case 'task_created':
        return (
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200">
            Task Created
          </span>
        );
      case 'task_status_changed':
        return (
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-teal-50 text-teal-700 border border-teal-200">
            Task Status
          </span>
        );
      case 'comment_added':
        return (
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
            Discussion
          </span>
        );
      case 'workflow_changed':
        return (
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200">
            Workflow Logic
          </span>
        );
      case 'evaluation_submitted':
        return (
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
            PIR Review
          </span>
        );
      case 'project_created':
      default:
        return (
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
            New Project
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
      {/* Backdrop overlay */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
        onClick={() => setIsActivitySidebarOpen(false)}
      />

      {/* Slide-out Sidebar Panel */}
      <aside className="relative w-full max-w-md md:max-w-lg bg-white border-l border-slate-200 shadow-2xl flex flex-col h-full z-10 animate-in slide-in-from-right duration-200">
        {/* Top Header */}
        <div className="p-4 md:p-5 border-b border-slate-200 bg-slate-50 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">Activity Audit Feed</h2>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                  {activities.length} events
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Real-time chronological audit trail for Uratex SDLC compliance
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {/* Export Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="p-1.5 text-slate-600 hover:text-blue-700 hover:bg-slate-200 rounded-md transition-colors flex items-center gap-1 text-xs font-medium"
                title="Export audit log"
              >
                <Download className="w-4 h-4" />
                <ChevronDown className="w-3 h-3" />
              </button>

              {showExportMenu && (
                <div className="absolute right-0 mt-1 w-44 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-20">
                  <button
                    onClick={handleExportCSV}
                    className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-blue-50 hover:text-blue-700 flex items-center gap-2"
                  >
                    <Download className="w-3.5 h-3.5 text-slate-400" />
                    Export CSV (Spreadsheet)
                  </button>
                  <button
                    onClick={handleExportJSON}
                    className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-blue-50 hover:text-blue-700 flex items-center gap-2"
                  >
                    <Download className="w-3.5 h-3.5 text-slate-400" />
                    Export JSON (Full Audit)
                  </button>
                </div>
              )}
            </div>

            {/* Clear Log */}
            <button
              onClick={() => {
                if (window.confirm('Clear local activity trail? Default seed activities will remain available on reset.')) {
                  clearActivities();
                }
              }}
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
              title="Clear audit trail"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            {/* Close Button */}
            <button
              onClick={() => setIsActivitySidebarOpen(false)}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-md transition-colors ml-1"
              aria-label="Close activity feed"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search & Category Filter */}
        <div className="p-3 border-b border-slate-200 bg-white space-y-2.5">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by code, user, or action..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:bg-white transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Category Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-thin">
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                activeCategory === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Events ({activities.length})
            </button>
            <button
              onClick={() => setActiveCategory('gates')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap transition-colors flex items-center gap-1 ${
                activeCategory === 'gates'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <ShieldCheck className="w-3 h-3" />
              Stage Gates
            </button>
            <button
              onClick={() => setActiveCategory('tasks')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap transition-colors flex items-center gap-1 ${
                activeCategory === 'tasks'
                  ? 'bg-sky-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <ListTodo className="w-3 h-3" />
              Tasks
            </button>
            <button
              onClick={() => setActiveCategory('discussions')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap transition-colors flex items-center gap-1 ${
                activeCategory === 'discussions'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <MessageSquare className="w-3 h-3" />
              Discussions
            </button>
            <button
              onClick={() => setActiveCategory('workflows')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap transition-colors flex items-center gap-1 ${
                activeCategory === 'workflows'
                  ? 'bg-purple-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <GitBranch className="w-3 h-3" />
              Workflows
            </button>
          </div>
        </div>

        {/* Activity Stream Feed */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50">
          {filteredActivities.length === 0 ? (
            <div className="text-center py-12 px-4">
              <div className="w-12 h-12 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center mx-auto mb-3 text-slate-400">
                <Activity className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-semibold text-slate-700">No matching activities</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                No activity records matched your filter or search query.
              </p>
              {(searchQuery || activeCategory !== 'all') && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setActiveCategory('all');
                  }}
                  className="mt-3 text-xs text-blue-600 font-medium hover:underline inline-flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  Reset all filters
                </button>
              )}
            </div>
          ) : (
            filteredActivities.map((act) => (
              <div
                key={act.id}
                className="bg-white rounded-lg border border-slate-200 shadow-xs hover:border-blue-300 transition-all p-3.5 relative group"
              >
                {/* Header row: Actor & Time */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <img
                      src={act.actorAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&h=120&q=80'}
                      alt={act.actorName}
                      className="w-7 h-7 rounded-full object-cover ring-1 ring-slate-200"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-semibold text-slate-900 leading-tight">
                          {act.actorName}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          • {act.actorRole}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-[11px] text-slate-400">
                        <Clock className="w-3 h-3" />
                        <span>{act.timestamp}</span>
                      </div>
                    </div>
                  </div>

                  {/* Badge */}
                  <div>{getActivityBadge(act.type)}</div>
                </div>

                {/* Target Project Ref */}
                <div className="flex items-center gap-2 mb-2 p-1.5 bg-slate-50 rounded border border-slate-100">
                  <div className="p-1 rounded bg-white shadow-2xs border border-slate-200">
                    {getActivityIcon(act.type)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <button
                      onClick={() => handleOpenProject(act.targetId, act.targetCode)}
                      className="text-xs font-mono font-bold text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1 truncate text-left"
                      title="Open project details"
                    >
                      {act.targetCode}
                      <ExternalLink className="w-3 h-3 shrink-0 opacity-70 group-hover:opacity-100" />
                    </button>
                    <p className="text-[11px] text-slate-600 truncate">{act.targetTitle}</p>
                  </div>
                </div>

                {/* Action Summary */}
                <p className="text-xs font-medium text-slate-800 leading-snug">
                  {act.actionSummary}
                </p>

                {/* Details snippet */}
                {act.details && (
                  <p className="text-[11px] text-slate-500 mt-1.5 pl-2.5 border-l-2 border-slate-200 leading-relaxed italic">
                    {act.details}
                  </p>
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer info banner */}
        <div className="p-3 bg-white border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-1.5 font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>ISO 9001 / Toyota Audit Trail Active</span>
          </div>
          <span className="text-slate-400">Cloudflare Edge Storage</span>
        </div>
      </aside>
    </div>
  );
};
