'use client';

import { ReactNode, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Firestore, doc, updateDoc, Timestamp } from 'firebase/firestore';
import { useFirebase } from '@/firebase/provider';
import { useUser } from '@/firebase/provider';
import { useToast } from '@/hooks/use-toast';
import { AccessRightProfile } from '@/lib/access-rights';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2 } from 'lucide-react';

const editAccessRightSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  usersView: z.boolean(),
  usersCreate: z.boolean(),
  usersEdit: z.boolean(),
  usersDelete: z.boolean(),
  usersManageRoles: z.boolean(),
  usersManageSubscriptions: z.boolean(),
  usersManagenageSuspension: z.boolean(),
  productsView: z.boolean(),
  productsCreate: z.boolean(),
  productsEdit: z.boolean(),
  productsDelete: z.boolean(),
  suppliersView: z.boolean(),
  suppliersCreate: z.boolean(),
  suppliersEdit: z.boolean(),
  suppliersDelete: z.boolean(),
  customersView: z.boolean(),
  customersCreate: z.boolean(),
  customersEdit: z.boolean(),
  customersDelete: z.boolean(),
  salesView: z.boolean(),
  salesCreate: z.boolean(),
  salesEdit: z.boolean(),
  salesDelete: z.boolean(),
  purchasesView: z.boolean(),
  purchasesCreate: z.boolean(),
  purchasesEdit: z.boolean(),
  purchasesDelete: z.boolean(),
  invoicesView: z.boolean(),
  invoicesCreate: z.boolean(),
  invoicesEdit: z.boolean(),
  invoicesDelete: z.boolean(),
  settingsView: z.boolean(),
  settingsEdit: z.boolean(),
  accessRightsView: z.boolean(),
  accessRightsCreate: z.boolean(),
  accessRightsEdit: z.boolean(),
  accessRightsDelete: z.boolean(),
});

type FormValues = z.infer<typeof editAccessRightSchema>;

interface EditAccessRightDialogProps {
  accessRight: AccessRightProfile & { docId?: string };
  children: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSaved?: () => void;
}

export default function EditAccessRightDialog({
  accessRight,
  children,
  open: externalOpen,
  onOpenChange,
  onSaved,
}: EditAccessRightDialogProps) {
  const { firestore } = useFirebase();
  const { user } = useUser();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(externalOpen || false);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(editAccessRightSchema),
    defaultValues: {
      name: accessRight.name,
      description: accessRight.description,
      usersView: accessRight.permissions.users.view,
      usersCreate: accessRight.permissions.users.create,
      usersEdit: accessRight.permissions.users.edit,
      usersDelete: accessRight.permissions.users.delete,
      usersManageRoles: accessRight.permissions.users.manageRoles,
      usersManageSubscriptions: accessRight.permissions.users.manageSubscriptions,
      usersManagenageSuspension: accessRight.permissions.users.manageSuspension,
      productsView: accessRight.permissions.products.view,
      productsCreate: accessRight.permissions.products.create,
      productsEdit: accessRight.permissions.products.edit,
      productsDelete: accessRight.permissions.products.delete,
      suppliersView: accessRight.permissions.suppliers.view,
      suppliersCreate: accessRight.permissions.suppliers.create,
      suppliersEdit: accessRight.permissions.suppliers.edit,
      suppliersDelete: accessRight.permissions.suppliers.delete,
      customersView: accessRight.permissions.customers.view,
      customersCreate: accessRight.permissions.customers.create,
      customersEdit: accessRight.permissions.customers.edit,
      customersDelete: accessRight.permissions.customers.delete,
      salesView: accessRight.permissions.sales.view,
      salesCreate: accessRight.permissions.sales.create,
      salesEdit: accessRight.permissions.sales.edit,
      salesDelete: accessRight.permissions.sales.delete,
      purchasesView: accessRight.permissions.purchases.view,
      purchasesCreate: accessRight.permissions.purchases.create,
      purchasesEdit: accessRight.permissions.purchases.edit,
      purchasesDelete: accessRight.permissions.purchases.delete,
      invoicesView: accessRight.permissions.invoices.view,
      invoicesCreate: accessRight.permissions.invoices.create,
      invoicesEdit: accessRight.permissions.invoices.edit,
      invoicesDelete: accessRight.permissions.invoices.delete,
      settingsView: accessRight.permissions.settings.view,
      settingsEdit: accessRight.permissions.settings.edit,
      accessRightsView: accessRight.permissions.accessRights.view,
      accessRightsCreate: accessRight.permissions.accessRights.create,
      accessRightsEdit: accessRight.permissions.accessRights.edit,
      accessRightsDelete: accessRight.permissions.accessRights.delete,
    },
  });

  const onSubmit = async (values: FormValues) => {
    if (!firestore || !user || !accessRight.docId) return;

    try {
      setIsLoading(true);

      const updatedAccessRight: Partial<AccessRightProfile> = {
        name: values.name,
        description: values.description,
        permissions: {
          users: {
            view: values.usersView,
            create: values.usersCreate,
            edit: values.usersEdit,
            delete: values.usersDelete,
            manageRoles: values.usersManageRoles,
            manageSubscriptions: values.usersManageSubscriptions,
            manageSuspension: values.usersManagenageSuspension,
          },
          products: {
            view: values.productsView,
            create: values.productsCreate,
            edit: values.productsEdit,
            delete: values.productsDelete,
          },
          suppliers: {
            view: values.suppliersView,
            create: values.suppliersCreate,
            edit: values.suppliersEdit,
            delete: values.suppliersDelete,
          },
          customers: {
            view: values.customersView,
            create: values.customersCreate,
            edit: values.customersEdit,
            delete: values.customersDelete,
          },
          sales: {
            view: values.salesView,
            create: values.salesCreate,
            edit: values.salesEdit,
            delete: values.salesDelete,
          },
          purchases: {
            view: values.purchasesView,
            create: values.purchasesCreate,
            edit: values.purchasesEdit,
            delete: values.purchasesDelete,
          },
          invoices: {
            view: values.invoicesView,
            create: values.invoicesCreate,
            edit: values.invoicesEdit,
            delete: values.invoicesDelete,
          },
          settings: {
            view: values.settingsView,
            edit: values.settingsEdit,
          },
          accessRights: {
            view: values.accessRightsView,
            create: values.accessRightsCreate,
            edit: values.accessRightsEdit,
            delete: values.accessRightsDelete,
          },
        },
        modifiedAt: Timestamp.now(),
        modifiedBy: user?.uid || 'unknown',
      };

      const docRef = doc(firestore, 'accessRights', accessRight.docId);
      await updateDoc(docRef, updatedAccessRight);

      toast({
        title: 'Success',
        description: 'Access right updated successfully',
      });

      handleOpenChange(false);
      onSaved?.();
    } catch (error) {
      console.error('Error updating access right:', error);
      toast({
        title: 'Error',
        description: 'Failed to update access right',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    setIsOpen(newOpen);
    onOpenChange?.(newOpen);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Edit Access Right</DialogTitle>
          <DialogDescription>
            Modify the permissions for "{accessRight.name}"
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[600px] pr-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <PermissionsEditSection form={form} />
            </form>
          </Form>
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={form.handleSubmit(onSubmit)} disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function PermissionsEditSection({ form }: { form: any }) {
  const permissions = [
    { label: 'Users', prefix: 'users', hasSpecial: true },
    { label: 'Products', prefix: 'products', hasSpecial: false },
    { label: 'Suppliers', prefix: 'suppliers', hasSpecial: false },
    { label: 'Customers', prefix: 'customers', hasSpecial: false },
    { label: 'Sales', prefix: 'sales', hasSpecial: false },
    { label: 'Purchases', prefix: 'purchases', hasSpecial: false },
    { label: 'Invoices', prefix: 'invoices', hasSpecial: false },
    { label: 'Settings', prefix: 'settings', hasSpecial: false, skipCreate: true, skipDelete: true },
    { label: 'Access Rights', prefix: 'accessRights', hasSpecial: false },
  ];

  return (
    <>
      {permissions.map((perm) => (
        <Card key={perm.prefix}>
          <CardHeader>
            <CardTitle className="text-base">{perm.label} Permissions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name={`${perm.prefix}View`}
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <FormLabel className="mb-0 cursor-pointer">View</FormLabel>
                  </FormItem>
                )}
              />

              {!perm.skipCreate && (
                <FormField
                  control={form.control}
                  name={`${perm.prefix}Create`}
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <FormLabel className="mb-0 cursor-pointer">Create</FormLabel>
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name={`${perm.prefix}Edit`}
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <FormLabel className="mb-0 cursor-pointer">Edit</FormLabel>
                  </FormItem>
                )}
              />

              {!perm.skipDelete && (
                <FormField
                  control={form.control}
                  name={`${perm.prefix}Delete`}
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <FormLabel className="mb-0 cursor-pointer">Delete</FormLabel>
                    </FormItem>
                  )}
                />
              )}
            </div>

            {perm.hasSpecial && (
              <div className="pt-3 border-t space-y-2">
                <p className="text-sm font-semibold text-muted-foreground">Special Permissions</p>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="usersManageRoles"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <FormLabel className="mb-0 cursor-pointer text-xs">
                          Manage Roles
                        </FormLabel>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="usersManageSubscriptions"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <FormLabel className="mb-0 cursor-pointer text-xs">
                          Manage Subscriptions
                        </FormLabel>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="usersManagenageSuspension"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <FormLabel className="mb-0 cursor-pointer text-xs">
                          Manage Suspension
                        </FormLabel>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </>
  );
}
