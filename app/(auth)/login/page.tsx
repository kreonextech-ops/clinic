'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Smile, Lock, User, AlertCircle, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await signIn('credentials', {
      username,
      password,
      redirect: false,
    });

    if (res?.error) {
      setError('Invalid username or password');
      setLoading(false);
    } else {
      router.push('/dashboard');
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100 p-4 relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-[-30%] left-[-30%] w-[80%] h-[80%] bg-blue-600/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-30%] right-[-30%] w-[80%] h-[80%] bg-cyan-600/15 rounded-full blur-[140px] pointer-events-none" />

      <div className="bg-slate-900/50 backdrop-blur-2xl border border-slate-800/80 rounded-3xl shadow-2xl p-8 w-full max-w-md relative z-10 transition-all duration-300 hover:border-slate-700/50">
        
        {/* Logo / Branding */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-gradient-to-tr from-cyan-400 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/20">
            <Smile className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            Way2Smile Clinic
          </h1>
          <p className="text-slate-400 mt-1 text-sm">Sign in to your practitioner workspace</p>
        </div>

        {/* First time setup helper notice */}
        <div className="mb-6 bg-slate-800/40 border border-slate-700/55 rounded-2xl p-3 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <div className="text-[11px] text-slate-400 leading-normal">
            First time using the application? Visit the{' '}
            <Link href="/setup" className="text-cyan-400 font-bold hover:underline inline-flex items-center gap-0.5">
              setup page <ArrowRight className="w-3 h-3" />
            </Link>{' '}
            to configure your database administrator credentials.
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">Username</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <User className="w-4 h-4" />
              </span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full bg-slate-950/80 border border-slate-800/80 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:border-transparent transition-all"
                placeholder="doctor_username"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">Password</label>
            </div>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-slate-950/80 border border-slate-800/80 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:border-transparent transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          {error && (
            <div className="bg-rose-500/10 text-rose-400 text-xs px-4 py-2.5 rounded-xl border border-rose-500/20 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-2.5 rounded-xl font-semibold hover:from-blue-500 hover:to-cyan-500 disabled:opacity-50 transition-all shadow-lg shadow-blue-900/20 cursor-pointer active:scale-[0.98]"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div className="text-center mt-5">
          <Link href="/forgot-password" className="text-xs text-slate-400 hover:text-cyan-400 hover:underline transition-colors">
            Forgot password?
          </Link>
        </div>
      </div>
    </div>
  );
}
