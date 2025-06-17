
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { UniversitiesClientPage } from './UniversitiesClientPage';
import { getUniversitiesWithSpecializationsAdmin } from '@/lib/api';
import type { UniversityWithSpecializationsAdmin } from '@/types/api';

export default async function UniversitiesPage() {
  let initialUniversities: UniversityWithSpecializationsAdmin[] = [];
  try {
    initialUniversities = await getUniversitiesWithSpecializationsAdmin();
  } catch (error) {
    console.error("Failed to fetch initial universities on server:", error);
    // initialUniversities will remain []
  }

  return (
    <AppLayout>
      <PageHeader title="إدارة الجامعات والتخصصات" description="عرض الجامعات وإضافة تخصصات لها." />
      <UniversitiesClientPage
        initialUniversities={initialUniversities}
      />
    </AppLayout>
  );
}
