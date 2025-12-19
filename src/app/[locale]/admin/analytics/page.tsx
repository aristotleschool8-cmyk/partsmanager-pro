'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminAnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-headline font-bold">Analytics & Reports</h1>
        <p className="text-muted-foreground mt-2">Business metrics and insights</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Sales Analytics</CardTitle>
            <CardDescription>Revenue trends and metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-center py-12">Sales chart will be implemented here</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Inventory Analytics</CardTitle>
            <CardDescription>Stock levels and trends</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-center py-12">Inventory chart will be implemented here</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Financial Summary</CardTitle>
            <CardDescription>Revenue, expenses, and profit</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-center py-12">Financial metrics will be implemented here</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Customer Insights</CardTitle>
            <CardDescription>Customer behavior and trends</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-center py-12">Customer analytics will be implemented here</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
