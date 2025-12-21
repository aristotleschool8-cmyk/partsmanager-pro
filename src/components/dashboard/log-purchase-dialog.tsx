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
import { collection, getDocs, query, addDoc, serverTimestamp, where, updateDoc, doc } from 'firebase/firestore';

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
  const [newProductForm, setNewProductForm] = useState({
    name: '',
    reference: '',
    purchasePrice: '',
    quantity: '1',
  });
  const [showNewProductForm, setShowNewProductForm] = useState(false);
  const [batchProducts, setBatchProducts] = useState<Array<{
    name: string;
    reference: string;
    purchasePrice: string;
    quantity: string;
  }>>([{ name: '', reference: '', purchasePrice: '', quantity: '' }]);
  const [showBatchForm, setShowBatchForm] = useState(false);

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

  const handleAddNewProduct = async () => {
    if (!firestore || !newProductForm.name.trim() || !newProductForm.purchasePrice.trim()) {
      return;
    }

    try {
      // Create new product
      const productsRef = collection(firestore, 'products');
      const newProductRef = await addDoc(productsRef, {
        name: newProductForm.name.trim(),
        reference: newProductForm.reference.trim() || `REF-${Date.now()}`,
        brand: '',
        stock: 0,
        purchasePrice: parseFloat(newProductForm.purchasePrice),
        price: parseFloat(newProductForm.purchasePrice) * 1.25,
        createdAt: serverTimestamp(),
        isDeleted: false,
      });

      // Add to purchase items
      const newProduct: PurchaseItem = {
        id: newProductRef.id,
        name: newProductForm.name.trim(),
        reference: newProductForm.reference.trim() || `REF-${Date.now()}`,
        brand: '',
        sku: '',
        stock: 0,
        purchasePrice: parseFloat(newProductForm.purchasePrice),
        price: parseFloat(newProductForm.purchasePrice) * 1.25,
        purchaseQuantity: parseInt(newProductForm.quantity) || 1,
      };

      setPurchaseItems(prev => [...prev, newProduct]);

      // Add to products list
      setProducts(prev => [...prev, {
        id: newProductRef.id,
        name: newProductForm.name.trim(),
        reference: newProductForm.reference.trim() || `REF-${Date.now()}`,
        brand: '',
        sku: '',
        stock: 0,
        purchasePrice: parseFloat(newProductForm.purchasePrice),
        price: parseFloat(newProductForm.purchasePrice) * 1.25,
      }]);

      // Reset form
      setNewProductForm({
        name: '',
        reference: '',
        purchasePrice: '',
        quantity: '1',
      });
      setShowNewProductForm(false);
    } catch (error) {
      console.error('Error adding new product:', error);
    }
  };

  const handleAddBatchProducts = async () => {
    const validProducts = batchProducts.filter(p => p.name.trim() && p.purchasePrice.trim());
    if (validProducts.length === 0) return;

    try {
      const productsRef = collection(firestore, 'products');
      
      for (const batchProduct of validProducts) {
        // Create new product
        const newProductRef = await addDoc(productsRef, {
          name: batchProduct.name.trim(),
          reference: batchProduct.reference.trim() || `REF-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          brand: '',
          stock: 0,
          purchasePrice: parseFloat(batchProduct.purchasePrice),
          price: parseFloat(batchProduct.purchasePrice) * 1.25,
          createdAt: serverTimestamp(),
          isDeleted: false,
        });

        // Add to purchase items
        const newProduct: PurchaseItem = {
          id: newProductRef.id,
          name: batchProduct.name.trim(),
          reference: batchProduct.reference.trim() || `REF-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          brand: '',
          sku: '',
          stock: 0,
          purchasePrice: parseFloat(batchProduct.purchasePrice),
          price: parseFloat(batchProduct.purchasePrice) * 1.25,
          purchaseQuantity: parseInt(batchProduct.quantity) || 1,
        };

        setPurchaseItems(prev => [...prev, newProduct]);

        // Add to products list
        setProducts(prev => [...prev, {
          id: newProductRef.id,
          name: batchProduct.name.trim(),
          reference: batchProduct.reference.trim() || `REF-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          brand: '',
          sku: '',
          stock: 0,
          purchasePrice: parseFloat(batchProduct.purchasePrice),
          price: parseFloat(batchProduct.purchasePrice) * 1.25,
        }]);
      }

      // Reset batch form
      setBatchProducts([{ name: '', reference: '', purchasePrice: '', quantity: '' }]);
      setShowBatchForm(false);
    } catch (error) {
      console.error('Error adding batch products:', error);
    }
  };

  const updateBatchProduct = (index: number, field: string, value: string) => {
    setBatchProducts(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const addBatchRow = () => {
    setBatchProducts(prev => [...prev, { name: '', reference: '', purchasePrice: '', quantity: '' }]);
  };

  const removeBatchRow = (index: number) => {
    setBatchProducts(prev => prev.filter((_, i) => i !== index));
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

      // Save each purchase item to the purchases collection and update product stock
      const purchasesRef = collection(firestore, 'purchases');
      const productsRef = collection(firestore, 'products');

      for (const item of purchaseItems) {
        // Save purchase record
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

        // Update product stock: add purchase quantity to existing stock
        const productRef = doc(firestore, 'products', item.id);
        const currentStock = item.stock || 0;
        const newStock = currentStock + item.purchaseQuantity;

        await updateDoc(productRef, {
          stock: newStock,
          purchasePrice: item.purchasePrice, // Update purchase price
          price: item.purchasePrice * 1.25, // Auto-calculate selling price (25% markup)
          updatedAt: serverTimestamp(),
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
                <div className="flex justify-between items-center">
                  <Label htmlFor="product">{d.product}</Label>
                  <div className="flex gap-2">
                    <Button 
                      type="button"
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setShowBatchForm(!showBatchForm);
                        setShowNewProductForm(false);
                      }}
                    >
                      <PlusCircle className="w-4 h-4 mr-1" />
                      Batch Add
                    </Button>
                    <Button 
                      type="button"
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setShowNewProductForm(!showNewProductForm);
                        setShowBatchForm(false);
                      }}
                    >
                      <PlusCircle className="w-4 h-4 mr-1" />
                      New Product
                    </Button>
                  </div>
                </div>
                <Autocomplete
                    options={productOptions}
                    placeholder={d.productPlaceholder}
                    emptyMessage={d.noProductFound}
                    onValueChange={handleAddProduct}
                />

                {/* Batch Products Form */}
                {showBatchForm && (
                  <Card className="mt-2 p-4">
                    <div className="space-y-3">
                      <div className="grid gap-2">
                        <Label className="text-sm font-semibold">Add Multiple Products</Label>
                        <div className="border rounded">
                          <Table>
                            <TableHeader>
                              <TableRow className="hover:bg-transparent">
                                <TableHead className="py-2 px-3 text-xs">Product Name</TableHead>
                                <TableHead className="py-2 px-3 text-xs">Reference</TableHead>
                                <TableHead className="py-2 px-3 text-xs w-[100px]">Price</TableHead>
                                <TableHead className="py-2 px-3 text-xs w-[80px]">Qty</TableHead>
                                <TableHead className="py-2 px-3 text-xs w-[50px]"></TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {batchProducts.map((product, idx) => (
                                <TableRow key={idx} className="hover:bg-gray-50">
                                  <TableCell className="p-1">
                                    <Input
                                      placeholder="Product name"
                                      value={product.name}
                                      onChange={(e) => updateBatchProduct(idx, 'name', e.target.value)}
                                      className="h-8 text-xs"
                                    />
                                  </TableCell>
                                  <TableCell className="p-1">
                                    <Input
                                      placeholder="Auto-generate"
                                      value={product.reference}
                                      onChange={(e) => updateBatchProduct(idx, 'reference', e.target.value)}
                                      className="h-8 text-xs"
                                    />
                                  </TableCell>
                                  <TableCell className="p-1">
                                    <Input
                                      type="number"
                                      placeholder="0.00"
                                      value={product.purchasePrice}
                                      onChange={(e) => updateBatchProduct(idx, 'purchasePrice', e.target.value)}
                                      className="h-8 text-xs"
                                    />
                                  </TableCell>
                                  <TableCell className="p-1">
                                    <Input
                                      type="number"
                                      placeholder="1"
                                      value={product.quantity}
                                      onChange={(e) => updateBatchProduct(idx, 'quantity', e.target.value)}
                                      className="h-8 text-xs"
                                    />
                                  </TableCell>
                                  <TableCell className="p-1">
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8"
                                      onClick={() => removeBatchRow(idx)}
                                    >
                                      <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={addBatchRow}
                        >
                          <PlusCircle className="w-4 h-4 mr-1" />
                          Add Row
                        </Button>
                        <Button 
                          type="button"
                          size="sm"
                          onClick={handleAddBatchProducts}
                        >
                          Add Products
                        </Button>
                        <Button 
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setShowBatchForm(false)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </Card>
                )}

                {/* New Product Form */}
                {showNewProductForm && (
                  <Card className="mt-2 p-4">
                    <div className="space-y-3">
                      <div className="grid gap-1">
                        <Label htmlFor="productName" className="text-sm">Product Name *</Label>
                        <Input
                          id="productName"
                          placeholder="Enter product name..."
                          value={newProductForm.name}
                          onChange={(e) => setNewProductForm(prev => ({ ...prev, name: e.target.value }))}
                        />
                      </div>
                      <div className="grid gap-1">
                        <Label htmlFor="productRef" className="text-sm">Reference</Label>
                        <Input
                          id="productRef"
                          placeholder="Auto-generated if empty"
                          value={newProductForm.reference}
                          onChange={(e) => setNewProductForm(prev => ({ ...prev, reference: e.target.value }))}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="grid gap-1">
                          <Label htmlFor="productPrice" className="text-sm">Purchase Price *</Label>
                          <Input
                            id="productPrice"
                            type="number"
                            placeholder="0.00"
                            value={newProductForm.purchasePrice}
                            onChange={(e) => setNewProductForm(prev => ({ ...prev, purchasePrice: e.target.value }))}
                          />
                        </div>
                        <div className="grid gap-1">
                          <Label htmlFor="productQty" className="text-sm">Quantity</Label>
                          <Input
                            id="productQty"
                            type="number"
                            placeholder="1"
                            value={newProductForm.quantity}
                            onChange={(e) => setNewProductForm(prev => ({ ...prev, quantity: e.target.value }))}
                          />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          type="button"
                          size="sm"
                          onClick={handleAddNewProduct}
                        >
                          Add Product
                        </Button>
                        <Button 
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setShowNewProductForm(false)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </Card>
                )}
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
