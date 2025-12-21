'use client';

import { ReactNode } from 'react';
import { AccessRightProfile } from '@/lib/access-rights';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ViewAccessRightDialogProps {
  accessRight: AccessRightProfile;
  children?: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

interface PermissionRow {
  label: string;
  view: boolean;
  create: boolean;
  edit: boolean;
  delete: boolean;
}

export default function ViewAccessRightDialog({
  accessRight,
  children,
  open,
  onOpenChange,
}: ViewAccessRightDialogProps) {
  const permissions = accessRight.permissions;

  const permissionRows: PermissionRow[] = [
    {
      label: 'Users',
      view: permissions.users.view,
      create: permissions.users.create,
      edit: permissions.users.edit,
      delete: permissions.users.delete,
    },
    {
      label: 'Products',
      view: permissions.products.view,
      create: permissions.products.create,
      edit: permissions.products.edit,
      delete: permissions.products.delete,
    },
    {
      label: 'Suppliers',
      view: permissions.suppliers.view,
      create: permissions.suppliers.create,
      edit: permissions.suppliers.edit,
      delete: permissions.suppliers.delete,
    },
    {
      label: 'Customers',
      view: permissions.customers.view,
      create: permissions.customers.create,
      edit: permissions.customers.edit,
      delete: permissions.customers.delete,
    },
    {
      label: 'Sales',
      view: permissions.sales.view,
      create: permissions.sales.create,
      edit: permissions.sales.edit,
      delete: permissions.sales.delete,
    },
    {
      label: 'Purchases',
      view: permissions.purchases.view,
      create: permissions.purchases.create,
      edit: permissions.purchases.edit,
      delete: permissions.purchases.delete,
    },
    {
      label: 'Invoices',
      view: permissions.invoices.view,
      create: permissions.invoices.create,
      edit: permissions.invoices.edit,
      delete: permissions.invoices.delete,
    },
    {
      label: 'Settings',
      view: permissions.settings.view,
      create: false,
      edit: permissions.settings.edit,
      delete: false,
    },
    {
      label: 'Access Rights',
      view: permissions.accessRights.view,
      create: permissions.accessRights.create,
      edit: permissions.accessRights.edit,
      delete: permissions.accessRights.delete,
    },
  ];

  const PermissionCell = ({ allowed }: { allowed: boolean }) => (
    <div className="text-center">
      <Badge variant={allowed ? 'default' : 'secondary'} className="text-xs">
        {allowed ? '✓' : '✗'}
      </Badge>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>{accessRight.name}</DialogTitle>
          <DialogDescription>{accessRight.description}</DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[500px] pr-4">
          <div className="space-y-6">
            {/* Header Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <span className="text-sm text-muted-foreground">Type: </span>
                  <Badge variant={accessRight.isTemplate ? 'default' : 'secondary'}>
                    {accessRight.isTemplate ? 'Template' : 'Custom'}
                  </Badge>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Created By: </span>
                  <span className="text-sm font-medium">
                    {accessRight.createdBy === 'system' ? 'System' : accessRight.createdBy}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Permissions Table */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Permissions</CardTitle>
                <CardDescription>Granular access control for each resource</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 px-3">Resource</th>
                        <th className="text-center py-2 px-3">View</th>
                        <th className="text-center py-2 px-3">Create</th>
                        <th className="text-center py-2 px-3">Edit</th>
                        <th className="text-center py-2 px-3">Delete</th>
                      </tr>
                    </thead>
                    <tbody>
                      {permissionRows.map((row) => (
                        <tr key={row.label} className="border-b hover:bg-muted/50">
                          <td className="py-3 px-3 font-medium">{row.label}</td>
                          <td>
                            <PermissionCell allowed={row.view} />
                          </td>
                          <td>
                            <PermissionCell allowed={row.create} />
                          </td>
                          <td>
                            <PermissionCell allowed={row.edit} />
                          </td>
                          <td>
                            <PermissionCell allowed={row.delete} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Special Permissions for Users */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Special User Management Permissions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Manage User Roles (Promote to Admin)</span>
                  <Badge variant={permissions.users.manageRoles ? 'default' : 'secondary'}>
                    {permissions.users.manageRoles ? '✓' : '✗'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Manage Subscriptions (Trial ↔ Premium)</span>
                  <Badge variant={permissions.users.manageSubscriptions ? 'default' : 'secondary'}>
                    {permissions.users.manageSubscriptions ? '✓' : '✗'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Manage User Status (Suspend/Activate)</span>
                  <Badge variant={permissions.users.manageSuspension ? 'default' : 'secondary'}>
                    {permissions.users.manageSuspension ? '✓' : '✗'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
