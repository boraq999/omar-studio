
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { UniversitiesClientPage } from './UniversitiesClientPage';
import { getUniversitiesWithSpecializationsAdmin } from '@/lib/api';

export default async function UniversitiesPage() {
  // Fetch initial data for universities with their currently associated specializations
  const initialUniversities = await getUniversitiesWithSpecializationsAdmin().catch(() => []);
  // allSpecializations is no longer fetched here, UniversitiesClientPage will fetch it.

  return (
    <AppLayout>
      <PageHeader title="إدارة الجامعات والتخصصات" description="عرض الجامعات وإضافة تخصصات لها." />
      <UniversitiesClientPage 
        initialUniversities={initialUniversities}
        // allSpecializations prop removed
      />
    </AppLayout>
  );
}

