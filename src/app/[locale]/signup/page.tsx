export const dynamic = 'force-dynamic';

import Link from "next/link"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from "@/components/ui/card"
import { SignupForm } from "@/components/auth/signup-form"
import { getDictionary } from "@/lib/dictionaries"
import { Locale } from "@/lib/config"
import { Logo } from "@/components/logo"

export default async function SignupPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const dictionary = await getDictionary(locale);

  return (
    <div className="flex items-center justify-center min-h-screen bg-secondary">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="text-center">
          <Logo className="justify-center mb-4" />
          <CardTitle className="font-headline">{dictionary.auth.signupTitle}</CardTitle>
          <CardDescription>{dictionary.auth.signupSubtitle}</CardDescription>
        </CardHeader>
        <CardContent>
          <SignupForm dictionary={dictionary.auth} locale={locale} />
        </CardContent>
        <CardFooter className="text-center text-sm">
          <p className="w-full">
            {dictionary.auth.haveAccount}{" "}
            <Link href={`/${locale}/login`} className="font-medium text-primary hover:underline">
              {dictionary.auth.loginButton}
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
