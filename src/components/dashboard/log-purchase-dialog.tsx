'use client';

import React, { useState, useMemo, useEffect } from 'react';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { PlusCircle, Trash2 } from 'lucide-react';
import { getDictionary } from '@/lib/dictionaries';
import type { Product } from '@/lib/types';
import { Autocomplete, AutocompleteOption } from './autocomplete';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "@/components/ui/table";
import { useFirebase } from '@/firebase/provider';
import { collection, getDocs, query, addDoc, serverTimestamp } from 'firebase/firestore';

type Dictionary = Awaited<ReturnType<typeof getDictionary>>;

interface PurchaseItem extends Product {
  purchaseQuantity: number;
}

interface Supplier {
  id: string;
  name: string;
  email?: string;
  phone?: string;
}

export function LogPurchaseDialog({ dictionary, onPurchaseAdded }: { dictionary: Dictionary; onPurchaseAdded?: () => void }) {
  const d = dictionary.logPurchaseDialog;
  const { firestore } = useFirebase();
  const [open, setOpen] = useState(false);
  const [purchaseItems, setPurchaseItems] = useState<PurchaseItem[]>([]);
  const [supplierInput, setSupplierInput] = useState<string>('');
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | undefined>();
  const [products, setProducts] = useState<Product[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch products and suppliers from Firestore when dialog opens
  useEffect(() => {
    if (!open || !firestore) return;

    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch products
        const productsRef = collection(firestore, 'products');
        const productsSnapshot = await getDocs(query(productsRef));
        const fetchedProducts: Product[] = [];
        productsSnapshot.forEach(doc => {
          const data = doc.data();
          // Skip deleted products
          if (data.isDeleted) return;
          
          fetchedProducts.push({
            id: doc.id,
            name: data.name || '',
            reference: data.reference || '',
            brand: data.brand || '',
            sku: data.sku || '',
            stock: data.stock || 0,
            purchasePrice: data.purchasePrice || 0,
            price: data.price || 0,
          });
        });
        setProducts(fetchedProducts);

        // Fetch suppliers
        const suppliersRef = collection(firestore, 'suppliers');
        const suppliersSnapshot = await getDocs(query(suppliersRef));
        const fetchedSuppliers: Supplier[] = [];
        suppliersSnapshot.forEach(doc => {
          fetchedSuppliers.push({
            id: doc.id,
            name: doc.data().name || '',
            email: doc.data().email || '',
            phone: doc.data().phone || '',
          });
        });
        setSuppliers(fetchedSuppliers);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [open, firestore]);

  // Filter suppliers based on input
  const filteredSuppliers = useMemo(() => {
    if (!supplierInput.trim()) return suppliers;
    const lowerInput = supplierInput.toLowerCase();
    return suppliers.filter(s => s.name.toLowerCase().includes(lowerInput));
  }, [suppliers, supplierInput]);

  const productOptions = useMemo(() => products.map(p => ({ value: p.id, label: `${p.name} (${p.reference})` })), [products]);
  const supplierOptions = useMemo(() => filteredSuppliers.map(s => ({ value: s.id, label: s.name })), [filteredSuppliers]);

  const handleAddProduct = (option: AutocompleteOption) => {
    const product = products.find(p => p.id === option.value);
    if (product && !purchaseItems.find(item => item.id === product.id)) {
      setPurchaseItems(prev => [...prev, { ...product, purchaseQuantity: 1 }]);
    }
  };

  const handleSupplierSelect = (option: AutocompleteOption) => {
    const supplier = suppliers.find(s => s.id === option.value);
    if (supplier) {
      setSelectedSupplier(supplier);
      setSupplierInput(supplier.name);
    }
  };

  const handleQuantityChange = (productId: string, quantity: number) => {
    const newQuantity = Math.max(0, quantity);
    setPurchaseItems(prev => prev.map(item => item.id === productId ? { ...item, purchaseQuantity: newQuantity } : item));
  };

  const handleRemoveItem = (productId: string) => {
    setPurchaseItems(prev => prev.filter(item => item.id !== productId));
  };
  
  const totalAmount = useMemo(() => {
    return purchaseItems.reduce((total, item) => total + (item.purchasePrice * item.purchaseQuantity), 0);
  }, [purchaseItems]);

  const handleSubmit = async () => {
    if (!firestore || !supplierInput.trim() || purchaseItems.length === 0) return;

    try {
      let supplierId = selectedSupplier?.id;
      let supplierName = supplierInput.trim();

      // Create new supplier if not selected from list
      if (!selectedSupplier) {
        const supplierRef = collection(firestore, 'suppliers');
        const newSupplierDoc = await addDoc(supplierRef, {
          name: supplierName,
          email: '',
          phone: '',
          createdAt: serverTimestamp(),
        });
        supplierId = newSupplierDoc.id;
      }

      // Save each purchase item to the purchases collection
      const purchasesRef = collection(firestore, 'purchases');
      for (const item of purchaseItems) {
        await addDoc(purchasesRef, {
          supplierId: supplierId,
          supplier: supplierName,
          productId: item.id,
          product: item.name,
          quantity: item.purchaseQuantity,
          amount: item.purchasePrice * item.purchaseQuantity,
          unitPrice: item.purchasePrice,
          reference: item.reference,
          date: serverTimestamp(),
        });
      }

      // Reset form
      setOpen(false);
      setPurchaseItems([]);
      setSupplierInput('');
      setSelectedSupplier(undefined);
      onPurchaseAdded?.();
    } catch (error) {
      console.error('Error saving purchase:', error);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2" />
          {d.logPurchase}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>{d.title}</DialogTitle>
          <DialogDescription>{d.description}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
            <div className="grid gap-2">
                <Label htmlFor="supplier">{d.supplier}</Label>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Input
                        type="text"
                        placeholder={d.supplierPlaceholder}
                        value={supplierInput}
                        onChange={(e) => {
                          setSupplierInput(e.target.value);
                          // Clear selection if user is typing
                          if (selectedSupplier && e.target.value !== selectedSupplier.name) {
                            setSelectedSupplier(undefined);
                          }
                        }}
                        className="w-full"
                    />
                    {/* Show dropdown suggestions */}
                    {supplierInput.trim() && supplierOptions.length > 0 && (
                      <div className="border border-t-0 rounded-b bg-white mt-0 max-h-48 overflow-y-auto z-50">
                        {supplierOptions.map((option) => (
                          <div
                            key={option.value}
                            onClick={() => handleSupplierSelect(option)}
                            className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                          >
                            {option.label}
                          </div>
                        ))}
                      </div>
                    )}
                    {supplierInput.trim() && supplierOptions.length === 0 && (
                      <div className="border border-t-0 rounded-b bg-white mt-0 px-3 py-2 text-sm text-gray-500">
                        {d.noSupplierFound}
                      </div>
                    )}
                  </div>
                </div>
                {supplierInput.trim() && !selectedSupplier && (
                  <p className="text-xs text-blue-600">{supplierInput} - {d.newSupplier}</p>
                )}
            </div>
            <div className="grid gap-2">
                <Label htmlFor="product">{d.product}</Label>
                <Autocomplete
                    options={productOptions}
                    placeholder={d.productPlaceholder}
                    emptyMessage={d.noProductFound}
                    onValueChange={handleAddProduct}
                />
            </div>
          
          {purchaseItems.length > 0 && (
            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>{d.product}</TableHead>
                                <TableHead className="w-[120px]">{d.quantity}</TableHead>
                                <TableHead className="text-right w-[120px]">{d.price}</TableHead>
                                <TableHead className="text-right w-[120px]">{d.total}</TableHead>
                                <TableHead className="w-[50px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {purchaseItems.map(item => (
                                <TableRow key={item.id}>
                                    <TableCell>{item.name}</TableCell>
                                    <TableCell>
                                        <Input 
                                            type="number" 
                                            value={item.purchaseQuantity}
                                            onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value, 10))}
                                            className="w-full"
                                            min="0"
                                        />
                                    </TableCell>
                                    <TableCell className="text-right">{item.purchasePrice.toFixed(2)} DZD</TableCell>
                                    <TableCell className="text-right">{(item.purchasePrice * item.purchaseQuantity).toFixed(2)} DZD</TableCell>
                                    <TableCell>
                                        <Button variant="ghost" size="icon" onClick={() => handleRemoveItem(item.id)}>
                                            <Trash2 className="h-4 w-4 text-destructive"/>
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
          )}

          <div className="flex justify-end font-bold text-lg">
            <span>{d.total}: {totalAmount.toFixed(2)} DZD</span>
          </div>

        </div>
        <DialogFooter>
          <Button onClick={handleSubmit} disabled={!supplierInput.trim() || purchaseItems.length === 0}>
            {d.submit}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
