import React from 'react';
import { useAppForge } from '../../context/AppForgeContext';
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
  FileText,
  Plus,
  Table2,
  ArrowUpRight,
  Code2,
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
    setIsWorkflowModalOpen,
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
    <div className="p-4 sm:p-6 space-y-5 max-w-[1600px] mx-auto">
      
      {/* AdminLTE Signature Small-Boxes / Info-Boxes (4-Column Grid) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Small Box 1: Total Requests (bg-info / Blue) */}
        <div className="rounded bg-blue-600 text-white shadow-xs overflow-hidden relative flex flex-col justify-between">
          <div className="p-4 relative z-10">
            <h3 className="text-3xl font-extrabold font-mono tracking-tight tabular-nums">
              {total}
            </h3>
            <p className="text-xs font-semibold uppercase tracking-wider text-blue-100 mt-1">
              Change Requests (SCR)
            </p>
            <div className="text-[11px] text-blue-200 mt-0.5 font-medium">
              {totalEffort} man-days estimated
            </div>
          </div>
          <FileText className="w-18 h-18 text-black/10 absolute top-2 right-2 pointer-events-none" />
          <button
            onClick={() => setActiveView('board')}
            className="w-full py-1.5 px-3 bg-black/15 hover:bg-black/25 text-white/90 hover:text-white text-xs font-medium flex items-center justify-center gap-1 transition-colors select-none"
          >
            <span>View All Requests</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Small Box 2: In Development (bg-success / Green) */}
        <div className="rounded bg-emerald-600 text-white shadow-xs overflow-hidden relative flex flex-col justify-between">
          <div className="p-4 relative z-10">
            <h3 className="text-3xl font-extrabold font-mono tracking-tight tabular-nums">
              {inDev}
            </h3>
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-100 mt-1">
              Active Sprints (In Dev)
            </p>
            <div className="text-[11px] text-emerald-200 mt-0.5 font-medium">
              {inTesting} in QA & UAT testing
            </div>
          </div>
          <Code2 className="w-18 h-18 text-black/10 absolute top-2 right-2 pointer-events-none" />
          <button
            onClick={() => setActiveView('kanban')}
            className="w-full py-1.5 px-3 bg-black/15 hover:bg-black/25 text-white/90 hover:text-white text-xs font-medium flex items-center justify-center gap-1 transition-colors select-none"
          >
            <span>Open Kanban Pipeline</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Small Box 3: Custom Workflows (bg-warning / Amber) */}
        <div className="rounded bg-amber-500 text-white shadow-xs overflow-hidden relative flex flex-col justify-between">
          <div className="p-4 relative z-10">
            <h3 className="text-3xl font-extrabold font-mono tracking-tight tabular-nums">
              {workflows.length}
            </h3>
            <p className="text-xs font-semibold uppercase tracking-wider text-amber-100 mt-1">
              Custom Workflows
            </p>
            <div className="text-[11px] text-amber-100 mt-0.5 font-medium">
              Flexible stage & status pipelines
            </div>
          </div>
          <GitFork className="w-18 h-18 text-black/10 absolute top-2 right-2 pointer-events-none" />
          <button
            onClick={() => setIsWorkflowModalOpen(true)}
            className="w-full py-1.5 px-3 bg-black/15 hover:bg-black/25 text-white/90 hover:text-white text-xs font-medium flex items-center justify-center gap-1 transition-colors select-none"
          >
            <span>Manage Workflows</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Small Box 4: Task Velocity (bg-danger / Red) */}
        <div className="rounded bg-rose-600 text-white shadow-xs overflow-hidden relative flex flex-col justify-between">
          <div className="p-4 relative z-10">
            <h3 className="text-3xl font-extrabold font-mono tracking-tight tabular-nums">
              {taskCompletionRate}%
            </h3>
            <p className="text-xs font-semibold uppercase tracking-wider text-rose-100 mt-1">
              Task Velocity Rate
            </p>
            <div className="text-[11px] text-rose-200 mt-0.5 font-medium">
              {doneTasks} of {totalTasks} tasks completed
            </div>
          </div>
          <ListTodo className="w-18 h-18 text-black/10 absolute top-2 right-2 pointer-events-none" />
          <button
            onClick={() => setActiveView('tasks')}
            className="w-full py-1.5 px-3 bg-black/15 hover:bg-black/25 text-white/90 hover:text-white text-xs font-medium flex items-center justify-center gap-1 transition-colors select-none"
          >
            <span>Open Task Center</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>

      {/* AdminLTE Card: Active System Change Requests (SCR) */}
      <div className="bg-white rounded border border-gray-200 shadow-xs overflow-hidden border-t-3 border-t-blue-600">
        
        {/* Card Header (AdminLTE card-header) */}
        <div className="px-4 py-3 bg-white border-b border-gray-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 font-bold text-gray-800 text-sm">
            <Table2 className="w-4 h-4 text-blue-600" />
            <span>Active System Change Requests (SCR)</span>
            <span className="px-2 py-0.5 text-xs font-normal text-gray-500 bg-gray-100 rounded">
              {requests.length} Initiatives
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsNewRequestModalOpen(true)}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded text-xs flex items-center gap-1 shadow-2xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Request</span>
            </button>

            <button
              onClick={() => setActiveView('board')}
              className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded text-xs flex items-center gap-1 transition-colors"
            >
              <span>View Full Board</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Card Body: Table (AdminLTE table table-striped table-hover) */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-[11px] font-bold text-gray-600 uppercase tracking-wider">
                <th className="py-2.5 px-3">Document Code</th>
                <th className="py-2.5 px-3 min-w-[240px]">Initiative Title</th>
                <th className="py-2.5 px-3">Stage / Status</th>
                <th className="py-2.5 px-3">Workflow</th>
                <th className="py-2.5 px-3">Department</th>
                <th className="py-2.5 px-3 min-w-[140px]">Progress</th>
                <th className="py-2.5 px-3">Lead</th>
                <th className="py-2.5 px-3 text-right">Target Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {requests.map((r, idx) => {
                const pTasks = tasks.filter((t) => t.projectId === r.id);
                const pTasksDone = pTasks.filter((t) => t.status === 'Done').length;
                const pTotal = pTasks.length;
                const pPct = pTotal > 0 ? Math.round((pTasksDone / pTotal) * 100) : 0;
                const wf = workflows.find((w) => w.id === r.workflowId) || workflows[0];

                return (
                  <tr
                    key={r.id}
                    onClick={() => setSelectedRequest(r)}
                    className={`cursor-pointer transition-colors hover:bg-blue-50/50 ${
                      idx % 2 === 1 ? 'bg-gray-50/40' : 'bg-white'
                    }`}
                  >
                    {/* Code */}
                    <td className="py-2.5 px-3">
                      <span className="font-mono font-bold text-blue-700 bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded text-[11px]">
                        {r.code}
                      </span>
                    </td>

                    {/* Title */}
                    <td className="py-2.5 px-3">
                      <div className="font-bold text-gray-900 hover:text-blue-600 transition-colors line-clamp-1">
                        {r.title}
                      </div>
                      <div className="text-[10px] text-gray-500 line-clamp-1">
                        {r.scr?.module || r.type}
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="py-2.5 px-3">
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                        {r.status}
                      </span>
                    </td>

                    {/* Workflow */}
                    <td className="py-2.5 px-3">
                      <span className="text-gray-700 font-medium truncate block max-w-[130px]">
                        {wf.name}
                      </span>
                    </td>

                    {/* Department */}
                    <td className="py-2.5 px-3">
                      <span className="text-gray-600 truncate block max-w-[130px]" title={r.department}>
                        {r.department}
                      </span>
                    </td>

                    {/* Progress Bar */}
                    <td className="py-2.5 px-3">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[10px] text-gray-500 font-mono">
                          <span>{pTasksDone}/{pTotal} tasks</span>
                          <span className="font-bold">{pPct}%</span>
                        </div>
                        <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-blue-600 h-1.5 rounded-full transition-all"
                            style={{ width: `${pPct}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Lead */}
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-1.5">
                        <img
                          src={r.assignedLeadAvatar}
                          alt={r.assignedLead}
                          className="w-5 h-5 rounded-full object-cover ring-1 ring-gray-200"
                          referrerPolicy="no-referrer"
                        />
                        <span className="font-medium text-gray-800 text-[11px] truncate max-w-[90px]">
                          {r.assignedLead.split(' ')[0]}
                        </span>
                      </div>
                    </td>

                    {/* Target Date */}
                    <td className="py-2.5 px-3 text-right font-mono text-[11px] text-gray-600 tabular-nums">
                      {r.targetGoLiveDate}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Card Footer */}
        <div className="px-4 py-2 bg-gray-50 border-t border-gray-200 text-xs text-gray-500 flex items-center justify-between">
          <span>Showing all active change initiatives</span>
          <span className="font-mono text-[11px]">Audit trail synchronized</span>
        </div>
      </div>

      {/* Row: Analytics Cards (Department Breakdown & Team Workload) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Card 1: Department Breakdown */}
        <div className="lg:col-span-6 bg-white rounded border border-gray-200 shadow-xs border-t-3 border-t-emerald-600 overflow-hidden flex flex-col justify-between">
          <div className="px-4 py-3 bg-white border-b border-gray-200 flex items-center justify-between text-xs font-bold text-gray-800">
            <div className="flex items-center gap-2">
              <BarChart className="w-4 h-4 text-emerald-600" />
              <span>Initiatives by Uratex Department</span>
            </div>
            <span className="text-gray-400 font-mono font-normal">
              {Object.keys(departmentCounts).length} Units
            </span>
          </div>

          <div className="p-4 space-y-3.5">
            {Object.entries(departmentCounts).map(([dept, count]) => {
              const pct = Math.round((count / total) * 100);
              return (
                <div key={dept} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-gray-700 truncate max-w-[280px]">
                      {dept}
                    </span>
                    <span className="font-mono text-gray-600 font-bold tabular-nums">
                      {count} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-600 h-2 rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="px-4 py-2 bg-gray-50 border-t border-gray-200 text-[11px] text-gray-500">
            Resource allocation across manufacturing and sales operations
          </div>
        </div>

        {/* Card 2: Team Workload */}
        <div className="lg:col-span-6 bg-white rounded border border-gray-200 shadow-xs border-t-3 border-t-purple-600 overflow-hidden flex flex-col justify-between">
          <div className="px-4 py-3 bg-white border-b border-gray-200 flex items-center justify-between text-xs font-bold text-gray-800">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-600" />
              <span>Team Workload & Active Tasks</span>
            </div>
            <span className="text-gray-400 font-mono font-normal">
              {users.length} Personnel
            </span>
          </div>

          <div className="p-4 space-y-2.5">
            {users.slice(0, 5).map((u) => {
              const userTasks = tasks.filter((t) => t.assignedToId === u.id);
              const userDone = userTasks.filter((t) => t.status === 'Done').length;
              const userEstHours = userTasks.reduce((acc, t) => acc + (t.estimatedHours || 0), 0);
              const pct = userTasks.length > 0 ? Math.round((userDone / userTasks.length) * 100) : 0;

              return (
                <div key={u.id} className="p-2.5 rounded bg-gray-50 border border-gray-200 text-xs flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={u.avatar}
                      alt={u.name}
                      className="w-7 h-7 rounded-full object-cover ring-1 ring-gray-300 shrink-0"
                      referrerPolicy="no-referrer"
                    />
                    <div className="truncate">
                      <div className="font-bold text-gray-900 truncate">{u.name}</div>
                      <div className="text-[10px] text-gray-500 truncate">{u.title}</div>
                    </div>
                  </div>

                  <div className="text-right shrink-0 font-mono text-[11px]">
                    <span className="font-bold text-gray-800">{userTasks.length} tasks</span>
                    <div className="text-[10px] text-emerald-600 font-bold">{userDone} done</div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="px-4 py-2 bg-gray-50 border-t border-gray-200 text-[11px] text-gray-500 flex items-center justify-between">
            <span>Verified labor savings: +{totalHoursSaved}h/week</span>
            <button
              onClick={() => setActiveView('tasks')}
              className="text-blue-600 hover:underline font-semibold"
            >
              Task Board →
            </button>
          </div>
        </div>

      </div>

      {/* AdminLTE Card: Recent Audit Log */}
      <div className="bg-white rounded border border-gray-200 shadow-xs border-t-3 border-t-gray-600 overflow-hidden">
        <div className="px-4 py-3 bg-white border-b border-gray-200 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 font-bold text-gray-800 text-sm">
            <Activity className="w-4 h-4 text-gray-600" />
            <span>Recent System Activity & Audit Trail</span>
          </div>

          <button
            onClick={() => setIsActivitySidebarOpen(true)}
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
          >
            <span>Open Complete Feed ({activities.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {activities.slice(0, 6).map((act) => (
            <div
              key={act.id}
              onClick={() => setIsActivitySidebarOpen(true)}
              className="p-3 rounded bg-gray-50 border border-gray-200 hover:border-blue-300 hover:bg-blue-50/20 cursor-pointer transition-colors space-y-1.5"
            >
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-mono font-bold text-blue-700">{act.targetCode}</span>
                <span className="text-[10px] text-gray-400 font-mono">{act.timestamp}</span>
              </div>
              <p className="text-xs font-semibold text-gray-800 line-clamp-1">
                {act.actionSummary}
              </p>
              <div className="text-[10px] text-gray-500 truncate">
                by {act.actorName} ({act.actorRole})
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
