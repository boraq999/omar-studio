"use client";

import { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ArchiveRestore, Trash2, FileText, Download } from 'lucide-react';
import type { ArchivedThesis } from '@/types/api';
import { restoreArchivedThesis, permanentlyDeleteThesis, getArchivedTheses } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface ArchiveClientPageProps {
  initialArchivedTheses: ArchivedThesis[];
}

export function ArchiveClientPage({ initialArchivedTheses }: ArchiveClientPageProps) {
  const [archivedTheses, setArchivedTheses] = useState<ArchivedThesis[]>([]); // ابدأ ببيانات فارغة
  const [isLoading, setIsLoading] = useState(false); // For actions
  const [refreshing, setRefreshing] = useState(true); // ابدأ بتحميل البيانات
  const { toast } = useToast();

  // جلب البيانات تلقائياً عند تحميل الصفحة
  useEffect(() => {
    const fetchData = async () => {
      setRefreshing(true);
      try {
        const data = await getArchivedTheses();
        setArchivedTheses(data);
      } catch (error) {
        toast({ title: 'خطأ في التحديث', description: 'تعذر تحديث بيانات الأرشيف.', variant: 'destructive' });
      } finally {
        setRefreshing(false);
      }
    };
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const data = await getArchivedTheses();
      setArchivedTheses(data);
      toast({ title: 'تم التحديث', description: 'تم تحديث بيانات الأرشيف.' });
    } catch (error) {
      toast({ title: 'خطأ في التحديث', description: 'تعذر تحديث بيانات الأرشيف.', variant: 'destructive' });
    } finally {
      setRefreshing(false);
    }
  };

  const handleRestore = async (id: number) => {
    setIsLoading(true);
    try {
      await restoreArchivedThesis(id);
      setArchivedTheses(archivedTheses.filter(thesis => thesis.id !== id));
      toast({ title: "نجاح", description: "تمت استعادة الرسالة بنجاح." });
    } catch (error) {
      toast({ title: "خطأ في الاستعادة", description: "لم نتمكن من استعادة الرسالة. حاول مرة أخرى.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletePermanently = async (id: number) => {
    setIsLoading(true);
    try {
      // Using the API endpoint from section 5.3: DELETE /api/theses/{id}
      await permanentlyDeleteThesis(id); 
      setArchivedTheses(archivedTheses.filter(thesis => thesis.id !== id));
      toast({ title: "نجاح", description: "تم حذف الرسالة نهائياً." });
    } catch (error) {
      toast({ title: "خطأ في الحذف", description: "لم نتمكن من حذف الرسالة نهائياً. حاول مرة أخرى.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  if (refreshing) {
    return (
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[250px]" />
              <Skeleton className="h-4 w-[200px]" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (archivedTheses.length === 0) {
    return (
      <div className="text-center py-10 text-muted-foreground">
        <FileText size={48} className="mx-auto mb-2" />
        <p>الأرشيف فارغ حالياً.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={handleRefresh} disabled={refreshing || isLoading} variant="outline">
          {refreshing ? 'جاري التحديث...' : 'تحديث'}
        </Button>
      </div>
      <Card className="shadow-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>العنوان</TableHead>
            <TableHead>المؤلف</TableHead>
            <TableHead>الجامعة</TableHead>
            <TableHead>السنة</TableHead>
            <TableHead>الإجراءات</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {archivedTheses.map((thesis) => (
            <TableRow key={thesis.id}>
              <TableCell className="font-medium">{thesis.title}</TableCell>
              <TableCell>{thesis.author.name}</TableCell>
              <TableCell>{thesis.university.name}</TableCell>
              <TableCell>{thesis.year}</TableCell>
              <TableCell className="space-x-1 whitespace-nowrap">
                 <Button variant="ghost" size="icon" asChild>
                    <a href={`${thesis.pdf_path}`} target="_blank" rel="noopener noreferrer" aria-label="Download PDF">
                      <Download className="h-4 w-4 text-blue-500" />
                    </a>
                  </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" disabled={isLoading} aria-label="Restore Thesis">
                      <ArchiveRestore className="h-4 w-4 text-green-500" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>هل أنت متأكد من رغبتك في استعادة هذه الرسالة؟</AlertDialogTitle>
                      <AlertDialogDescription>
                        سيتم نقل هذه الرسالة من الأرشيف إلى قائمة الرسائل النشطة.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>إلغاء</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleRestore(thesis.id)} className="bg-green-500 hover:bg-green-600">
                        استعادة
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" disabled={isLoading} aria-label="Delete Thesis Permanently">
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>هل أنت متأكد من رغبتك في حذف هذه الرسالة نهائياً؟</AlertDialogTitle>
                      <AlertDialogDescription>
                        هذا الإجراء لا يمكن التراجع عنه. سيتم حذف الرسالة بشكل دائم من النظام.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>إلغاء</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDeletePermanently(thesis.id)} className="bg-destructive hover:bg-destructive/90">
                        حذف نهائي
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      </Card>
    </div>
  );
}
