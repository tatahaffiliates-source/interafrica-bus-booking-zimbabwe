import React, { useState } from 'react';
import {
  Search,
  Ticket,
  AlertCircle,
  Clock,
  MapPin,
  User,
  ShieldAlert,
  CheckCircle,
  XCircle,
  MessageSquare,
  Printer,
  ChevronRight,
} from 'lucide-react';
import { BookingRecord, CurrencyConfig } from '../types/index.ts';
import { fetchBookingByPnr, cancelBooking } from '../services/api.ts';
import { BusPreview } from './BusPreview.tsx';

interface ManageBookingProps {
  initialPnr?: string;
  initialPhone?: string;
  currency: CurrencyConfig | null;
  displayCurrency: 'USD' | 'ZiG';
  onViewFullTicket: (booking: BookingRecord) => void;
}

export const ManageBooking: React.FC<ManageBookingProps> = ({
  initialPnr = '',
  initialPhone = '',
  currency,
  displayCurrency,
  onViewFullTicket,
}) => {
  const [pnrInput, setPnrInput] = useState(initialPnr);
  const [phoneInput, setPhoneInput] = useState(initialPhone);
  const [booking, setBooking] = useState<BookingRecord | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelSuccessMsg, setCancelSuccessMsg] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pnrInput.trim()) {
      setErrorMsg('Please enter your Booking Reference (PNR)');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');
    setCancelSuccessMsg('');

    try {
      const res = await fetchBookingByPnr(pnrInput.trim(), phoneInput.trim());
      if (res.error || !res.booking) {
        setErrorMsg(res.error || 'Booking reference not found');
        setBooking(null);
      } else {
        setBooking(res.booking);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to search booking');
      setBooking(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!booking) return;
    setIsCancelling(true);
    setErrorMsg('');

    try {
      const res = await cancelBooking(booking.pnr, cancelReason);
      if (!res.success) {
        setErrorMsg(res.error || 'Failed to cancel booking');
      } else {
        setCancelSuccessMsg(
          `Booking ${booking.pnr} has been cancelled. A refund of $${res.refundAmountUsd} USD has been processed (Retention fee: $${res.cancellationFeeUsd} USD).`
        );
        // Refresh booking
        const refreshed = await fetchBookingByPnr(booking.pnr);
        if (refreshed.booking) setBooking(refreshed.booking);
        setCancelModalOpen(false);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error occurred while processing cancellation');
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:py-10">
      {/* Title */}
      <div className="mx-auto mb-7 max-w-xl">
        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
          <Ticket className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Manage your booking</h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          Find your InterAfrica ticket using your booking reference. A contact phone number is optional.
        </p>
      </div>

      {/* Lookup Form */}
      <form
        onSubmit={handleSearch}
        className="mx-auto mb-7 max-w-xl space-y-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Booking reference (PNR) <span aria-hidden="true">*</span>
            </label>
            <input
              type="text"
              value={pnrInput}
              onChange={(e) => setPnrInput(e.target.value.toUpperCase())}
              placeholder="e.g. IA-ZW-74921"
              className="w-full rounded-lg border border-slate-300 px-3 py-3 text-sm font-medium uppercase text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
              required
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Contact phone <span className="font-normal text-slate-500">(optional)</span>
            </label>
            <input
              type="tel"
              value={phoneInput}
              onChange={(e) => setPhoneInput(e.target.value)}
              placeholder="e.g. 0771234567"
              className="w-full rounded-lg border border-slate-300 px-3 py-3 text-sm text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="flex min-h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-blue-600 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-wait disabled:opacity-70"
        >
          <Search className="w-4 h-4" />
          <span>{isLoading ? 'Searching...' : 'Find Ticket'}</span>
        </button>
      </form>

      {errorMsg && (
        <div role="alert" className="mx-auto mb-6 flex max-w-xl items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {cancelSuccessMsg && (
        <div role="status" className="mx-auto mb-6 flex max-w-xl items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{cancelSuccessMsg}</span>
        </div>
      )}

      {/* Booking Details Card */}
      {booking && (
        <div className="mx-auto max-w-2xl overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          {/* Status Header */}
          <div className="bg-slate-900 p-5 text-white flex justify-between items-center">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Booking Reference
              </span>
              <span className="text-xl font-mono font-black text-amber-400">{booking.pnr}</span>
            </div>

            <div className="text-right">
              <span
                className={`inline-block px-3 py-1 rounded-full text-xs font-black uppercase ${
                  booking.status === 'confirmed'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : booking.status === 'boarded'
                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                    : 'bg-red-500/20 text-red-400 border border-red-500/30'
                }`}
              >
                {booking.status}
              </span>
              <div className="text-[10px] text-slate-400 mt-1">
                Payment: {booking.paymentStatus}
              </div>
            </div>
          </div>

          <div className="p-6 space-y-5">
            {/* Journey Summary */}
            <div className="flex justify-between items-center pb-4 border-b border-slate-100">
              <div>
                <div className="text-lg font-black text-slate-900">
                  {booking.originCityName} → {booking.destinationCityName}
                </div>
                <div className="text-xs text-slate-600 font-medium">
                  {booking.busName} • {booking.busNumber}
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  📅 {booking.departureDate} at {booking.departureTime}
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-slate-400 font-medium">Seats:</div>
                <div className="text-base font-black text-blue-900">
                  {booking.selectedSeats.join(', ')}
                </div>
              </div>
            </div>

            <BusPreview
              busName={booking.busName}
              busType={booking.busType}
              busNumber={booking.busNumber}
            />

            {/* Passengers */}
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
                Passenger List
              </span>
              <div className="space-y-1.5">
                {booking.passengers.map((p) => (
                  <div
                    key={p.seatNumber}
                    className="flex justify-between items-center text-xs p-2.5 rounded-xl bg-slate-50 border border-slate-100"
                  >
                    <span className="font-bold text-slate-800">{p.fullName}</span>
                    <span className="text-slate-600 font-medium">Seat {p.seatNumber}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Price breakdown */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs space-y-1.5">
              <div className="flex justify-between text-slate-600">
                <span>Fares Subtotal:</span>
                <span>${booking.pricing.ticketFaresSubtotalUsd.toFixed(2)} USD</span>
              </div>
              {booking.pricing.busLevyTotalUsd > 0 && (
                <div className="flex justify-between text-slate-600">
                  <span>Bus Levy:</span>
                  <span>${booking.pricing.busLevyTotalUsd.toFixed(2)} USD</span>
                </div>
              )}
              {booking.pricing.snacksSubtotalUsd > 0 && (
                <div className="flex justify-between text-slate-600">
                  <span>Snacks Subtotal:</span>
                  <span>${booking.pricing.snacksSubtotalUsd.toFixed(2)} USD</span>
                </div>
              )}
              <div className="pt-2 border-t border-slate-200 flex justify-between font-black text-slate-900">
                <span>Total Paid:</span>
                <span>${booking.pricing.totalPayableUsd.toFixed(2)} USD</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-2 pt-2">
              <button
                type="button"
                onClick={() => onViewFullTicket(booking)}
                className="flex-1 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>View Full Ticket</span>
              </button>

              {booking.status === 'confirmed' && (
                <button
                  type="button"
                  onClick={() => setCancelModalOpen(true)}
                  className="py-2.5 px-4 rounded-xl border border-red-300 hover:bg-red-50 text-red-600 text-xs font-bold transition-colors"
                >
                  Cancel Booking
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Cancellation Confirmation Modal */}
      {cancelModalOpen && booking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div role="dialog" aria-modal="true" aria-labelledby="cancel-booking-title" className="w-full max-w-md space-y-4 rounded-xl bg-white p-5 shadow-2xl sm:p-6">
            <div className="flex items-center gap-3 text-red-600">
              <ShieldAlert className="w-6 h-6" />
              <h3 id="cancel-booking-title" className="text-base font-semibold text-slate-900">
                Cancel Booking {booking.pnr}?
              </h3>
            </div>

            <p className="text-xs text-slate-600">
              According to the InterAfrica cancellation policy, cancellations more than 24 hours prior to departure are subject to a 15% administrative fee. Seats and refreshments will be returned to inventory.
            </p>

            <div className="bg-slate-50 p-3 rounded-xl text-xs space-y-1">
              <div className="flex justify-between text-slate-600">
                <span>Original Total Paid:</span>
                <span className="font-bold">${booking.pricing.totalPayableUsd.toFixed(2)} USD</span>
              </div>
              <div className="flex justify-between text-red-600">
                <span>Cancellation Fee (15%):</span>
                <span>-${(booking.pricing.ticketFaresSubtotalUsd * 0.15).toFixed(2)} USD</span>
              </div>
              <div className="pt-1 border-t border-slate-200 flex justify-between font-black text-emerald-700">
                <span>Estimated Refund Amount:</span>
                <span>
                  ${(booking.pricing.totalPayableUsd - booking.pricing.ticketFaresSubtotalUsd * 0.15).toFixed(2)} USD
                </span>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                Reason for cancellation (optional):
              </label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Change of travel plans, reschedule..."
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                rows={2}
              ></textarea>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setCancelModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-100"
              >
                Keep Booking
              </button>
              <button
                type="button"
                disabled={isCancelling}
                onClick={handleCancel}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all shadow-md shadow-red-600/20"
              >
                {isCancelling ? 'Processing...' : 'Confirm Cancellation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
