import React from 'react';
import { useAppForge, AppViewMode } from '../context/AppForgeContext';
import {
  Table2,
  Kanban,
  CalendarDays,
  BarChart3,
  GitFork,
  Search,
  Filter,
  Layers,
  X,
  ListTodo,
  Settings2,
} from 'lucide-react';
import { Department, RequestType, UrgencyLevel } from '../types/appforge';

const DEPARTMENTS: (Department | 'All')[] = [
  'All',
  'Foam Plant & Production',
  'Sales & Logistics',
  'Supply Chain & Procurement',
  'Automotive & Plastics Division',
  'Human Resources & Admin',
  'Finance & Accounting',
  'Quality Assurance & R&D',
  'Management Information Systems (MIS)',
];

const URGENCIES: (UrgencyLevel | 'All')[] = ['All', 'Critical', 'High', 'Medium', 'Low'];

const TYPES: (RequestType | 'All')[] = ['All', 'New Application', 'Enhancement', 'Quick Win'];

export const ViewSwitcher: React.FC = () => {
  const {
    activeView,
    setActiveView,
    searchQuery,
    setSearchQuery,
    selectedDepartment,
    setSelectedDepartment,
    selectedUrgency,
    setSelectedUrgency,
    selectedType,
    setSelectedType,
    groupBy,
    setGroupBy,
    requests,
    tasks,
    setIsWorkflowModalOpen,
    permissions,
  } = useAppForge();

  const hasActiveFilters =
    searchQuery !== '' ||
    selectedDepartment !== 'All' ||
    selectedUrgency !== 'All' ||
    selectedType !== 'All';

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedDepartment('All');
    setSelectedUrgency('All');
    setSelectedType('All');
  };

  return (
    <div className="bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        {/* Row 1: View Modes Tabs */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          
          {/* Segmented View Mode Buttons */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg overflow-x-auto max-w-full">
            <button
              onClick={() => setActiveView('board')}
              className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-md transition-all whitespace-nowrap ${
                activeView === 'board'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Table2 className="w-3.5 h-3.5 text-blue-600" />
              <span>Main Board</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-600 tabular-nums font-mono">
                {requests.length}
              </span>
            </button>

            <button
              onClick={() => setActiveView('kanban')}
              className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-md transition-all whitespace-nowrap ${
                activeView === 'kanban'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Kanban className="w-3.5 h-3.5 text-indigo-600" />
              <span>Kanban</span>
            </button>

            <button
              onClick={() => setActiveView('timeline')}
              className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-md transition-all whitespace-nowrap ${
                activeView === 'timeline'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CalendarDays className="w-3.5 h-3.5 text-teal-600" />
              <span>Timeline</span>
            </button>

            {/* Task Center Button */}
            <button
              onClick={() => setActiveView('tasks')}
              className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-md transition-all whitespace-nowrap ${
                activeView === 'tasks'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ListTodo className="w-3.5 h-3.5 text-rose-600" />
              <span>Task Management</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-rose-50 text-rose-700 tabular-nums font-mono font-bold">
                {tasks.length}
              </span>
            </button>

            <button
              onClick={() => setActiveView('dashboard')}
              className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-md transition-all whitespace-nowrap ${
                activeView === 'dashboard'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5 text-amber-600" />
              <span>MIS Dashboard</span>
            </button>

            <button
              onClick={() => setActiveView('sdlc-matrix')}
              className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-md transition-all whitespace-nowrap ${
                activeView === 'sdlc-matrix'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <GitFork className="w-3.5 h-3.5 text-purple-600" />
              <span>11-Stage SDLC</span>
            </button>
          </div>

          {/* Quick Action: Workflows Studio */}
          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={() => setIsWorkflowModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg transition-colors whitespace-nowrap"
              title="Custom Workflows & Statuses Builder"
            >
              <Settings2 className="w-3.5 h-3.5 text-indigo-600" />
              <span>Custom Workflows</span>
            </button>

            {/* Group By selector (for board view) */}
            {activeView === 'board' && (
              <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-600">
                <select
                  value={groupBy}
                  onChange={(e) => setGroupBy(e.target.value as any)}
                  className="text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-md px-2.5 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="stage">Group: SDLC Stage</option>
                  <option value="department">Group: Department</option>
                  <option value="urgency">Group: Urgency</option>
                  <option value="type">Group: Type</option>
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Row 2: Search & Filtering Bar (when on board/kanban/timeline) */}
        {activeView !== 'tasks' && (
          <div className="pt-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[280px]">
              {/* Search Input */}
              <div className="relative min-w-[220px] max-w-xs flex-1">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search URX-REQ code, title, tags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-lg text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Department Filter */}
              <div className="flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <select
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  className="text-xs text-slate-700 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="All">All Departments</option>
                  {DEPARTMENTS.filter((d) => d !== 'All').map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              {/* Urgency Filter */}
              <select
                value={selectedUrgency}
                onChange={(e) => setSelectedUrgency(e.target.value)}
                className="text-xs text-slate-700 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="All">All Urgency</option>
                {URGENCIES.filter((u) => u !== 'All').map((u) => (
                  <option key={u} value={u}>
                    {u} Urgency
                  </option>
                ))}
              </select>

              {/* Type Filter */}
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="text-xs text-slate-700 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="All">All Request Types</option>
                {TYPES.filter((t) => t !== 'All').map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>

              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="text-xs text-rose-600 hover:text-rose-800 font-medium flex items-center gap-1 px-2 py-1 rounded-md hover:bg-rose-50 transition-colors"
                >
                  <X className="w-3 h-3" />
                  Reset Filters
                </button>
              )}
            </div>

            <div className="hidden xl:flex items-center gap-2 text-[11px] text-slate-500">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              <span>Multi-workflow & RBAC active</span>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
