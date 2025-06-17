
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { PlusCircle } from 'lucide-react';
import { ReservedTitlesClientPage } from './ReservedTitlesClientPage';
import { getLatestReservedTitles } from '@/lib/api';

export default async function ReservedTitlesPage() {
  const initialReservedTitles = await getLatestReservedTitles().catch(() => []);

  return (
    <AppLayout>
      <PageHeader title="إدارة العناوين المحجوزة" description="بحث، عرض، إضافة، وتعديل العناوين المحجوزة.">
        <Link href="/reserved-titles/add" passHref>
          <Button>
            <PlusCircle className="ml-2 h-5 w-5" />
            إضافة عنوان محجوز جديد
          </Button>
        </Link>
      </PageHeader>
      <ReservedTitlesClientPage initialReservedTitles={initialReservedTitles} />
    </AppLayout>
  );
}

