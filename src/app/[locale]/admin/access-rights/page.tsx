'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs, deleteDoc, doc, query, where } from 'firebase/firestore';
import { useFirebase } from '@/firebase/provider';
import { useToast } from '@/hooks/use-toast';
import { AccessRightProfile } from '@/lib/access-rights';
import { PageAccessGuard } from '@/components/admin/page-access-guard';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Trash2, Eye, Plus } from 'lucide-react';
import CreateAccessRightDialog from '@/components/admin/create-access-right-dialog';
import ViewAccessRightDialog from '@/components/admin/view-access-right-dialog';
import EditAccessRightDialog from '@/components/admin/edit-access-right-dialog';

interface AccessRightData extends AccessRightProfile {
  docId?: string;
}

function AccessRightsPageContent() {
  const { firestore } = useFirebase();
  const { toast } = useToast();
  const [accessRights, setAccessRights] = useState<AccessRightData[]>([]);
  const [isFetching, setIsFetching] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<AccessRightData | null>(null);

  // Load access rights from Firestore
  const loadAccessRights = async () => {
    if (!firestore) return;

    try {
      setIsFetching(true);
      const accessRightsRef = collection(firestore, 'accessRights');
      const snapshot = await getDocs(accessRightsRef);

      const rights: AccessRightData[] = [];
      snapshot.forEach((doc) => {
        rights.push({
          ...(doc.data() as AccessRightProfile),
          docId: doc.id,
        });
      });

      // Sort: templates first, then custom, both by name
      rights.sort((a, b) => {
        if (a.isTemplate !== b.isTemplate) {
          return b.isTemplate ? 1 : -1; // Templates first
        }
        return a.name.localeCompare(b.name);
      });

      setAccessRights(rights);
    } catch (error) {
      console.error('Error loading access rights:', error);
      toast({
        title: 'Error',
        description: 'Failed to load access rights',
        variant: 'destructive',
      });
    } finally {
      setIsFetching(false);
    }
  };

  // Handle delete access right
  const handleDelete = async (right: AccessRightData) => {
    if (!firestore) return;

    try {
      setIsDeleting(right.docId || '');

      // Check if any users are using this access right
      if (!right.isTemplate) {
        const usersRef = collection(firestore, 'users');
        const q = query(usersRef, where('accessRightId', '==', right.docId));
        const snapshot = await getDocs(q);

        if (!snapshot.empty) {
          toast({
            title: 'Cannot Delete',
            description: `${snapshot.size} user(s) are using this access right. Please reassign them first.`,
            variant: 'destructive',
          });
          setIsDeleting(null);
          return;
        }
      }

      // Delete from Firestore
      if (right.docId) {
        await deleteDoc(doc(firestore, 'accessRights', right.docId));
      }

      setAccessRights(accessRights.filter((r) => r.docId !== right.docId));
      setDeleteConfirm(null);
      toast({
        title: 'Success',
        description: 'Access right deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting access right:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete access right',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(null);
    }
  };

  // Initial load on mount
  useEffect(() => {
    if (firestore) {
      loadAccessRights();
    }
  }, [firestore]);

  if (isFetching) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  const filteredAccessRights = accessRights.filter(
    (right) =>
      right.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      right.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Access Rights Management</h1>
          <p className="text-muted-foreground mt-1">
            Define and manage granular access rights for your admins
          </p>
        </div>
        <CreateAccessRightDialog onAccessRightCreated={loadAccessRights}>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Custom Access Right
          </Button>
        </CreateAccessRightDialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Search Access Rights</CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="Search by name or description..."
            value={searchTerm}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            Access Right Profiles ({filteredAccessRights.length})
          </CardTitle>
          <CardDescription>
            Predefined templates and custom profiles for admin access control
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isFetching ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="animate-spin" />
            </div>
          ) : filteredAccessRights.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              {searchTerm ? 'No access rights match your search.' : 'No access rights found.'}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Created By</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAccessRights.map((right) => (
                    <TableRow key={right.docId || right.id}>
                      <TableCell className="font-medium">{right.name}</TableCell>
                      <TableCell>{right.description}</TableCell>
                      <TableCell>
                        <Badge variant={right.isTemplate ? 'default' : 'secondary'}>
                          {right.isTemplate ? 'Template' : 'Custom'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {right.createdBy === 'system' ? 'System' : right.createdBy}
                      </TableCell>
                      <TableCell className="text-right space-x-2 flex justify-end">
                        <ViewAccessRightDialog accessRight={right}>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </ViewAccessRightDialog>

                        {!right.isTemplate && (
                          <EditAccessRightDialog
                            accessRight={right}
                            onSaved={loadAccessRights}
                          >
                            <Button variant="outline" size="sm">
                              Edit
                            </Button>
                          </EditAccessRightDialog>
                        )}

                        {!right.isTemplate && (
                          <Button
                            variant="destructive"
                            size="sm"
                            disabled={isDeleting === right.docId}
                            onClick={() => setDeleteConfirm(right)}
                          >
                            {isDeleting === right.docId ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfirm !== null} onOpenChange={(open: boolean) => !open && setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogTitle>Delete Access Right</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete "{deleteConfirm?.name}"? This action cannot be undone.
            {deleteConfirm && !deleteConfirm.isTemplate && (
              <p className="text-yellow-600 mt-2 font-semibold">
                Make sure no users are assigned to this access right before deleting.
              </p>
            )}
          </AlertDialogDescription>
          <div className="flex justify-end gap-3">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default function AccessRightsPage() {
  return (
    <PageAccessGuard requiredPermission="accessRights" requiredActions={['view']}>
      <AccessRightsPageContent />
    </PageAccessGuard>
  );
}
