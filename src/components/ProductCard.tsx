/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Heart, ShoppingCart, Star, Eye } from "lucide-react";
import { Product } from "../types";
import { formatPrice, toPersianDigits } from "../utils";

interface ProductCardProps {
  key?: any;
  product: Product;
  isWishlisted: boolean;
  onNavigate: (view: string, params?: any) => void;
  onToggleWishlist: (productId: string) => void;
  onAddToCart: (product: Product, count: number, variationId?: string, selectedAttributes?: Record<string, string>) => void;
}

export default function ProductCard({
  product,
  isWishlisted,
  onNavigate,
  onToggleWishlist,
  onAddToCart
}: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [addingIcon, setAddingIcon] = useState(false);

  const priceToUse = product.discountPrice !== undefined ? product.discountPrice : product.price;
  const hasDiscount = product.discountPrice !== undefined;
  const discountPercent = hasDiscount 
    ? Math.round(((product.price - product.discountPrice!) / product.price) * 100) 
    : 0;

  const handleAddToCartClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // If variable, navigate to product detail to choose specific color/size first
    if (product.isVariable) {
      onNavigate("product", { id: product.id });
      return;
    }

    setAddingIcon(true);
    onAddToCart(product, 1);
    
    setTimeout(() => {
      setAddingIcon(false);
    }, 1000);
  };

  return (
    <div
      className="group bg-white rounded-2xl border border-gray-100 hover:border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onNavigate("product", { id: product.id })}
      id={`product-card-${product.id}`}
      style={{ cursor: "pointer" }}
    >
      
      {/* Top Image Box */}
      <div className="relative aspect-square overflow-hidden bg-gray-50">
        
        {/* Discount Badge over Image */}
        {hasDiscount && (
          <span className="absolute top-3.5 right-3.5 bg-rose-500 text-white text-[11px] font-bold px-2.5 py-1 rounded-lg z-10 shadow-md shadow-rose-100 font-mono">
            {toPersianDigits(discountPercent)}٪ تخفیف
          </span>
        )}

        {/* Wishlist Hearts button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleWishlist(product.id);
          }}
          className="absolute top-3 w-9 h-9 bg-white/90 backdrop-blur-sm hover:bg-white rounded-lg left-3 z-10 flex items-center justify-center text-gray-400 hover:text-rose-500 shadow-md transition-all active:scale-90"
          title="افزودن به علاقه‌مندی‌ها"
          id={`wishlist-toggle-${product.id}`}
        >
          <Heart className={`w-4 h-4 ${isWishlisted ? "fill-rose-500 text-rose-500" : ""}`} />
        </button>

        {/* Product Images with transitions */}
        <img
          src={isHovered && product.hoverImage ? product.hoverImage : product.mainImage}
          alt={product.title}
          className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105"
          referrerPolicy="no-referrer"
        />

        {/* Quick View absolute layer */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300">
          <div className="bg-white/90 backdrop-blur-sm text-gray-900 px-4 py-2 rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5 transform translate-y-3 group-hover:translate-y-0 transition-transform duration-300">
            <Eye className="w-4 h-4" />
            <span>مشاهده جزئیات</span>
          </div>
        </div>

        {/* Stock status tag */}
        {product.stock === 0 && (
          <div className="absolute bottom-3 right-3 left-3 bg-red-650 text-white py-1 text-[10px] rounded-lg text-center font-bold font-sans shadow-md">
            ناموجود در انبار
          </div>
        )}
        {product.stock > 0 && product.stock <= product.stockThreshold && (
          <div className="absolute bottom-3 right-3 left-3 bg-amber-500 text-slate-900 py-1 text-[10px] rounded-lg text-center font-bold shadow-md">
            تنها {toPersianDigits(product.stock)} عدد باقی مانده!
          </div>
        )}
      </div>

      {/* Content description box */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Tags */}
          <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
            {product.sku}
          </span>

          <h3 className="text-xs font-bold text-gray-800 mt-2 line-clamp-2 h-9 leading-relaxed group-hover:text-emerald-650 transition-colors">
            {product.title}
          </h3>

          {/* Rating stars */}
          <div className="flex items-center gap-1 mt-1.5">
            <div className="flex items-center text-amber-400">
              <Star className="w-3 h-3 fill-amber-400" />
            </div>
            <span className="text-[10px] font-bold text-gray-650 font-mono">
              {toPersianDigits(product.rating.toFixed(1))}
            </span>
            <span className="text-[9px] text-gray-400">
              ({toPersianDigits(product.reviewsCount)} نظر)
            </span>
          </div>
        </div>

        {/* Pricing tag & CTA layout */}
        <div className="mt-4 pt-3 border-t border-gray-50 flex items-center justify-between">
          <div className="flex flex-col">
            {hasDiscount && (
              <span className="text-[10px] text-gray-400 line-through font-mono">
                {toPersianDigits(product.price.toLocaleString())}
              </span>
            )}
            <span className="text-xs font-extrabold text-slate-900 font-mono">
              {formatPrice(priceToUse)}
            </span>
          </div>

          <button
            onClick={handleAddToCartClick}
            disabled={product.stock === 0 && !product.allowBackorder}
            className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${
              product.stock === 0 && !product.allowBackorder
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : addingIcon
                ? "bg-emerald-100 text-emerald-800"
                : "bg-emerald-50 hover:bg-emerald-600 text-emerald-600 hover:text-white"
            } cursor-pointer active:scale-95`}
            title={product.isVariable ? "انتخاب ترکیب و خرید" : "افزودن سریع به سبد خرید"}
            id={`add-to-cart-btn-${product.id}`}
          >
            <ShoppingCart className="w-4 h-4" />
          </button>
        </div>
      </div>

    </div>
  );
}
