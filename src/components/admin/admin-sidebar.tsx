'use client';

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  Users,
  BarChart3,
  FileText,
  Activity,
  Settings,
  HardDrive,
  Lock,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Locale } from "@/lib/config";

interface AdminSidebarProps {
  locale: Locale;
}

export function AdminSidebar({ locale }: AdminSidebarProps) {
  const pathname = usePathname();

  const adminMenuItems = [
    {
      icon: LayoutDashboard,
      label: "Dashboard",
      href: `/${locale}/admin`,
      badge: null,
    },
    {
      icon: Users,
      label: "Users",
      href: `/${locale}/admin/users`,
      badge: "3",
    },
    {
      icon: BarChart3,
      label: "Analytics",
      href: `/${locale}/admin/analytics`,
      badge: null,
    },
    {
      icon: FileText,
      label: "Reports",
      href: `/${locale}/admin/reports`,
      badge: null,
    },
    {
      icon: Activity,
      label: "Audit Logs",
      href: `/${locale}/admin/audit-logs`,
      badge: null,
    },
    {
      icon: Settings,
      label: "System Settings",
      href: `/${locale}/admin/system-settings`,
      badge: null,
    },
    {
      icon: HardDrive,
      label: "Data Management",
      href: `/${locale}/admin/backup`,
      badge: null,
    },
    {
      icon: Lock,
      label: "Security",
      href: `/${locale}/admin/security`,
      badge: null,
    },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <Sidebar>
      <SidebarHeader />
      <SidebarContent className="pt-16">
        <SidebarMenu>
          {adminMenuItems.map((item) => {
            const Icon = item.icon;
            return (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton asChild isActive={isActive(item.href)}>
                  <Link href={item.href}>
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                    {item.badge && (
                      <span className="ml-auto inline-flex items-center justify-center rounded-full bg-destructive text-destructive-foreground text-xs font-bold h-5 w-5">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter />
    </Sidebar>
  );
}
