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
    <div className="space-y-8">
      <div className="flex items-center justify-between space-y-2">
        <h1 className="text-3xl font-headline font-bold">{dictionary.dashboard.title}</h1>
        <div className="flex items-center space-x-2">
          <Button asChild>
            <Link href={`/${locale}/dashboard/stock`}>
              <PlusCircle className="mr-2 h-4 w-4" /> {dictionary.dashboard.addProduct}
            </Link>
          </Button>
        </div>
      </div>
      <DashboardStats dictionary={dictionary} />
      <div className="space-y-4">
        <h2 className="text-2xl font-headline font-bold">Recent Activity</h2>
        {/* Placeholder for recent activity feed or table */}
        <div className="p-8 text-center text-muted-foreground bg-secondary rounded-lg">
          Recent activity will be shown here.
        </div>
      </div>
    </div>
  );
}
