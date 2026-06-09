/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum UserRole {
  ADMIN = "admin",
  CONTENT_MANAGER = "editor",
  SUPPORT = "support",
  ACCOUNTANT = "accountant",
  CUSTOMER = "customer"
}

export enum OrderStatus {
  PENDING = "pending",          // در حال بررسی
  CONFIRMED = "confirmed",      // تایید شده
  PREPARING = "preparing",      // در حال آماده‌سازی
  SHIPPED = "shipped",          // ارسال شده
  DELIVERED = "delivered",      // تحویل شده
  CANCELLED = "cancelled",      // لغو شده
  REFUNDED = "refunded"        // مرجوعی
}

export enum PaymentStatus {
  UNPAID = "unpaid",
  PAID = "paid",
  REFUNDED = "refunded"
}

export enum TicketStatus {
  OPEN = "open",
  PENDING = "pending",
  CLOSED = "closed"
}

export interface Address {
  id: string;
  title: string; // e.g. خانه یا محل کار
  probeName: string; // گیرنده
  probePhone: string; // تلفن گیرنده
  province: string; // استان
  city: string; // شهر
  postalCode: string;
  addressFull: string;
  isDefault: boolean;
}

export interface User {
  email: string;
  phone: string;
  name: string;
  lastName: string;
  role: UserRole;
  dob?: string;
  profileImage?: string;
  addresses: Address[];
  wishlist: string[]; // array of productIds
  notificationsEnabled: {
    newsletter: boolean;
    sms: boolean;
  };
  createdAt: string;
}

export interface Attribute {
  name: string; // e.g. رنگ، سایز
  values: string[]; // e.g. ["قرمز", "آبی"]
}

export interface Variation {
  id: string;
  sku: string;
  price: number;
  discountPrice?: number;
  stock: number;
  attributes: Record<string, string>; // e.g. { "رنگ": "قرمز", "سایز": "لارج" }
  image?: string;
}

export interface Product {
  id: string;
  title: string;
  slug: string;
  sku: string;
  price: number;
  discountPrice?: number;
  discountStartDate?: string;
  discountEndDate?: string;
  isVariable: boolean;
  stock: number;
  stockThreshold: number;
  allowBackorder: boolean;
  descShort: string;
  descFull: string; // HTML allowed (TinyMCE like rich text)
  mainImage: string;
  hoverImage?: string;
  gallery: string[];
  categories: string[]; // Array of Category IDs
  tags: string[];
  attributes: Attribute[];
  variations: Variation[];
  rating: number; // average stars
  reviewsCount: number;
  relatedProducts: string[]; // IDs
  upsellProducts: string[]; // IDs
  crossSellProducts: string[]; // IDs
  status: "published" | "draft";
  metaTitle?: string;
  metaDesc?: string;
  views: number;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  parentId?: string; // recursive categories
  description?: string;
  image?: string;
  showInMenu: boolean;
  order: number;
}

export interface Story {
  id: string;
  title: string;
  media: string; // image or video URL
  link: string; // destination URL in site
  startDate: string;
  endDate: string;
  displayOrder: number;
}

export interface OrderItem {
  productId: string;
  title: string;
  sku: string;
  price: number;
  count: number;
  image: string;
  variationId?: string;
  selectedAttributes?: Record<string, string>;
}

export interface Order {
  id: string;
  orderNumber: string;
  date: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: "online" | "cod";
  trackingCode?: string;
  userEmail: string;
  userPhone: string;
  userName: string;
  items: OrderItem[];
  subTotal: number;
  discountAmount: number;
  shippingCost: number;
  shippingMethod: string;
  taxAmount: number;
  finalTotal: number;
  shippingAddress: Address;
  notes?: string;
  adminNotes?: string;
}

export interface Coupon {
  code: string;
  type: "percent" | "fixed";
  value: number; // e.g. 15 for 15% or 50000 for 50,000 Tomans
  minAmount?: number;
  maxDiscount?: number;
  limitUsages?: number;
  usages: number;
  expires: string;
  status: "active" | "inactive";
  allowedCategories?: string[];
  allowedProducts?: string[];
}

export interface Message {
  id: string;
  text: string;
  author: "user" | "admin";
  authorName: string;
  date: string;
  attachment?: string;
}

export interface Ticket {
  id: string;
  ticketNumber: string;
  subject: string;
  category: "order" | "financial" | "technical" | "suggestion" | "other";
  priority: "low" | "medium" | "high";
  status: TicketStatus;
  userEmail: string;
  createdAt: string;
  updatedAt: string;
  messages: Message[];
}

export interface Comment {
  id: string;
  productId?: string;
  articleId?: string;
  parentCommentId?: string; // support nested comments/replies
  name: string;
  email: string;
  rating?: number; // for products
  content: string;
  date: string;
  status: "pending" | "approved" | "rejected";
  adminReply?: string;
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content: string; // HTML allowed
  mainImage: string;
  category: string;
  tags: string[];
  author: string;
  date: string;
  views: number;
}

export interface AppSettings {
  storeName: string;
  logo: string;
  favicon: string;
  phone: string;
  email: string;
  address: string;
  socials: {
    telegram?: string;
    instagram?: string;
    whatsapp?: string;
  };
  footerText: string;
  currency: "Rial" | "Toman";
  seoDefaultTitle: string;
  seoDefaultDesc: string;
  enableCommentsApproval: boolean;
  newsletterIntro: string;
  shippingOptions: {
    id: string;
    name: string;
    cost: number;
    freeOnAmount?: number;
    approxDays: string;
    provinces?: string[]; // Empty means all
  }[];
  paymentOptions: {
    online: boolean;
    cod: boolean;
    zarinpalGatewayKey?: string;
  };
}
