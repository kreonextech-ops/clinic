'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Smile, HelpCircle, Key, ArrowRight, ShieldCheck } from 'lucide-react';

const QUESTIONS_1 = [
  "What is your mother's maiden name?",
  "What was the name of your first pet?",
  "In what city were you born?",
  "What was your childhood nickname?"
];

const QUESTIONS_2 = [
  "What was the name of your first school?",
  "What is your favorite book or movie?",
  "What is the name of your favorite uncle/aunt?",
  "What was the make of your first car?"
];

export default function SetupPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [clinicName, setClinicName] = useState('Way2Smile Clinic');
  const [doctorName, setDoctorName] = useState('');
  const [email, setEmail] = useState('');
  
  const [securityQuestion1, setSecurityQuestion1] = useState(QUESTIONS_1[0]);
  const [securityAnswer1, setSecurityAnswer1] = useState('');
  const [securityQuestion2, setSecurityQuestion2] = useState(QUESTIONS_2[0]);
  const [securityAnswer2, setSecurityAnswer2] = useState('');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          password,
          clinicName,
          doctorName,
          email,
          securityQuestion1,
          securityAnswer1,
          securityQuestion2,
          securityAnswer2,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/dashboard');
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'Initialization failed.');
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100 p-4 relative overflow-hidden">
      {/* Background glowing decorations */}
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] bg-cyan-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl shadow-2xl p-8 w-full max-w-2xl relative z-10 transition-all duration-300 hover:border-slate-700/50">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-gradient-to-tr from-cyan-400 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/20 animate-pulse">
            <Smile className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-extrabold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            Workspace Initialization
          </h1>
          <p className="text-slate-400 mt-1.5 text-sm">Configure your doctor account and security details</p>
        </div>

        {success ? (
          <div className="space-y-4 text-center py-6">
            <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto text-emerald-400 text-xl font-bold">
              ✓
            </div>
            <h3 className="text-lg font-bold text-emerald-400">Initialization Complete!</h3>
            <p className="text-sm text-slate-400">
              Your profile has been created. Redirecting to login in a few seconds...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Step 1: Doctor Profile */}
            <div className="border-b border-slate-800/80 pb-4">
              <h3 className="text-sm font-bold text-cyan-400 flex items-center gap-1.5 mb-4">
                <ShieldCheck className="w-4 h-4" /> 1. Doctor Profile
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">Doctor Name</label>
                  <input
                    type="text"
                    value={doctorName}
                    onChange={(e) => setDoctorName(e.target.value)}
                    required
                    placeholder="Dr. Doctor Name"
                    className="w-full bg-slate-950/80 border border-slate-800/80 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/60 transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">Clinic Name</label>
                  <input
                    type="text"
                    value={clinicName}
                    onChange={(e) => setClinicName(e.target.value)}
                    required
                    className="w-full bg-slate-950/80 border border-slate-800/80 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/60 transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Step 2: Credentials */}
            <div className="border-b border-slate-800/80 pb-4">
              <h3 className="text-sm font-bold text-cyan-400 flex items-center gap-1.5 mb-4">
                <Key className="w-4 h-4" /> 2. Login Credentials
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">Login Username</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    placeholder="Enter login username"
                    className="w-full bg-slate-950/80 border border-slate-800/80 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/60 transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Minimum 8 characters"
                    className="w-full bg-slate-950/80 border border-slate-800/80 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/60 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5 mt-4">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">Email Address (Optional)</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="doctor@example.com"
                  className="w-full bg-slate-950/80 border border-slate-800/80 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/60 transition-all"
                />
              </div>
            </div>

            {/* Step 3: Security Questions (For Password Resets) */}
            <div>
              <h3 className="text-sm font-bold text-cyan-400 flex items-center gap-1.5 mb-4">
                <HelpCircle className="w-4 h-4" /> 3. Security Questions (For Password Recovery)
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Question 1 */}
                <div className="space-y-3 p-4 bg-slate-950/40 border border-slate-800/60 rounded-2xl">
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Question 1</label>
                    <select
                      value={securityQuestion1}
                      onChange={(e) => setSecurityQuestion1(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500/60"
                    >
                      {QUESTIONS_1.map((q) => (
                        <option key={q} value={q}>{q}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Answer 1</label>
                    <input
                      type="text"
                      value={securityAnswer1}
                      onChange={(e) => setAnswer1(e.target.value)}
                      required
                      placeholder="Your answer"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500/60"
                    />
                  </div>
                </div>

                {/* Question 2 */}
                <div className="space-y-3 p-4 bg-slate-950/40 border border-slate-800/60 rounded-2xl">
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Question 2</label>
                    <select
                      value={securityQuestion2}
                      onChange={(e) => setSecurityQuestion2(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500/60"
                    >
                      {QUESTIONS_2.map((q) => (
                        <option key={q} value={q}>{q}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Answer 2</label>
                    <input
                      type="text"
                      value={securityAnswer2}
                      onChange={(e) => setAnswer2(e.target.value)}
                      required
                      placeholder="Your answer"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500/60"
                    />
                  </div>
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 text-red-400 text-xs px-4 py-2.5 rounded-xl border border-red-500/20">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-3 rounded-xl font-bold hover:from-blue-500 hover:to-cyan-500 disabled:opacity-50 transition-all shadow-lg shadow-blue-900/20 cursor-pointer active:scale-95 flex items-center justify-center gap-1.5"
            >
              {loading ? 'Initializing Clinic...' : 'Initialize Clinic Workspace'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        <div className="text-center mt-6">
          <Link href="/dashboard" className="text-xs text-slate-400 hover:text-cyan-400 hover:underline">
            Already setup? Return to dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
