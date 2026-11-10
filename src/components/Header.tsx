import React from 'react';
import { useAppForge } from '../context/AppForgeContext';
import {
  Plus,
  Cloud,
  ChevronDown,
  Layers,
  Shield,
  GitFork,
  Activity,
} from 'lucide-react';

export const Header: React.FC = () => {
  const {
    currentUser,
    permissions,
    setIsNewRequestModalOpen,
    setIsCloudflareModalOpen,
    setIsAuthModalOpen,
    setIsWorkflowModalOpen,
    activities,
    isActivitySidebarOpen,
    setIsActivitySidebarOpen,
  } = useAppForge();

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Zone 1: Brand Wordmark (Single text element wordmark as per Top Bar Contract) */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-lg bg-blue-700 flex items-center justify-center text-white shadow-sm font-bold text-base tracking-wider">
              <Layers className="w-5 h-5 text-blue-100" />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold text-slate-900 tracking-tight whitespace-nowrap">
                MIS AppForge
              </span>
              <span className="text-[11px] font-medium text-slate-500 tracking-wide uppercase">
                Uratex Philippines SDLC
              </span>
            </div>
          </div>

          {/* Zone 2: Navigation Links (Clean single-line prose links) */}
          <nav className="hidden md:flex items-center gap-5 text-xs font-semibold text-slate-600">
            {permissions.canEditWorkflows && (
              <button
                onClick={() => setIsWorkflowModalOpen(true)}
                className="flex items-center gap-1.5 hover:text-slate-900 transition-colors whitespace-nowrap"
              >
                <GitFork className="w-3.5 h-3.5 text-indigo-600" />
                <span>Workflow Builder</span>
              </button>
            )}

            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="flex items-center gap-1.5 hover:text-slate-900 transition-colors whitespace-nowrap"
            >
              <Shield className="w-3.5 h-3.5 text-purple-600" />
              <span>RBAC Roles & Auth</span>
            </button>

            <button
              onClick={() => setIsActivitySidebarOpen(true)}
              className="flex items-center gap-1.5 hover:text-slate-900 transition-colors whitespace-nowrap"
            >
              <Activity className="w-3.5 h-3.5 text-emerald-600" />
              <span>Audit Trail</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-600 font-mono font-medium">
                {activities.length}
              </span>
            </button>

            <span className="text-slate-300">·</span>
            <span className="text-slate-400">Cloudflare Edge Architecture</span>
          </nav>

          {/* Zone 3: Primary Actions & User Auth */}
          <div className="flex items-center gap-2.5 shrink-0">
            {/* Activity Feed Toggle Button */}
            <button
              onClick={() => setIsActivitySidebarOpen(!isActivitySidebarOpen)}
              className={`relative inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap border ${
                isActivitySidebarOpen
                  ? 'bg-blue-50 text-blue-700 border-blue-300'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
              title="Toggle Audit Trail & Activity Feed"
            >
              <Activity className="w-3.5 h-3.5 text-blue-600" />
              <span className="hidden sm:inline">Activity Feed</span>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-blue-100 text-blue-800 font-mono">
                {activities.length}
              </span>
            </button>

            {/* Cloudflare Edge Inspector */}
            <button
              onClick={() => setIsCloudflareModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap"
              title="Inspect Cloudflare Pages & Workers Serverless Setup"
            >
              <Cloud className="w-3.5 h-3.5 text-amber-600" />
              <span className="hidden sm:inline">Cloudflare Edge</span>
            </button>

            {/* User Account / RBAC Switcher Button */}
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="flex items-center gap-2 p-1.5 pr-2.5 rounded-lg border border-slate-200 hover:border-slate-300 bg-white text-left transition-colors"
              title="Click to sign in, register, or change user role"
            >
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-6 h-6 rounded-full object-cover ring-1 ring-slate-200"
                referrerPolicy="no-referrer"
              />
              <div className="hidden lg:block text-left">
                <div className="text-xs font-semibold text-slate-800 leading-tight flex items-center gap-1.5">
                  <span className="truncate max-w-[110px]">{currentUser.name}</span>
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                      currentUser.role === 'Admin'
                        ? 'bg-purple-100 text-purple-800'
                        : currentUser.role === 'Project Manager'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {currentUser.role}
                  </span>
                </div>
                <div className="text-[10px] text-slate-500 truncate max-w-[140px]">
                  {currentUser.title}
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {/* Primary Action Button (The single primary CTA of Top Bar Contract) */}
            <button
              onClick={() => setIsNewRequestModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-all whitespace-nowrap shrink-0 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>New App Request</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
