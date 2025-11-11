// Mock data pour simuler la plateforme WayneShopify

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Shop {
  id: string;
  name: string;
  domain: string;
  logo?: string;
  primaryColor: string;
  status: 'active' | 'draft';
  ownerId: string;
  description?: string;
}

export interface Product {
  id: string;
  shopId: string;
  name: string;
  description: string;
  price: number;
  comparePrice?: number;
  costPrice?: number;
  stock: number;
  sku?: string;
  barcode?: string;
  weight?: number;
  weightUnit?: 'kg' | 'g' | 'lb';
  trackInventory: boolean;
  isPhysical: boolean;
  countryOfOrigin?: string;
  hsCode?: string;
  image: string;
  images?: string[];
  categoryId: string;
  status: 'active' | 'draft';
  variants?: ProductVariant[];
}

export interface ProductVariant {
  id: string;
  name: string;
  price: number;
  sku: string;
  stock: number;
  status: 'active' | 'draft';
  options: { [key: string]: string }; // Ex: { "Couleur": "Rouge", "Taille": "M" }
}

export interface Category {
  id: string;
  shopId: string;
  name: string;
  description: string;
}

export interface Customer {
  id: string;
  shopId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  postalCode?: string;
  totalOrders: number;
  totalSpent: number;
  createdAt: string;
  lastOrderDate?: string;
}

export interface Order {
  id: string;
  shopId: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  shippingAddress: {
    address: string;
    city: string;
    postalCode: string;
    country: string;
  };
  date: string;
  trackingNumber?: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  image?: string;
}

// Données mockées
export const mockUsers: User[] = [
  { id: '1', name: 'Jean Dupont', email: 'jean@example.com' }
];

export const mockShops: Shop[] = [
  {
    id: 'shop-1',
    name: 'Boutique Mode Élégante',
    domain: 'mode-elegante.waynestore.com',
    logo: '👗',
    primaryColor: '#3B82F6',
    status: 'active',
    ownerId: '1',
    description: 'Votre destination mode haut de gamme'
  },
  {
    id: 'shop-2',
    name: 'Tech & Gadgets',
    domain: 'tech-gadgets.waynestore.com',
    logo: '💻',
    primaryColor: '#8B5CF6',
    status: 'active',
    ownerId: '1',
    description: 'Les dernières innovations technologiques'
  }
];

export const mockCategories: Category[] = [
  { id: 'cat-1', shopId: 'shop-1', name: 'Vêtements', description: 'Tous nos vêtements' },
  { id: 'cat-2', shopId: 'shop-1', name: 'Accessoires', description: 'Accessoires de mode' },
  { id: 'cat-3', shopId: 'shop-2', name: 'Ordinateurs', description: 'Laptops et desktops' },
  { id: 'cat-4', shopId: 'shop-2', name: 'Smartphones', description: 'Téléphones mobiles' }
];

export const mockProducts: Product[] = [
  {
    id: 'prod-1',
    shopId: 'shop-1',
    name: 'Robe d\'été fleurie',
    description: 'Magnifique robe d\'été légère et élégante',
    price: 79.99,
    comparePrice: 99.99,
    costPrice: 35.00,
    stock: 25,
    sku: 'RDF-2024-001',
    barcode: '5901234123457',
    weight: 0.3,
    weightUnit: 'kg',
    trackInventory: true,
    isPhysical: true,
    countryOfOrigin: 'France',
    hsCode: '6204.42',
    image: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=400',
    images: [
      'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=400',
      'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400'
    ],
    categoryId: 'cat-1',
    status: 'active',
    variants: [
      {
        id: 'var-1',
        name: 'Robe d\'été fleurie - S / Rouge',
        price: 79.99,
        sku: 'RDF-2024-001-S-RED',
        stock: 8,
        status: 'active',
        options: { 'Taille': 'S', 'Couleur': 'Rouge' }
      },
      {
        id: 'var-2',
        name: 'Robe d\'été fleurie - M / Rouge',
        price: 79.99,
        sku: 'RDF-2024-001-M-RED',
        stock: 10,
        status: 'active',
        options: { 'Taille': 'M', 'Couleur': 'Rouge' }
      },
      {
        id: 'var-3',
        name: 'Robe d\'été fleurie - L / Bleu',
        price: 79.99,
        sku: 'RDF-2024-001-L-BLU',
        stock: 7,
        status: 'active',
        options: { 'Taille': 'L', 'Couleur': 'Bleu' }
      }
    ]
  },
  {
    id: 'prod-2',
    shopId: 'shop-1',
    name: 'Sac à main cuir',
    description: 'Sac à main en cuir véritable',
    price: 129.99,
    comparePrice: 159.99,
    costPrice: 65.00,
    stock: 15,
    sku: 'SAC-2024-002',
    barcode: '5901234123464',
    weight: 0.8,
    weightUnit: 'kg',
    trackInventory: true,
    isPhysical: true,
    countryOfOrigin: 'Italie',
    hsCode: '4202.21',
    image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400',
    categoryId: 'cat-2',
    status: 'active'
  },
  {
    id: 'prod-3',
    shopId: 'shop-1',
    name: 'Lunettes de soleil',
    description: 'Lunettes de soleil tendance',
    price: 49.99,
    stock: 40,
    sku: 'LUN-2024-003',
    trackInventory: true,
    isPhysical: true,
    weight: 0.05,
    weightUnit: 'kg',
    image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=400',
    categoryId: 'cat-2',
    status: 'active'
  },
  {
    id: 'prod-4',
    shopId: 'shop-2',
    name: 'MacBook Pro 16"',
    description: 'Ordinateur portable haute performance',
    price: 2499.99,
    comparePrice: 2799.99,
    costPrice: 1850.00,
    stock: 8,
    sku: 'MBP-2024-004',
    barcode: '0194252157350',
    weight: 2.1,
    weightUnit: 'kg',
    trackInventory: true,
    isPhysical: true,
    countryOfOrigin: 'Chine',
    hsCode: '8471.30',
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400',
    categoryId: 'cat-3',
    status: 'active'
  },
  {
    id: 'prod-5',
    shopId: 'shop-2',
    name: 'iPhone 15 Pro',
    description: 'Dernier smartphone Apple',
    price: 1199.99,
    stock: 20,
    sku: 'IPH-2024-005',
    trackInventory: true,
    isPhysical: true,
    weight: 0.187,
    weightUnit: 'kg',
    image: 'https://images.unsplash.com/photo-1592286927505-b5c8e8c8f5f1?w=400',
    categoryId: 'cat-4',
    status: 'active'
  },
  {
    id: 'prod-6',
    shopId: 'shop-2',
    name: 'AirPods Pro',
    description: 'Écouteurs sans fil avec réduction de bruit',
    price: 279.99,
    stock: 50,
    sku: 'AIR-2024-006',
    trackInventory: true,
    isPhysical: true,
    weight: 0.056,
    weightUnit: 'kg',
    image: 'https://images.unsplash.com/photo-1606841837239-c5a1a4a07af7?w=400',
    categoryId: 'cat-4',
    status: 'active'
  }
];

export const mockCustomers: Customer[] = [
  {
    id: 'cust-1',
    shopId: 'shop-1',
    firstName: 'Marie',
    lastName: 'Dubois',
    email: 'marie.dubois@example.com',
    phone: '+33 6 12 34 56 78',
    address: '15 Rue de la Paix',
    city: 'Paris',
    country: 'France',
    postalCode: '75002',
    totalOrders: 5,
    totalSpent: 542.95,
    createdAt: '2025-08-15',
    lastOrderDate: '2025-10-20'
  },
  {
    id: 'cust-2',
    shopId: 'shop-1',
    firstName: 'Pierre',
    lastName: 'Martin',
    email: 'pierre.martin@example.com',
    phone: '+33 6 98 76 54 32',
    address: '42 Avenue des Champs-Élysées',
    city: 'Paris',
    country: 'France',
    postalCode: '75008',
    totalOrders: 3,
    totalSpent: 389.97,
    createdAt: '2025-09-01',
    lastOrderDate: '2025-10-21'
  },
  {
    id: 'cust-3',
    shopId: 'shop-1',
    firstName: 'Sophie',
    lastName: 'Bernard',
    email: 'sophie.bernard@example.com',
    phone: '+33 6 45 67 89 12',
    address: '8 Rue du Commerce',
    city: 'Lyon',
    country: 'France',
    postalCode: '69002',
    totalOrders: 8,
    totalSpent: 1245.80,
    createdAt: '2025-07-10',
    lastOrderDate: '2025-11-05'
  },
  {
    id: 'cust-4',
    shopId: 'shop-2',
    firstName: 'Thomas',
    lastName: 'Rousseau',
    email: 'thomas.rousseau@example.com',
    phone: '+33 6 23 45 67 89',
    address: '23 Boulevard Voltaire',
    city: 'Marseille',
    country: 'France',
    postalCode: '13001',
    totalOrders: 2,
    totalSpent: 3699.98,
    createdAt: '2025-09-20',
    lastOrderDate: '2025-10-19'
  },
  {
    id: 'cust-5',
    shopId: 'shop-2',
    firstName: 'Isabelle',
    lastName: 'Leroy',
    email: 'isabelle.leroy@example.com',
    phone: '+33 7 12 34 56 78',
    address: '56 Rue de la République',
    city: 'Toulouse',
    country: 'France',
    postalCode: '31000',
    totalOrders: 4,
    totalSpent: 1959.96,
    createdAt: '2025-08-25',
    lastOrderDate: '2025-11-01'
  }
];

export const mockOrders: Order[] = [
  {
    id: 'ord-1',
    shopId: 'shop-1',
    customerId: 'cust-1',
    customerName: 'Marie Dubois',
    customerEmail: 'marie.dubois@example.com',
    items: [
      {
        productId: 'prod-2',
        productName: 'Sac à main cuir',
        quantity: 1,
        price: 129.99,
        image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400'
      },
      {
        productId: 'prod-1',
        productName: 'Robe d\'été fleurie',
        quantity: 1,
        price: 79.99,
        image: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=400'
      }
    ],
    subtotal: 209.98,
    shipping: 8.90,
    tax: 41.98,
    total: 260.86,
    status: 'delivered',
    paymentStatus: 'paid',
    shippingAddress: {
      address: '15 Rue de la Paix',
      city: 'Paris',
      postalCode: '75002',
      country: 'France'
    },
    date: '2025-10-20',
    trackingNumber: 'FR123456789'
  },
  {
    id: 'ord-2',
    shopId: 'shop-1',
    customerId: 'cust-2',
    customerName: 'Pierre Martin',
    customerEmail: 'pierre.martin@example.com',
    items: [
      {
        productId: 'prod-1',
        productName: 'Robe d\'été fleurie',
        quantity: 1,
        price: 79.99,
        image: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=400'
      }
    ],
    subtotal: 79.99,
    shipping: 5.90,
    tax: 15.99,
    total: 101.88,
    status: 'processing',
    paymentStatus: 'paid',
    shippingAddress: {
      address: '42 Avenue des Champs-Élysées',
      city: 'Paris',
      postalCode: '75008',
      country: 'France'
    },
    date: '2025-10-21'
  },
  {
    id: 'ord-3',
    shopId: 'shop-2',
    customerId: 'cust-4',
    customerName: 'Thomas Rousseau',
    customerEmail: 'thomas.rousseau@example.com',
    items: [
      {
        productId: 'prod-4',
        productName: 'MacBook Pro 16"',
        quantity: 1,
        price: 2499.99,
        image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400'
      },
      {
        productId: 'prod-5',
        productName: 'iPhone 15 Pro',
        quantity: 1,
        price: 1199.99,
        image: 'https://images.unsplash.com/photo-1592286927505-b5c8e8c8f5f1?w=400'
      }
    ],
    subtotal: 3699.98,
    shipping: 0,
    tax: 739.99,
    total: 4439.97,
    status: 'delivered',
    paymentStatus: 'paid',
    shippingAddress: {
      address: '23 Boulevard Voltaire',
      city: 'Marseille',
      postalCode: '13001',
      country: 'France'
    },
    date: '2025-10-19',
    trackingNumber: 'FR987654321'
  },
  {
    id: 'ord-4',
    shopId: 'shop-1',
    customerId: 'cust-3',
    customerName: 'Sophie Bernard',
    customerEmail: 'sophie.bernard@example.com',
    items: [
      {
        productId: 'prod-3',
        productName: 'Lunettes de soleil',
        quantity: 2,
        price: 49.99,
        image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=400'
      }
    ],
    subtotal: 99.98,
    shipping: 5.90,
    tax: 19.99,
    total: 125.87,
    status: 'shipped',
    paymentStatus: 'paid',
    shippingAddress: {
      address: '8 Rue du Commerce',
      city: 'Lyon',
      postalCode: '69002',
      country: 'France'
    },
    date: '2025-11-05',
    trackingNumber: 'FR456789123'
  },
  {
    id: 'ord-5',
    shopId: 'shop-2',
    customerId: 'cust-5',
    customerName: 'Isabelle Leroy',
    customerEmail: 'isabelle.leroy@example.com',
    items: [
      {
        productId: 'prod-6',
        productName: 'AirPods Pro',
        quantity: 1,
        price: 279.99,
        image: 'https://images.unsplash.com/photo-1606841837239-c5a1a4a07af7?w=400'
      }
    ],
    subtotal: 279.99,
    shipping: 5.90,
    tax: 55.99,
    total: 341.88,
    status: 'pending',
    paymentStatus: 'pending',
    shippingAddress: {
      address: '56 Rue de la République',
      city: 'Toulouse',
      postalCode: '31000',
      country: 'France'
    },
    date: '2025-11-10'
  }
];

// Helper functions
export const getShopsByUserId = (userId: string): Shop[] => {
  return mockShops.filter(shop => shop.ownerId === userId);
};

export const getShopById = (shopId: string): Shop | undefined => {
  return mockShops.find(shop => shop.id === shopId);
};

export const getProductsByShopId = (shopId: string): Product[] => {
  return mockProducts.filter(product => product.shopId === shopId);
};

export const getCategoriesByShopId = (shopId: string): Category[] => {
  return mockCategories.filter(category => category.shopId === shopId);
};

export const getOrdersByShopId = (shopId: string): Order[] => {
  return mockOrders.filter(order => order.shopId === shopId);
};

export const getProductById = (productId: string): Product | undefined => {
  return mockProducts.find(product => product.id === productId);
};

export const getCustomersByShopId = (shopId: string): Customer[] => {
  return mockCustomers.filter(customer => customer.shopId === shopId);
};

export const getCustomerById = (customerId: string): Customer | undefined => {
  return mockCustomers.find(customer => customer.id === customerId);
};