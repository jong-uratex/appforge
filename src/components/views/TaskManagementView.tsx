import React, { useState } from 'react';
import { useAppForge } from '../../context/AppForgeContext';
import { ProjectTask, TaskPriority, TaskStatus } from '../../types/appforge';
import {
  ListTodo,
  CheckCircle2,
  Clock,
  AlertCircle,
  Plus,
  Search,
  Filter,
  CheckSquare,
  Square,
  User,
  Calendar,
  Layers,
  Sparkles,
  Trash2,
} from 'lucide-react';

export const TaskManagementView: React.FC = () => {
  const {
    tasks,
    currentUser,
    updateTaskStatus,
    deleteTask,
    setIsNewTaskModalOpen,
    requests,
    users,
    permissions,
  } = useAppForge();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [priorityFilter, setPriorityFilter] = useState<string>('All');
  const [assigneeFilter, setAssigneeFilter] = useState<string>('All');
  const [projectFilter, setProjectFilter] = useState<string>('All');
  const [groupBy, setGroupBy] = useState<'project' | 'status' | 'assignee' | 'priority'>('project');
  const [myTasksOnly, setMyTasksOnly] = useState(false);

  // Filter tasks
  const filteredTasks = tasks.filter((t) => {
    if (myTasksOnly && t.assignedToId !== currentUser.id) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const match =
        t.title.toLowerCase().includes(q) ||
        t.projectCode.toLowerCase().includes(q) ||
        t.projectTitle.toLowerCase().includes(q) ||
        t.tags.some((tag) => tag.toLowerCase().includes(q));
      if (!match) return false;
    }
    if (statusFilter !== 'All' && t.status !== statusFilter) return false;
    if (priorityFilter !== 'All' && t.priority !== priorityFilter) return false;
    if (assigneeFilter !== 'All' && t.assignedToId !== assigneeFilter) return false;
    if (projectFilter !== 'All' && t.projectId !== projectFilter) return false;
    return true;
  });

  // KPI computations
  const totalTasks = tasks.length;
  const inProgressCount = tasks.filter((t) => t.status === 'In Progress').length;
  const inReviewCount = tasks.filter((t) => t.status === 'In Review').length;
  const doneCount = tasks.filter((t) => t.status === 'Done').length;
  const totalEstimatedHours = tasks.reduce((acc, t) => acc + (t.estimatedHours || 0), 0);
  const totalLoggedHours = tasks.reduce((acc, t) => acc + (t.loggedHours || 0), 0);

  const getStatusBadge = (status: TaskStatus) => {
    switch (status) {
      case 'Done':
        return 'bg-emerald-600 text-white';
      case 'In Progress':
        return 'bg-blue-600 text-white';
      case 'In Review':
        return 'bg-amber-500 text-white';
      case 'Blocked':
        return 'bg-rose-600 text-white';
      default:
        return 'bg-slate-500 text-white';
    }
  };

  const getPriorityBadge = (priority: TaskPriority) => {
    switch (priority) {
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

  // Grouping structures
  interface TaskGroup {
    key: string;
    title: string;
    color: string;
    items: ProjectTask[];
  }

  const groups: TaskGroup[] = [];

  if (groupBy === 'project') {
    const projIds = Array.from(new Set(filteredTasks.map((t) => t.projectId)));
    projIds.forEach((pid) => {
      const items = filteredTasks.filter((t) => t.projectId === pid);
      const proj = requests.find((r) => r.id === pid);
      groups.push({
        key: `proj-${pid}`,
        title: proj ? `${proj.code} · ${proj.title}` : items[0]?.projectTitle || 'Initiative',
        color: 'bg-indigo-600 text-white',
        items,
      });
    });
  } else if (groupBy === 'status') {
    const statuses: TaskStatus[] = ['In Progress', 'In Review', 'To Do', 'Done', 'Blocked'];
    statuses.forEach((st) => {
      const items = filteredTasks.filter((t) => t.status === st);
      if (items.length > 0) {
        groups.push({
          key: `status-${st}`,
          title: st,
          color: getStatusBadge(st),
          items,
        });
      }
    });
  } else if (groupBy === 'priority') {
    const priorities: TaskPriority[] = ['Critical', 'High', 'Medium', 'Low'];
    priorities.forEach((p) => {
      const items = filteredTasks.filter((t) => t.priority === p);
      if (items.length > 0) {
        groups.push({
          key: `priority-${p}`,
          title: `${p} Priority`,
          color:
            p === 'Critical'
              ? 'bg-rose-600 text-white'
              : p === 'High'
              ? 'bg-amber-600 text-white'
              : 'bg-slate-700 text-white',
          items,
        });
      }
    });
  } else {
    // groupBy === 'assignee'
    const assigneeIds = Array.from(new Set(filteredTasks.map((t) => t.assignedToId)));
    assigneeIds.forEach((aid) => {
      const items = filteredTasks.filter((t) => t.assignedToId === aid);
      const assignee = users.find((u) => u.id === aid);
      groups.push({
        key: `assignee-${aid}`,
        title: assignee ? assignee.name : items[0]?.assignedToName || 'Unassigned',
        color: 'bg-slate-800 text-white',
        items,
      });
    });
  }

  return (
    <div className="p-4 sm:p-6 space-y-4 max-w-[1600px] mx-auto">
      
      {/* Top Header & Task KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white p-3.5 rounded border border-gray-200 shadow-2xs">
          <div className="text-[10px] font-semibold text-gray-500 uppercase">Total Tasks</div>
          <div className="text-xl font-bold text-gray-900 font-mono tabular-nums mt-0.5">
            {totalTasks}
          </div>
          <div className="text-[10px] text-slate-400">Across all initiatives</div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-[10px] font-semibold text-blue-600 uppercase">In Progress</div>
          <div className="text-xl font-bold text-blue-700 font-mono tabular-nums mt-0.5">
            {inProgressCount}
          </div>
          <div className="text-[10px] text-slate-400">Active development</div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-[10px] font-semibold text-amber-600 uppercase">In Review</div>
          <div className="text-xl font-bold text-amber-700 font-mono tabular-nums mt-0.5">
            {inReviewCount}
          </div>
          <div className="text-[10px] text-slate-400">Code/spec review</div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-[10px] font-semibold text-emerald-600 uppercase">Completed</div>
          <div className="text-xl font-bold text-emerald-700 font-mono tabular-nums mt-0.5">
            {doneCount}
          </div>
          <div className="text-[10px] text-slate-400">
            {Math.round((doneCount / (totalTasks || 1)) * 100)}% velocity
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-[10px] font-semibold text-indigo-600 uppercase">Logged Hours</div>
          <div className="text-xl font-bold text-indigo-700 font-mono tabular-nums mt-0.5">
            {totalLoggedHours}h
          </div>
          <div className="text-[10px] text-slate-400">Of {totalEstimatedHours}h estimated</div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-center">
          <button
            onClick={() => setIsNewTaskModalOpen(true)}
            className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-xs shadow-xs flex items-center justify-center gap-1.5 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Create Task</span>
          </button>
        </div>
      </div>

      {/* Task Toolbar: Search, Filters & Grouping */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
        
        <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[280px]">
          {/* Search Input */}
          <div className="relative min-w-[200px] max-w-xs flex-1">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Filter tasks by name, code, tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Quick "My Tasks" Toggle */}
          <button
            onClick={() => setMyTasksOnly(!myTasksOnly)}
            className={`px-3 py-1.5 rounded-lg border font-semibold text-xs transition-colors ${
              myTasksOnly
                ? 'bg-blue-50 text-blue-700 border-blue-300'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            My Assigned Tasks
          </button>

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-700 text-xs focus:ring-1 focus:ring-blue-500"
          >
            <option value="All">All Statuses</option>
            <option value="To Do">To Do</option>
            <option value="In Progress">In Progress</option>
            <option value="In Review">In Review</option>
            <option value="Done">Done</option>
            <option value="Blocked">Blocked</option>
          </select>

          {/* Priority filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-700 text-xs focus:ring-1 focus:ring-blue-500"
          >
            <option value="All">All Priorities</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>

        {/* Group By selector */}
        <div className="flex items-center gap-2">
          <span className="text-slate-500 font-medium">Group by:</span>
          <select
            value={groupBy}
            onChange={(e) => setGroupBy(e.target.value as any)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-semibold text-xs focus:ring-1 focus:ring-blue-500"
          >
            <option value="project">Project / Initiative</option>
            <option value="status">Task Status</option>
            <option value="priority">Priority Level</option>
            <option value="assignee">Team Assignee</option>
          </select>
        </div>

      </div>

      {/* Task Groups Table / Cards */}
      <div className="space-y-6">
        {groups.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-12 text-center max-w-md mx-auto">
            <ListTodo className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h4 className="font-bold text-slate-800 text-sm">No tasks found</h4>
            <p className="text-xs text-slate-500 mt-1 mb-4">
              Try resetting your search query or task filters.
            </p>
            <button
              onClick={() => setIsNewTaskModalOpen(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-xs"
            >
              + Create First Task
            </button>
          </div>
        ) : (
          groups.map((group) => {
            const groupDone = group.items.filter((t) => t.status === 'Done').length;
            const groupHours = group.items.reduce((acc, t) => acc + (t.estimatedHours || 0), 0);

            return (
              <div
                key={group.key}
                className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden"
              >
                {/* Group Banner */}
                <div className="px-4 py-2.5 bg-slate-50/90 border-b border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${group.color}`}>
                      {group.title}
                    </span>
                    <span className="font-mono text-xs text-slate-500 tabular-nums">
                      ({group.items.length} tasks · {groupDone}/{group.items.length} completed)
                    </span>
                  </div>

                  <span className="text-xs font-mono text-slate-500 tabular-nums">
                    {groupHours}h estimated
                  </span>
                </div>

                {/* Tasks Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50/50 border-b border-slate-200 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                        <th className="py-2 px-3 w-8 text-center"></th>
                        <th className="py-2 px-3 min-w-[280px]">Task Title</th>
                        <th className="py-2 px-3 w-32">Status</th>
                        <th className="py-2 px-3 w-24">Priority</th>
                        <th className="py-2 px-3 min-w-[140px]">Assignee</th>
                        <th className="py-2 px-3 w-28">Due Date</th>
                        <th className="py-2 px-3 w-24 text-right">Hours</th>
                        <th className="py-2 px-3 w-10"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {group.items.map((task) => {
                        const isDone = task.status === 'Done';
                        const isOverdue =
                          !isDone &&
                          new Date(task.dueDate).getTime() < new Date().setHours(0, 0, 0, 0);

                        return (
                          <tr
                            key={task.id}
                            className="hover:bg-blue-50/40 transition-colors group"
                          >
                            {/* Checkbox toggle */}
                            <td className="py-2.5 px-3 text-center">
                              <button
                                onClick={() =>
                                  updateTaskStatus(task.id, isDone ? 'To Do' : 'Done')
                                }
                                className="text-slate-400 hover:text-emerald-600 transition-colors"
                              >
                                {isDone ? (
                                  <CheckSquare className="w-4 h-4 text-emerald-600" />
                                ) : (
                                  <Square className="w-4 h-4 text-slate-400" />
                                )}
                              </button>
                            </td>

                            {/* Title & Project Code */}
                            <td className="py-2.5 px-3">
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded shrink-0">
                                  {task.projectCode}
                                </span>
                                <span
                                  className={`font-semibold ${
                                    isDone
                                      ? 'line-through text-slate-400'
                                      : 'text-slate-900 group-hover:text-blue-700'
                                  }`}
                                >
                                  {task.title}
                                </span>
                              </div>
                              {task.tags && task.tags.length > 0 && (
                                <div className="flex items-center gap-1 mt-0.5">
                                  {task.tags.map((tg) => (
                                    <span
                                      key={tg}
                                      className="text-[9px] text-slate-400 font-mono"
                                    >
                                      #{tg}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </td>

                            {/* Status dropdown */}
                            <td className="py-2.5 px-3">
                              <select
                                value={task.status}
                                onChange={(e) =>
                                  updateTaskStatus(task.id, e.target.value as TaskStatus)
                                }
                                className={`text-[10px] font-bold px-2 py-1 rounded-md cursor-pointer border-0 ${getStatusBadge(
                                  task.status
                                )}`}
                              >
                                <option value="To Do" className="bg-white text-slate-800">
                                  To Do
                                </option>
                                <option value="In Progress" className="bg-white text-slate-800">
                                  In Progress
                                </option>
                                <option value="In Review" className="bg-white text-slate-800">
                                  In Review
                                </option>
                                <option value="Done" className="bg-white text-slate-800">
                                  Done
                                </option>
                                <option value="Blocked" className="bg-white text-slate-800">
                                  Blocked
                                </option>
                              </select>
                            </td>

                            {/* Priority */}
                            <td className="py-2.5 px-3">
                              <span
                                className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${getPriorityBadge(
                                  task.priority
                                )}`}
                              >
                                {task.priority}
                              </span>
                            </td>

                            {/* Assignee */}
                            <td className="py-2.5 px-3">
                              <div className="flex items-center gap-1.5">
                                <img
                                  src={task.assignedToAvatar}
                                  alt={task.assignedToName}
                                  className="w-5 h-5 rounded-full object-cover ring-1 ring-slate-200 shrink-0"
                                  referrerPolicy="no-referrer"
                                />
                                <span className="font-medium text-slate-800 truncate">
                                  {task.assignedToName.split(' ')[0]}
                                </span>
                              </div>
                            </td>

                            {/* Due Date */}
                            <td className="py-2.5 px-3 font-mono text-[11px] tabular-nums">
                              <span
                                className={
                                  isOverdue
                                    ? 'text-rose-600 font-bold bg-rose-50 px-1 rounded'
                                    : 'text-slate-600'
                                }
                              >
                                {task.dueDate}
                              </span>
                            </td>

                            {/* Hours */}
                            <td className="py-2.5 px-3 text-right font-mono font-medium text-slate-600 tabular-nums">
                              {task.loggedHours}/{task.estimatedHours}h
                            </td>

                            {/* Delete */}
                            <td className="py-2.5 px-3 text-center">
                              <button
                                onClick={() => deleteTask(task.id)}
                                className="text-slate-300 hover:text-rose-600 transition-colors opacity-0 group-hover:opacity-100"
                                title="Delete task"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
