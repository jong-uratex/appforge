import React, { useState } from 'react';
import { useAppForge } from '../../context/AppForgeContext';
import { Department, UserPersona, UserRole } from '../../types/appforge';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Layers,
  ShieldCheck,
  AlertCircle,
  Cloud,
  CheckCircle2,
  ArrowRight,
  UserPlus,
  Building2,
  Briefcase,
  KeyRound,
  Shield,
  Sparkles,
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

export const AdminLTELoginPage: React.FC = () => {
  const { users, currentUser, loginUser, loginAsPersona, registerUser } = useAppForge();

  const [mode, setMode] = useState<'signin' | 'register'>('signin');
  const [email, setEmail] = useState('jenor.ricafort@uratex.com.ph');
  const [password, setPassword] = useState('uratex2026');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  // Registration form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('uratex2026');
  const [regRole, setRegRole] = useState<UserRole>('Team Member');
  const [regDept, setRegDept] = useState<Department>('Management Information Systems (MIS)');
  const [regTitle, setRegTitle] = useState('');

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim()) {
      setErrorMessage('Please enter your Uratex corporate email address.');
      return;
    }

    const success = loginUser(email.trim(), password);
    if (!success) {
      setErrorMessage(
        'Account not found with that email. Please check your spelling or click one of the pre-configured demo personas below.'
      );
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!regName.trim() || !regEmail.trim()) {
      setErrorMessage('Please fill in your name and corporate email address.');
      return;
    }

    if (!regEmail.includes('@')) {
      setErrorMessage('Please provide a valid email address (e.g. name@uratex.com.ph).');
      return;
    }

    registerUser({
      name: regName.trim(),
      email: regEmail.trim(),
      role: regRole,
      department: regDept,
      title: regTitle.trim() || `${regRole} in ${regDept}`,
    });
  };

  const handleSelectPersona = (persona: UserPersona) => {
    setErrorMessage(null);
    loginAsPersona(persona);
  };

  return (
    <div className="min-h-screen bg-[#e9ecef] flex flex-col justify-center items-center py-8 px-4 font-sans select-none antialiased">
      
      {/* AdminLTE login-logo */}
      <div className="mb-4 text-center">
        <div className="inline-flex items-center justify-center gap-2 mb-1.5">
          <div className="w-10 h-10 rounded bg-blue-600 text-white flex items-center justify-center font-bold shadow-xs">
            <Layers className="w-6 h-6" />
          </div>
          <span className="text-2xl sm:text-3xl font-extrabold text-gray-800 tracking-tight">
            MIS <span className="font-light text-gray-600">AppForge</span>
          </span>
        </div>
        <p className="text-xs uppercase tracking-widest text-gray-500 font-semibold">
          Uratex Philippines · Multiflex RNC
        </p>
      </div>

      {/* AdminLTE login-box */}
      <div className="w-full max-w-[440px] bg-white rounded border border-gray-300 shadow-lg border-t-4 border-t-blue-600 overflow-hidden">
        
        {/* Navigation between Sign In and Registration */}
        <div className="flex border-b border-gray-200 bg-gray-50 text-xs font-semibold text-gray-600">
          <button
            type="button"
            onClick={() => {
              setMode('signin');
              setErrorMessage(null);
            }}
            className={`flex-1 py-3 px-4 text-center transition-colors border-b-2 ${
              mode === 'signin'
                ? 'border-blue-600 text-blue-700 bg-white font-bold'
                : 'border-transparent hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            Sign In to Session
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setErrorMessage(null);
            }}
            className={`flex-1 py-3 px-4 text-center transition-colors border-b-2 ${
              mode === 'register'
                ? 'border-blue-600 text-blue-700 bg-white font-bold'
                : 'border-transparent hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            Register New Account
          </button>
        </div>

        {/* Card Body */}
        <div className="p-6">
          
          {/* Error Banner */}
          {errorMessage && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded text-rose-800 text-xs flex items-start gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="leading-snug">{errorMessage}</div>
            </div>
          )}

          {/* SIGN IN FORM */}
          {mode === 'signin' ? (
            <form onSubmit={handleSignIn} className="space-y-4">
              <p className="text-xs text-gray-600 text-center font-medium">
                Enter your Uratex credentials to access project management and workflow pipelines
              </p>

              {/* Email Input Group */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Corporate Email
                </label>
                <div className="relative rounded border border-gray-300 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 bg-white flex items-center">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@uratex.com.ph"
                    className="w-full py-2 px-3 text-xs text-gray-800 focus:outline-none bg-transparent"
                  />
                  <div className="px-3 text-gray-400">
                    <Mail className="w-4 h-4" />
                  </div>
                </div>
              </div>

              {/* Password Input Group */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-gray-700">
                    Password
                  </label>
                  <span className="text-[11px] text-gray-400 font-mono">
                    Default: uratex2026
                  </span>
                </div>
                <div className="relative rounded border border-gray-300 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 bg-white flex items-center">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full py-2 px-3 text-xs text-gray-800 focus:outline-none bg-transparent font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="px-3 text-gray-400 hover:text-gray-600"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me & Sign In Button */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-600">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
                  />
                  <span>Remember Me</span>
                </label>

                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs rounded shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span>Sign In</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Divider */}
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-[10px] font-bold text-gray-400 tracking-wider">
                    Or Instant Sign In As
                  </span>
                </div>
              </div>

              {/* Quick Persona Logins */}
              <div className="space-y-2">
                {users.slice(0, 3).map((u) => {
                  return (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => handleSelectPersona(u)}
                      className="w-full p-2.5 rounded border border-gray-200 hover:border-blue-500 hover:bg-blue-50/40 text-left flex items-center justify-between gap-3 transition-colors group cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img
                          src={u.avatar}
                          alt={u.name}
                          className="w-8 h-8 rounded-full object-cover ring-1 ring-gray-300 shrink-0"
                          referrerPolicy="no-referrer"
                        />
                        <div className="min-w-0 truncate">
                          <div className="font-bold text-xs text-gray-800 group-hover:text-blue-700 truncate">
                            {u.name}
                          </div>
                          <div className="text-[10px] text-gray-500 truncate">
                            {u.title}
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span
                          className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            u.role === 'Admin'
                              ? 'bg-purple-100 text-purple-800'
                              : u.role === 'Project Manager'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {u.role}
                        </span>
                        <div className="text-[10px] text-blue-600 font-semibold group-hover:underline mt-0.5">
                          Log in →
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

            </form>
          ) : (
            /* REGISTRATION FORM */
            <form onSubmit={handleRegister} className="space-y-3.5">
              <p className="text-xs text-gray-600 text-center font-medium">
                Create a corporate account to submit initiatives and collaborate on tasks
              </p>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="e.g. Ramon Bautista"
                  className="w-full py-2 px-3 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Corporate Email
                </label>
                <input
                  type="email"
                  required
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="e.g. r.bautista@uratex.com.ph"
                  className="w-full py-2 px-3 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    System Role
                  </label>
                  <select
                    value={regRole}
                    onChange={(e) => setRegRole(e.target.value as UserRole)}
                    className="w-full py-2 px-2.5 text-xs border border-gray-300 rounded bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
                  >
                    <option value="Admin">Admin (Full Control)</option>
                    <option value="Project Manager">Project Manager</option>
                    <option value="Team Member">Team Member</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Department
                  </label>
                  <select
                    value={regDept}
                    onChange={(e) => setRegDept(e.target.value as Department)}
                    className="w-full py-2 px-2 text-xs border border-gray-300 rounded bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
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
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Job Title
                </label>
                <input
                  type="text"
                  value={regTitle}
                  onChange={(e) => setRegTitle(e.target.value)}
                  placeholder="e.g. Logistics Operations Analyst"
                  className="w-full py-2 px-3 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded shadow-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer mt-2"
              >
                <UserPlus className="w-4 h-4" />
                <span>Create Account & Sign In</span>
              </button>
            </form>
          )}

        </div>

        {/* Card Footer: Cloudflare Serverless badge */}
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 text-center flex items-center justify-center gap-2 text-[11px] text-gray-500 font-mono">
          <Cloud className="w-3.5 h-3.5 text-amber-600" />
          <span>Serverless Architecture on Cloudflare Edge</span>
        </div>

      </div>

      {/* AdminLTE Copyright & Security Disclaimer */}
      <div className="mt-6 text-center text-xs text-gray-500 space-y-1">
        <p>
          <strong>Copyright &copy; 2026 Uratex Philippines</strong> (Multiflex RNC Philippines, Inc.)
        </p>
        <p className="text-[11px] text-gray-400">
          Internal MIS Portal · Authorized Corporate Access Only
        </p>
      </div>

    </div>
  );
};
