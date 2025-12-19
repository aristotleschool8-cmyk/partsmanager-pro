export const dynamic = 'force-dynamic';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StatsCard } from "@/components/dashboard/stats-card";
import { Button } from "@/components/ui/button";
import {
  BarChart3,
  Users,
  Package,
  DollarSign,
  Activity,
  HardDrive,
  FileText,
  Lock,
} from "lucide-react";
import Link from "next/link";
import { Locale } from "@/lib/config";

export default async function AdminDashboard({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-headline font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-2">Overview of business health and system status</p>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Revenue"
          value="$125,430.50"
          icon={<DollarSign className="h-4 w-4" />}
          description="+20.1% from last month"
        />
        <StatsCard
          title="Active Users"
          value="24"
          icon={<Users className="h-4 w-4" />}
          description="+3 new this month"
        />
        <StatsCard
          title="Total Orders"
          value="1,247"
          icon={<FileText className="h-4 w-4" />}
          description="+147 this month"
        />
        <StatsCard
          title="System Status"
          value="Healthy"
          icon={<Activity className="h-4 w-4" />}
          description="All systems operational"
        />
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common admin tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Button asChild variant="outline" className="w-full justify-start">
              <Link href={`/${locale}/admin/users`}>
                <Users className="mr-2 h-4 w-4" />
                Manage Users
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start">
              <Link href={`/${locale}/admin/analytics`}>
                <BarChart3 className="mr-2 h-4 w-4" />
                View Analytics
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start">
              <Link href={`/${locale}/admin/backup`}>
                <HardDrive className="mr-2 h-4 w-4" />
                Backup Data
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start">
              <Link href={`/${locale}/admin/audit-logs`}>
                <Activity className="mr-2 h-4 w-4" />
                View Logs
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Admin Sections Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* User Management */}
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              User Management
            </CardTitle>
            <CardDescription>Manage users, roles, and permissions</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              View all users, manage roles, permissions, and activity tracking.
            </p>
            <Button asChild variant="ghost" className="w-full justify-start">
              <Link href={`/${locale}/admin/users`}>
                Go to Users →
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Analytics */}
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Analytics & Reports
            </CardTitle>
            <CardDescription>Business metrics and insights</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              View sales trends, revenue analysis, inventory metrics, and financial summaries.
            </p>
            <Button asChild variant="ghost" className="w-full justify-start">
              <Link href={`/${locale}/admin/analytics`}>
                View Analytics →
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Audit Logs */}
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Audit Logs
            </CardTitle>
            <CardDescription>Track all system activity</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              View user activities, data changes, system events, and security logs.
            </p>
            <Button asChild variant="ghost" className="w-full justify-start">
              <Link href={`/${locale}/admin/audit-logs`}>
                View Logs →
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HardDrive className="h-5 w-5" />
              Data Management
            </CardTitle>
            <CardDescription>Backup, export, and import</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Manage backups, export data, import records, and maintain system health.
            </p>
            <Button asChild variant="ghost" className="w-full justify-start">
              <Link href={`/${locale}/admin/backup`}>
                Manage Data →
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* System Settings */}
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              System Settings
            </CardTitle>
            <CardDescription>Global configuration</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Configure company info, business rules, tax settings, and templates.
            </p>
            <Button asChild variant="ghost" className="w-full justify-start">
              <Link href={`/${locale}/admin/system-settings`}>
                Settings →
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Security */}
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Security
            </CardTitle>
            <CardDescription>API keys and integrations</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Manage API keys, webhooks, integrations, and security policies.
            </p>
            <Button asChild variant="ghost" className="w-full justify-start">
              <Link href={`/${locale}/admin/security`}>
                Security Settings →
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Last 10 system events</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { user: "admin1", action: "Created user", resource: "john.doe", time: "2 hours ago" },
              { user: "manager", action: "Generated invoice", resource: "FAC-2025-0142", time: "4 hours ago" },
              { user: "admin1", action: "Backup completed", resource: "System", time: "1 day ago" },
              { user: "employee", action: "Updated product", resource: "SKU-001", time: "2 days ago" },
              { user: "admin1", action: "Imported data", resource: "250 products", time: "3 days ago" },
            ].map((activity, idx) => (
              <div key={idx} className="flex items-center justify-between py-2 border-b last:border-0">
                <div className="text-sm">
                  <p className="font-medium">{activity.user}</p>
                  <p className="text-muted-foreground text-xs">{activity.action} • {activity.resource}</p>
                </div>
                <span className="text-xs text-muted-foreground">{activity.time}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
