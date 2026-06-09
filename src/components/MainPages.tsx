/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React, { useState, useEffect } from "react";
import { 
  Heart, Star, ArrowLeft, Plus, Minus, Share2, MessageSquare, 
  Search, ShieldCheck, Mail, MapPin, Send, HelpCircle, Phone, Grid, List, Check, Sparkles
} from "lucide-react";
import { Product, Category, Article, Comment, AppSettings, Address } from "../types";
import { formatPrice, formatPersianDate, toPersianDigits } from "../utils";
import ProductCard from "./ProductCard";

interface MainPagesProps {
  view: string;
  viewParams: any;
  categories: Category[];
  products: Product[];
  articles: Article[];
  settings: AppSettings;
  wishlist: string[];
  onNavigate: (view: string, params?: any) => void;
  onToggleWishlist: (productId: string) => void;
  onAddToCart: (product: Product, count: number, variationId?: string, selectedAttributes?: Record<string, string>) => void;
}

export default function MainPages({
  view,
  viewParams,
  categories,
  products,
  articles,
  settings,
  wishlist,
  onNavigate,
  onToggleWishlist,
  onAddToCart
}: MainPagesProps) {
  
  // ==========================================
  // VIEW: HOME PAGE
  // ==========================================
  if (view === "home") {
    const discountedProducts = products.filter(p => p.discountPrice !== undefined).slice(0, 4);
    const newestProducts = [...products].sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 4);
    
    // Simulate active sliders on landing
    const [sliderIdx, setSliderIdx] = useState(0);
    const banners = [
      { title: "جشنواره دیجیتال هوشمند آریا", text: "تا ۳۰٪ تخفیف روی برترین گوشی‌های ریلمی و هدفون‌های نویزکنسلینگ هفته", img: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=1000", link: "digital-devices" },
      { title: "استایل شیک پوشاک سال نو", text: "کلاسیک‌ترین کیف چرمی و کفش‌های الترا رانر صادراتی با ضمانت اصالت", img: "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1000", link: "fashion-apparel" }
    ];

    useEffect(() => {
      const interval = setInterval(() => {
        setSliderIdx(prev => (prev === 0 ? 1 : 0));
      }, 6000);
      return () => clearInterval(interval);
    }, []);

    // Countdown mock for Winter Sale banner
    const [timeLeft, setTimeLeft] = useState({ h: 12, m: 45, s: 30 });
    useEffect(() => {
      const interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev.s > 0) return { ...prev, s: prev.s - 1 };
          if (prev.m > 0) return { h: prev.h, m: prev.m - 1, s: 59 };
          if (prev.h > 0) return { h: prev.h - 1, m: 59, s: 59 };
          return { h: 12, m: 45, s: 30 };
        });
      }, 1000);
      return () => clearInterval(interval);
    }, []);

    return (
      <div className="space-y-12 pb-16 font-sans">
        
        {/* Visual Slider banner */}
        <section className="relative h-[340px] md:h-[450px] bg-slate-900 rounded-3xl overflow-hidden shadow-2xl mx-auto max-w-7xl" id="home-hero-slider">
          <img 
            src={banners[sliderIdx].img} 
            alt="" 
            className="absolute inset-0 w-full h-full object-cover filter brightness-50 contrast-105" 
          />
          <div className="absolute inset-y-0 right-0 w-full md:w-2/3 p-8 md:p-16 flex flex-col justify-center items-start text-white bg-gradient-to-l from-slate-950 via-slate-950/70 to-transparent">
            <span className="text-[10px] md:text-xs bg-emerald-600 text-white font-extrabold px-3 py-1 rounded-xl mb-4 uppercase tracking-widest flex items-center gap-1.5 animate-pulse">
              <Sparkles className="w-3.5 h-3.5" />
              <span>پیشنهاد طلایی هفته آریا</span>
            </span>
            <h1 className="text-lg md:text-2xl font-black mb-4 leading-tight text-right md:max-w-xl">
              {banners[sliderIdx].title}
            </h1>
            <p className="text-xs md:text-sm text-slate-300 leading-relaxed mb-6 text-right md:max-w-lg">
              {banners[sliderIdx].text}
            </p>
            <button 
              onClick={() => onNavigate("shop")}
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-lg hover:scale-105 shadow-emerald-900/30 cursor-pointer"
            >
              همین الان خرید کنید ←
            </button>
          </div>
          
          {/* Swiper dots */}
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-2">
            {banners.map((_, i) => (
              <button 
                key={i} 
                className={`w-2.5 h-2.5 rounded-full transition-all ${sliderIdx === i ? "bg-emerald-500 w-6" : "bg-white/40"}`}
                onClick={() => setSliderIdx(i)}
              />
            ))}
          </div>
        </section>

        {/* Featured categories blocks */}
        <section className="max-w-7xl mx-auto px-4" id="home-featured-categories">
          <h2 className="text-xs font-black text-slate-900 pr-3 border-r-4 border-emerald-650 mb-6 uppercase tracking-wider block">خرید بر اساس دسته‌بندی‌های محبوب</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            {categories.filter(c => !c.parentId && c.showInMenu).map(cat => (
              <div 
                key={cat.id}
                onClick={() => onNavigate("shop", { category: cat.id })}
                className="bg-white border border-gray-100 hover:border-emerald-300 rounded-3xl p-5 text-center cursor-pointer hover:shadow-xl transition-all group relative overflow-hidden"
              >
                <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center mb-4 overflow-hidden shadow-sm group-hover:scale-105 transition-transform">
                  <img src={cat.image} alt="" className="w-full h-full object-cover" />
                </div>
                <h3 className="font-extrabold text-xs text-gray-800 group-hover:text-emerald-700 transition-colors">{cat.name}</h3>
                <p className="text-[10px] text-gray-400 mt-1 line-clamp-1">{cat.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* SPECIAL OFFERS SHELF */}
        <section className="max-w-7xl mx-auto px-4" id="home-discounted-shelf">
          <div className="flex items-center justify-between mb-6 pb-2 border-b border-gray-100">
            <h2 className="text-xs font-black text-slate-900 pr-3 border-r-4 border-emerald-650 uppercase tracking-widest flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-rose-500 rounded-full animate-ping" />
              <span>تخفیف‌های استثنایی و لحظه‌ای</span>
            </h2>
            <button onClick={() => onNavigate("shop", { hasDiscount: true })} className="text-xs text-emerald-600 font-bold hover:underline">مشاهده همه شگفت‌انگیزها</button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {discountedProducts.map(p => (
              <ProductCard 
                key={p.id}
                product={p}
                isWishlisted={wishlist.includes(p.id)}
                onNavigate={onNavigate}
                onToggleWishlist={onToggleWishlist}
                onAddToCart={onAddToCart}
              />
            ))}
          </div>
        </section>

        {/* CUSTOM COUNTDOWN AD BLOCK */}
        <section className="max-w-7xl mx-auto px-4">
          <div className="bg-slate-900 rounded-3xl p-8 md:p-12 text-white flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden shadow-xl shadow-slate-900/10">
            <div className="absolute inset-0 bg-cover bg-center mix-blend-overlay opacity-15" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=1200')` }} />
            
            <div className="space-y-3 relative z-10 text-right">
              <span className="text-[10px] font-extrabold bg-rose-500 px-3 py-1 rounded-lg uppercase tracking-wider text-white">جشنواره زمستانه آریا شاپ</span>
              <h2 className="text-md md:text-lg font-black leading-tight text-white mt-1">تخفیف‌های فوق‌العاده محصولات تا آخر امشب</h2>
              <p className="text-xs text-slate-300">ساعت و هدفون های پرطرفدار نویز کنسلینگ را با نصف قیمت قبل بخرید.</p>
            </div>

            {/* Visual timer clock blocks */}
            <div className="flex items-center gap-3 font-mono relative z-10 select-none">
              <div className="flex flex-col items-center">
                <span className="bg-white/10 px-4 py-3 rounded-2xl text-lg font-black text-rose-500 backdrop-blur-md">
                  {toPersianDigits(timeLeft.h.toString().padStart(2, "0"))}
                </span>
                <span className="text-[9px] text-slate-400 mt-1.5 font-sans font-bold">ساعت</span>
              </div>
              <span className="text-lg font-extrabold text-white animate-pulse">:</span>
              <div className="flex flex-col items-center">
                <span className="bg-white/10 px-4 py-3 rounded-2xl text-lg font-black text-rose-500 backdrop-blur-md">
                  {toPersianDigits(timeLeft.m.toString().padStart(2, "0"))}
                </span>
                <span className="text-[9px] text-slate-400 mt-1.5 font-sans font-bold">دقیقه</span>
              </div>
              <span className="text-lg font-extrabold text-white animate-pulse">:</span>
              <div className="flex flex-col items-center">
                <span className="bg-white/10 px-4 py-3 rounded-2xl text-lg font-black text-rose-500 backdrop-blur-md animate-bounce">
                  {toPersianDigits(timeLeft.s.toString().padStart(2, "0"))}
                </span>
                <span className="text-[9px] text-slate-400 mt-1.5 font-sans font-bold">ثانیه</span>
              </div>
            </div>

            <button 
              onClick={() => onNavigate("shop")}
              className="px-6 py-3.5 bg-rose-500 hover:bg-rose-600 text-white text-xs font-black rounded-xl cursor-pointer relative z-10 transition-all hover:scale-105 shadow-md shadow-rose-900/30 shrink-0"
            >
              کالاها را ببینیدم!
            </button>
          </div>
        </section>

        {/* NEW ARRIVALS SHELF */}
        <section className="max-w-7xl mx-auto px-4" id="home-newest-shelf">
          <div className="flex items-center justify-between mb-6 pb-2 border-b border-gray-100">
            <h2 className="text-xs font-black text-slate-900 pr-3 border-r-4 border-emerald-650 uppercase tracking-widest">محبوب‌ترین جدیدترین‌ها در ویترین</h2>
            <button onClick={() => onNavigate("shop")} className="text-xs text-emerald-600 font-bold hover:underline">دیدن غرفه محصولات</button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {newestProducts.map(p => (
              <ProductCard 
                key={p.id}
                product={p}
                isWishlisted={wishlist.includes(p.id)}
                onNavigate={onNavigate}
                onToggleWishlist={onToggleWishlist}
                onAddToCart={onAddToCart}
              />
            ))}
          </div>
        </section>

        {/* LATEST BLOG ARTICLES LOBBY */}
        <section className="max-w-7xl mx-auto px-4" id="home-blog-lobby">
          <div className="flex items-center justify-between mb-6 pb-2 border-b border-gray-100">
            <h2 className="text-xs font-black text-slate-900 pr-3 border-r-4 border-emerald-650 uppercase tracking-wider">مقالات و آموزش‌های وبلاگ آریا</h2>
            <button onClick={() => onNavigate("blog")} className="text-xs text-emerald-600 font-bold hover:underline">ورود به وبلاگ</button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {articles.slice(0,2).map(art => (
              <div 
                key={art.id}
                onClick={() => onNavigate("blog-single", { id: art.id })}
                className="bg-white border border-gray-100 hover:border-emerald-350 p-5 rounded-3xl flex flex-col md:flex-row gap-5 cursor-pointer hover:shadow-xl transition-all"
              >
                <img src={art.mainImage} alt="" className="w-full md:w-40 h-36 object-cover rounded-2xl shrink-0" />
                <div className="flex flex-col justify-between">
                  <div className="space-y-1.5 text-right">
                    <span className="text-[9px] font-black bg-emerald-50 text-emerald-800 px-2.5 py-0.5 rounded-lg">{art.category}</span>
                    <h3 className="font-extrabold text-xs text-gray-900 leading-snug line-clamp-2 pt-1">{art.title}</h3>
                    <p className="text-[11px] text-gray-450 line-clamp-2 leading-relaxed">{art.summary}</p>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-gray-400 mt-2 border-t border-gray-50 pt-2 font-mono">
                    <span>نویسنده: {art.author}</span>
                    <span>انتشار: {art.date}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>
    );
  }

  // ==========================================
  // VIEW: SHOP PRODUCT ARCHIVE
  // ==========================================
  if (view === "shop") {
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
    const [searchVal, setSearchVal] = useState(viewParams?.search || "");
    const [selectedCats, setSelectedCats] = useState<string[]>(viewParams?.category ? [viewParams.category] : []);
    const [onlyStock, setOnlyStock] = useState(false);
    const [priceRange, setPriceRange] = useState(150000000); // 15,000,000 max filter
    const [sort, setSort] = useState("default");

    const handleCatCheckbox = (catId: string) => {
      setSelectedCats(prev => {
        if (prev.includes(catId)) return prev.filter(id => id !== catId);
        return [...prev, catId];
      });
    };

    // Filter items reactively in memory
    const filteredProducts = products.filter(p => {
      // search
      if (searchVal.trim() !== "") {
        const query = searchVal.toLowerCase();
        const matches = p.title.toLowerCase().includes(query) || p.sku.toLowerCase().includes(query);
        if (!matches) return false;
      }
      // category
      if (selectedCats.length > 0) {
        const matches = p.categories.some(id => selectedCats.includes(id));
        if (!matches) return false;
      }
      // discount
      if (viewParams?.hasDiscount && p.discountPrice === undefined) {
        return false;
      }
      // stock
      if (onlyStock && p.stock === 0) {
        return false;
      }
      // max price
      const actualP = p.discountPrice !== undefined ? p.discountPrice : p.price;
      if (actualP > priceRange) {
        return false;
      }

      return true;
    });

    // Sorting block
    const sorted = [...filteredProducts].sort((a,b) => {
      const priceA = a.discountPrice !== undefined ? a.discountPrice : a.price;
      const priceB = b.discountPrice !== undefined ? b.discountPrice : b.price;
      if (sort === "price-asc") return priceA - priceB;
      if (sort === "price-desc") return priceB - priceA;
      if (sort === "views") return (b.views || 0) - (a.views || 0);
      return b.id.localeCompare(a.id); // default newest
    });

    return (
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 font-sans" id="shop-archive-wrapper">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Side columns: filters */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Search filter card */}
            <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-3">
              <h4 className="text-xs font-black text-gray-900 border-r-2 border-emerald-600 pr-2">جستجوی متنی کالا</h4>
              <div className="relative">
                <input
                  type="text"
                  placeholder="نام محصول..."
                  value={searchVal}
                  onChange={e => setSearchVal(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl p-2.5 pl-10 pr-4 text-xs text-right bg-gray-50 focus:bg-white"
                />
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
              </div>
            </div>

            {/* Department categories filter block */}
            <div className="bg-white border border-gray-150 rounded-2xl p-5 shadow-sm space-y-3">
              <h4 className="text-xs font-black text-gray-900 border-r-2 border-emerald-650 pr-2">دسته‌بندی‌های غرفه‌بندی</h4>
              <div className="space-y-2.5 pt-1.5 text-xs text-gray-600">
                {categories.filter(c => !c.parentId).map(c => (
                  <div key={c.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <input 
                        type="checkbox" 
                        id={`chk-${c.id}`} 
                        checked={selectedCats.includes(c.id)}
                        onChange={() => handleCatCheckbox(c.id)}
                        className="rounded text-emerald-600 focus:ring-emerald-500" 
                      />
                      <label htmlFor={`chk-${c.id}`} className="cursor-pointer">{c.name}</label>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Price Filter slider */}
            <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-4">
              <h4 className="text-xs font-black text-gray-900 border-r-2 border-emerald-650 pr-2">محدوده فیلتر قیمت کالا</h4>
              <div className="space-y-2 font-mono text-center">
                <input
                  type="range"
                  min={500000}
                  max={25000000}
                  step={500000}
                  value={priceRange}
                  onChange={e => setPriceRange(Number(e.target.value))}
                  className="w-full accent-emerald-600"
                />
                <div className="flex items-center justify-between text-[11px] text-gray-500 pt-1">
                  <span>تا: {formatPrice(priceRange)}</span>
                  <span>کمترین خرید</span>
                </div>
              </div>
            </div>

            {/* Inventory available checkbox */}
            <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center gap-2 text-xs">
                <input 
                  type="checkbox" 
                  id="stock-only" 
                  checked={onlyStock}
                  onChange={e => setOnlyStock(e.target.checked)}
                  className="rounded text-emerald-650" 
                />
                <label htmlFor="stock-only" className="font-semibold text-gray-750 cursor-pointer">تنها نمایش کالاهای دارای موجودی</label>
              </div>
            </div>

          </div>

          {/* Catalog side column */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* Top Toolbar sorting */}
            <div className="bg-white border border-gray-100 p-4 rounded-2xl shadow-sm flex items-center justify-between flex-wrap gap-4 text-xs">
              <div className="flex items-center gap-3">
                <span className="text-gray-400 font-medium">مرتب‌سازی:</span>
                <select 
                  value={sort} 
                  onChange={e => setSort(e.target.value)}
                  className="border border-gray-150 rounded-xl p-2 bg-white text-gray-700 focus:outline-none"
                >
                  <option value="default">جدیدترین محصولات</option>
                  <option value="price-asc">صعودی (ارزان‌ترین به گران‌ترین)</option>
                  <option value="price-desc">نزولی (گران‌ترین به ارزان‌ترین)</option>
                  <option value="views">پربازدیدترین‌ها</option>
                </select>
              </div>

              {/* Grid vs List toggling layout */}
              <div className="flex items-center gap-2">
                <span className="text-gray-405 ml-2 font-bold font-mono">یافت شده: {toPersianDigits(sorted.length)} کالا</span>
                <button 
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-lg cursor-pointer ${viewMode === "grid" ? "bg-gray-100 text-emerald-600" : "text-gray-400 hover:bg-gray-50"}`}
                  title="نمای شبکه‌ای"
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-lg cursor-pointer ${viewMode === "list" ? "bg-gray-100 text-emerald-600" : "text-gray-400 hover:bg-gray-50"}`}
                  title="نمای لیست"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Grid listing products wrapper container */}
            {sorted.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center space-y-4">
                <Search className="w-16 h-16 text-gray-200 mx-auto" />
                <h3 className="font-extrabold text-sm text-gray-800">محصولی مطابق با فیلترها یافت نشد!</h3>
                <p className="text-xs text-gray-450 leading-relaxed max-w-sm mx-auto">
                  حوزه‌های دسته یا رنج قیمت‌های انتخابی را کمی عریض‌تر و عاری از کلمات محدود فیلتر کنید.
                </p>
                <button 
                  onClick={() => { setSearchVal(""); setSelectedCats([]); setPriceRange(150000000); setOnlyStock(false); }}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer"
                >
                  حذف تمامی فیلترها
                </button>
              </div>
            ) : viewMode === "grid" ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {sorted.map(p => (
                  <ProductCard 
                    key={p.id}
                    product={p}
                    isWishlisted={wishlist.includes(p.id)}
                    onNavigate={onNavigate}
                    onToggleWishlist={onToggleWishlist}
                    onAddToCart={onAddToCart}
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {sorted.map(p => {
                  const actualP = p.discountPrice !== undefined ? p.discountPrice : p.price;
                  return (
                    <div 
                      key={p.id} 
                      onClick={() => onNavigate("product", { id: p.id })}
                      className="bg-white border border-gray-100 hover:border-emerald-250 p-4 rounded-2xl shadow-sm hover:shadow-lg transition-all flex flex-col md:flex-row gap-5 cursor-pointer items-center text-right text-xs"
                    >
                      <img src={p.mainImage} alt="" className="w-full md:w-32 h-32 object-cover rounded-xl" />
                      <div className="flex-1 min-w-0 space-y-1">
                        <span className="text-[10px] bg-slate-50 text-gray-500 px-2 py-0.5 rounded font-mono font-bold">{p.sku}</span>
                        <h3 className="font-extrabold text-sm text-gray-900 truncate">{p.title}</h3>
                        <p className="text-[11px] text-gray-450 line-clamp-2 leading-relaxed">{p.descShort}</p>
                        <div className="flex items-center gap-1.5 pt-1">
                          <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                          <span className="font-bold text-gray-700">{toPersianDigits(p.rating)}</span>
                        </div>
                      </div>
                      <div className="shrink-0 flex flex-col items-center justify-center gap-2 md:border-r border-gray-50 md:pr-6 md:h-24">
                        <span className="font-mono font-black text-emerald-750 text-sm">{formatPrice(actualP)}</span>
                        <button 
                          onClick={(e) => { e.stopPropagation(); onNavigate("product", { id: p.id }); }}
                          className="px-4 py-2 bg-emerald-50 hover:bg-emerald-600 text-emerald-600 hover:text-white rounded-xl text-[10px] font-black transition-colors"
                        >
                          خرید محصول +
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Classic pagination */}
            <div className="flex items-center justify-center gap-1.5 pt-8">
              <button className="w-9 h-9 border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-lg text-xs font-bold font-mono">۱</button>
              <button className="w-9 h-9 bg-emerald-600 text-white rounded-lg text-xs font-bold font-mono shadow-md shadow-emerald-100">۲</button>
              <button className="w-9 h-9 border border-gray-250 text-gray-650 hover:bg-gray-50 rounded-lg text-xs font-bold font-mono">۳</button>
            </div>

          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW: SINGLE PRODUCT DETAILED SCREEN
  // ==========================================
  if (view === "product" && viewParams?.id) {
    const product = products.find(p => p.id === viewParams.id);
    if (!product) return <div className="text-center py-20 text-xs">محصول یافت نگردید.</div>;

    // Gallery and main zoom image
    const [mainPic, setMainPic] = useState(product.mainImage);
    const [count, setCount] = useState(1);
    
    // attributes picker (color, size, etc.)
    const [selectedAttribs, setSelectedAttribs] = useState<Record<string, string>>({});
    const [activeTab, setActiveTab2] = useState("descs");

    // notify alert state for email / phone
    const [notifySms, setNotifySms] = useState("");
    const [notifySent, setNotifySent] = useState(false);

    // Review submit states
    const [revName, setRevName] = useState("");
    const [revEmail, setRevEmail] = useState("");
    const [revReview, setRevReview] = useState("");
    const [revRating, setRevRating] = useState(5);
    const [commentSuccess, setCommentSuccess] = useState(false);

    // Initial check for default selected attributes
    useEffect(() => {
      if (product.attributes && product.attributes.length > 0) {
        const defaults: Record<string, string> = {};
        product.attributes.forEach(attr => {
          defaults[attr.name] = attr.values[0];
        });
        setSelectedAttribs(defaults);
      }
    }, [product]);

    // calculate variation price if variable
    let priceToShow = product.price;
    let discountToShow = product.discountPrice;
    let skuToShow = product.sku;
    let currentVariationId: string | undefined = undefined;

    if (product.isVariable && product.variations.length > 0) {
      // Find matching variation object
      const matchedVar = product.variations.find(v => {
        return Object.entries(selectedAttribs).every(([key, value]) => {
          return v.attributes[key] === value;
        });
      });
      if (matchedVar) {
        priceToShow = matchedVar.price;
        discountToShow = matchedVar.discountPrice;
        skuToShow = matchedVar.sku;
        currentVariationId = matchedVar.id;
        if (matchedVar.image) {
          // Temporarily slide image if variation has custom photo
        }
      }
    }

    const priceFinal = discountToShow !== undefined ? discountToShow : priceToShow;
    const isOutOfStock = product.stock === 0 && !product.allowBackorder;

    const handlePlus = () => setCount(prev => Math.min(product.stock || 99, prev + 1));
    const handleMinus = () => setCount(prev => Math.max(1, prev - 1));

    const handleWishToggleClick = () => {
      onToggleWishlist(product.id);
    };

    const handleBuyClick = () => {
      if (isOutOfStock) return;
      onAddToCart(product, count, currentVariationId, selectedAttribs);
    };

    const handleNotifyRegister = (e: React.FormEvent) => {
      e.preventDefault();
      if (!notifySms.trim()) return;
      setNotifySent(true);
      setNotifySms("");
    };

    const handleReviewSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!revName || !revReview) return;

      const bodyComment = {
        productId: product.id,
        name: revName,
        email: revEmail || "ref@test.com",
        rating: revRating,
        content: revReview
      };

      fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyComment)
      })
        .then(res => res.json())
        .then(() => {
          setRevName("");
          setRevEmail("");
          setRevReview("");
          setCommentSuccess(true);
          setTimeout(() => setCommentSuccess(false), 5000);
        });
    };

    // Calculate related products
    const relateds = products.filter(p => p.categories.some(id => product.categories.includes(id)) && p.id !== product.id).slice(0, 4);

    return (
      <div className="max-w-7xl mx-auto px-4 py-10 sm:px-6 lg:px-8 font-sans" id="single-product-wrapper">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          {/* Images block (right) */}
          <div className="space-y-4">
            <div className="relative aspect-square border border-gray-100 rounded-3xl overflow-hidden bg-gray-50">
              <img src={mainPic} alt="" className="w-full h-full object-cover shadow-sm transition-all duration-300 hover:scale-105" referrerPolicy="no-referrer" />
              {discountToShow && (
                <span className="absolute top-4 right-4 bg-rose-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg font-mono">
                  شگفت‌انگیز!
                </span>
              )}
            </div>

            {/* Thumbnail selector gallery loops */}
            <div className="flex gap-3 overflow-x-auto no-scrollbar py-1">
              {product.gallery?.map((img, id) => (
                <button
                  key={id}
                  onClick={() => setMainPic(img)}
                  className={`w-20 h-20 border-2 rounded-xl overflow-hidden bg-gray-50 flex-shrink-0 cursor-pointer ${mainPic === img ? "border-emerald-600 shadow-md" : "border-gray-100 hover:border-gray-200"}`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Texts block (left) */}
          <div className="space-y-6 text-right">
            <div>
              <span className="text-[10px] bg-slate-100 text-gray-500 px-2.5 py-1 rounded font-mono font-extrabold uppercase">{skuToShow}</span>
              <h1 className="text-md md:text-lg font-black text-gray-900 mt-3 leading-relaxed">{product.title}</h1>
              
              <div className="flex items-center gap-2 mt-2">
                <div className="flex text-amber-400">
                  <Star className="w-4 h-4 fill-amber-400" />
                </div>
                <strong className="text-xs text-gray-800 font-mono font-bold">{toPersianDigits(product.rating.toFixed(1))}</strong>
                <span className="text-[11px] text-gray-400">({toPersianDigits(product.reviewsCount)} نظر ثبت شده کاربران)</span>
              </div>
            </div>

            {/* Pricing Tag details */}
            <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-gray-400 block mb-1">قیمت نهایی کالا:</span>
                {discountToShow && (
                  <span className="text-xs text-gray-400 line-through font-mono block">
                    {toPersianDigits(priceToShow.toLocaleString())}
                  </span>
                )}
                <span className="text-md font-black text-slate-900 font-mono">
                  {formatPrice(priceFinal)}
                </span>
              </div>

              <div>
                <span className="text-[11px] text-gray-400 block mb-1">وضعیت محصول در انبار شاپ:</span>
                {isOutOfStock ? (
                  <span className="text-xs bg-red-50 text-red-650 px-3 py-1 rounded-full font-bold border border-red-150">ناموجود</span>
                ) : (
                  <span className="text-xs bg-emerald-50 text-emerald-800 px-3 py-1 rounded-full font-bold border border-emerald-150">
                    موجود (آماده ارسال فوری)
                  </span>
                )}
              </div>
            </div>

            {/* Short descriptions */}
            <p className="text-xs text-gray-555 leading-relaxed bg-white p-2">
              {product.descShort}
            </p>

            {/* Variable drop-down menus attributes */}
            {product.isVariable && product.attributes?.map(attr => (
              <div key={attr.name} className="space-y-2">
                <span className="text-xs font-bold text-gray-400">{attr.name} مورد انتخاب:</span>
                <div className="flex gap-2">
                  {attr.values.map(val => (
                    <button
                      key={val}
                      onClick={() => setSelectedAttribs(prev => ({ ...prev, [attr.name]: val }))}
                      className={`px-4 py-2 border rounded-xl text-xs font-bold transition-all cursor-pointer ${selectedAttribs[attr.name] === val ? "border-emerald-600 bg-emerald-50 text-emerald-800 font-black shadow-sm" : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}
                    >
                      {val}
                    </button>
                  ))}
                </div>
              </div>
            ))}

            {/* Purchase CTA buttons */}
            {!isOutOfStock ? (
              <div className="flex items-center gap-4 pt-4 border-t border-gray-100 flex-wrap">
                {/* plus minus block */}
                <div className="flex items-center gap-2.5 border border-gray-200 rounded-xl p-1 bg-white">
                  <button onClick={handlePlus} className="p-1 px-1.5 hover:bg-gray-50 text-gray-600 rounded">
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-xs font-bold font-mono text-gray-800 w-6 text-center">{toPersianDigits(count)}</span>
                  <button onClick={handleMinus} className="p-1 px-1.5 hover:bg-gray-50 text-gray-600 rounded">
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button
                  onClick={handleBuyClick}
                  className="px-8 py-3.5 bg-emerald-605 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-md shadow-emerald-110 shrink-0"
                  id="add-to-cart-submit"
                >
                  <span>افزودن به سبد خرید</span>
                </button>

                <button
                  onClick={handleWishToggleClick}
                  className="p-3.5 rounded-xl border border-gray-200 text-gray-400 hover:text-rose-500 hover:bg-rose-50 cursor-pointer active:scale-95 transition-all"
                  title="نشان لایک"
                >
                  <Heart className={`w-5 h-5 ${wishlist.includes(product.id) ? "fill-rose-500 text-rose-500" : ""}`} />
                </button>
              </div>
            ) : (
              /* Restock registration SMS form if out-of-stock */
              <form onSubmit={handleNotifyRegister} className="bg-amber-50/50 p-5 rounded-2xl border border-amber-150 space-y-3.5">
                <span className="text-xs font-bold text-amber-800 block">خبرم کن! زمان موجود شدن جنس در انبار</span>
                {notifySent ? (
                  <p className="text-xs text-emerald-750 font-semibold animate-pulse">✓ مشخصات تماس شما ثبت گردید. به محض شارژ موجودی برای شما پیامک ارسال خواهد شد.</p>
                ) : (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      required
                      placeholder="شماره موبایل یا ایمیل"
                      value={notifySms}
                      onChange={e => setNotifySms(e.target.value)}
                      className="flex-1 border border-gray-200 bg-white rounded-xl p-2.5 text-xs text-right focus:outline-none"
                    />
                    <button type="submit" className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold cursor-pointer shrink-0">ثبت اطلاعیه</button>
                  </div>
                )}
              </form>
            )}

            <div className="text-xs text-gray-400 pt-4 flex items-center justify-between border-t border-gray-50 flex-wrap gap-2">
              <span className="flex items-center gap-1.5 font-bold text-[emerald-700]">
                <ShieldCheck className="w-5 h-5 shrink-0" />
                <span>ضمانت برگشت وجه ۷ روزه با حق تست فیزیکی</span>
              </span>
              <button 
                onClick={() => alert("لینک اشتراک گذاری با موفقیت به کلیپ‌بورد کپی شد.")}
                className="flex items-center gap-1 text-gray-550 hover:text-emerald-650"
              >
                <Share2 className="w-4 h-4" />
                <span>اشتراک‌گذاری در شبکه‌ها</span>
              </button>
            </div>

          </div>
        </div>

        {/* Tab information details at the bottom */}
        <div className="mt-16 bg-white border border-gray-100 rounded-3xl p-6 md:p-8 shadow-sm">
          <div className="flex border-b border-gray-100 gap-6 overflow-x-auto pb-1 no-scrollbar shrink-0 text-xs font-extrabold mb-6">
            {[
              { id: "descs", name: "توضیحات تکمیلی" },
              { id: "attrs", name: "جدول ویژگی‌ها" },
              { id: "revs", name: "دیدگاه کاربران" }
            ].map(t => (
              <button
                key={t.id}
                onClick={() => setActiveTab2(t.id)}
                className={`pb-3 border-b-2 transition-all cursor-pointer ${activeTab === t.id ? "border-emerald-600 text-emerald-650 font-black" : "border-transparent text-gray-400 hover:text-emerald-650"}`}
              >
                {t.name}
              </button>
            ))}
          </div>

          {/* rendering content panels */}
          {activeTab === "descs" && (
            <div 
              className="text-xs text-gray-700 leading-relaxed space-y-4 text-right html-content-viewer whitespace-pre-wrap leading-loose"
              dangerouslySetInnerHTML={{ __html: product.descFull }}
            />
          )}

          {activeTab === "attrs" && (
            <div className="overflow-x-auto text-xs bg-slate-50 p-4 rounded-xl">
              {product.attributes?.length === 0 ? (
                <p className="text-gray-400">ویژگی خاصی ثبت نشده است.</p>
              ) : (
                <table className="w-full text-right divide-y divide-gray-100">
                  <tbody>
                    {product.attributes?.map((at, id) => (
                      <tr key={id} className="hover:bg-gray-150/30">
                        <td className="py-2 px-4 font-bold text-gray-900 w-1/4">{at.name}</td>
                        <td className="py-2 px-4 text-gray-600">{at.values.join(" ، ")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {activeTab === "revs" && (
            <div className="space-y-8" id="product-reviews-tab">
              
              {/* comment box submit trigger */}
              <form onSubmit={handleReviewSubmit} className="space-y-4 border-b border-gray-100 pb-8 text-right">
                <h4 className="font-extrabold text-xs text-gray-800">شما هم دیدگاه ارزشمند خود را بنویسید</h4>
                {commentSuccess && <p className="text-[10px] text-emerald-650 font-bold animate-pulse">✓ دیدگاه شما دریافت و به پیشخوان ادمین ارسال گردید.</p>}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div>
                    <label className="text-gray-400 block mb-1">نام شما *</label>
                    <input type="text" value={revName} onChange={e => setRevName(e.target.value)} required className="w-full border border-gray-200 rounded-xl p-2.5 text-right bg-gray-50 focus:bg-white" />
                  </div>
                  <div>
                    <label className="text-gray-400 block mb-1">پست الکترونیکی</label>
                    <input type="email" value={revEmail} onChange={e => setRevEmail(e.target.value)} className="w-full border border-gray-200 rounded-xl p-2.5 text-left font-mono bg-gray-50 focus:bg-white" />
                  </div>
                  <div>
                    <label className="text-gray-400 block mb-1">امتیاز ستاره‌ای شما (۱ تا ۵)</label>
                    <select value={revRating} onChange={e => setRevRating(Number(e.target.value))} className="w-full border border-gray-200 rounded-xl p-2.5 text-right bg-gray-50 focus:bg-white">
                      <option value={5}>⭐⭐⭐⭐⭐ ۵ ستاره عالی</option>
                      <option value={4}>⭐⭐⭐⭐ ۴ ستاره خوب</option>
                      <option value={3}>⭐⭐⭐ ۳ ستاره متوسط</option>
                      <option value={2}>⭐⭐ ۲ ستاره ضعیف</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-400 block mb-1">متن دیدگاه شما *</label>
                  <textarea value={revReview} onChange={e => setRevReview(e.target.value)} required rows={3} className="w-full border border-gray-200 rounded-xl p-2.5 text-right bg-gray-50 focus:bg-white" placeholder="تجربه استفاده شما در مورد رنگ، قابلیت یا کاربری کالا..." />
                </div>
                
                <button type="submit" className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold cursor-pointer shadow-md shadow-emerald-100">
                  ثبت تایید دیدگاه خرید
                </button>
              </form>

              {/* standard lists of reviews */}
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-xl border">
                  <strong className="text-xs text-gray-800">امیرحسین عباسی</strong>
                  <span className="text-[10px] text-gray-400 font-mono pr-2">۱۴۰۵/۰۳/۱۷</span>
                  <p className="text-xs text-gray-650 mt-1.5 leading-relaxed">واقعاً طراحی چرمی پشت گوشی جذاب‌ترین چیزیه که ریلمی معرفی کرده. من بسیار راضیم.</p>
                </div>
              </div>

            </div>
          )}

        </div>

        {/* RELATED PRODUCTS LOOP */}
        {relateds.length > 0 && (
          <section className="mt-16 space-y-6">
            <h3 className="text-xs font-black text-slate-900 border-r-4 border-emerald-600 pr-2">محصولات مشابه و مرتبط که شاید بپسندید</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {relateds.map(p => (
                <ProductCard 
                  key={p.id}
                  product={p}
                  isWishlisted={wishlist.includes(p.id)}
                  onNavigate={onNavigate}
                  onToggleWishlist={onToggleWishlist}
                  onAddToCart={onAddToCart}
                />
              ))}
            </div>
          </section>
        )}

      </div>
    );
  }

  // ==========================================
  // VIEW: BLOG ARTICLES LIST LOBBY
  // ==========================================
  if (view === "blog") {
    return (
      <div className="max-w-7xl mx-auto px-4 py-10 sm:px-6 lg:px-8 font-sans" id="blog-archive-lobby">
        <div className="space-y-2 text-center max-w-xl mx-auto mb-12">
          <h1 className="text-md md:text-lg font-black text-gray-900">وبلاگ خبری و راهنمای دیجیتال آریا</h1>
          <p className="text-xs text-gray-400 leading-relaxed">آخرین آموزش‌ها، تکنولوژی‌ها و ترفندهای مد و اکسسوری سفر را به صورت کاملاً تفسیری مطالعه کنید.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {articles.map(art => (
            <div 
              key={art.id}
              onClick={() => onNavigate("blog-single", { id: art.id })}
              className="bg-white border border-gray-100 hover:border-emerald-350 p-6 rounded-3xl flex flex-col md:flex-row gap-6 cursor-pointer hover:shadow-2xl transition-all"
            >
              <img src={art.mainImage} alt="" className="w-full md:w-48 h-40 object-cover rounded-2xl shrink-0" />
              <div className="flex flex-col justify-between">
                <div className="space-y-1.5 text-right">
                  <span className="text-[9px] font-black bg-emerald-50 text-emerald-800 px-2.5 py-0.5 rounded-lg">{art.category}</span>
                  <h3 className="font-extrabold text-xs text-gray-900 leading-snug line-clamp-2 pt-1">{art.title}</h3>
                  <p className="text-[11px] text-gray-450 line-clamp-2 leading-relaxed">{art.summary}</p>
                </div>
                <div className="flex items-center justify-between text-[10px] text-gray-400 mt-2 border-t border-gray-50 pt-2 font-mono">
                  <span>نویسنده: {art.author}</span>
                  <span>انتشار: {art.date}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW: SINGLE BLOG ARTICLE PAGE
  // ==========================================
  if (view === "blog-single" && viewParams?.id) {
    const art = articles.find(a => a.id === viewParams.id);
    if (!art) return <div className="text-center py-20 text-xs font-bold">مقاله یافت نشد</div>;

    return (
      <div className="max-w-3xl mx-auto px-4 py-12 font-sans" id="blog-single-page">
        <article className="space-y-6">
          <div className="space-y-2 text-right">
            <span className="text-[10px] bg-emerald-50 text-emerald-800 px-3 py-1 rounded-full font-bold">{art.category}</span>
            <h1 className="text-md md:text-lg font-black text-gray-950 mt-1 leading-snug">{art.title}</h1>
            <div className="text-[11px] text-gray-400 font-mono flex gap-4 pt-1">
              <span>تاریخ انتشار: {art.date}</span>
              <span>•</span>
              <span>نویسنده: {art.author}</span>
              <span>•</span>
              <span>بازدید: {toPersianDigits(art.views || 15)} بار</span>
            </div>
          </div>

          <div className="w-full h-[300px] border border-gray-100 rounded-3xl overflow-hidden shadow-sm">
            <img src={art.mainImage} alt="" className="w-full h-full object-cover" />
          </div>

          <p className="text-xs text-slate-900 leading-relaxed font-black border-r-4 pr-3 border-emerald-600 block bg-slate-50 py-3.5 italic">
            خلاصه: {art.summary}
          </p>

          <div 
            className="text-xs text-gray-650 leading-loose html-content-viewer text-right pt-6 space-y-4"
            dangerouslySetInnerHTML={{ __html: art.content }}
          />

          <div className="border-t border-gray-100 pt-6 flex flex-wrap gap-2 text-xs">
            <span className="text-gray-400 font-bold ml-2">برچسب‌های کلیدی:</span>
            {art.tags?.map(t => (
              <span key={t} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-lg">#{t}</span>
            ))}
          </div>

        </article>
      </div>
    );
  }

  // ==========================================
  // VIEW: ABOUT, RULES, PRIVACY, FAQ PAGES
  // ==========================================
  if (view === "info" && viewParams?.page) {
    const page = viewParams.page;

    return (
      <div className="max-w-3xl mx-auto px-4 py-12 font-sans space-y-6 text-right text-xs text-gray-700 leading-loose">
        
        {page === "about" && (
          <div className="bg-white border border-gray-100 p-8 rounded-3xl shadow-sm space-y-4">
            <h1 className="text-md font-black text-gray-900 border-b pb-3 mb-6">مرام‌نامه و فلسفه تشکیل فروشگاه بزرگ آریا</h1>
            <p>هدف از تشکیل فروشگاه بزرگ یکپارچه آریا، دسترسی آسان و عمیق هموطنان گرامی به اصیل‌ترین گجت‌های الکترونیکی فیلتر شده دیجیتال و پوشاک گزینش‌شده با استاندارد صادراتی می‌باشد.</p>
            <p>ما گارانتی طلایی سلامت فیزیکی و فاکتور چاپی را به موازات سیستم چت تیکت پشتیبانی در داشبورد تعبیه کرده‌ایم تا خریدار همواره آرامش تام مادی پس از واریز داشته باشد.</p>
            <div className="w-full h-44 rounded-2xl overflow-hidden opacity-85 mt-6 shadow-sm">
              <img src="https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=600" alt="" className="w-full h-full object-cover" />
            </div>
          </div>
        )}

        {page === "contact" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Form contacts */}
            <div className="bg-white border border-gray-100 p-6 rounded-3xl shadow-sm space-y-4">
              <h2 className="font-black text-xs text-gray-900 border-b pb-2">فرم ارسال پیغام مستقیم</h2>
              <form onSubmit={e => { e.preventDefault(); alert("پیام شما ثبت شد."); }} className="space-y-3">
                <div>
                  <label className="text-gray-400 block mb-1">نام و نام خانوادگی شما *</label>
                  <input type="text" required className="w-full border border-gray-200 rounded-xl p-2.5 text-xs text-right bg-gray-50 focus:bg-white" />
                </div>
                <div>
                  <label className="text-gray-400 block mb-1">شماره همراه تماس *</label>
                  <input type="text" required className="w-full border border-gray-200 rounded-xl p-2.5 text-xs text-right bg-gray-50 focus:bg-white" />
                </div>
                <div>
                  <label className="text-gray-400 block mb-1">پیام شما *</label>
                  <textarea required rows={3} className="w-full border border-gray-200 rounded-xl p-2.5 text-xs text-right bg-gray-50 focus:bg-white" placeholder="..." />
                </div>
                <button type="submit" className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer">ارسال پیغام</button>
              </form>
            </div>

            {/* Simulated Interactive Google maps */}
            <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-sm space-y-4 flex flex-col justify-between">
              <div>
                <h2 className="font-extrabold text-xs border-b pb-2 mb-4 border-white/20">پل‌های ارتباطی ما</h2>
                <ul className="space-y-3">
                  <li className="flex items-center gap-2.5">
                    <MapPin className="w-4 h-4 text-emerald-400" />
                    <span>{settings.address}</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Phone className="w-4 h-4 text-emerald-400" />
                    <span>تلفن: {toPersianDigits(settings.phone)}</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Mail className="w-4 h-4 text-emerald-400" />
                    <span>ایمیل پشتیبانی: {settings.email}</span>
                  </li>
                </ul>
              </div>

              {/* Map mockup */}
              <div className="bg-slate-800 rounded-xl p-3 border border-white/10 text-center text-[10px] space-y-2">
                <span className="font-bold text-gray-300 block">نقشه موقعیت جغرافیایی خیابان ولیعصر (شبیه‌ساز نقشه گوگل)</span>
                <div className="w-full h-24 bg-slate-950/40 rounded-lg flex items-center justify-center border border-white/5 font-mono text-slate-500">
                  LAT: 35.7219° N, LON: 51.4081° E
                </div>
              </div>

            </div>

          </div>
        )}

        {page === "rules" && (
          <div className="bg-white border border-gray-100 p-8 rounded-3xl shadow-sm space-y-4">
            <h1 className="text-md font-black text-gray-900 border-b pb-3 mb-6">قوانین و چارچوب حقوقی خرید در آریا</h1>
            <p>۱. ثبت هرگونه سفارش به منزله پذیرش تام ضوابط بسته‌بندی، زمان تحویل مامورین پست و بررسی گارانتی‌های اصالت کالاها از سوی خریدار تلقی خواهد شد.</p>
            <p>۲. مشتری موظف است در زمان ثبت رسید آدرس، شماره پلاک، تلفن تماس گیرنده و کد پستی موثق را درج کند.</p>
          </div>
        )}

        {page === "privacy" && (
          <div className="bg-white border border-gray-100 p-8 rounded-3xl shadow-sm space-y-4">
            <h1 className="text-md font-black text-gray-900 border-b pb-3 mb-6">مرز حریم خصوصی و امنیت وب‌سایت آریا</h1>
            <p>تمامی تراکنش‌های مادی این شاپ در بسترهای HTTPS عاری از ردیابی‌های کوکی غیرمجاز پردازش می‌گردد. مشخصات هویتی و بونوس‌های کاربران جزء اسرار مادی حفظ خواهد شد.</p>
          </div>
        )}

        {page === "faq" && (
          <div className="bg-white border border-gray-100 p-8 rounded-3xl shadow-sm space-y-4">
            <h1 className="text-md font-black text-gray-900 border-b pb-3 mb-6">سوالات متداول کاربران گرامی (FAQ)</h1>
            <div className="space-y-4">
              <div className="border bg-slate-50/50 p-4 rounded-xl">
                <strong className="text-xs text-gray-900 block mb-1">سوال: کدهای تخفیف را کجا باید اعمال کنیم؟</strong>
                <p className="text-gray-600">پاسخ: در صفحه اختصاصی سبد خرید، فیلد ورود کد تخفیف را لحاظ کرده‌ایم. با زدن دکمه اعمال، فاکتور شما سمت سرور مجدداً با کسر قیمت بازسازی می‌شود.</p>
              </div>
            </div>
          </div>
        )}

      </div>
    );
  }

  return null;
}
