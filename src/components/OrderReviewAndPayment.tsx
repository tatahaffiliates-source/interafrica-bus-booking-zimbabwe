import React, { useState } from 'react';
import {
  CreditCard,
  Smartphone,
  ShieldCheck,
  Tag,
  AlertCircle,
  Building,
  CheckCircle,
  Clock,
  ArrowRight,
  Info,
} from 'lucide-react';
import {
  ScheduledTrip,
  BusRoute,
  PassengerInfo,
  PricingBreakdown,
  PaymentMethod,
  SnackProduct,
} from '../types/index.ts';
import { BusPreview } from './BusPreview.tsx';

interface OrderReviewAndPaymentProps {
  trip: ScheduledTrip;
  route: BusRoute;
  passengers: PassengerInfo[];
  snacks: { productId: string; quantity: number }[];
  allProducts: SnackProduct[];
  boardingPoint: string;
  droppingPoint: string;
  contactPhone: string;
  pricing: PricingBreakdown;
  couponCode: string;
  onApplyCoupon: (code: string) => void;
  couponError?: string;
  couponSuccess?: string;
  onConfirmPayment: (method: PaymentMethod, mobileWalletNumber?: string) => Promise<void>;
  isProcessing: boolean;
  onBack: () => void;
  displayCurrency: 'USD' | 'ZiG';
}

export const OrderReviewAndPayment: React.FC<OrderReviewAndPaymentProps> = ({
  trip,
  route,
  passengers,
  snacks,
  allProducts,
  boardingPoint,
  droppingPoint,
  contactPhone,
  pricing,
  couponCode,
  onApplyCoupon,
  couponError,
  couponSuccess,
  onConfirmPayment,
  isProcessing,
  onBack,
  displayCurrency,
}) => {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('ecocash');
  const [walletPhone, setWalletPhone] = useState(contactPhone);
  const [couponInput, setCouponInput] = useState(couponCode);
  const [simulateFailure, setSimulateFailure] = useState(false);
  const [paymentError, setPaymentError] = useState('');

  const handlePay = async () => {
    setPaymentError('');
    if (selectedMethod === 'ecocash' || selectedMethod === 'onemoney') {
      if (!walletPhone.trim()) {
        setPaymentError('Please enter your mobile money phone number for payment prompt');
        return;
      }
    }

    if (simulateFailure) {
      setPaymentError('Payment simulation: Transaction declined by network or insufficient funds. Booking was not paid.');
      return;
    }

    try {
      await onConfirmPayment(selectedMethod, walletPhone);
    } catch (err: any) {
      setPaymentError(err.message || 'Payment processing failed');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <button
            type="button"
            onClick={onBack}
            className="text-xs font-bold text-blue-600 hover:underline mb-1 inline-flex items-center gap-1"
          >
            ← Back to passenger info
          </button>
          <h2 className="text-xl font-black text-slate-900">Review Order & Complete Payment</h2>
          <p className="text-xs text-slate-500">
            Backend validated pricing breakdown & Zimbabwe approved payment gateways.
          </p>
        </div>
      </div>

      {paymentError && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{paymentError}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Journey Summary & Fare Line Items */}
        <div className="lg:col-span-7 space-y-5">
          {/* Journey Snapshot */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider">
              Trip Details
            </h3>
            <BusPreview
              busName={trip.busName}
              busType={trip.busType}
              busNumber={trip.busNumber}
            />
            <div className="flex justify-between items-center">
              <div>
                <div className="text-base font-black text-slate-900">
                  {route.originCityName} → {route.destinationCityName}
                </div>
                <div className="text-xs text-slate-600 font-semibold mt-0.5">
                  {trip.busName} ({trip.busType})
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  Departure: <strong>{trip.departureDate} at {trip.departureTime}</strong>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                  {passengers.length} Seat{passengers.length > 1 ? 's' : ''} ({passengers.map((p) => p.seatNumber).join(', ')})
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-600 space-y-1">
              <div>
                <strong>Boarding:</strong> {boardingPoint}
              </div>
              <div>
                <strong>Dropping:</strong> {droppingPoint}
              </div>
            </div>
          </div>

          {/* Pricing Engine Itemised Breakdown */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider">
              Verified Fare Breakdown
            </h3>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center text-slate-700">
                <span>
                  Passenger Ticket Fares ({pricing.seatCount} × ${pricing.baseFarePerSeatUsd.toFixed(2)})
                </span>
                <span className="font-bold text-slate-900">
                  ${pricing.ticketFaresSubtotalUsd.toFixed(2)} USD
                </span>
              </div>

              {/* SEPARATE LINE FOR BUS LEVY */}
              {pricing.busLevyTotalUsd > 0 && (
                <div className="flex justify-between items-center text-slate-700 bg-amber-50/70 p-2 rounded-lg border border-amber-200/60">
                  <div>
                    <div className="font-semibold text-amber-900 flex items-center gap-1">
                      <span>Government & Station Bus Levy</span>
                      <span className="text-[10px] text-amber-700 font-normal">
                        (${pricing.busLevyPerSeatUsd.toFixed(2)}/seat)
                      </span>
                    </div>
                    <div className="text-[10px] text-amber-700">
                      Standard Zimbabwe passenger road transport statutory levy
                    </div>
                  </div>
                  <span className="font-bold text-amber-950">
                    +${pricing.busLevyTotalUsd.toFixed(2)} USD
                  </span>
                </div>
              )}

              {/* Refreshments */}
              {pricing.snacksSubtotalUsd > 0 && (
                <div className="flex justify-between items-center text-slate-700">
                  <div>
                    <span>Onboard Refreshments & Snacks ({snacks.length} item kinds)</span>
                  </div>
                  <span className="font-bold text-slate-900">
                    +${pricing.snacksSubtotalUsd.toFixed(2)} USD
                  </span>
                </div>
              )}

              {/* Discounts */}
              {pricing.discountUsd > 0 && (
                <div className="flex justify-between items-center text-emerald-700">
                  <span>Applied Promotional Discount:</span>
                  <span className="font-bold">-${pricing.discountUsd.toFixed(2)} USD</span>
                </div>
              )}

              {/* Grand Total */}
              <div className="pt-3 border-t-2 border-slate-200 flex justify-between items-baseline">
                <div>
                  <span className="text-sm font-black text-slate-900">Total Payable:</span>
                  <div className="text-[10px] text-slate-500">
                    Calculated & validated on backend
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-black text-blue-950">
                    ${pricing.totalPayableUsd.toFixed(2)} USD
                  </div>
                  <div className="text-xs font-bold text-amber-600 mt-0.5">
                    ≈ {pricing.totalPayableZiG.toFixed(2)} ZiG
                  </div>
                </div>
              </div>

              {/* Currency Source Note */}
              <div className="text-[10px] text-slate-400 pt-1">
                ZiG converted at {pricing.zigExchangeRate.toFixed(2)} via {pricing.zigRateSource}
              </div>
            </div>

            {/* Coupon Code Input */}
            <div className="pt-3 border-t border-slate-100">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Tag className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                    placeholder="Promo code (e.g. INTERAFRICA2026)"
                    className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 text-xs font-bold uppercase"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => onApplyCoupon(couponInput)}
                  className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  Apply
                </button>
              </div>

              {couponError && (
                <p className="text-[10px] text-red-600 font-semibold mt-1">⚠️ {couponError}</p>
              )}
              {couponSuccess && (
                <p className="text-[10px] text-emerald-600 font-semibold mt-1">✓ {couponSuccess}</p>
              )}
            </div>
          </div>
        </div>

        {/* Right: Payment Gateway Selection */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <CreditCard className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-black text-slate-900">Select Payment Method</h3>
          </div>

          <div className="space-y-2.5">
            {/* EcoCash */}
            <label
              className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                selectedMethod === 'ecocash'
                  ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-500/20'
                  : 'border-slate-200 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="ecocash"
                  checked={selectedMethod === 'ecocash'}
                  onChange={() => setSelectedMethod('ecocash')}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <div className="text-xs font-bold text-slate-900">EcoCash (USD / ZiG)</div>
                  <div className="text-[10px] text-slate-500">Instant mobile push prompt to dial *151#</div>
                </div>
              </div>
              <span className="text-xs font-black text-blue-700">EcoCash</span>
            </label>

            {/* OneMoney */}
            <label
              className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                selectedMethod === 'onemoney'
                  ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-500/20'
                  : 'border-slate-200 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="onemoney"
                  checked={selectedMethod === 'onemoney'}
                  onChange={() => setSelectedMethod('onemoney')}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <div className="text-xs font-bold text-slate-900">NetOne OneMoney</div>
                  <div className="text-[10px] text-slate-500">Instant mobile push PIN prompt</div>
                </div>
              </div>
              <span className="text-xs font-black text-orange-600">OneMoney</span>
            </label>

            {/* InnBucks */}
            <label
              className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                selectedMethod === 'innbucks'
                  ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-500/20'
                  : 'border-slate-200 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="innbucks"
                  checked={selectedMethod === 'innbucks'}
                  onChange={() => setSelectedMethod('innbucks')}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <div className="text-xs font-bold text-slate-900">InnBucks</div>
                  <div className="text-[10px] text-slate-500">Pay via InnBucks QR / App</div>
                </div>
              </div>
              <span className="text-xs font-black text-yellow-600">InnBucks</span>
            </label>

            {/* Zimswitch / Visa / Mastercard */}
            <label
              className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                selectedMethod === 'card'
                  ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-500/20'
                  : 'border-slate-200 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="card"
                  checked={selectedMethod === 'card'}
                  onChange={() => setSelectedMethod('card')}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <div className="text-xs font-bold text-slate-900">Zimswitch / Visa / MasterCard</div>
                  <div className="text-[10px] text-slate-500">Local Zimswitch debit card or Intl card</div>
                </div>
              </div>
              <span className="text-xs font-black text-slate-700">Card</span>
            </label>

            {/* Pay at Office / Terminal */}
            <label
              className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                selectedMethod === 'cash_at_office'
                  ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-500/20'
                  : 'border-slate-200 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cash_at_office"
                  checked={selectedMethod === 'cash_at_office'}
                  onChange={() => setSelectedMethod('cash_at_office')}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <div className="text-xs font-bold text-slate-900">Pay Cash at InterAfrica Office</div>
                  <div className="text-[10px] text-slate-500">
                    Hold seat & pay at Roadport/Depot within 2 hours
                  </div>
                </div>
              </div>
              <span className="text-xs font-black text-emerald-700">Office</span>
            </label>
          </div>

          {/* Wallet Number Input for EcoCash/OneMoney */}
          {(selectedMethod === 'ecocash' || selectedMethod === 'onemoney') && (
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                {selectedMethod === 'ecocash' ? 'EcoCash' : 'OneMoney'} Registered Number *
              </label>
              <input
                type="tel"
                value={walletPhone}
                onChange={(e) => setWalletPhone(e.target.value)}
                placeholder="+263 77 123 4567"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-semibold text-slate-900 bg-white"
              />
              <p className="text-[10px] text-slate-500 mt-1">
                You will receive a prompt on this phone to enter your PIN.
              </p>
            </div>
          )}

          {/* Test Simulation Toggle */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-[11px]">
            <span className="text-slate-600 font-medium">Simulate Payment Failure:</span>
            <button
              type="button"
              onClick={() => setSimulateFailure(!simulateFailure)}
              className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all ${
                simulateFailure
                  ? 'bg-red-600 text-white'
                  : 'bg-slate-200 text-slate-600'
              }`}
            >
              {simulateFailure ? 'Failure ON' : 'Normal (Success)'}
            </button>
          </div>

          {/* Confirm Button */}
          <button
            type="button"
            disabled={isProcessing}
            onClick={handlePay}
            className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-wide flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 active:scale-98 transition-all cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4 stroke-[2.5]" />
            <span>
              {isProcessing
                ? 'Validating & Processing...'
                : selectedMethod === 'cash_at_office'
                ? 'Reserve & Pay at Office'
                : `Pay $${pricing.totalPayableUsd.toFixed(2)} USD Now`}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
