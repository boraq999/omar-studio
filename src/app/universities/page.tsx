
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { UniversitiesClientPage } from './UniversitiesClientPage';
import { getUniversitiesWithSpecializationsAdmin, getSpecializations } from '@/lib/api';

export default async function UniversitiesPage() {
  // Fetch initial data
  const initialUniversities = await getUniversitiesWithSpecializationsAdmin().catch(() => []);
  const allSpecializations = await getSpecializations().catch(() => []); // For adding existing specializations

  return (
    <AppLayout>
      <PageHeader title="إدارة الجامعات والتخصصات" description="عرض الجامعات وإضافة تخصصات لها." />
      <UniversitiesClientPage 
        initialUniversities={initialUniversities}
        allSpecializations={allSpecializations}
      />
    </AppLayout>
  );
}
