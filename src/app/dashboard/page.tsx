
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { StatCard } from '@/components/dashboard/StatCard';
import { getGeneralStats } from '@/lib/api';
import type { GeneralStats } from '@/types/api';
import { BookOpen, Users, Building, Library, GraduationCap, FileText } from 'lucide-react';

export default async function DashboardPage() {
  let stats: GeneralStats | null = null;
  let error: string | null = null;

  try {
    stats = await getGeneralStats();
  } catch (e) {
    console.error("Failed to fetch stats:", e);
    error = "فشل تحميل الإحصائيات. يرجى المحاولة مرة أخرى.";
  }

  return (
    <AppLayout>
      <PageHeader title="لوحة التحكم الرئيسية" description="نظرة عامة على إحصائيات النظام." />
      {error && <p className="text-destructive">{error}</p>}
      {stats && !error && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <StatCard
            title="إجمالي الرسائل"
            value={stats.total_theses}
            icon={BookOpen}
            description="العدد الكلي للرسائل المسجلة"
            className="shadow-lg hover:shadow-xl transition-shadow duration-300"
          />
          <StatCard
            title="رسائل الماجستير"
            value={stats.master_theses}
            icon={GraduationCap}
            description="عدد رسائل الماجستير"
            className="shadow-lg hover:shadow-xl transition-shadow duration-300"
          />
          <StatCard
            title="رسائل الدكتوراه"
            value={stats.phd_theses}
            icon={FileText}
            description="عدد رسائل الدكتوراه"
            className="shadow-lg hover:shadow-xl transition-shadow duration-300"
          />
          <StatCard
            title="إجمالي المؤلفين"
            value={stats.total_authors}
            icon={Users}
            description="العدد الكلي للمؤلفين"
            className="shadow-lg hover:shadow-xl transition-shadow duration-300"
          />
          <StatCard
            title="إجمالي الجامعات"
            value={stats.total_universities}
            icon={Building}
            description="العدد الكلي للجامعات المسجلة"
            className="shadow-lg hover:shadow-xl transition-shadow duration-300"
          />
          <StatCard
            title="إجمالي التخصصات"
            value={stats.total_specializations}
            icon={Library}
            description="العدد الكلي للتخصصات المتاحة"
            className="shadow-lg hover:shadow-xl transition-shadow duration-300"
          />
        </div>
      )}
      {!stats && !error && (
         <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
                <Card key={i} className="shadow-lg">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <Skeleton className="h-5 w-2/5" />
                        <Skeleton className="h-5 w-5 rounded-full" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-8 w-1/4 mb-2" />
                        <Skeleton className="h-4 w-3/4" />
                    </CardContent>
                </Card>
            ))}
        </div>
      )}
    </AppLayout>
  );
}

// Need to add Skeleton component if not already present in ui
// For now, I'll add it to make sure it compiles if stats are loading
import { Card, CardContent, CardHeader } from '@/components/ui/card'; // Already imported

const Skeleton = ({ className }: { className?: string }) => (
  <div className={`animate-pulse bg-muted rounded-md ${className}`} />
);
