export const dynamic = 'force-dynamic';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { AdminLoginForm } from "@/components/auth/admin-login-form"
import { getDictionary } from "@/lib/dictionaries"
import { Locale } from "@/lib/config"
import { Logo } from "@/components/logo"

export default async function AdminLoginPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const dictionary = await getDictionary(locale);

  return (
    <div className="flex items-center justify-center min-h-screen bg-secondary">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="text-center">
          <Logo className="justify-center mb-4" />
          <CardTitle className="font-headline">Admin Login</CardTitle>
          <CardDescription>Access the admin dashboard</CardDescription>
        </CardHeader>
        <CardContent>
          <AdminLoginForm dictionary={dictionary.auth} locale={locale} />
        </CardContent>
      </Card>
    </div>
  )
}
