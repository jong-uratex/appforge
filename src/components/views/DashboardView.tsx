import React from 'react';
import { useAppForge } from '../../context/AppForgeContext';
import { SDLC_STAGES_CONFIG } from '../../data/seedData';
import {
  TrendingUp,
  CheckCircle2,
  Clock,
  ShieldCheck,
  AlertTriangle,
  Zap,
  BarChart,
  Users,
  Activity,
  Layers,
  ListTodo,
  ArrowRight,
  GitFork,
  Sparkles,
} from 'lucide-react';

export const DashboardView: React.FC = () => {
  const {
    requests,
    tasks,
    users,
    setSelectedRequest,
    setActiveView,
    setIsNewRequestModalOpen,
    setIsNewTaskModalOpen,
    workflows,
    activities,
    setIsActivitySidebarOpen,
  } = useAppForge();

  // Metrics computation
  const total = requests.length;
  const inDev = requests.filter((r) => r.currentSDLCStage === 5).length;
  const inTesting = requests.filter((r) => r.currentSDLCStage === 6).length;
  const inProduction = requests.filter((r) => r.currentSDLCStage >= 8).length;

  const totalEffort = requests.reduce(
    (acc, r) => acc + (r.sdlc.planning.effortEstimateDays || 0),
    0
  );
  const totalHoursSaved = requests.reduce(
    (acc, r) => acc + (r.sdlc.evaluation.hoursSavedPerWeek || 0),
    0
  );

  // Task metrics
  const totalTasks = tasks.length;
  const doneTasks = tasks.filter((t) => t.status === 'Done').length;
  const inProgressTasks = tasks.filter((t) => t.status === 'In Progress').length;
  const taskCompletionRate = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  // Department counts
  const departmentCounts: Record<string, number> = {};
  requests.forEach((r) => {
    departmentCounts[r.department] = (departmentCounts[r.department] || 0) + 1;
  });

  // Gate compliance
  const requestsInDevOrBeyond = requests.filter(
    (r) => r.currentSDLCStage >= 5 && r.type !== 'Quick Win'
  );
  const gateCompliant = requestsInDevOrBeyond.filter(
    (r) =>
      r.sdlc.requirements.requesterSignedOff &&
      r.sdlc.requirements.analystSignedOff &&
      r.sdlc.design.designApproved
  ).length;
  const gateScore =
    requestsInDevOrBeyond.length > 0
      ? Math.round((gateCompliant / requestsInDevOrBeyond.length) * 100)
      : 100;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-200 text-xs font-semibold mb-3 border border-blue-400/30">
            <Activity className="w-3.5 h-3.5" />
            MIS Executive Portfolio Health
          </div>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white mb-2">
            Uratex Project Intelligence & Delivery Cockpit
          </h2>
          <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
            Real-time project overview across all active business units. Track customized workflows,
            SDLC stage gates, cross-initiative task execution, and verified labor ROI.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-4">
            <button
              onClick={() => setIsNewRequestModalOpen(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5"
            >
              <span>+ New Initiative</span>
            </button>
            <button
              onClick={() => setActiveView('tasks')}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg font-bold text-xs border border-white/20 transition-colors flex items-center gap-1.5"
            >
              <ListTodo className="w-4 h-4 text-rose-400" />
              <span>Open Task Center</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Active Projects
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums mt-1">
            {total}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">{workflows.length} workflows in use</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-semibold text-blue-600 uppercase tracking-wider">
            In Development
          </div>
          <div className="text-2xl font-bold text-blue-700 font-mono tabular-nums mt-1">
            {inDev}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Active coding sprints</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-semibold text-rose-600 uppercase tracking-wider">
            Task Velocity
          </div>
          <div className="text-2xl font-bold text-rose-700 font-mono tabular-nums mt-1">
            {taskCompletionRate}%
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">{doneTasks}/{totalTasks} tasks done</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-semibold text-teal-600 uppercase tracking-wider">
            QA & UAT
          </div>
          <div className="text-2xl font-bold text-teal-700 font-mono tabular-nums mt-1">
            {inTesting}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Regression suites active</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-semibold text-purple-600 uppercase tracking-wider">
            Gate Compliance
          </div>
          <div className="text-2xl font-bold text-purple-700 font-mono tabular-nums mt-1">
            {gateScore}%
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Sign-offs satisfied</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider">
            Labor Hours Saved
          </div>
          <div className="text-2xl font-bold text-emerald-700 font-mono tabular-nums mt-1">
            +{totalHoursSaved}h/wk
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Post-launch verified ROI</div>
        </div>
      </div>

      {/* Active Projects Status Overview Grid */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-blue-600" />
              Active Projects Portfolio Overview
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Live status, workflow association, effort and task completion breakdown
            </p>
          </div>
          <span className="text-[11px] font-mono text-slate-500 tabular-nums">
            {requests.length} Initiatives tracked
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-2.5 px-3">Project / Initiative</th>
                <th className="py-2.5 px-3">Current Status</th>
                <th className="py-2.5 px-3">Workflow</th>
                <th className="py-2.5 px-3">Department</th>
                <th className="py-2.5 px-3">Tasks Progress</th>
                <th className="py-2.5 px-3">Lead</th>
                <th className="py-2.5 px-3 text-right">Target Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {requests.map((r) => {
                const pTasks = tasks.filter((t) => t.projectId === r.id);
                const pTasksDone = pTasks.filter((t) => t.status === 'Done').length;
                const pTotal = pTasks.length;
                const pPct = pTotal > 0 ? Math.round((pTasksDone / pTotal) * 100) : 0;
                const wf = workflows.find((w) => w.id === r.workflowId) || workflows[0];

                return (
                  <tr
                    key={r.id}
                    onClick={() => setSelectedRequest(r)}
                    className="hover:bg-blue-50/40 cursor-pointer transition-colors group"
                  >
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded shrink-0">
                          {r.code}
                        </span>
                        <span className="font-bold text-slate-900 group-hover:text-blue-700 line-clamp-1">
                          {r.title}
                        </span>
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-900 border border-blue-200">
                        {r.status}
                      </span>
                    </td>

                    <td className="py-3 px-3">
                      <span className="text-[11px] text-slate-600 font-medium truncate block max-w-[140px]">
                        {wf.name}
                      </span>
                    </td>

                    <td className="py-3 px-3">
                      <span className="text-[11px] text-slate-600 truncate block max-w-[140px]">
                        {r.department}
                      </span>
                    </td>

                    <td className="py-3 px-3 min-w-[130px]">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[10px] text-slate-500">
                          <span>{pTasksDone}/{pTotal} tasks</span>
                          <span className="font-mono font-bold tabular-nums">{pPct}%</span>
                        </div>
                        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-blue-600 h-1.5 rounded-full"
                            style={{ width: `${pPct}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1.5">
                        <img
                          src={r.assignedLeadAvatar}
                          alt={r.assignedLead}
                          className="w-5 h-5 rounded-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <span className="font-medium text-slate-800 text-[11px] truncate max-w-[90px]">
                          {r.assignedLead.split(' ')[0]}
                        </span>
                      </div>
                    </td>

                    <td className="py-3 px-3 text-right font-mono text-[11px] text-slate-600 tabular-nums">
                      {r.targetGoLiveDate}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Analytics: Team Workload & Department Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Team Member Workload Allocation */}
        <div className="lg:col-span-6 bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Users className="w-4 h-4 text-indigo-600" />
              Team Workload & Active Tasks
            </h3>
            <span className="text-[11px] font-mono text-slate-500 tabular-nums">
              {users.length} Team Members
            </span>
          </div>

          <div className="space-y-3 pt-1">
            {users.map((u) => {
              const userTasks = tasks.filter((t) => t.assignedToId === u.id);
              const userDone = userTasks.filter((t) => t.status === 'Done').length;
              const userEstHours = userTasks.reduce((acc, t) => acc + (t.estimatedHours || 0), 0);
              const pct = userTasks.length > 0 ? Math.round((userDone / userTasks.length) * 100) : 0;

              return (
                <div key={u.id} className="p-3 rounded-lg bg-slate-50 border border-slate-200/80 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <img
                        src={u.avatar}
                        alt={u.name}
                        className="w-6 h-6 rounded-full object-cover ring-1 ring-slate-200"
                        referrerPolicy="no-referrer"
                      />
                      <div>
                        <div className="font-bold text-slate-900">{u.name}</div>
                        <div className="text-[10px] text-slate-400">{u.role} · {u.department.split(' ')[0]}</div>
                      </div>
                    </div>
                    <div className="text-right font-mono text-slate-600 text-[11px]">
                      <div>{userTasks.length} tasks ({userEstHours}h)</div>
                      <div className="text-[10px] text-emerald-600 font-bold">{userDone} completed</div>
                    </div>
                  </div>

                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-indigo-600 h-1.5 rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Department Initiatives Breakdown */}
        <div className="lg:col-span-6 bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <BarChart className="w-4 h-4 text-blue-600" />
              Initiatives by Uratex Department
            </h3>
            <span className="text-[11px] font-mono text-slate-500 tabular-nums">
              {Object.keys(departmentCounts).length} Units Active
            </span>
          </div>

          <div className="space-y-3 pt-1">
            {Object.entries(departmentCounts).map(([dept, count]) => {
              const pct = Math.round((count / total) * 100);
              return (
                <div key={dept} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-800 truncate max-w-[260px]">{dept}</span>
                    <span className="font-mono text-slate-600 tabular-nums font-semibold">
                      {count} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Live Project Audit Trail & Activity Feed */}
        <div className="lg:col-span-12 bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-emerald-600" />
                Live Project Audit Trail & Activity Feed
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Chronological log of stage transitions, ISO gate approvals, and task progress
              </p>
            </div>
            <button
              onClick={() => setIsActivitySidebarOpen(true)}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1.5 self-start sm:self-auto"
            >
              <span>View All ({activities.length}) in Audit Sidebar</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
            {activities.slice(0, 6).map((act) => {
              const req = requests.find((r) => r.id === act.targetId || r.code === act.targetCode);

              return (
                <div
                  key={act.id}
                  onClick={() => {
                    if (req) setSelectedRequest(req);
                    else setIsActivitySidebarOpen(true);
                  }}
                  className="p-3 rounded-lg bg-slate-50 border border-slate-200 hover:border-blue-300 hover:bg-blue-50/20 cursor-pointer transition-all space-y-2 group"
                >
                  <div className="flex items-center justify-between gap-1 text-[11px]">
                    <span className="font-mono font-bold text-blue-600 group-hover:underline">
                      {act.targetCode}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {act.timestamp}
                    </span>
                  </div>

                  <p className="text-xs font-semibold text-slate-800 line-clamp-1">
                    {act.actionSummary}
                  </p>

                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                    <img
                      src={act.actorAvatar}
                      alt={act.actorName}
                      className="w-4 h-4 rounded-full object-cover ring-1 ring-slate-200"
                    />
                    <span className="truncate">{act.actorName} ({act.actorRole})</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
};
