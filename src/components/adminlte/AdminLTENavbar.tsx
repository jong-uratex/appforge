import React, { useState } from 'react';
import { useAppForge } from '../../context/AppForgeContext';
import {
  Menu,
  Search,
  Bell,
  Plus,
  Cloud,
  Shield,
  ChevronDown,
  X,
  FileText,
  LayoutDashboard,
  Table2,
  CheckSquare,
} from 'lucide-react';

interface AdminLTENavbarProps {
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: (collapsed: boolean | ((prev: boolean) => boolean)) => void;
  isMobileSidebarOpen: boolean;
  setIsMobileSidebarOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
}

export const AdminLTENavbar: React.FC<AdminLTENavbarProps> = ({
  isSidebarCollapsed,
  setIsSidebarCollapsed,
  isMobileSidebarOpen,
  setIsMobileSidebarOpen,
}) => {
  const {
    currentUser,
    permissions,
    activeView,
    setActiveView,
    searchQuery,
    setSearchQuery,
    activities,
    setIsNewRequestModalOpen,
    setIsCloudflareModalOpen,
    setIsAuthModalOpen,
    setIsActivitySidebarOpen,
    isActivitySidebarOpen,
    requests,
  } = useAppForge();

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-30 bg-white border-b border-gray-200 h-14 px-3 sm:px-4 flex items-center justify-between text-gray-700 shadow-xs select-none">
      {/* Left nav items: Pushmenu hamburger + Quick Links */}
      <div className="flex items-center gap-1 sm:gap-2">
        {/* Sidebar Toggle (PushMenu) */}
        <button
          onClick={() => {
            // On desktop toggle collapsed; on mobile toggle mobile sidebar
            if (window.innerWidth < 1024) {
              setIsMobileSidebarOpen((prev) => !prev);
            } else {
              setIsSidebarCollapsed((prev) => !prev);
            }
          }}
          className="p-2 rounded hover:bg-gray-100 text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
          title="Toggle Navigation Sidebar"
          aria-label="Toggle Sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* AdminLTE Navbar Quick Links */}
        <div className="hidden md:flex items-center gap-1 text-xs font-medium">
          <button
            onClick={() => setActiveView('dashboard')}
            className={`px-3 py-1.5 rounded transition-colors ${
              activeView === 'dashboard'
                ? 'bg-blue-50 text-blue-700 font-bold'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            Dashboard
          </button>

          <button
            onClick={() => setActiveView('board')}
            className={`px-3 py-1.5 rounded transition-colors flex items-center gap-1 ${
              activeView === 'board'
                ? 'bg-blue-50 text-blue-700 font-bold'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <span>Change Requests</span>
            <span className="px-1.5 py-0.2 text-[10px] bg-gray-200 text-gray-700 rounded-full font-mono">
              {requests.length}
            </span>
          </button>

          <button
            onClick={() => setActiveView('kanban')}
            className={`px-3 py-1.5 rounded transition-colors ${
              activeView === 'kanban'
                ? 'bg-blue-50 text-blue-700 font-bold'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            Kanban
          </button>

          <button
            onClick={() => setActiveView('tasks')}
            className={`px-3 py-1.5 rounded transition-colors ${
              activeView === 'tasks'
                ? 'bg-blue-50 text-blue-700 font-bold'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            Tasks
          </button>
        </div>
      </div>

      {/* Right navbar links: Search, Action, Cloudflare, Notifications, User */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Navbar Search Form */}
        <div className="relative flex items-center">
          <div className="hidden sm:flex items-center bg-gray-100 hover:bg-gray-200/80 rounded border border-gray-300 focus-within:border-blue-500 focus-within:bg-white focus-within:ring-1 focus-within:ring-blue-500 transition-all">
            <input
              type="text"
              placeholder="Search SCR code, title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="py-1 px-2.5 text-xs bg-transparent border-0 focus:outline-none w-36 lg:w-48 text-gray-800 placeholder-gray-400"
            />
            {searchQuery ? (
              <button
                onClick={() => setSearchQuery('')}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : (
              <span className="p-1 text-gray-400 pr-2">
                <Search className="w-3.5 h-3.5" />
              </span>
            )}
          </div>
        </div>

        {/* Primary Action Button: + New Request */}
        <button
          onClick={() => setIsNewRequestModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded shadow-xs transition-colors shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">New Request</span>
          <span className="sm:hidden">New</span>
        </button>

        {/* Cloudflare Edge Badge */}
        <button
          onClick={() => setIsCloudflareModalOpen(true)}
          className="hidden md:inline-flex items-center gap-1 px-2 py-1 text-[11px] font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded transition-colors"
          title="Cloudflare Serverless Architecture"
        >
          <Cloud className="w-3 h-3 text-amber-600" />
          <span>Cloudflare Edge</span>
        </button>

        {/* Notifications / Audit Bell */}
        <button
          onClick={() => setIsActivitySidebarOpen(!isActivitySidebarOpen)}
          className="relative p-2 rounded hover:bg-gray-100 text-gray-600 hover:text-gray-900 transition-colors"
          title="Audit Trail & Activities"
          aria-label="Audit Trail"
        >
          <Bell className="w-4 h-4" />
          {activities.length > 0 && (
            <span className="absolute top-1 right-1 px-1 py-0.2 text-[9px] font-bold bg-amber-500 text-white rounded-full leading-none">
              {activities.length}
            </span>
          )}
        </button>

        {/* User Account / RBAC Switcher */}
        <div className="relative">
          <button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="flex items-center gap-2 p-1 pl-1.5 rounded hover:bg-gray-100 border border-transparent hover:border-gray-200 transition-colors text-left"
          >
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-7 h-7 rounded-full object-cover ring-1 ring-gray-300"
              referrerPolicy="no-referrer"
            />
            <div className="hidden xl:block text-left">
              <div className="text-xs font-bold text-gray-800 leading-tight">
                {currentUser.name}
              </div>
              <div className="text-[10px] text-gray-500 font-medium leading-none">
                {currentUser.role}
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400 hidden sm:block" />
          </button>

          {/* User Dropdown Menu */}
          {isUserMenuOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsUserMenuOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50 text-xs animate-in fade-in zoom-in-95 duration-100">
                <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                  <p className="font-bold text-gray-900">{currentUser.name}</p>
                  <p className="text-[11px] text-gray-500">{currentUser.email}</p>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-blue-100 text-blue-800">
                      {currentUser.role}
                    </span>
                    <span className="text-[10px] text-gray-500">{currentUser.department}</span>
                  </div>
                </div>

                <div className="py-1">
                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      setIsAuthModalOpen(true);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-700 flex items-center gap-2"
                  >
                    <Shield className="w-3.5 h-3.5 text-purple-600" />
                    <span>Switch Role / User Account</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      setIsActivitySidebarOpen(true);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-700 flex items-center gap-2"
                  >
                    <Bell className="w-3.5 h-3.5 text-blue-600" />
                    <span>Activity Audit Feed ({activities.length})</span>
                  </button>
                </div>

                <div className="border-t border-gray-100 px-4 py-2 text-[10px] text-gray-400">
                  Uratex Philippines · Multiflex RNC
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};
