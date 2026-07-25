// ─── Permission Keys ──────────────────────────────────────────────────────────
export const ALL_PERMISSIONS = [
  'can_view_patients',
  'can_edit_patients',
  'can_delete_patients',
  'can_view_appointments',
  'can_edit_appointments',
  'can_view_visits',
  'can_edit_visits',
  'can_delete_visits',
  'can_view_earnings',       // finance gate
  'can_edit_earnings',       // finance gate
  'can_view_reports',        // reports gate
  'can_view_follow_ups',
  'can_edit_follow_ups',
  'can_manage_inventory',
  'can_view_files',
  'can_upload_files',
] as const;

export type PermissionKey = (typeof ALL_PERMISSIONS)[number];

export type StaffPermissions = Partial<Record<PermissionKey, boolean>>;

export const PERMISSION_LABELS: Record<PermissionKey, string> = {
  can_view_patients: 'View Patients',
  can_edit_patients: 'Add / Edit Patients',
  can_delete_patients: 'Delete Patients',
  can_view_appointments: 'View Appointments',
  can_edit_appointments: 'Book / Edit Appointments',
  can_view_visits: 'View Visits',
  can_edit_visits: 'Record / Edit Visits',
  can_delete_visits: 'Delete Visits',
  can_view_earnings: 'View Billing & Earnings',
  can_edit_earnings: 'Edit Billing',
  can_view_reports: 'View Reports',
  can_view_follow_ups: 'View Follow-ups',
  can_edit_follow_ups: 'Manage Follow-ups',
  can_manage_inventory: 'Manage Inventory',
  can_view_files: 'View Patient Files',
  can_upload_files: 'Upload Files',
};

export const PERMISSION_GROUPS = [
  {
    label: 'Patients',
    keys: ['can_view_patients', 'can_edit_patients', 'can_delete_patients'] as PermissionKey[],
  },
  {
    label: 'Appointments',
    keys: ['can_view_appointments', 'can_edit_appointments'] as PermissionKey[],
  },
  {
    label: 'Visits',
    keys: ['can_view_visits', 'can_edit_visits', 'can_delete_visits'] as PermissionKey[],
  },
  {
    label: 'Finance (Restricted)',
    keys: ['can_view_earnings', 'can_edit_earnings', 'can_view_reports'] as PermissionKey[],
  },
  {
    label: 'Follow-ups',
    keys: ['can_view_follow_ups', 'can_edit_follow_ups'] as PermissionKey[],
  },
  {
    label: 'Inventory',
    keys: ['can_manage_inventory'] as PermissionKey[],
  },
  {
    label: 'Files',
    keys: ['can_view_files', 'can_upload_files'] as PermissionKey[],
  },
];

// ─── Role Presets ─────────────────────────────────────────────────────────────
export type StaffRole = 'owner' | 'assistant' | 'receptionist';

export const ROLE_LABELS: Record<StaffRole, string> = {
  owner: 'Owner (Main Doctor)',
  assistant: 'Assistant Dentist',
  receptionist: 'Receptionist',
};

export const ROLE_DEFAULTS: Record<Exclude<StaffRole, 'owner'>, StaffPermissions> = {
  assistant: {
    can_view_patients: true,
    can_edit_patients: true,
    can_delete_patients: false,
    can_view_appointments: true,
    can_edit_appointments: true,
    can_view_visits: true,
    can_edit_visits: true,
    can_delete_visits: false,
    can_view_earnings: false,   // NO finance
    can_edit_earnings: false,
    can_view_reports: false,    // NO reports
    can_view_follow_ups: true,
    can_edit_follow_ups: true,
    can_manage_inventory: true,
    can_view_files: true,
    can_upload_files: true,
  },
  receptionist: {
    can_view_patients: true,
    can_edit_patients: false,
    can_delete_patients: false,
    can_view_appointments: true,
    can_edit_appointments: true,
    can_view_visits: false,
    can_edit_visits: false,
    can_delete_visits: false,
    can_view_earnings: false,
    can_edit_earnings: false,
    can_view_reports: false,
    can_view_follow_ups: true,
    can_edit_follow_ups: false,
    can_manage_inventory: false,
    can_view_files: false,
    can_upload_files: false,
  },
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Owner always has all permissions */
export function isOwner(session: any): boolean {
  return true;
}

export function hasPermission(session: any, key: PermissionKey): boolean {
  return true;
}


export function parsePermissions(raw: string | null | undefined): StaffPermissions {
  if (!raw) return {};
  try { return JSON.parse(raw); } catch { return {}; }
}
