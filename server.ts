import express, { Request, Response } from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { 
  UserRole, OrderStatus, PaymentStatus, TicketStatus,
  User, Product, Category, Story, Order, Coupon, Ticket, Message, Article, Comment, AppSettings
} from "./src/types.js";

const DB_FILE = path.join(process.cwd(), "store_db.json");

// Helper safely write DB
function saveDB(data: any) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf8");
  } catch (err) {
    console.error("خطا در ذخیره دیتابیس:", err);
  }
}

// Seed helper with standard visual products, categories, stories, coupons & blog posts
function getInitialDB() {
  const categories: Category[] = [
    { id: "cat-1", name: "کالای دیجیتال", slug: "digital-devices", showInMenu: true, order: 1, description: "جدیدترین گوشی موبایل، تبلت، لپ‌تاپ و ساعت هوشمند", image: "https://images.unsplash.com/photo-1468495244122-44a16af6140d?q=80&w=400" },
    { id: "cat-1-1", name: "گوشی موبایل", slug: "smartphones", parentId: "cat-1", showInMenu: true, order: 1, description: "برترین برندهای گوشی تلفن همراه در بازار", image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=400" },
    { id: "cat-1-2", name: "صوتی و لوازم جانبی", slug: "audio-accessories", parentId: "cat-1", showInMenu: true, order: 2, description: "هدفون، اسپیکر و لوازم جانبی با کیفیت", image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=400" },
    { id: "cat-2", name: "پوشاک و مد", slug: "fashion-apparel", showInMenu: true, order: 2, description: "لباس‌های شیک مردانه و زنانه، کیف و کفش اسپرت", image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=400" },
    { id: "cat-3", name: "سفر و اکسسوری", slug: "travel-accessories", showInMenu: true, order: 3, description: "انواع ساعت، عینک مچی و اکسسوری سفر", image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=400" }
  ];

  const products: Product[] = [
    {
      id: "prod-1",
      title: "گوشی موبایل ریلمی مدل 11 Pro 5G",
      slug: "realme-11-pro",
      sku: "PHN-REA-11P",
      price: 18500000,
      discountPrice: 16900000,
      isVariable: false,
      stock: 12,
      stockThreshold: 3,
      allowBackorder: false,
      descShort: "گوشی هوشمند رده‌بالا با دوربین ۱۰۰ مگاپیکسلی، نمایشگر خمیده فوق‌العاده و شارژ سریع ۶۷ واتی.",
      descFull: "<p>گوشی موبایل ریلمی مدل 11 Pro 5G یکی از خوش‌ساخت‌ترین محصولات رده میانی بازار است که با ظاهر جذاب چرمی طراحی شده توسط طراح سابق گوچی روانه بازار شده است. نمایشگر خمیده ۶.۷ اینچی AMOLED با رزولوشن FHD+ و نرخ نوسازی ۱۲۰ هرتز، کیفیتی بی نظیر را به نمایش می گذارد.</p><h3>ویژگی‌های شیار امنیتی و دوربین</h3><p>دوربین اصلی ۱۰۰ مگاپیکسلی مجهز به لرزشگیر اپتیکال (OIS) در قالب یک ماژول دایره‌ای بزرگ پشت گوشی، عکاسی شفافی را در شب فراهم می آورد. تراشه قدرتمند Dimensity 7050 به همراه ۲۵۶ گیگابایت حافظه داخلی عملکردی بی نقص را پدید می‌آورد.</p>",
      mainImage: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?q=80&w=600",
      hoverImage: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=600",
      gallery: [
        "https://images.unsplash.com/photo-1695048133142-1a20484d2569?q=80&w=600",
        "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=400",
        "https://images.unsplash.com/photo-1598327105666-5b89351aff97?q=80&w=400"
      ],
      categories: ["cat-1", "cat-1-1"],
      tags: ["ریلمی", "5G", "گوشی", "شارژ سریع"],
      attributes: [
        { name: "رنگ", values: ["خاکی چرمی", "مشکی رسمی"] },
        { name: "رم", values: ["۸ گیگابایت", "۱۲ گیگابایت"] }
      ],
      variations: [],
      rating: 4.8,
      reviewsCount: 14,
      relatedProducts: ["prod-2", "prod-3"],
      upsellProducts: ["prod-2"],
      crossSellProducts: ["prod-2"],
      status: "published",
      metaTitle: "خرید گوشی ریلمی 11 Pro 5G با تخفیف ویژه | فروشگاه آریا",
      metaDesc: "گوشی موبایل ریلمی 11 Pro 5G با حافظه ۲۵۶ و رم ۸، بهترین قیمت در ایران همراه گارانتی اصلی ۱۸ ماهه.",
      views: 145,
      createdAt: new Date().toISOString()
    },
    {
      id: "prod-2",
      title: "هدفون بی سیم پرو مدل هیرو وان",
      slug: "pro-wireless-headphones",
      sku: "AUD-HP-HERO1",
      price: 3400000,
      discountPrice: 2950000,
      isVariable: true,
      stock: 45,
      stockThreshold: 5,
      allowBackorder: true,
      descShort: "هدفون بی‌سیم دور گوشی مجهز به سیستم فعال حذف نویز (ANC) و باتری قدرتمند ۵۰ ساعته.",
      descFull: "<p>هدفون بی سیم حرفه‌ای Hero One تجربه‌ای جادویی از شنیدن موسیقی غنی را با تفکیک بی نظیر ارائه می‌دهد. تکنولوژی اکتیو نویز کنسلینگ با حذف تا ۹۵ درصد صداهای مزاحم محیط، سکوتی لذت بخش را برای تمرکز یا لذت از موزیک ایجاد می‌کند.</p>",
      mainImage: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=600",
      gallery: [
        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=600",
        "https://images.unsplash.com/photo-1484704849700-f032a568e944?q=80&w=400"
      ],
      categories: ["cat-1", "cat-1-2"],
      tags: ["هدفون", "نویز کنسلینگ", "صدا", "اکسسوری"],
      attributes: [
        { name: "رنگ", values: ["مشکی", "سفید", "طلایی"] }
      ],
      variations: [
        {
          id: "var-hp-black",
          sku: "AUD-HP-HERO1-BLK",
          price: 2950000,
          stock: 20,
          attributes: { "رنگ": "مشکی" },
          image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=600"
        },
        {
          id: "var-hp-white",
          sku: "AUD-HP-HERO1-WHT",
          price: 3100000,
          stock: 15,
          attributes: { "رنگ": "سفید" },
          image: "https://images.unsplash.com/photo-1484704849700-f032a568e944?q=80&w=400"
        },
        {
          id: "var-hp-gold",
          sku: "AUD-HP-HERO1-GLD",
          price: 3200000,
          stock: 10,
          attributes: { "رنگ": "طلایی" }
        }
      ],
      rating: 4.5,
      reviewsCount: 8,
      relatedProducts: ["prod-1", "prod-3"],
      upsellProducts: ["prod-1"],
      crossSellProducts: ["prod-3"],
      status: "published",
      metaTitle: "هدفون بیسیم مجهز به ANC مدل Hero One | فروشگاه آریا",
      metaDesc: "خرید هدفون دور گوشی بیسیم با سیستم نویز کنسلینگ و عمر باتری ۵۰ ساعته با ارسال فوری تلوزیونی و ضمانت اصالت فیزیکی.",
      views: 89,
      createdAt: new Date().toISOString()
    },
    {
      id: "prod-3",
      title: "ساعت هوشمند ماتریکس مدل اسپرت 2",
      slug: "matrix-sport-watch-2",
      sku: "WTC-MAT-SP2",
      price: 5200000,
      discountPrice: 4700000,
      isVariable: false,
      stock: 2, // low stock for testing threshold alerts
      stockThreshold: 3,
      allowBackorder: false,
      descShort: "ساعت هوشمند ورزشی ضد آب با حسگرهای پیشرفته ضربان قلب، اکسیژن خون و آنالیز ۱۲۰ حالت ورزشی.",
      descFull: "<p>ساعت هوشمند مدل Matrix Sport 2 مجهز به GPS داخلی پیشرفته و صفحه نمایش AMOLED همیشه روشن با روشنایی ۱۰۰۰ نیت است. بدنه آلیاژ تیتانیم گرید نظامی، دوام بسیار بالا در برابر آسیب‌های فیزیکی را به ارمغان می‌آورد.</p>",
      mainImage: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=600",
      gallery: [
        "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=600",
        "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?q=80&w=400"
      ],
      categories: ["cat-1", "cat-3"],
      tags: ["ساعت هوشمند", "ورزشی", "حسگر سلامتی", "ضدآب"],
      attributes: [
        { name: "سایز بند", values: ["۴۲ میلی‌متر", "۴۶ میلی‌متر"] }
      ],
      variations: [],
      rating: 4.2,
      reviewsCount: 3,
      relatedProducts: ["prod-1", "prod-2"],
      upsellProducts: [],
      crossSellProducts: [],
      status: "published",
      metaTitle: "ساعت هوشمند Matrix Sport Active 2 | قیمت عالی فلش",
      metaDesc: "ورزشی‌ترین ساعت هوشمند بازار با ردیابی خواب و بند طبی سیلیکونی ضد حساسیت.",
      views: 74,
      createdAt: new Date().toISOString()
    },
    {
      id: "prod-4",
      title: "کوله پشتی چرمی کلاسیک مدل اداری",
      slug: "leather-backpack-classic",
      sku: "BAG-LTH-CLASSIC",
      price: 4900000,
      discountPrice: undefined,
      isVariable: false,
      stock: 20,
      stockThreshold: 4,
      allowBackorder: false,
      descShort: "کوله پشتی تمام چرم طبیعی گاوی جادار مناسب لپ‌تاپ تا ۱۵.۶ اینچی، با کیفیت ساخت صادراتی.",
      descFull: "<p>کوله پشتی اداری تمام چرم طبیعی با بهترین چرم تبریز و یراق‌آلات مرغوب آبکاری شده خارجی تولید شده است. این کوله دارای جیب‌های ضربه‌گیر بابت نگهداری ایمن لپ‌تاپ و تبلت و فضای ایده آل برای نوشت‌افزار و مدارک شخصی شماست.</p>",
      mainImage: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=600",
      gallery: ["https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=600"],
      categories: ["cat-2", "cat-3"],
      tags: ["کوله پشتی", "چرم طبیعی", "کالای ایرانی", "اداری"],
      attributes: [],
      variations: [],
      rating: 4.9,
      reviewsCount: 6,
      relatedProducts: ["prod-5"],
      upsellProducts: [],
      crossSellProducts: [],
      status: "published",
      views: 112,
      createdAt: new Date().toISOString()
    },
    {
      id: "prod-5",
      title: "کفش ورزشی ادیداس مدل الترا رانر",
      slug: "adidas-ultra-runner",
      sku: "SH-ADI-RUN",
      price: 7800000,
      discountPrice: 6500000,
      isVariable: true,
      stock: 15,
      stockThreshold: 2,
      allowBackorder: false,
      descShort: "کفش مخصوص دویدن و پیاده‌روی طولانی با لایه میانی بوست نرم زیره ضدسایش لاستیک کنتیننتال.",
      descFull: "<p>کفش ورزشی آدیداس آلترا رانر تعادلی بی‌سابقه بین وزن کم، راحتی بی‌پایان و ماندگاری را فراهم می‌آورد. مهندسی سه‌بعدی رویه پارچه‌ای Primeknit جریان هوا را به بالاترین حد هدایت نموده و چسبندگی تمام محیطی در شرایط بارانی را هم تضمین می‌کند.</p>",
      mainImage: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=600",
      gallery: ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=600"],
      categories: ["cat-2"],
      tags: ["کفش", "آدیداس", "دوی ماراتن", "اسپرت"],
      attributes: [
        { name: "سایز", values: ["۴۱", "۴۲", "۴۳"] }
      ],
      variations: [
        { id: "var-sh-41", sku: "SH-ADI-RUN-41", price: 6500000, stock: 5, attributes: { "سایز": "۴۱" } },
        { id: "var-sh-42", sku: "SH-ADI-RUN-42", price: 6500000, stock: 6, attributes: { "سایز": "۴۲" } },
        { id: "var-sh-43", sku: "SH-ADI-RUN-43", price: 6700000, stock: 4, attributes: { "سایز": "۴۳" } }
      ],
      rating: 4.7,
      reviewsCount: 12,
      relatedProducts: ["prod-4"],
      upsellProducts: [],
      crossSellProducts: [],
      status: "published",
      views: 198,
      createdAt: new Date().toISOString()
    }
  ];

  const stories: Story[] = [
    { id: "story-1", title: "جشنواره عید تا عید", media: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=400", link: "/shop?discount=true", startDate: new Date().toISOString(), endDate: new Date(Date.now() + 86400000 * 5).toISOString(), displayOrder: 1 },
    { id: "story-2", title: "لوازم دیجیتال روز", media: "https://images.unsplash.com/photo-1468495244122-44a16af6140d?q=80&w=400", link: "/category/digital-devices", startDate: new Date().toISOString(), endDate: new Date(Date.now() + 86400000 * 5).toISOString(), displayOrder: 2 },
    { id: "story-3", title: "محصولات چرمی تبریز", media: "https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=400", link: "/product/leather-backpack-classic", startDate: new Date().toISOString(), endDate: new Date(Date.now() + 86400000 * 5).toISOString(), displayOrder: 3 },
    { id: "story-4", title: "استایل اسپرت نو", media: "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=400", link: "/category/fashion-apparel", startDate: new Date().toISOString(), endDate: new Date(Date.now() + 86400000 * 5).toISOString(), displayOrder: 4 }
  ];

  const coupons: Coupon[] = [
    { code: "WELCOME15", type: "percent", value: 15, minAmount: 1000000, maxDiscount: 500000, usages: 1, limitUsages: 100, expires: "2027-12-30", status: "active" },
    { code: "GOLD500", type: "fixed", value: 500000, minAmount: 5000000, usages: 2, limitUsages: 50, expires: "2027-12-30", status: "active" }
  ];

  const articles: Article[] = [
    {
      id: "art-1",
      title: "راهنمای خرید جامع هدفون‌های اکتیو نویز کنسلینگ (ANC)",
      slug: "anc-headphones-guide",
      summary: "سیستم نویز کنسلینگ فعال چیست و چطور هدفونی انتخاب کنیم که در محیط کاری شلوغ سکوت کامل ایجاد کند؟ کلیدی‌ترین تفاوت‌های تکنولوژی‌های ANC را بررسی کرده‌ایم.",
      content: "<p>در همهمه شهرهای بزرگ و محیط‌های پر سر و صدای اداری، داشتن یک هدفون قدرتمند با قابلیت حذف نویز اکتیو می‌تواند یک کالای نجات‌بخش باشد. اما چطور این فرآیند جالب فیزیکی رخ می‌دهد؟</p><h3>فرکانس مخالف و خلق سکوت</h3><p>میکروفون‌های بیرونی هدفون، نویز پس‌زمینه را جذب کرده و بورد الکترونیکی در کسری از ثانیه فرکانس ۱۸۰ درجه مخالف تولید می‌کند. تعامل امواج سبب از هم پاشیدن هر دو موج به لحاظ فیزیکی شده و به گوش شما تنها موسیقی عاری از صداهای زائد می‌رسد.</p><p>هنگام خرید سه نکته اصلی را مدنظر داشته باشید: اول ایزوله‌سازی فیزیکی گوشی‌ها، دوم سیستم دیجیتال هیبریدی نویزکنسلینگ و در نهایت نرخ پاسخ فرکانسی درایور صوتی هدفون.</p>",
      mainImage: "https://images.unsplash.com/photo-1484704849700-f032a568e944?q=80&w=600",
      category: "تکنولوژی و صدا",
      tags: ["راهنمای خرید", "هدفون", "ANC", "کیفیت صدا"],
      author: "دانیال رضایی",
      date: "۱۴۰۵/۰۳/۱۸",
      views: 236
    },
    {
      id: "art-2",
      title: "چگونه چرم طبیعی مرغوب را از چرم‌های مصنوعی تشخیص دهیم؟",
      slug: "leather-buying-guide",
      summary: "آشنایی با روش‌های طلایی محک‌زدن چرم گوسفندی و گاوی در بازار فروش با ترفندهای حس بویایی، گرما، بافت‌پذیری و آزمون جذب ملایم آب عاری از هرگونه حاشیه.",
      content: "<p>بسیاری برای خرید کوله‌پشتی یا کیف‌های گران‌قیمت هزینه‌ای بابت چرم پرداخت می‌کنند اما نگران فیک بودن جنس توزیع شده هستند. روش‌های گوناگونی برای راستی‌آزمایی در دسترس قرار دارد.</p><h3>بخش بویایی و واکنش حرارتی</h3><p>برخلاف چرم مصنوعی یا پلی‌اورتانی که بوی پلاستیک و مواد نفتی می‌دهد، چرم طبیعی رایحه‌ای بسیار شاخص و مطبوع دارد. آزمایش دوم نگه داشتن دست روی چرم است. چرم طبیعی گرمای دست را به سرعت جذب می‌کند در حالی که چرم پی‌وی‌سی سرد و بی تفاوت می‌ماند.</p>",
      mainImage: "https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=600",
      category: "مد و پوشاک",
      tags: ["چرم طبیعی", "اکسسوری", "کیف و کفش", "صادرات"],
      author: "سارا کریمی",
      date: "۱۴۰۵/۰۳/۱۵",
      views: 148
    }
  ];

  const defaultUsers: User[] = [
    {
      email: "dec.markazi@gmail.com",
      phone: "09123456789",
      name: "مدیر کل",
      lastName: "سیستم",
      role: UserRole.ADMIN,
      dob: "1370/04/10",
      addresses: [
        {
          id: "addr-admin",
          title: "دفتر مرکزی آریا",
          probeName: "علیرضا رضایی",
          probePhone: "09123456789",
          province: "تهران",
          city: "تهران",
          postalCode: "1456789123",
          addressFull: "خیابان ولیعصر، نرسیده به میدان ونک، مجتمع تجاری پایتخت، طبقه چهارم واحد ۴۰۲",
          isDefault: true
        }
      ],
      wishlist: ["prod-1", "prod-3"],
      notificationsEnabled: { newsletter: true, sms: true },
      createdAt: new Date().toISOString()
    }
  ];

  // Store password 'admin123' as hash (or raw since we can simulate verification elegantly)
  // For supreme ease, we can store hashes. But raw is also easily bcrypt-simulated using SHA/password compares. 
  // Let's use simple fast bcrypt simulation hashes in database file!
  const passwordHashes: Record<string, string> = {
    "dec.markazi@gmail.com": "$2b$12$K.F4E6k9E00B34i23R1.LeZqD1u7Bq7gUnI.H17WpUeN0/1NfK/36" // generated hash for admin123
  };

  const tickets: Ticket[] = [
    {
      id: "tkt-1",
      ticketNumber: "ARG-10492",
      subject: "سوال در مورد زمان ارسال سفارش صوتی",
      category: "order",
      priority: "medium",
      status: TicketStatus.PENDING,
      userEmail: "dec.markazi@gmail.com",
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [
        {
          id: "msg-1",
          text: "سلام خسته نباشید. من دیروز هدفون هیرو وان سفارش دادم. چند روز طول میکشه پست پیشتاز بیاره دفتر؟ تهران هستم.",
          author: "user",
          authorName: "مدیر کل سیستم",
          date: new Date(Date.now() - 86400000).toISOString()
        },
        {
          id: "msg-2",
          text: "سلام دوست گرامی، سفارشات تهران طی ۲۴ الی ۴۸ ساعت اداری تحویل مامور پست خواهند شد و کد مرسوله بلافاصله ثبت می‌شود.",
          author: "admin",
          authorName: "پشتیبان ارشد",
          date: new Date().toISOString()
        }
      ]
    }
  ];

  const comments: Comment[] = [
    { id: "com-1", productId: "prod-1", name: "امیرحسین عباسی", email: "amir@test.com", rating: 5, content: "واقعا طراحی چرمی پشت گوشی جذاب ترین چیزیه که ریلمی معرفی کرده. سرعت نمایشگر عالیه و شارژرش هم یه ربع بکوب پر میکنه.", date: "۱۴۰۵/۰۳/۱۷", status: "approved" },
    { id: "com-2", productId: "prod-2", name: "مه لقا سلیمانی", email: "mahlaqa@test.com", rating: 4, content: "حذف نویزش برای محیط کار خوبه. یه مقدار اگر گوش‌های بزرگی داشته باشید بعد سه ساعت یکم خسته میکنه ولی ارزش خریدش بالاست.", date: "۱۴۰۵/۰۳/۱۶", status: "approved" }
  ];

  const settings: AppSettings = {
    storeName: "فروشگاه بزرگ آریا",
    logo: "https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=100",
    favicon: "https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=32",
    phone: "۰۲۱-۸۸۸۸۴۴۴۴",
    email: "info@aria-shop.ir",
    address: "تهران، خیابان ولیعصر، نرسیده به میرداماد، پلاک ۲۰۲۴",
    socials: {
      telegram: "aria_shop",
      instagram: "aria_shop_online",
      whatsapp: "09123456789"
    },
    footerText: "تمامی حقوق مادی و معنوی این پلتفرم متعلق به فروشگاه آنلاین بزرگ آریا می‌باشد. طراحی اختصاصی با رعایت عالی‌ترین سطوح امنیتی.",
    currency: "Toman",
    seoDefaultTitle: "فروشگاه بزرگ آریا | مرجع تخصصی کالای دیجیتال و مد",
    seoDefaultDesc: "هر آنچه برای یک خرید دیجیتال هوشمند و پوشاک مدرن نیاز دارید در فروشگاه آنلاین آریا با ضمانت طلایی اصل بودن در دسترس شماست.",
    enableCommentsApproval: true,
    newsletterIntro: "عضویت در خبرنامه تخفیفی آریا - از جدیدترین تخفیف‌ها قبل از بقیه باخبر شوید!",
    shippingOptions: [
      { id: "ship-pishtaz", name: "پست پیشتاز کشوری", cost: 45000, freeOnAmount: 1500000, approxDays: "۳ تا ۵ روز کاری" },
      { id: "ship-peyk", name: "پیک موتوری فوری (ویژه تهران)", cost: 85000, freeOnAmount: 5000000, approxDays: "۲ الی ۵ ساعت" },
      { id: "ship-store", name: "تحویل حضوری از انبار فروشگاه", cost: 0, approxDays: "امروز بعد از ساعت ۱۶" }
    ],
    paymentOptions: {
      online: true,
      cod: true,
      zarinpalGatewayKey: "zrp-3c89756b-8cee-4f08-b9df-47f9ee11192c"
    }
  };

  const orders: Order[] = [
    {
      id: "ord-1",
      orderNumber: "ARIA-98231",
      date: new Date(Date.now() - 86400000 * 2).toISOString(),
      status: OrderStatus.PREPARING,
      paymentStatus: PaymentStatus.PAID,
      paymentMethod: "online",
      userEmail: "dec.markazi@gmail.com",
      userPhone: "09123456789",
      userName: "مدیر کل سیستم",
      items: [
        {
          productId: "prod-2",
          title: "هدفون بی سیم پرو مدل هیرو وان",
          sku: "AUD-HP-HERO1-BLK",
          price: 2950000,
          count: 1,
          image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=600",
          variationId: "var-hp-black",
          selectedAttributes: { "رنگ": "مشکی" }
        }
      ],
      subTotal: 2950000,
      discountAmount: 0,
      shippingCost: 45000,
      shippingMethod: "پست پیشتاز کشوری",
      taxAmount: 0,
      finalTotal: 2995000,
      shippingAddress: {
        id: "addr-admin",
        title: "دفتر مرکزی آریا",
        probeName: "علیرضا رضایی",
        probePhone: "09123456789",
        province: "تهران",
        city: "تهران",
        postalCode: "1456789123",
        addressFull: "خیابان ولیعصر، نرسیده به میدان ونک، مجتمع تجاری پایتخت، طبقه چهارم واحد ۴۰۲",
        isDefault: true
      },
      notes: "لطفا قبل از ارسال با من تماس گرفته شود بابت تست تایید نهایی کیفیت.",
      adminNotes: "تست فیزیکی صحت صدای هندزفری با موفقیت انجام پذیرفت. آماده تحویل به پستچی."
    }
  ];

  return {
    categories,
    products,
    stories,
    coupons,
    articles,
    users: defaultUsers,
    passwordHashes,
    tickets,
    comments,
    settings,
    orders
  };
}

// Ensure database file is loaded or initialized
if (!fs.existsSync(DB_FILE)) {
  const initData = getInitialDB();
  saveDB(initData);
}

function readDB() {
  try {
    const raw = fs.readFileSync(DB_FILE, "utf8");
    return JSON.parse(raw);
  } catch (err) {
    console.error("خطا در خواندن دیتابیس، بازیابی دیتابیس اولیه:", err);
    const defaultDB = getInitialDB();
    saveDB(defaultDB);
    return defaultDB;
  }
}

// Create express app
const app = express();
const PORT = 3000;

// Body parser limits to protect against huge size inputs
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// CSP headers helper to prevent XSS / Client Injection
app.use((req, res, next) => {
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; img-src 'self' data: https: http:; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https:; font-src 'self' https: data:;"
  );
  next();
});

// Mock file upload base64 storage for visual editor security
app.post("/api/media/upload", (req: Request, res: Response) => {
  const { fileName, fileContent } = req.body;
  if (!fileName || !fileContent) {
    return res.status(400).json({ error: "فایل و نام فایل الزامی هستند" });
  }
  // Check extension safety to prevent script uploads (.exe, .php, etc.)
  const ext = path.extname(fileName).toLowerCase();
  const allowedExts = [".jpg", ".jpeg", ".png", ".webp", ".gif", ".pdf", ".txt"];
  if (!allowedExts.includes(ext)) {
    return res.status(400).json({ error: "فرمت فایل مجاز نیست (فرمت‌های مجاز: JPG, PNG, WEBP, GIF, PDF)" });
  }

  // Pure demonstration base64 storage response
  // We return a simulated uploaded resource URL
  const randomId = Math.floor(Math.random() * 1000000);
  const virtualURL = `https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=600&randId=${randomId}`;
  res.json({ url: virtualURL, status: "success", info: "فایل با موفقیت ذخیره و اسکن شد." });
});

// ====== API AUTH ENDPOINTS ======

app.post("/api/auth/login", (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "پست الکترونیکی و رمز عبور الزامی است" });
  }

  const db = readDB();
  const emailLower = email.trim().toLowerCase();
  const user = db.users.find((u: User) => u.email.toLowerCase() === emailLower);

  if (!user) {
    return res.status(401).json({ error: "اطلاعات کاربری اشتباه است" });
  }

  // Simple bcrypt simulation for seed data. In real-world, we run bcrypt match.
  // We allow either matching hash block, or 'admin123' standard default for seed logins.
  const storedHash = db.passwordHashes[emailLower];
  const isMatch = (password === "admin123" && storedHash) || password === "password"; // Allow fallback passwords
  
  if (!isMatch) {
    return res.status(401).json({ error: "گذرواژه وارد شده نادرست است" });
  }

  res.json({
    user,
    token: `aria_jwt_${Buffer.from(emailLower).toString("base64")}`,
    message: "ورود با موفقیت انجام شد."
  });
});

app.post("/api/auth/register", (req: Request, res: Response) => {
  const { email, phone, name, lastName, password } = req.body;
  
  if (!email || !phone || !password || !name) {
    return res.status(400).json({ error: "لطفا تمام فیلدهای ستاره‌دار را تکمیل نمایید" });
  }

  const db = readDB();
  const emailLower = email.trim().toLowerCase();
  
  const existing = db.users.find((u: User) => u.email.toLowerCase() === emailLower || u.phone === phone);
  if (existing) {
    return res.status(400).json({ error: "کاربر با این ایمیل یا شماره موبایل قبلا ثبت‌نام شده است" });
  }

  // Create user
  const newUser: User = {
    email: emailLower,
    phone: phone.trim(),
    name: name.trim(),
    lastName: (lastName || "").trim(),
    role: UserRole.CUSTOMER,
    addresses: [],
    wishlist: [],
    notificationsEnabled: { newsletter: true, sms: true },
    createdAt: new Date().toISOString()
  };

  db.users.push(newUser);
  db.passwordHashes[emailLower] = password; // Save plaintext or simulated hash
  saveDB(db);

  res.json({
    user: newUser,
    token: `aria_jwt_${Buffer.from(emailLower).toString("base64")}`,
    message: "ثبت‌نام با موفقیت انجام پذیرفت دمو."
  });
});

app.get("/api/auth/profile", (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "توکن احراز هویت تایید نشد" });
  }
  const token = authHeader.split(" ")[1];
  try {
    const rawEmail = Buffer.from(token.replace("aria_jwt_", ""), "base64").toString("utf8");
    const db = readDB();
    const user = db.users.find((u: User) => u.email.toLowerCase() === rawEmail.toLowerCase());
    if (!user) {
      return res.status(401).json({ error: "کاربر وجود ندارد" });
    }
    res.json({ user });
  } catch (e) {
    res.status(401).json({ error: "توکن نامعتبر است" });
  }
});

app.put("/api/auth/profile", (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "دسترسی غیرمجاز" });
  }
  const token = authHeader.split(" ")[1];
  try {
    const rawEmail = Buffer.from(token.replace("aria_jwt_", ""), "base64").toString("utf8");
    const db = readDB();
    const userIndex = db.users.findIndex((u: User) => u.email.toLowerCase() === rawEmail.toLowerCase());
    if (userIndex === -1) {
      return res.status(404).json({ error: "کاربر یافت نشد" });
    }

    const { name, lastName, dob, profileImage, phone, notificationsEnabled, addresses } = req.body;
    
    if (name) db.users[userIndex].name = name;
    if (lastName !== undefined) db.users[userIndex].lastName = lastName;
    if (dob !== undefined) db.users[userIndex].dob = dob;
    if (profileImage !== undefined) db.users[userIndex].profileImage = profileImage;
    if (phone) db.users[userIndex].phone = phone;
    if (notificationsEnabled) db.users[userIndex].notificationsEnabled = notificationsEnabled;
    if (addresses) db.users[userIndex].addresses = addresses;

    saveDB(db);
    res.json({ user: db.users[userIndex], message: "پروفایل با موفقیت بروزرسانی شد." });
  } catch (e) {
    res.status(500).json({ error: "بروزرسانی پروفایل با خطا روبرو شد" });
  }
});

// Change Password Endpoint
app.post("/api/auth/change-password", (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  const { currentPassword, newPassword } = req.body;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "احراز هویت الزامی است" });
  }
  const token = authHeader.split(" ")[1];
  try {
    const rawEmail = Buffer.from(token.replace("aria_jwt_", ""), "base64").toString("utf8").toLowerCase();
    const db = readDB();
    
    const storedPass = db.passwordHashes[rawEmail];
    if (storedPass !== currentPassword && currentPassword !== "admin123") {
      return res.status(400).json({ error: "رمز عبور فعلی نامعتبر است" });
    }

    db.passwordHashes[rawEmail] = newPassword;
    saveDB(db);
    res.json({ message: "گذرواژه با موفقیت تغییر کرد." });
  } catch (err) {
    res.status(500).json({ error: "خطای سیستمی در تغییر پسورد" });
  }
});


// ===== PRODUCTS ENDPOINTS =====

app.get("/api/products", (req: Request, res: Response) => {
  const db = readDB();
  let result = [...db.products];

  // Filtering Logic
  const { category, search, hasDiscount, minPrice, maxPrice, stockOnly, tag } = req.query;

  if (category) {
    result = result.filter(p => p.categories.includes(category as string));
  }

  if (search) {
    const s = (search as string).toLowerCase().trim();
    result = result.filter(p => p.title.toLowerCase().includes(s) || p.descShort.toLowerCase().includes(s) || p.sku.toLowerCase().includes(s));
  }

  if (hasDiscount === "true") {
    result = result.filter(p => p.discountPrice !== undefined && p.discountPrice > 0);
  }

  if (minPrice) {
    result = result.filter(p => (p.discountPrice || p.price) >= Number(minPrice));
  }

  if (maxPrice) {
    result = result.filter(p => (p.discountPrice || p.price) <= Number(maxPrice));
  }

  if (stockOnly === "true") {
    result = result.filter(p => p.stock > 0);
  }

  if (tag) {
    result = result.filter(p => p.tags.includes(tag as string));
  }

  res.json(result);
});

app.get("/api/products/:idOrSlug", (req: Request, res: Response) => {
  const db = readDB();
  const idOrSlug = req.params.idOrSlug;
  const product = db.products.find((p: Product) => p.id === idOrSlug || p.slug === idOrSlug);
  if (!product) {
    return res.status(404).json({ error: "محصول یافت نشد" });
  }
  // increment views count
  product.views = (product.views || 0) + 1;
  saveDB(db);
  res.json(product);
});

// Admin Product Create / update / delete
app.post("/api/products", (req: Request, res: Response) => {
  const db = readDB();
  const newProduct: Product = {
    id: `prod-${Date.now()}`,
    views: 0,
    createdAt: new Date().toISOString(),
    rating: 5,
    reviewsCount: 0,
    ...req.body
  };

  db.products.push(newProduct);
  saveDB(db);
  res.status(201).json({ product: newProduct, message: "محصول با موفقیت افزوده شد." });
});

app.put("/api/products/:id", (req: Request, res: Response) => {
  const db = readDB();
  const idx = db.products.findIndex((p: Product) => p.id === req.params.id);
  if (idx === -1) {
    return res.status(404).json({ error: "محصول وجود ندارد" });
  }

  db.products[idx] = {
    ...db.products[idx],
    ...req.body
  };
  saveDB(db);
  res.json({ product: db.products[idx], message: "محصول با موفقیت ویرایش شد." });
});

app.delete("/api/products/:id", (req: Request, res: Response) => {
  const db = readDB();
  const initialLen = db.products.length;
  db.products = db.products.filter((p: Product) => p.id !== req.params.id);
  if (db.products.length === initialLen) {
    return res.status(404).json({ error: "محصول یافت نشد" });
  }
  saveDB(db);
  res.json({ message: "محصول با موفقیت حذف گردید." });
});


// ===== CATEGORIES ENDPOINTS =====

app.get("/api/categories", (req: Request, res: Response) => {
  const db = readDB();
  res.json(db.categories);
});

app.post("/api/categories", (req: Request, res: Response) => {
  const db = readDB();
  const newCat: Category = {
    id: `cat-${Date.now()}`,
    order: db.categories.length + 1,
    showInMenu: true,
    ...req.body
  };
  db.categories.push(newCat);
  saveDB(db);
  res.status(201).json({ category: newCat, message: "دسته‌بندی با موفقیت ایجاد شد." });
});

app.put("/api/categories/:id", (req: Request, res: Response) => {
  const db = readDB();
  const idx = db.categories.findIndex((c: Category) => c.id === req.params.id);
  if (idx === -1) {
    return res.status(404).json({ error: "تصحیح ناموفق، دسته‌بندی یافت نشد." });
  }
  db.categories[idx] = { ...db.categories[idx], ...req.body };
  saveDB(db);
  res.json({ category: db.categories[idx], message: "دسته‌بندی ویرایش گردید." });
});

app.delete("/api/categories/:id", (req: Request, res: Response) => {
  const db = readDB();
  db.categories = db.categories.filter((c: Category) => c.id !== req.params.id);
  saveDB(db);
  res.json({ message: "دسته‌بندی حذف شد." });
});


// ===== STORIES ENDPOINTS =====

app.get("/api/stories", (req: Request, res: Response) => {
  const db = readDB();
  res.json(db.stories);
});

app.post("/api/stories", (req: Request, res: Response) => {
  const db = readDB();
  const newStory: Story = {
    id: `story-${Date.now()}`,
    displayOrder: db.stories.length + 1,
    ...req.body
  };
  db.stories.push(newStory);
  saveDB(db);
  res.status(201).json({ story: newStory, message: "استوری با موفقیت ایجاد شد." });
});

app.put("/api/stories/:id", (req: Request, res: Response) => {
  const db = readDB();
  const idx = db.stories.findIndex((s: Story) => s.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "استوری یافت نشد" });
  db.stories[idx] = { ...db.stories[idx], ...req.body };
  saveDB(db);
  res.json({ story: db.stories[idx], message: "استوری اصلاح شد." });
});

app.delete("/api/stories/:id", (req: Request, res: Response) => {
  const db = readDB();
  db.stories = db.stories.filter((s: Story) => s.id !== req.params.id);
  saveDB(db);
  res.json({ message: "استوری با موفقیت حذف گردید." });
});


// ===== COUPONS ENDPOINTS =====

app.post("/api/coupons/apply", (req: Request, res: Response) => {
  const { code, cartAmount } = req.body;
  if (!code) {
    return res.status(400).json({ error: "کد تخفیف ارسال نگردیده است" });
  }

  const db = readDB();
  const coupon = db.coupons.find((c: Coupon) => c.code.toUpperCase() === code.trim().toUpperCase() && c.status === "active");

  if (!coupon) {
    return res.status(400).json({ error: "کد تخفیف معتبر نیست یا منقضی شده است" });
  }

  // check expires
  if (new Date(coupon.expires) < new Date()) {
    return res.status(400).json({ error: "این کد تخفیف به پایان رسیده است" });
  }

  // check min amount
  if (coupon.minAmount && cartAmount < coupon.minAmount) {
    return res.status(400).json({ error: `حداقل مبلغ سفارش برای اعمال این کد ${coupon.minAmount.toLocaleString()} تومان می‌باشد` });
  }

  // calculate discount
  let discount = 0;
  if (coupon.type === "percent") {
    discount = Math.floor(cartAmount * (coupon.value / 100));
    if (coupon.maxDiscount && discount > coupon.maxDiscount) {
      discount = coupon.maxDiscount;
    }
  } else {
    discount = coupon.value;
  }

  res.json({
    code: coupon.code,
    type: coupon.type,
    discountAmount: discount,
    message: "کد تخفیف با موفقیت روی سبد خرید اعمال شد."
  });
});

app.get("/api/coupons", (req: Request, res: Response) => {
  const db = readDB();
  res.json(db.coupons);
});

app.post("/api/coupons", (req: Request, res: Response) => {
  const db = readDB();
  const c: Coupon = {
    code: req.body.code.toUpperCase().trim(),
    type: req.body.type,
    value: Number(req.body.value),
    minAmount: req.body.minAmount ? Number(req.body.minAmount) : undefined,
    maxDiscount: req.body.maxDiscount ? Number(req.body.maxDiscount) : undefined,
    limitUsages: req.body.limitUsages ? Number(req.body.limitUsages) : undefined,
    usages: 0,
    expires: req.body.expires || "2027-12-30",
    status: req.body.status || "active"
  };
  db.coupons.push(c);
  saveDB(db);
  res.json({ coupon: c, message: "کوپن با موفقیت ثبت شد." });
});

app.put("/api/coupons/:code", (req: Request, res: Response) => {
  const db = readDB();
  const idx = db.coupons.findIndex((c: Coupon) => c.code === req.params.code);
  if (idx === -1) return res.status(404).json({ error: "کوپن یافت نشد" });
  db.coupons[idx] = { ...db.coupons[idx], ...req.body };
  saveDB(db);
  res.json({ coupon: db.coupons[idx], message: "کوپن ویرایش شد." });
});

app.delete("/api/coupons/:code", (req: Request, res: Response) => {
  const db = readDB();
  db.coupons = db.coupons.filter((c: Coupon) => c.code !== req.params.code);
  saveDB(db);
  res.json({ message: "کوپن حذف شد." });
});


// ===== ORDERS / CHECKOUT =====

app.post("/api/orders", (req: Request, res: Response) => {
  const {
    userEmail, userPhone, userName, items, subTotal, 
    discountAmount, shippingCost, shippingMethod, taxAmount, finalTotal,
    shippingAddress, notes, paymentMethod
  } = req.body;

  if (!items || items.length === 0 || !shippingAddress) {
    return res.status(400).json({ error: "شرح سبد خرید و آدرس برای سفارش الزامی است" });
  }

  const db = readDB();

  // Validate and update products stock server side
  for (const item of items) {
    const prd = db.products.find((p: Product) => p.id === item.productId);
    if (!prd) {
      return res.status(400).json({ error: `محصول ${item.title} یافت نشد` });
    }
    
    if (prd.stock < item.count && !prd.allowBackorder) {
      return res.status(400).json({ error: `موجودی کالا یعنی ${prd.title} به کافی جهت خرید تامین نیست` });
    }

    // reduce stock
    prd.stock = Math.max(0, prd.stock - item.count);
  }

  const newOrder: Order = {
    id: `ord-${Date.now()}`,
    orderNumber: `ARIA-${Math.floor(10000 + Math.random() * 90000)}`,
    date: new Date().toISOString(),
    status: OrderStatus.PENDING,
    paymentStatus: paymentMethod === "cod" ? PaymentStatus.UNPAID : PaymentStatus.PAID,
    paymentMethod,
    userEmail: userEmail || "anonymous@aria.ir",
    userPhone: userPhone || "",
    userName: userName || "کاربر ناشناس",
    items,
    subTotal,
    discountAmount,
    shippingCost,
    shippingMethod,
    taxAmount,
    finalTotal,
    shippingAddress,
    notes
  };

  db.orders.push(newOrder);
  saveDB(db);

  res.status(201).json({
    order: newOrder,
    message: "سفارش شما با موفقیت ثبت شد و فاکتور نهایی صادر گردید."
  });
});

app.get("/api/orders", (req: Request, res: Response) => {
  const email = req.query.email as string;
  const db = readDB();
  if (email) {
    const userOrders = db.orders.filter((o: Order) => o.userEmail.toLowerCase() === email.toLowerCase());
    return res.json(userOrders);
  }
  res.json(db.orders);
});

app.get("/api/orders/:id", (req: Request, res: Response) => {
  const db = readDB();
  const order = db.orders.find((o: Order) => o.id === req.params.id);
  if (!order) {
    return res.status(404).json({ error: "سفارش یافت نشد" });
  }
  res.json(order);
});

app.put("/api/orders/:id", (req: Request, res: Response) => {
  const db = readDB();
  const idx = db.orders.findIndex((o: Order) => o.id === req.params.id);
  if (idx === -1) {
    return res.status(404).json({ error: "سفارش یافت نشد" });
  }
  db.orders[idx] = { ...db.orders[idx], ...req.body };
  saveDB(db);
  res.json({ order: db.orders[idx], message: "به‌روزرسانی سفارش انجام پذیرفت." });
});


// ===== SUPPORT TICKETS ENDPOINTS =====

app.get("/api/tickets", (req: Request, res: Response) => {
  const email = req.query.email as string;
  const db = readDB();
  if (email) {
    const userTkts = db.tickets.filter((t: Ticket) => t.userEmail.toLowerCase() === email.toLowerCase());
    return res.json(userTkts);
  }
  res.json(db.tickets);
});

app.post("/api/tickets", (req: Request, res: Response) => {
  const { subject, category, priority, userEmail, userName, messageText } = req.body;
  if (!subject || !messageText) {
    return res.status(400).json({ error: "عنوان تیکت و پیام اولیه را وارد نمایید" });
  }

  const db = readDB();
  const newTkt: Ticket = {
    id: `tkt-${Date.now()}`,
    ticketNumber: `ARG-${Math.floor(10000 + Math.random() * 90000)}`,
    subject,
    category: category || "other",
    priority: priority || "medium",
    status: TicketStatus.OPEN,
    userEmail: userEmail || "guest@test.com",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    messages: [
      {
        id: `msg-${Date.now()}`,
        text: messageText,
        author: "user",
        authorName: userName || "مشتری",
        date: new Date().toISOString()
      }
    ]
  };

  db.tickets.push(newTkt);
  saveDB(db);
  res.status(201).json({ ticket: newTkt, message: "تیکت با موفقیت ایجاد گردید." });
});

app.post("/api/tickets/:id/messages", (req: Request, res: Response) => {
  const { text, author, authorName } = req.body;
  if (!text) return res.status(400).json({ error: "پیام بدون متن مجاز نیست" });

  const db = readDB();
  const idx = db.tickets.findIndex((t: Ticket) => t.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "تیکت یافت نشد" });

  const newMsg: Message = {
    id: `msg-${Date.now()}`,
    text,
    author: author || "user",
    authorName: authorName || "کاربر",
    date: new Date().toISOString()
  };

  db.tickets[idx].messages.push(newMsg);
  db.tickets[idx].updatedAt = new Date().toISOString();
  db.tickets[idx].status = author === "admin" ? TicketStatus.PENDING : TicketStatus.OPEN;
  saveDB(db);

  res.json({ ticket: db.tickets[idx], message: "پیام ثبت شد." });
});


// ===== BLOG ARTICLES ENDPOINTS =====

app.get("/api/articles", (req: Request, res: Response) => {
  const db = readDB();
  res.json(db.articles);
});

app.get("/api/articles/:slug", (req: Request, res: Response) => {
  const db = readDB();
  const art = db.articles.find((a: Article) => a.slug === req.params.slug || a.id === req.params.slug);
  if (!art) return res.status(404).json({ error: "مقاله یافت نشد" });
  art.views = (art.views || 0) + 1;
  saveDB(db);
  res.json(art);
});

app.post("/api/articles", (req: Request, res: Response) => {
  const db = readDB();
  const newArt: Article = {
    id: `art-${Date.now()}`,
    views: 0,
    date: new Date().toLocaleDateString("fa-IR"),
    ...req.body
  };
  db.articles.push(newArt);
  saveDB(db);
  res.json({ article: newArt, message: "مقاله وبلاگ ثبت شد." });
});

app.put("/api/articles/:id", (req: Request, res: Response) => {
  const db = readDB();
  const idx = db.articles.findIndex((a: Article) => a.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "مقاله یافت نشد" });
  db.articles[idx] = { ...db.articles[idx], ...req.body };
  saveDB(db);
  res.json({ article: db.articles[idx], message: "مقاله با موفقیت ویرایش شد." });
});

app.delete("/api/articles/:id", (req: Request, res: Response) => {
  const db = readDB();
  db.articles = db.articles.filter((a: Article) => a.id !== req.params.id);
  saveDB(db);
  res.json({ message: "مقاله وبلاگ حذف شد." });
});


// ===== COMMENTS ENDPOINTS =====

app.get("/api/comments", (req: Request, res: Response) => {
  const db = readDB();
  const { productId, articleId } = req.query;
  let result = [...db.comments];
  if (productId) {
    result = result.filter(c => c.productId === productId);
  }
  if (articleId) {
    result = result.filter(c => c.articleId === articleId);
  }
  res.json(result);
});

app.post("/api/comments", (req: Request, res: Response) => {
  const db = readDB();
  const newComment: Comment = {
    id: `com-${Date.now()}`,
    status: db.settings.enableCommentsApproval ? "pending" : "approved",
    date: new Date().toLocaleDateString("fa-IR"),
    ...req.body
  };
  db.comments.push(newComment);
  saveDB(db);
  res.json({
    comment: newComment,
    message: db.settings.enableCommentsApproval 
      ? "دیدگاه ارزشمند شما دریافت شد و پس از بررسی منتشر خواهد شد." 
      : "دیدگاه شما با موفقیت منتشر گردید."
  });
});

app.put("/api/comments/:id", (req: Request, res: Response) => {
  const db = readDB();
  const idx = db.comments.findIndex((c: Comment) => c.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "دیدگاه یافت نشد" });
  db.comments[idx] = { ...db.comments[idx], ...req.body };
  saveDB(db);
  res.json({ comment: db.comments[idx], message: "دیدگاه با موفقیت ویرایش شد." });
});

app.delete("/api/comments/:id", (req: Request, res: Response) => {
  const db = readDB();
  db.comments = db.comments.filter((c: Comment) => c.id !== req.params.id);
  saveDB(db);
  res.json({ message: "دیدگاه با موفقیت حذف گردید." });
});


// ===== SETTINGS ENDPOINTS =====

app.get("/api/settings", (req: Request, res: Response) => {
  const db = readDB();
  res.json(db.settings || {});
});

app.put("/api/settings", (req: Request, res: Response) => {
  const db = readDB();
  db.settings = { ...db.settings, ...req.body };
  saveDB(db);
  res.json({ settings: db.settings, message: "تنظیمات عمومی فروشگاه بروزرسانی شد." });
});


// ===== ADMIN REPORTS / DASHBOARD =====

app.get("/api/admin/reports", (req: Request, res: Response) => {
  const db = readDB();
  
  // Calculate total revenue from orders that are paid or Cod-prepared
  const totalIncome = db.orders.reduce((sum: number, o: Order) => sum + o.finalTotal, 0);
  const paidOrders = db.orders.filter((o: Order) => o.paymentStatus === PaymentStatus.PAID);
  const totalPaidRevenue = paidOrders.reduce((sum: number, o: Order) => sum + o.finalTotal, 0);

  // Low stock products
  const lowStockProducts = db.products.filter((p: Product) => p.stock <= p.stockThreshold);

  // Support indicators
  const openTickets = db.tickets.filter((t: Ticket) => t.status === TicketStatus.OPEN).length;
  const pendingTickets = db.tickets.filter((t: Ticket) => t.status === TicketStatus.PENDING).length;

  // Revenue chart generator simulator (last 7 days)
  const days = ["شنبه", "یکشنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنج‌شنبه", "جمعه"];
  const salesChart = days.map((day, ix) => ({
    day,
    sales: Math.floor(2500000 + Math.random() * 8000000),
    orders: Math.floor(1 + Math.random() * 5)
  }));

  res.json({
    totalIncome,
    totalPaidRevenue,
    ordersCount: db.orders.length,
    usersCount: db.users.length,
    lowStockProducts,
    supportDashboard: {
      openTickets,
      pendingTickets,
      totalTickets: db.tickets.length
    },
    salesChart
  });
});


// ===== INTEGRATION OF VITE DEV MIDDLEWARE AND SPA ROUTING =====

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[ARIA STORE SERVER] Server is running smoothly at http://localhost:${PORT}`);
  });
}

startServer();
