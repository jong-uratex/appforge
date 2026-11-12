import React, { useState } from 'react';
import { useAppForge } from '../../context/AppForgeContext';
import { AppRequest, SDLCStageNumber, SystemStatus } from '../../types/appforge';
import { SDLC_STAGES_CONFIG } from '../../data/seedData';
import {
  ChevronDown,
  ChevronRight,
  Plus,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  ShieldCheck,
  CheckSquare,
  Square,
  Sparkles,
  GitFork,
} from 'lucide-react';
import { AdminLTEFilterCard } from '../adminlte/AdminLTEFilterCard';

export const BoardView: React.FC = () => {
  const {
    requests,
    searchQuery,
    selectedDepartment,
    selectedUrgency,
    selectedType,
    groupBy,
    setSelectedRequest,
    changeStage,
    toggleSubtask,
    addSubtask,
    setIsNewRequestModalOpen,
    workflows,
    tasks,
    setActiveView,
  } = useAppForge();

  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({
    'req-0087': true,
  });
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});
  const [newSubtaskTitles, setNewSubtaskTitles] = useState<Record<string, string>>({});
  const [gateErrorToast, setGateErrorToast] = useState<{ id: string; message: string } | null>(null);

  // Filter requests
  const filteredRequests = requests.filter((r) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchCode = r.code.toLowerCase().includes(q);
      const matchTitle = r.title.toLowerCase().includes(q);
      const matchTags = r.tags.some((t) => t.toLowerCase().includes(q));
      const matchDept = r.department.toLowerCase().includes(q);
      if (!matchCode && !matchTitle && !matchTags && !matchDept) return false;
    }
    if (selectedDepartment !== 'All' && r.department !== selectedDepartment) return false;
    if (selectedUrgency !== 'All' && r.urgency !== selectedUrgency) return false;
    if (selectedType !== 'All' && r.type !== selectedType) return false;
    return true;
  });

  const toggleRowExpansion = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedRows((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleGroupCollapse = (groupKey: string) => {
    setCollapsedGroups((prev) => ({ ...prev, [groupKey]: !prev[groupKey] }));
  };

  const handleStageSelect = (
    requestId: string,
    newStageOrder: number,
    newStatusName: string,
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    e.stopPropagation();
    const result = changeStage(requestId, newStageOrder, newStatusName);
    if (!result.success && result.reason) {
      setGateErrorToast({ id: requestId, message: result.reason });
      setTimeout(() => setGateErrorToast(null), 5000);
    }
  };

  const handleAddSubitem = (requestId: string, e: React.FormEvent) => {
    e.preventDefault();
    const title = newSubtaskTitles[requestId]?.trim();
    if (!title) return;
    addSubtask(requestId, title);
    setNewSubtaskTitles((prev) => ({ ...prev, [requestId]: '' }));
  };

  // Grouping logic
  interface GroupData {
    key: string;
    title: string;
    color: string;
    items: AppRequest[];
  }

  const groups: GroupData[] = [];

  if (groupBy === 'stage') {
    // Unique statuses
    const statuses = Array.from(new Set(filteredRequests.map((r) => r.status)));
    statuses.forEach((st) => {
      const stageItems = filteredRequests.filter((r) => r.status === st);
      const matchedStage = SDLC_STAGES_CONFIG.find((s) => s.status === st);
      groups.push({
        key: `status-${st}`,
        title: st,
        color: matchedStage?.badgeColor || 'bg-blue-600 text-white',
        items: stageItems,
      });
    });
  } else if (groupBy === 'department') {
    const depts = Array.from(new Set(filteredRequests.map((r) => r.department)));
    depts.forEach((dept) => {
      const items = filteredRequests.filter((r) => r.department === dept);
      groups.push({
        key: `dept-${dept}`,
        title: dept,
        color: 'bg-slate-700 text-white',
        items,
      });
    });
  } else if (groupBy === 'urgency') {
    const urgOrder = ['Critical', 'High', 'Medium', 'Low'];
    urgOrder.forEach((urg) => {
      const items = filteredRequests.filter((r) => r.urgency === urg);
      if (items.length > 0) {
        const color =
          urg === 'Critical'
            ? 'bg-rose-600 text-white'
            : urg === 'High'
            ? 'bg-amber-600 text-white'
            : urg === 'Medium'
            ? 'bg-blue-600 text-white'
            : 'bg-slate-600 text-white';
        groups.push({
          key: `urg-${urg}`,
          title: `${urg} Priority`,
          color,
          items,
        });
      }
    });
  } else {
    // groupBy === 'type'
    const types = ['New Application', 'Enhancement', 'Quick Win'];
    types.forEach((type) => {
      const items = filteredRequests.filter((r) => r.type === type);
      if (items.length > 0) {
        groups.push({
          key: `type-${type}`,
          title: type,
          color: 'bg-indigo-600 text-white',
          items,
        });
      }
    });
  }

  const getUrgencyBadge = (urgency: string) => {
    switch (urgency) {
      case 'Critical':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'High':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Medium':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-4 max-w-[1600px] mx-auto">
      
      {/* Toast Notification on Gate Violations */}
      {gateErrorToast && (
        <div className="fixed bottom-6 right-6 max-w-md bg-rose-900 text-white p-4 rounded shadow-2xl border border-rose-700 flex items-start gap-3 z-50 animate-in fade-in slide-in-from-bottom-5">
          <AlertCircle className="w-5 h-5 text-rose-300 shrink-0 mt-0.5" />
          <div className="text-xs">
            <div className="font-bold text-white mb-1">SDLC Stage Gate Policy</div>
            <div className="text-rose-200 leading-relaxed">{gateErrorToast.message}</div>
          </div>
        </div>
      )}

      {/* AdminLTE Filter & Search Card */}
      <AdminLTEFilterCard />

      {/* Board Summary Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-gray-200 rounded px-4 py-2.5 text-xs text-gray-700 shadow-2xs">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-gray-800">
            Total Initiatives:{' '}
            <span className="text-blue-700 font-bold">{filteredRequests.length}</span> of {requests.length}
          </span>
          <span className="text-gray-300">|</span>
          <span className="text-gray-600">
            Effort Estimate:{' '}
            <strong className="text-gray-900 font-mono tabular-nums">
              {filteredRequests.reduce((acc, curr) => acc + (curr.sdlc.planning.effortEstimateDays || 0), 0)} man-days
            </strong>
          </span>
        </div>
        <div className="flex items-center gap-2 text-gray-500 text-[11px]">
          <span>Click any row for SDLC stage gates & specifications</span>
        </div>
      </div>

      {/* Empty State */}
      {groups.length === 0 && (
        <div className="bg-white border border-gray-200 rounded p-12 text-center max-w-md mx-auto shadow-xs">
          <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3">
            <FileText className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-gray-900 mb-1">No initiatives match criteria</h3>
          <p className="text-xs text-gray-500 mb-4">
            Try adjusting your search keywords, department filter, or urgency selector.
          </p>
          <button
            onClick={() => setIsNewRequestModalOpen(true)}
            className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded shadow-xs"
          >
            Submit New Request
          </button>
        </div>
      )}

      {/* Groups Container */}
      <div className="space-y-4">
        {groups.map((group) => {
          const isCollapsed = collapsedGroups[group.key];
          const totalDays = group.items.reduce(
            (acc, curr) => acc + (curr.sdlc.planning.effortEstimateDays || 0),
            0
          );

          return (
            <div
              key={group.key}
              className="bg-white border border-gray-200 rounded shadow-xs overflow-hidden border-t-3 border-t-blue-600"
            >
              {/* Monday.com Group Header Banner */}
              <div
                onClick={() => toggleGroupCollapse(group.key)}
                className="flex items-center justify-between px-4 py-2.5 bg-slate-50/80 hover:bg-slate-100/80 cursor-pointer border-b border-slate-200 transition-colors select-none"
              >
                <div className="flex items-center gap-2.5">
                  <button className="text-slate-400 hover:text-slate-700">
                    {isCollapsed ? (
                      <ChevronRight className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>
                  <span
                    className={`px-2 py-0.5 rounded text-[11px] font-bold tracking-wide uppercase ${group.color}`}
                  >
                    {group.title}
                  </span>
                  <span className="text-xs font-medium text-slate-500 font-mono tabular-nums">
                    ({group.items.length} {group.items.length === 1 ? 'item' : 'items'})
                  </span>
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <span className="font-mono tabular-nums">{totalDays}d effort</span>
                </div>
              </div>

              {/* Group Table View */}
              {!isCollapsed && (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50/50 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                        <th className="py-2.5 px-4 w-8"></th>
                        <th className="py-2.5 px-3 min-w-[280px]">Request / Initiative</th>
                        <th className="py-2.5 px-3 min-w-[170px]">Stage / Status</th>
                        <th className="py-2.5 px-3 min-w-[120px]">Workflow</th>
                        <th className="py-2.5 px-3 min-w-[150px]">Department</th>
                        <th className="py-2.5 px-3 w-24">Urgency</th>
                        <th className="py-2.5 px-3 min-w-[120px]">Gate Status</th>
                        <th className="py-2.5 px-3 w-24 text-right">Effort</th>
                        <th className="py-2.5 px-3 min-w-[140px]">Assigned Lead</th>
                        <th className="py-2.5 px-3 min-w-[130px]">Target Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {group.items.map((item) => {
                        const isExpanded = expandedRows[item.id];
                        const itemWorkflow = workflows.find((w) => w.id === item.workflowId) || workflows[0];
                        const itemTasks = tasks.filter((t) => t.projectId === item.id);
                        const subtasksDone = item.subtasks.filter((st) => st.completed).length;
                        const subtasksTotal = item.subtasks.length;
                        const reqSigned =
                          item.sdlc.requirements.requesterSignedOff &&
                          item.sdlc.requirements.analystSignedOff;
                        const designApproved = item.sdlc.design.designApproved;
                        const uatDone = item.sdlc.testing.uatSignedOff;

                        const currentStageObject = itemWorkflow.stages.find(
                          (s) => s.order === item.currentSDLCStage || s.name === item.status
                        );

                        return (
                          <React.Fragment key={item.id}>
                            <tr
                              onClick={() => setSelectedRequest(item)}
                              className="hover:bg-blue-50/40 cursor-pointer transition-colors group"
                            >
                              {/* Subitem expander icon */}
                              <td
                                className="py-2.5 px-4 text-center"
                                onClick={(e) => toggleRowExpansion(item.id, e)}
                              >
                                <button className="text-slate-400 hover:text-slate-700 p-0.5 rounded">
                                  {isExpanded ? (
                                    <ChevronDown className="w-3.5 h-3.5" />
                                  ) : (
                                    <ChevronRight className="w-3.5 h-3.5" />
                                  )}
                                </button>
                              </td>

                              {/* Item Code & Title */}
                              <td className="py-2.5 px-3">
                                <div className="flex items-center gap-2">
                                  <span className="font-mono text-[11px] font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded shrink-0">
                                    {item.code}
                                  </span>
                                  <span className="font-semibold text-slate-900 group-hover:text-blue-700 transition-colors line-clamp-1">
                                    {item.title}
                                  </span>
                                  {(subtasksTotal > 0 || itemTasks.length > 0) && (
                                    <span className="text-[10px] text-slate-400 bg-slate-100 px-1 rounded-sm tabular-nums shrink-0">
                                      {itemTasks.length > 0 ? `${itemTasks.filter(t => t.status === 'Done').length}/${itemTasks.length} tasks` : `${subtasksDone}/${subtasksTotal}`}
                                    </span>
                                  )}
                                </div>
                              </td>

                              {/* Stage dropdown with current workflow stages! */}
                              <td className="py-2.5 px-3" onClick={(e) => e.stopPropagation()}>
                                <select
                                  value={item.currentSDLCStage}
                                  onChange={(e) => {
                                    const stgOrder = parseInt(e.target.value, 10);
                                    const stg = itemWorkflow.stages.find((s) => s.order === stgOrder);
                                    handleStageSelect(item.id, stgOrder, stg?.name || item.status, e);
                                  }}
                                  className={`w-full text-[11px] font-bold rounded-md px-2 py-1 shadow-2xs border-0 cursor-pointer focus:ring-2 focus:ring-blue-400 truncate ${
                                    currentStageObject?.badgeColor || 'bg-blue-600 text-white'
                                  }`}
                                >
                                  {itemWorkflow.stages.map((stg) => (
                                    <option
                                      key={stg.id}
                                      value={stg.order}
                                      className="bg-white text-slate-800 font-medium py-1"
                                    >
                                      {stg.order}. {stg.name}
                                    </option>
                                  ))}
                                </select>
                              </td>

                              {/* Associated Workflow */}
                              <td className="py-2.5 px-3">
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-purple-50 text-purple-700 border border-purple-200 truncate max-w-[120px]">
                                  <GitFork className="w-3 h-3 shrink-0" />
                                  <span className="truncate">{itemWorkflow.name}</span>
                                </span>
                              </td>

                              {/* Department */}
                              <td className="py-2.5 px-3">
                                <span className="text-slate-700 truncate max-w-[150px] block" title={item.department}>
                                  {item.department}
                                </span>
                              </td>

                              {/* Urgency */}
                              <td className="py-2.5 px-3">
                                <span
                                  className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${getUrgencyBadge(
                                    item.urgency
                                  )}`}
                                >
                                  {item.urgency}
                                </span>
                              </td>

                              {/* Gate Status Flags */}
                              <td className="py-2.5 px-3">
                                <div className="flex items-center gap-1.5" title="SDLC Gate Readiness">
                                  <span
                                    className={`p-1 rounded text-[10px] font-bold flex items-center gap-0.5 ${
                                      reqSigned
                                        ? 'bg-emerald-100 text-emerald-800'
                                        : 'bg-slate-100 text-slate-400'
                                    }`}
                                    title={`Requirements Sign-off: ${reqSigned ? 'Cleared' : 'Pending'}`}
                                  >
                                    Req {reqSigned ? '✓' : '—'}
                                  </span>
                                  <span
                                    className={`p-1 rounded text-[10px] font-bold flex items-center gap-0.5 ${
                                      designApproved
                                        ? 'bg-purple-100 text-purple-800'
                                        : item.type === 'Quick Win'
                                        ? 'bg-slate-100 text-slate-400'
                                        : 'bg-amber-100 text-amber-800'
                                    }`}
                                    title={`Design Approval: ${
                                      designApproved
                                        ? 'Cleared'
                                        : item.type === 'Quick Win'
                                        ? 'Skipped'
                                        : 'Pending'
                                    }`}
                                  >
                                    Des {designApproved ? '✓' : item.type === 'Quick Win' ? 'N/A' : '—'}
                                  </span>
                                  <span
                                    className={`p-1 rounded text-[10px] font-bold flex items-center gap-0.5 ${
                                      uatDone
                                        ? 'bg-teal-100 text-teal-800'
                                        : 'bg-slate-100 text-slate-400'
                                    }`}
                                    title={`UAT Testing: ${uatDone ? 'Passed' : 'Pending'}`}
                                  >
                                    UAT {uatDone ? '✓' : '—'}
                                  </span>
                                </div>
                              </td>

                              {/* Effort in Man Days */}
                              <td className="py-2.5 px-3 text-right font-mono font-medium text-slate-700 tabular-nums">
                                {item.sdlc.planning.effortEstimateDays || 0}d
                              </td>

                              {/* Assigned Lead */}
                              <td className="py-2.5 px-3">
                                <div className="flex items-center gap-2">
                                  <img
                                    src={item.assignedLeadAvatar}
                                    alt={item.assignedLead}
                                    className="w-5 h-5 rounded-full object-cover ring-1 ring-slate-200 shrink-0"
                                    referrerPolicy="no-referrer"
                                  />
                                  <span className="text-slate-800 truncate font-medium text-[11px]">
                                    {item.assignedLead.split(' ')[0]}
                                  </span>
                                </div>
                              </td>

                              {/* Target Date */}
                              <td className="py-2.5 px-3 font-mono text-[11px] text-slate-600 tabular-nums">
                                {item.targetGoLiveDate}
                              </td>
                            </tr>

                            {/* Subitem Expansion Row (Monday.com Nested Subtasks & Tasks) */}
                            {isExpanded && (
                              <tr className="bg-slate-50/70 border-b border-slate-200">
                                <td colSpan={10} className="py-3 px-6 pl-12">
                                  <div className="space-y-2 border-l-2 border-blue-400 pl-4">
                                    <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
                                      <span>Project Tasks & Subitems ({itemTasks.length + item.subtasks.length})</span>
                                      <span className="font-mono tabular-nums text-blue-700">
                                        Workflow: {itemWorkflow.name} ({item.status})
                                      </span>
                                    </div>

                                    {/* Tasks List */}
                                    <div className="space-y-1.5">
                                      {itemTasks.map((t) => (
                                        <div
                                          key={t.id}
                                          className="flex items-center justify-between gap-3 p-2 rounded-lg bg-white border border-slate-200/80 text-xs"
                                        >
                                          <div className="flex items-center gap-2 min-w-0">
                                            <span
                                              className={`w-2 h-2 rounded-full ${
                                                t.status === 'Done'
                                                  ? 'bg-emerald-500'
                                                  : t.status === 'In Progress'
                                                  ? 'bg-blue-500'
                                                  : 'bg-amber-500'
                                              }`}
                                            />
                                            <span className="font-medium text-slate-900 truncate">
                                              {t.title}
                                            </span>
                                          </div>
                                          <div className="flex items-center gap-2 shrink-0 text-[10px]">
                                            <span className="px-1.5 py-0.2 rounded bg-slate-100 font-bold text-slate-600">
                                              {t.status}
                                            </span>
                                            <span className="text-slate-500">{t.assignedToName}</span>
                                            <span className="font-mono text-slate-400 tabular-nums">{t.dueDate}</span>
                                          </div>
                                        </div>
                                      ))}

                                      {/* Subtasks */}
                                      {item.subtasks.map((st) => (
                                        <div
                                          key={st.id}
                                          onClick={() => toggleSubtask(item.id, st.id)}
                                          className="flex items-center justify-between gap-3 p-1.5 rounded-lg bg-white/70 border border-slate-200/60 hover:border-blue-300 cursor-pointer text-xs transition-colors"
                                        >
                                          <div className="flex items-center gap-2 min-w-0">
                                            {st.completed ? (
                                              <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0" />
                                            ) : (
                                              <Square className="w-4 h-4 text-slate-400 shrink-0" />
                                            )}
                                            <span
                                              className={`truncate ${
                                                st.completed
                                                  ? 'line-through text-slate-400'
                                                  : 'text-slate-800 font-medium'
                                              }`}
                                            >
                                              {st.title}
                                            </span>
                                          </div>
                                          <div className="flex items-center gap-3 shrink-0 text-[11px] text-slate-500">
                                            <span className="bg-slate-100 px-1.5 py-0.5 rounded">
                                              {st.assignedTo}
                                            </span>
                                            <span className="font-mono text-slate-400 tabular-nums">
                                              {st.dueDate}
                                            </span>
                                          </div>
                                        </div>
                                      ))}

                                      {/* Quick Add Form */}
                                      <form
                                        onSubmit={(e) => handleAddSubitem(item.id, e)}
                                        className="flex items-center gap-2 pt-1"
                                      >
                                        <input
                                          type="text"
                                          placeholder="+ Add subitem or deliverable..."
                                          value={newSubtaskTitles[item.id] || ''}
                                          onChange={(e) =>
                                            setNewSubtaskTitles((prev) => ({
                                              ...prev,
                                              [item.id]: e.target.value,
                                            }))
                                          }
                                          className="flex-1 px-2.5 py-1 text-xs bg-white border border-slate-300 rounded-md placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                        />
                                        <button
                                          type="submit"
                                          className="px-2.5 py-1 text-xs font-semibold text-slate-700 bg-slate-200 hover:bg-slate-300 rounded-md transition-colors"
                                        >
                                          Add
                                        </button>
                                      </form>
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
