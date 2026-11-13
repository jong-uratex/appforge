import React, { useState, useEffect } from 'react';
import { useAppForge } from '../../context/AppForgeContext';
import { Department, UserRole } from '../../types/appforge';
import {
  X,
  Shield,
  AlertCircle,
  CheckCircle2,
  LogOut,
  User,
  KeyRound,
  Eye,
  EyeOff,
  Save,
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
    loginUser,
    registerUser,
    updateUserProfile,
    changeUserPassword,
    logoutUser,
  } = useAppForge();

  const [authMode, setAuthMode] = useState<'profile' | 'roles' | 'signin' | 'signup'>('profile');
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Profile edit state
  const [profName, setProfName] = useState(currentUser.name);
  const [profDept, setProfDept] = useState<Department>(currentUser.department);
  const [profTitle, setProfTitle] = useState(currentUser.title);
  const [profAvatar, setProfAvatar] = useState(currentUser.avatar);
  const [profRole, setProfRole] = useState<UserRole>(currentUser.role);
  const [profileFeedback, setProfileFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Password change state
  const [currPass, setCurrPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [passwordFeedback, setPasswordFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Sign up inputs
  const [nameInput, setNameInput] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [roleInput, setRoleInput] = useState<UserRole>('Team Member');
  const [deptInput, setDeptInput] = useState<Department>('Foam Plant & Production');
  const [titleInput, setTitleInput] = useState('');

  useEffect(() => {
    if (isAuthModalOpen) {
      setProfName(currentUser.name);
      setProfDept(currentUser.department);
      setProfTitle(currentUser.title);
      setProfAvatar(currentUser.avatar);
      setProfRole(currentUser.role);
      setProfileFeedback(null);
      setPasswordFeedback(null);
      setLoginError(null);
      setCurrPass('');
      setNewPass('');
      setConfirmPass('');
    }
  }, [isAuthModalOpen, currentUser]);

  if (!isAuthModalOpen) return null;

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileFeedback(null);
    setIsSavingProfile(true);
    const res = await updateUserProfile({
      name: profName,
      department: profDept,
      title: profTitle,
      avatar: profAvatar,
      role: currentUser.role === 'Admin' ? profRole : undefined,
    });
    setIsSavingProfile(false);

    if (res.success) {
      setProfileFeedback({
        type: 'success',
        text: 'Profile details updated and saved to Cloudflare D1.',
      });
    } else {
      setProfileFeedback({
        type: 'error',
        text: res.error || 'Failed to update profile details.',
      });
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordFeedback(null);

    if (newPass.length < 6) {
      setPasswordFeedback({
        type: 'error',
        text: 'New password must be at least 6 characters long.',
      });
      return;
    }

    if (newPass !== confirmPass) {
      setPasswordFeedback({
        type: 'error',
        text: 'New password and confirmation password do not match.',
      });
      return;
    }

    setIsChangingPassword(true);
    const res = await changeUserPassword(currPass, newPass);
    setIsChangingPassword(false);

    if (res.success) {
      setCurrPass('');
      setNewPass('');
      setConfirmPass('');
      setPasswordFeedback({
        type: 'success',
        text: 'Password updated successfully in Cloudflare D1.',
      });
    } else {
      setPasswordFeedback({
        type: 'error',
        text: res.error || 'Failed to update password.',
      });
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setIsSubmitting(true);
    const res = await loginUser(emailInput.trim(), passwordInput);
    setIsSubmitting(false);

    if (res.success) {
      setIsAuthModalOpen(false);
    } else {
      setLoginError(res.error || 'Invalid corporate email or password.');
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput.trim() || !regEmail.trim()) return;
    setLoginError(null);
    setIsSubmitting(true);

    const res = await registerUser({
      name: nameInput.trim(),
      email: regEmail.trim(),
      password: regPassword || undefined,
      role: roleInput,
      department: deptInput,
      title: titleInput.trim() || `${roleInput} in ${deptInput}`,
    });
    setIsSubmitting(false);

    if (res.success) {
      setIsAuthModalOpen(false);
    } else {
      setLoginError(res.error || 'Unable to register account.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Profile, Password & Role-Based Access (RBAC)
              </h3>
              <p className="text-[11px] text-slate-500">
                Active user: <strong className="text-slate-800">{currentUser.name}</strong> ({currentUser.role})
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
        <div className="flex items-center gap-1 px-6 border-b border-slate-200 bg-white text-xs font-semibold text-slate-600 overflow-x-auto">
          <button
            onClick={() => setAuthMode('profile')}
            className={`py-3 px-3 border-b-2 transition-colors shrink-0 ${
              authMode === 'profile'
                ? 'border-blue-600 text-blue-700 font-bold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            My Profile & Password
          </button>
          <button
            onClick={() => setAuthMode('roles')}
            className={`py-3 px-3 border-b-2 transition-colors shrink-0 ${
              authMode === 'roles'
                ? 'border-blue-600 text-blue-700 font-bold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            Role Permission Matrix
          </button>
          <button
            onClick={() => {
              setAuthMode('signin');
              setLoginError(null);
            }}
            className={`py-3 px-3 border-b-2 transition-colors shrink-0 ${
              authMode === 'signin'
                ? 'border-blue-600 text-blue-700 font-bold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            Switch Account
          </button>
          <button
            onClick={() => {
              setAuthMode('signup');
              setLoginError(null);
            }}
            className={`py-3 px-3 border-b-2 transition-colors shrink-0 ${
              authMode === 'signup'
                ? 'border-blue-600 text-blue-700 font-bold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            Register New User
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 space-y-5 text-xs text-slate-700 max-h-[75vh] overflow-y-auto">
          
          {/* TAB 1: MY PROFILE & CHANGE PASSWORD */}
          {authMode === 'profile' && (
            <div className="space-y-5">
              {/* Profile Details Section */}
              <form onSubmit={handleSaveProfile} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3.5">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
                  <div className="flex items-center gap-2 font-bold text-slate-900">
                    <User className="w-4 h-4 text-blue-600" />
                    <span>Profile Details</span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-500">{currentUser.email}</span>
                </div>

                {profileFeedback && (
                  <div
                    className={`p-2.5 rounded-lg border text-xs flex items-center gap-2 ${
                      profileFeedback.type === 'success'
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                        : 'bg-rose-50 border-rose-200 text-rose-700'
                    }`}
                  >
                    {profileFeedback.type === 'success' ? (
                      <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                    ) : (
                      <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                    )}
                    <span>{profileFeedback.text}</span>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <img
                    src={profAvatar || currentUser.avatar}
                    alt={profName}
                    className="w-12 h-12 rounded-full object-cover ring-2 ring-blue-100 shrink-0 bg-white"
                    referrerPolicy="no-referrer"
                  />
                  <div className="flex-1">
                    <label className="block font-bold text-slate-800 mb-1">Avatar Image URL</label>
                    <input
                      type="url"
                      value={profAvatar}
                      onChange={(e) => setProfAvatar(e.target.value)}
                      placeholder="https://..."
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-900 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-800 mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      value={profName}
                      onChange={(e) => setProfName(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-800 mb-1">Job Title</label>
                    <input
                      type="text"
                      required
                      value={profTitle}
                      onChange={(e) => setProfTitle(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-800 mb-1">Department</label>
                    <select
                      value={profDept}
                      onChange={(e) => setProfDept(e.target.value as Department)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      {DEPARTMENTS.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-800 mb-1">RBAC Role</label>
                    {currentUser.role === 'Admin' ? (
                      <select
                        value={profRole}
                        onChange={(e) => setProfRole(e.target.value as UserRole)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="Admin">Admin</option>
                        <option value="Project Manager">Project Manager</option>
                        <option value="Team Member">Team Member</option>
                      </select>
                    ) : (
                      <div className="px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-slate-700 font-semibold">
                        {currentUser.role} (Managed by Admin)
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="submit"
                    disabled={isSavingProfile}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-xs transition-colors disabled:opacity-60"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{isSavingProfile ? 'Saving Profile...' : 'Save Profile Changes'}</span>
                  </button>
                </div>
              </form>

              {/* Change Password Section */}
              <form onSubmit={handleChangePassword} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
                  <div className="flex items-center gap-2 font-bold text-slate-900">
                    <KeyRound className="w-4 h-4 text-amber-600" />
                    <span>Change Password</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowPasswords((p) => !p)}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-slate-800"
                  >
                    {showPasswords ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    <span>{showPasswords ? 'Hide' : 'Show'}</span>
                  </button>
                </div>

                {passwordFeedback && (
                  <div
                    className={`p-2.5 rounded-lg border text-xs flex items-center gap-2 ${
                      passwordFeedback.type === 'success'
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                        : 'bg-rose-50 border-rose-200 text-rose-700'
                    }`}
                  >
                    {passwordFeedback.type === 'success' ? (
                      <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                    ) : (
                      <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                    )}
                    <span>{passwordFeedback.text}</span>
                  </div>
                )}

                <div>
                  <label className="block font-bold text-slate-800 mb-1">Current Password</label>
                  <input
                    type={showPasswords ? 'text' : 'password'}
                    required
                    placeholder="Enter your current password"
                    value={currPass}
                    onChange={(e) => setCurrPass(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-800 mb-1">New Password (min 6 chars)</label>
                    <input
                      type={showPasswords ? 'text' : 'password'}
                      required
                      minLength={6}
                      placeholder="New password"
                      value={newPass}
                      onChange={(e) => setNewPass(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-800 mb-1">Confirm New Password</label>
                    <input
                      type={showPasswords ? 'text' : 'password'}
                      required
                      minLength={6}
                      placeholder="Confirm new password"
                      value={confirmPass}
                      onChange={(e) => setConfirmPass(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      logoutUser();
                      setIsAuthModalOpen(false);
                    }}
                    className="px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg flex items-center gap-1.5 transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5 text-rose-600" />
                    <span>Sign Out</span>
                  </button>

                  <button
                    type="submit"
                    disabled={isChangingPassword}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg shadow-xs transition-colors disabled:opacity-60"
                  >
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>{isChangingPassword ? 'Updating...' : 'Update Password'}</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 2: SIGN IN / SWITCH */}
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
                    placeholder="••••••••"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-xs transition-colors disabled:opacity-60"
                >
                  {isSubmitting ? 'Verifying Credentials...' : 'Sign In with Cloudflare D1 Auth'}
                </button>
              </form>

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
          )}

          {/* TAB 2: SIGN UP */}
          {authMode === 'signup' && (
            <form onSubmit={handleSignUp} className="space-y-3">
              {loginError && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{loginError}</span>
                </div>
              )}

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

              <div>
                <label className="block font-bold text-slate-800 mb-1">Password</label>
                <input
                  type="password"
                  required
                  placeholder="Create password"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
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
                disabled={isSubmitting}
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-xs transition-colors mt-2 disabled:opacity-60"
              >
                {isSubmitting ? 'Saving to Cloudflare D1...' : 'Create Account & Sign In'}
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
