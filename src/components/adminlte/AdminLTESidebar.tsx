import React from 'react';
import { useAppForge, AppViewMode } from '../../context/AppForgeContext';
import {
  LayoutDashboard,
  Table2,
  Kanban,
  CheckSquare,
  CalendarDays,
  Settings2,
  Activity,
  Cloud,
  Shield,
  Layers,
  ChevronRight,
  LogOut,
} from 'lucide-react';

interface AdminLTESidebarProps {
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: (collapsed: boolean | ((prev: boolean) => boolean)) => void;
  isMobileSidebarOpen: boolean;
  setIsMobileSidebarOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
}

export const AdminLTESidebar: React.FC<AdminLTESidebarProps> = ({
  isSidebarCollapsed,
  isMobileSidebarOpen,
  setIsMobileSidebarOpen,
}) => {
  const {
    activeView,
    setActiveView,
    requests,
    tasks,
    activities,
    currentUser,
    setIsWorkflowModalOpen,
    setIsCloudflareModalOpen,
    setIsAuthModalOpen,
    setIsActivitySidebarOpen,
    logoutUser,
  } = useAppForge();

  const handleNavClick = (view: AppViewMode) => {
    setActiveView(view);
    if (window.innerWidth < 1024) {
      setIsMobileSidebarOpen(false);
    }
  };

  const navItemClass = (isActive: boolean) =>
    `flex items-center gap-3 px-3 py-2 rounded text-xs transition-colors cursor-pointer select-none group ${
      isActive
        ? 'bg-blue-600 text-white font-semibold shadow-xs'
        : 'text-gray-300 hover:bg-white/10 hover:text-white'
    }`;

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-2xs"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Main Sidebar Element */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 bg-[#343a40] text-[#c2c7d0] flex flex-col transition-all duration-200 ease-in-out border-r border-[#4b545c] ${
          // Desktop collapse vs expand
          isSidebarCollapsed ? 'lg:w-16' : 'lg:w-64'
        } ${
          // Mobile open vs closed
          isMobileSidebarOpen
            ? 'translate-x-0 w-64'
            : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Logo Header */}
        <div className="h-14 flex items-center px-4 border-b border-[#4b545c] bg-[#343a40] shrink-0">
          <button
            onClick={() => handleNavClick('dashboard')}
            className="flex items-center gap-3 text-left w-full overflow-hidden"
          >
            <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center text-white shrink-0 font-bold shadow-xs">
              <Layers className="w-4 h-4" />
            </div>
            {!isSidebarCollapsed && (
              <div className="truncate">
                <span className="font-extrabold text-white text-sm tracking-tight">
                  MIS <span className="font-light text-gray-300">AppForge</span>
                </span>
                <span className="text-[10px] text-gray-400 block tracking-wider uppercase font-medium">
                  Uratex Philippines
                </span>
              </div>
            )}
          </button>
        </div>

        {/* User Panel */}
        <div className="p-3 border-b border-[#4b545c] shrink-0">
          <button
            onClick={() => setIsAuthModalOpen(true)}
            className="flex items-center gap-3 w-full text-left p-1 rounded hover:bg-white/5 transition-colors"
            title="Click to change active persona / RBAC"
          >
            <div className="relative shrink-0">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-8 h-8 rounded-full object-cover ring-1 ring-gray-500"
                referrerPolicy="no-referrer"
              />
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-[#343a40] rounded-full" />
            </div>
            {!isSidebarCollapsed && (
              <div className="truncate flex-1">
                <div className="text-xs font-bold text-white truncate">
                  {currentUser.name}
                </div>
                <div className="text-[10px] text-gray-400 flex items-center gap-1.5">
                  <span className="truncate">{currentUser.role}</span>
                  <span>·</span>
                  <span className="text-emerald-400 font-semibold text-[9px]">Online</span>
                </div>
              </div>
            )}
          </button>
        </div>

        {/* Navigation Menu */}
        <div className="flex-1 overflow-y-auto px-2 py-3 space-y-4">
          
          {/* Group 1: MAIN NAVIGATION */}
          <div>
            {!isSidebarCollapsed && (
              <div className="px-3 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                MAIN NAVIGATION
              </div>
            )}

            <div className="space-y-0.5">
              {/* Dashboard */}
              <button
                onClick={() => handleNavClick('dashboard')}
                className={navItemClass(activeView === 'dashboard')}
                title="Executive Dashboard"
              >
                <LayoutDashboard className="w-4 h-4 shrink-0 text-amber-400" />
                {!isSidebarCollapsed && <span className="flex-1 text-left">Dashboard</span>}
              </button>

              {/* System Change Requests */}
              <button
                onClick={() => handleNavClick('board')}
                className={navItemClass(activeView === 'board')}
                title="System Change Requests (Main Board)"
              >
                <Table2 className="w-4 h-4 shrink-0 text-blue-400" />
                {!isSidebarCollapsed && (
                  <>
                    <span className="flex-1 text-left">Change Requests</span>
                    <span className="px-1.5 py-0.2 text-[10px] rounded-full bg-blue-500 text-white font-mono font-bold">
                      {requests.length}
                    </span>
                  </>
                )}
              </button>

              {/* Kanban Pipeline */}
              <button
                onClick={() => handleNavClick('kanban')}
                className={navItemClass(activeView === 'kanban')}
                title="Kanban Delivery Pipeline"
              >
                <Kanban className="w-4 h-4 shrink-0 text-indigo-400" />
                {!isSidebarCollapsed && <span className="flex-1 text-left">Kanban Board</span>}
              </button>

              {/* Task Management */}
              <button
                onClick={() => handleNavClick('tasks')}
                className={navItemClass(activeView === 'tasks')}
                title="Cross-Project Task Management"
              >
                <CheckSquare className="w-4 h-4 shrink-0 text-rose-400" />
                {!isSidebarCollapsed && (
                  <>
                    <span className="flex-1 text-left">Task Management</span>
                    <span className="px-1.5 py-0.2 text-[10px] rounded-full bg-rose-500 text-white font-mono font-bold">
                      {tasks.length}
                    </span>
                  </>
                )}
              </button>

              {/* Release Timeline */}
              <button
                onClick={() => handleNavClick('timeline')}
                className={navItemClass(activeView === 'timeline')}
                title="Project Timeline & Release Milestones"
              >
                <CalendarDays className="w-4 h-4 shrink-0 text-teal-400" />
                {!isSidebarCollapsed && <span className="flex-1 text-left">Timeline & Gantt</span>}
              </button>
            </div>
          </div>

          {/* Group 2: WORKFLOWS */}
          <div>
            {!isSidebarCollapsed && (
              <div className="px-3 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                WORKFLOWS
              </div>
            )}

            <div className="space-y-0.5">

              {/* Custom Workflows Builder */}
              <button
                onClick={() => setIsWorkflowModalOpen(true)}
                className="flex items-center gap-3 px-3 py-2 rounded text-xs text-gray-300 hover:bg-white/10 hover:text-white transition-colors w-full text-left"
                title="Custom Project Workflows & Stage Statuses"
              >
                <Settings2 className="w-4 h-4 shrink-0 text-sky-400" />
                {!isSidebarCollapsed && (
                  <>
                    <span className="flex-1">Workflow Builder</span>
                    <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Group 3: SYSTEM & TOOLS */}
          <div>
            {!isSidebarCollapsed && (
              <div className="px-3 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                SYSTEM & TOOLS
              </div>
            )}

            <div className="space-y-0.5">
              {/* Audit Trail & Activity */}
              <button
                onClick={() => setIsActivitySidebarOpen(true)}
                className="flex items-center gap-3 px-3 py-2 rounded text-xs text-gray-300 hover:bg-white/10 hover:text-white transition-colors w-full text-left"
                title="Live Audit Feed & Event Timeline"
              >
                <Activity className="w-4 h-4 shrink-0 text-emerald-400" />
                {!isSidebarCollapsed && (
                  <>
                    <span className="flex-1">Audit Trail Feed</span>
                    <span className="px-1.5 py-0.2 text-[10px] rounded-full bg-gray-700 text-gray-200 font-mono">
                      {activities.length}
                    </span>
                  </>
                )}
              </button>

              {/* Cloudflare Edge Deployment */}
              <button
                onClick={() => setIsCloudflareModalOpen(true)}
                className="flex items-center gap-3 px-3 py-2 rounded text-xs text-gray-300 hover:bg-white/10 hover:text-white transition-colors w-full text-left"
                title="Cloudflare Workers & Pages Architecture"
              >
                <Cloud className="w-4 h-4 shrink-0 text-amber-400" />
                {!isSidebarCollapsed && (
                  <>
                    <span className="flex-1">Cloudflare Edge</span>
                    <span className="text-[10px] text-amber-300 font-bold">Live</span>
                  </>
                )}
              </button>

              {/* RBAC Roles & Permissions */}
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="flex items-center gap-3 px-3 py-2 rounded text-xs text-gray-300 hover:bg-white/10 hover:text-white transition-colors w-full text-left"
                title="User Accounts & Role Permissions"
              >
                <Shield className="w-4 h-4 shrink-0 text-purple-400" />
                {!isSidebarCollapsed && <span className="flex-1">User Roles & RBAC</span>}
              </button>
            </div>
          </div>

        </div>

        {/* Sidebar Footer Info */}
        <div className="p-2 border-t border-[#4b545c] shrink-0 bg-[#2d3238]">
          <button
            onClick={() => logoutUser()}
            className="w-full flex items-center gap-3 px-3 py-2 rounded text-xs text-rose-300 hover:bg-rose-900/30 hover:text-rose-200 transition-colors text-left"
            title="Sign Out / Lock Session"
          >
            <LogOut className="w-4 h-4 shrink-0 text-rose-400" />
            {!isSidebarCollapsed && (
              <span className="font-semibold flex-1">Sign Out</span>
            )}
          </button>

          {!isSidebarCollapsed && (
            <div className="px-3 pt-2 pb-1 text-[10px] text-gray-400 flex items-center justify-between">
              <span>Uratex MIS</span>
              <span className="font-mono text-gray-500">v2.4.0</span>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
