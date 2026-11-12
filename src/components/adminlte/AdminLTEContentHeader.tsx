import React from 'react';
import { useAppForge, AppViewMode } from '../../context/AppForgeContext';
import {
  LayoutDashboard,
  Table2,
  FileText,
  Kanban,
  CheckSquare,
  ShieldCheck,
  CalendarDays,
  ChevronRight,
  Home,
  Plus,
} from 'lucide-react';

export const AdminLTEContentHeader: React.FC = () => {
  const { activeView, setActiveView, setIsNewRequestModalOpen } = useAppForge();

  const getHeaderMeta = () => {
    switch (activeView) {
      case 'dashboard':
        return {
          title: 'Executive Dashboard',
          subtitle: 'Overview of system change requests, development sprints, and labor ROI',
          icon: LayoutDashboard,
          breadcrumb: ['Dashboard'],
        };
      case 'board':
        return {
          title: 'Project Initiatives (Board)',
          subtitle: 'Main project list, workflow stage pipelines, and team assignments',
          icon: Table2,
          breadcrumb: ['Projects', 'Main Board'],
        };
      case 'kanban':
        return {
          title: 'Kanban Delivery Pipeline',
          subtitle: 'Visual status pipeline across custom workflow stages',
          icon: Kanban,
          breadcrumb: ['Projects', 'Kanban'],
        };
      case 'tasks':
        return {
          title: 'Task Management Center',
          subtitle: 'Cross-project task tracking, assignment, sprint execution, and due dates',
          icon: CheckSquare,
          breadcrumb: ['Tasks', 'All Project Tasks'],
        };
      case 'timeline':
        return {
          title: 'Project Timeline & Release Milestones',
          subtitle: 'Gantt schedule tracking from Intake to Cutover and Post-Launch Evaluation',
          icon: CalendarDays,
          breadcrumb: ['SDLC', 'Timeline'],
        };
      default:
        return {
          title: 'MIS AppForge',
          subtitle: 'Internal application project management system',
          icon: Table2,
          breadcrumb: ['AppForge'],
        };
    }
  };

  const meta = getHeaderMeta();
  const Icon = meta.icon;

  return (
    <div className="px-4 sm:px-6 pt-4 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-200/80 bg-white/60 select-none">
      {/* Title & Subtitle */}
      <div>
        <div className="flex items-center gap-2">
          <Icon className="w-5 h-5 text-blue-600 shrink-0" />
          <h1 className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight">
            {meta.title}
          </h1>
        </div>
        <p className="text-xs text-gray-500 mt-0.5">{meta.subtitle}</p>
      </div>

      {/* AdminLTE Breadcrumbs */}
      <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
        <button
          onClick={() => setActiveView('dashboard')}
          className="flex items-center gap-1 hover:text-blue-600 transition-colors"
        >
          <Home className="w-3.5 h-3.5" />
          <span>Home</span>
        </button>

        {meta.breadcrumb.map((crumb, idx) => {
          const isLast = idx === meta.breadcrumb.length - 1;
          return (
            <React.Fragment key={idx}>
              <span className="text-gray-300">/</span>
              <span className={isLast ? 'text-gray-800 font-bold' : 'hover:text-blue-600'}>
                {crumb}
              </span>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
