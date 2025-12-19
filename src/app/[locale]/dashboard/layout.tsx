import Link from 'next/link';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
} from '@/components/ui/sidebar';
import {
  Home,
  Package,
  ShoppingCart,
  Users,
  FileText,
  Trash2,
  Settings,
  Building,
  Bell,
  Sun,
  Moon,
} from 'lucide-react';
import { getDictionary } from '@/lib/dictionaries';
import { Locale } from '@/lib/config';
import { Logo } from '@/components/logo';
import { mockUser } from '@/lib/data';
import { UserNav } from '@/components/dashboard/user-nav';
import { LanguageSwitcher } from '@/components/language-switcher';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ThemeSwitcher } from '@/components/theme-switcher';

// Allow child pages to use dynamic routes
export const dynamic = 'force-dynamic';

export default async function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const dictionary = await getDictionary(locale);

  const navItems = [
    { href: '/dashboard', icon: <Home />, label: dictionary.dashboard.title },
    { href: '/dashboard/stock', icon: <Package />, label: dictionary.dashboard.stock },
    { href: '/dashboard/sales', icon: <ShoppingCart />, label: dictionary.dashboard.sales },
    { href: '/dashboard/purchases', icon: <Building />, label: dictionary.dashboard.purchases },
    { href: '/dashboard/customers', icon: <Users />, label: dictionary.dashboard.customers },
    { href: '/dashboard/suppliers', icon: <Users />, label: dictionary.dashboard.suppliers },
    { href: '/dashboard/invoices', icon: <FileText />, label: dictionary.dashboard.invoices },
    { href: '/dashboard/trash', icon: <Trash2 />, label: dictionary.dashboard.trash },
  ];

  return (
    <div className="flex flex-col h-screen bg-background">
      <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
        <Logo />
        <div className="flex-1">
            {/* Search can go here */}
        </div>
        <LanguageSwitcher />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon">
              <span className="sr-only">Toggle theme</span>
              <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <ThemeSwitcher />
          </DropdownMenuContent>
        </DropdownMenu>
         <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
                1
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <div className="flex flex-col">
                <span className="font-medium">Subscription Expiring</span>
                <span className="text-xs text-muted-foreground">
                  Your subscription will expire in 3 days.
                </span>
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        {mockUser && (
          <UserNav 
            user={{
              ...mockUser,
              createdAt: mockUser.createdAt instanceof Object && 'toDate' in mockUser.createdAt 
                ? mockUser.createdAt.toDate().toISOString()
                : typeof mockUser.createdAt === 'string' 
                  ? mockUser.createdAt 
                  : new Date().toISOString()
            }} 
            dictionary={dictionary.auth} 
          />
        )}
      </header>
      <div className='flex flex-1 overflow-hidden'>
        <SidebarProvider>
          <Sidebar>
            <SidebarHeader>
            </SidebarHeader>
            <SidebarContent className="pt-16">
              <SidebarMenu>
                {navItems.map((item) => (
                  <SidebarMenuItem key={item.label}>
                    <SidebarMenuButton asChild>
                      <Link href={`/${locale}${item.href}`}>
                        {item.icon}
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
                 {mockUser.role === 'admin' && (
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <Link href={`/${locale}/dashboard/settings`}>
                        <Settings />
                        <span>{dictionary.dashboard.settings}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                 )}
              </SidebarMenu>
            </SidebarContent>
            <SidebarFooter>
            </SidebarFooter>
          </Sidebar>
          <SidebarInset>
              <main className="flex-1 overflow-y-auto p-4 md:p-8 pt-6">
                {children}
              </main>
          </SidebarInset>
        </SidebarProvider>
      </div>
    </div>
  );
}
