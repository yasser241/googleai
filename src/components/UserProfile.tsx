/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  User as UserIcon, LogOut, ShoppingBag, MapPin, Heart, MessageSquare, 
  Settings, Key, Plus, Trash2, Edit2, Check, Clock, Truck, FileText, Printer, Send
} from "lucide-react";
import { User, Address, Order, Ticket, Comment, Product, OrderStatus, PaymentStatus } from "../types";
import { formatPrice, formatPersianDate, toPersianDigits } from "../utils";

interface UserProfileProps {
  user: User;
  onUpdateUser: (updatedUser: User) => void;
  onLogout: () => void;
  onNavigate: (view: string, params?: any) => void;
  activeTab?: string;
}

export default function UserProfile({
  user,
  onUpdateUser,
  onLogout,
  onNavigate,
  activeTab = "dashboard"
}: UserProfileProps) {
  const [tab, setTab] = useState(activeTab);
  const [orders, setOrders] = useState<Order[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [wishlistProducts, setWishlistProducts] = useState<Product[]>([]);

  // Form states
  const [profileName, setProfileName] = useState(user.name);
  const [profileLastName, setProfileLastName] = useState(user.lastName || "");
  const [profilePhone, setProfilePhone] = useState(user.phone);
  const [profileDob, setProfileDob] = useState(user.dob || "");
  const [profileImage, setProfileImage] = useState(user.profileImage || "");
  const [newsletterSub, setNewsletterSub] = useState(user.notificationsEnabled?.newsletter ?? true);
  const [smsSub, setSmsSub] = useState(user.notificationsEnabled?.sms ?? true);

  // Address modal states
  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [addrTitle, setAddrTitle] = useState("");
  const [addrProbeName, setAddrProbeName] = useState("");
  const [addrProbePhone, setAddrProbePhone] = useState("");
  const [addrProvince, setAddrProvince] = useState("");
  const [addrCity, setAddrCity] = useState("");
  const [addrPostalCode, setAddrPostalCode] = useState("");
  const [addrFull, setAddrFull] = useState("");

  // Passwords change states
  const [currPass, setCurrPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [passError, setPassError] = useState("");
  const [passSuccess, setPassSuccess] = useState("");

  // Invoice visual state
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<Order | null>(null);

  // Ticket create/chat state
  const [activeTicket, setActiveTicket] = useState<Ticket | null>(null);
  const [chatMessageInput, setChatMessageInput] = useState("");
  const [newTicketSubject, setNewTicketSubject] = useState("");
  const [newTicketMessage, setNewTicketMessage] = useState("");
  const [newTicketCategory, setNewTicketCategory] = useState<any>("order");
  const [newTicketPriority, setNewTicketPriority] = useState<any>("medium");
  const [ticketModalOpen, setTicketModalOpen] = useState(false);

  const [message, setMessage] = useState("");

  // Fetch orders, tickets, comments and products during mounting
  useEffect(() => {
    // 1. Fetch user orders
    fetch(`/api/orders?email=${encodeURIComponent(user.email)}`)
      .then(res => res.json())
      .then(data => setOrders(data))
      .catch(err => console.error(err));

    // 2. Fetch tickets
    fetch(`/api/tickets?email=${encodeURIComponent(user.email)}`)
      .then(res => res.json())
      .then(data => setTickets(data))
      .catch(err => console.error(err));

    // 3. Fetch comments
    fetch("/api/comments")
      .then(res => res.json())
      .then(data => {
        // filter comments by user email
        const userComments = data.filter((c: Comment) => c.email.toLowerCase() === user.email.toLowerCase());
        setComments(userComments);
      })
      .catch(err => console.error(err));

    // 4. Fetch wishlist products details
    fetch("/api/products")
      .then(res => res.json())
      .then((data: Product[]) => {
        const liked = data.filter(p => user.wishlist.includes(p.id));
        setWishlistProducts(liked);
      })
      .catch(err => console.error(err));
  }, [user]);

  // Sync state tab choice with prop if updated
  useEffect(() => {
    setTab(activeTab);
  }, [activeTab]);

  // Handle general profiles save
  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("aria_auth_token");
    if (!token) return;

    fetch("/api/auth/profile", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({
        name: profileName,
        lastName: profileLastName,
        phone: profilePhone,
        dob: profileDob,
        profileImage,
        notificationsEnabled: {
          newsletter: newsletterSub,
          sms: smsSub
        }
      })
    })
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          onUpdateUser(data.user);
          setMessage("تغییرات پروفایل با موفقیت ذخیره شد.");
          setTimeout(() => setMessage(""), 3500);
        }
      })
      .catch(() => setMessage("خطا در همگام‌سازی ذخیره داده‌ها."));
  };

  // Handle password change
  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    setPassError("");
    setPassSuccess("");
    if (!currPass || !newPass) {
      setPassError("پر کردن هر دو فیلد الزامی است");
      return;
    }

    const token = localStorage.getItem("aria_auth_token");
    fetch("/api/auth/change-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ currentPassword: currPass, newPassword: newPass })
    })
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          setPassError(data.error);
        } else {
          setPassSuccess("کلمه عبور با موفقیت تغییر کرد.");
          setCurrPass("");
          setNewPass("");
        }
      })
      .catch(() => setPassError("خطا در برقراری ارتباط با سرور"));
  };

  // Address managements logic
  const handleOpenAddAddress = () => {
    setEditingAddressId(null);
    setAddrTitle("");
    setAddrProbeName(`${user.name} ${user.lastName || ""}`);
    setAddrProbePhone(user.phone);
    setAddrProvince("");
    setAddrCity("");
    setAddrPostalCode("");
    setAddrFull("");
    setAddressModalOpen(true);
  };

  const handleOpenEditAddress = (addr: Address) => {
    setEditingAddressId(addr.id);
    setAddrTitle(addr.title);
    setAddrProbeName(addr.probeName);
    setAddrProbePhone(addr.probePhone);
    setAddrProvince(addr.province);
    setAddrCity(addr.city);
    setAddrPostalCode(addr.postalCode);
    setAddrFull(addr.addressFull);
    setAddressModalOpen(true);
  };

  const handleSaveAddress = (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("aria_auth_token");
    if (!addrTitle || !addrProvince || !addrCity || !addrFull) return;

    let updatedList = [...(user.addresses || [])];
    if (editingAddressId) {
      updatedList = updatedList.map(a => a.id === editingAddressId ? {
        ...a,
          title: addrTitle,
          probeName: addrProbeName,
          probePhone: addrProbePhone,
          province: addrProvince,
          city: addrCity,
          postalCode: addrPostalCode,
          addressFull: addrFull
      } : a);
    } else {
      updatedList.push({
        id: `addr-${Date.now()}`,
        title: addrTitle,
        probeName: addrProbeName,
        probePhone: addrProbePhone,
        province: addrProvince,
        city: addrCity,
        postalCode: addrPostalCode,
        addressFull: addrFull,
        isDefault: updatedList.length === 0
      });
    }

    fetch("/api/auth/profile", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ addresses: updatedList })
    })
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          onUpdateUser(data.user);
          setAddressModalOpen(false);
        }
      });
  };

  const handleDeleteAddress = (id: string) => {
    const token = localStorage.getItem("aria_auth_token");
    const filtered = user.addresses.filter(a => a.id !== id);
    fetch("/api/auth/profile", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ addresses: filtered })
    })
      .then(res => res.json())
      .then(data => {
        if (data.user) onUpdateUser(data.user);
      });
  };

  // Support dispatch creators
  const handleCreateTicketInAPI = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTicketSubject || !newTicketMessage) return;

    fetch("/api/tickets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        subject: newTicketSubject,
        category: newTicketCategory,
        priority: newTicketPriority,
        userEmail: user.email,
        userName: `${user.name} ${user.lastName || ""}`,
        messageText: newTicketMessage
      })
    })
      .then(res => res.json())
      .then(data => {
        if (data.ticket) {
          setTickets([data.ticket, ...tickets]);
          setNewTicketSubject("");
          setNewTicketMessage("");
          setTicketModalOpen(false);
          setActiveTicket(data.ticket);
        }
      });
  };

  const handleSendChatMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessageInput.trim() || !activeTicket) return;

    fetch(`/api/tickets/${activeTicket.id}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: chatMessageInput,
        author: "user",
        authorName: `${user.name} ${user.lastName || ""}`
      })
    })
      .then(res => res.json())
      .then(data => {
        if (data.ticket) {
          setTickets(tickets.map(t => t.id === activeTicket.id ? data.ticket : t));
          setActiveTicket(data.ticket);
          setChatMessageInput("");
        }
      });
  };

  // Remove elements from wishlist
  const removeWishlistItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const token = localStorage.getItem("aria_auth_token");
    const updatedWish = user.wishlist.filter(item => item !== id);
    fetch("/api/auth/profile", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ wishlist: updatedWish })
    })
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          onUpdateUser(data.user);
          setWishlistProducts(wishlistProducts.filter(p => p.id !== id));
        }
      });
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PENDING: return "bg-amber-50 text-amber-600 border-amber-200";
      case OrderStatus.CONFIRMED: return "bg-blue-50 text-blue-600 border-blue-200";
      case OrderStatus.PREPARING: return "bg-yellow-50 text-yellow-700 border-yellow-200";
      case OrderStatus.SHIPPED: return "bg-teal-50 text-teal-600 border-teal-200";
      case OrderStatus.DELIVERED: return "bg-emerald-50 text-emerald-650 border-emerald-250";
      case OrderStatus.CANCELLED: return "bg-rose-50 text-rose-600 border-rose-200";
      default: return "bg-gray-50 text-gray-400 border-gray-200";
    }
  };

  const getFaStatus = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PENDING: return "در حال بررسی";
      case OrderStatus.CONFIRMED: return "تایید شده";
      case OrderStatus.PREPARING: return "در حال آماده‌سازی";
      case OrderStatus.SHIPPED: return "ارسال شد (مامور پست)";
      case OrderStatus.DELIVERED: return "تحویل مشتری شد";
      case OrderStatus.CANCELLED: return "لغو شده";
      case OrderStatus.REFUNDED: return "مرجوع شده";
      default: return "نامعلوم";
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 sm:px-6 lg:px-8 font-sans" id="user-profile-wrapper">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Profile Navigator sidebar */}
        <div className="lg:col-span-1 bg-white border border-gray-100 rounded-2xl p-6 shadow-sm h-fit">
          <div className="flex flex-col items-center text-center pb-6 border-b border-gray-100">
            <div className="w-20 h-20 bg-emerald-50 border-2 border-emerald-100 rounded-2xl overflow-hidden relative group mb-3">
              {profileImage ? (
                <img src={profileImage} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full text-emerald-800 text-2xl font-extrabold flex items-center justify-center">
                  {user.name[0]}
                </div>
              )}
            </div>
            <h3 className="font-extrabold text-gray-900 text-sm">{user.name} {user.lastName || ""}</h3>
            <span className="text-xs text-gray-400 font-mono mt-1 pr-1">{toPersianDigits(user.phone)}</span>
            <span className="text-[10px] bg-emerald-50 text-emerald-800 px-3 py-1 rounded-full font-bold mt-2">
              سطح دسترسی: {user.role === "admin" ? "مدیر کل" : "خریدار آریا"}
            </span>
          </div>

          <nav className="flex flex-row overflow-x-auto lg:flex-col gap-1.5 mt-6 no-scrollbar pb-2 lg:pb-0">
            {[
              { id: "dashboard", label: "پیشخوان داشبورد", icon: UserIcon },
              { id: "orders", label: "تاریخچه سفارشات", icon: ShoppingBag },
              { id: "addresses", label: "دفترچه آدرس‌ها", icon: MapPin },
              { id: "wishlist", label: "علاقه‌مندی‌های من", icon: Heart },
              { id: "tickets", label: "تیکت‌های پشتیبانی", icon: MessageSquare },
              { id: "details", label: "جزئیات حساب من", icon: Settings }
            ].map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => { setTab(item.id); setSelectedInvoiceOrder(null); setActiveTicket(null); }}
                  className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-xs font-semibold shrink-0 transition-all cursor-pointer ${
                    tab === item.id 
                      ? "bg-emerald-600 text-white shadow-md shadow-emerald-100" 
                      : "text-gray-600 hover:bg-gray-50 hover:text-emerald-600"
                  }`}
                  id={`profile-tab-${item.id}`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
            
            <button
               onClick={onLogout}
               className="flex items-center gap-2.5 px-4 py-3 rounded-xl text-xs font-semibold text-red-650 hover:bg-red-50 shrink-0 transition-all lg:mt-6 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>خروج از حساب</span>
            </button>
          </nav>
        </div>

        {/* Content Box Dynamic View panel */}
        <div className="lg:col-span-3">
          
          {message && (
            <div className="mb-4 p-4 bg-emerald-50 border border-emerald-250 text-emerald-800 rounded-xl text-xs font-bold animate-in fade-in">
              {message}
            </div>
          )}

          {/* TAB 1: DASHBOARD */}
          {tab === "dashboard" && (
            <div className="space-y-6" id="dashboard-tab">
              <div className="bg-gradient-to-r from-emerald-600 to-teal-500 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h2 className="text-md font-extrabold">سلام {user.name}، روزت بخیر!</h2>
                  <p className="text-xs text-white/85">به حساب کاربری پیشرفته خود در فروشگاه آریا خوش آمدید. در این بخش می‌توانید به راحتی خریدهای خود را نظارت کنید.</p>
                </div>
                <div className="text-xs bg-white/10 backdrop-blur-sm px-4 py-2 rounded-xl font-mono shrink-0">
                  تاریخ امروز: {formatPersianDate(new Date().toISOString())}
                </div>
              </div>

              {/* Status bento-cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm flex items-center gap-4">
                  <div className="w-12 h-12 bg-emerald-50 rounded-xl text-emerald-600 flex items-center justify-center">
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[11px] text-gray-400 font-bold block">کل سفارشات شما</span>
                    <span className="text-md font-black text-gray-800 font-mono">{toPersianDigits(orders.length)} سفارش</span>
                  </div>
                </div>
                <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm flex items-center gap-4">
                  <div className="w-12 h-12 bg-rose-50 rounded-xl text-rose-500 flex items-center justify-center">
                    <Heart className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[11px] text-gray-400 font-bold block">کالاهای علاقه‌مندی</span>
                    <span className="text-md font-black text-gray-800 font-mono">{toPersianDigits(user.wishlist?.length || 0)} محصول</span>
                  </div>
                </div>
                <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-50 rounded-xl text-blue-500 flex items-center justify-center">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[11px] text-gray-400 font-bold block">تیکت‌های فعال</span>
                    <span className="text-md font-black text-gray-800 font-mono">{toPersianDigits(tickets.filter(t => t.status !== "closed").length)} تیکت</span>
                  </div>
                </div>
              </div>

              {/* Recent Orders table summary list */}
              <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                <h3 className="text-xs font-black text-gray-800 mb-4 pb-2 border-b border-gray-50 flex items-center justify-between">
                  <span>آخرین سفارش‌های ثبت شده</span>
                  <button onClick={() => setTab("orders")} className="text-[11px] text-emerald-600 font-bold hover:underline">دیدن همه سفارشات</button>
                </h3>
                {orders.length === 0 ? (
                  <p className="text-xs text-gray-400 py-4 text-center">هیچ سفارشی هنوز یافت نشد.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-right text-xs">
                      <thead>
                        <tr className="text-gray-400 font-bold border-b border-gray-50">
                          <th className="pb-3">شماره سفارش</th>
                          <th className="pb-3 text-center">تاریخ سفارش</th>
                          <th className="pb-3 text-center">وضعیت سفارش</th>
                          <th className="pb-3 text-left">مجموع مبلغ پرداختی</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-y-gray-50">
                        {orders.slice(0, 3).map((ord) => (
                          <tr key={ord.id} className="hover:bg-gray-50/50">
                            <td className="py-3 font-mono font-bold text-gray-900">{ord.orderNumber}</td>
                            <td className="py-3 text-center text-gray-500">{formatPersianDate(ord.date)}</td>
                            <td className="py-3 text-center">
                              <span className={`px-2.5 py-1 border rounded-full text-[10px] font-semibold ${getStatusColor(ord.status)}`}>
                                {getFaStatus(ord.status)}
                              </span>
                            </td>
                            <td className="py-3 text-left font-mono font-black text-emerald-700">{formatPrice(ord.finalTotal)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: ORDERS HISTORY AND INVOICE */}
          {tab === "orders" && (
            <div className="space-y-6" id="orders-tab">
              {selectedInvoiceOrder ? (
                /* Print thermal invoice details receipt layout representing Woocommerce PDF format */
                <div className="bg-white border border-gray-200 rounded-2xl shadow-xl p-8" id="visual-invoice-receipt">
                  <div className="flex items-center justify-between pb-6 border-b border-gray-100 flex-wrap gap-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white text-md font-black">آ</div>
                      <div>
                        <h3 className="font-extrabold text-sm text-gray-900">فاکتور فروشگاه بزرگ آریا</h3>
                        <span className="text-[10px] text-gray-400 font-mono uppercase tracking-widest">Aria Receipt System</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => window.print()}
                        className="p-2 bg-gray-150 hover:bg-gray-200 rounded-xl text-gray-700 text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Printer className="w-4 h-4" />
                        <span>نسخه چاپی (PDF)</span>
                      </button>
                      <button 
                        onClick={() => setSelectedInvoiceOrder(null)}
                        className="p-2 border border-emerald-600 text-emerald-600 hover:bg-emerald-50 text-xs rounded-xl cursor-pointer"
                      >
                        بازگشت به تاریخچه
                      </button>
                    </div>
                  </div>

                  {/* Fact info metadata */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 py-6 border-b border-gray-150 text-xs">
                    <div className="space-y-1">
                      <span className="text-gray-450 block">شماره فاکتور:</span>
                      <strong className="font-mono text-gray-800">{selectedInvoiceOrder.orderNumber}</strong>
                    </div>
                    <div className="space-y-1">
                      <span className="text-gray-450 block">تاریخ صدور:</span>
                      <strong className="text-gray-800">{formatPersianDate(selectedInvoiceOrder.date)}</strong>
                    </div>
                    <div className="space-y-1">
                      <span className="text-gray-450 block">نوع پرداخت:</span>
                      <strong className="text-gray-800">{selectedInvoiceOrder.paymentMethod === "online" ? "درگاه بانکی آنلاین" : "پرداخت در محل (کارتخوان)"}</strong>
                    </div>
                    <div className="space-y-1">
                      <span className="text-gray-450 block">وضعیت پرداخت:</span>
                      <strong className={selectedInvoiceOrder.paymentStatus === "paid" ? "text-emerald-600 font-bold" : "text-amber-500 font-bold"}>
                        {selectedInvoiceOrder.paymentStatus === PaymentStatus.PAID ? "پرداخت شده" : "پرداخت نشده / کارتخوان"}
                      </strong>
                    </div>
                  </div>

                  {/* Add shipping info details */}
                  <div className="py-6 border-b border-gray-150 text-xs">
                    <h4 className="font-extrabold text-gray-800 mb-2">اطلاعات تحویل گیرنده (آدرس حمل و نقل):</h4>
                    <p className="text-gray-650 leading-relaxed">
                      <strong>گیرنده:</strong> {selectedInvoiceOrder.shippingAddress.probeName} | <strong>موبایل:</strong> {toPersianDigits(selectedInvoiceOrder.shippingAddress.probePhone)} <br />
                      <strong>نشانی:</strong> {selectedInvoiceOrder.shippingAddress.province}، {selectedInvoiceOrder.shippingAddress.city}، {selectedInvoiceOrder.shippingAddress.addressFull} (کد پستی: <span className="font-mono">{toPersianDigits(selectedInvoiceOrder.shippingAddress.postalCode)}</span>)
                    </p>
                    {selectedInvoiceOrder.trackingCode && (
                      <div className="mt-4 p-3 bg-teal-50 border border-teal-200 rounded-xl flex items-center gap-2">
                        <Truck className="w-4 h-4 text-teal-600" />
                        <span className="text-teal-800 font-semibold">
                          کد رهگیری مرسوله پستی: <strong className="font-mono text-slate-900 font-black">{toPersianDigits(selectedInvoiceOrder.trackingCode)}</strong>
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Products purchased loop */}
                  <div className="py-6 border-b border-gray-150">
                    <h4 className="text-xs font-black text-gray-800 mb-4">آیتم‌های فاکتور شده خریداری شده:</h4>
                    <div className="overflow-x-auto">
                      <table className="w-full text-right text-xs">
                        <thead>
                          <tr className="text-gray-400 font-bold border-b border-gray-50">
                            <th className="pb-2">تصویر کالا</th>
                            <th className="pb-2">شرح محصول</th>
                            <th className="pb-2 text-center">تعداد</th>
                            <th className="pb-2 text-center">قیمت واحد</th>
                            <th className="pb-2 text-left">مجموع کل</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {selectedInvoiceOrder.items.map((item, id) => (
                            <tr key={id}>
                              <td className="py-3.5">
                                <img src={item.image} alt="" className="w-12 h-12 rounded-lg object-cover" />
                              </td>
                              <td className="py-3.5">
                                <span className="font-semibold text-gray-900 block">{item.title}</span>
                                <span className="text-[10px] text-gray-400">SKU: {item.sku}</span>
                              </td>
                              <td className="py-3.5 text-center font-mono font-bold">{toPersianDigits(item.count)}</td>
                              <td className="py-3.5 text-center font-mono text-gray-500">{formatPrice(item.price)}</td>
                              <td className="py-3.5 text-left font-mono font-black text-gray-800">{formatPrice(item.price * item.count)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Totals bill section */}
                  <div className="py-6 flex justify-end">
                    <div className="w-72 space-y-3 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-450">جمع کل کالاها:</span>
                        <span className="font-mono font-bold text-gray-800">{formatPrice(selectedInvoiceOrder.subTotal)}</span>
                      </div>
                      {selectedInvoiceOrder.discountAmount > 0 && (
                        <div className="flex items-center justify-between text-rose-500">
                          <span>تخفیف/کوپن اعمال شده:</span>
                          <span className="font-mono font-bold">-{formatPrice(selectedInvoiceOrder.discountAmount)}</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-gray-450">هزینه ارسال مأمور:</span>
                        <span className="font-mono font-bold text-gray-800">
                          {selectedInvoiceOrder.shippingCost === 0 ? "رایگان" : formatPrice(selectedInvoiceOrder.shippingCost)}
                        </span>
                      </div>
                      <hr className="border-gray-200" />
                      <div className="flex items-center justify-between font-black text-emerald-700 text-sm">
                        <span>مبلغ نهایی پرداخت شده:</span>
                        <span className="font-mono">{formatPrice(selectedInvoiceOrder.finalTotal)}</span>
                      </div>
                    </div>
                  </div>

                </div>
              ) : (
                <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                  <h3 className="text-xs font-black text-gray-800 mb-6">لیست فاکتورهای سفارش شما</h3>
                  {orders.length === 0 ? (
                    <div className="text-center py-10 space-y-3">
                      <ShoppingBag className="w-12 h-12 text-gray-250 mx-auto" />
                      <p className="text-xs text-slate-400">سفارشی هنوز برای حساب شما ثبت نگردیده است.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {orders.map((ord) => (
                        <div key={ord.id} className="border border-gray-100 hover:border-emerald-350 p-5 rounded-2xl flex items-center justify-between flex-wrap gap-4 transition-all">
                          <div>
                            <span className="text-[10px] bg-slate-100 text-gray-500 px-2 py-0.5 rounded font-mono font-semibold">{ord.orderNumber}</span>
                            <h4 className="text-xs font-bold text-gray-900 mt-2">
                              خرید به مبلغ <span className="font-mono text-emerald-600 font-extrabold">{formatPrice(ord.finalTotal)}</span>
                            </h4>
                            <p className="text-[11px] text-gray-450 mt-1">تعداد اقلام: {toPersianDigits(ord.items.length)} عدد | تاریخ صدور: {formatPersianDate(ord.date)}</p>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <span className={`px-2.5 py-1 border rounded-lg text-[10px] font-semibold ${getStatusColor(ord.status)}`}>
                              {getFaStatus(ord.status)}
                            </span>
                            <button
                              onClick={() => setSelectedInvoiceOrder(ord)}
                              className="p-2 bg-emerald-50 hover:bg-emerald-600 text-emerald-600 hover:text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                            >
                              <FileText className="w-3.5 h-3.5" />
                              <span>فاکتور خرید</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: CONTACT ADDRESS LIST */}
          {tab === "addresses" && (
            <div className="space-y-6" id="addresses-tab">
              <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xs font-black text-gray-800">دفترچه نشانی‌ها و آدرس‌های تحویل</h3>
                  <button 
                    onClick={handleOpenAddAddress}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-md shadow-emerald-100"
                    id="add-address-btn"
                  >
                    <Plus className="w-4 h-4" />
                    <span>افزودن نشانی جدید</span>
                  </button>
                </div>

                {!user.addresses || user.addresses.length === 0 ? (
                  <div className="text-center py-10 space-y-2">
                    <MapPin className="w-12 h-12 text-gray-200 mx-auto" />
                    <p className="text-xs text-slate-400">آدرسی در این دفترچه ثبت نشده است. آدرس پیش‌فرض خرید را ثبت نمایید.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {user.addresses.map((a) => (
                      <div key={a.id} className="border border-gray-100 rounded-2xl p-5 flex flex-col justify-between hover:border-emerald-200 hover:shadow-sm transition-all relative">
                        {a.isDefault && (
                          <span className="absolute top-4 left-4 text-[10px] bg-emerald-50 text-emerald-800 font-bold border border-emerald-150 px-2.5 py-0.5 rounded-lg">
                            آدرس پیش‌فرض
                          </span>
                        )}
                        <div>
                          <h4 className="font-black text-xs text-gray-800 mb-2">{a.title}</h4>
                          <p className="text-xs text-gray-500 leading-relaxed mb-4">
                            <strong>گیرنده:</strong> {a.probeName} <br />
                            <strong>تلفن تماس:</strong> {toPersianDigits(a.probePhone)} <br />
                            <strong>آدرس کامل:</strong> {a.province}، {a.city}، {a.addressFull} <br />
                            <strong>کد پستی:</strong> <span className="font-mono">{toPersianDigits(a.postalCode)}</span>
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-2 border-t border-gray-50 pt-3 mt-3">
                          <button 
                            onClick={() => handleOpenEditAddress(a)}
                            className="p-1 text-gray-450 hover:text-emerald-600 hover:bg-emerald-50 rounded text-xs font-semibold flex items-center gap-1 cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                            <span>ویرایش</span>
                          </button>
                          <button
                            onClick={() => handleDeleteAddress(a.id)}
                            className="p-1 text-gray-450 hover:text-red-600 hover:bg-red-50 rounded text-xs font-semibold flex items-center gap-1 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>حذف</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Address editor popup modal */}
              {addressModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
                  <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-150">
                    <h3 className="font-black text-xs text-gray-900 mb-4">{editingAddressId ? "ویرایش آدرس خرید" : "ثبت آدرس و نشانی تحویل جدید"}</h3>
                    <form onSubmit={handleSaveAddress} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-bold text-gray-400 block mb-1">عنوان نشانی (مانند خانه یا شرکت) *</label>
                          <input type="text" value={addrTitle} onChange={e => setAddrTitle(e.target.value)} required className="w-full border border-gray-200 rounded-xl p-2.5 text-xs text-right" />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-gray-400 block mb-1">تلفن همراه تحویل‌گیرنده *</label>
                          <input type="text" value={addrProbePhone} onChange={e => setAddrProbePhone(e.target.value)} required className="w-full border border-gray-200 rounded-xl p-2.5 text-xs text-right" />
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-bold text-gray-400 block mb-1">نام و نام خانوادگی تحویل‌گیرنده *</label>
                        <input type="text" value={addrProbeName} onChange={e => setAddrProbeName(e.target.value)} required className="w-full border border-gray-200 rounded-xl p-2.5 text-xs text-right" />
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <label className="text-xs font-bold text-gray-400 block mb-1">استان *</label>
                          <input type="text" value={addrProvince} onChange={e => setAddrProvince(e.target.value)} required className="w-full border border-gray-200 rounded-xl p-2.5 text-xs text-right" />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-gray-400 block mb-1">شهر *</label>
                          <input type="text" value={addrCity} onChange={e => setAddrCity(e.target.value)} required className="w-full border border-gray-200 rounded-xl p-2.5 text-xs text-right" />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-gray-400 block mb-1">کد پستی ۱۰ رقمی</label>
                          <input type="text" value={addrPostalCode} onChange={e => setAddrPostalCode(e.target.value)} className="w-full border border-gray-200 rounded-xl p-2.5 text-xs text-right" />
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-bold text-gray-400 block mb-1">آدرس کامل پستی (خیابان، کوچه، شماره پلاک، واحد) *</label>
                        <textarea value={addrFull} onChange={e => setAddrFull(e.target.value)} required rows={3} className="w-full border border-gray-200 rounded-xl p-2.5 text-xs text-right" />
                      </div>
                      <div className="flex items-center justify-end gap-2 pt-4">
                        <button type="button" onClick={() => setAddressModalOpen(false)} className="px-4 py-2 border border-gray-200 text-gray-600 rounded-xl text-xs cursor-pointer">انصراف</button>
                        <button type="submit" className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold cursor-pointer shadow-md shadow-emerald-150">ذخیره آدرس</button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: WISHLIST CARDS GRID */}
          {tab === "wishlist" && (
            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm" id="wishlist-tab">
              <h3 className="text-xs font-black text-gray-800 mb-6">کالاهای مورد علاقه شما</h3>
              {wishlistProducts.length === 0 ? (
                <div className="text-center py-12 space-y-3">
                  <Heart className="w-12 h-12 text-gray-200 mx-auto" />
                  <p className="text-xs text-slate-400">هیچ محصولی هنوز لایک نشده است.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {wishlistProducts.map((p) => (
                    <div 
                      key={p.id} 
                      onClick={() => onNavigate("product", { id: p.id })}
                      className="border border-gray-100 hover:border-emerald-250 p-4 rounded-2xl flex flex-col justify-between cursor-pointer group shadow-sm transition-all"
                    >
                      <div className="relative overflow-hidden bg-gray-50 rounded-xl">
                        <img src={p.mainImage} alt="" className="w-full h-40 object-cover group-hover:scale-105 transition-all" />
                        <button 
                          onClick={(e) => removeWishlistItem(p.id, e)}
                          className="absolute top-2 left-2 p-1.5 bg-white/90 rounded-lg text-rose-500 hover:bg-white transition-all shadow-md active:scale-90"
                          title="حذف قلب"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <h4 className="text-xs font-bold mt-3 leading-relaxed text-gray-950 line-clamp-2">{p.title}</h4>
                      <div className="mt-4 pt-3 border-t border-gray-50 flex items-center justify-between text-xs">
                        <span className="font-mono text-emerald-700 font-extrabold">{formatPrice(p.discountPrice || p.price)}</span>
                        <span className="text-[10px] text-[emerald-650] bg-emerald-50 px-2 py-0.5 rounded-lg">خرید کالا +</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: DISCUSS TICKETS */}
          {tab === "tickets" && (
            <div className="space-y-6" id="tickets-tab">
              
              {activeTicket ? (
                /* Chat-style messaging layout */
                <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden flex flex-col h-[550px]" id="visual-chat-ticket">
                  
                  {/* Chat top header ribbon */}
                  <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] bg-slate-800 text-amber-500 px-2.5 py-1 rounded-md font-mono font-bold tracking-wider">{activeTicket.ticketNumber}</span>
                      <h4 className="font-extrabold text-xs text-white mt-2 leading-relaxed">{activeTicket.subject}</h4>
                    </div>
                    <button 
                      onClick={() => setActiveTicket(null)}
                      className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs transition-colors cursor-pointer"
                    >
                      ثبت تیکت جدید / بازگشت
                    </button>
                  </div>

                  {/* Message stack area */}
                  <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50">
                    {activeTicket.messages.map((msg) => {
                      const isAdmin = msg.author === "admin";
                      return (
                        <div key={msg.id} className={`flex ${isAdmin ? "justify-start" : "justify-end"} animate-in fade-in duration-100`}>
                          <div className={`max-w-[75%] rounded-2xl p-4 shadow-sm text-xs ${
                            isAdmin 
                              ? "bg-white text-gray-800 rounded-tr-none border border-gray-100" 
                              : "bg-emerald-600 text-white rounded-tl-none"
                          }`}>
                            <div className="flex items-center justify-between gap-12 text-[9px] mb-1.5 opacity-75 font-bold">
                              <span>فرستنده: {msg.authorName}</span>
                              <span className="font-mono">{formatPersianDate(msg.date)}</span>
                            </div>
                            <p className="leading-relaxed message-p whitespace-pre-wrap">{msg.text}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Chat input keyboard */}
                  <form onSubmit={handleSendChatMessage} className="p-4 bg-white border-t border-gray-100 flex items-center gap-3">
                    <input
                      type="text"
                      placeholder="متن پاسخ خود را اینج بنویسید..."
                      value={chatMessageInput}
                      onChange={e => setChatMessageInput(e.target.value)}
                      required
                      className="flex-1 border border-gray-200 rounded-xl p-3 text-xs focus:outline-none focus:border-emerald-500"
                    />
                    <button 
                      type="submit"
                      className="p-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-all cursor-pointer active:scale-95 flex items-center justify-center shrink-0"
                    >
                      <Send className="w-5 h-5 -rotate-90" />
                    </button>
                  </form>

                </div>
              ) : (
                <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xs font-black text-gray-800">تیکت‌های عیب‌یابی و پشتیبانی آریا</h3>
                    <button 
                      onClick={() => setTicketModalOpen(true)}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1 cursor-pointer shadow-md shadow-emerald-100"
                      id="create-new-ticket-btn"
                    >
                      <Plus className="w-4 h-4" />
                      <span>ثبت درخواست تیکت نو</span>
                    </button>
                  </div>

                  {tickets.length === 0 ? (
                    <div className="text-center py-10 space-y-2">
                      <MessageSquare className="w-12 h-12 text-gray-200 mx-auto" />
                      <p className="text-xs text-slate-400">تیکت و مشکلی تابه حال گزارش نشده است.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {tickets.map((t) => (
                        <div 
                          key={t.id} 
                          onClick={() => setActiveTicket(t)} 
                          className="border border-gray-100 hover:border-emerald-250 p-5 rounded-2xl flex items-center justify-between flex-wrap gap-4 transition-all cursor-pointer bg-white"
                        >
                          <div>
                            <span className="text-[10px] bg-slate-100 text-xs px-2.5 py-0.5 rounded font-mono font-extrabold tracking-wider">{t.ticketNumber}</span>
                            <h4 className="font-extrabold text-xs text-gray-900 mt-2 leading-relaxed">{t.subject}</h4>
                            <p className="text-[11px] text-gray-400 mt-1">بخش: {t.category === "order" ? "سفارشات مادی" : "دستگاه فنی"} | بروزرسانی: {formatPersianDate(t.updatedAt)}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={`px-2.5 py-0.5 rounded text-[10px] uppercase font-bold text-white ${
                              t.priority === "high" ? "bg-rose-500" : t.priority === "medium" ? "bg-amber-500" : "bg-teal-500"
                            }`}>
                              اولویت: {t.priority === "high" ? "بالا" : t.priority === "medium" ? "متوسط" : "کم"}
                            </span>
                            <span className={`px-2.5 py-1 border rounded-lg text-[10px] font-semibold ${
                              t.status === "closed" ? "bg-gray-100 text-gray-400 border-gray-200" : "bg-emerald-50 text-emerald-700 border-emerald-200"
                            }`}>
                              {t.status === "closed" ? "بسته شده" : t.status === "pending" ? "پاسخ جدید ادمین" : "باز - در انتظار"}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Creator Support Ticket dialog */}
              {ticketModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
                  <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-150">
                    <h3 className="font-black text-xs text-gray-900 mb-4">ثبت تیکت فنی به پشتیبانان آریا</h3>
                    <form onSubmit={handleCreateTicketInAPI} className="space-y-4">
                      <div>
                        <label className="text-xs font-bold text-gray-400 block mb-1">موضوع تیکت چیست؟ *</label>
                        <input type="text" value={newTicketSubject} onChange={e => setNewTicketSubject(e.target.value)} required className="w-full border border-gray-200 rounded-xl p-2.5 text-xs text-right" placeholder="طرح خلاصه موضوع" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-bold text-gray-400 block mb-1">بخش مربوطه (طبقه‌بندی)</label>
                          <select value={newTicketCategory} onChange={e => setNewTicketCategory(e.target.value as any)} className="w-full border border-gray-200 rounded-xl p-2.5 text-xs text-right bg-white">
                            <option value="order">سفارش و تسویه نهایی</option>
                            <option value="financial">امور مالی و مادی</option>
                            <option value="technical">پشتیبانی پورتال فنی</option>
                            <option value="suggestion">انتقادات و پیشنهادات</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-xs font-bold text-gray-400 block mb-1">میزان اولویت برطرف‌سازی</label>
                          <select value={newTicketPriority} onChange={e => setNewTicketPriority(e.target.value as any)} className="w-full border border-gray-200 rounded-xl p-2.5 text-xs text-right bg-white">
                            <option value="low">کم (مواردی مثل پیشنهاد)</option>
                            <option value="medium">متوسط (بسته‌بندی)</option>
                            <option value="high">بالا و خیلی فوری</option>
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-bold text-gray-400 block mb-1">شرح دقیق درخواست یا شکایت شما *</label>
                        <textarea value={newTicketMessage} onChange={e => setNewTicketMessage(e.target.value)} required rows={4} className="w-full border border-gray-200 rounded-xl p-2.5 text-xs text-right" placeholder="توضیحات لازم را در این بخش مکتوب نمایید..." />
                      </div>
                      <div className="flex items-center justify-end gap-2 pt-4">
                        <button type="button" onClick={() => setTicketModalOpen(false)} className="px-4 py-2 border border-gray-200 text-gray-600 rounded-xl text-xs cursor-pointer">لغو عملیات</button>
                        <button type="submit" className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold cursor-pointer">ثبت و ارسال تیکت</button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 6: SETTINGS AND PROFILE FORM */}
          {tab === "details" && (
            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm" id="details-tab">
              <h3 className="text-xs font-black text-gray-800 mb-6 pb-2 border-b border-gray-50">ویرایش اطلاعات شناسایی و کلمه عبور</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* Identification profile details */}
                <form onSubmit={handleProfileSave} className="space-y-4">
                  <h4 className="font-bold text-xs text-emerald-700 mb-3 block">مشخصات عمومی</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-gray-400 block mb-1">نام کوچک</label>
                      <input type="text" value={profileName} onChange={e => setProfileName(e.target.value)} required className="w-full border border-gray-200 rounded-xl p-2.5 text-xs text-right" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-400 block mb-1">نام خانوادگی</label>
                      <input type="text" value={profileLastName} onChange={e => setProfileLastName(e.target.value)} className="w-full border border-gray-200 rounded-xl p-2.5 text-xs text-right" />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-400 block mb-1">طراحی لینک عکس مچ (پروفایل تصویر)</label>
                    <input type="text" value={profileImage} onChange={e => setProfileImage(e.target.value)} placeholder="https://images.unsplash.com/..." className="w-full border border-gray-200 rounded-xl p-2.5 text-[10px] font-mono text-left" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-gray-400 block mb-1">شماره تلفن همراه</label>
                      <input type="text" value={profilePhone} onChange={e => setProfilePhone(e.target.value)} required className="w-full border border-gray-200 rounded-xl p-2.5 text-xs text-right" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-400 block mb-1">تاریخ تولد (روز/ماه/سال)</label>
                      <input type="text" value={profileDob} onChange={e => setProfileDob(e.target.value)} placeholder="1375/02/11" className="w-full border border-gray-200 rounded-xl p-2.5 text-xs text-right" />
                    </div>
                  </div>

                  <div className="space-y-2 pt-2">
                    <label className="text-xs font-bold text-gray-400 block">مشخصات اطلاع‌رسانی</label>
                    <div className="flex items-center gap-2">
                      <input type="checkbox" id="news_sub" checked={newsletterSub} onChange={e => setNewsletterSub(e.target.checked)} className="rounded text-emerald-600 focus:ring-emerald-500" />
                      <label htmlFor="news_sub" className="text-xs text-gray-600 cursor-pointer">عضویت در خبرنامه تبلیغاتی</label>
                    </div>
                    <div className="flex items-center gap-2">
                      <input type="checkbox" id="sms_sub" checked={smsSub} onChange={e => setSmsSub(e.target.checked)} className="rounded text-emerald-600 focus:ring-emerald-500" />
                      <label htmlFor="sms_sub" className="text-xs text-gray-600 cursor-pointer">دریافت پیامک زمان‌بندی سفارش</label>
                    </div>
                  </div>

                  <button type="submit" className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-110 cursor-pointer pt-3">
                    ذخیره تغییرات عمومی
                  </button>
                </form>

                {/* Change pass panel */}
                <form onSubmit={handlePasswordChange} className="space-y-4 bg-gray-50/50 p-5 rounded-2xl border border-gray-100">
                  <h4 className="font-bold text-xs text-emerald-700 mb-3 block flex items-center gap-1">
                    <Key className="w-4 h-4" />
                    <span>تغییر دادن رمز عبور حساب</span>
                  </h4>
                  
                  {passError && <p className="text-[10px] text-red-650 font-bold">⚠️ {passError}</p>}
                  {passSuccess && <p className="text-[10px] text-emerald-650 font-bold">✓ {passSuccess}</p>}

                  <div>
                    <label className="text-xs font-semibold text-gray-555 block mb-1">پسورد فعلی حساب *</label>
                    <input type="password" value={currPass} onChange={e => setCurrPass(e.target.value)} required className="w-full border border-gray-200 rounded-xl p-2.5 text-xs text-right bg-white" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-555 block mb-1">کلمه عبور جدید ورود *</label>
                    <input type="password" value={newPass} onChange={e => setNewPass(e.target.value)} required className="w-full border border-gray-200 rounded-xl p-2.5 text-xs text-right bg-white" />
                  </div>
                  <p className="text-[10px] text-gray-400">پس از تغییر کلمه عبور، ورود بعدی شما تنها با رمز عبور جدید میسر خواهد بود.</p>
                  
                  <button type="submit" className="px-6 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-all cursor-pointer">
                    تغییر کلمه عبور
                  </button>
                </form>

              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
