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
  stock: number;
  image: string;
  categoryId: string;
  status: 'active' | 'draft';
}

export interface Category {
  id: string;
  shopId: string;
  name: string;
  description: string;
}

export interface Order {
  id: string;
  shopId: string;
  total: number;
  status: string;
  date: string;
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
    stock: 25,
    image: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=400',
    categoryId: 'cat-1',
    status: 'active'
  },
  {
    id: 'prod-2',
    shopId: 'shop-1',
    name: 'Sac à main cuir',
    description: 'Sac à main en cuir véritable',
    price: 129.99,
    stock: 15,
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
    stock: 8,
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
    image: 'https://images.unsplash.com/photo-1606841837239-c5a1a4a07af7?w=400',
    categoryId: 'cat-4',
    status: 'active'
  }
];

export const mockOrders: Order[] = [
  { id: 'ord-1', shopId: 'shop-1', total: 209.98, status: 'Complétée', date: '2025-10-20' },
  { id: 'ord-2', shopId: 'shop-1', total: 79.99, status: 'En cours', date: '2025-10-21' },
  { id: 'ord-3', shopId: 'shop-2', total: 1479.98, status: 'Complétée', date: '2025-10-19' }
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
