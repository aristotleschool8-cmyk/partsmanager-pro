
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PlusCircle, Upload, Loader2 } from 'lucide-react';
import { getDictionary } from '@/lib/dictionaries';
import { useFirebase } from '@/firebase/provider';
import { doc, getDoc, addDoc, collection } from 'firebase/firestore';
import { User as AppUser } from '@/lib/types';
import { canWrite, getExportRestrictionMessage } from '@/lib/trial-utils';
import { useToast } from '@/hooks/use-toast';

type Dictionary = Awaited<ReturnType<typeof getDictionary>>;

export function AddProductDialog({ dictionary, onProductAdded }: { dictionary: Dictionary; onProductAdded?: () => void }) {
  const d = dictionary.addProductDialog;
  const { user, firestore } = useFirebase();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [userDoc, setUserDoc] = useState<AppUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    designation: '',
    reference: '',
    brand: '',
    quantity: '0',
    purchasePrice: '0',
  });

  // Fetch user document to check permissions
  useEffect(() => {
    if (!user || !firestore) return;

    const fetchUserDoc = async () => {
      try {
        const userDocRef = doc(firestore, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          setUserDoc(userDocSnap.data() as AppUser);
        }
      } catch (error) {
        console.error('Error fetching user document:', error);
      }
    };

    fetchUserDoc();
  }, [user, firestore]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check permissions
    if (!canWrite(userDoc)) {
      const message = getExportRestrictionMessage(userDoc) || 'You do not have permission to add products.';
      toast({
        title: 'Permission Denied',
        description: message,
        variant: 'destructive',
      });
      return;
    }

    if (!firestore) {
      toast({
        title: 'Error',
        description: 'Firestore not initialized.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const productsRef = collection(firestore, 'products');
      await addDoc(productsRef, {
        name: formData.designation,
        reference: formData.reference,
        brand: formData.brand,
        stock: parseInt(formData.quantity),
        purchasePrice: parseFloat(formData.purchasePrice),
        price: parseFloat(formData.purchasePrice) * 1.25, // Default 25% markup
        createdAt: new Date(),
      });

      toast({
        title: 'Success',
        description: 'Product added successfully.',
      });

      // Reset form
      setFormData({
        designation: '',
        reference: '',
        brand: '',
        quantity: '0',
        purchasePrice: '0',
      });
      setOpen(false);
      
      // Call the callback if provided
      if (onProductAdded) {
        onProductAdded();
      }
    } catch (error: any) {
      console.error('Error adding product:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to add product. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Show message if user can't write
  if (!canWrite(userDoc)) {
    return (
      <Button disabled title="Trial users cannot add products">
        <PlusCircle className="mr-2" />
        {dictionary.dashboard.addProduct}
      </Button>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2" />
          {dictionary.dashboard.addProduct}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{d.title}</DialogTitle>
          <DialogDescription>{d.description}</DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="manual">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="manual">{d.manualEntry}</TabsTrigger>
            <TabsTrigger value="batchImport">{d.batchImport}</TabsTrigger>
          </TabsList>
          <TabsContent value="manual">
            <form onSubmit={handleSubmit} className="space-y-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="designation">{d.designation}</Label>
                <Input
                  id="designation"
                  placeholder={d.designationPlaceholder}
                  value={formData.designation}
                  onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                  disabled={isLoading}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="reference">{d.reference}</Label>
                <Input
                  id="reference"
                  placeholder={d.referencePlaceholder}
                  value={formData.reference}
                  onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                  disabled={isLoading}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="brand">{d.brand}</Label>
                <Input
                  id="brand"
                  placeholder={d.brandPlaceholder}
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  disabled={isLoading}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="quantity">{d.quantity}</Label>
                  <Input
                    id="quantity"
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    disabled={isLoading}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="purchase-price">{d.purchasePrice}</Label>
                  <Input
                    id="purchase-price"
                    type="number"
                    value={formData.purchasePrice}
                    onChange={(e) => setFormData({ ...formData, purchasePrice: e.target.value })}
                    disabled={isLoading}
                    required
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {d.submit}
                </Button>
              </DialogFooter>
            </form>
          </TabsContent>
          <TabsContent value="batchImport">
            <div className="flex flex-col items-center justify-center space-y-4 py-12">
                <Upload className="h-12 w-12 text-muted-foreground" />
                <p className="text-center text-muted-foreground">{d.batchDescription}</p>
                <Button variant="outline">{d.downloadTemplate}</Button>
            </div>
            <DialogFooter>
                <Button className="w-full" disabled>
                    {d.uploadFile}
                </Button>
            </DialogFooter>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
