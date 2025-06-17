
"use client";

import type React from 'react';
import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, Building, Library } from 'lucide-react';
import type { UniversityWithSpecializationsAdmin, Specialization } from '@/types/api';
import { addSpecializationToUniversity as apiAddSpecializationToUniversity, getUniversitiesWithSpecializationsAdmin } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

const addSpecializationSchema = z.object({
  specialization_name: z.string().min(3, { message: "اسم التخصص يجب أن يكون 3 أحرف على الأقل." }),
  // Or specialization_id if choosing existing. For now, focusing on new.
});
type AddSpecializationFormValues = z.infer<typeof addSpecializationSchema>;

interface UniversitiesClientPageProps {
  initialUniversities: UniversityWithSpecializationsAdmin[];
  allSpecializations: Specialization[]; // For potential dropdown of existing specializations
}

export function UniversitiesClientPage({ initialUniversities, allSpecializations }: UniversitiesClientPageProps) {
  const [universities, setUniversities] = useState<UniversityWithSpecializationsAdmin[]>(initialUniversities);
  const [selectedUniversity, setSelectedUniversity] = useState<UniversityWithSpecializationsAdmin | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<AddSpecializationFormValues>({
    resolver: zodResolver(addSpecializationSchema),
    defaultValues: { specialization_name: "" },
  });
  
  const refreshUniversities = async () => {
    setIsLoading(true);
    try {
        const updatedUniversities = await getUniversitiesWithSpecializationsAdmin();
        setUniversities(updatedUniversities);
    } catch (error) {
        toast({ title: "خطأ", description: "فشل تحديث قائمة الجامعات.", variant: "destructive" });
    } finally {
        setIsLoading(false);
    }
  };

  const handleAddSpecialization = async (values: AddSpecializationFormValues) => {
    if (!selectedUniversity) return;
    setIsSubmitting(true);
    try {
      await apiAddSpecializationToUniversity(selectedUniversity.id, { specialization_name: values.specialization_name });
      toast({ title: "نجاح", description: `تمت إضافة التخصص "${values.specialization_name}" إلى جامعة "${selectedUniversity.name}".` });
      form.reset();
      setSelectedUniversity(null); // Close dialog by resetting selectedUniversity
      await refreshUniversities(); // Refresh the list
    } catch (error) {
      toast({ title: "خطأ", description: "لم نتمكن من إضافة التخصص. حاول مرة أخرى.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (initialUniversities === null) {
     return (
      <div className="text-center py-10 text-destructive">
        <Building size={48} className="mx-auto mb-2" />
        <p>فشل تحميل بيانات الجامعات. يرجى المحاولة مرة أخرى لاحقًا.</p>
      </div>
    );
  }
  
  if (isLoading && universities.length === 0 && initialUniversities.length > 0) {
     return (
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="p-4">
              <Skeleton className="h-6 w-1/2 mb-2" />
              <div className="flex flex-wrap gap-2">
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-6 w-24 rounded-full" />
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
              <Skeleton className="h-8 w-32 mt-3" />
            </Card>
          ))}
        </div>
      );
  }


  if (universities.length === 0) {
    return (
      <div className="text-center py-10 text-muted-foreground">
        <Building size={48} className="mx-auto mb-2" />
        <p>لا توجد جامعات لعرضها حالياً.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead><Building className="inline ml-1 h-5 w-5" /> اسم الجامعة</TableHead>
            <TableHead><Library className="inline ml-1 h-5 w-5" /> التخصصات</TableHead>
            <TableHead>الإجراءات</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {universities.map((uni) => (
            <TableRow key={uni.id}>
              <TableCell className="font-medium font-headline">{uni.name}</TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-2">
                  {uni.specializations.length > 0 ? (
                    uni.specializations.map((spec) => (
                      <Badge key={spec.id} variant="secondary" className="text-sm">{spec.name}</Badge>
                    ))
                  ) : (
                    <span className="text-xs text-muted-foreground">لا توجد تخصصات</span>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <Dialog open={selectedUniversity?.id === uni.id} onOpenChange={(isOpen) => {
                    if (!isOpen) setSelectedUniversity(null); else setSelectedUniversity(uni);
                    form.reset(); // Reset form when dialog opens/closes
                }}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" onClick={() => setSelectedUniversity(uni)}>
                      <PlusCircle className="ml-1 h-4 w-4" /> إضافة تخصص
                    </Button>
                  </DialogTrigger>
                  {selectedUniversity?.id === uni.id && (
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle className="font-headline">إضافة تخصص جديد لجامعة: {selectedUniversity.name}</DialogTitle>
                      <DialogDescription>
                        أدخل اسم التخصص الجديد الذي ترغب بإضافته لهذه الجامعة.
                      </DialogDescription>
                    </DialogHeader>
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(handleAddSpecialization)} className="space-y-4 py-4">
                        <FormField
                          control={form.control}
                          name="specialization_name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>اسم التخصص الجديد</FormLabel>
                              <FormControl>
                                <Input placeholder="مثال: هندسة البرمجيات" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <DialogFooter>
                           <DialogClose asChild><Button type="button" variant="outline">إلغاء</Button></DialogClose>
                           <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? "جاري الإضافة..." : "إضافة التخصص"}
                           </Button>
                        </DialogFooter>
                      </form>
                    </Form>
                  </DialogContent>
                  )}
                </Dialog>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      </Card>
    </div>
  );
}
