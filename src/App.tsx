import React from 'react';
import { AppForgeProvider, useAppForge } from './context/AppForgeContext';
import { Header } from './components/Header';
import { ViewSwitcher } from './components/ViewSwitcher';
import { BoardView } from './components/views/BoardView';
import { KanbanView } from './components/views/KanbanView';
import { TimelineView } from './components/views/TimelineView';
import { TaskManagementView } from './components/views/TaskManagementView';
import { DashboardView } from './components/views/DashboardView';
import { SDLCGateMatrixView } from './components/views/SDLCGateMatrixView';
import { SCRDocumentView } from './components/scr/SCRDocumentView';
import { RequestDetailDrawer } from './components/modals/RequestDetailDrawer';
import { NewRequestModal } from './components/modals/NewRequestModal';
import { CloudflareDeployModal } from './components/modals/CloudflareDeployModal';
import { AuthModal } from './components/modals/AuthModal';
import { WorkflowBuilderModal } from './components/modals/WorkflowBuilderModal';
import { NewTaskModal } from './components/modals/NewTaskModal';
import { ActivityFeedSidebar } from './components/sidebar/ActivityFeedSidebar';
import { Activity } from 'lucide-react';

const MainContent: React.FC = () => {
  const { activeView, isActivitySidebarOpen, setIsActivitySidebarOpen, activities } = useAppForge();

  return (
    <main className="flex-1 pb-16">
      {activeView === 'scr-document' && <SCRDocumentView />}
      {activeView === 'board' && <BoardView />}
      {activeView === 'kanban' && <KanbanView />}
      {activeView === 'timeline' && <TimelineView />}
      {activeView === 'tasks' && <TaskManagementView />}
      {activeView === 'dashboard' && <DashboardView />}
      {activeView === 'sdlc-matrix' && <SDLCGateMatrixView />}

      {/* Global Modals & Drawers */}
      <RequestDetailDrawer />
      <NewRequestModal />
      <CloudflareDeployModal />
      <AuthModal />
      <WorkflowBuilderModal />
      <NewTaskModal />
      <ActivityFeedSidebar />

      {/* Floating edge trigger for Activity Feed */}
      {!isActivitySidebarOpen && (
        <button
          onClick={() => setIsActivitySidebarOpen(true)}
          className="fixed right-0 top-1/2 -translate-y-1/2 z-40 bg-blue-600 hover:bg-blue-700 text-white py-3 px-1.5 rounded-l-md shadow-lg flex flex-col items-center gap-1.5 transition-transform hover:scale-105 group cursor-pointer"
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
    </main>
  );
};

export default function App() {
  return (
    <AppForgeProvider>
      <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
        <Header />
        <ViewSwitcher />
        <MainContent />

        {/* Quiet Enterprise Footer */}
        <footer className="border-t border-slate-200 bg-white py-6 mt-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-700">MIS AppForge</span>
              <span>·</span>
              <span>Uratex Philippines (Multiflex RNC Philippines, Inc.)</span>
            </div>
            <div className="flex items-center gap-4 text-[11px]">
              <span>Custom Workflow Builder</span>
              <span>·</span>
              <span>RBAC Roles & Permissions</span>
              <span>·</span>
              <span>Cloudflare Serverless Platform</span>
            </div>
          </div>
        </footer>
      </div>
    </AppForgeProvider>
  );
}
