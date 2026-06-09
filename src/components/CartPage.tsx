/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Trash2, Plus, Minus, Tag, ShieldCheck, ShoppingBag, ArrowRight } from "lucide-react";
import { formatPrice, toPersianDigits } from "../utils";

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

interface CartPageProps {
  cartItems: CartItem[];
  coupon: any | null;
  onUpdateCartItemCount: (productId: string, count: number, variationId?: string) => void;
  onRemoveCartItem: (productId: string, variationId?: string) => void;
  onClearCart: () => void;
  onApplyCoupon: (couponCode: string) => Promise<boolean>;
  onNavigate: (view: string, params?: any) => void;
}

export default function CartPage({
  cartItems,
  coupon,
  onUpdateCartItemCount,
  onRemoveCartItem,
  onClearCart,
  onApplyCoupon,
  onNavigate
}: CartPageProps) {
  const [couponInput, setCouponInput] = useState("");
  const [couponError, setCouponError] = useState("");
  const [couponSuccess, setCouponSuccess] = useState("");
  const [loadingCoupon, setLoadingCoupon] = useState(false);

  // calculate prices
  const subTotal = cartItems.reduce((acc, item) => acc + item.price * item.count, 0);

  // Apply Coupon deductions
  let discountAmount = 0;
  if (coupon) {
    if (coupon.type === "percent") {
      discountAmount = Math.round((subTotal * coupon.value) / 100);
    } else {
      discountAmount = coupon.value;
    }
  }

  // Shipping cost thresholds (e.g. Free shipping above 2,500,000 toman, otherwise 45,000 Toman)
  const shippingThreshold = 2500000;
  const shippingCost = subTotal === 0 ? 0 : subTotal >= shippingThreshold ? 0 : 45000;
  
  const finalTotal = Math.max(0, subTotal - discountAmount + shippingCost);

  const handleApplyCouponClick = async (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError("");
    setCouponSuccess("");
    if (!couponInput.trim()) return;

    setLoadingCoupon(true);
    const ok = await onApplyCoupon(couponInput.toUpperCase().trim());
    setLoadingCoupon(false);

    if (ok) {
      setCouponSuccess("کد تخفیف شما با موفقیت اعمال و محاسبه شد.");
      setCouponInput("");
    } else {
      setCouponError("کد تخفیف وارد شده معتبر یا فعال نمی‌باشد یا سبد پاسخگوی شروط نیست.");
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-6 font-sans animate-in fade-in" id="empty-cart-page">
        <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-full mx-auto flex items-center justify-center border">
          <ShoppingBag className="w-7 h-7" />
        </div>
        <div className="space-y-1.5">
          <h2 className="text-md font-black text-gray-950">سبد خرید شما در حال حاضر خالی است.</h2>
          <p className="text-xs text-gray-400">کالاهای جذاب را به سبد خریدتان بیافزایید تا شگفت‌انگیزها را مادی کنید.</p>
        </div>
        <button
          onClick={() => onNavigate("shop")}
          className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-emerald-100 cursor-pointer"
        >
          ورود به غرفه‌های فروشگاهی
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 sm:px-6 lg:px-8 font-sans" id="shopping-cart-page-wrapper">
      <h1 className="text-xs font-black text-slate-900 border-r-4 border-emerald-600 pr-2.5 mb-8 uppercase tracking-widest block text-right">سبد خرید و ریز فاکتور نهایی</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Cart items list columns */}
        <div className="lg:col-span-2 space-y-4">
          
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden text-xs">
            <div className="divide-y divide-gray-50 text-right">
              {cartItems.map((item, idx) => {
                const itemTotal = item.price * item.count;
                return (
                  <div key={idx} className="p-5 flex flex-col md:flex-row items-center gap-5 justify-between">
                    
                    {/* Img and desc info */}
                    <div className="flex items-center gap-4 flex-1 w-full">
                      <img src={item.image} alt="" className="w-16 h-16 object-cover rounded-xl border border-gray-50 flex-shrink-0" />
                      <div className="space-y-1">
                        <h3 className="font-bold text-gray-900 pr-1 leading-snug">{item.title}</h3>
                        <span className="text-[10px] bg-gray-50 text-gray-500 font-mono font-bold px-2 py-0.5 rounded uppercase">{item.sku}</span>
                        {item.selectedAttributes && Object.keys(item.selectedAttributes).length > 0 && (
                          <div className="flex gap-2 pt-1 text-[10px] text-gray-400 font-semibold">
                            {Object.entries(item.selectedAttributes).map(([k,v]) => (
                              <span key={k}>{k}: {v}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* qty counter controller */}
                    <div className="flex items-center gap-6 justify-between w-full md:w-auto">
                      
                      {/* +/- counter */}
                      <div className="flex items-center gap-2.5 border border-gray-200 rounded-xl p-1 bg-white">
                        <button 
                          onClick={() => onUpdateCartItemCount(item.productId, item.count + 1, item.variationId)} 
                          className="p-1 px-1.5 hover:bg-slate-50 text-slate-600 rounded"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                        <span className="font-mono font-bold text-gray-800 text-xs w-6 text-center">{toPersianDigits(item.count)}</span>
                        <button 
                          onClick={() => {
                            if (item.count > 1) {
                              onUpdateCartItemCount(item.productId, item.count - 1, item.variationId);
                            } else {
                              onRemoveCartItem(item.productId, item.variationId);
                            }
                          }} 
                          className="p-1 px-1.5 hover:bg-slate-50 text-slate-600 rounded"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Item unit and total price */}
                      <div className="text-left font-mono shrink-0">
                        <span className="text-gray-400 text-[10px] block font-sans">قیمت واحد: {formatPrice(item.price)}</span>
                        <strong className="text-xs text-gray-900 block font-black">{formatPrice(itemTotal)}</strong>
                      </div>

                      {/* delete heart bin button */}
                      <button 
                        onClick={() => onRemoveCartItem(item.productId, item.variationId)}
                        className="p-2 text-gray-350 hover:text-red-650 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                        title="پاک‌کردن از سبد"
                        id={`delete-cart-item-${item.productId}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                    </div>

                  </div>
                );
              })}
            </div>
            
            {/* Clear all footer action bars */}
            <div className="bg-gray-50/50 p-4 border-t border-gray-50 flex items-center justify-between">
              <button 
                onClick={() => onNavigate("shop")}
                className="text-[11px] text-emerald-650 font-bold hover:underline cursor-pointer flex items-center gap-1"
              >
                <ArrowRight className="w-4 h-4" />
                <span>ادامه خرید و افزودن کالاها</span>
              </button>
              
              <button 
                onClick={onClearCart}
                className="text-[11px] text-red-600 font-bold hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>خالی کردن کل سبد خرید</span>
              </button>
            </div>
          </div>

          {/* safety guarantee check labels */}
          <div className="p-4 bg-emerald-50/40 border border-emerald-150 rounded-2xl flex items-center gap-3">
            <ShieldCheck className="w-6 h-6 text-emerald-600 shrink-0" />
            <div className="text-[11px] text-emerald-800 leading-relaxed text-right">
              <strong className="font-bold block mb-0.5">ضمانت خرید ایمن با آریا شاپ</strong>
              سفارشات شما با رعایت کامل پروتکل‌های بهداشتی، بسته‌بندی پددار حباب‌گیر و تحویل فوری به مأمورین زبده اداره پست کشور ارسال خواهد شد.
            </div>
          </div>

        </div>

        {/* Invoice and Coupon ledger Column (right) */}
        <div className="lg:col-span-1 space-y-6 text-right">
          
          {/* Coupon promotion entering card block */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-black text-gray-900 border-r-2 border-emerald-600 pr-2">کود تخفیف / کوپن هدیه</h3>
            
            {couponError && <p className="text-[10px] text-red-650 font-bold">⚠️ {couponError}</p>}
            {couponSuccess && <p className="text-[10px] text-emerald-650 font-semibold">✓ {couponSuccess}</p>}
            {coupon && (
              <div className="p-2.5 bg-emerald-50 border border-emerald-150 rounded-xl text-[10px] text-emerald-800 font-black flex items-center justify-between font-mono">
                <span>کوپن اعمال شده: {coupon.code}</span>
                <span>تخفیف مادی اعمال شد</span>
              </div>
            )}

            <form onSubmit={handleApplyCouponClick} className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="مثال: SPRING20"
                  value={couponInput}
                  onChange={e => setCouponInput(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl p-2.5 pl-4 pr-9 text-xs text-left font-mono bg-gray-50 focus:bg-white uppercase focus:outline-none"
                />
                <Tag className="w-4 h-4 text-gray-400 absolute right-3 top-3.5" />
              </div>
              <button 
                type="submit" 
                disabled={loadingCoupon}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-100 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors"
              >
                {loadingCoupon ? "..." : "اعمال"}
              </button>
            </form>
          </div>

          {/* Invoice pricing ledger calculation block */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-4 text-xs">
            <h3 className="font-black text-gray-950 pb-2 border-b border-gray-50">فاکتور نهایی سبد کالاها</h3>
            
            <div className="space-y-3 font-mono">
              <div className="flex items-center justify-between">
                <span className="text-gray-450 font-sans">جمع اقلام سبد:</span>
                <span className="text-gray-800 font-bold">{formatPrice(subTotal)}</span>
              </div>
              
              {discountAmount > 0 && (
                <div className="flex items-center justify-between text-rose-500">
                  <span className="font-sans">مبلغ کسر تخفیف:</span>
                  <span className="font-bold">-{formatPrice(discountAmount)}</span>
                </div>
              )}

              <div className="flex items-center justify-between">
                <span className="text-gray-450 font-sans">هزینه ارسال پستی:</span>
                <span className="text-gray-800 font-bold">
                  {shippingCost === 0 ? "رایگان (بونوس شرکت)" : formatPrice(shippingCost)}
                </span>
              </div>

              {shippingCost > 0 && (
                <p className="text-[10px] text-gray-400 font-sans leading-relaxed pt-1 select-none">
                  * برای دلیوری رایگان، مبل خرید خود را به میزان <strong className="font-bold text-gray-500">{formatPrice(shippingThreshold)}</strong> ارتقا دهید.
                </p>
              )}

              <hr className="border-gray-100" />
              
              <div className="flex items-center justify-between text-emerald-700 font-black text-sm pt-2">
                <span className="font-sans">مبلغ قابل پرداخت نهایی:</span>
                <span>{formatPrice(finalTotal)}</span>
              </div>
            </div>

            <button
              onClick={() => onNavigate("checkout")}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl text-center cursor-pointer transition-transform duration-100 hover:scale-[1.02] shadow-lg shadow-emerald-100"
              id="checkout-proceed-btn"
            >
              ورود به مرحله آدرس و تایید خرید →
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
