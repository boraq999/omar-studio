
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { ThesisForm } from '@/components/theses/ThesisForm';
import { getUniversities, getSpecializations, getDegrees } from '@/lib/api';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default async function AddThesisPage() {
  const universities = await getUniversities().catch(() => []);
  const specializations = await getSpecializations().catch(() => []);
  const degrees = await getDegrees().catch(() => []);

  return (
    <AppLayout>
      <PageHeader title="إضافة رسالة جديدة">
         <Button variant="outline" asChild>
            <Link href="/theses">
                <ArrowRight className="ml-2 h-4 w-4" />
                العودة إلى قائمة الرسائل
            </Link>
        </Button>
      </PageHeader>
      <ThesisForm
        universities={universities}
        specializations={specializations}
        degrees={degrees}
      />
    </AppLayout>
  );
}
