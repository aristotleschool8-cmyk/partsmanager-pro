'use client';

export const dynamic = 'force-dynamic';

import { MoreHorizontal, PlusCircle, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { use } from "react";
import { getDictionary } from "@/lib/dictionaries";
import { Locale } from "@/lib/config";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useFirebase } from "@/firebase/provider";
import { collection, getDocs, query } from "firebase/firestore";

interface Purchase {
  id: string;
  product: string;
  supplier: string;
  date: string;
  quantity: number;
  amount: number;
}

export default function PurchasesPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = use(params);
  const { firestore } = useFirebase();
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dictionary, setDictionary] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Load dictionary
  useEffect(() => {
    const loadDictionary = async () => {
      const dict = await getDictionary(locale);
      setDictionary(dict);
    };
    loadDictionary();
  }, [locale]);

  // Fetch purchases from Firestore
  useEffect(() => {
    if (!firestore) return;

    const fetchPurchases = async () => {
      try {
        setIsLoading(true);
        const purchasesRef = collection(firestore, 'purchases');
        const q = query(purchasesRef);
        const querySnapshot = await getDocs(q);
        
        const fetchedPurchases: Purchase[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          fetchedPurchases.push({
            id: doc.id,
            product: data.product || '',
            supplier: data.supplier || '',
            date: data.date ? new Date(data.date.toDate?.() || data.date).toISOString() : new Date().toISOString(),
            quantity: data.quantity || 0,
            amount: data.amount || 0,
          });
        });

        setPurchases(fetchedPurchases);
      } catch (error) {
        console.error('Error fetching purchases:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPurchases();
  }, [firestore]);

  if (!dictionary) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  const filteredPurchases = purchases.filter((purchase) =>
    purchase.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
    purchase.supplier.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-headline font-bold">
          {dictionary.dashboard.purchases}
        </h1>
        <p className="text-muted-foreground">Manage your purchase orders.</p>
      </div>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Purchases</CardTitle>
            <div className="flex items-center gap-4">
              <Input 
                placeholder="Search purchases..." 
                className="w-full max-w-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Button>
                <PlusCircle className="mr-2" />
                Log Purchase
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-48">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead className="hidden sm:table-cell">Supplier</TableHead>
                  <TableHead className="hidden sm:table-cell">Date</TableHead>
                  <TableHead className="hidden md:table-cell">Quantity</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPurchases.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      {purchases.length === 0 ? 'No purchases found. Log one to get started!' : 'No purchases match your search.'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPurchases.map((purchase) => (
                    <TableRow key={purchase.id}>
                      <TableCell className="font-medium">{purchase.product}</TableCell>
                      <TableCell className="hidden sm:table-cell">{purchase.supplier}</TableCell>
                      <TableCell className="hidden sm:table-cell">{new Date(purchase.date).toLocaleDateString()}</TableCell>
                      <TableCell className="hidden md:table-cell">{purchase.quantity}</TableCell>
                      <TableCell className="text-right">{purchase.amount.toFixed(2)} DZD</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button aria-haspopup="true" size="icon" variant="ghost">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Toggle menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem>View Details</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
        <CardFooter>
          <div className="text-xs text-muted-foreground">
            Showing <strong>1-{filteredPurchases.length}</strong> of <strong>{purchases.length}</strong> purchases
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
