
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { EditThesisClientPage } from '../EditThesisClientPage';
import { getDegrees, getLatestTheses, searchTheses } from '@/lib/api';
import type { Thesis } from '@/types/api';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';


export default async function EditThesisPage({ params }: { params: { id: string } }) {
  const thesisId = parseInt(params.id, 10);

  let thesisToEdit: Thesis | undefined = undefined;
  try {
    const allTheses = await getLatestTheses(); 
    thesisToEdit = allTheses.find(t => t.id === thesisId);
    if (!thesisToEdit) {
        const searchResults = await searchTheses({ title: params.id }); 
        thesisToEdit = searchResults.find(t => t.id === thesisId);
    }

  } catch (e) {
    console.error("Failed to fetch thesis data for editing:", e);
  }

  const degrees = await getDegrees().catch(() => []);

  return (
    <AppLayout>
      <PageHeader title={thesisToEdit ? `تعديل الرسالة: ${thesisToEdit.title}` : "تعديل الرسالة"}>
        <Button variant="outline" asChild>
            <Link href="/theses">
                <ArrowRight className="ml-2 h-4 w-4" />
                العودة إلى قائمة الرسائل
            </Link>
        </Button>
      </PageHeader>
      <EditThesisClientPage
        thesisId={thesisId}
        initialThesisData={thesisToEdit} 
        degrees={degrees}
      />
    </AppLayout>
  );
}
