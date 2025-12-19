'use client';

import { useEffect, useState } from 'react';
import { StatsCard } from './stats-card';
import { Banknote, Package, ShoppingCart, Users } from 'lucide-react';
import { useFirebase } from '@/firebase/provider';
import { collection, getDocs, query } from 'firebase/firestore';

interface DashboardStatsProps {
  dictionary: any;
}

export function DashboardStats({ dictionary }: DashboardStatsProps) {
  const { firestore } = useFirebase();
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalSalesToday: 0,
    totalProducts: 0,
    lowStockItems: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!firestore) return;

    const fetchStats = async () => {
      try {
        setIsLoading(true);
        let totalRevenue = 0;
        let totalSalesToday = 0;
        let totalProducts = 0;
        let lowStockItems = 0;

        // Get products count and low stock items
        const productsRef = collection(firestore, 'products');
        const productsSnap = await getDocs(query(productsRef));
        totalProducts = productsSnap.size;

        // Low stock items (stock < 10)
        productsSnap.forEach(doc => {
          const stock = doc.data().stock || 0;
          if (stock < 10) {
            lowStockItems++;
          }
        });

        // Sales for revenue and today's count
        const salesRef = collection(firestore, 'sales');
        const salesSnap = await getDocs(query(salesRef));
        const today = new Date().toDateString();

        salesSnap.forEach(doc => {
          const data = doc.data();
          const saleDate = data.date
            ? typeof data.date === 'string'
              ? new Date(data.date).toDateString()
              : data.date.toDate?.().toDateString?.()
            : null;
          const amount = data.total || 0;

          // Add to total revenue
          totalRevenue += amount;

          // Check if sale is from today
          if (saleDate === today) {
            totalSalesToday++;
          }
        });

        setStats({
          totalRevenue,
          totalSalesToday,
          totalProducts,
          lowStockItems,
        });
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [firestore]);

  const formatRevenue = (revenue: number) => {
    if (revenue >= 1000000) {
      return `${(revenue / 1000000).toFixed(2)}M`;
    } else if (revenue >= 1000) {
      return `${(revenue / 1000).toFixed(2)}K`;
    }
    return revenue.toFixed(2);
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatsCard
        title={dictionary.dashboard.revenue}
        value={isLoading ? '--' : `${formatRevenue(stats.totalRevenue)} DZD`}
        icon={<Banknote className="h-4 w-4" />}
        description="Total sales revenue"
      />
      <StatsCard
        title={dictionary.dashboard.salesToday}
        value={isLoading ? '--' : `+${stats.totalSalesToday}`}
        icon={<ShoppingCart className="h-4 w-4" />}
        description="Sales completed today"
      />
      <StatsCard
        title={dictionary.dashboard.totalProducts}
        value={isLoading ? '--' : `${stats.totalProducts}`}
        icon={<Package className="h-4 w-4" />}
        description="Total products in inventory"
      />
      <StatsCard
        title={dictionary.dashboard.lowStockItems}
        value={isLoading ? '--' : `${stats.lowStockItems}`}
        icon={<Users className="h-4 w-4" />}
        description="Items needing reorder"
      />
    </div>
  );
}
