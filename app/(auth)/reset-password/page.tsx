'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [username, setUsername] = useState('');
  const [questions, setQuestions] = useState<{ q1?: string; q2?: string }>({});
  const [answer1, setAnswer1] = useState('');
  const [answer2, setAnswer2] = useState('');
  const [newPassword, setNewPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Step 1: Fetch security questions for username
  const handleFetchQuestions = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`/api/auth/reset-password/questions?username=${encodeURIComponent(username)}`);
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Username not found.');
        setLoading(false);
        return;
      }

      setQuestions({ q1: data.q1, q2: data.q2 });
      setStep(2);
      setLoading(false);
    } catch (err: any) {
      setError('Failed to fetch account security questions.');
      setLoading(false);
    }
  };

  // Step 2: Verify security answers and update password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/reset-password/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          answer1,
          answer2,
          newPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Incorrect security answers.');
        setLoading(false);
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/login');
      }, 1500);
    } catch (err: any) {
      setError('Failed to reset password. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden font-sans selection:bg-blue-500 selection:text-white">
      {/* Background Ambient Glows */}
      <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-blue-600/15 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white text-2xl shadow-xl shadow-blue-500/25 mb-3">
            🔑
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Security Question Password Reset</h1>
          <p className="text-xs text-slate-400 mt-1">Answer your security questions to set a new password</p>
        </div>

        <div className="bg-slate-900/80 backdrop-blur-2xl border border-slate-800/80 rounded-3xl p-6 lg:p-8 shadow-2xl">
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold flex items-center gap-2">
              <span>⚠️</span> {error}
            </div>
          )}

          {success && (
            <div className="mb-5 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold text-center">
              🎉 Password updated successfully! Redirecting to sign in...
            </div>
          )}

          {step === 1 ? (
            <form onSubmit={handleFetchQuestions} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Account Username</label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  className="w-full px-4 py-3 bg-slate-950/80 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/60"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-600/25 transition-all duration-200 disabled:opacity-50"
              >
                {loading ? 'Finding Account...' : 'Continue to Security Questions'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-blue-400 mb-1">Question 1</label>
                <p className="text-xs font-bold text-slate-200 mb-2">{questions.q1 || 'Security Question 1'}</p>
                <input
                  type="password"
                  required
                  value={answer1}
                  onChange={(e) => setAnswer1(e.target.value)}
                  placeholder="Your answer..."
                  className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/60"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-blue-400 mb-1">Question 2</label>
                <p className="text-xs font-bold text-slate-200 mb-2">{questions.q2 || 'Security Question 2'}</p>
                <input
                  type="password"
                  required
                  value={answer2}
                  onChange={(e) => setAnswer2(e.target.value)}
                  placeholder="Your answer..."
                  className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/60"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">New Password</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/60"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-600/25 transition-all duration-200 disabled:opacity-50"
              >
                {loading ? 'Verifying Answers...' : 'Reset Password'}
              </button>
            </form>
          )}

          {/* Admin Fallback Notice */}
          <div className="mt-6 p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-[11px] text-slate-400">
            <span className="font-bold text-slate-300">Forgot security answers?</span> If you are unable to answer your security questions, please contact your system administrator / developer to issue a new credential.
          </div>

          <div className="mt-4 text-center">
            <Link href="/login" className="text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors">
              ← Return to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
