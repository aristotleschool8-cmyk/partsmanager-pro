import { Locale } from "@/lib/config";

// Login page doesn't need auth checks or Suspense
export const dynamic = 'force-dynamic';

export default async function AdminLoginLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: Locale }>;
}) {
  return children;
}
