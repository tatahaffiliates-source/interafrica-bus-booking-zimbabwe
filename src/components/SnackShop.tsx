import React, { useState } from 'react';
import {
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  ArrowRight,
  Coffee,
  Check,
  AlertCircle,
  Package,
} from 'lucide-react';
import { SnackProduct, CurrencyConfig } from '../types/index.ts';
import { ScheduledTrip } from '../types/index.ts';
import breadSnack from '../public/images/cb3b154398101f127e2d731bd7930aaa.jpg';
import pieSnack from '../public/images/images (1).jpg';
import bottledDrink from '../public/images/imagesss.jpg';
import { BusPreview } from './BusPreview.tsx';

const snackPhotos = [breadSnack, pieSnack];

interface SnackShopProps {
  trip: ScheduledTrip;
  products: SnackProduct[];
  cart: { productId: string; quantity: number }[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onClearCart: () => void;
  currency: CurrencyConfig | null;
  displayCurrency: 'USD' | 'ZiG';
  onContinue: () => void;
  onSkip: () => void;
  onBack: () => void;
}

export const SnackShop: React.FC<SnackShopProps> = ({
  trip,
  products,
  cart,
  onUpdateQuantity,
  onClearCart,
  currency,
  displayCurrency,
  onContinue,
  onSkip,
  onBack,
}) => {
  const [activeCategory, setActiveCategory] = useState<'all' | 'chips_and_snacks' | 'drinks'>('all');

  const filteredProducts = products.filter((p) => {
    if (activeCategory === 'all') return true;
    return p.category === activeCategory;
  });

  const getCartQuantity = (productId: string) => {
    const item = cart.find((c) => c.productId === productId);
    return item ? item.quantity : 0;
  };

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const totalCartUsd = cart.reduce((sum, item) => {
    const prod = products.find((p) => p.id === item.productId);
    return sum + (prod ? prod.priceUsd * item.quantity : 0);
  }, 0);

  const formatPrice = (usd: number) => {
    if (displayCurrency === 'ZiG' && currency) {
      return `${(usd * currency.usdToZigRate).toFixed(2)} ZiG`;
    }
    return `$${usd.toFixed(2)} USD`;
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <button
            type="button"
            onClick={onBack}
            className="text-xs font-bold text-blue-600 hover:underline mb-1 inline-flex items-center gap-1"
          >
            ← Back to seat selection
          </button>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black text-slate-900">Onboard Refreshments & Snacks</h2>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
              Optional
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Collect fresh chilled refreshments at your boarding terminal or have them ready on coach departure.
          </p>
          <BusPreview
            busName={trip.busName}
            busType={trip.busType}
            busNumber={trip.busNumber}
            className="mt-3 max-w-lg"
          />
        </div>

        {/* Skip button right at top */}
        <button
          type="button"
          onClick={onSkip}
          className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
        >
          <span>Skip Refreshments & Checkout</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Main Grid: Products Catalog on Left, Sticky Cart Drawer on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Category Tabs & Products */}
        <div className="lg:col-span-8 space-y-4">
          {/* Category Tabs */}
          <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
            <button
              type="button"
              onClick={() => setActiveCategory('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeCategory === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Refreshments ({products.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveCategory('chips_and_snacks')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeCategory === 'chips_and_snacks'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Chips & Packaged Snacks
            </button>
            <button
              type="button"
              onClick={() => setActiveCategory('drinks')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeCategory === 'drinks'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Cold Drinks & Juices
            </button>
          </div>

          {/* Product Cards Grid */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {filteredProducts.map((prod, index) => {
              const qty = getCartQuantity(prod.id);
              const isOutOfStock = prod.stockQuantity <= 0;
              const productPhoto =
                prod.category === 'drinks' ? bottledDrink : snackPhotos[index % snackPhotos.length];

              return (
                <div
                  key={prod.id}
                  className="bg-white rounded-2xl border border-slate-200 p-2 sm:p-4 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
                    <img
                      src={productPhoto}
                      alt=""
                      className="h-20 w-full rounded-xl object-cover border border-slate-100 shrink-0 bg-slate-50 sm:h-20 sm:w-20"
                      loading="lazy"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-slate-900 leading-tight">
                        {prod.name}
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-1">{prod.packSize}</p>
                      
                      <div className="mt-2 flex items-baseline gap-1.5">
                        <span className="text-sm font-black text-blue-950">
                          {formatPrice(prod.priceUsd)}
                        </span>
                        {displayCurrency === 'USD' && currency && (
                          <span className="text-[10px] text-slate-400">
                            ≈ {(prod.priceUsd * currency.usdToZigRate).toFixed(1)} ZiG
                          </span>
                        )}
                      </div>

                      <div className="mt-1">
                        {isOutOfStock ? (
                          <span className="text-[10px] font-bold text-red-600">Out of Stock</span>
                        ) : (
                          <span className="text-[10px] text-emerald-600 font-medium">
                            {prod.stockQuantity} in stock
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Quantity Stepper */}
                  <div className="mt-3 pt-2 border-t border-slate-100 flex flex-col items-start gap-2 sm:mt-4 sm:flex-row sm:items-center sm:justify-between">
                    <span className="text-[10px] text-slate-400">
                      Max {prod.maxQtyPerBooking} per booking
                    </span>

                    {qty === 0 ? (
                      <button
                        type="button"
                        disabled={isOutOfStock}
                        onClick={() => onUpdateQuantity(prod.id, 1)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${
                          isOutOfStock
                            ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                            : 'bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white border border-blue-200'
                        }`}
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add</span>
                      </button>
                    ) : (
                      <div className="flex items-center gap-2 bg-slate-100 rounded-lg p-1 border border-slate-200">
                        <button
                          type="button"
                          onClick={() => onUpdateQuantity(prod.id, qty - 1)}
                          className="w-6 h-6 rounded bg-white hover:bg-slate-200 flex items-center justify-center text-slate-700 text-xs font-bold"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-black text-slate-900 w-4 text-center">
                          {qty}
                        </span>
                        <button
                          type="button"
                          disabled={qty >= prod.maxQtyPerBooking || qty >= prod.stockQuantity}
                          onClick={() => onUpdateQuantity(prod.id, qty + 1)}
                          className="w-6 h-6 rounded bg-white hover:bg-slate-200 flex items-center justify-center text-slate-700 text-xs font-bold disabled:opacity-50"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Persistent Cart Summary */}
        <div className="lg:col-span-4 bg-white rounded-2xl p-5 border border-slate-200 shadow-sm sticky top-24">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-black text-slate-900">Your Snack Order</h3>
            </div>
            {cart.length > 0 && (
              <button
                type="button"
                onClick={onClearCart}
                className="text-[11px] text-red-600 hover:underline"
              >
                Clear all
              </button>
            )}
          </div>

          {cart.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <Package className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-xs">No refreshments added yet.</p>
              <p className="text-[11px] text-slate-400 mt-1">
                You can select chips and drinks, or skip to continue with just your seat ticket.
              </p>
            </div>
          ) : (
            <div className="space-y-3 mb-4">
              {cart.map((item) => {
                const prod = products.find((p) => p.id === item.productId);
                if (!prod) return null;
                const lineTotal = prod.priceUsd * item.quantity;

                return (
                  <div key={item.productId} className="flex justify-between items-center text-xs">
                    <div className="flex-1 pr-2 truncate">
                      <div className="font-bold text-slate-800 truncate">{prod.name}</div>
                      <div className="text-[10px] text-slate-400">
                        {item.quantity} × ${prod.priceUsd.toFixed(2)}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="font-black text-slate-900">
                        ${lineTotal.toFixed(2)}
                      </span>
                      <button
                        type="button"
                        onClick={() => onUpdateQuantity(item.productId, 0)}
                        className="text-slate-400 hover:text-red-600"
                        title="Remove"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}

              <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
                <span className="text-xs font-bold text-slate-700">Refreshments Subtotal:</span>
                <span className="text-base font-black text-blue-950">
                  {formatPrice(totalCartUsd)}
                </span>
              </div>
            </div>
          )}

          {/* Action CTAs */}
          <div className="space-y-2 mt-4 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onContinue}
              className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-blue-950 font-black text-xs uppercase tracking-wide flex items-center justify-center gap-2 shadow-md shadow-amber-500/20 active:scale-98 transition-all cursor-pointer"
            >
              <span>{cart.length > 0 ? 'Proceed with Snacks' : 'Proceed to Passenger Info'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={onSkip}
              className="w-full py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-bold transition-colors"
            >
              Skip Snacks (Tickets Only)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
