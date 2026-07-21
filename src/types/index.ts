// FREERT TypeScript Types & Interfaces

export type UserRole = 'customer' | 'admin' | 'superadmin';
export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
export type PaymentStatus = 'pending' | 'captured' | 'failed' | 'refunded';
export type ReturnStatus = 'requested' | 'approved' | 'received' | 'refunded' | 'rejected';

export interface User {
  id: string;
  email: string;
  fullName?: string;
  phone?: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface Address {
  id: string;
  userId: string;
  addressType: 'shipping' | 'billing';
  street: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  isDefault: boolean;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  createdAt: string;
}

export interface Collection {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  createdAt: string;
}

export interface Product {
  id: string;
  categoryId?: string;
  collectionId?: string;
  name: string;
  slug: string;
  description?: string;
  basePrice: number;
  isPublished: boolean;
  images: string[];
  createdAt: string;
  updatedAt: string;
  category?: Category;
  collection?: Collection;
  variants?: ProductVariant[];
}

export interface ProductVariant {
  id: string;
  productId: string;
  size: string;
  color: string;
  sku: string;
  stockQty: number;
  additionalPrice: number;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  id: string;
  userId: string;
  variantId: string;
  qty: number;
  createdAt: string;
  updatedAt: string;
  variant?: ProductVariant & { product?: Product };
}

export interface Order {
  id: string;
  userId?: string;
  couponId?: string;
  shippingAddressId?: string;
  billingAddressId?: string;
  totalAmount: number;
  discountAmount: number;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
  items?: OrderItem[];
  payment?: Payment;
}

export interface OrderItem {
  id: string;
  orderId: string;
  variantId?: string;
  qty: number;
  unitPrice: number;
  createdAt: string;
  variant?: ProductVariant & { product?: Product };
}

export interface Payment {
  id: string;
  orderId: string;
  transactionId?: string;
  provider: string; // 'razorpay' | 'cod'
  status: PaymentStatus;
  amount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Coupon {
  id: string;
  code: string;
  discountPercentage: number;
  maxUses: number;
  currentUses: number;
  activeFrom: string;
  activeTo: string;
  createdAt: string;
}

export interface Review {
  id: string;
  userId: string;
  productId: string;
  rating: number;
  comment?: string;
  createdAt: string;
}
