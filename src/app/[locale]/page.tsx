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
        <div className="container flex h-14 sm:h-16 items-center justify-between px-4 sm:px-6">
          <Logo />
          <div className="flex items-center gap-2 sm:gap-4">
            <LanguageSwitcher />
            <ThemeSwitcherLanding />
            <Button size="sm" asChild className="text-xs sm:text-sm">
              <Link href={`/${locale}/login`}>{dictionary.landing.login}</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="relative w-full overflow-hidden">
          <div className="relative h-[50vh] sm:h-[60vh] flex items-center justify-center text-center text-white">
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
            <div className="absolute inset-0 bg-black/50 sm:bg-black/60" />
            <div className="relative z-10 max-w-4xl px-4 sm:px-6 py-8">
              <h1 className="text-3xl sm:text-4xl md:text-6xl font-headline font-bold drop-shadow-lg leading-tight">
                {dictionary.landing.title}
              </h1>
              <p className="mt-3 sm:mt-4 text-sm sm:text-lg md:text-xl text-white/90 drop-shadow-md">
                {dictionary.landing.subtitle}
              </p>
              <Button size="lg" className="mt-6 sm:mt-8" asChild>
                <Link href={`/${locale}/signup`}>{dictionary.landing.cta}</Link>
              </Button>
            </div>
          </div>
        </section>

        <section id="features" className="py-12 sm:py-16 md:py-24 px-4 sm:px-6">
          <div className="container max-w-7xl mx-auto">
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-headline font-bold">
                {dictionary.landing.featuresTitle}
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              <FeatureCard
                icon={<BarChart className="h-8 w-8 sm:h-10 sm:w-10 text-primary" />}
                title={dictionary.landing.featureStock}
                description={dictionary.landing.featureStockDesc}
                image={stockImage}
              />
              <FeatureCard
                icon={<FileText className="h-8 w-8 sm:h-10 sm:w-10 text-primary" />}
                title={dictionary.landing.featureBilling}
                description={dictionary.landing.featureBillingDesc}
                image={billingImage}
              />
              <FeatureCard
                icon={<Users className="h-8 w-8 sm:h-10 sm:w-10 text-primary" />}
                title={dictionary.landing.featureCrm}
                description={dictionary.landing.featureCrmDesc}
                image={crmImage}
              />
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t mt-12 sm:mt-16">
        <div className="container px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between h-auto sm:h-20 py-6 sm:py-0">
          <p className="text-muted-foreground text-xs sm:text-sm text-center sm:text-left mb-4 sm:mb-0">&copy; {new Date().getFullYear()} {dictionary.appName}. All rights reserved.</p>
          <Logo className="opacity-50 h-6 w-6 sm:h-8 sm:w-8" />
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description, image }: { icon: React.ReactNode, title: string, description: string, image?: any }) {
  return (
    <Card className="text-center flex flex-col h-full overflow-hidden transition-transform hover:shadow-lg hover:scale-105">
      {image && 
        <div className="relative h-32 sm:h-40 w-full">
          <Image 
            src={image.imageUrl} 
            alt={image.description} 
            fill 
            className="object-cover"
            data-ai-hint={image.imageHint}
          />
        </div>
      }
      <CardHeader className="items-center px-4 sm:px-6 py-4 sm:py-6">
        <div className="p-3 sm:p-4 bg-primary/10 rounded-full mb-3 sm:mb-4">
          {icon}
        </div>
        <CardTitle className="font-headline text-base sm:text-lg">{title}</CardTitle>
      </CardHeader>
      <CardDescription className="px-4 sm:px-6 pb-4 sm:pb-6 text-xs sm:text-sm flex-grow">
        {description}
      </CardDescription>
    </Card>
  );
}
