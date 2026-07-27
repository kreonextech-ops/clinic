'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { isOwner } from '@/lib/auth/permissions';
import { usePushNotification } from '@/hooks/usePushNotification';
import { PageHeader } from '@/components/shared/PageHeader';

const SECURITY_QUESTIONS = [
  "What is the name of your first pet?",
  "What was the name of the street you grew up on?",
  "What was the name of your primary school?",
  "What is your mother's maiden name?",
  "What city were you born in?",
  "What was the model of your first car?",
  "What is the name of your childhood best friend?",
];

export default function SettingsPage() {
  const { data: session } = useSession();
  const owner = isOwner(session);
  const { supported, subscribed, subscribe } = usePushNotification();

  const [profileForm, setProfileForm] = useState({ clinicName: '', doctorName: '', email: '' });
  const [passwordForm, setPasswordForm] = useState({ current: '', newPass: '', confirm: '' });
  const [securityForm, setSecurityForm] = useState({ q1: '', a1: '', q2: '', a2: '' });
  const [saving, setSaving] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetch('/api/settings').then((r) => r.json()).then((data) => {
      setProfileForm({ clinicName: data.clinicName || '', doctorName: data.doctorName || '', email: data.email || '' });
      setSecurityForm({ q1: data.securityQuestion1 || '', a1: '', q2: data.securityQuestion2 || '', a2: '' });
    }).catch(() => {});
  }, []);

  function showMsg(type: 'success' | 'error', text: string) {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4000);
  }

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSaving('profile');
    const res = await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'profile', ...profileForm }),
    });
    setSaving(null);
    res.ok ? showMsg('success', 'Profile updated!') : showMsg('error', 'Failed to update profile');
  }

  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    if (passwordForm.newPass !== passwordForm.confirm) return showMsg('error', 'Passwords do not match');
    if (passwordForm.newPass.length < 8) return showMsg('error', 'Password must be at least 8 characters');
    setSaving('password');
    const res = await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'password', currentPassword: passwordForm.current, newPassword: passwordForm.newPass }),
    });
    setSaving(null);
    if (res.ok) { showMsg('success', 'Password changed!'); setPasswordForm({ current: '', newPass: '', confirm: '' }); }
    else { const d = await res.json(); showMsg('error', d.error || 'Failed'); }
  }

  async function saveSecurity(e: React.FormEvent) {
    e.preventDefault();
    setSaving('security');
    const res = await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'security', ...securityForm }),
    });
    setSaving(null);
    res.ok ? showMsg('success', 'Security questions updated!') : showMsg('error', 'Failed');
  }

  const inputClass = 'w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500';

  return (
    <div className="max-w-2xl space-y-6">
      <PageHeader title="Settings" />

      {message && (
        <div className={`p-4 rounded-xl text-sm font-medium ${message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
          {message.text}
        </div>
      )}

      {/* Staff Management — owner only */}
      {owner && (
        <Link href="/settings/staff"
          className="flex items-center justify-between p-5 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl text-white hover:from-blue-700 hover:to-blue-800 transition-all">
          <div className="flex items-center gap-3">
            <span className="text-2xl">👥</span>
            <div>
              <p className="font-semibold">Staff Management</p>
              <p className="text-xs text-blue-200">Create accounts, set roles and permissions for your team</p>
            </div>
          </div>
          <span className="text-blue-200">→</span>
        </Link>
      )}

      {/* Profile — owner only (staff can't change clinic name) */}
      {owner && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Clinic Profile</h3>
          <form onSubmit={saveProfile} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Clinic Name</label>
              <input value={profileForm.clinicName} onChange={(e) => setProfileForm((p) => ({ ...p, clinicName: e.target.value }))} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Doctor Name</label>
              <input value={profileForm.doctorName} onChange={(e) => setProfileForm((p) => ({ ...p, doctorName: e.target.value }))} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" value={profileForm.email} onChange={(e) => setProfileForm((p) => ({ ...p, email: e.target.value }))} className={inputClass} />
            </div>
            <button type="submit" disabled={saving === 'profile'} className="px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
              {saving === 'profile' ? 'Saving...' : 'Save Profile'}
            </button>
          </form>
        </div>
      )}

      {/* Change Password — all users */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Change Password</h3>
        <form onSubmit={changePassword} className="space-y-4">
          {[
            { label: 'Current Password', key: 'current' as const },
            { label: 'New Password', key: 'newPass' as const },
            { label: 'Confirm New Password', key: 'confirm' as const },
          ].map((f: any) => (
            <div key={f.key}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{f.label}</label>
              <input type="password" value={passwordForm[f.key]}
                onChange={(e) => setPasswordForm((p) => ({ ...p, [f.key]: e.target.value }))} className={inputClass} />
            </div>
          ))}
          <button type="submit" disabled={saving === 'password'} className="px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
            {saving === 'password' ? 'Changing...' : 'Change Password'}
          </button>
        </form>
      </div>

      {/* Security Questions — owner only */}
      {owner && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-1">Security Questions</h3>
          <p className="text-xs text-gray-500 mb-4">Used for password recovery</p>
          <form onSubmit={saveSecurity} className="space-y-4">
            {[1, 2].map((n: any) => (
              <div key={n}>
                <label className="block text-sm font-medium text-gray-700 mb-1">Question {n}</label>
                <select value={n === 1 ? securityForm.q1 : securityForm.q2}
                  onChange={(e) => setSecurityForm((p) => n === 1 ? { ...p, q1: e.target.value } : { ...p, q2: e.target.value })}
                  className={inputClass + ' mb-2'}>
                  <option value="">Select a question...</option>
                  {SECURITY_QUESTIONS.map((q: any) => <option key={q} value={q}>{q}</option>)}
                </select>
                <input type="password"
                  value={n === 1 ? securityForm.a1 : securityForm.a2}
                  onChange={(e) => setSecurityForm((p) => n === 1 ? { ...p, a1: e.target.value } : { ...p, a2: e.target.value })}
                  className={inputClass} placeholder="Your answer..." />
              </div>
            ))}
            <button type="submit" disabled={saving === 'security'} className="px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
              {saving === 'security' ? 'Saving...' : 'Save Security Questions'}
            </button>
          </form>
        </div>
      )}

      {/* Push Notifications */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-1">Push Notifications</h3>
        <p className="text-xs text-gray-500 mb-4">Receive reminders on this device</p>
        {!supported ? (
          <p className="text-sm text-gray-500">Not supported on this browser.</p>
        ) : subscribed ? (
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
            <p className="text-sm text-green-700 font-medium">Push notifications enabled</p>
          </div>
        ) : (
          <button onClick={subscribe} className="px-5 py-2.5 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700">
            🔔 Enable Push Notifications
          </button>
        )}
      </div>
    </div>
  );
}

