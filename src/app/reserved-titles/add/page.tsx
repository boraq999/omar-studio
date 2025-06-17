
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { ReservedTitleForm } from '@/components/reserved-titles/ReservedTitleForm';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function AddReservedTitlePage() {
  return (
    <AppLayout>
      <PageHeader title="إضافة عنوان محجوز جديد">
        <Button variant="outline" asChild>
            <Link href="/reserved-titles">
                <ArrowRight className="ml-2 h-4 w-4" />
                العودة إلى قائمة العناوين
            </Link>
        </Button>
      </PageHeader>
      <ReservedTitleForm />
    </AppLayout>
  );
}
