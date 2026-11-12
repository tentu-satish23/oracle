import React, { useState } from 'react';
import { Coffee, Eye, EyeOff, Lock, Mail, User as UserIcon, ArrowRight, ArrowLeft, ShieldCheck, CheckCircle2, Sparkles, Terminal, Code2 } from 'lucide-react';
import { api } from '../../services/api';
import { User } from '../../types';
import { useTheme } from '../../context/ThemeContext';

interface AuthPageProps {
  onAuthSuccess: (user: User) => void;
  onReplayIntro?: () => void;
  onBackToLanding?: () => void;
  initialMode?: 'login' | 'signup' | 'forgot' | 'reset';
  initialResetToken?: string | null;
}

export const AuthPage: React.FC<AuthPageProps> = ({
  onAuthSuccess,
  onReplayIntro,
  onBackToLanding,
  initialMode = 'login',
  initialResetToken = null
}) => {
  const { isDark } = useTheme();
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot' | 'reset'>(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  // Signup form state
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreedTerms, setAgreedTerms] = useState(false);

  // Forgot password & Reset password state
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSuccessMessage, setForgotSuccessMessage] = useState<string | null>(null);
  const [dispatchedResetLink, setDispatchedResetLink] = useState<string | null>(null);
  const [isDelivered, setIsDelivered] = useState<boolean>(false);
  const [needsSmtpConfig, setNeedsSmtpConfig] = useState<boolean>(false);
  const [resetToken, setResetToken] = useState<string>(initialResetToken || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  // Calculate password strength
  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return { score: 0, text: 'None', color: 'bg-gray-700' };
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;

    if (score <= 1) return { score: 1, text: 'Weak', color: 'bg-red-500' };
    if (score === 2) return { score: 2, text: 'Fair', color: 'bg-amber-500' };
    if (score === 3) return { score: 3, text: 'Good', color: 'bg-blue-500' };
    return { score: 4, text: 'Strong', color: 'bg-[#22C55E]' };
  };

  const pwdStrength = getPasswordStrength(signupPassword);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!loginEmail || !loginPassword) {
      setError('Please provide your email and password');
      return;
    }

    try {
      setLoading(true);
      const res = await api.login(loginEmail, loginPassword);
      localStorage.setItem('oracle_user', JSON.stringify(res.user));
      localStorage.setItem('oracle_token', res.token);
      onAuthSuccess(res.user);
    } catch (err: any) {
      setError(err.message || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!fullName || !username || !signupEmail || !signupPassword) {
      setError('All fields are required');
      return;
    }

    if (signupPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!agreedTerms) {
      setError('Please accept the Terms & Conditions to proceed');
      return;
    }

    try {
      setLoading(true);
      const res = await api.signup({
        fullName,
        username,
        email: signupEmail,
        password: signupPassword
      });
      localStorage.setItem('oracle_user', JSON.stringify(res.user));
      localStorage.setItem('oracle_token', res.token);
      onAuthSuccess(res.user);
    } catch (err: any) {
      setError(err.message || 'Signup failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.demoLogin();
      localStorage.setItem('oracle_user', JSON.stringify(res.user));
      localStorage.setItem('oracle_token', res.token);
      onAuthSuccess(res.user);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setForgotSuccessMessage(null);
    setDispatchedResetLink(null);

    if (!forgotEmail || !forgotEmail.trim()) {
      setError('Please enter your registered email address.');
      return;
    }

    try {
      setLoading(true);
      const res = await api.forgotPassword(forgotEmail.trim());
      setForgotSuccessMessage(res.message);
      setIsDelivered(!!res.delivered);
      setNeedsSmtpConfig(!!res.needsSmtpConfig);
      if (res.resetLink) {
        setDispatchedResetLink(res.resetLink);
        // Extract token for easy 1-click continuation
        const parsed = new URL(res.resetLink);
        const t = parsed.searchParams.get('resetToken');
        if (t) setResetToken(t);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to dispatch password reset link.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!resetToken) {
      setError('Password reset token is missing or invalid.');
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setError('New passwords do not match.');
      return;
    }

    try {
      setLoading(true);
      const res = await api.resetPassword({ token: resetToken, newPassword });
      setSuccessMessage(res.message);
      setMode('login');
      if (forgotEmail) setLoginEmail(forgotEmail);
    } catch (err: any) {
      setError(err.message || 'Failed to update password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex flex-col justify-center relative overflow-hidden py-8 transition-colors duration-200 ${
      isDark ? 'bg-[#0B1120] text-[#F8FAFC]' : 'bg-[#F5F7FA] text-[#172033]'
    }`}>
      {/* Background glow effects */}
      <div className={`absolute top-0 right-1/4 w-96 h-96 rounded-full blur-[120px] pointer-events-none ${
        isDark ? 'bg-[#F89820]/10' : 'bg-[#F89820]/5'
      }`} />
      <div className={`absolute bottom-0 left-1/4 w-96 h-96 rounded-full blur-[140px] pointer-events-none ${
        isDark ? 'bg-[#3B82F6]/10' : 'bg-[#3B82F6]/5'
      }`} />

      {/* Back to Landing Page Header */}
      {onBackToLanding && (
        <div className="max-w-6xl w-full mx-auto px-4 md:px-8 mb-4 z-20">
          <button
            onClick={onBackToLanding}
            className={`inline-flex items-center space-x-2 text-xs font-mono transition px-3 py-1.5 rounded-lg border ${
              isDark ? 'text-[#94A3B8] hover:text-white bg-white/5 hover:bg-white/10 border-white/5' : 'text-[#64748B] hover:text-[#172033] bg-white hover:bg-[#F1F5F9] border-[#E2E8F0]'
            }`}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>← Back to Landing Page</span>
          </button>
        </div>
      )}

      {/* Main Split Screen Container */}
      <div className="max-w-6xl w-full mx-auto p-4 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center z-10">

        {/* LEFT PANEL: Brand Narrative & Live Java Terminal Preview */}
        <div className="lg:col-span-6 space-y-6">
          <div className="flex items-center space-x-3.5">
            <img
              src="/logo.png"
              alt="OOP'S ORACLE"
              className="w-14 h-14 rounded-2xl object-cover shadow-glow-orange border border-[#F89820]/40"
            />
            <div>
              <h2 className="text-2xl font-bold tracking-wider font-['Cinzel',serif] text-transparent bg-clip-text bg-gradient-to-r from-white via-amber-100 to-[#F89820]">
                OOP'S ORACLE
              </h2>
              <p className="text-xs font-mono text-[#94A3B8]">
                Master Java. Master Logic. Build Your Future.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <h1 className={`text-3xl md:text-4xl font-extrabold tracking-tight leading-tight ${isDark ? 'text-white' : 'text-[#172033]'}`}>
              The Premier Java Technical Interview & Coding Platform.
            </h1>
            <p className={`text-sm leading-relaxed ${isDark ? 'text-[#94A3B8]' : 'text-[#64748B]'}`}>
              Crack top-tier software engineering interviews at Google, Amazon, Microsoft, TCS, and Infosys with over 500+ curated Java problems, live isolated code execution, and 20 free structured courses.
            </p>
          </div>

          {/* Interactive Java Terminal Mockup */}
          <div className={`rounded-xl overflow-hidden border shadow-2xl ${
            isDark ? 'border-white/10 bg-[#151F32]/90' : 'border-[#E2E8F0] bg-white'
          }`}>
            <div className={`px-4 py-2.5 flex items-center justify-between border-b ${
              isDark ? 'bg-[#0B1120] border-white/5' : 'bg-[#F8FAFC] border-[#E2E8F0]'
            }`}>
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-yellow-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-green-500/80 inline-block" />
                <span className={`text-xs font-mono ml-2 ${isDark ? 'text-gray-400' : 'text-[#64748B]'}`}>
                  Solution.java — Java 17 LTS
                </span>
              </div>
              <div className="flex items-center space-x-1 text-[11px] font-mono text-[#F89820]">
                <Sparkles className="w-3 h-3" />
                <span>Compiler Active</span>
              </div>
            </div>

            <div className={`p-4 font-mono text-xs leading-relaxed overflow-x-auto space-y-1 ${
              isDark ? 'text-gray-300' : 'text-[#334155]'
            }`}>
              <div><span className="text-[#3B82F6]">public class</span> <span className="text-[#F89820]">Solution</span> &#123;</div>
              <div className={`pl-4 ${isDark ? 'text-gray-400' : 'text-[#94A3B8]'}`}>// Time: O(n) | Space: O(1) optimal Kadane</div>
              <div className="pl-4">
                <span className="text-[#3B82F6]">public int</span> <span className="text-emerald-500 font-semibold">maxSubArray</span>(<span className="text-[#3B82F6]">int</span>[] nums) &#123;
              </div>
              <div className="pl-8">
                <span className="text-[#3B82F6]">int</span> maxSoFar = nums[0], currMax = nums[0];
              </div>
              <div className="pl-8">
                <span className="text-[#3B82F6]">for</span> (<span className="text-[#3B82F6]">int</span> i = 1; i &lt; nums.length; i++) &#123;
              </div>
              <div className="pl-12">
                currMax = Math.max(nums[i], currMax + nums[i]);
              </div>
              <div className="pl-12">
                maxSoFar = Math.max(maxSoFar, currMax);
              </div>
              <div className="pl-8">&#125;</div>
              <div className="pl-8 text-emerald-500 font-semibold"><span className="text-[#3B82F6]">return</span> maxSoFar;</div>
              <div className="pl-4">&#125;</div>
              <div>&#125;</div>
            </div>

            <div className={`px-4 py-2 border-t flex items-center justify-between text-[11px] font-mono ${
              isDark ? 'bg-[#111A2C] border-white/5' : 'bg-[#F8FAFC] border-[#E2E8F0]'
            }`}>
              <span className="text-[#16A34A] flex items-center space-x-1.5 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>All 15 Test Cases Passed (Runtime: 1ms)</span>
              </span>
              <span className={isDark ? 'text-gray-500' : 'text-[#94A3B8]'}>Judge0 Isolated Sandbox</span>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-3 pt-2">
            <div className={`p-3 rounded-lg border ${
              isDark ? 'bg-[#1B263B]/50 border-white/5' : 'bg-white border-[#E2E8F0] shadow-sm'
            }`}>
              <div className="text-xl font-bold text-[#F89820]">500+</div>
              <div className={`text-[11px] ${isDark ? 'text-[#94A3B8]' : 'text-[#64748B]'}`}>Java Problems</div>
            </div>
            <div className={`p-3 rounded-lg border ${
              isDark ? 'bg-[#1B263B]/50 border-white/5' : 'bg-white border-[#E2E8F0] shadow-sm'
            }`}>
              <div className="text-xl font-bold text-[#3B82F6]">20</div>
              <div className={`text-[11px] ${isDark ? 'text-[#94A3B8]' : 'text-[#64748B]'}`}>Courses (100% Free)</div>
            </div>
            <div className={`p-3 rounded-lg border ${
              isDark ? 'bg-[#1B263B]/50 border-white/5' : 'bg-white border-[#E2E8F0] shadow-sm'
            }`}>
              <div className="text-xl font-bold text-[#16A34A]">100%</div>
              <div className={`text-[11px] ${isDark ? 'text-[#94A3B8]' : 'text-[#64748B]'}`}>Real JDK 17</div>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: Auth Card (Login / Signup) */}
        <div className="lg:col-span-6">
          <div className={`p-6 md:p-8 rounded-2xl shadow-2xl relative border ${
            isDark ? 'glass-panel border-white/10' : 'bg-white border-[#E2E8F0]'
          }`}>

            {/* Mode Switch Tabs or Breadcrumb */}
            {mode === 'forgot' || mode === 'reset' ? (
              <div className={`flex items-center justify-between p-2 rounded-lg mb-6 border ${
                isDark ? 'bg-[#0B1120]/80 border-white/5' : 'bg-[#F1F5F9] border-[#E2E8F0]'
              }`}>
                <button
                  type="button"
                  onClick={() => { setMode('login'); setError(null); }}
                  className="flex items-center space-x-1.5 text-xs font-mono text-[#F89820] hover:text-[#FFA733] transition"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Sign In</span>
                </button>
                <span className={`text-xs font-mono font-bold uppercase tracking-wider pr-2 ${
                  isDark ? 'text-white' : 'text-[#172033]'
                }`}>
                  {mode === 'forgot' ? 'Forgot Password' : 'Set New Password'}
                </span>
              </div>
            ) : (
              <div className={`flex rounded-lg p-1 mb-6 border ${
                isDark ? 'bg-[#0B1120]/80 border-white/5' : 'bg-[#F1F5F9] border-[#E2E8F0]'
              }`}>
                <button
                  type="button"
                  onClick={() => { setMode('login'); setError(null); }}
                  className={`flex-1 py-2 text-xs font-mono font-medium rounded-md transition ${
                    mode === 'login'
                      ? 'bg-[#F89820] text-black font-semibold shadow-md'
                      : isDark ? 'text-[#94A3B8] hover:text-white' : 'text-[#64748B] hover:text-[#172033]'
                  }`}
                >
                  LOGIN
                </button>
                <button
                  type="button"
                  onClick={() => { setMode('signup'); setError(null); }}
                  className={`flex-1 py-2 text-xs font-mono font-medium rounded-md transition ${
                    mode === 'signup'
                      ? 'bg-[#F89820] text-black font-semibold shadow-md'
                      : isDark ? 'text-[#94A3B8] hover:text-white' : 'text-[#64748B] hover:text-[#172033]'
                  }`}
                >
                  CREATE ACCOUNT
                </button>
              </div>
            )}

            {/* Success Banner */}
            {successMessage && (
              <div className="mb-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* Error Banner */}
            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                <span>{error}</span>
              </div>
            )}

            {/* Quick Demo 1-Click Login Banner */}
            <div className="mb-5 p-3 rounded-xl bg-gradient-to-r from-[#F89820]/15 to-[#3B82F6]/15 border border-[#F89820]/30 flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-white flex items-center space-x-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#F89820]" />
                  <span>Instant Recruiter / Demo Access</span>
                </div>
                <div className="text-[11px] text-[#94A3B8]">Explore full platform with 1 click</div>
              </div>
              <button
                type="button"
                onClick={handleDemoLogin}
                disabled={loading}
                className="px-3 py-1.5 rounded-lg bg-[#F89820] hover:bg-[#F89820]/90 text-black font-mono font-semibold text-xs shadow-md transition"
              >
                Demo Login
              </button>
            </div>

            {/* LOGIN FORM */}
            {mode === 'login' && (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-mono text-[#94A3B8] mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-gray-500 absolute left-3.5 top-3" />
                    <input
                      type="email"
                      required
                      placeholder="developer@oopsoracle.com"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      className="w-full bg-[#0B1120] border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#F89820] transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono text-[#94A3B8] mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-gray-500 absolute left-3.5 top-3" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••••••"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="w-full bg-[#0B1120] border border-white/10 rounded-lg pl-10 pr-10 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#F89820] transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-3 text-gray-500 hover:text-gray-300"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <label className="flex items-center space-x-2 cursor-pointer text-[#94A3B8] hover:text-white">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded bg-[#0B1120] border-gray-700 text-[#F89820] focus:ring-0"
                    />
                    <span>Remember me</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setError(null);
                      setSuccessMessage(null);
                      setForgotSuccessMessage(null);
                      setDispatchedResetLink(null);
                      setForgotEmail(loginEmail || '');
                      setMode('forgot');
                    }}
                    className="text-[#F89820] hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 rounded-lg bg-gradient-to-r from-[#F89820] to-[#E65100] text-black font-semibold text-sm hover:opacity-95 transition shadow-glow-orange flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Sign In to OOP'S ORACLE</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* SIGNUP FORM */}
            {mode === 'signup' && (
              <form onSubmit={handleSignupSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-mono text-[#94A3B8] mb-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-gray-500 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      required
                      placeholder="Ada Lovelace"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full bg-[#0B1120] border border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#F89820]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono text-[#94A3B8] mb-1">
                    Username
                  </label>
                  <div className="relative">
                    <Code2 className="w-4 h-4 text-gray-500 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      required
                      placeholder="java_ninja"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full bg-[#0B1120] border border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#F89820]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono text-[#94A3B8] mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-gray-500 absolute left-3 top-2.5" />
                    <input
                      type="email"
                      required
                      placeholder="ada@example.com"
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      className="w-full bg-[#0B1120] border border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#F89820]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-mono text-[#94A3B8] mb-1">
                      Password
                    </label>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      className="w-full bg-[#0B1120] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#F89820]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-[#94A3B8] mb-1">
                      Confirm
                    </label>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full bg-[#0B1120] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#F89820]"
                    />
                  </div>
                </div>

                {/* Password strength indicator */}
                {signupPassword && (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-mono">
                      <span className="text-gray-400">Strength:</span>
                      <span className="font-semibold text-white">{pwdStrength.text}</span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-1 overflow-hidden">
                      <div
                        className={`h-full ${pwdStrength.color} transition-all duration-300`}
                        style={{ width: `${(pwdStrength.score / 4) * 100}%` }}
                      />
                    </div>
                  </div>
                )}

                <div className="pt-1">
                  <label className="flex items-center space-x-2 cursor-pointer text-xs text-[#94A3B8]">
                    <input
                      type="checkbox"
                      checked={agreedTerms}
                      onChange={(e) => setAgreedTerms(e.target.checked)}
                      className="rounded bg-[#0B1120] border-gray-700 text-[#F89820] focus:ring-0"
                    />
                    <span>I agree to the OOP'S ORACLE Terms & Honor Code</span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 rounded-lg bg-gradient-to-r from-[#F89820] to-[#E65100] text-black font-semibold text-sm hover:opacity-95 transition shadow-glow-orange flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Create Account</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* FORGOT PASSWORD FORM */}
            {mode === 'forgot' && (
              <form onSubmit={handleForgotSubmit} className="space-y-4">
                <div>
                  <h3 className={`text-sm font-mono font-bold mb-1 ${isDark ? 'text-white' : 'text-[#172033]'}`}>Reset Your Password</h3>
                  <p className={`text-xs leading-relaxed ${isDark ? 'text-[#94A3B8]' : 'text-[#64748B]'}`}>
                    Enter your registered email address. We'll send you a secure link to reset your account password.
                  </p>
                </div>

                {forgotSuccessMessage ? (
                  <div className="space-y-4">
                    {isDelivered ? (
                      <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs space-y-2">
                        <div className="flex items-center space-x-2 font-bold text-emerald-500">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Reset Link Dispatched to Inbox!</span>
                        </div>
                        <p className={isDark ? 'text-emerald-300' : 'text-emerald-800'}>
                          A password reset link was sent directly to <strong>{forgotEmail}</strong>. Please check your email inbox and spam folder.
                        </p>
                      </div>
                    ) : (
                      <div className={`p-4 rounded-xl border text-xs space-y-2 ${isDark ? 'bg-amber-500/10 border-amber-500/30 text-amber-200' : 'bg-amber-50 border-amber-300 text-amber-900'}`}>
                        <div className="flex items-center space-x-2 font-bold text-amber-500">
                          <Sparkles className="w-4 h-4" />
                          <span>Instant Password Reset Link Generated!</span>
                        </div>
                        <p className="leading-relaxed">
                          Live SMTP email dispatch requires setting <code className="px-1 py-0.5 rounded bg-black/20 font-mono text-[11px]">GMAIL_USER</code> and <code className="px-1 py-0.5 rounded bg-black/20 font-mono text-[11px]">GMAIL_APP_PASS</code> in <code className="px-1 py-0.5 rounded bg-black/20 font-mono text-[11px]">server/.env</code>.
                        </p>
                        <p className="leading-relaxed font-semibold">
                          For immediate access, click below to set your new password without waiting:
                        </p>
                      </div>
                    )}

                    {dispatchedResetLink && (
                      <div className={`p-3.5 rounded-xl border space-y-2 text-xs font-mono ${isDark ? 'bg-[#0B1120] border-white/10' : 'bg-[#F8FAFC] border-[#E2E8F0]'}`}>
                        <div className={`text-[11px] flex items-center justify-between ${isDark ? 'text-gray-400' : 'text-[#64748B]'}`}>
                          <span>Verification Reset Link:</span>
                          <span className="text-[#16A34A] text-[10px] font-bold">● Active (1 Hour)</span>
                        </div>
                        <div className={`p-2 rounded break-all select-all border text-[11px] font-mono ${isDark ? 'bg-black/40 text-[#38BDF8] border-white/5' : 'bg-white text-[#2563EB] border-[#CBD5E1]'}`}>
                          {dispatchedResetLink}
                        </div>
                        <button
                          type="button"
                          onClick={() => setMode('reset')}
                          className="w-full mt-2 py-2.5 rounded-lg bg-gradient-to-r from-[#F89820] to-[#E65100] hover:from-[#fca83a] hover:to-[#f56a00] text-black font-bold text-xs shadow-md transition flex items-center justify-center space-x-1.5"
                        >
                          <span>Proceed to Set New Password</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => { setMode('login'); setError(null); }}
                      className={`w-full py-2 text-xs font-mono transition ${isDark ? 'text-gray-400 hover:text-white' : 'text-[#64748B] hover:text-[#172033]'}`}
                    >
                      ← Return to Login
                    </button>
                  </div>
                ) : (
                  <>
                    <div>
                      <label className={`block text-xs font-mono mb-1.5 ${isDark ? 'text-[#94A3B8]' : 'text-[#64748B]'}`}>
                        Registered Email Address
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                        <input
                          type="email"
                          required
                          placeholder="developer@oopsoracle.com"
                          value={forgotEmail}
                          onChange={(e) => setForgotEmail(e.target.value)}
                          className={`w-full border rounded-lg pl-10 pr-4 py-2.5 text-sm transition focus:outline-none focus:border-[#F89820] ${isDark ? 'bg-[#0B1120] border-white/10 text-white placeholder-gray-500' : 'bg-white border-[#D1D5DB] text-[#172033] placeholder-gray-400'}`}
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-2.5 rounded-lg bg-gradient-to-r from-[#F89820] to-[#E65100] text-black font-semibold text-sm hover:opacity-95 transition shadow-glow-orange flex items-center justify-center space-x-2 disabled:opacity-50"
                    >
                      {loading ? (
                        <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <span>Send Reset Link to Registered Email</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </>
                )}
              </form>
            )}

            {/* RESET PASSWORD FORM */}
            {mode === 'reset' && (
              <form onSubmit={handleResetSubmit} className="space-y-4">
                <div>
                  <h3 className={`text-sm font-mono font-bold mb-1 ${isDark ? 'text-white' : 'text-[#172033]'}`}>Set New Password</h3>
                  <p className={`text-xs leading-relaxed ${isDark ? 'text-[#94A3B8]' : 'text-[#64748B]'}`}>
                    Create a strong new password for your OOP'S ORACLE account (minimum 6 characters).
                  </p>
                </div>

                <div>
                  <label className={`block text-xs font-mono mb-1.5 ${isDark ? 'text-[#94A3B8]' : 'text-[#64748B]'}`}>
                    New Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••••••"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className={`w-full border rounded-lg pl-10 pr-10 py-2.5 text-sm transition focus:outline-none focus:border-[#F89820] ${isDark ? 'bg-[#0B1120] border-white/10 text-white placeholder-gray-500' : 'bg-white border-[#D1D5DB] text-[#172033] placeholder-gray-400'}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-3 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className={`block text-xs font-mono mb-1.5 ${isDark ? 'text-[#94A3B8]' : 'text-[#64748B]'}`}>
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••••••"
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      className={`w-full border rounded-lg pl-10 pr-4 py-2.5 text-sm transition focus:outline-none focus:border-[#F89820] ${isDark ? 'bg-[#0B1120] border-white/10 text-white placeholder-gray-500' : 'bg-white border-[#D1D5DB] text-[#172033] placeholder-gray-400'}`}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 rounded-lg bg-gradient-to-r from-[#F89820] to-[#E65100] text-black font-semibold text-sm hover:opacity-95 transition shadow-glow-orange flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Save New Password & Sign In</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Replay Cinematic Intro button */}
            {onReplayIntro && (
              <div className="mt-6 pt-4 border-t border-white/5 text-center">
                <button
                  type="button"
                  onClick={onReplayIntro}
                  className="text-xs font-mono text-[#94A3B8] hover:text-[#F89820] transition flex items-center justify-center space-x-1.5 mx-auto"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#F89820]" />
                  <span>Watch Cinematic Landing Page Video</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
