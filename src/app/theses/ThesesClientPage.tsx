
"use client";

import type React from 'react';
import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Archive, Edit, FileText, Search, Trash2, Download } from 'lucide-react';
import Link from 'next/link';
import type { Thesis, University, Specialization, Degree, ThesisYear } from '@/types/api';
import { searchTheses as apiSearchTheses, archiveThesis as apiArchiveThesis } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Skeleton } from '@/components/ui/skeleton';


interface ThesesClientPageProps {
  initialTheses: Thesis[];
  universities: University[];
  specializations: Specialization[];
  degrees: Degree[];
  years: ThesisYear[];
}

export function ThesesClientPage({ initialTheses, universities, specializations, degrees, years }: ThesesClientPageProps) {
  const [theses, setTheses] = useState<Thesis[]>(initialTheses);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    university_id: '',
    specialization_id: '',
    degree_id: '',
    year: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setIsLoading(true);
    try {
      const searchParams: any = { title: searchTerm };
      if (filters.university_id) searchParams.university_id = filters.university_id;
      if (filters.specialization_id) searchParams.specialization_id = filters.specialization_id;
      if (filters.degree_id) searchParams.degree_id = filters.degree_id;
      if (filters.year) searchParams.year = filters.year;
      
      const results = await apiSearchTheses(searchParams);
      setTheses(results);
    } catch (error) {
      toast({ title: "خطأ في البحث", description: "لم نتمكن من إجراء البحث. حاول مرة أخرى.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleArchive = async (id: number) => {
    try {
      await apiArchiveThesis(id);
      setTheses(theses.filter(thesis => thesis.id !== id));
      toast({ title: "نجاح", description: "تم نقل الرسالة إلى الأرشيف بنجاح." });
    } catch (error) {
      toast({ title: "خطأ في الأرشفة", description: "لم نتمكن من أرشفة الرسالة. حاول مرة أخرى.", variant: "destructive" });
    }
  };
  
  const handleFilterChange = (filterName: keyof typeof filters, value: string) => {
    setFilters(prev => ({ ...prev, [filterName]: value }));
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 p-4 border rounded-lg shadow-sm bg-card">
        <Input
          type="text"
          placeholder="بحث بالعنوان..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="md:col-span-2 lg:col-span-2"
        />
         <Select value={filters.university_id} onValueChange={(value) => handleFilterChange('university_id', value)}>
            <SelectTrigger><SelectValue placeholder="اختر الجامعة" /></SelectTrigger>
            <SelectContent>
              {universities.map(uni => <SelectItem key={uni.id} value={uni.id.toString()}>{uni.name}</SelectItem>)}
            </SelectContent>
        </Select>
        <Select value={filters.specialization_id} onValueChange={(value) => handleFilterChange('specialization_id', value)}>
            <SelectTrigger><SelectValue placeholder="اختر التخصص" /></SelectTrigger>
            <SelectContent>
              {specializations.map(spec => <SelectItem key={spec.id} value={spec.id.toString()}>{spec.name}</SelectItem>)}
            </SelectContent>
        </Select>
        <Select value={filters.degree_id} onValueChange={(value) => handleFilterChange('degree_id', value)}>
            <SelectTrigger><SelectValue placeholder="اختر الدرجة" /></SelectTrigger>
            <SelectContent>
              {degrees.map(deg => <SelectItem key={deg.id} value={deg.id.toString()}>{deg.name}</SelectItem>)}
            </SelectContent>
        </Select>
        <Button type="submit" disabled={isLoading} className="w-full lg:col-span-1">
          <Search className="ml-2 h-4 w-4" />
          {isLoading ? 'جار البحث...' : 'بحث'}
        </Button>
      </form>

      {isLoading && (
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
      )}

      {!isLoading && theses.length === 0 && (
        <div className="text-center py-10 text-muted-foreground">
          <FileText size={48} className="mx-auto mb-2" />
          <p>لا توجد رسائل لعرضها. حاول تعديل معايير البحث أو إضافة رسائل جديدة.</p>
        </div>
      )}

      {!isLoading && theses.length > 0 && (
        <Card className="shadow-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>العنوان</TableHead>
              <TableHead>المؤلف</TableHead>
              <TableHead>الجامعة</TableHead>
              <TableHead>التخصص</TableHead>
              <TableHead>الدرجة</TableHead>
              <TableHead>السنة</TableHead>
              <TableHead>الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {theses.map((thesis) => (
              <TableRow key={thesis.id}>
                <TableCell className="font-medium">{thesis.title}</TableCell>
                <TableCell>{thesis.author.name}</TableCell>
                <TableCell>{thesis.university.name}</TableCell>
                <TableCell>{thesis.specialization.name}</TableCell>
                <TableCell>{thesis.degree.name}</TableCell>
                <TableCell>{thesis.year}</TableCell>
                <TableCell className="space-x-1 whitespace-nowrap">
                  <Button variant="ghost" size="icon" asChild>
                    <a href={`${thesis.pdf_path}`} target="_blank" rel="noopener noreferrer" aria-label="Download PDF">
                      <Download className="h-4 w-4 text-blue-500" />
                    </a>
                  </Button>
                  <Button variant="ghost" size="icon" asChild>
                    <Link href={`/theses/${thesis.id}/edit`} aria-label="Edit Thesis">
                       <Edit className="h-4 w-4 text-yellow-500" />
                    </Link>
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" aria-label="Archive Thesis">
                        <Archive className="h-4 w-4 text-orange-500" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>هل أنت متأكد من رغبتك في أرشفة هذه الرسالة؟</AlertDialogTitle>
                        <AlertDialogDescription>
                          سيتم نقل هذه الرسالة إلى الأرشيف ويمكن استعادتها لاحقًا.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>إلغاء</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleArchive(thesis.id)} className="bg-orange-500 hover:bg-orange-600">
                          أرشفة
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
      )}
    </div>
  );
}
