'use client';

import { ReactNode, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Firestore, collection, addDoc, Timestamp } from 'firebase/firestore';
import { useFirebase } from '@/firebase/provider';
import { useUser } from '@/firebase/provider';
import { useToast } from '@/hooks/use-toast';
import { AccessRightProfile, ACCESS_RIGHT_TEMPLATES } from '@/lib/access-rights';
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2 } from 'lucide-react';

const createAccessRightSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  templateId: z.string().optional(),
  // User permissions
  usersView: z.boolean(),
  usersCreate: z.boolean(),
  usersEdit: z.boolean(),
  usersDelete: z.boolean(),
  usersManageRoles: z.boolean(),
  usersManageSubscriptions: z.boolean(),
  usersManagenageSuspension: z.boolean(),
  // Products
  productsView: z.boolean(),
  productsCreate: z.boolean(),
  productsEdit: z.boolean(),
  productsDelete: z.boolean(),
  // Suppliers
  suppliersView: z.boolean(),
  suppliersCreate: z.boolean(),
  suppliersEdit: z.boolean(),
  suppliersDelete: z.boolean(),
  // Customers
  customersView: z.boolean(),
  customersCreate: z.boolean(),
  customersEdit: z.boolean(),
  customersDelete: z.boolean(),
  // Sales
  salesView: z.boolean(),
  salesCreate: z.boolean(),
  salesEdit: z.boolean(),
  salesDelete: z.boolean(),
  // Purchases
  purchasesView: z.boolean(),
  purchasesCreate: z.boolean(),
  purchasesEdit: z.boolean(),
  purchasesDelete: z.boolean(),
  // Invoices
  invoicesView: z.boolean(),
  invoicesCreate: z.boolean(),
  invoicesEdit: z.boolean(),
  invoicesDelete: z.boolean(),
  // Settings
  settingsView: z.boolean(),
  settingsEdit: z.boolean(),
  // Access Rights
  accessRightsView: z.boolean(),
  accessRightsCreate: z.boolean(),
  accessRightsEdit: z.boolean(),
  accessRightsDelete: z.boolean(),
});

type FormValues = z.infer<typeof createAccessRightSchema>;

interface CreateAccessRightDialogProps {
  children: ReactNode;
  onAccessRightCreated?: () => void;
}

export default function CreateAccessRightDialog({
  children,
  onAccessRightCreated,
}: CreateAccessRightDialogProps) {
  const { firestore } = useFirebase();
  const { user } = useUser();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');

  const form = useForm<FormValues>({
    resolver: zodResolver(createAccessRightSchema),
    defaultValues: {
      name: '',
      description: '',
      templateId: '',
      usersView: false,
      usersCreate: false,
      usersEdit: false,
      usersDelete: false,
      usersManageRoles: false,
      usersManageSubscriptions: false,
      usersManagenageSuspension: false,
      productsView: false,
      productsCreate: false,
      productsEdit: false,
      productsDelete: false,
      suppliersView: false,
      suppliersCreate: false,
      suppliersEdit: false,
      suppliersDelete: false,
      customersView: false,
      customersCreate: false,
      customersEdit: false,
      customersDelete: false,
      salesView: false,
      salesCreate: false,
      salesEdit: false,
      salesDelete: false,
      purchasesView: false,
      purchasesCreate: false,
      purchasesEdit: false,
      purchasesDelete: false,
      invoicesView: false,
      invoicesCreate: false,
      invoicesEdit: false,
      invoicesDelete: false,
      settingsView: false,
      settingsEdit: false,
      accessRightsView: false,
      accessRightsCreate: false,
      accessRightsEdit: false,
      accessRightsDelete: false,
    },
  });

  // Apply template values to form
  const applyTemplate = (templateId: string) => {
    const template = ACCESS_RIGHT_TEMPLATES[templateId];
    if (!template) return;

    const { permissions } = template;
    form.reset({
      name: '',
      description: '',
      usersView: permissions.users.view,
      usersCreate: permissions.users.create,
      usersEdit: permissions.users.edit,
      usersDelete: permissions.users.delete,
      usersManageRoles: permissions.users.manageRoles,
      usersManageSubscriptions: permissions.users.manageSubscriptions,
      usersManagenageSuspension: permissions.users.manageSuspension,
      productsView: permissions.products.view,
      productsCreate: permissions.products.create,
      productsEdit: permissions.products.edit,
      productsDelete: permissions.products.delete,
      suppliersView: permissions.suppliers.view,
      suppliersCreate: permissions.suppliers.create,
      suppliersEdit: permissions.suppliers.edit,
      suppliersDelete: permissions.suppliers.delete,
      customersView: permissions.customers.view,
      customersCreate: permissions.customers.create,
      customersEdit: permissions.customers.edit,
      customersDelete: permissions.customers.delete,
      salesView: permissions.sales.view,
      salesCreate: permissions.sales.create,
      salesEdit: permissions.sales.edit,
      salesDelete: permissions.sales.delete,
      purchasesView: permissions.purchases.view,
      purchasesCreate: permissions.purchases.create,
      purchasesEdit: permissions.purchases.edit,
      purchasesDelete: permissions.purchases.delete,
      invoicesView: permissions.invoices.view,
      invoicesCreate: permissions.invoices.create,
      invoicesEdit: permissions.invoices.edit,
      invoicesDelete: permissions.invoices.delete,
      settingsView: permissions.settings.view,
      settingsEdit: permissions.settings.edit,
      accessRightsView: permissions.accessRights.view,
      accessRightsCreate: permissions.accessRights.create,
      accessRightsEdit: permissions.accessRights.edit,
      accessRightsDelete: permissions.accessRights.delete,
    });
  };

  const onSubmit = async (values: FormValues) => {
    if (!firestore || !user) return;

    try {
      setIsLoading(true);

      const newAccessRight: AccessRightProfile = {
        id: '',
        name: values.name,
        description: values.description,
        isTemplate: false,
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
        createdAt: Timestamp.now(),
        createdBy: user?.uid || 'unknown',
      };

      const accessRightsRef = collection(firestore, 'accessRights');
      await addDoc(accessRightsRef, newAccessRight);

      toast({
        title: 'Success',
        description: 'Access right created successfully',
      });

      setIsOpen(false);
      form.reset();
      setSelectedTemplate('');
      onAccessRightCreated?.();
    } catch (error) {
      console.error('Error creating access right:', error);
      toast({
        title: 'Error',
        description: 'Failed to create access right',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Create Custom Access Right</DialogTitle>
          <DialogDescription>
            Define a new access right profile with granular permissions
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[600px] pr-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Basic Info */}
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
                          <Input
                            placeholder="e.g., Sales Manager, Finance Admin"
                            {...field}
                          />
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
                          <Textarea
                            placeholder="Describe the purpose of this access right..."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="templateId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start from Template (Optional)</FormLabel>
                        <Select
                          value={selectedTemplate}
                          onValueChange={(value) => {
                            setSelectedTemplate(value);
                            applyTemplate(value);
                          }}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a template to start with..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="">Start from scratch</SelectItem>
                            {Object.entries(ACCESS_RIGHT_TEMPLATES).map(([id, template]) => (
                              <SelectItem key={id} value={id}>
                                {template.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Select a template to auto-populate permissions
                        </FormDescription>
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Permissions */}
              <PermissionsSection form={form} />
            </form>
          </Form>
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button onClick={form.handleSubmit(onSubmit)} disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Access Right
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Reusable permissions section component
function PermissionsSection({ form }: { form: any }) {
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
              {!['skipCreate', 'skipDelete'].includes('skipCreate') && (
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
              )}

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
