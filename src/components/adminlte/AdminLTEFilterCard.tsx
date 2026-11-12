import React, { useState } from 'react';
import { useAppForge } from '../../context/AppForgeContext';
import {
  Search,
  Filter,
  X,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  SlidersHorizontal,
} from 'lucide-react';
import { Department, RequestType, UrgencyLevel } from '../../types/appforge';

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

export const AdminLTEFilterCard: React.FC = () => {
  const {
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
    activeView,
    requests,
  } = useAppForge();

  const [isCollapsed, setIsCollapsed] = useState(false);

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
    <div className="bg-white rounded border border-gray-200 shadow-xs mb-4 overflow-hidden">
      {/* Card Header (AdminLTE card-header) */}
      <div className="px-4 py-2.5 bg-gray-50/80 border-b border-gray-200 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 font-bold text-gray-800">
          <SlidersHorizontal className="w-4 h-4 text-blue-600" />
          <span>Filter & Search Requests</span>
          {hasActiveFilters && (
            <span className="px-1.5 py-0.2 rounded bg-blue-100 text-blue-800 font-bold text-[10px]">
              Filters Active
            </span>
          )}
        </div>

        {/* Card Tools */}
        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-gray-500 hover:text-rose-600 flex items-center gap-1 font-medium transition-colors"
              title="Reset all filters"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          )}

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 rounded hover:bg-gray-200 text-gray-500 hover:text-gray-800 transition-colors"
            title={isCollapsed ? 'Expand filter panel' : 'Collapse filter panel'}
          >
            {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Card Body (AdminLTE card-body) */}
      {!isCollapsed && (
        <div className="p-4 bg-white text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {/* Search Input */}
            <div className="lg:col-span-2">
              <label className="block text-gray-600 font-semibold mb-1">
                Keyword Search
              </label>
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search code (SCR-2026-003), title, tag..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-7 py-1.5 bg-gray-50 hover:bg-white focus:bg-white border border-gray-300 rounded text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>

            {/* Department Dropdown */}
            <div>
              <label className="block text-gray-600 font-semibold mb-1">
                Department
              </label>
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="w-full py-1.5 px-2 bg-gray-50 hover:bg-white focus:bg-white border border-gray-300 rounded text-gray-800 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="All">All Departments</option>
                {DEPARTMENTS.filter((d) => d !== 'All').map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            {/* Urgency Dropdown */}
            <div>
              <label className="block text-gray-600 font-semibold mb-1">
                Urgency
              </label>
              <select
                value={selectedUrgency}
                onChange={(e) => setSelectedUrgency(e.target.value)}
                className="w-full py-1.5 px-2 bg-gray-50 hover:bg-white focus:bg-white border border-gray-300 rounded text-gray-800 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="All">All Urgency</option>
                {URGENCIES.filter((u) => u !== 'All').map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </div>

            {/* Group By selector (on board view) or Request Type */}
            {activeView === 'board' ? (
              <div>
                <label className="block text-gray-600 font-semibold mb-1">
                  Group Rows By
                </label>
                <select
                  value={groupBy}
                  onChange={(e) => setGroupBy(e.target.value as any)}
                  className="w-full py-1.5 px-2 bg-gray-50 hover:bg-white focus:bg-white border border-gray-300 rounded text-gray-800 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="stage">SDLC Stage Status</option>
                  <option value="department">Department</option>
                  <option value="urgency">Urgency Priority</option>
                  <option value="type">Request Type</option>
                </select>
              </div>
            ) : (
              <div>
                <label className="block text-gray-600 font-semibold mb-1">
                  Request Type
                </label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full py-1.5 px-2 bg-gray-50 hover:bg-white focus:bg-white border border-gray-300 rounded text-gray-800 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="All">All Types</option>
                  {TYPES.filter((t) => t !== 'All').map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
