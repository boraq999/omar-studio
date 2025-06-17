
"use client";

import type React from 'react';
import { useState, useEffect, useMemo } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, Building, Library, Loader2 } from 'lucide-react';
import type { UniversityWithSpecializationsAdmin, Specialization } from '@/types/api';
import { addSpecializationToUniversity, getUniversitiesWithSpecializationsAdmin, getSpecializations as getAllSpecializationsApi } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Combobox } from '@/components/ui/combobox';

const addSpecializationDialogSchema = z.object({
  specialization_input: z.string().min(1, { message: "الرجاء إدخال أو اختيار تخصص." }),
});
type AddSpecializationDialogFormValues = z.infer<typeof addSpecializationDialogSchema>;

interface UniversitiesClientPageProps {
  initialUniversities: UniversityWithSpecializationsAdmin[];
  // allSpecializations prop is removed as it's fetched internally now
}

export function UniversitiesClientPage({ initialUniversities }: UniversitiesClientPageProps) {
  const [universities, setUniversities] = useState<UniversityWithSpecializationsAdmin[]>(initialUniversities);
  const [allSpecializationsData, setAllSpecializationsData] = useState<Specialization[]>([]);
  const [isLoadingAllSpecializations, setIsLoadingAllSpecializations] = useState(true);
  const [selectedUniversity, setSelectedUniversity] = useState<UniversityWithSpecializationsAdmin | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingUniversities, setIsLoadingUniversities] = useState(false); // For refreshing universities list
  const { toast } = useToast();

  const dialogForm = useForm<AddSpecializationDialogFormValues>({
    resolver: zodResolver(addSpecializationDialogSchema),
    defaultValues: { specialization_input: "" },
  });

  useEffect(() => {
    async function fetchGlobalSpecializations() {
      setIsLoadingAllSpecializations(true);
      try {
        const specs = await getAllSpecializationsApi();
        setAllSpecializationsData(specs);
      } catch (error) {
        toast({ title: "خطأ", description: "فشل تحميل قائمة التخصصات العامة.", variant: "destructive" });
      } finally {
        setIsLoadingAllSpecializations(false);
      }
    }
    fetchGlobalSpecializations();
  }, [toast]);
  
  const refreshUniversities = async () => {
    setIsLoadingUniversities(true);
    try {
        const updatedUniversities = await getUniversitiesWithSpecializationsAdmin();
        setUniversities(updatedUniversities);
    } catch (error) {
        toast({ title: "خطأ", description: "فشل تحديث قائمة الجامعات.", variant: "destructive" });
    } finally {
        setIsLoadingUniversities(false);
    }
  };

  const handleAddSpecialization = async (values: AddSpecializationDialogFormValues) => {
    if (!selectedUniversity) return;
    setIsSubmitting(true);

    const inputValue = values.specialization_input;
    const existingGlobalSpec = allSpecializationsData.find(s => s.name.toLowerCase() === inputValue.toLowerCase());

    let payload: { specialization_name: string } | { specialization_id: number };
    let specDisplayValue: string;

    if (existingGlobalSpec) {
      payload = { specialization_id: existingGlobalSpec.id };
      specDisplayValue = existingGlobalSpec.name;
    } else {
      payload = { specialization_name: inputValue };
      specDisplayValue = inputValue;
    }

    // Check if this specialization is already added to the current university
    const isAlreadyAddedToCurrentUni = selectedUniversity.specializations.some(uniSpec => {
        if (existingGlobalSpec) return uniSpec.id === existingGlobalSpec.id;
        return uniSpec.name.toLowerCase() === inputValue.toLowerCase();
    });

    if (isAlreadyAddedToCurrentUni) {
        toast({ title: "موجود بالفعل", description: `التخصص "${specDisplayValue}" مضاف بالفعل لجامعة "${selectedUniversity.name}".`, variant: "destructive" });
        setIsSubmitting(false);
        return;
    }

    try {
      await apiAddSpecializationToUniversity(selectedUniversity.id, payload);
      toast({ title: "نجاح", description: `تمت إضافة التخصص "${specDisplayValue}" إلى جامعة "${selectedUniversity.name}".` });
      dialogForm.reset();
      setSelectedUniversity(null); 
      await refreshUniversities(); 
    } catch (error) {
      toast({ title: "خطأ", description: "لم نتمكن من إضافة التخصص. حاول مرة أخرى.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const watchedSpecializationInput = dialogForm.watch('specialization_input');

  const isSpecializationAlreadyAddedForButton = useMemo(() => {
    if (!selectedUniversity || !watchedSpecializationInput || allSpecializationsData.length === 0) return false;
    
    const inputValue = watchedSpecializationInput.toLowerCase();
    const existingGlobalSpec = allSpecializationsData.find(s => s.name.toLowerCase() === inputValue);

    return selectedUniversity.specializations.some(uniSpec => {
      if (existingGlobalSpec) {
        return uniSpec.id === existingGlobalSpec.id;
      }
      return uniSpec.name.toLowerCase() === inputValue;
    });
  }, [watchedSpecializationInput, selectedUniversity, allSpecializationsData]);


  if (initialUniversities === null) {
     return (
      <div className="text-center py-10 text-destructive">
        <Building size={48} className="mx-auto mb-2" />
        <p>فشل تحميل بيانات الجامعات. يرجى المحاولة مرة أخرى لاحقًا.</p>
      </div>
    );
  }
  
  if (isLoadingUniversities && universities.length === 0 && initialUniversities.length > 0) {
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

  if (universities.length === 0 && !isLoadingUniversities) {
    return (
      <div className="text-center py-10 text-muted-foreground">
        <Building size={48} className="mx-auto mb-2" />
        <p>لا توجد جامعات لعرضها حالياً.</p>
      </div>
    );
  }

  const globalSpecializationOptions = allSpecializationsData.map(spec => ({ value: spec.name, label: spec.name }));

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
                    if (!isOpen) {
                        setSelectedUniversity(null);
                        dialogForm.reset(); // Reset form when dialog closes
                    } else {
                        setSelectedUniversity(uni);
                    }
                }}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" onClick={() => {
                        setSelectedUniversity(uni);
                        dialogForm.reset(); // Reset on open as well
                    }}>
                      <PlusCircle className="ml-1 h-4 w-4" /> إضافة تخصص
                    </Button>
                  </DialogTrigger>
                  {selectedUniversity?.id === uni.id && (
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle className="font-headline">إضافة تخصص لجامعة: {selectedUniversity.name}</DialogTitle>
                      <DialogDescription>
                        اختر تخصصاً موجوداً أو أدخل اسم تخصص جديد لإضافته لهذه الجامعة.
                      </DialogDescription>
                    </DialogHeader>
                    <Form {...dialogForm}>
                      <form onSubmit={dialogForm.handleSubmit(handleAddSpecialization)} className="space-y-4 py-4">
                        <FormField
                          control={dialogForm.control}
                          name="specialization_input"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>التخصص</FormLabel>
                              <FormControl>
                                <Combobox
                                  options={globalSpecializationOptions}
                                  value={field.value}
                                  onChange={(value) => field.onChange(value)}
                                  placeholder={
                                    isLoadingAllSpecializations ? "جاري تحميل التخصصات..." :
                                    globalSpecializationOptions.length === 0 ? "لا توجد تخصصات عامة" :
                                    "اختر أو أدخل اسم التخصص"
                                  }
                                  searchPlaceholder="ابحث عن تخصص..."
                                  notFoundText="لم يتم العثور على تخصص. يمكنك كتابة اسم جديد."
                                  disabled={isLoadingAllSpecializations}
                                />
                              </FormControl>
                              <FormMessage />
                              {isSpecializationAlreadyAddedForButton && watchedSpecializationInput && (
                                <p className="text-sm text-destructive">هذا التخصص مضاف بالفعل لهذه الجامعة.</p>
                              )}
                            </FormItem>
                          )}
                        />
                        <DialogFooter>
                           <DialogClose asChild><Button type="button" variant="outline">إلغاء</Button></DialogClose>
                           <Button 
                             type="submit" 
                             disabled={isSubmitting || isLoadingAllSpecializations || isSpecializationAlreadyAddedForButton || !watchedSpecializationInput.trim()}
                           >
                            {(isSubmitting || isLoadingAllSpecializations) && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
                            إضافة التخصص
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
       {isLoadingUniversities && universities.length > 0 && (
         <div className="text-center py-4">
           <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
           <p className="text-muted-foreground">جاري تحديث قائمة الجامعات...</p>
         </div>
       )}
    </div>
  );
}

