import React, { useState } from 'react';
import { AppForgeProvider, useAppForge } from './context/AppForgeContext';
import { AdminLTESidebar } from './components/adminlte/AdminLTESidebar';
import { AdminLTENavbar } from './components/adminlte/AdminLTENavbar';
import { AdminLTEContentHeader } from './components/adminlte/AdminLTEContentHeader';
import { AdminLTEFooter } from './components/adminlte/AdminLTEFooter';
import { BoardView } from './components/views/BoardView';
import { KanbanView } from './components/views/KanbanView';
import { TimelineView } from './components/views/TimelineView';
import { TaskManagementView } from './components/views/TaskManagementView';
import { DashboardView } from './components/views/DashboardView';
import { RequestDetailDrawer } from './components/modals/RequestDetailDrawer';
import { NewRequestModal } from './components/modals/NewRequestModal';
import { CloudflareDeployModal } from './components/modals/CloudflareDeployModal';
import { AuthModal } from './components/modals/AuthModal';
import { WorkflowBuilderModal } from './components/modals/WorkflowBuilderModal';
import { NewTaskModal } from './components/modals/NewTaskModal';
import { ActivityFeedSidebar } from './components/sidebar/ActivityFeedSidebar';
import { Activity } from 'lucide-react';

const AdminLTEAppLayout: React.FC = () => {
  const { activeView, isActivitySidebarOpen, setIsActivitySidebarOpen, activities } = useAppForge();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-[#f4f6f9] text-gray-900 font-sans antialiased">
      {/* AdminLTE Dark Main Sidebar */}
      <AdminLTESidebar
        isSidebarCollapsed={isSidebarCollapsed}
        setIsSidebarCollapsed={setIsSidebarCollapsed}
        isMobileSidebarOpen={isMobileSidebarOpen}
        setIsMobileSidebarOpen={setIsMobileSidebarOpen}
      />

      {/* AdminLTE Content Wrapper */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-200 ease-in-out ${
          isSidebarCollapsed ? 'lg:pl-16' : 'lg:pl-64'
        }`}
      >
        {/* Top Navbar */}
        <AdminLTENavbar
          isSidebarCollapsed={isSidebarCollapsed}
          setIsSidebarCollapsed={setIsSidebarCollapsed}
          isMobileSidebarOpen={isMobileSidebarOpen}
          setIsMobileSidebarOpen={setIsMobileSidebarOpen}
        />

        {/* Content Header (Title + Breadcrumb) */}
        <AdminLTEContentHeader />

        {/* Main Content Area */}
        <main className="flex-1">
          {activeView === 'dashboard' && <DashboardView />}
          {activeView === 'board' && <BoardView />}
          {activeView === 'kanban' && <KanbanView />}
          {activeView === 'tasks' && <TaskManagementView />}
          {activeView === 'timeline' && <TimelineView />}
        </main>

        {/* AdminLTE Sticky Bottom Footer */}
        <AdminLTEFooter />
      </div>

      {/* Global Modals & Drawers */}
      <RequestDetailDrawer />
      <NewRequestModal />
      <CloudflareDeployModal />
      <AuthModal />
      <WorkflowBuilderModal />
      <NewTaskModal />
      <ActivityFeedSidebar />

      {/* Floating edge trigger for Activity Audit Feed */}
      {!isActivitySidebarOpen && (
        <button
          onClick={() => setIsActivitySidebarOpen(true)}
          className="fixed right-0 top-1/2 -translate-y-1/2 z-40 bg-blue-600 hover:bg-blue-700 text-white py-3 px-1.5 rounded-l shadow-md flex flex-col items-center gap-1.5 transition-transform hover:scale-105 group cursor-pointer"
          title="Open Activity Audit Feed"
          aria-label="Open Activity Audit Feed"
        >
          <Activity className="w-4 h-4 animate-pulse" />
          <span className="text-[10px] font-bold uppercase tracking-widest [writing-mode:vertical-rl] rotate-180">
            Audit Feed
          </span>
          <span className="text-[9px] font-bold bg-blue-800 px-1 py-0.5 rounded text-blue-100">
            {activities.length}
          </span>
        </button>
      )}
    </div>
  );
};

export default function App() {
  return (
    <AppForgeProvider>
      <AdminLTEAppLayout />
    </AppForgeProvider>
  );
}
