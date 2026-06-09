/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { User, Product, Category, Article, AppSettings, Coupon, Story } from "./types";
import Header from "./components/Header";
import Footer from "./components/Footer";
import StoriesSection from "./components/StoriesSection";
import MainPages from "./components/MainPages";
import CartPage from "./components/CartPage";
import CheckoutPage from "./components/CheckoutPage";
import UserProfile from "./components/UserProfile";
import AdminPanel from "./components/AdminPanel";
import { LogIn, UserPlus, Eye, EyeOff, ShieldCheck, ArrowRight } from "lucide-react";
import { toPersianDigits } from "./utils";

interface CartItem {
  productId: string;
  variationId?: string;
  title: string;
  image: string;
  sku: string;
  price: number;
  selectedAttributes?: Record<string, string>;
  count: number;
}

export default function App() {
  // Navigation Routing States
  const [view, setView] = useState("home");
  const [viewParams, setViewParams] = useState<any>({});

  // Auth User Session states
  const [user, setUser] = useState<User | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authTab, setAuthTab] = useState<"login" | "register">("login");

  // Login credentials
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  // Register credentials
  const [regName, setRegName] = useState("");
  const [regLastName, setRegLastName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regError, setRegError] = useState("");

  // Catalog master lists
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [stories, setStories] = useState<Story[]>([]);
  const [settings, setSettings] = useState<AppSettings>({
    storeName: "فروشگاه بزرگ آریا",
    logoUrl: "",
    phone: "۰۲۱-۶۶۵۴۹۸۷۰",
    email: "support@ariashop.ir",
    address: "تهران، خیابان ولیعصر، نرسیده به چهارراه ولیعصر، پلاک ۱۴۵",
    socials: { instagram: "ariashop" },
    footerText: "کلیه حقوق مادی و معنوی برای پورتال بومی زنجیره‌ای فروشگاه بزرگ آریا محفوظ می‌باشد.",
    enableCommentsApproval: true,
    logo: "",
    favicon: ""
  });

  // Client shopping states
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [coupon, setCoupon] = useState<Coupon | null>(null);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [cartOpen, setCartOpen] = useState(false);

  // Load backend configurations and session tokens on mount
  useEffect(() => {
    // 1. Fetch directories info
    fetch("/api/products")
      .then(res => res.json())
      .then(data => setProducts(data))
      .catch(err => console.error(err));

    fetch("/api/categories")
      .then(res => res.json())
      .then(data => setCategories(data))
      .catch(err => console.error(err));

    fetch("/api/articles")
      .then(res => res.json())
      .then(data => setArticles(data))
      .catch(err => console.error(err));

    fetch("/api/stories")
      .then(res => res.json())
      .then(data => setStories(data))
      .catch(err => console.error(err));

    fetch("/api/settings")
      .then(res => res.json())
      .then(data => {
        if (data && data.storeName) setSettings(data);
      })
      .catch(err => console.error(err));

    // 2. Fetch authenticated profile session if bearer token exists
    const token = localStorage.getItem("aria_auth_token");
    if (token) {
      fetch("/api/auth/profile", {
        headers: { "Authorization": `Bearer ${token}` }
      })
        .then(res => {
          if (!res.ok) throw new Error("Stale token");
          return res.json();
        })
        .then(data => {
          if (data.user) {
            setUser(data.user);
            setWishlist(data.user.wishlist || []);
          }
        })
        .catch(() => {
          localStorage.removeItem("aria_auth_token");
        });
    }

    // 3. Retrieve local storage guest cart if exists
    const localCartObj = localStorage.getItem("aria_guest_cart");
    if (localCartObj) {
      try {
        setCartItems(JSON.parse(localCartObj));
      } catch (e) {
        localStorage.removeItem("aria_guest_cart");
      }
    }
  }, []);

  // Synchronise browser state history manually or with single scroll reset on changes
  const handleNavigate = (newView: string, params: any = {}) => {
    setView(newView);
    setViewParams(params);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // CART PERSISTENCE HELPERS
  const handleAddToCart = (
    product: Product,
    count: number,
    variationId?: string,
    selectedAttributes?: Record<string, string>
  ) => {
    const existingIdx = cartItems.findIndex(
      item => item.productId === product.id && item.variationId === variationId
    );

    let updatedCart = [...cartItems];
    const itemPrice = product.discountPrice !== undefined ? product.discountPrice : product.price;

    if (existingIdx > -1) {
      updatedCart[existingIdx].count += count;
    } else {
      updatedCart.push({
        productId: product.id,
        variationId,
        title: product.title,
        image: product.mainImage,
        sku: product.sku,
        price: itemPrice,
        selectedAttributes,
        count
      });
    }

    setCartItems(updatedCart);
    localStorage.setItem("aria_guest_cart", JSON.stringify(updatedCart));
    
    // Open flyout preview cart drawer to notify customer
    setCartOpen(true);
  };

  const handleUpdateCartItemCount = (productId: string, count: number, variationId?: string) => {
    const updated = cartItems.map(item => {
      if (item.productId === productId && item.variationId === variationId) {
        return { ...item, count };
      }
      return item;
    });
    setCartItems(updated);
    localStorage.setItem("aria_guest_cart", JSON.stringify(updated));
  };

  const handleRemoveCartItem = (productId: string, variationId?: string) => {
    const filtered = cartItems.filter(
      item => !(item.productId === productId && item.variationId === variationId)
    );
    setCartItems(filtered);
    localStorage.setItem("aria_guest_cart", JSON.stringify(filtered));
  };

  const handleClearCart = () => {
    setCartItems([]);
    setCoupon(null);
    localStorage.removeItem("aria_guest_cart");
  };

  const handleApplyCoupon = async (code: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/coupons?code=${encodeURIComponent(code)}`);
      const data = await res.json();
      if (data.coupon) {
        setCoupon(data.coupon);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  // WISHLIST HEART ACTIONS WITH PROFILE SYNCING
  const handleToggleWishlist = (productId: string) => {
    const token = localStorage.getItem("aria_auth_token");
    let updatedList = [...wishlist];
    
    if (updatedList.includes(productId)) {
      updatedList = updatedList.filter(id => id !== productId);
    } else {
      updatedList.push(productId);
    }

    setWishlist(updatedList);

    // If authenticated, also patch the server profile persistence
    if (token && user) {
      fetch("/api/auth/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ wishlist: updatedList })
      })
        .then(res => res.json())
        .then(data => {
          if (data.user) setUser(data.user);
        });
    }
  };

  // AUTH LOGIN SUBMIT FORM
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");

    fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: loginEmail, password: loginPassword })
    })
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          setLoginError(data.error);
        } else {
          // Success login
          localStorage.setItem("aria_auth_token", data.token);
          setUser(data.user);
          setWishlist(data.user.wishlist || []);
          setAuthModalOpen(false);
          setLoginEmail("");
          setLoginPassword("");
          
          // Re-fetch products just to refresh session limits
          handleNavigate("home");
        }
      })
      .catch(() => setLoginError("خطا در برقراری ارتباط با درگاه احراز هویت"));
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError("");

    fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: regName,
        lastName: regLastName,
        email: regEmail,
        phone: regPhone,
        password: regPassword
      })
    })
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          setRegError(data.error);
        } else {
          // Registered and automatically logged in
          localStorage.setItem("aria_auth_token", data.token);
          setUser(data.user);
          setWishlist([]);
          setAuthModalOpen(false);
          setRegName("");
          setRegLastName("");
          setRegEmail("");
          setRegPhone("");
          setRegPassword("");
          handleNavigate("home");
        }
      })
      .catch(() => setRegError("خطا در ایجاد هویت در پایگاه داده"));
  };

  const handleLogout = () => {
    localStorage.removeItem("aria_auth_token");
    setUser(null);
    setWishlist([]);
    handleNavigate("home");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between font-sans selection:bg-emerald-600 selection:text-white antialiased pr-0" dir="rtl">
      
      {/* Visual Header bar navigation component */}
      <Header
        user={user}
        cart={cartItems}
        wishlist={wishlist}
        categories={categories}
        products={products}
        currentView={view}
        onNavigate={handleNavigate}
        onLogout={handleLogout}
        onUpdateCartCount={(productId, variationId, count) => handleUpdateCartItemCount(productId, count, variationId)}
        onRemoveFromCart={handleRemoveCartItem}
      />

      {/* Main body viewport */}
      <main className="flex-1">
        
        {/* Instagram style Stories on Landing Home */}
        {view === "home" && (
          <StoriesSection stories={stories} onNavigate={handleNavigate} />
        )}

        {/* Dynamic Route Pages switcher */}
        {view === "cart" ? (
          <CartPage 
            cartItems={cartItems}
            coupon={coupon}
            onUpdateCartItemCount={handleUpdateCartItemCount}
            onRemoveCartItem={handleRemoveCartItem}
            onClearCart={handleClearCart}
            onApplyCoupon={handleApplyCoupon}
            onNavigate={handleNavigate}
          />
        ) : view === "checkout" ? (
          user ? (
            <CheckoutPage 
              user={user}
              cartItems={cartItems}
              coupon={coupon}
              onClearCart={handleClearCart}
              onNavigate={handleNavigate}
            />
          ) : (
            /* If no session, force open Auth modal and show warning */
            <div className="max-w-md mx-auto text-center py-24 px-4 space-y-4 animate-in fade-in">
              <LogIn className="w-12 h-12 text-emerald-600 mx-auto" />
              <h2 className="text-sm font-black text-slate-900">نیاز به ورود به حساب کاربری!</h2>
              <p className="text-xs text-gray-400">برای ثبت نهایی آدرس پستی و صدور بارکد فاکتور خرید، ابتدا وارد حساب کاربری خود شوید یا به صورت سریع ثبت نام نمایید.</p>
              <button 
                onClick={() => { setAuthTab("login"); setAuthModalOpen(true); }}
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer"
              >
                ورود یا ثبت کاربر جدید
              </button>
            </div>
          )
        ) : view === "profile" && user ? (
          <UserProfile 
            user={user}
            onUpdateUser={setUser}
            onLogout={handleLogout}
            onNavigate={handleNavigate}
            activeTab={viewParams?.activeTab || "dashboard"}
          />
        ) : view === "admin" && user && user.role === "admin" ? (
          <AdminPanel 
            user={user}
            onNavigate={handleNavigate}
          />
        ) : (
          /* General homepage catalog pages */
          <MainPages 
            view={view}
            viewParams={viewParams}
            categories={categories}
            products={products}
            articles={articles}
            settings={settings}
            wishlist={wishlist}
            onNavigate={handleNavigate}
            onToggleWishlist={handleToggleWishlist}
            onAddToCart={handleAddToCart}
          />
        )}

      </main>

      {/* Footer policy links */}
      <Footer settings={settings} onNavigate={handleNavigate} />

      {/* AUTHENTICATION OVERLAY POPUP MODAL (LOGIN / REGISTER BOXES WITH SEEDED ACCOUNTS REMARKS) */}
      {authModalOpen && (
        <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div 
            className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 relative text-right"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Top ribbon */}
            <div className="flex bg-slate-900 border-b p-1">
              <button 
                onClick={() => setAuthTab("login")}
                className={`flex-1 py-3 text-center text-xs font-black cursor-pointer transition-colors ${authTab === "login" ? "text-emerald-500 font-extrabold border-b-2 border-emerald-500 bg-white/5" : "text-gray-400"}`}
              >
                ورود به پورتال آریا
              </button>
              <button 
                onClick={() => setAuthTab("register")}
                className={`flex-1 py-3 text-center text-xs font-black cursor-pointer transition-colors ${authTab === "register" ? "text-emerald-500 font-extrabold border-b-2 border-emerald-500 bg-white/5" : "text-gray-400"}`}
              >
                عضویت کاربر جدید
              </button>
            </div>

            {/* TAB: LOGIN */}
            {authTab === "login" ? (
              <form onSubmit={handleLoginSubmit} className="p-6 space-y-4">
                {loginError && <p className="text-[10px] text-red-600 font-bold bg-red-50 p-2.5 rounded-lg">⚠️ {loginError}</p>}
                
                <div>
                  <label className="text-xs font-bold text-gray-500 block mb-1">نشانی ایمیل شما *</label>
                  <input 
                    type="email" 
                    required 
                    value={loginEmail}
                    onChange={e => setLoginEmail(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl p-2.5 text-xs text-left font-mono" 
                    placeholder="user@example.com"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 block mb-1">کلمه عبور ورود *</label>
                  <input 
                    type="password" 
                    required 
                    value={loginPassword}
                    onChange={e => setLoginPassword(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl p-2.5 text-xs text-right" 
                  />
                </div>

                <button 
                  type="submit" 
                  className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black cursor-pointer shadow-lg shadow-emerald-100"
                >
                  ورود امن به حساب کاربری
                </button>

                {/* Seed user tips */}
                <div className="bg-slate-50 border p-3.5 rounded-xl border-dashed space-y-1.5 text-[10px] text-gray-650 font-bold leading-normal select-none">
                  <header className="text-slate-800 font-extrabold flex items-center gap-1">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>اکانت‌های تستی آماده جهت بررسی پورتال (سید دمو):</span>
                  </header>
                  <p>👤 اکانت خریدار معمولی: <span className="font-mono bg-white px-1.5 py-0.5 rounded text-gray-700">buyer@aria.com</span> با پسورد <span className="font-mono bg-white px-1.5 py-0.5 rounded text-gray-700">buyer123</span></p>
                  <p>👑 اکانت ادمین کل فروشگاه: <span className="font-mono bg-white px-1.5 py-0.5 rounded text-gray-700">admin@aria.com</span> با پسورد <span className="font-mono bg-white px-1.5 py-0.5 rounded text-gray-700">admin123</span></p>
                </div>
              </form>
            ) : (
              /* TAB: REGISTER */
              <form onSubmit={handleRegisterSubmit} className="p-6 space-y-4 max-h-[460px] overflow-y-auto no-scrollbar text-xs">
                {regError && <p className="text-[10px] text-red-650 font-bold bg-red-50 p-2.5 rounded-lg">⚠️ {regError}</p>}
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-gray-400 block mb-1">نام کوچک</label>
                    <input type="text" required value={regName} onChange={e => setRegName(e.target.value)} className="w-full border border-gray-200 rounded-xl p-2.5 text-right" />
                  </div>
                  <div>
                    <label className="text-gray-400 block mb-1">نام خانوادگی</label>
                    <input type="text" required value={regLastName} onChange={e => setRegLastName(e.target.value)} className="w-full border border-gray-200 rounded-xl p-2.5 text-right" />
                  </div>
                </div>

                <div>
                  <label className="text-gray-400 block mb-1">پست الکترونیکی ایمیل *</label>
                  <input type="email" required value={regEmail} onChange={e => setRegEmail(e.target.value)} className="w-full border border-gray-200 rounded-xl p-2.5 text-left font-mono" placeholder="me@domain.com" />
                </div>

                <div>
                  <label className="text-gray-400 block mb-1">تلفن همراه *</label>
                  <input type="text" required value={regPhone} onChange={e => setRegPhone(e.target.value)} className="w-full border border-gray-200 rounded-xl p-2.5 text-left font-mono" placeholder="09123456789" />
                </div>

                <div>
                  <label className="text-gray-400 block mb-1">رمز ورود به پروفایل (حداقل ۶ کاراکتر) *</label>
                  <input type="password" required value={regPassword} onChange={e => setRegPassword(e.target.value)} className="w-full border border-gray-200 rounded-xl p-2.5 text-right" />
                </div>

                <button 
                  type="submit" 
                  className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold cursor-pointer transition-colors shadow-lg shadow-emerald-100"
                >
                  تکمیل عضویت و ورود سریع
                </button>
              </form>
            )}

            {/* Cancel btn */}
            <div className="p-4 bg-gray-50 border-t border-gray-50 flex justify-end">
              <button 
                onClick={() => setAuthModalOpen(false)}
                className="text-[11px] text-gray-400 hover:text-gray-700 font-bold cursor-pointer"
              >
                بستن و انصراف
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
