import React, { useState } from 'react';
import { useAppForge } from '../../context/AppForgeContext';
import { Department, UserRole } from '../../types/appforge';
import {
  X,
  User,
  Shield,
  KeyRound,
  CheckCircle2,
  Lock,
  UserCheck,
  Building2,
  Briefcase,
  AlertCircle,
  LogOut,
} from 'lucide-react';

const DEPARTMENTS: Department[] = [
  'Management Information Systems (MIS)',
  'Foam Plant & Production',
  'Sales & Logistics',
  'Supply Chain & Procurement',
  'Automotive & Plastics Division',
  'Human Resources & Admin',
  'Finance & Accounting',
  'Quality Assurance & R&D',
];

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    setIsAuthModalOpen,
    currentUser,
    users,
    setActivePersona,
    loginUser,
    registerUser,
    permissions,
    logoutUser,
  } = useAppForge();

  const [authMode, setAuthMode] = useState<'signin' | 'signup' | 'roles'>('signin');
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('uratex2026');
  const [loginError, setLoginError] = useState<string | null>(null);

  // Sign up inputs
  const [nameInput, setNameInput] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [roleInput, setRoleInput] = useState<UserRole>('Team Member');
  const [deptInput, setDeptInput] = useState<Department>('Foam Plant & Production');
  const [titleInput, setTitleInput] = useState('');

  if (!isAuthModalOpen) return null;

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    const ok = loginUser(emailInput.trim());
    if (ok) {
      setLoginError(null);
      setIsAuthModalOpen(false);
    } else {
      setLoginError('No user account found with that email. Try one of the demo users below.');
    }
  };

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput.trim() || !regEmail.trim()) return;

    registerUser({
      name: nameInput.trim(),
      email: regEmail.trim(),
      role: roleInput,
      department: deptInput,
      title: titleInput.trim() || `${roleInput} in ${deptInput}`,
    });

    setIsAuthModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Uratex Authentication & Role-Based Access
              </h3>
              <p className="text-[11px] text-slate-500">
                Current active user: <strong className="text-slate-800">{currentUser.name}</strong> ({currentUser.role})
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsAuthModalOpen(false)}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center gap-1 px-6 border-b border-slate-200 bg-white text-xs font-semibold text-slate-600">
          <button
            onClick={() => setAuthMode('signin')}
            className={`py-3 px-3 border-b-2 transition-colors ${
              authMode === 'signin'
                ? 'border-blue-600 text-blue-700 font-bold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            Sign In / Switch Account
          </button>
          <button
            onClick={() => setAuthMode('signup')}
            className={`py-3 px-3 border-b-2 transition-colors ${
              authMode === 'signup'
                ? 'border-blue-600 text-blue-700 font-bold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            Register New User
          </button>
          <button
            onClick={() => setAuthMode('roles')}
            className={`py-3 px-3 border-b-2 transition-colors ${
              authMode === 'roles'
                ? 'border-blue-600 text-blue-700 font-bold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            Role Permission Matrix
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 space-y-4 text-xs text-slate-700">
          
          {/* TAB 1: SIGN IN / SWITCH */}
          {authMode === 'signin' && (
            <div className="space-y-4">
              <form onSubmit={handleSignIn} className="space-y-3">
                {loginError && (
                  <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{loginError}</span>
                  </div>
                )}

                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    Corporate Email (@uratex.com.ph)
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. jenor.ricafort@uratex.com.ph"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">Password</label>
                  <input
                    type="password"
                    required
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-xs transition-colors"
                >
                  Sign In with Cloudflare Edge Auth
                </button>
              </form>

              {/* Quick Persona Switcher for Evaluation */}
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  One-Click Persona Login (Demo Accounts)
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {users.map((u) => (
                    <button
                      key={u.id}
                      onClick={() => {
                        setActivePersona(u);
                        setIsAuthModalOpen(false);
                      }}
                      className={`p-2 rounded-lg border text-left flex items-center gap-2.5 transition-all ${
                        currentUser.id === u.id
                          ? 'border-blue-600 bg-blue-50/70 text-blue-900 font-semibold ring-1 ring-blue-500'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <img
                        src={u.avatar}
                        alt={u.name}
                        className="w-7 h-7 rounded-full object-cover shrink-0 ring-1 ring-slate-200"
                        referrerPolicy="no-referrer"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="font-bold text-xs truncate">{u.name}</div>
                        <div className="text-[10px] text-slate-500 flex items-center justify-between">
                          <span className="truncate">{u.role}</span>
                          <span
                            className={`px-1 rounded text-[9px] font-bold ${
                              u.role === 'Admin'
                                ? 'bg-purple-100 text-purple-800'
                                : u.role === 'Project Manager'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {u.role}
                          </span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>

                <div className="pt-3 border-t border-slate-100 flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      logoutUser();
                      setIsAuthModalOpen(false);
                    }}
                    className="px-3.5 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg flex items-center gap-1.5 transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5 text-rose-600" />
                    <span>Log Out (Lock Session)</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SIGN UP */}
          {authMode === 'signup' && (
            <form onSubmit={handleSignUp} className="space-y-3">
              <div>
                <label className="block font-bold text-slate-800 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Maria Clara Santos"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Corporate Email</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. m.santos@uratex.com.ph"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Assigned Role</label>
                  <select
                    value={roleInput}
                    onChange={(e) => setRoleInput(e.target.value as UserRole)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="Admin">Admin (Full Control)</option>
                    <option value="Project Manager">Project Manager (Approver)</option>
                    <option value="Team Member">Team Member (Task Execution)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">Department</label>
                  <select
                    value={deptInput}
                    onChange={(e) => setDeptInput(e.target.value as Department)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    {DEPARTMENTS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Job Title</label>
                <input
                  type="text"
                  placeholder="e.g. Senior Production Systems Specialist"
                  value={titleInput}
                  onChange={(e) => setTitleInput(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-xs transition-colors mt-2"
              >
                Create Account & Sign In
              </button>
            </form>
          )}

          {/* TAB 3: ROLE PERMISSION MATRIX */}
          {authMode === 'roles' && (
            <div className="space-y-3">
              <div className="text-xs text-slate-600">
                RBAC permissions matrix enforced across MIS AppForge:
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase">
                      <th className="p-2.5">Capability / Permission</th>
                      <th className="p-2.5 text-center">Admin</th>
                      <th className="p-2.5 text-center">Project Manager</th>
                      <th className="p-2.5 text-center">Team Member</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="p-2.5 font-medium text-slate-800">Create Initiatives & Requests</td>
                      <td className="p-2.5 text-center font-bold text-emerald-600">✓</td>
                      <td className="p-2.5 text-center font-bold text-emerald-600">✓</td>
                      <td className="p-2.5 text-center font-bold text-emerald-600">✓</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-medium text-slate-800">Create & Assign Tasks</td>
                      <td className="p-2.5 text-center font-bold text-emerald-600">✓</td>
                      <td className="p-2.5 text-center font-bold text-emerald-600">✓</td>
                      <td className="p-2.5 text-center font-bold text-emerald-600">✓</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-medium text-slate-800">Approve SDLC Stage Gates & UAT</td>
                      <td className="p-2.5 text-center font-bold text-emerald-600">✓</td>
                      <td className="p-2.5 text-center font-bold text-emerald-600">✓</td>
                      <td className="p-2.5 text-center text-slate-300">—</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-medium text-slate-800">Create & Customize Workflows</td>
                      <td className="p-2.5 text-center font-bold text-emerald-600">✓</td>
                      <td className="p-2.5 text-center text-slate-300">—</td>
                      <td className="p-2.5 text-center text-slate-300">—</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-medium text-slate-800">Delete Projects & Full Purge</td>
                      <td className="p-2.5 text-center font-bold text-emerald-600">✓</td>
                      <td className="p-2.5 text-center text-slate-300">—</td>
                      <td className="p-2.5 text-center text-slate-300">—</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-medium text-slate-800">Manage Users & Roles</td>
                      <td className="p-2.5 text-center font-bold text-emerald-600">✓</td>
                      <td className="p-2.5 text-center text-slate-300">—</td>
                      <td className="p-2.5 text-center text-slate-300">—</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="p-3 bg-purple-50 text-purple-900 border border-purple-200 rounded-lg text-[11px] leading-relaxed">
                <strong>Current Active User:</strong> {currentUser.name} ({currentUser.role}).{' '}
                {currentUser.role === 'Admin'
                  ? 'You currently have Administrator access and can customize workflows and approve all gates.'
                  : currentUser.role === 'Project Manager'
                  ? 'You currently have Project Manager access and can create initiatives, assign tasks, and approve gates.'
                  : 'You have Team Member access for task completion, updates, and time logging.'}
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
