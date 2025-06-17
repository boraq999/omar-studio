
import type { User, UserRole, PermissionId } from '@/types/users';
import { ALL_PERMISSIONS } from '@/types/users';

// Mock database for users
let users: User[] = [
  {
    id: 1,
    username: 'omar',
    fullName: 'عمر المسؤول',
    role: 'admin',
    permissions: ALL_PERMISSIONS.map(p => p.id), // Admin has all permissions
  },
  {
    id: 2,
    username: 'editor_user',
    fullName: 'مستخدم محرر',
    role: 'editor',
    permissions: ['view_dashboard', 'manage_theses', 'manage_archived_theses', 'manage_reserved_titles', 'manage_universities_specializations'],
  },
];

let nextUserId = 3;

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function getCurrentUser(): Promise<User | null> {
  await delay(100);
  // For now, always return the admin user or the first user for simplicity
  // In a real app, this would involve session/token validation
  return users.find(u => u.username === 'omar') || null;
}

export async function getAllUsers(): Promise<User[]> {
  await delay(300);
  return [...users];
}

export async function getUserById(id: number): Promise<User | undefined> {
  await delay(100);
  return users.find(user => user.id === id);
}

export interface AddUserInput {
  username: string;
  fullName?: string;
  password?: string; // Password will be handled by a backend in a real app
  role: UserRole;
  permissions: PermissionId[];
}

export async function addUser(userData: AddUserInput): Promise<User> {
  await delay(500);
  if (users.some(u => u.username === userData.username)) {
    throw new Error('اسم المستخدم موجود بالفعل.');
  }
  const newUser: User = {
    id: nextUserId++,
    username: userData.username,
    fullName: userData.fullName,
    role: userData.role,
    permissions: userData.permissions,
  };
  users.push(newUser);
  console.log('Mock addUser: User added, password (if provided) was ignored for mock.', newUser);
  return newUser;
}

export interface UpdateUserInput {
  id: number;
  username?: string;
  fullName?: string;
  role?: UserRole;
  permissions?: PermissionId[];
  // Password change would typically be a separate, more secure endpoint/process
}

export async function updateUser(userId: number, updates: Omit<UpdateUserInput, 'id'>): Promise<User> {
  await delay(500);
  const userIndex = users.findIndex(u => u.id === userId);
  if (userIndex === -1) {
    throw new Error('المستخدم غير موجود.');
  }
  if (updates.username && users.some(u => u.username === updates.username && u.id !== userId)) {
    throw new Error('اسم المستخدم موجود بالفعل لمستخدم آخر.');
  }
  users[userIndex] = { ...users[userIndex], ...updates };
  console.log('Mock updateUser:', users[userIndex]);
  return users[userIndex];
}

export async function deleteUser(userId: number): Promise<{ message: string }> {
  await delay(500);
  users = users.filter(u => u.id !== userId);
  console.log(`Mock deleteUser: User with id ${userId} deleted.`);
  return { message: 'تم حذف المستخدم بنجاح.' };
}

export async function updateProfile(userId: number, data: { fullName?: string }): Promise<User> {
  await delay(300);
  const user = await getUserById(userId);
  if (!user) throw new Error("المستخدم غير موجود.");
  
  const updatedUser = { ...user, fullName: data.fullName || user.fullName };
  users = users.map(u => u.id === userId ? updatedUser : u);
  return updatedUser;
}

export async function changePassword(userId: number, currentPassword?: string, newPassword?: string): Promise<{ message: string }> {
  await delay(500);
  // In a real app, you'd validate the currentPassword against the stored hash
  // and then hash the newPassword before saving.
  // For this mock, we just log it.
  const user = await getUserById(userId);
  if (!user) throw new Error("المستخدم غير موجود.");

  console.log(`Mock changePassword for user ${userId}: Current password was "${currentPassword}", New password would be "${newPassword}". This is a mock; password not actually changed.`);
  if (user.username === 'omar' && currentPassword !== '11223344' && currentPassword !== undefined) { // only check for omar for demo
      // throw new Error("كلمة المرور الحالية غير صحيحة."); // Example error
  }
  return { message: 'تم تغيير كلمة المرور بنجاح (محاكاة).' };
}

// Mock logout
export async function logout(): Promise<void> {
  await delay(100);
  console.log('Mock logout successful.');
  // In a real app, this would clear session/token
}
