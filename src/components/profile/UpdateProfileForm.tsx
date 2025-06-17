
"use client";

import React, { useState } from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import type { User } from '@/types/users';
import { updateProfile } from '@/lib/authService';
import { Loader2 } from 'lucide-react';

const profileFormSchema = z.object({
  fullName: z.string().min(3, { message: "الاسم الكامل يجب أن يكون 3 أحرف على الأقل." }).optional(),
  username: z.string(), // Readonly, just for display or context
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

interface UpdateProfileFormProps {
  currentUser: User;
  onProfileUpdate: () => Promise<void>;
}

export function UpdateProfileForm({ currentUser, onProfileUpdate }: UpdateProfileFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      username: currentUser.username,
      fullName: currentUser.fullName || "",
    },
  });

  async function onSubmit(data: ProfileFormValues) {
    setIsSubmitting(true);
    try {
      await updateProfile(currentUser.id, { fullName: data.fullName });
      toast({ title: "نجاح", description: "تم تحديث الملف الشخصي بنجاح." });
      await onProfileUpdate(); // Re-fetch user data in parent context
    } catch (error: any) {
      toast({
        title: "خطأ",
        description: error.message || "فشل تحديث الملف الشخصي.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>اسم المستخدم</FormLabel>
              <FormControl>
                <Input {...field} readOnly disabled className="bg-muted/50" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="fullName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>الاسم الكامل</FormLabel>
              <FormControl>
                <Input placeholder="ادخل اسمك الكامل" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isSubmitting} className="w-full md:w-auto">
           {isSubmitting && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
          حفظ التغييرات
        </Button>
      </form>
    </Form>
  );
}
