
// This page structure assumes you can fetch a single thesis by ID.
// The provided API (getLatestTheses, searchTheses) returns arrays.
// If a direct /api/theses/{id} GET endpoint doesn't exist, 
// you might need to find the thesis from a list or pass it via state/props from the table,
// or the backend might provide it differently.
// For now, this is a conceptual structure.
// Let's assume for now that we can't directly fetch a single thesis by ID with the provided API.
// So, editing might require passing data or fetching the full list and filtering.
// This makes a true SSR edit page difficult without a GET /theses/{id} endpoint.
// A common pattern would be to redirect to a client-rendered form with data passed.

// **Revised approach for Edit Page (Client-heavy due to API limitations)**

import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { EditThesisClientPage } from './EditThesisClientPage';
import { getUniversities, getSpecializations, getDegrees, getLatestTheses, searchTheses } from '@/lib/api';
import type { Thesis } from '@/types/api';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';


export default async function EditThesisPage({ params }: { params: { id: string } }) {
  const thesisId = parseInt(params.id, 10);

  // Attempt to find the thesis. This is inefficient if the list is large.
  // A dedicated GET /theses/:id endpoint would be much better.
  let thesisToEdit: Thesis | undefined = undefined;
  try {
    // Try searching by ID if title search supports it, or fetch a list and find
    // For now, we'll fetch latest and search, then filter. This is not ideal.
    const allTheses = await getLatestTheses(); // Or some other broader fetch
    thesisToEdit = allTheses.find(t => t.id === thesisId);
    if (!thesisToEdit) {
        // As a fallback, try searching by title using the ID as a placeholder for a title that might contain the ID
        // This is a very weak fallback.
        const searchResults = await searchTheses({ title: params.id }); // This assumes title search can find by ID or part of title
        thesisToEdit = searchResults.find(t => t.id === thesisId);
    }

  } catch (e) {
    console.error("Failed to fetch thesis data for editing:", e);
  }

  const universities = await getUniversities().catch(() => []);
  const specializations = await getSpecializations().catch(() => []);
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
        initialThesisData={thesisToEdit} // Pass potentially undefined data
        universities={universities}
        specializations={specializations}
        degrees={degrees}
      />
    </AppLayout>
  );
}
