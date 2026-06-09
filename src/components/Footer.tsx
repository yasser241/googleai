/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  Phone, Mail, MapPin, Send, Instagram, MessageSquare, ShieldCheck, 
  Truck, ArrowUpRight, HelpCircle
} from "lucide-react";
import { AppSettings } from "../types";
import { toPersianDigits } from "../utils";

interface FooterProps {
  settings: AppSettings;
  onNavigate: (view: string, params?: any) => void;
}

export default function Footer({ settings, onNavigate }: FooterProps) {
  const [emailInput, setEmailInput] = useState("");
  const [newsfeedSuccess, setNewsfeedSuccess] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) return;
    
    // Simulate API registration call
    setNewsfeedSuccess(true);
    setEmailInput("");
    setTimeout(() => setNewsfeedSuccess(false), 5000);
  };

  return (
    <footer className="bg-slate-900 text-slate-300 font-sans border-t border-slate-850" id="shop-footer">
      
      {/* Top USP bar (Unique Selling Propositions) */}
      <div className="border-b border-slate-800 bg-slate-950/40">
        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div className="flex flex-col items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Truck className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-sm text-slate-100">ارسال سریع و مطمئن</h4>
            <p className="text-xs text-slate-400">تحویل پیشتاز ۲۴ الی ۷۲ ساعته به تمام نقاط کشور</p>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-sm text-slate-100">ضمانت اصالت و سلامت</h4>
            <p className="text-xs text-slate-400">تست کامل سلامت کالاها پیش از بسته‌بندی نهایی</p>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <HelpCircle className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-sm text-slate-100">پشتیبانی ۲۴ ساعته</h4>
            <p className="text-xs text-slate-400">سیستم ثبت تیکت پیشرفته در پنل کاربری برای رفع دغدغه‌ها</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Col 1: About & Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white font-bold text-md">
                آ
              </div>
              <span className="font-bold text-md text-white">{settings.storeName}</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed text-right">
              فروشگاه اینترنتی آریا به عنوان یکی از پیشرفته‌ترین پلتفرم‌های تامین امن کالا، مفتخر است اصیل‌ترین ابزارهای دیجیتال و پوشاک برگزیده بازار را به دست خریداران خوش‌سلیقه برساند.
            </p>
            <div className="flex items-center gap-3 pt-2 text-slate-400">
              {settings.socials?.instagram && (
                <a href={`https://instagram.com/${settings.socials.instagram}`} target="_blank" rel="noreferrer" className="hover:text-amber-500 transition-colors">
                  <Instagram className="w-4 h-4" />
                </a>
              )}
              {settings.socials?.telegram && (
                <a href={`https://t.me/${settings.socials.telegram}`} target="_blank" rel="noreferrer" className="hover:text-blue-400 transition-colors">
                  <Send className="w-4 h-4" />
                </a>
              )}
              {settings.socials?.whatsapp && (
                <a href={`https://wa.me/${settings.socials.whatsapp}`} target="_blank" rel="noreferrer" className="hover:text-emerald-400 transition-colors">
                  <MessageSquare className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>

          {/* Col 2: Info links */}
          <div>
            <h4 className="text-sm font-bold text-slate-100 mb-4 border-r-2 border-emerald-500 pr-2">راهنمای مشتریان</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => onNavigate("info", { page: "rules" })} className="hover:text-emerald-400 transition-colors flex items-center gap-1">
                  <ArrowUpRight className="w-3" /> قوانینی و مقررات خرید
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate("info", { page: "privacy" })} className="hover:text-emerald-400 transition-colors flex items-center gap-1">
                  <ArrowUpRight className="w-3" /> حریم خصوصی کاربران
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate("info", { page: "faq" })} className="hover:text-emerald-400 transition-colors flex items-center gap-1">
                  <ArrowUpRight className="w-3" /> سؤالات متداول (FAQ)
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate("info", { page: "about" })} className="hover:text-emerald-400 transition-colors flex items-center gap-1">
                  <ArrowUpRight className="w-3" /> مرام‌نامه و درباره ما
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Contact */}
          <div>
            <h4 className="text-sm font-bold text-slate-100 mb-4 border-r-2 border-emerald-500 pr-2">مشخصات تماس</h4>
            <ul className="space-y-3 text-xs text-slate-400">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{settings.address}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="font-mono">{toPersianDigits(settings.phone)}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="font-mono">{settings.email}</span>
              </li>
            </ul>
          </div>

          {/* Col 4: Newsletter */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-slate-100 border-r-2 border-emerald-500 pr-2">خبرنامه تخفیفی</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              {settings.newsletterIntro}
            </p>
            <form onSubmit={handleSubscribe} className="relative mt-2">
              <input
                type="email"
                placeholder="ایمیل خود را بنویسید..."
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                className="w-full pl-12 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-emerald-500 focus:bg-slate-850"
                id="footer-email-input"
              />
              <button 
                type="submit"
                className="absolute left-1 top-1 bg-emerald-500 hover:bg-emerald-600 text-slate-900 rounded-lg p-1.5 transition-colors cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
            {newsfeedSuccess && (
              <p className="text-[10px] text-emerald-400 animate-pulse font-bold">
                ✓ ایمیل شما با موفقیت در لیست باشگاه مشتریان ثبت گردید.
              </p>
            )}
            
            {/* Visual Trust Emblem boxes */}
            <div className="flex items-center gap-2 pt-2">
              <div className="w-12 h-12 bg-white/5 rounded-lg flex items-center justify-center border border-white/10" title="نماد اعتماد الکترونیکی">
                <div className="text-[9px] font-bold text-slate-500">eNamad</div>
              </div>
              <div className="w-12 h-12 bg-white/5 rounded-lg flex items-center justify-center border border-white/10" title="نشان ملی ساماندهی">
                <div className="text-[9px] font-bold text-slate-500 font-sans">Samandehi</div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-10 pt-6 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>{settings.footerText}</p>
          <span className="font-mono text-[9px] uppercase tracking-widest text-slate-600">
            Powered by Node.js & React v19
          </span>
        </div>
      </div>
    </footer>
  );
}
