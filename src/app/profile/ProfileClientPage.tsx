
"use client";

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { UpdateProfileForm } from '@/components/profile/UpdateProfileForm';
import { ChangePasswordForm } from '@/components/profile/ChangePasswordForm';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertTriangle } from 'lucide-react';

export function ProfileClientPage() {
  const { currentUser, isLoading, refetchUser } = useAuth();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-1/3 mb-2" />
            <Skeleton className="h-4 w-2/3" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-1/4 ml-auto" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-1/3 mb-2" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-1/4 ml-auto" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-card rounded-lg shadow-md">
        <AlertTriangle className="w-16 h-16 text-destructive mb-4" />
        <h2 className="text-xl font-semibold text-destructive mb-2">خطأ في تحميل الملف الشخصي</h2>
        <p className="text-muted-foreground">لم يتم العثور على بيانات المستخدم. قد تحتاج إلى تسجيل الدخول.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-2">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-xl">تحديث معلومات الملف الشخصي</CardTitle>
          <CardDescription>قم بتعديل اسمك الكامل هنا.</CardDescription>
        </CardHeader>
        <CardContent>
          <UpdateProfileForm currentUser={currentUser} onProfileUpdate={refetchUser} />
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-xl">تغيير كلمة المرور</CardTitle>
        </CardHeader>
        <CardContent>
          <ChangePasswordForm userId={currentUser.id} />
        </CardContent>
      </Card>
    </div>
  );
}
