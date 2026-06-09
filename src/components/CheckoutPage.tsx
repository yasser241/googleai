/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { CreditCard, Truck, MapPin, ClipboardList, ShieldAlert, CheckCircle, Smartphone } from "lucide-react";
import { User, Address, Order } from "../types";
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

interface CheckoutPageProps {
  user: User;
  cartItems: CartItem[];
  coupon: any | null;
  onClearCart: () => void;
  onNavigate: (view: string, params?: any) => void;
}

export default function CheckoutPage({
  user,
  cartItems,
  coupon,
  onClearCart,
  onNavigate
}: CheckoutPageProps) {
  const [step, setStep] = useState<"address" | "payment" | "shaparak" | "success">("address");
  
  // States info
  const [selectedAddrId, setSelectedAddrId] = useState<string>(
    user.addresses?.find(a => a.isDefault)?.id || user.addresses?.[0]?.id || ""
  );

  // Instant address form if user doesn't have address
  const [newAddrTitle, setNewAddrTitle] = useState("نشانی منزل");
  const [newAddrName, setNewAddrName] = useState(`${user.name} ${user.lastName || ""}`);
  const [newAddrPhone, setNewAddrPhone] = useState(user.phone);
  const [newAddrProvince, setNewAddrProvince] = useState("تهران");
  const [newAddrCity, setNewAddrCity] = useState("تهران");
  const [newAddrPostal, setNewAddrPostal] = useState("");
  const [newAddrFull, setNewAddrFull] = useState("");

  const [shippingMethod, setShippingMethod] = useState<"post" | "tipax">("post");
  const [paymentMethod, setPaymentMethod] = useState<"online" | "cod">("online");
  const [orderNotes, setOrderNotes] = useState("");

  // Shaparak mock portal card states
  const [cardNumber, setCardNumber] = useState("");
  const [cardCvv2, setCardCvv2] = useState("");
  const [cardMonth, setCardMonth] = useState("");
  const [cardYear, setCardYear] = useState("");
  const [cardCaptcha, setCardCaptcha] = useState("");
  const [cardPin, setCardPin] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpVal, setOtpVal] = useState("");

  // Created Order response after API save
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);

  // Pricing values recalculation
  const subTotal = cartItems.reduce((acc, item) => acc + item.price * item.count, 0);
  
  let discountAmount = 0;
  if (coupon) {
    if (coupon.type === "percent") {
      discountAmount = Math.round((subTotal * coupon.value) / 100);
    } else {
      discountAmount = coupon.value;
    }
  }

  const shippingCost = shippingMethod === "tipax" ? 75000 : subTotal >= 2500000 ? 0 : 45000;
  const finalTotal = Math.max(0, subTotal - discountAmount + shippingCost);

  // Address picker resolver
  const getDeliveryAddress = (): Address => {
    const predefined = user.addresses?.find(a => a.id === selectedAddrId);
    if (predefined) return predefined;
    return {
      id: "instant",
      title: newAddrTitle,
      probeName: newAddrName,
      probePhone: newAddrPhone,
      province: newAddrProvince,
      city: newAddrCity,
      postalCode: newAddrPostal,
      addressFull: newAddrFull,
      isDefault: true
    };
  };

  const handleProceedToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    // Validate if any address exists or typed
    const delivery = getDeliveryAddress();
    if (!delivery.addressFull || !delivery.probeName || !delivery.probePhone) {
      alert("لطفا ابتدا مشخصات آدرس کامل تحویل کالا را تکمیل فرمایید.");
      return;
    }
    setStep("payment");
  };

  const handleFinalizeCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (paymentMethod === "online") {
      setStep("shaparak");
    } else {
      // Cash on Delivery direct submit
      submitOrderToBackend("cod");
    }
  };

  const submitOrderToBackend = (method: "online" | "cod", refNum?: string) => {
    const delivery = getDeliveryAddress();
    const orderPayload = {
      userEmail: user.email,
      userName: `${user.name} ${user.lastName || ""}`,
      userPhone: user.phone,
      items: cartItems.map(item => ({
        productId: item.productId,
        variationId: item.variationId,
        title: item.title,
        image: item.image,
        sku: item.sku,
        price: item.price,
        count: item.count,
        selectedAttributes: item.selectedAttributes
      })),
      subTotal,
      discountAmount,
      shippingCost,
      finalTotal,
      shippingAddress: delivery,
      shippingMethod,
      paymentMethod: method,
      paymentStatus: method === "online" ? "paid" : "unpaid",
      trackingCode: "",
      paymentReference: refNum || "",
      adminNotes: orderNotes ? `یاداشت مشتری: ${orderNotes}` : ""
    };

    fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(orderPayload)
    })
      .then(res => res.json())
      .then(data => {
        if (data.order) {
          setCreatedOrder(data.order);
          onClearCart();
          setStep("success");
        }
      })
      .catch(err => console.error(err));
  };

  // Mock Shaparak card operations
  const handleShaparakPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (cardNumber.length < 16) {
      alert("شماره کارت ۱۶ رقمی معتبر وارد نمایید.");
      return;
    }
    // Simulation success transaction reference key
    const mockRef = `AR-TX-${Math.floor(100000 + Math.random() * 900000)}`;
    submitOrderToBackend("online", mockRef);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 font-sans" id="checkout-container-view">
      
      {/* Visual checkout stepper progress bar */}
      {step !== "shaparak" && (
        <div className="flex items-center justify-center gap-4 mb-10 select-none text-xs font-bold text-gray-400">
          <div className={`flex items-center gap-1.5 ${step === "address" ? "text-emerald-600" : ""}`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center border ${step === "address" ? "bg-emerald-50 border-emerald-500" : ""}`}>۱</span>
            <span>آدرس گیرنده</span>
          </div>
          <span className="text-gray-200">------</span>
          <div className={`flex items-center gap-1.5 ${step === "payment" ? "text-emerald-600" : ""}`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center border ${step === "payment" ? "bg-emerald-50 border-emerald-500" : ""}`}>۲</span>
            <span>روش دلیوری و پرداخت</span>
          </div>
          <span className="text-gray-200">------</span>
          <div className={`flex items-center gap-1.5 ${step === "success" ? "text-emerald-600" : ""}`}>
            <span className="w-6 h-6 rounded-full flex items-center justify-center border">۳</span>
            <span>تایید خرید</span>
          </div>
        </div>
      )}

      {/* STEP 1: SHPPING ADREESS FORM */}
      {step === "address" && (
        <form onSubmit={handleProceedToPayment} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2 bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-6 text-right">
            <h3 className="font-extrabold text-xs text-gray-900 border-r-2 border-emerald-600 pr-2">تعیین و هماهنگ‌سازی مکان جغرافیایی تحویل</h3>

            {user.addresses && user.addresses.length > 0 ? (
              /* If user has predefined address catalogs */
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {user.addresses.map((a) => (
                  <label 
                    key={a.id} 
                    className={`border p-5 rounded-2xl block relative cursor-pointer hover:border-emerald-250 transition-all ${selectedAddrId === a.id ? "border-emerald-600 bg-emerald-50/20" : "border-gray-100 bg-white"}`}
                  >
                    <input 
                      type="radio" 
                      name="selected_addr" 
                      value={a.id} 
                      checked={selectedAddrId === a.id}
                      onChange={() => setSelectedAddrId(a.id)}
                      className="absolute left-4 top-4 text-emerald-600 focus:ring-emerald-500" 
                    />
                    <strong className="text-xs text-gray-800 font-extrabold pr-4 block mb-2">{a.title}</strong>
                    <p className="text-[11px] text-gray-500 leading-relaxed pr-4">
                      گیرنده: {a.probeName} <br />
                      تلفن: {toPersianDigits(a.probePhone)} <br />
                      نشانی: {a.province}، {a.city}، {a.addressFull} <br />
                      کد پستی: <span className="font-mono">{toPersianDigits(a.postalCode)}</span>
                    </p>
                  </label>
                ))}
              </div>
            ) : (
              /* If no addresses, render direct address fields */
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4 text-xs">
                  <div>
                    <label className="text-gray-400 block mb-1">عنوان نشانی</label>
                    <input type="text" value={newAddrTitle} onChange={e => setNewAddrTitle(e.target.value)} required className="w-full border border-gray-200 rounded-xl p-2.5 text-right font-bold bg-gray-50" />
                  </div>
                  <div>
                    <label className="text-gray-400 block mb-1">نام گیرنده *</label>
                    <input type="text" value={newAddrName} onChange={e => setNewAddrName(e.target.value)} required className="w-full border border-gray-200 rounded-xl p-2.5 text-right bg-gray-50" />
                  </div>
                  <div>
                    <label className="text-gray-400 block mb-1">موبایل گیرنده *</label>
                    <input type="text" value={newAddrPhone} onChange={e => setNewAddrPhone(e.target.value)} required className="w-full border border-gray-200 rounded-xl p-2.5 text-right bg-gray-50 font-mono text-left" />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 text-xs">
                  <div>
                    <label className="text-gray-400 block mb-1">استان تحویل گیرنده *</label>
                    <input type="text" value={newAddrProvince} onChange={e => setNewAddrProvince(e.target.value)} required className="w-full border border-gray-200 rounded-xl p-2.5 text-right bg-gray-50" />
                  </div>
                  <div>
                    <label className="text-gray-400 block mb-1">شهر *</label>
                    <input type="text" value={newAddrCity} onChange={e => setNewAddrCity(e.target.value)} required className="w-full border border-gray-200 rounded-xl p-2.5 text-right bg-gray-50" />
                  </div>
                  <div>
                    <label className="text-gray-400 block mb-1">کد پستی ۱۰ ده رقمی</label>
                    <input type="text" value={newAddrPostal} onChange={e => setNewAddrPostal(e.target.value)} className="w-full border border-gray-200 rounded-xl p-2.5 text-right bg-gray-50 font-mono text-left bg-gray-50" />
                  </div>
                </div>

                <div className="text-xs">
                  <label className="text-gray-400 block mb-1">آدرس دقیق پستی حمل‌و‌نقل (پلاک، واحد، پورتال) *</label>
                  <textarea value={newAddrFull} onChange={e => setNewAddrFull(e.target.value)} required rows={3} className="w-full border border-gray-200 rounded-xl p-2.5 text-right bg-gray-50" placeholder="مثال: چهارراه ولیعصر، خیابان بزرگمهر..." />
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-gray-50 text-xs">
              <label className="text-gray-400 block mb-1">یادداشت برای ادمین یا پیک‌موتوری (اختیاری)</label>
              <textarea value={orderNotes} onChange={e => setOrderNotes(e.target.value)} rows={2} className="w-full border border-gray-200 rounded-xl p-2.5 text-right bg-gray-50" placeholder="مثلا: لطفا زنگ شماره ۴ واحد همکف زده شود..." />
            </div>

          </div>

          {/* Simple invoice review ledger column */}
          <div className="lg:col-span-1 bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-4 text-right text-xs">
            <h3 className="font-black text-gray-950 pb-2 border-b border-gray-50">خلاصه سفارش جاری</h3>
            <div className="divide-y divide-gray-50 space-y-2">
              {cartItems.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between py-1 bg-white">
                  <div>
                    <span className="font-bold text-gray-900 block">{item.title}</span>
                    <span className="text-[10px] text-gray-400">تعداد کالا: {toPersianDigits(item.count)} عدد</span>
                  </div>
                  <strong className="font-mono text-gray-700">{formatPrice(item.price * item.count)}</strong>
                </div>
              ))}
            </div>

            <hr className="border-gray-100" />
            <div className="flex items-center justify-between text-emerald-700 font-extrabold">
              <span>کل سفارش (با بونوس):</span>
              <span className="font-mono">{formatPrice(finalTotal)}</span>
            </div>

            <button 
              type="submit"
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black text-center cursor-pointer"
            >
              مرحله بعدی (روش دریافت و تسویه) →
            </button>
          </div>

        </form>
      )}

      {/* STEP 2: SHIPPING AND DISPATCH METHODS PICKER */}
      {step === "payment" && (
        <form onSubmit={handleFinalizeCheckout} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2 space-y-6 text-right">
            
            {/* Courier Choice picker */}
            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-4">
              <h3 className="font-extrabold text-xs text-gray-900 border-r-2 border-emerald-650 pr-2">۱. انتخاب نوع و شیوه دبلوری مرسوله</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                <label className={`border p-4 rounded-xl relative cursor-pointer block ${shippingMethod === "post" ? "border-emerald-600 bg-emerald-50/20" : "border-gray-100 bg-white"}`}>
                  <input type="radio" name="sh_method" value="post" checked={shippingMethod === "post"} onChange={() => setShippingMethod("post")} className="absolute left-4 top-4" />
                  <strong className="text-xs text-gray-800 font-black flex items-center gap-1.5 pr-4 mb-1">
                    <Truck className="w-4 h-4 text-emerald-600" />
                    <span>مأمور پست پیشتاز جمهوری اسلامی</span>
                  </strong>
                  <p className="text-[10px] text-gray-400 pr-4 leading-relaxed">تحویل طی ۳ تا ۵ روز کاری | هزینه دلیوری مادی: {subTotal >= 2500000 ? "رایگان سیستم" : "۴۵,۰۰۰ تومان"}</p>
                </label>

                <label className={`border p-4 rounded-xl relative cursor-pointer block ${shippingMethod === "tipax" ? "border-emerald-600 bg-emerald-50/20" : "border-gray-100 bg-white"}`}>
                  <input type="radio" name="sh_method" value="tipax" checked={shippingMethod === "tipax"} onChange={() => setShippingMethod("tipax")} className="absolute left-4 top-4" />
                  <strong className="text-xs text-gray-800 font-black flex items-center gap-1.5 pr-4 mb-1">
                    <Truck className="w-4 h-4 text-amber-500 animate-pulse" />
                    <span>پیک اکسپرس سریع تیپاکس (هوایی)</span>
                  </strong>
                  <p className="text-[10px] text-gray-400 pr-4 leading-relaxed">تحویل ۲۴ ساعت آینده به محض خروج از دپو | هزینه: ۷۵,۰۰۰ تومان</p>
                </label>

              </div>
            </div>

            {/* Payment Gateway choice picker */}
            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-4">
              <H3_WITH_BORDER label="۲. شیوه تسویه حساب و فاکتور نهایی" />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                <label className={`border p-4 rounded-xl relative cursor-pointer block ${paymentMethod === "online" ? "border-emerald-600 bg-emerald-50/20" : "border-gray-100 bg-white"}`}>
                  <input type="radio" name="pay_method" value="online" checked={paymentMethod === "online"} onChange={() => setPaymentMethod("online")} className="absolute left-4 top-4" />
                  <strong className="text-xs text-gray-800 font-black flex items-center gap-1.5 pr-4 mb-1">
                    <CreditCard className="w-4 h-4 text-emerald-600" />
                    <span>درگاه پرداخت بانک آنلاین (کارت شتاب)</span>
                  </strong>
                  <p className="text-[10px] text-gray-400 pr-4 leading-relaxed">اتصال به درگاه آنلاین بانکی شاپرک با امنیت ۲۵۶ بیت و هدیه بونوس نقدی</p>
                </label>

                <label className={`border p-4 rounded-xl relative cursor-pointer block ${paymentMethod === "cod" ? "border-emerald-600 bg-emerald-50/20" : "border-gray-100 bg-white"}`}>
                  <input type="radio" name="pay_method" value="cod" checked={paymentMethod === "cod"} onChange={() => setPaymentMethod("cod")} className="absolute left-4 top-4" />
                  <strong className="text-xs text-gray-800 font-black flex items-center gap-1.5 pr-4 mb-1">
                    <CreditCard className="w-4 h-4 text-slate-500" />
                    <span>کارتخوان دستی به مأمور پست (در محل)</span>
                  </strong>
                  <p className="text-[10px] text-gray-400 pr-4 leading-relaxed">تسویه حساب فیزیکی درب منزل شما پس از بررسی کارتن سالم</p>
                </label>

              </div>
            </div>

          </div>

          <div className="lg:col-span-1 bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-4 text-xs text-right">
            <h3 className="font-extrabold text-gray-950 pb-2 border-b border-gray-50">تسویه و محاسبه نهایی</h3>
            
            <div className="space-y-2.5 font-mono">
              <div className="flex items-center justify-between">
                <span>جمع کل خرید:</span>
                <span>{formatPrice(subTotal)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex items-center justify-between text-rose-500">
                  <span>تخفیف کوپن:</span>
                  <span>-{formatPrice(discountAmount)}</span>
                </div>
              )}
              <div className="flex items-center justify-between font-sans">
                <span>هزینه دلیوری:</span>
                <span>{shippingCost === 0 ? "رایگان" : `${toPersianDigits(shippingCost.toLocaleString())} تومان`}</span>
              </div>
              <hr className="border-gray-100" />
              <div className="flex items-center justify-between text-emerald-700 font-extrabold text-sm pt-2">
                <span>مبلغ نهایی پرداختی:</span>
                <span>{formatPrice(finalTotal)}</span>
              </div>
            </div>

            <button 
              type="submit"
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black cursor-pointer text-center shadow-lg shadow-emerald-100/55"
              id="finalize-billing-btn"
            >
              {paymentMethod === "online" ? "اتصال به درگاه امن بانکی" : "ثبت نهایی خرید درب منزل"}
            </button>
          </div>

        </form>
      )}

      {/* STEP 3: HIGH-FIDELITY SHAPARAK ELECTRONIC PORTAL (MOCK) */}
      {step === "shaparak" && (
        <div className="max-w-4xl mx-auto bg-[#e1e2e6] rounded-3xl overflow-hidden shadow-2xl p-3 md:p-6 border border-gray-300" id="shaparak-iframe-portal">
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x md:divide-x-reverse divide-gray-200 text-right">
            
            {/* Shaparak Left side form inputs */}
            <form onSubmit={handleShaparakPayment} className="flex-1 p-6 space-y-5 text-xs text-gray-700">
              
              <div className="flex items-center gap-2 pb-3 border-b border-gray-100 justify-between">
                <div>
                  <h2 className="text-sm font-black text-blue-900">درگاه پرداخت اینترنتی به پرداخت ملت</h2>
                  <span className="text-[10px] text-gray-400 font-bold tracking-wider">Aria Electronic Payment Gateway System</span>
                </div>
                <div className="w-12 h-12 bg-rose-500 rounded-xl flex items-center justify-center text-white text-md font-black">ملت</div>
              </div>

              {/* Enter card number digits */}
              <div>
                <label className="text-gray-550 block mb-1.5 font-bold">شماره کارت ۱۶ رقمی شتاب *</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    maxLength={16}
                    placeholder="6104 3378 ...."
                    value={cardNumber}
                    onChange={e => setCardNumber(e.target.value.replace(/\D/g, ""))}
                    className="w-full border border-gray-300 rounded-xl p-3 text-left font-mono text-xs focus:ring-blue-500 focus:border-blue-500 tracking-widest text-slate-800"
                  />
                  <CreditCard className="w-5 h-5 text-gray-400 absolute right-3 top-3.5" />
                </div>
              </div>

              {/* CVV2 and Dates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-555 block mb-1 font-semibold">کد امنیتی CVV2 *</label>
                  <input
                    type="password"
                    required
                    maxLength={4}
                    value={cardCvv2}
                    onChange={e => setCardCvv2(e.target.value.replace(/\D/g, ""))}
                    className="w-full border border-gray-300 rounded-xl p-3 text-center font-mono tracking-widest text-slate-800"
                    placeholder="***"
                  />
                </div>
                <div>
                  <label className="text-gray-555 block mb-1 font-semibold">تاریخ انقضای کارت *</label>
                  <div className="flex gap-2 text-center font-mono focus-within:ring-1">
                    <input type="text" required maxLength={2} placeholder="ماه" value={cardMonth} onChange={e => setCardMonth(e.target.value.replace(/\D/g, ""))} className="w-16 border rounded-xl p-2.5 text-center text-slate-805" />
                    <span className="text-md font-black text-gray-400">/</span>
                    <input type="text" required maxLength={2} placeholder="سال" value={cardYear} onChange={e => setCardYear(e.target.value.replace(/\D/g, ""))} className="w-16 border rounded-xl p-2.5 text-center text-slate-805" />
                  </div>
                </div>
              </div>

              {/* Captcha validation inputs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                <div>
                  <label className="text-gray-555 block mb-1 font-semibold">کد امنیتی تصویری *</label>
                  <input
                    type="text"
                    required
                    value={cardCaptcha}
                    onChange={e => setCardCaptcha(e.target.value)}
                    placeholder="کد مقابل را بنویسید"
                    className="w-full border border-gray-300 rounded-xl p-3 text-center"
                  />
                </div>
                <div className="bg-gray-100 p-2 text-center rounded-xl font-mono text-sm tracking-widest select-none font-bold text-gray-700 border flex items-center justify-center h-11">
                  1 9 4 5
                </div>
              </div>

              {/* OTP pin code sending */}
              <div className="border bg-slate-50 p-4 rounded-2xl flex items-center justify-between">
                <div>
                  <strong className="text-xs font-bold text-slate-800 block">رمز دوم پویا (پیامکی)</strong>
                  <p className="text-[10px] text-gray-400 mt-1 max-w-[190px]">زمان تقاضا برای پین پورتال پستی</p>
                </div>
                {otpSent ? (
                  <div className="flex items-center gap-1.5 font-mono">
                    <input type="text" maxLength={6} value={otpVal} onChange={e => setOtpVal(e.target.value)} placeholder="رمز دوم" className="w-20 border rounded-lg p-2 text-center text-xs text-slate-800 bg-white" />
                    <span className="text-[10px] text-emerald-600 font-bold font-sans">ارسال شد</span>
                  </div>
                ) : (
                  <button 
                    type="button" 
                    onClick={() => setOtpSent(true)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[10px] font-bold cursor-pointer"
                  >
                    ارسال پیامک رمز پویا
                  </button>
                )}
              </div>

              {/* shaparak buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-4">
                <button 
                  type="button" 
                  onClick={() => setStep("payment")} 
                  className="px-5 py-3 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-xl cursor-pointer"
                >
                  انصراف و بازگشت
                </button>
                <button 
                  type="submit" 
                  className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold cursor-pointer transition-colors shadow-md"
                >
                  پرداخت نهایی و ثبت خرید
                </button>
              </div>

            </form>

            {/* Shaparak Right side order metadata */}
            <div className="w-full md:w-72 p-6 bg-slate-50 space-y-4 text-xs text-gray-655 flex flex-col justify-between">
              <div>
                <h3 className="font-extrabold text-blue-900 border-b pb-2 mb-4">جزئیات پذیرنده تراکنش</h3>
                <ul className="space-y-3 font-mono">
                  <li className="flex items-center justify-between border-b pb-1.5 border-gray-150">
                    <span className="font-sans">نام پذیرنده:</span>
                    <strong className="text-gray-900 font-sans font-bold">فروشگاه زنجیره‌ای آریا</strong>
                  </li>
                  <li className="flex items-center justify-between border-b pb-1.5 border-gray-150">
                    <span className="font-sans">کد ترمینال شتاب:</span>
                    <strong className="text-gray-900">194827110</strong>
                  </li>
                  <li className="flex items-center justify-between">
                    <span className="font-sans">مبلغ قابل کسر:</span>
                    <strong className="text-emerald-700 text-sm font-black">{formatPrice(finalTotal)}</strong>
                  </li>
                </ul>
              </div>

              <div className="p-3.5 bg-yellow-50 border border-yellow-200 text-[10px] text-yellow-800 rounded-xl leading-relaxed flex items-center gap-1.5 select-none font-bold">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>برای امنیت مادی، کارت خود را افشا نکنید و کیبورد مجازی را فعال نمایید.</span>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* STEP 4: TRANSACTION SUCCESS DIRECT CONFIRMATION */}
      {step === "success" && createdOrder && (
        <div className="max-w-2xl mx-auto bg-white border border-gray-100 rounded-3xl shadow-xl p-8 text-center space-y-6 font-sans animate-in zoom-in-95 duration-150">
          <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full mx-auto flex items-center justify-center border-2 border-emerald-100 mt-2">
            <CheckCircle className="w-8 h-8 fill-emerald-100 text-emerald-600" />
          </div>
          <div className="space-y-2">
            <h2 className="text-md font-black text-slate-900">سفارش شما با موفقیت ثبت شد!</h2>
            <p className="text-xs text-gray-400">فاکتور خرید کالاها آماده نظارت توسط دپارتمان تدارکات آریا می‌باشد.</p>
          </div>

          <div className="bg-gray-50 rounded-2xl p-5 border text-right text-xs max-w-sm mx-auto space-y-3 font-mono">
            <div className="flex items-center justify-between text-gray-500">
              <span className="font-sans">شماره سفارش:</span>
              <strong className="text-gray-900 font-black">{createdOrder.orderNumber}</strong>
            </div>
            <div className="flex items-center justify-between text-gray-500">
              <span className="font-sans">مبلغ کل تسویه شده:</span>
              <strong className="text-emerald-700 font-black">{formatPrice(createdOrder.finalTotal)}</strong>
            </div>
            <div className="flex items-center justify-between text-gray-500">
              <span className="font-sans">وضعیت پرداخت:</span>
              <strong className="text-gray-800 font-sans font-semibold">بسته آنلاین تسویه شده</strong>
            </div>
          </div>

          <p className="text-[10px] text-gray-400 leading-relaxed max-w-sm mx-auto select-none pt-2">
            کد رهگیری پستی و ارسال استاتوس‌های آماده‌سازی و ارسال با مأمور تا ۲۴ ساعت آینده به تلفن همراه <strong className="font-bold text-gray-500">{toPersianDigits(user.phone)}</strong> اعلام خواهد شد.
          </p>

          <div className="flex gap-3 justify-center pt-4">
            <button
               onClick={() => onNavigate("profile", { activeTab: "orders" })}
               className="px-6 py-3 bg-slate-900 hover:bg-slate-950 text-white text-xs font-bold rounded-xl cursor-pointer"
            >
              مشاهده فاکتور در پنل کاربری
            </button>
            <button
               onClick={() => onNavigate("home")}
               className="px-6 py-3 border border-gray-200 text-gray-650 hover:bg-gray-50 text-xs font-bold rounded-xl cursor-pointer"
            >
              بازگشت به صفحه اصلی
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

// Subordinate headers helper
function H3_WITH_BORDER({ label }: { label: string }) {
  return (
    <h3 className="font-extrabold text-xs text-gray-900 border-r-2 border-emerald-650 pr-2 block">
      {label}
    </h3>
  );
}
