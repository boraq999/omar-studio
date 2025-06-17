
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, PlusCircle, UsersRound, Loader2 } from 'lucide-react';
import type { User } from '@/types/users';
import { getAllUsers, deleteUser as apiDeleteUser } from '@/lib/authService';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { UserForm } from '@/components/users/UserForm';
import { useAuth } from '@/contexts/AuthContext';

export function UsersClientPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isUserFormOpen, setIsUserFormOpen] = useState(false);
  const { toast } = useToast();
  const { currentUser } = useAuth();

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const fetchedUsers = await getAllUsers();
      setUsers(fetchedUsers);
    } catch (error) {
      toast({ title: "خطأ", description: "فشل تحميل قائمة المستخدمين.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (userId: number) => {
    setIsSubmitting(true);
    try {
      await apiDeleteUser(userId);
      setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
      toast({ title: "نجاح", description: "تم حذف المستخدم بنجاح." });
    } catch (error) {
      const err = error as Error;
      toast({ title: "خطأ في الحذف", description: err.message || "لم نتمكن من حذف المستخدم.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const openAddUserDialog = () => {
    setSelectedUser(null);
    setIsUserFormOpen(true);
  };

  const openEditUserDialog = (user: User) => {
    setSelectedUser(user);
    setIsUserFormOpen(true);
  };
  
  const onUserFormSubmitSuccess = () => {
    setIsUserFormOpen(false);
    setSelectedUser(null);
    fetchUsers(); // Refresh the list
  };

  const canManageUsers = useMemo(() => currentUser?.permissions.includes('manage_users'), [currentUser]);

  if (!canManageUsers && !isLoading) {
    return (
      <div className="text-center py-10 text-destructive">
        <UsersRound size={48} className="mx-auto mb-2" />
        <p>ليس لديك الصلاحية لعرض هذه الصفحة.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-end">
            <Skeleton className="h-10 w-32" />
        </div>
        <Card>
            <TableHeader>
              <TableRow>
                {[...Array(5)].map((_, i) => <TableHead key={i}><Skeleton className="h-5 w-full" /></TableHead>)}
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...Array(3)].map((_, i) => (
                <TableRow key={i}>
                  {[...Array(5)].map((_, j) => <TableCell key={j}><Skeleton className="h-5 w-full" /></TableCell>)}
                </TableRow>
              ))}
            </TableBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Dialog open={isUserFormOpen} onOpenChange={setIsUserFormOpen}>
          <DialogTrigger asChild>
            <Button onClick={openAddUserDialog} disabled={!canManageUsers}>
              <PlusCircle className="ml-2 h-5 w-5" />
              إضافة مستخدم جديد
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg" onInteractOutside={(e) => e.preventDefault()}>
            <DialogHeader>
              <DialogTitle className="font-headline text-xl">
                {selectedUser ? "تعديل بيانات المستخدم" : "إضافة مستخدم جديد"}
              </DialogTitle>
            </DialogHeader>
            <UserForm
              initialData={selectedUser}
              onSuccess={onUserFormSubmitSuccess}
              onCancel={() => setIsUserFormOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {users.length === 0 && !isLoading ? (
        <div className="text-center py-10 text-muted-foreground">
          <UsersRound size={48} className="mx-auto mb-2" />
          <p>لا يوجد مستخدمون لعرضهم. قم بإضافة مستخدم جديد.</p>
        </div>
      ) : (
        <Card className="shadow-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>اسم المستخدم</TableHead>
                <TableHead>الاسم الكامل</TableHead>
                <TableHead>الدور</TableHead>
                <TableHead>الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.id}</TableCell>
                  <TableCell className="font-medium">{user.username}</TableCell>
                  <TableCell>{user.fullName || '-'}</TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell className="space-x-1 whitespace-nowrap">
                    <Button variant="ghost" size="icon" onClick={() => openEditUserDialog(user)} disabled={!canManageUsers || isSubmitting} aria-label="Edit User">
                      <Edit className="h-4 w-4 text-yellow-500" />
                    </Button>
                    {currentUser?.id !== user.id && ( // Prevent admin from deleting themselves
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" disabled={!canManageUsers || isSubmitting} aria-label="Delete User">
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>هل أنت متأكد من رغبتك في حذف هذا المستخدم؟</AlertDialogTitle>
                            <AlertDialogDescription>
                              سيتم حذف المستخدم ({user.username}) نهائياً ولا يمكن التراجع عن هذا الإجراء.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>إلغاء</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(user.id)} className="bg-destructive hover:bg-destructive/90" disabled={isSubmitting}>
                              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                              حذف
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
