
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { ProfileClientPage } from './ProfileClientPage';

export default function ProfilePage() {
  return (
    <AppLayout>
      <PageHeader title="ملفي الشخصي" description="إدارة معلومات حسابك وتغيير كلمة المرور." />
      <ProfileClientPage />
    </AppLayout>
  );
}
