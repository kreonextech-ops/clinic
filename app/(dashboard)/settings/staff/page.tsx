'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { isOwner, ALL_PERMISSIONS, PERMISSION_LABELS, PERMISSION_GROUPS, ROLE_LABELS, ROLE_DEFAULTS } from '@/lib/auth/permissions';
import type { StaffPermissions, PermissionKey } from '@/lib/auth/permissions';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { PageHeader } from '@/components/shared/PageHeader';

interface StaffMember {
  id: number;
  username: string;
  displayName: string;
  role: string;
  permissions: StaffPermissions;
  isActive: boolean;
  createdAt: string;
}

export default function StaffManagementPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Create form
  const [createForm, setCreateForm] = useState({
    username: '', password: '', displayName: '', role: 'assistant',
  });

  useEffect(() => {
    if (session && !isOwner(session)) {
      router.replace('/dashboard');
      return;
    }
    fetchStaff();
  }, [session]);

  async function fetchStaff() {
    setLoading(true);
    const res = await fetch('/api/staff');
    if (res.ok) setStaffList(await res.json());
    setLoading(false);
  }

  function showMsg(type: 'success' | 'error', text: string) {
    setMsg({ type, text });
    setTimeout(() => setMsg(null), 3500);
  }

  async function createStaff(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await fetch('/api/staff', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(createForm),
    });
    setSaving(false);
    if (res.ok) {
      showMsg('success', 'Staff account created!');
      setShowCreate(false);
      setCreateForm({ username: '', password: '', displayName: '', role: 'assistant' });
      fetchStaff();
    } else {
      const d = await res.json();
      showMsg('error', d.error || 'Failed to create');
    }
  }

  async function savePermissions() {
    if (!selectedStaff) return;
    setSaving(true);
    const res = await fetch(`/api/staff/${selectedStaff.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ permissions: selectedStaff.permissions }),
    });
    setSaving(false);
    if (res.ok) {
      showMsg('success', 'Permissions saved!');
      fetchStaff();
    } else {
      showMsg('error', 'Failed to save');
    }
  }

  async function toggleActive(member: StaffMember) {
    await fetch(`/api/staff/${member.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !member.isActive }),
    });
    fetchStaff();
  }

  async function deleteStaff() {
    if (!deleteId) return;
    await fetch(`/api/staff/${deleteId}`, { method: 'DELETE' });
    setDeleteId(null);
    if (selectedStaff?.id === deleteId) setSelectedStaff(null);
    fetchStaff();
  }

  function togglePermission(key: PermissionKey) {
    if (!selectedStaff) return;
    setSelectedStaff((prev) => prev ? {
      ...prev,
      permissions: { ...prev.permissions, [key]: !prev.permissions[key] },
    } : null);
  }

  function applyRoleDefaults(role: string) {
    if (!selectedStaff) return;
    const defaults = ROLE_DEFAULTS[role as 'assistant' | 'receptionist'];
    if (!defaults) return;
    setSelectedStaff((prev) => prev ? { ...prev, role, permissions: { ...defaults } } : null);
  }

  const inputClass = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500';

  return (
    <div>
      <PageHeader
        title="Staff Management"
        description="Create sub-accounts and control what each staff member can access"
        actions={
          <button onClick={() => setShowCreate(true)}
            className="bg-blue-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700">
            + Add Staff
          </button>
        }
      />

      {msg && (
        <div className={`mb-4 p-3 rounded-lg text-sm font-medium ${msg.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
          {msg.text}
        </div>
      )}

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Staff list */}
        <div className="lg:col-span-2 space-y-2">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Staff Accounts</h3>
          {loading ? (
            <p className="text-sm text-gray-400">Loading...</p>
          ) : staffList.length === 0 ? (
            <div className="bg-white rounded-xl border border-dashed border-gray-300 p-6 text-center">
              <p className="text-sm text-gray-400">No staff accounts yet</p>
              <button onClick={() => setShowCreate(true)} className="text-sm text-blue-600 hover:underline mt-1">Create one</button>
            </div>
          ) : (
            staffList.map((member) => (
              <div key={member.id}
                onClick={() => setSelectedStaff({ ...member })}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${selectedStaff?.id === member.id ? 'border-blue-400 bg-blue-50' : 'border-gray-200 bg-white hover:border-blue-200'} ${!member.isActive ? 'opacity-50' : ''}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{member.displayName}</p>
                    <p className="text-xs text-gray-500">@{member.username}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${member.role === 'assistant' ? 'bg-teal-100 text-teal-800' : 'bg-purple-100 text-purple-800'}`}>
                      {ROLE_LABELS[member.role as 'assistant' | 'receptionist'] || member.role}
                    </span>
                    <span className={`text-xs ${member.isActive ? 'text-green-600' : 'text-red-500'}`}>
                      {member.isActive ? '● Active' : '○ Inactive'}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Permission editor */}
        <div className="lg:col-span-3">
          {!selectedStaff ? (
            <div className="bg-white rounded-xl border border-dashed border-gray-300 p-10 text-center">
              <p className="text-gray-400 text-sm">Select a staff member to edit their permissions</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-gray-900">{selectedStaff.displayName}</h3>
                  <p className="text-xs text-gray-500">@{selectedStaff.username}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => toggleActive(selectedStaff)}
                    className={`text-xs px-3 py-1.5 rounded-lg border font-medium ${selectedStaff.isActive ? 'border-red-200 text-red-600 hover:bg-red-50' : 'border-green-200 text-green-600 hover:bg-green-50'}`}>
                    {selectedStaff.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                  <button onClick={() => setDeleteId(selectedStaff.id)}
                    className="text-xs px-3 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50">
                    Delete
                  </button>
                </div>
              </div>

              {/* Role + preset */}
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <label className="block text-xs font-medium text-gray-600 mb-2">Role Preset</label>
                <div className="flex gap-2">
                  {(['assistant', 'receptionist'] as const).map((r) => (
                    <button key={r} onClick={() => applyRoleDefaults(r)}
                      className={`flex-1 py-2 text-xs rounded-lg border font-medium transition-colors ${selectedStaff.role === r ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300 text-gray-600 hover:bg-gray-100'}`}>
                      {ROLE_LABELS[r]}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-1">Clicking a preset resets all permissions to defaults for that role</p>
              </div>

              {/* Permissions toggles */}
              <div className="space-y-4">
                {PERMISSION_GROUPS.map((group) => (
                  <div key={group.label}>
                    <p className={`text-xs font-bold mb-2 ${group.label.includes('Finance') ? 'text-red-600' : 'text-gray-600'}`}>
                      {group.label.includes('Finance') ? '🔒 ' : ''}{group.label}
                    </p>
                    <div className="space-y-1.5">
                      {group.keys.map((key) => {
                        const enabled = selectedStaff.permissions[key] === true;
                        return (
                          <div key={key} onClick={() => togglePermission(key)}
                            className={`flex items-center justify-between px-3 py-2.5 rounded-lg border cursor-pointer transition-colors ${enabled ? 'bg-green-50 border-green-300' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'}`}>
                            <span className="text-sm text-gray-800">{PERMISSION_LABELS[key]}</span>
                            <div className={`w-9 h-5 rounded-full transition-colors flex items-center px-0.5 ${enabled ? 'bg-green-500' : 'bg-gray-300'}`}>
                              <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${enabled ? 'translate-x-4' : 'translate-x-0'}`} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end mt-5">
                <button onClick={savePermissions} disabled={saving}
                  className="px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
                  {saving ? 'Saving...' : '💾 Save Permissions'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create staff modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowCreate(false)} />
          <div className="relative bg-white rounded-xl shadow-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Create Staff Account</h3>
            <form onSubmit={createStaff} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Full Name</label>
                <input required value={createForm.displayName}
                  onChange={(e) => setCreateForm((p) => ({ ...p, displayName: e.target.value }))}
                  className={inputClass} placeholder="Dr. Jane Smith" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Username</label>
                <input required value={createForm.username}
                  onChange={(e) => setCreateForm((p) => ({ ...p, username: e.target.value.toLowerCase().replace(/\s/g, '') }))}
                  className={inputClass} placeholder="jane.smith" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Password</label>
                <input required type="password" value={createForm.password}
                  onChange={(e) => setCreateForm((p) => ({ ...p, password: e.target.value }))}
                  className={inputClass} placeholder="Min 6 characters" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Role</label>
                <select value={createForm.role}
                  onChange={(e) => setCreateForm((p) => ({ ...p, role: e.target.value }))}
                  className={inputClass}>
                  <option value="assistant">Assistant Dentist</option>
                  <option value="receptionist">Receptionist</option>
                </select>
                <p className="text-xs text-gray-400 mt-1">Permissions will be set to role defaults. You can fine-tune them after.</p>
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <button type="button" onClick={() => setShowCreate(false)}
                  className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={saving}
                  className="px-5 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
                  {saving ? 'Creating...' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={deleteId !== null}
        title="Delete Staff Account"
        description="This will permanently delete this staff account. They will no longer be able to log in."
        confirmLabel="Delete Account"
        destructive
        onConfirm={deleteStaff}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
