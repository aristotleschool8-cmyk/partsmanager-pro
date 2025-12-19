import { NextRequest, NextResponse } from 'next/server'
import { match } from '@formatjs/intl-localematcher'
import Negotiator from 'negotiator'

let locales = ['en', 'fr', 'ar']
export let defaultLocale = 'en'

function getLocale(request: NextRequest): string {
  const negotiatorHeaders: Record<string, string> = {}
  request.headers.forEach((value, key) => (negotiatorHeaders[key] = value))

  const languages = new Negotiator({ headers: negotiatorHeaders }).languages()

  try {
    return match(languages, locales, defaultLocale)
  } catch (e) {
    return defaultLocale
  }
}

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  
  // Handle locale routing
  const pathnameIsMissingLocale = locales.every(
    (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
  )

  if (pathnameIsMissingLocale) {
    const locale = getLocale(request)
    return NextResponse.redirect(
      new URL(`/${locale}/${pathname}`, request.url)
    )
  }

  // Handle admin route protection
  if (pathname.includes('/admin')) {
    // For now, we skip server-side verification here because Firebase auth is client-side
    // The client-side check in admin layout.tsx will handle access control
    // In production, you could verify the JWT token as shown above
    // If not authenticated, redirect to admin login
    const authToken = request.cookies.get('__session')?.value
    if (!authToken && !pathname.includes('/admin/login')) {
      const locale = getLocale(request)
      return NextResponse.redirect(new URL(`/${locale}/admin/login`, request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
