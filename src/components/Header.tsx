/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { 
  ShoppingBag, Heart, User as UserIcon, Search, Menu, X, ChevronDown, 
  Trash2, Plus, Minus, ArrowLeft, ShieldAlert
} from "lucide-react";
import { User, Category, Product } from "../types";
import { CartItem, formatPrice, toPersianDigits } from "../utils";

interface HeaderProps {
  user: User | null;
  cart: CartItem[];
  wishlist: string[];
  categories: Category[];
  products: Product[];
  currentView: string;
  onNavigate: (view: string, params?: any) => void;
  onLogout: () => void;
  onUpdateCartCount: (productId: string, variationId: string | undefined, count: number) => void;
  onRemoveFromCart: (productId: string, variationId: string | undefined) => void;
}

export default function Header({
  user,
  cart,
  wishlist,
  categories,
  products,
  currentView,
  onNavigate,
  onLogout,
  onUpdateCartCount,
  onRemoveFromCart
}: HeaderProps) {
  const [navOpen, setNavOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close menus on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchSuggestions(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Live Auto-complete search logic
  useEffect(() => {
    if (searchQuery.trim().length >= 2) {
      const query = searchQuery.toLowerCase().trim();
      const filtered = products.filter(
        (p) =>
          p.title.toLowerCase().includes(query) ||
          p.descShort.toLowerCase().includes(query) ||
          p.sku.toLowerCase().includes(query) ||
          p.tags.some((t) => t.toLowerCase().includes(query))
      );
      setSearchResults(filtered.slice(0, 5));
      setShowSearchSuggestions(true);
    } else {
      setSearchResults([]);
      setShowSearchSuggestions(false);
    }
  }, [searchQuery, products]);

  const cartTotalItems = cart.reduce((sum, item) => sum + item.count, 0);
  const cartSubtotal = cart.reduce(
    (sum, item) => sum + (item.variationId ? item.product.variations.find(v => v.id === item.variationId)?.price || item.product.price : item.product.discountPrice || item.product.price) * item.count,
    0
  );

  const parentCategories = categories.filter((c) => !c.parentId);

  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b border-gray-100 shadow-sm" id="shop-header">
      {/* Top Banner Alert from the Professional Polish design system */}
      <div className="bg-emerald-700 text-white py-1.5 border-b border-white/5" id="header-top-ribbon">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center text-[11px] font-medium">
          <div>ارسال رایگان برای خریدهای بالای ۵ میلیون تومان</div>
          <div className="flex items-center gap-4">
            <span className="hidden sm:inline">تلفن پشتیبانی: ۰۲۱-۸۸۸۸۸۸۸۸</span>
            <span className="opacity-60 hidden md:inline">|</span>
            <span>مرکز امنیت و حریم خصوصی PDO</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & Navigation */}
          <div className="flex items-center gap-8">
            <button 
              onClick={() => onNavigate("home")} 
              className="flex items-center gap-2.5 cursor-pointer focus:outline-none"
              id="header-logo-btn"
            >
              <div className="w-11 h-11 bg-emerald-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-md shadow-emerald-100">
                آ
              </div>
              <div className="flex flex-col items-start">
                <span className="font-bold text-lg text-gray-900 tracking-tight">فروشگاه بزرگ آریا</span>
                <span className="text-[10px] text-gray-400 font-mono tracking-widest">ARIA SMART STORE</span>
              </div>
            </button>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-gray-600">
              <button 
                onClick={() => onNavigate("home")} 
                className={`transition-colors hover:text-emerald-600 ${currentView === "home" ? "text-emerald-600 font-bold" : ""}`}
              >
                صفحه اصلی
              </button>
              
              {/* Category Dropdown */}
              <div className="relative group">
                <button 
                  onClick={() => onNavigate("shop")} 
                  className={`flex items-center gap-1.5 transition-colors hover:text-emerald-600 ${currentView === "shop" ? "text-emerald-600 font-bold" : ""}`}
                >
                  فروشگاه
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </button>
                <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-gray-100 rounded-xl shadow-xl py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <button 
                    onClick={() => onNavigate("shop")} 
                    className="w-full text-right px-4 py-2 text-xs font-bold text-emerald-600 border-b border-gray-50 hover:bg-gray-50"
                  >
                    مشاهده همه محصولات
                  </button>
                  {parentCategories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => onNavigate("shop", { category: cat.id })}
                      className="w-full text-right px-4 py-2 hover:bg-emerald-50 hover:text-emerald-600 transition-colors"
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              <button 
                onClick={() => onNavigate("blog")} 
                className={`transition-colors hover:text-emerald-600 ${currentView === "blog" ? "text-emerald-600 font-bold" : ""}`}
              >
                وبلاگ و آموزشی
              </button>
              <button 
                onClick={() => onNavigate("info", { page: "about" })} 
                className={`transition-colors hover:text-emerald-600 ${currentView === "info-about" ? "text-emerald-600 font-bold" : ""}`}
              >
                درباره ما
              </button>
              <button 
                onClick={() => onNavigate("info", { page: "contact" })} 
                className={`transition-colors hover:text-emerald-600 ${currentView === "info-contact" ? "text-emerald-600 font-bold" : ""}`}
              >
                تماس با ما
              </button>
            </nav>
          </div>

          {/* Search, Cart & Account */}
          <div className="flex items-center gap-4">
            
            {/* Auto-Complete Search Box */}
            <div ref={searchRef} className="relative hidden md:block w-72" id="header-search-bar">
              <div className="relative">
                <input
                  type="text"
                  placeholder="جستجوی سریع محصول..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:bg-white text-gray-700 transition-all text-right"
                />
                <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-2.5" />
              </div>

              {/* Suggestions floating window */}
              {showSearchSuggestions && searchResults.length > 0 && (
                <div className="absolute left-0 right-0 mt-2 bg-white border border-gray-100 rounded-xl shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  {searchResults.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => {
                        onNavigate("product", { id: p.id });
                        setSearchQuery("");
                        setShowSearchSuggestions(false);
                      }}
                      className="w-full text-right px-4 py-2.5 hover:bg-emerald-50 flex items-center gap-3 transition-colors text-right"
                    >
                      <img src={p.mainImage} alt={p.title} className="w-10 h-10 object-cover rounded-lg" />
                      <div className="flex flex-col overflow-hidden">
                        <span className="text-xs font-semibold text-gray-900 truncate">{p.title}</span>
                        <span className="text-[10px] text-emerald-600 font-mono mt-0.5">{formatPrice(p.discountPrice || p.price)}</span>
                      </div>
                    </button>
                  ))}
                  <button
                    onClick={() => {
                      onNavigate("shop", { search: searchQuery });
                      setShowSearchSuggestions(false);
                    }}
                    className="w-full text-center py-2 text-[11px] font-bold text-emerald-600 hover:bg-gray-50 border-t border-gray-50 block mt-1"
                  >
                    نمایش همه نتایج برای «{searchQuery}»
                  </button>
                </div>
              )}
            </div>

            {/* Admin Badge shortcut */}
            {user && user.role !== "customer" && (
              <button 
                onClick={() => onNavigate("admin")}
                className="p-2.5 text-amber-600 bg-amber-50 hover:bg-amber-100 rounded-xl transition-colors cursor-pointer flex items-center gap-1 text-xs font-bold"
                title="پنل مدیریت فروشگاه"
                id="header-admin-panel-btn"
              >
                <ShieldAlert className="w-4 h-4" />
                <span className="hidden sm:inline">مدیریت</span>
              </button>
            )}

            {/* Wishlist Button */}
            <button 
              onClick={() => onNavigate("profile", { activeTab: "wishlist" })}
              className="p-2.5 text-gray-600 hover:bg-gray-50 hover:text-rose-600 rounded-xl transition-colors relative cursor-pointer"
              title="علاقه‌مندی‌ها"
            >
              <Heart className="w-5 h-5" />
              {wishlist.length > 0 && (
                <span className="absolute top-1.5 right-1.5 bg-rose-500 text-white w-4 h-4 rounded-full text-[9px] flex items-center justify-center font-bold">
                  {toPersianDigits(wishlist.length)}
                </span>
              )}
            </button>

            {/* Shopping Cart Button */}
            <button 
              onClick={() => setCartOpen(true)}
              className="p-2.5 text-gray-600 hover:bg-gray-50 hover:text-emerald-600 rounded-xl transition-colors relative cursor-pointer"
              title="سبد خرید شما"
              id="header-cart-btn"
            >
              <ShoppingBag className="w-5 h-5" />
              {cartTotalItems > 0 && (
                <span className="absolute top-1.5 right-1.5 bg-emerald-600 text-white w-4 h-4 rounded-full text-[9px] flex items-center justify-center font-bold">
                  {toPersianDigits(cartTotalItems)}
                </span>
              )}
            </button>

            {/* User Account / Profile */}
            <div ref={profileRef} className="relative">
              {user ? (
                <div>
                  <button 
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    className="flex items-center gap-1.5 p-1.5 pr-3 hover:bg-gray-50 rounded-xl border border-gray-100 transition-colors text-right cursor-pointer"
                  >
                    <div className="flex flex-col items-end hidden sm:flex">
                      <span className="text-xs font-bold text-gray-900">{user.name}</span>
                      <span className="text-[9px] text-gray-400">حساب من</span>
                    </div>
                    {user.profileImage ? (
                      <img src={user.profileImage} alt={user.name} className="w-8 h-8 rounded-lg object-cover" />
                    ) : (
                      <div className="w-8 h-8 bg-emerald-100 text-emerald-800 rounded-lg flex items-center justify-center text-xs font-bold">
                        {user.name[0]}
                      </div>
                    )}
                  </button>

                  {showProfileMenu && (
                    <div className="absolute left-0 mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-2xl py-1.5 z-50 animate-in fade-in duration-100">
                      <button 
                        onClick={() => { onNavigate("profile", { activeTab: "dashboard" }); setShowProfileMenu(false); }}
                        className="w-full text-right px-4 py-2 hover:bg-emerald-50 text-xs text-gray-700 font-bold"
                      >
                        داشبورد کاربری
                      </button>
                      <button 
                        onClick={() => { onNavigate("profile", { activeTab: "orders" }); setShowProfileMenu(false); }}
                        className="w-full text-right px-4 py-2 hover:bg-emerald-50 text-xs text-gray-700"
                      >
                        سفارش‌های من
                      </button>
                      <button 
                        onClick={() => { onNavigate("profile", { activeTab: "tickets" }); setShowProfileMenu(false); }}
                        className="w-full text-right px-4 py-2 hover:bg-emerald-50 text-xs text-gray-700"
                      >
                        پشتیبانی و تیکت‌ها
                      </button>
                      <button 
                        onClick={() => { onNavigate("profile", { activeTab: "details" }); setShowProfileMenu(false); }}
                        className="w-full text-right px-4 py-2 hover:bg-emerald-50 text-xs text-gray-700"
                      >
                        تنظیمات حساب
                      </button>
                      <hr className="my-1 border-gray-100" />
                      <button 
                        onClick={() => { onLogout(); setShowProfileMenu(false); }}
                        className="w-full text-right px-4 py-2 text-xs text-red-600 hover:bg-red-50"
                      >
                        خروج از سیستم
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button 
                  onClick={() => onNavigate("login")}
                  className="flex items-center gap-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-100 cursor-pointer"
                  id="header-login-btn"
                >
                  <UserIcon className="w-3.5 h-3.5" />
                  <span>ورود / ثبت‌نام</span>
                </button>
              )}
            </div>

            {/* Mobile Nav Toggle */}
            <button 
              onClick={() => setNavOpen(!navOpen)}
              className="p-2 lg:hidden text-gray-600 hover:bg-gray-100 rounded-xl"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Slide Navigation */}
      {navOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 lg:hidden flex justify-end" id="mobile-nav">
          <div className="w-4/5 max-w-sm h-full bg-white p-6 flex flex-col justify-between shadow-2xl animate-in slide-in-from-left duration-200">
            <div>
              <div className="flex items-center justify-between pb-6 border-b border-gray-100">
                <span className="font-bold text-gray-900">منوی ناوبری آریا</span>
                <button onClick={() => setNavOpen(false)} className="p-1.5 text-gray-400 hover:bg-gray-50 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile Autocomplete Search in Slide */}
              <div className="mt-4 relative mb-6">
                <input
                  type="text"
                  placeholder="جستجوی محصول..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500 text-right"
                />
                <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
              </div>

              <div className="flex flex-col gap-4 text-sm font-semibold text-gray-700">
                <button onClick={() => { onNavigate("home"); setNavOpen(false); }} className="w-full text-right py-2 hover:text-emerald-600">صفحه اصلی</button>
                <button onClick={() => { onNavigate("shop"); setNavOpen(false); }} className="w-full text-right py-2 hover:text-emerald-600">فروشگاه محصولات</button>
                <button onClick={() => { onNavigate("blog"); setNavOpen(false); }} className="w-full text-right py-2 hover:text-emerald-600">وبلاگ و آموزشی</button>
                <button onClick={() => { onNavigate("info", { page: "about" }); setNavOpen(false); }} className="w-full text-right py-2 hover:text-emerald-600">درباره ما</button>
                <button onClick={() => { onNavigate("info", { page: "contact" }); setNavOpen(false); }} className="w-full text-right py-2 hover:text-emerald-600">تماس با ما</button>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-6">
              {user ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-100 text-emerald-800 rounded-xl flex items-center justify-center font-bold">
                      {user.name[0]}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-gray-900">{user.name}</span>
                      <span className="text-[10px] text-gray-400 font-mono">{user.phone}</span>
                    </div>
                  </div>
                  <button onClick={() => { onLogout(); setNavOpen(false); }} className="text-xs text-red-600 font-bold hover:underline">خروج</button>
                </div>
              ) : (
                <button 
                  onClick={() => { onNavigate("login"); setNavOpen(false); }} 
                  className="w-full py-3 bg-emerald-600 text-white rounded-xl text-center text-xs font-bold"
                >
                  ورود یا ثبت‌نام در آریا
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Slide-out Cart Drawer */}
      {cartOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex justify-start" id="cart-drawer">
          <div className="w-full max-w-md h-full bg-white shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-200">
            
            {/* Drawer Header */}
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-emerald-600" />
                <span className="font-bold text-md text-gray-900">سبد خرید شما</span>
                <span className="text-xs bg-emerald-50 text-emerald-800 px-2.5 py-0.5 rounded-full font-mono font-bold">
                  {toPersianDigits(cartTotalItems)} کالا
                </span>
              </div>
              <button onClick={() => setCartOpen(false)} className="p-1.5 text-gray-400 hover:bg-gray-50 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* List items */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-3">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-300">
                    <ShoppingBag className="w-8 h-8" />
                  </div>
                  <h3 className="font-bold text-gray-800 text-sm">سبد خرید خالی است</h3>
                  <p className="text-xs text-gray-400 max-w-xs leading-relaxed">
                    می‌توانید به صفحات فروشگاه بازگشته و کالاهای دلخواه خود را به سبد خرید بیفزایید.
                  </p>
                  <button 
                    onClick={() => { onNavigate("shop"); setCartOpen(false); }}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                  >
                    بازگشت به فروشگاه
                  </button>
                </div>
              ) : (
                cart.map((item, index) => {
                  const hasVar = item.variationId;
                  const variation = hasVar ? item.product.variations.find(v => v.id === item.variationId) : null;
                  const unitPrice = variation ? variation.price : (item.product.discountPrice || item.product.price);
                  return (
                    <div key={`${item.productId}-${item.variationId || index}`} className="flex items-center gap-4 py-3 border-b border-gray-50 animate-in fade-in duration-100">
                      <img src={variation?.image || item.product.mainImage} alt={item.product.title} className="w-16 h-16 object-cover rounded-xl" />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-gray-900 truncate leading-snug">{item.product.title}</h4>
                        {item.selectedAttributes && Object.entries(item.selectedAttributes).map(([k, v]) => (
                          <span key={k} className="text-[10px] text-gray-400 ml-2 bg-gray-50 px-1.5 py-0.5 rounded">
                            {k}: {v}
                          </span>
                        ))}
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs font-bold text-emerald-600 font-mono">
                            {formatPrice(unitPrice * item.count)}
                          </span>
                          
                          {/* Plus/Minus counts */}
                          <div className="flex items-center gap-2 border border-gray-100 rounded-lg p-0.5 bg-gray-50">
                            <button 
                              onClick={() => onUpdateCartCount(item.productId, item.variationId, item.count + 1)}
                              className="p-1 hover:bg-white rounded text-gray-500 hover:text-emerald-600"
                            >
                              <Plus className="w-3" />
                            </button>
                            <span className="text-[11px] font-bold font-mono text-gray-800 w-4 text-center">
                              {toPersianDigits(item.count)}
                            </span>
                            <button 
                              onClick={() => onUpdateCartCount(item.productId, item.variationId, Math.max(1, item.count - 1))}
                              className="p-1 hover:bg-white rounded text-gray-500 hover:text-red-600"
                            >
                              <Minus className="w-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                      <button 
                        onClick={() => onRemoveFromCart(item.productId, item.variationId)}
                        className="text-gray-300 hover:text-red-500 transition-colors p-1"
                        title="حذف کالا"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            {/* Total price section */}
            {cart.length > 0 && (
              <div className="p-6 border-t border-gray-100 bg-gray-50">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs text-gray-500 font-medium">مجموع موقت سبد:</span>
                  <span className="text-sm font-bold text-gray-900 font-mono">{formatPrice(cartSubtotal)}</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => { onNavigate("cart"); setCartOpen(false); }}
                    className="w-full py-3 border border-emerald-600 text-emerald-600 hover:bg-emerald-50 text-xs font-bold rounded-xl text-center cursor-pointer transition-colors"
                  >
                    مشاهده سبد خرید
                  </button>
                  <button
                    onClick={() => { onNavigate("checkout"); setCartOpen(false); }}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl text-center cursor-pointer transition-colors flex items-center justify-center gap-1.5 shadow-md shadow-emerald-100"
                    id="drawer-checkout-btn"
                  >
                    <span>تسویه حساب</span>
                    <ArrowLeft className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
