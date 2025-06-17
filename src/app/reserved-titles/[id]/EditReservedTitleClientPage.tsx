
"use client";

import { useState, useEffect } from 'react';
import { ReservedTitleForm } from '@/components/reserved-titles/ReservedTitleForm';
import type { ReservedThesisTitle } from '@/types/api';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertTriangle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface EditReservedTitleClientPageProps {
  titleId: number;
  initialTitleData?: ReservedThesisTitle;
}

export function EditReservedTitleClientPage({ titleId, initialTitleData }: EditReservedTitleClientPageProps) {
  const [titleData, setTitleData] = useState<ReservedThesisTitle | undefined>(initialTitleData);
  const [isLoading, setIsLoading] = useState(!initialTitleData);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fallback if data isn't pre-fetched. Ideally, server provides it.
    // No direct API to fetch single reserved title by ID.
    if (!initialTitleData) {
      const timer = setTimeout(() => {
        setIsLoading(false);
        setError("تعذر تحميل بيانات العنوان المحجوز. لا يوجد API مباشر لجلبه بالمعرف.");
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [titleId, initialTitleData]);

  if (isLoading) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="p-6 space-y-4">
          <Skeleton className="h-8 w-1/2" />
          <Skeleton className="h-10 w-full" />
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
          <Skeleton className="h-12 w-1/3 ml-auto" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-card rounded-lg shadow-md">
        <AlertTriangle className="w-16 h-16 text-destructive mb-4" />
        <h2 className="text-xl font-semibold text-destructive mb-2">خطأ في تحميل البيانات</h2>
        <p className="text-muted-foreground">{error}</p>
      </div>
    );
  }

  if (!titleData) {
    return (
       <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-card rounded-lg shadow-md">
        <AlertTriangle className="w-16 h-16 text-destructive mb-4" />
        <h2 className="text-xl font-semibold text-destructive mb-2">العنوان المحجوز غير موجود</h2>
        <p className="text-muted-foreground">لم نتمكن من العثور على العنوان المطلوب بالمعرف: {titleId}.</p>
      </div>
    );
  }

  return <ReservedTitleForm initialData={titleData} />;
}
