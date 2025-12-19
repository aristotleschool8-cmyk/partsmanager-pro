import { getDictionary } from '@/lib/dictionaries';
import { Locale } from '@/lib/config';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Image from 'next/image';
import Link from 'next/link';
import { LanguageSwitcher } from '@/components/language-switcher';
import { Logo } from '@/components/logo';
import { BarChart, FileText, Users } from 'lucide-react';
import { ThemeSwitcherLanding } from '@/components/theme-switcher-landing';

const heroImage = PlaceHolderImages.find(p => p.id === 'hero-background');
const stockImage = PlaceHolderImages.find(p => p.id === 'feature-stock');
const billingImage = PlaceHolderImages.find(p => p.id === 'feature-billing');
const crmImage = PlaceHolderImages.find(p => p.id === 'feature-collaboration');


export default async function LandingPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const dictionary = await getDictionary(locale);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Logo />
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            <ThemeSwitcherLanding />
            <Button asChild>
              <Link href={`/${locale}/login`}>{dictionary.landing.login}</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="relative h-[60vh] flex items-center justify-center text-center text-white">
          {heroImage && 
            <Image 
              src={heroImage.imageUrl} 
              alt={heroImage.description} 
              fill 
              className="object-cover"
              data-ai-hint={heroImage.imageHint}
              priority
            />
          }
          <div className="absolute inset-0 bg-black/60" />
          <div className="relative z-10 max-w-4xl px-4">
            <h1 className="text-4xl md:text-6xl font-headline font-bold drop-shadow-lg">
              {dictionary.landing.title}
            </h1>
            <p className="mt-4 text-lg md:text-xl text-white/90 drop-shadow-md">
              {dictionary.landing.subtitle}
            </p>
            <Button size="lg" className="mt-8" asChild>
              <Link href={`/${locale}/signup`}>{dictionary.landing.cta}</Link>
            </Button>
          </div>
        </section>

        <section id="features" className="py-16 sm:py-24">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-headline font-bold">
                {dictionary.landing.featuresTitle}
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <FeatureCard
                icon={<BarChart className="h-10 w-10 text-primary" />}
                title={dictionary.landing.featureStock}
                description={dictionary.landing.featureStockDesc}
                image={stockImage}
              />
              <FeatureCard
                icon={<FileText className="h-10 w-10 text-primary" />}
                title={dictionary.landing.featureBilling}
                description={dictionary.landing.featureBillingDesc}
                image={billingImage}
              />
              <FeatureCard
                icon={<Users className="h-10 w-10 text-primary" />}
                title={dictionary.landing.featureCrm}
                description={dictionary.landing.featureCrmDesc}
                image={crmImage}
              />
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t">
        <div className="container flex items-center justify-between h-20">
          <p className="text-muted-foreground text-sm">&copy; {new Date().getFullYear()} {dictionary.appName}. All rights reserved.</p>
          <Logo className="opacity-50" />
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description, image }: { icon: React.ReactNode, title: string, description: string, image?: any }) {
  return (
    <Card className="text-center flex flex-col">
      {image && 
        <div className="relative h-40 w-full">
          <Image 
            src={image.imageUrl} 
            alt={image.description} 
            fill 
            className="object-cover rounded-t-lg"
            data-ai-hint={image.imageHint}
          />
        </div>
      }
      <CardHeader className="items-center">
        <div className="p-4 bg-primary/10 rounded-full mb-4">
          {icon}
        </div>
        <CardTitle className="font-headline">{title}</CardTitle>
      </CardHeader>
      <CardDescription className="px-6 pb-6">
        {description}
      </CardDescription>
    </Card>
  );
}
