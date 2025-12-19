import { i18n, type Locale } from '@/lib/config';

export async function generateStaticParams() {
  return i18n.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;

  return (
    <div lang={locale} dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      {children}
    </div>
  );
}
