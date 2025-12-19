import { Timestamp } from 'firebase/firestore';
import type { Product, User, Customer, Supplier } from './types';

export const mockUser: User = {
  uid: 'user-1',
  name: 'Admin User',
  email: 'admin@partspro.com',
  avatarUrl: 'https://picsum.photos/seed/avatar1/100/100',
  role: 'admin',
  subscription: 'premium',
  emailVerified: true,
  authMethod: 'email',
  createdAt: Timestamp.now(),
};

export const mockProducts: Product[] = [
  {
    id: 'prod-1',
    name: 'Ceramic Brake Pads',
    reference: 'BRK-001-REF',
    sku: 'BRK-001',
    brand: 'AutoPro',
    stock: 50,
    purchasePrice: 39.99,
    price: 59.99,
    image: 'https://picsum.photos/seed/brake/40/40',
  },
  {
    id: 'prod-2',
    name: 'Full-Synthetic 5W-30 Oil',
    reference: 'OIL-002-REF',
    sku: 'OIL-002',
    brand: 'EngineGuard',
    stock: 12,
    purchasePrice: 8.5,
    price: 12.5,
    image: 'https://picsum.photos/seed/oil/40/40',
  },
  {
    id: 'prod-3',
    name: 'H7 Halogen Headlight Bulb',
    reference: 'LGT-003-REF',
    sku: 'LGT-003',
    brand: 'BrightBeam',
    stock: 120,
    purchasePrice: 5.99,
    price: 8.99,
    image: 'https://picsum.photos/seed/bulb/40/40',
  },
  {
    id: 'prod-4',
    name: '24-inch Wiper Blade',
    reference: 'WPR-004-REF',
    sku: 'WPR-004',
    brand: 'ClearView',
    stock: 0,
    purchasePrice: 10.0,
    price: 15.0,
    image: 'https://picsum.photos/seed/wiper/40/40',
  },
  {
    id: 'prod-5',
    name: 'Engine Air Filter',
    reference: 'FLT-005-REF',
    sku: 'FLT-005',
    brand: 'PureFlow',
    stock: 35,
    purchasePrice: 15.50,
    price: 22.75,
    image: 'https://picsum.photos/seed/filter/40/40',
  },
];

export const mockCustomers: Customer[] = [
  {
    id: 'cust-1',
    name: 'John Doe',
    phone: '123-456-7890',
    email: 'john.d@example.com',
  },
  {
    id: 'cust-2',
    name: 'Jane Smith',
    phone: '098-765-4321',
    email: 'jane.s@example.com',
  },
];

export const mockSuppliers: Supplier[] = [
  {
    id: 'supp-1',
    name: 'Global Parts Inc.',
    contactName: 'Bob Johnson',
    phone: '555-111-2222',
    email: 'sales@globalparts.com',
  },
  {
    id: 'supp-2',
    name: 'Auto Essentials Ltd.',
    contactName: 'Alice Cooper',
    phone: '555-333-4444',
    email: 'contact@autoessentials.com',
  },
];
