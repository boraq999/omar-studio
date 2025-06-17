
"use client";

import React, { useState } from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import type { User, UserRole, PermissionId } from '@/types/users';
import { ALL_PERMISSIONS } from '@/types/users';
import { addUser, updateUser } from '@/lib/authService';
import { Loader2 } from 'lucide-react';

const userFormSchemaBase = {
  username: z.string().min(3, { message: "اسم المستخدم يجب أن يكون 3 أحرف على الأقل." }),
  fullName: z.string().optional(),
  role: z.enum(['admin', 'editor', 'viewer'], { required_error: "الرجاء اختيار الدور." }),
  permissions: z.array(z.string()).refine(value => value.some(item => item), {
    message: "يجب اختيار صلاحية واحدة على الأقل.", // Optional: or remove if role dictates permissions
  }),
};

const addUserFormSchema = z.object({
  ...userFormSchemaBase,
  password: z.string().min(6, { message: "كلمة المرور يجب أن تكون 6 أحرف على الأقل." }),
});

const editUserFormSchema = z.object({
  ...userFormSchemaBase,
  password: z.string().optional(), // Optional for edit
});


type UserFormValues = z.infer<typeof addUserFormSchema> | z.infer<typeof editUserFormSchema>;

interface UserFormProps {
  initialData?: User | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export function UserForm({ initialData, onSuccess, onCancel }: UserFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = !!initialData;

  const formSchema = isEditing ? editUserFormSchema : addUserFormSchema;

  const form = useForm<UserFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: initialData?.username || "",
      fullName: initialData?.fullName || "",
      password: "",
      role: initialData?.role || 'viewer',
      permissions: initialData?.permissions || [],
    },
  });

  async function onSubmit(data: UserFormValues) {
    setIsSubmitting(true);
    try {
      if (isEditing && initialData) {
        const updateData: Partial<User> = {
          username: data.username,
          fullName: data.fullName,
          role: data.role as UserRole,
          permissions: data.permissions as PermissionId[],
        };
        // Password update would be separate or handled differently for security
        await updateUser(initialData.id, updateData);
        toast({ title: "نجاح", description: "تم تعديل بيانات المستخدم بنجاح." });
      } else {
        await addUser({
            username: data.username,
            fullName: data.fullName,
            password: (data as z.infer<typeof addUserFormSchema>).password, // Password required for new user
            role: data.role as UserRole,
            permissions: data.permissions as PermissionId[],
        });
        toast({ title: "نجاح", description: "تمت إضافة المستخدم بنجاح." });
      }
      onSuccess();
    } catch (error: any) {
      toast({
        title: "خطأ",
        description: error.message || (isEditing ? "فشل تعديل المستخدم." : "فشل إضافة المستخدم."),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  const roles: { value: UserRole, label: string }[] = [
    { value: 'admin', label: 'مدير النظام' },
    { value: 'editor', label: 'محرر' },
    { value: 'viewer', label: 'مشاهد' },
  ];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4 max-h-[70vh] overflow-y-auto pr-2">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>اسم المستخدم</FormLabel>
              <FormControl>
                <Input placeholder="مثال: user123" {...field} />
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
              <FormLabel>الاسم الكامل (اختياري)</FormLabel>
              <FormControl>
                <Input placeholder="مثال: الاسم الكامل للمستخدم" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{isEditing ? "كلمة المرور الجديدة (اتركها فارغة لعدم التغيير)" : "كلمة المرور"}</FormLabel>
              <FormControl>
                <Input type="password" placeholder="********" {...field} />
              </FormControl>
              {!isEditing && <FormDescription>يجب أن تكون كلمة المرور 6 أحرف على الأقل.</FormDescription>}
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>الدور</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر دور المستخدم" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {roles.map(role => (
                    <SelectItem key={role.value} value={role.value}>{role.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="permissions"
          render={() => (
            <FormItem>
              <div className="mb-4">
                <FormLabel className="text-base">الصلاحيات</FormLabel>
                <FormDescription>
                  اختر الصلاحيات التي سيتم منحها لهذا المستخدم.
                </FormDescription>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {ALL_PERMISSIONS.map((permissionItem) => (
                <FormField
                  key={permissionItem.id}
                  control={form.control}
                  name="permissions"
                  render={({ field }) => {
                    return (
                      <FormItem
                        key={permissionItem.id}
                        className="flex flex-row items-start space-x-3 space-y-0 space-x-reverse dir-rtl"
                      >
                        <FormControl>
                          <Checkbox
                            checked={field.value?.includes(permissionItem.id)}
                            onCheckedChange={(checked) => {
                              return checked
                                ? field.onChange([...(field.value || []), permissionItem.id])
                                : field.onChange(
                                    (field.value || []).filter(
                                      (value) => value !== permissionItem.id
                                    )
                                  )
                            }}
                          />
                        </FormControl>
                        <FormLabel className="font-normal">
                          {permissionItem.label}
                        </FormLabel>
                      </FormItem>
                    )
                  }}
                />
              ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
                إلغاء
            </Button>
            <Button type="submit" disabled={isSubmitting}>
               {isSubmitting && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
              {isEditing ? "حفظ التعديلات" : "إضافة مستخدم"}
            </Button>
        </div>
      </form>
    </Form>
  );
}
