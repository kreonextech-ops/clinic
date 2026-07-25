'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState(1); // 1: Username, 2: Questions, 3: Success
  const [username, setUsername] = useState('');
  const [questions, setQuestions] = useState<{ q1: string; q2: string } | null>(null);
  const [a1, setA1] = useState('');
  const [a2, setA2] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  async function handleGetQuestions(e: React.FormEvent) {
    e.preventDefault();
    if (!username.trim()) return setError('Please enter your username');
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'get-questions', username }),
      });
      const data = await res.json();
      setLoading(false);

      if (!res.ok) {
        setError(data.error || 'Failed to retrieve security questions');
      } else {
        setQuestions(data);
        setStep(2);
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      setLoading(false);
    }
  }

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    if (!a1.trim() || !a2.trim() || !newPassword.trim()) {
      return setError('All fields are required');
    }
    if (newPassword !== confirmPassword) {
      return setError('Passwords do not match');
    }
    if (newPassword.length < 8) {
      return setError('Password must be at least 8 characters long');
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'reset',
          username,
          a1,
          a2,
          newPassword,
        }),
      });
      const data = await res.json();
      setLoading(false);

      if (!res.ok) {
        setError(data.error || 'Failed to reset password');
      } else {
        setMessage('Your password has been successfully reset.');
        setStep(3);
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-tr from-blue-50 via-white to-teal-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <span className="text-5xl">🔒</span>
        <h2 className="mt-4 text-3xl font-extrabold text-gray-900 tracking-tight">
          Reset Password
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          Recover your clinic owner account password
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl border border-gray-100 rounded-2xl sm:px-10">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm font-medium">
              {error}
            </div>
          )}

          {step === 1 && (
            <form onSubmit={handleGetQuestions} className="space-y-6">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                  Username
                </label>
                <div className="mt-1">
                  <input
                    id="username"
                    name="username"
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Enter owner username"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
                >
                  {loading ? 'Verifying...' : 'Next'}
                </button>
              </div>

              <div className="text-center text-sm">
                <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
                  Back to sign in
                </Link>
              </div>
            </form>
          )}

          {step === 2 && questions && (
            <form onSubmit={handleReset} className="space-y-6">
              <div className="bg-blue-50 p-4 rounded-xl text-blue-800 text-xs mb-4">
                Please answer the security questions you configured in your settings.
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-1">
                  Question 1: {questions.q1}
                </label>
                <input
                  type="text"
                  required
                  value={a1}
                  onChange={(e) => setA1(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Your answer"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-1">
                  Question 2: {questions.q2}
                </label>
                <input
                  type="text"
                  required
                  value={a2}
                  onChange={(e) => setA2(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Your answer"
                />
              </div>

              <div className="border-t border-gray-100 pt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm mb-4"
                  placeholder="At least 8 characters"
                />

                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Confirm password"
                />
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
                >
                  {loading ? 'Resetting Password...' : 'Reset Password'}
                </button>
              </div>

              <div className="text-center text-sm">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="font-medium text-gray-500 hover:text-gray-700"
                >
                  Back to username entry
                </button>
              </div>
            </form>
          )}

          {step === 3 && (
            <div className="text-center space-y-4">
              <div className="text-green-500 text-5xl">✓</div>
              <p className="text-sm text-gray-700 font-medium">{message}</p>
              <Link
                href="/login"
                className="mt-4 w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
              >
                Sign In Now
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
