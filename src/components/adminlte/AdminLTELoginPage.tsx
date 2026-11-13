import React, { useState } from 'react';
import { useAppForge } from '../../context/AppForgeContext';
import {
  Mail,
  Eye,
  EyeOff,
  Layers,
  AlertCircle,
  Cloud,
  ArrowRight,
  Lock,
} from 'lucide-react';

export const AdminLTELoginPage: React.FC = () => {
  const { loginUser } = useAppForge();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim()) {
      setErrorMessage('Please enter your Uratex corporate email address.');
      return;
    }

    setIsSubmitting(true);
    const res = await loginUser(email.trim(), password);
    setIsSubmitting(false);

    if (!res.success) {
      setErrorMessage(
        res.error || 'No account found with that email address. Please verify your corporate credentials.'
      );
    }
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
          Uratex Internal App Request System
        </p>
      </div>

      {/* AdminLTE login-box */}
      <div className="w-full max-w-[420px] bg-white rounded border border-gray-300 shadow-lg border-t-4 border-t-blue-600 overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-3.5 border-b border-gray-200 bg-gray-50 flex items-center justify-center gap-2 text-xs font-bold text-gray-700 uppercase tracking-wider">
          <Lock className="w-3.5 h-3.5 text-blue-600" />
          <span>Sign In to Session</span>
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
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Password
              </label>
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

            {/* Sign In Button */}
            <div className="flex items-center justify-end pt-1">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 px-5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs rounded shadow-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-60"
              >
                <span>{isSubmitting ? 'Verifying with Cloudflare D1...' : 'Sign In'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>

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
