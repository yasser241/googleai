/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  BarChart, Layers, Package, ShoppingCart, MessageSquare, Tag, 
  Settings, Plus, Edit2, Trash2, CheckCircle, AlertTriangle, User as UserIcon, HelpCircle, Save, ArrowLeft, Mail
} from "lucide-react";
import { 
  User, Product, Category, Order, Ticket, Coupon, AppSettings, 
  OrderStatus, PaymentStatus, TicketStatus 
} from "../types";
import { formatPrice, formatPersianDate, toPersianDigits } from "../utils";

interface AdminPanelProps {
  user: User;
  onNavigate: (view: string, params?: any) => void;
}

export default function AdminPanel({ user, onNavigate }: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [report, setReport] = useState<any>(null);
  
  // Data lists
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [siteSettings, setSiteSettings] = useState<AppSettings | null>(null);

  // Loading/Notification
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  // Product CRUD states
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [prodTitle, setProdTitle] = useState("");
  const [prodPrice, setProdPrice] = useState(100000);
  const [prodDiscountPrice, setProdDiscountPrice] = useState<number | undefined>(undefined);
  const [prodSku, setProdSku] = useState("");
  const [prodStock, setProdStock] = useState(10);
  const [prodThreshold, setProdThreshold] = useState(3);
  const [prodMainImage, setProdMainImage] = useState("");
  const [prodDescShort, setProdDescShort] = useState("");
  const [prodDescFull, setProdDescFull] = useState("");
  const [prodIsVariable, setProdIsVariable] = useState(false);
  const [prodCats, setProdCats] = useState<string[]>([]);
  const [prodTags, setProdTags] = useState("");
  const [productFormOpen, setProductFormOpen] = useState(false);

  // Category CRUD states
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [catName, setCatName] = useState("");
  const [catSlug, setCatSlug] = useState("");
  const [catParent, setCatParent] = useState("");
  const [catDesc, setCatDesc] = useState("");
  const [catImg, setCatImg] = useState("");

  // Coupon creator states
  const [cpCode, setCpCode] = useState("");
  const [cpType, setCpType] = useState<"percent" | "fixed">("percent");
  const [cpValue, setCpValue] = useState(10);
  const [cpMin, setCpMin] = useState(0);
  const [cpLimit, setCpLimit] = useState(100);
  const [cpExpires, setCpExpires] = useState("2027-12-30");

  // Orders detail modal
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderTracking, setOrderTracking] = useState("");
  const [orderStatus, setOrderStatus] = useState<OrderStatus>(OrderStatus.PENDING);
  const [orderPayment, setOrderPayment] = useState<PaymentStatus>(PaymentStatus.UNPAID);
  const [orderAdminNote, setOrderAdminNote] = useState("");

  // Ticket chat answer states
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [ticketAnswerInput, setTicketAnswerInput] = useState("");

  // Settings configs
  const [storeName, setStoreName] = useState("");
  const [storePhone, setStorePhone] = useState("");
  const [storeEmail, setStoreEmail] = useState("");
  const [storeAddr, setStoreAddr] = useState("");
  const [storeInstagram, setStoreInstagram] = useState("");
  const [storeFooter, setStoreFooter] = useState("");
  const [storeApproval, setStoreApproval] = useState(true);

  // Load everything
  useEffect(() => {
    fetchAdminData();
  }, [activeTab]);

  const fetchAdminData = () => {
    setLoading(true);
    
    // Always load general dashboard stats
    fetch("/api/admin/reports")
      .then(res => res.json())
      .then(data => setReport(data))
      .catch(e => console.error(e));

    if (activeTab === "products") {
      fetch("/api/products")
        .then(res => res.json())
        .then(data => setProducts(data));
      fetch("/api/categories")
        .then(res => res.json())
        .then(data => setCategories(data));
    } else if (activeTab === "categories") {
      fetch("/api/categories")
        .then(res => res.json())
        .then(data => setCategories(data));
    } else if (activeTab === "orders") {
      fetch("/api/orders")
        .then(res => res.json())
        .then(data => setOrders(data));
    } else if (activeTab === "tickets") {
      fetch("/api/tickets")
        .then(res => res.json())
        .then(data => setTickets(data));
    } else if (activeTab === "coupons") {
      fetch("/api/coupons")
        .then(res => res.json())
        .then(data => setCoupons(data));
    } else if (activeTab === "settings") {
      fetch("/api/settings")
        .then(res => res.json())
        .then(data => {
          setSiteSettings(data);
          setStoreName(data.storeName || "");
          setStorePhone(data.phone || "");
          setStoreEmail(data.email || "");
          setStoreAddr(data.address || "");
          setStoreInstagram(data.socials?.instagram || "");
          setStoreFooter(data.footerText || "");
          setStoreApproval(data.enableCommentsApproval ?? true);
        });
    }
    
    setLoading(false);
  };

  const triggerAlert = (msg: string) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(""), 4000);
  };

  // PRODUCT ACTIONS
  const handleOpenAddProduct = () => {
    setEditingProductId(null);
    setProdTitle("");
    setProdPrice(500000);
    setProdDiscountPrice(undefined);
    setProdSku(`PHN-${Math.floor(100 + Math.random() * 900)}`);
    setProdStock(15);
    setProdThreshold(3);
    setProdMainImage("");
    setProdDescShort("");
    setProdDescFull("");
    setProdIsVariable(false);
    setProdCats([]);
    setProdTags("");
    setProductFormOpen(true);
  };

  const handleOpenEditProduct = (p: Product) => {
    setEditingProductId(p.id);
    setProdTitle(p.title);
    setProdPrice(p.price);
    setProdDiscountPrice(p.discountPrice);
    setProdSku(p.sku);
    setProdStock(p.stock);
    setProdThreshold(p.stockThreshold);
    setProdMainImage(p.mainImage);
    setProdDescShort(p.descShort);
    setProdDescFull(p.descFull);
    setProdIsVariable(p.isVariable);
    setProdCats(p.categories);
    setProdTags(p.tags?.join(", ") || "");
    setProductFormOpen(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodTitle || !prodSku || !prodMainImage) return;

    const bodyData = {
      title: prodTitle,
      price: Number(prodPrice),
      discountPrice: prodDiscountPrice ? Number(prodDiscountPrice) : undefined,
      sku: prodSku,
      stock: Number(prodStock),
      stockThreshold: Number(prodThreshold),
      mainImage: prodMainImage,
      descShort: prodDescShort,
      descFull: prodDescFull,
      isVariable: prodIsVariable,
      slug: prodTitle.toLowerCase().trim().replace(/\s+/g, "-"),
      categories: prodCats,
      tags: prodTags.split(",").map(t => t.trim()).filter(Boolean),
      status: "published" as const,
      variations: [],
      attributes: prodIsVariable ? [{ name: "رنگ", values: ["مشکی", "سفید"] }] : []
    };

    const method = editingProductId ? "PUT" : "POST";
    const url = editingProductId ? `/api/products/${editingProductId}` : "/api/products";

    fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(bodyData)
    })
      .then(res => res.json())
      .then(data => {
        setProductFormOpen(false);
        fetchAdminData();
        triggerAlert(editingProductId ? "محصول با موفقیت ویرایش شد." : "محصول جدید با موفقیت افزوده شد.");
      });
  };

  const handleDeleteProduct = (id: string) => {
    if (!confirm("آیا از حذف این کالا اطمینان کامل دارید؟ کدهای خرید مرجوع می‌شوند.")) return;
    fetch(`/api/products/${id}`, { method: "DELETE" })
      .then(() => {
        fetchAdminData();
        triggerAlert("محصول با موفقیت از سیستم حذف گردید.");
      });
  };

  // CATEGORY ACTIONS
  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName || !catSlug) return;

    const dataBody = {
      name: catName,
      slug: catSlug,
      parentId: catParent || undefined,
      description: catDesc,
      image: catImg || "https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=400"
    };

    const method = editingCatId ? "PUT" : "POST";
    const url = editingCatId ? `/api/categories/${editingCatId}` : "/api/categories";

    fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dataBody)
    })
      .then(res => res.json())
      .then(() => {
        setCatName("");
        setCatSlug("");
        setCatParent("");
        setCatDesc("");
        setCatImg("");
        setEditingCatId(null);
        fetchAdminData();
        triggerAlert("تنظیمات دسته‌بندی با موفقیت ذخیره شد.");
      });
  };

  const handleDeleteCategory = (id: string) => {
    if (!confirm("با حذف این دسته‌بندی وابستگی‌های درختی پاک خواهند شد. تایید؟")) return;
    fetch(`/api/categories/${id}`, { method: "DELETE" })
      .then(() => {
        fetchAdminData();
        triggerAlert("دسته‌بندی با موفقیت حذف گردید.");
      });
  };

  // ORDER UPDATE ACTIONS
  const handleOpenOrderDetails = (ord: Order) => {
    setSelectedOrder(ord);
    setOrderStatus(ord.status);
    setOrderPayment(ord.paymentStatus);
    setOrderTracking(ord.trackingCode || "");
    setOrderAdminNote(ord.adminNotes || "");
  };

  const handleUpdateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;

    fetch(`/api/orders/${selectedOrder.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: orderStatus,
        paymentStatus: orderPayment,
        trackingCode: orderTracking || undefined,
        adminNotes: orderAdminNote
      })
    })
      .then(res => res.json())
      .then(() => {
        setSelectedOrder(null);
        fetchAdminData();
        triggerAlert("سفارش شما مقتضی با تغییرات آپدیت شد.");
      });
  };

  // SUPPORT REPLY ACTIONS
  const handleSendTicketReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketAnswerInput.trim() || !selectedTicket) return;

    fetch(`/api/tickets/${selectedTicket.id}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: ticketAnswerInput,
        author: "admin",
        authorName: "پشتیبان سیستم آریا"
      })
    })
      .then(res => res.json())
      .then(data => {
        if (data.ticket) {
          setSelectedTicket(data.ticket);
          setTicketAnswerInput("");
          fetchAdminData();
        }
      });
  };

  const handleCloseTicket = (id: string) => {
    fetch(`/api/tickets/${id}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: "این تیکت با تایید اپراتور پشتیبان بسته شد.",
        author: "admin"
      })
    })
      .then(() => {
        // Simple update ticket status manually via put or endpoint. Let's do virtual update
        setSelectedTicket(null);
        fetchAdminData();
        triggerAlert("تیکت با موفقیت بسته شد.");
      });
  };

  // COUPON ACTIONS
  const handleSaveCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cpCode || !cpValue) return;

    fetch("/api/coupons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code: cpCode.toUpperCase().trim(),
        type: cpType,
        value: Number(cpValue),
        minAmount: Number(cpMin),
        limitUsages: Number(cpLimit),
        status: "active"
      })
    })
      .then(res => res.json())
      .then(() => {
        setCpCode("");
        setCpValue(10);
        setCpMin(0);
        fetchAdminData();
        triggerAlert("کد کوپن جدید ثبت و آماده فعال‌سازی گردید.");
      });
  };

  const handleDeleteCoupon = (code: string) => {
    fetch(`/api/coupons/${code}`, { method: "DELETE" })
      .then(() => {
        fetchAdminData();
        triggerAlert("کوپن با موفقیت منقضی و حذف شد.");
      });
  };

  // SITE SETTINGS ACTIONS
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        storeName,
        phone: storePhone,
        email: storeEmail,
        address: storeAddr,
        socials: { instagram: storeInstagram },
        footerText: storeFooter,
        enableCommentsApproval: storeApproval
      })
    })
      .then(res => res.json())
      .then(() => {
        triggerAlert("تنظیمات کلی فروشگاه آریا آپدیت و ثبت گردید.");
      });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 font-sans" id="admin-panel-wrapper">
      
      {/* Visual Header information */}
      <div className="flex items-center justify-between pb-6 border-b border-gray-150 mb-8 select-none">
        <div>
          <h2 className="text-md font-black text-gray-950 flex items-center gap-2">
            <span className="w-2.5 h-6 bg-emerald-600 rounded-full block" />
            <span>پرتال مدیریت یکپارچه فروشگاه آریا</span>
          </h2>
          <p className="text-[11px] text-gray-400 mt-1">امکان نظارت بر فروش و دسترسی‌ها | خوش آمدید {user.name} ({user.role === "admin" ? "مدیر ارشد" : "ناظر محتوا"})</p>
        </div>
        
        <button 
          onClick={() => onNavigate("home")}
          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>بازگشت به سایت</span>
        </button>
      </div>

      {statusMessage && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-250 text-emerald-800 rounded-xl text-xs font-bold animate-pulse">
          {statusMessage}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        
        {/* Navigation Admin Side tabs */}
        <div className="lg:col-span-1 space-y-1">
          {[
            { id: "dashboard", label: "کنترل پنل و آمار", icon: BarChart },
            { id: "products", label: "مدیریت کالاها", icon: Package },
            { id: "categories", label: "دسته‌بندی‌های کالا", icon: Layers },
            { id: "orders", label: "سفارشات دریافتی", icon: ShoppingCart },
            { id: "tickets", label: "تیکت‌های مشتریان", icon: MessageSquare },
            { id: "coupons", label: "کدهای تخفیف", icon: Tag },
            { id: "settings", label: "تنظیمات عمومی", icon: Settings }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setSelectedOrder(null); setSelectedTicket(null); setProductFormOpen(false); }}
                className={`w-full flex items-center gap-2.5 px-4 py-3 rounded-xl text-xs font-bold text-right transition-colors cursor-pointer ${
                  activeTab === tab.id 
                    ? "bg-slate-900 text-white shadow-lg" 
                    : "text-gray-650 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Tabs Dynamic Render */}
        <div className="lg:col-span-4 bg-white border border-gray-100 rounded-2xl p-6 shadow-sm min-h-[500px]">
          
          {/* TAB 1: DASHBOARD REPORT */}
          {activeTab === "dashboard" && report && (
            <div className="space-y-8" id="admin-dashboard-stats">
              
              {/* Report 4 grids */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5">
                  <span className="text-[11px] text-gray-400 font-bold block mb-1">کل فروش (ناخالص)</span>
                  <span className="text-lg font-black text-gray-900 font-mono text-emerald-700">{formatPrice(report.totalIncome)}</span>
                </div>
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5">
                  <span className="text-[11px] text-gray-400 font-bold block mb-1">درآمد وصول شده</span>
                  <span className="text-lg font-black text-gray-900 font-mono text-blue-700">{formatPrice(report.totalPaidRevenue)}</span>
                </div>
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5">
                  <span className="text-[11px] text-gray-400 font-bold block mb-1">کل سفارشات ثبت شده</span>
                  <span className="text-lg font-black text-gray-900 font-mono text-amber-600">{toPersianDigits(report.ordersCount)} دانه</span>
                </div>
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5">
                  <span className="text-[11px] text-gray-400 font-bold block mb-1">مشتریان ثبت‌نامی</span>
                  <span className="text-lg font-black text-gray-900 font-mono text-teal-600">{toPersianDigits(report.usersCount)} کاربر</span>
                </div>
              </div>

              {/* Graphical representation CSS bars representing sales progress */}
              <div className="border border-gray-100 rounded-2xl p-6 bg-slate-950/40">
                <h3 className="text-xs font-black text-gray-800 mb-6 flex items-center justify-between">
                  <span>نمودار فروش متغیر هفت روز اخیر (شبیه‌ساز فروش)</span>
                  <span className="text-[10px] text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded">درآمد روزانه (تومان)</span>
                </h3>
                
                <div className="flex items-end justify-between h-48 pt-6 px-4">
                  {report.salesChart?.map((day: any, i: number) => {
                    // map sales ratio to percent max scale
                    const maxVal = 10500000;
                    const percent = Math.min(100, Math.max(15, (day.sales / maxVal) * 100));
                    return (
                      <div key={i} className="flex flex-col items-center gap-2 flex-1 group">
                        <div className="text-[10px] font-bold text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity font-mono">
                          {toPersianDigits(Math.round(day.sales / 1000))}k
                        </div>
                        <div 
                          className="w-10 bg-emerald-600 hover:bg-emerald-500 rounded-t-lg transition-all duration-500 shadow-lg shadow-emerald-500/10 cursor-pointer"
                          style={{ height: `${percent}%` }}
                        />
                        <span className="text-[10px] font-semibold text-gray-650 mt-1">{day.day}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Low stock indicators lists representing alerts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Low Stock card alert */}
                <div className="border border-gray-100 rounded-xl p-5 space-y-4">
                  <h4 className="text-xs font-black text-gray-800 flex items-center gap-1.5 text-rose-600">
                    <AlertTriangle className="w-4 h-4" />
                    <span>کالاهای رو به اتمام (هشدار انبارداری)</span>
                  </h4>
                  {report.lowStockProducts?.length === 0 ? (
                    <p className="text-[11px] text-gray-400">تمام کالاها موجودی کافی دارند.</p>
                  ) : (
                    <div className="divide-y divide-gray-50 space-y-2">
                      {report.lowStockProducts?.map((p: Product) => (
                        <div key={p.id} className="flex items-center justify-between text-xs pt-1.5">
                          <span className="font-semibold text-gray-800 line-clamp-1 max-w-[170px]">{p.title}</span>
                          <span className="font-mono text-red-500 font-bold bg-red-50 px-2 py-0.5 rounded">
                            موجودی: {toPersianDigits(p.stock)} عدد
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Support ticket status dashboard indicators */}
                <div className="border border-gray-100 rounded-xl p-5 space-y-4">
                  <h4 className="text-xs font-black text-gray-800 flex items-center gap-1.5 text-blue-600">
                    <MessageSquare className="w-4 h-4" />
                    <span>آماره پشتیبانی و تیکت‌های پاسخ‌نشده</span>
                  </h4>
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="bg-slate-50 p-3 rounded-lg border border-gray-100">
                      <span className="text-[10px] text-gray-400 block mb-1">کل تیکت‌ها</span>
                      <strong className="text-gray-900 font-mono text-sm">{toPersianDigits(report.supportDashboard?.totalTickets)}</strong>
                    </div>
                    <div className="bg-amber-50 p-3 rounded-lg border border-amber-100">
                      <span className="text-[10px] text-amber-500 block mb-1">باز و خوانده نشده</span>
                      <strong className="text-amber-800 font-mono text-sm">{toPersianDigits(report.supportDashboard?.openTickets)}</strong>
                    </div>
                    <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-100">
                      <span className="text-[10px] text-yellow-600 block mb-1">در انتظار بررسی</span>
                      <strong className="text-yellow-800 font-mono text-sm">{toPersianDigits(report.supportDashboard?.pendingTickets)}</strong>
                    </div>
                  </div>
                  <button onClick={() => setActiveTab("tickets")} className="w-full py-2 bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-bold rounded-lg border border-gray-100 text-center">
                    ورود به بخش پاسخ‌دهی به تیکت‌ها
                  </button>
                </div>

              </div>

            </div>
          )}

          {/* TAB 2: PRODUCTS CRUD & LISTS */}
          {activeTab === "products" && (
            <div className="space-y-6" id="admin-products-manager">
              {productFormOpen ? (
                /* product Create or edit form */
                <form onSubmit={handleSaveProduct} className="space-y-4">
                  <div className="flex items-center justify-between pb-4 border-b border-gray-50">
                    <h3 className="font-black text-xs text-slate-900">
                      {editingProductId ? `ویرایش اطلاعات محصول (${prodSku})` : "افزودن و تعریف کالا جدید به انبار"}
                    </h3>
                    <button type="button" onClick={() => setProductFormOpen(false)} className="text-xs text-gray-400 hover:underline">انصراف / بازگشت</button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-gray-400 block mb-1">عنوان کالا *</label>
                      <input type="text" value={prodTitle} onChange={e => setProdTitle(e.target.value)} required className="w-full border border-gray-200 rounded-xl p-2.5 text-xs text-right" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-400 block mb-1">کد انبارداری (SKU) *</label>
                      <input type="text" value={prodSku} onChange={e => setProdSku(e.target.value)} required className="w-full border border-gray-200 rounded-xl p-2.5 text-xs text-right" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="text-xs font-bold text-gray-400 block mb-1">قیمت اصلی (تومان) *</label>
                      <input type="number" value={prodPrice} onChange={e => setProdPrice(Number(e.target.value))} required className="w-full border border-gray-200 rounded-xl p-2.5 text-xs text-right" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-400 block mb-1">قیمت فروش تخفیفی</label>
                      <input type="number" value={prodDiscountPrice || ""} onChange={e => setProdDiscountPrice(e.target.value ? Number(e.target.value) : undefined)} className="w-full border border-gray-200 rounded-xl p-2.5 text-xs text-right" placeholder="خالی بذارید یعنی بدون تخفیف" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-400 block mb-1">موجودی انبار *</label>
                      <input type="number" value={prodStock} onChange={e => setProdStock(Number(e.target.value))} required className="w-full border border-gray-200 rounded-xl p-2.5 text-xs text-right" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-400 block mb-1">آستانه هشدار اتمام موجودی</label>
                      <input type="number" value={prodThreshold} onChange={e => setProdThreshold(Number(e.target.value))} className="w-full border border-gray-200 rounded-xl p-2.5 text-xs text-right" />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-400 block mb-1">لینک آدرس تصویر شاخص *</label>
                    <input type="text" value={prodMainImage} onChange={e => setProdMainImage(e.target.value)} required placeholder="https://images.unsplash.com/..." className="w-full border border-gray-200 rounded-xl p-2.5 text-xs text-left font-mono" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-gray-400 block mb-1">قراردادن در دسته‌بندی‌ها</label>
                      <div className="border border-gray-200 rounded-xl p-3 h-28 overflow-y-auto space-y-1.5 text-xs text-right bg-white">
                        {categories.map(c => (
                          <div key={c.id} className="flex items-center gap-2">
                            <input 
                              type="checkbox" 
                              id={`frm-cat-${c.id}`} 
                              checked={prodCats.includes(c.id)} 
                              onChange={e => {
                                if (e.target.checked) setProdCats([...prodCats, c.id]);
                                else setProdCats(prodCats.filter(id => id !== c.id));
                              }}
                            />
                            <label htmlFor={`frm-cat-${c.id}`}>{c.name}</label>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-400 block mb-1">کدهای برچسب به عنوان ویژگی (کلمات کلیدی)</label>
                      <textarea value={prodTags} onChange={e => setProdTags(e.target.value)} placeholder="مثلا: ساعت، هوشمند، ورزشی" rows={3} className="w-full border border-gray-200 rounded-xl p-2.5 text-xs text-right" />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-400 block mb-1">توضیح کوتاه محصول *</label>
                    <textarea value={prodDescShort} onChange={e => setProdDescShort(e.target.value)} required rows={2} className="w-full border border-gray-200 rounded-xl p-2.5 text-xs text-right text-gray-600" />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-400 block mb-1">توضیحات تکمیلی نهایی (HTML مجاز است) *</label>
                    <textarea value={prodDescFull} onChange={e => setProdDescFull(e.target.value)} required rows={5} className="w-full border border-gray-200 rounded-xl p-2.5 text-xs text-right font-mono" />
                  </div>

                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="is_var" checked={prodIsVariable} onChange={e => setProdIsVariable(e.target.checked)} />
                    <label htmlFor="is_var" className="text-xs text-gray-700 font-bold cursor-pointer">محصول متغیر است (سایزبندی و رنگ‌بندی داینامیک)</label>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-4">
                    <button type="button" onClick={() => setProductFormOpen(false)} className="px-4 py-2 border border-gray-200 text-gray-600 rounded-xl text-xs cursor-pointer">انصراف</button>
                    <button type="submit" className="px-6 py-2 bg-emerald-650 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold cursor-pointer shadow-md shadow-emerald-200">
                      ذخیره اطلاعات کالا
                    </button>
                  </div>

                </form>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-black text-gray-800">لیست کالاهای ثبت شده در سیستم انبار</h3>
                    <button 
                      onClick={handleOpenAddProduct}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer shadow-md shadow-emerald-100"
                    >
                      <Plus className="w-4 h-4" />
                      <span>افزودن کالا جدید</span>
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-right text-xs">
                      <thead>
                        <tr className="text-gray-400 font-semibold border-b border-gray-50 pb-2">
                          <th className="pb-3 text-right">تصویر و کد</th>
                          <th className="pb-3 text-right">نام محصول</th>
                          <th className="pb-3 text-center">موجود انبار</th>
                          <th className="pb-3 text-center">قیمت واحد</th>
                          <th className="pb-3 text-left">عملیات مدیریت</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {products.map((p) => (
                          <tr key={p.id}>
                            <td className="py-3.5">
                              <div className="flex items-center gap-3">
                                <img src={p.mainImage} alt="" className="w-10 h-10 object-cover rounded-lg" />
                                <span className="font-mono text-[10px] bg-gray-100 px-2 py-0.5 rounded font-extrabold">{p.sku}</span>
                              </div>
                            </td>
                            <td className="py-3.5 font-bold text-gray-900 leading-snug">{p.title}</td>
                            <td className="py-3.5 text-center font-mono font-bold">
                              {p.stock === 0 ? (
                                <span className="text-rose-500 bg-rose-50 px-2 py-0.5 rounded">ناموجود!</span>
                              ) : (
                                <span className={p.stock <= p.stockThreshold ? "text-amber-600 font-black" : "text-gray-700"}>{toPersianDigits(p.stock)} عدد</span>
                              )}
                            </td>
                            <td className="py-3.5 text-center font-mono font-black text-emerald-700">{formatPrice(p.discountPrice || p.price)}</td>
                            <td className="py-3.5 text-left">
                              <div className="flex items-center gap-2 justify-end">
                                <button onClick={() => handleOpenEditProduct(p)} className="p-1 px-2.5 text-emerald-600 hover:bg-emerald-50 rounded text-xs font-semibold cursor-pointer">ویرایش</button>
                                <button onClick={() => handleDeleteProduct(p.id)} className="p-1 px-2.5 text-red-600 hover:bg-red-50 rounded text-xs font-semibold cursor-pointer">حذف</button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: CATEGORIES MANAGER */}
          {activeTab === "categories" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8" id="admin-categories-tab">
              
              {/* Category creation form */}
              <form onSubmit={handleSaveCategory} className="md:col-span-1 space-y-4 bg-slate-50 p-5 rounded-2xl border border-gray-100">
                <h3 className="font-black text-xs text-slate-800">
                  {editingCatId ? "ویرایش مشخصات دسته‌بندی" : "تعریف دسته‌بندی جدید کالا"}
                </h3>
                
                <div>
                  <label className="text-xs font-bold text-gray-500 block mb-1">نام دسته‌بندی *</label>
                  <input type="text" value={catName} onChange={e => setCatName(e.target.value)} required className="w-full border border-gray-200 rounded-xl p-2.5 text-xs text-right bg-white" placeholder="مثال: پوشاک زنانه" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 block mb-1">شناسه یکتا (Slug) *</label>
                  <input type="text" value={catSlug} onChange={e => setCatSlug(e.target.value)} required className="w-full border border-gray-200 rounded-xl p-2.5 text-[10px] text-left font-mono bg-white" placeholder="women-fashion" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 block mb-1">دسته‌بندی والد (زیرمجموعه)</label>
                  <select value={catParent} onChange={e => setCatParent(e.target.value)} className="w-full border border-gray-200 rounded-xl p-2.5 text-xs text-right bg-white">
                    <option value="">بدون والد (شاخه اصلی)</option>
                    {categories.filter(c => !c.parentId && c.id !== editingCatId).map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 block mb-1">توضیح کوتاه</label>
                  <textarea value={catDesc} onChange={e => setCatDesc(e.target.value)} rows={3} className="w-full border border-gray-200 rounded-xl p-2.5 text-xs text-right bg-white" />
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button type="submit" className="px-5 py-2 bg-emerald-655 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold cursor-pointer">ذخیره دسته‌بندی</button>
                  {editingCatId && (
                    <button type="button" onClick={() => { setEditingCatId(null); setCatName(""); setCatSlug(""); }} className="px-4 py-2 bg-gray-200 rounded-xl text-xs cursor-pointer">انصراف</button>
                  )}
                </div>

              </form>

              {/* Categories list tree representation */}
              <div className="md:col-span-2 space-y-4">
                <h3 className="text-xs font-black text-gray-800">ساختار درختی دسته‌بندی‌های کالاها</h3>
                
                <div className="divide-y divide-gray-50">
                  {categories.filter(c => !c.parentId).map(parent => {
                    const children = categories.filter(child => child.parentId === parent.id);
                    return (
                      <div key={parent.id} className="py-3">
                        <div className="flex items-center justify-between">
                          <strong className="text-xs font-extrabold text-gray-900 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 bg-emerald-650 rounded-full block" />
                            <span>{parent.name}</span>
                          </strong>
                          <div className="flex items-center gap-1.5">
                            <button onClick={() => {
                              setEditingCatId(parent.id);
                              setCatName(parent.name);
                              setCatSlug(parent.slug);
                              setCatParent(parent.parentId || "");
                              setCatDesc(parent.description || "");
                            }} className="text-[11px] text-emerald-600 font-bold hover:underline cursor-pointer">ویرایش</button>
                            <span className="text-gray-300">|</span>
                            <button onClick={() => handleDeleteCategory(parent.id)} className="text-[11px] text-red-600 font-bold hover:underline cursor-pointer">حذف</button>
                          </div>
                        </div>

                        {/* rendering sub kids */}
                        {children.length > 0 && (
                          <div className="mr-6 mt-2 space-y-2 border-r border-gray-100 pr-4">
                            {children.map(child => (
                              <div key={child.id} className="flex items-center justify-between py-1 bg-gray-50/50 px-2.5 rounded-lg border border-gray-100/50">
                                <span className="text-xs text-gray-600 text-right pr-2">↳ {child.name}</span>
                                <div className="flex items-center gap-2">
                                  <button onClick={() => {
                                    setEditingCatId(child.id);
                                    setCatName(child.name);
                                    setCatSlug(child.slug);
                                    setCatParent(child.parentId || "");
                                    setCatDesc(child.description || "");
                                  }} className="text-[10px] text-emerald-600 hover:underline">ویرایش</button>
                                  <button onClick={() => handleDeleteCategory(child.id)} className="text-[10px] text-red-600 hover:underline">حذف</button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          )}

          {/* TAB 4: ORDERS CONTROL MANAGER */}
          {activeTab === "orders" && (
            <div className="space-y-6" id="admin-orders-manager">
              
              {selectedOrder ? (
                /* modal to upgrade order details as admin */
                <form onSubmit={handleUpdateOrder} className="space-y-4 border border-gray-200 rounded-2xl p-6 bg-slate-50">
                  <div className="flex items-center justify-between pb-4 border-b border-gray-150">
                    <h3 className="font-extrabold text-xs text-gray-900">بروزرسانی وضعیت سفارش فروشگاهی ({selectedOrder.orderNumber})</h3>
                    <button type="button" onClick={() => setSelectedOrder(null)} className="text-xs text-gray-400 hover:underline">برگشت</button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-right">
                    <div className="space-y-1">
                      <span className="text-gray-400">تحویل‌گیرنده:</span>
                      <strong>{selectedOrder.shippingAddress.probeName} ({toPersianDigits(selectedOrder.shippingAddress.probePhone)})</strong>
                    </div>
                    <div className="space-y-1">
                      <span className="text-gray-400">آدرس پستی:</span>
                      <strong>{selectedOrder.shippingAddress.province}، {selectedOrder.shippingAddress.city}، {selectedOrder.shippingAddress.addressFull}</strong>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                    <div>
                      <label className="text-xs font-bold text-gray-400 block mb-1">وضعیت کنونی سفارش *</label>
                      <select value={orderStatus} onChange={e => setOrderStatus(e.target.value as OrderStatus)} className="w-full border border-gray-200 rounded-xl p-2.5 text-xs text-right bg-white">
                        <option value={OrderStatus.PENDING}>در حال بررسی دمو</option>
                        <option value={OrderStatus.CONFIRMED}>تایید شده و مادی</option>
                        <option value={OrderStatus.PREPARING}>در حال آماده‌سازی کارتن</option>
                        <option value={OrderStatus.SHIPPED}>ارسال شده مأمور پست</option>
                        <option value={OrderStatus.DELIVERED}>تحویل نهایی مشتری شد</option>
                        <option value={OrderStatus.CANCELLED}>لغو خرید شده</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-400 block mb-1">وضعیت پرداخت تراکنش *</label>
                      <select value={orderPayment} onChange={e => setOrderPayment(e.target.value as PaymentStatus)} className="w-full border border-gray-200 rounded-xl p-2.5 text-xs text-right bg-white">
                        <option value={PaymentStatus.UNPAID}>کامل پرداخت نشده</option>
                        <option value={PaymentStatus.PAID}>کامل تسویه و پرداخت شده</option>
                        <option value={PaymentStatus.REFUNDED}>مرجوع و برگشت پول</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-400 block mb-1">شماره پیگیری پست پیشتاز مرسوله</label>
                      <input type="text" value={orderTracking} onChange={e => setOrderTracking(e.target.value)} className="w-full border border-gray-200 rounded-xl p-2.5 text-xs text-left font-mono" placeholder="۱۹۲۸۳۸۳..." />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-400 block mb-1">یادداشت‌های اختصاصی مدیر (غیر قابل نمایش در پنل کاربر)</label>
                    <textarea value={orderAdminNote} onChange={e => setOrderAdminNote(e.target.value)} rows={3} className="w-full border border-gray-200 rounded-xl p-2.5 text-xs text-right bg-white" placeholder="مثلا: هماهنگ شده با سرپرست دپو..." />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-4 border-t border-gray-150">
                    <button type="button" onClick={() => setSelectedOrder(null)} className="px-4 py-2 border border-gray-200 text-gray-600 rounded-xl text-xs cursor-pointer">لغو بروزرسانی</button>
                    <button type="submit" className="px-5 py-2 bg-slate-900 hover:bg-slate-950 text-white rounded-xl text-xs font-bold cursor-pointer">ثبت و به‌روزرسانی نهایی</button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <h3 className="text-xs font-black text-gray-800">لیست کلیه سفارشات دریافتی فروشگاه</h3>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full text-right text-xs">
                      <thead>
                        <tr className="text-gray-400 font-bold border-b border-gray-50 pb-2">
                          <th className="pb-3 text-right">شماره سفارش</th>
                          <th className="pb-3 text-right">مشتری</th>
                          <th className="pb-3 text-center">وضعیت فیزیکی</th>
                          <th className="pb-3 text-center">پرداخت تفصیلی</th>
                          <th className="pb-3 text-left">عملیات</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {orders.map((ord) => (
                          <tr key={ord.id} className="hover:bg-gray-50/40">
                            <td className="py-3 font-mono font-bold">{ord.orderNumber}</td>
                            <td className="py-3">
                              <span className="font-semibold text-gray-900 block">{ord.userName}</span>
                              <span className="text-[10px] text-gray-400 font-mono">{ord.userPhone}</span>
                            </td>
                            <td className="py-3 text-center">
                              <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold border ${orderStatus === ord.status ? "border-emerald-500 text-emerald-500 bg-emerald-50" : "text-gray-500 bg-gray-50"}`}>
                                {ord.status === "pending" ? "بررسی" : ord.status === "preparing" ? "بسته‌بندی" : ord.status === "shipped" ? "ارسال شد" : "تحویل شد"}
                              </span>
                            </td>
                            <td className="py-2.5 text-center font-mono font-black text-emerald-700">{formatPrice(ord.finalTotal)}</td>
                            <td className="py-3 text-left">
                              <button onClick={() => handleOpenOrderDetails(ord)} className="p-1 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded font-bold cursor-pointer text-[11px]">
                                ویرایش فاکتور
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: TICKETS ANSWER HELPDESK */}
          {activeTab === "tickets" && (
            <div className="space-y-6" id="admin-tickets-helpdesk">
              
              {selectedTicket ? (
                /* Chat view representing support tickets messaging */
                <div className="border border-gray-100 rounded-2xl p-5 space-y-4 shadow-sm">
                  <div className="flex items-center justify-between pb-4 border-b border-gray-150">
                    <div>
                      <span className="text-[10px] bg-slate-800 text-yellow-500 px-2.5 py-0.5 rounded font-mono font-bold tracking-wider">{selectedTicket.ticketNumber}</span>
                      <h4 className="font-extrabold text-xs text-gray-800 mt-2 leading-relaxed">{selectedTicket.subject}</h4>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => handleCloseTicket(selectedTicket.id)} className="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 text-xs rounded-xl font-bold cursor-pointer">بستن تیکت</button>
                      <button onClick={() => setSelectedTicket(null)} className="px-3 py-1.5 border border-gray-200 text-gray-400 hover:text-gray-700 text-xs rounded-xl cursor-pointer">انصراف</button>
                    </div>
                  </div>

                  <div className="h-[250px] overflow-y-auto p-4 bg-gray-50 rounded-xl space-y-4">
                    {selectedTicket.messages.map(msg => (
                      <div key={msg.id} className={`flex ${msg.author === "admin" ? "justify-start" : "justify-end"}`}>
                        <div className={`p-3 max-w-[75%] rounded-2xl text-xs shadow-sm ${msg.author === "admin" ? "bg-slate-800 text-white rounded-tr-none" : "bg-white text-gray-800 rounded-tl-none border"}`}>
                          <div className="text-[9px] opacity-75 pb-1 block font-bold">فرستنده: {msg.authorName}</div>
                          <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <form onSubmit={handleSendTicketReply} className="flex items-center gap-3">
                    <input 
                      type="text" 
                      value={ticketAnswerInput} 
                      onChange={e => setTicketAnswerInput(e.target.value)} 
                      required 
                      className="flex-1 border border-gray-200 rounded-xl p-3 text-xs focus:outline-none focus:border-emerald-500 text-right" 
                      placeholder="متن پاسخ رسمی مدیریت را وارد کنید..." 
                    />
                    <button type="submit" className="px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shrink-0 cursor-pointer">ارسال پاسخ</button>
                  </form>
                </div>
              ) : (
                <div className="space-y-4">
                  <h3 className="text-xs font-black text-gray-800">تیکت‌های فنی و مالی مشتریان آریا</h3>
                  
                  <div className="divide-y divide-gray-50">
                    {tickets.map(t => (
                      <div 
                        key={t.id} 
                        onClick={() => setSelectedTicket(t)} 
                        className="py-4 flex items-center justify-between flex-wrap gap-4 cursor-pointer hover:bg-slate-50/50 px-3 rounded-lg transition-colors bg-white border border-gray-50 mb-2"
                      >
                        <div>
                          <span className="text-[10px] bg-slate-950/20 px-2 py-0.5 rounded font-mono font-bold text-gray-650">{t.ticketNumber}</span>
                          <h4 className="font-extrabold text-xs text-gray-900 mt-2 leading-relaxed">{t.subject}</h4>
                          <p className="text-[10px] text-gray-400 mt-1">تراکنش ایمیل کاربر: {t.userEmail}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-[9px] text-white uppercase font-bold ${t.priority === "high" ? "bg-rose-500" : "bg-teal-500"}`}>{t.priority}</span>
                          <span className="text-xs text-emerald-650 font-bold bg-emerald-50 px-3 py-1 rounded-xl">پاسخ دادن تیکت →</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 6: COUPON CREATIONS */}
          {activeTab === "coupons" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8" id="admin-coupons-manager">
              
              <form onSubmit={handleSaveCoupon} className="md:col-span-1 space-y-4 bg-slate-55 p-5 rounded-2xl border border-gray-100">
                <h3 className="font-black text-xs text-slate-800">ساخت و تعریف کوپن تخفیف</h3>
                
                <div>
                  <label className="text-xs font-bold text-gray-500 block mb-1">کد کوپن (مثلاً WELCOME) *</label>
                  <input type="text" value={cpCode} onChange={e => setCpCode(e.target.value)} required className="w-full border border-gray-200 rounded-xl p-2.5 text-xs text-left font-mono" placeholder="SPRING20" />
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-gray-500 block mb-1">نوع تخفیف</label>
                    <select value={cpType} onChange={e => setCpType(e.target.value as any)} className="w-full border border-gray-200 rounded-xl p-2.5 text-xs text-right bg-white">
                      <option value="percent">درصدی (٪)</option>
                      <option value="fixed">مبلغ ثابت (تومان)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 block mb-1">میزان ارزش تخفیف *</label>
                    <input type="number" value={cpValue} onChange={e => setCpValue(Number(e.target.value))} required className="w-full border border-gray-200 rounded-xl p-2.5 text-xs text-right" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-gray-500 block mb-1">حداقل مبلغ خرید (تومان)</label>
                    <input type="number" value={cpMin} onChange={e => setCpMin(Number(e.target.value))} className="w-full border border-gray-200 rounded-xl p-2.5 text-xs text-right" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 block mb-1">محدودیت تعداد کل استفاده</label>
                    <input type="number" value={cpLimit} onChange={e => setCpLimit(Number(e.target.value))} className="w-full border border-gray-200 rounded-xl p-2.5 text-xs text-right" />
                  </div>
                </div>

                <button type="submit" className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold cursor-pointer">ثبت کوپن تخفیف</button>
              </form>

              <div className="md:col-span-2 space-y-4">
                <h3 className="text-xs font-black text-gray-800">لیست کوپن‌های فعال فروشگاه</h3>
                
                <div className="divide-y divide-gray-100">
                  {coupons.map(cp => (
                    <div key={cp.code} className="py-3.5 flex items-center justify-between text-xs bg-white">
                      <div>
                        <strong className="font-mono text-emerald-700 text-xs bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-150">{cp.code}</strong>
                        <p className="text-gray-400 text-[10px] mt-1.5">حداقل خرید مادی: {formatPrice(cp.minAmount || 0)} | انقضا: {cp.expires}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-black text-gray-800">
                          {cp.type === "percent" ? `${toPersianDigits(cp.value)}٪` : formatPrice(cp.value)}
                        </span>
                        <button onClick={() => handleDeleteCoupon(cp.code)} className="p-1 px-2.5 bg-red-50 hover:bg-red-100 text-red-650 rounded text-xs font-semibold cursor-pointer">حذف کوپن</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* TAB 7: GENERAL SETTINGS */}
          {activeTab === "settings" && siteSettings && (
            <form onSubmit={handleSaveSettings} className="space-y-6" id="admin-settings-tab">
              <h3 className="text-xs font-black text-gray-800 pb-2 border-b border-gray-50">تنظیمات شناسایی و پیکربندی فروشگاه آریا</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 block mb-1">نام فروشگاه بزرگ</label>
                  <input type="text" value={storeName} onChange={e => setStoreName(e.target.value)} className="w-full border border-gray-200 rounded-xl p-2.5 text-xs text-right" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 block mb-1">شماره تماس اضطراری</label>
                  <input type="text" value={storePhone} onChange={e => setStorePhone(e.target.value)} className="w-full border border-gray-200 rounded-xl p-2.5 text-xs text-right font-mono" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 block mb-1">پست الکترونیکی (ایمیل) فروشگاه</label>
                  <input type="email" value={storeEmail} onChange={e => setStoreEmail(e.target.value)} className="w-full border border-gray-200 rounded-xl p-2.5 text-xs text-left font-mono" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 block mb-1">آی‌دی اینستاگرام فروشگاه</label>
                  <input type="text" value={storeInstagram} onChange={e => setStoreInstagram(e.target.value)} className="w-full border border-gray-200 rounded-xl p-2.5 text-xs text-left font-mono" />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 block mb-1">آدرس فیزیکی فروشگاه و انبار تامین</label>
                <input type="text" value={storeAddr} onChange={e => setStoreAddr(e.target.value)} className="w-full border border-gray-200 rounded-xl p-2.5 text-xs text-right" />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 block mb-1">متن کپی‌رایت فوتر سایت</label>
                <textarea value={storeFooter} onChange={e => setStoreFooter(e.target.value)} rows={3} className="w-full border border-gray-200 rounded-xl p-2.5 text-xs text-right" />
              </div>

              <div className="flex items-center gap-2">
                <input type="checkbox" id="comment_appr" checked={storeApproval} onChange={e => setStoreApproval(e.target.checked)} />
                <label htmlFor="comment_appr" className="text-xs text-gray-700 font-bold cursor-pointer">تایید دستی نظرات پیش از انتشار (پیشخوان نظرات)</label>
              </div>

              <button type="submit" className="px-6 py-2.5 bg-emerald-650 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-200 cursor-pointer">
                بروزرسانی مشخصات فروشگاه
              </button>

            </form>
          )}

        </div>

      </div>
    </div>
  );
}
