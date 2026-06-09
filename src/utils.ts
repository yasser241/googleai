/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Product } from "./types";

// Convert English numbers to Persian numbers
export function toPersianDigits(num: string | number): string {
  const charCodeZero = "۰".charCodeAt(0);
  return String(num).replace(/[0-9]/g, (w) => String.fromCharCode(w.charCodeAt(0) - 48 + charCodeZero));
}

// Convert price to readable format (e.g., 2,950,000 تومان)
export function formatPrice(amount: number | undefined, currency: "Rial" | "Toman" = "Toman"): string {
  if (amount === undefined) return "۰";
  const processed = currency === "Rial" ? amount * 10 : amount;
  const formatted = new Intl.NumberFormat("fa-IR").format(processed);
  return `${formatted} ${currency === "Rial" ? "ریال" : "تومان"}`;
}

// Format Date standard
export function formatPersianDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    // Use fallback if invalid
    if (isNaN(date.getTime())) return toPersianDigits(dateString);
    return new Intl.DateTimeFormat("fa-IR", { dateStyle: "long" }).format(date);
  } catch (e) {
    return toPersianDigits(dateString);
  }
}

// Local storage handlers key definitions
const CART_KEY = "aria_cart_items";
const WISHLIST_KEY = "aria_wishlist_items";
const TOKEN_KEY = "aria_auth_token";
const USER_KEY = "aria_auth_user";

export interface CartItem {
  productId: string;
  variationId?: string;
  count: number;
  selectedAttributes?: Record<string, string>;
  product: Product;
}

export const Storage = {
  getCart(): CartItem[] {
    try {
      const data = localStorage.getItem(CART_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  setCart(cart: CartItem[]): void {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  },

  getWishlist(): string[] {
    try {
      const data = localStorage.getItem(WISHLIST_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  setWishlist(items: string[]): void {
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(items));
  },

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },

  setToken(token: string | null): void {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  },

  getUser(): any | null {
    try {
      const data = localStorage.getItem(USER_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  setUser(user: any | null): void {
    if (user) {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(USER_KEY);
    }
  },

  clearAll(): void {
    localStorage.removeItem(CART_KEY);
    localStorage.removeItem(WISHLIST_KEY);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }
};

// Simple notification trigger simulator
export function triggerNotification(title: string, message: string) {
  console.log(`[اطلاع‌رسانی پیامکی/ایمیلی]: ${title} - ${message}`);
}
