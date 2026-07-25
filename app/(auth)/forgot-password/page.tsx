'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type Step = 'username' | 'questions' | 'reset' | 'done';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('username');
  const [username, setUsername] = useState('');
  const [questions, setQuestions] = useState<{ q1: string; q2: string } | null>(null);
  const [answer1, setAnswer1] = useState('');
  const [answer2, setAnswer2] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleUsernameSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const res = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'getQuestions', username }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) return setError(data.error || 'User not found');
    setQuestions(data);
    setStep('questions');
  }

  async function handleAnswersSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const res = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'verifyAnswers', username, answer1, answer2 }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) return setError(data.error || 'Incorrect answers');
    setStep('reset');
  }

  async function handlePasswordReset(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword !== confirmPassword) return setError('Passwords do not match');
    if (newPassword.length < 8) return setError('Password must be at least 8 characters');
    setLoading(true);
    setError('');
    const res = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'resetPassword', username, answer1, answer2, newPassword }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) return setError(data.error || 'Reset failed');
    setStep('done');
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-xl font-bold text-gray-900">Reset Password</h1>
        </div>

        {step === 'username' && (
          <form onSubmit={handleUsernameSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Your Username</label>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your username"
              />
            </div>
            {error && <p className="text-red-600 text-sm">{error}</p>}
            <button disabled={loading} className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50">
              {loading ? 'Checking...' : 'Continue'}
            </button>
          </form>
        )}

        {step === 'questions' && questions && (
          <form onSubmit={handleAnswersSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{questions.q1}</label>
              <input value={answer1} onChange={(e) => setAnswer1(e.target.value)} required className="w-full border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{questions.q2}</label>
              <input value={answer2} onChange={(e) => setAnswer2(e.target.value)} required className="w-full border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            {error && <p className="text-red-600 text-sm">{error}</p>}
            <button disabled={loading} className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50">
              {loading ? 'Verifying...' : 'Verify Answers'}
            </button>
          </form>
        )}

        {step === 'reset' && (
          <form onSubmit={handlePasswordReset} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
              <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required className="w-full border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
              <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className="w-full border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            {error && <p className="text-red-600 text-sm">{error}</p>}
            <button disabled={loading} className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50">
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        )}

        {step === 'done' && (
          <div className="text-center">
            <div className="text-green-500 text-4xl mb-3">✓</div>
            <p className="text-gray-700 mb-4">Password reset successfully!</p>
            <Link href="/login" className="bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700">
              Back to Login
            </Link>
          </div>
        )}

        {step !== 'done' && (
          <div className="text-center mt-4">
            <Link href="/login" className="text-sm text-blue-600 hover:underline">Back to login</Link>
          </div>
        )}
      </div>
    </div>
  );
}
