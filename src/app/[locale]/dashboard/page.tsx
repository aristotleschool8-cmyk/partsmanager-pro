import { Button } from "@/components/ui/button";
import { DashboardStats } from "@/components/dashboard/dashboard-stats";
import { getDictionary } from "@/lib/dictionaries";
import { Locale } from "@/lib/config";
import { PlusCircle } from "lucide-react";
import Link from 'next/link';

export default async function DashboardPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const dictionary = await getDictionary(locale);

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl sm:text-3xl font-headline font-bold">{dictionary.dashboard.title}</h1>
        <div className="flex w-full sm:w-auto">
          <Button asChild className="w-full sm:w-auto">
            <Link href={`/${locale}/dashboard/stock`}>
              <PlusCircle className="mr-2 h-4 w-4" /> {dictionary.dashboard.addProduct}
            </Link>
          </Button>
        </div>
      </div>
      <DashboardStats dictionary={dictionary} />
      <div className="space-y-4">
        <h2 className="text-xl sm:text-2xl font-headline font-bold">{dictionary.dashboard?.recentActivity || 'Recent Activity'}</h2>
        {/* Placeholder for recent activity feed or table */}
        <div className="p-6 sm:p-8 text-center text-muted-foreground bg-secondary rounded-lg text-sm sm:text-base">
          {dictionary.dashboard?.recentActivityPlaceholder || 'Recent activity will be shown here.'}
        </div>
      </div>
    </div>
  );
}
