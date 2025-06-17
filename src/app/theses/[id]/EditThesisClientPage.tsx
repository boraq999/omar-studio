
"use client";

import { useState, useEffect } from 'react';
import { ThesisForm } from '@/components/theses/ThesisForm';
import type { Thesis, University, Specialization, Degree } from '@/types/api';
// API function to get a single thesis by ID is missing from the spec.
// We will rely on initialThesisData prop or show a message.
import { Skeleton } from '@/components/ui/skeleton'; // Assuming Skeleton is available
import { AlertTriangle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';


interface EditThesisClientPageProps {
  thesisId: number;
  initialThesisData?: Thesis; // Passed from server component if found
  universities: University[];
  specializations: Specialization[];
  degrees: Degree[];
}

export function EditThesisClientPage({
  thesisId,
  initialThesisData,
  universities,
  specializations,
  degrees,
}: EditThesisClientPageProps) {
  const [thesis, setThesis] = useState<Thesis | undefined>(initialThesisData);
  const [isLoading, setIsLoading] = useState(!initialThesisData); // True if data wasn't pre-fetched
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // This useEffect is a fallback if initialThesisData is not provided.
    // Ideally, the server component should provide it.
    // Without a GET /theses/:id endpoint, client-side fetching of a single thesis is hard.
    if (!initialThesisData) {
      // Simulate loading and then show error as we can't fetch single thesis directly
      const timer = setTimeout(() => {
        setIsLoading(false);
        setError("تعذر تحميل بيانات الرسالة. لا يوجد API مباشر لجلب رسالة واحدة بالمعرف.");
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [thesisId, initialThesisData]);

  if (isLoading) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="p-6 space-y-4">
          <Skeleton className="h-8 w-1/2" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <div className="grid grid-cols-3 gap-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
          <Skeleton className="h-10 w-full" />
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
            <p className="text-sm text-muted-foreground mt-2">الرجاء التأكد من أن الرسالة موجودة أو أن الـ API يدعم جلب رسالة فردية.</p>
        </div>
    );
  }

  if (!thesis) {
     return (
        <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-card rounded-lg shadow-md">
            <AlertTriangle className="w-16 h-16 text-destructive mb-4" />
            <h2 className="text-xl font-semibold text-destructive mb-2">الرسالة غير موجودة</h2>
            <p className="text-muted-foreground">لم نتمكن من العثور على الرسالة المطلوبة بالمعرف: {thesisId}.</p>
        </div>
    );
  }

  return (
    <ThesisForm
      initialData={thesis}
      universities={universities}
      specializations={specializations}
      degrees={degrees}
    />
  );
}

