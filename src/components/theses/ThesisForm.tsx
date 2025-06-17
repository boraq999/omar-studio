
"use client";

import React, { useState, useEffect } from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { CalendarIcon, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { arSA } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import type { Thesis, Degree, UniversityWithSpecializationsAdmin, Specialization as SpecializationType } from "@/types/api";
import { addThesis, updateThesis, getUniversitiesWithSpecializationsAdmin, getDegrees } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const thesisFormSchema = z.object({
  title: z.string().min(5, { message: "العنوان يجب أن يكون 5 أحرف على الأقل." }),
  year: z.date({ required_error: "تاريخ النشر مطلوب." }), // Changed from string to date
  university_id: z.string().min(1, { message: "الرجاء اختيار الجامعة." }),
  specialization_id: z.string().min(1, { message: "الرجاء اختيار التخصص." }),
  degree_id: z.string().min(1, { message: "الرجاء اختيار الدرجة." }),
  author_name: z.string().min(3, { message: "اسم المؤلف يجب أن يكون 3 أحرف على الأقل." }),
  pdf: z.instanceof(File).optional(),
});

type ThesisFormValues = z.infer<typeof thesisFormSchema>;

interface ThesisFormProps {
  initialData?: Thesis & { author_name?: string };
}

export function ThesisForm({ initialData }: ThesisFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  
  const [universitiesWithSpecs, setUniversitiesWithSpecs] = useState<UniversityWithSpecializationsAdmin[]>([]);
  const [availableSpecializations, setAvailableSpecializations] = useState<SpecializationType[]>([]);
  const [degrees, setDegrees] = useState<Degree[]>([]);
  const [isLoadingDropdowns, setIsLoadingDropdowns] = useState(true);

  const defaultValues = initialData
    ? {
        title: initialData.title,
        year: initialData.year ? new Date(parseInt(initialData.year, 10), 0, 1) : new Date(), // Parse year string to Date
        university_id: initialData.university.id.toString(),
        specialization_id: initialData.specialization.id.toString(),
        degree_id: initialData.degree.id.toString(),
        author_name: initialData.author?.name || initialData.author_name || "",
      }
    : {
        title: "",
        year: new Date(), // Default to current date for new thesis
        university_id: "",
        specialization_id: "",
        degree_id: "",
        author_name: "",
      };

  const form = useForm<ThesisFormValues>({
    resolver: zodResolver(thesisFormSchema),
    defaultValues,
  });

  useEffect(() => {
    async function fetchData() {
      setIsLoadingDropdowns(true);
      try {
        const [univs, fetchedDegrees] = await Promise.all([
          getUniversitiesWithSpecializationsAdmin(),
          getDegrees()
        ]);
        setUniversitiesWithSpecs(univs);
        setDegrees(fetchedDegrees);

        if (initialData?.university?.id) {
          form.setValue('university_id', initialData.university.id.toString());
        }
      } catch (err) {
        toast({ title: "خطأ", description: "فشل تحميل بيانات الجامعات أو الدرجات.", variant: "destructive" });
      } finally {
        setIsLoadingDropdowns(false);
      }
    }
    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialData?.university?.id]); 

  const watchedUniversityId = form.watch('university_id');

  useEffect(() => {
    if (watchedUniversityId) {
      const selectedUniv = universitiesWithSpecs.find(uni => uni.id.toString() === watchedUniversityId);
      const newAvailableSpecializations = selectedUniv ? selectedUniv.specializations : [];
      setAvailableSpecializations(newAvailableSpecializations);
      
      if (initialData?.specialization?.id && selectedUniv && selectedUniv.id.toString() === initialData.university.id.toString()) {
        const foundSpec = newAvailableSpecializations.find(s => s.id.toString() === initialData.specialization.id.toString());
        if (foundSpec) {
          form.setValue('specialization_id', initialData.specialization.id.toString());
        } else {
           form.setValue('specialization_id', ''); 
        }
      } else {
        const currentSpecId = form.getValues('specialization_id');
        if(currentSpecId && !newAvailableSpecializations.find(s => s.id.toString() === currentSpecId)) {
            form.setValue('specialization_id', '');
        }
      }
    } else {
      setAvailableSpecializations([]);
      form.setValue('specialization_id', '');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchedUniversityId, universitiesWithSpecs, initialData?.specialization?.id, initialData?.university?.id]);


  async function onSubmit(data: ThesisFormValues) {
    setIsSubmitting(true);
    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("year", format(data.year, "yyyy")); // Format date to year string
    formData.append("university_id", data.university_id);
    formData.append("specialization_id", data.specialization_id);
    formData.append("degree_id", data.degree_id);
    formData.append("author_name", data.author_name);
    if (data.pdf) {
      formData.append("pdf", data.pdf);
    }

    try {
      if (initialData) {
        await updateThesis(initialData.id, formData);
        toast({ title: "نجاح", description: "تم تعديل الرسالة بنجاح." });
      } else {
        if (!data.pdf) {
          form.setError("pdf", { type: "manual", message: "ملف PDF مطلوب عند إضافة رسالة جديدة." });
          setIsSubmitting(false);
          return;
        }
        await addThesis(formData);
        toast({ title: "نجاح", description: "تمت إضافة الرسالة بنجاح." });
      }
      router.push("/theses");
      router.refresh(); 
    } catch (error: any) {
      toast({
        title: "خطأ",
        description: error.message || (initialData ? "فشل تعديل الرسالة." : "فشل إضافة الرسالة."),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="max-w-2xl mx-auto shadow-xl">
      <CardHeader>
        <CardTitle className="font-headline text-2xl text-primary">
          {initialData ? "تعديل الرسالة" : "إضافة رسالة جديدة"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>عنوان الرسالة</FormLabel>
                  <FormControl>
                    <Input placeholder="مثال: تطوير تطبيقات الويب الحديثة" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="author_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>اسم المؤلف</FormLabel>
                    <FormControl>
                      <Input placeholder="مثال: أحمد محمد" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="year"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>تاريخ النشر</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full justify-start text-right font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="ml-2 h-4 w-4" />
                            {field.value ? format(field.value, "PPP", { locale: arSA }) : <span>اختر تاريخ النشر</span>}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                          initialFocus
                          locale={arSA}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FormField
                control={form.control}
                name="university_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>الجامعة</FormLabel>
                    <Select 
                      onValueChange={(value) => {
                        field.onChange(value);
                        form.setValue('specialization_id', ''); 
                      }} 
                      value={field.value}
                      disabled={isLoadingDropdowns || universitiesWithSpecs.length === 0}
                      dir="rtl"
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={isLoadingDropdowns ? "جاري التحميل..." : universitiesWithSpecs.length === 0 ? "لا توجد جامعات" : "اختر الجامعة"} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {universitiesWithSpecs.map((uni) => (
                          <SelectItem key={uni.id} value={uni.id.toString()}>{uni.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="specialization_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>التخصص</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      value={field.value}
                      disabled={isLoadingDropdowns || !watchedUniversityId || availableSpecializations.length === 0}
                      dir="rtl"
                    >
                      <FormControl>
                        <SelectTrigger>
                           <SelectValue placeholder={
                            isLoadingDropdowns ? "جاري التحميل..." : 
                            !watchedUniversityId ? "اختر جامعة أولاً" : 
                            availableSpecializations.length === 0 ? "لا توجد تخصصات لهذه الجامعة" : 
                            "اختر التخصص"
                          } />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {availableSpecializations.map((spec) => (
                          <SelectItem key={spec.id} value={spec.id.toString()}>{spec.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="degree_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>الدرجة العلمية</FormLabel>
                    <Select 
                        onValueChange={field.onChange} 
                        value={field.value} 
                        disabled={isLoadingDropdowns || degrees.length === 0} 
                        dir="rtl"
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={isLoadingDropdowns ? "جاري التحميل..." : degrees.length === 0 ? "لا توجد درجات" : "اختر الدرجة"} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {degrees.map((deg) => (
                          <SelectItem key={deg.id} value={deg.id.toString()}>{deg.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="pdf"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ملف PDF {initialData ? "(اختياري للتعديل)" : ""}</FormLabel>
                  <FormControl>
                    <Input 
                      type="file" 
                      accept=".pdf"
                      onChange={(e) => field.onChange(e.target.files ? e.target.files[0] : null)} 
                    />
                  </FormControl>
                  <FormDescription>
                    {initialData && initialData.pdf_path ? `الملف الحالي: ${initialData.pdf_path.split('/').pop()}` : "الرجاء تحميل ملف PDF الخاص بالرسالة."}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button type="submit" disabled={isSubmitting || isLoadingDropdowns} className="w-full">
              {(isSubmitting || isLoadingDropdowns) && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
              {initialData ? "حفظ التعديلات" : "إضافة الرسالة"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}


    