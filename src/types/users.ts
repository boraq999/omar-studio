
export type PermissionId =
  | 'view_dashboard'
  | 'manage_theses' // Includes add, edit, archive
  | 'manage_archived_theses' // Includes restore, permanent_delete
  | 'manage_reserved_titles' // Includes add, edit, delete
  | 'manage_universities_specializations'
  | 'manage_users';

export interface Permission {
  id: PermissionId;
  label: string;
  description?: string;
}

export const ALL_PERMISSIONS: Permission[] = [
  { id: 'view_dashboard', label: 'عرض لوحة التحكم' },
  { id: 'manage_theses', label: 'إدارة الرسائل (إضافة، تعديل، أرشفة)' },
  { id: 'manage_archived_theses', label: 'إدارة الأرشيف (استعادة، حذف نهائي)' },
  { id: 'manage_reserved_titles', label: 'إدارة العناوين المحجوزة (إضافة، تعديل، حذف)' },
  { id: 'manage_universities_specializations', label: 'إدارة الجامعات والتخصصات' },
  { id: 'manage_users', label: 'إدارة المستخدمين (إضافة، تعديل، حذف)' },
];

export type UserRole = 'admin' | 'editor' | 'viewer';

export interface User {
  id: number;
  username: string;
  fullName?: string;
  role: UserRole;
  permissions: PermissionId[];
  // In a real app, you would store a password hash, not the password itself.
  // For this mock, we might not even store it.
}
