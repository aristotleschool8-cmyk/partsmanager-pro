import { Suspense } from 'react';
import { AdminLayoutClient } from './layout-client';
import { Locale } from "@/lib/config";
import { Loader2 } from 'lucide-react';

// Prevent static generation for admin layout and all child pages since they use Firebase
export const dynamic = 'force-dynamic';

export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    }>
      <AdminLayoutClient locale={locale}>{children}</AdminLayoutClient>
    </Suspense>
  );
}
