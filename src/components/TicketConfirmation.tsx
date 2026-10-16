import React, { useState } from 'react';
import {
  CheckCircle,
  Share2,
  Printer,
  MessageSquare,
  QrCode,
  Bus,
  MapPin,
  Calendar,
  Clock,
  User,
  ShoppingBag,
  ExternalLink,
  Copy,
  Check,
} from 'lucide-react';
import { BookingRecord, CurrencyConfig } from '../types/index.ts';
import { BusPreview } from './BusPreview.tsx';

interface TicketConfirmationProps {
  booking: BookingRecord;
  qrCodeDataUrl?: string;
  currency: CurrencyConfig | null;
  onBookAnother: () => void;
}

export const TicketConfirmation: React.FC<TicketConfirmationProps> = ({
  booking,
  qrCodeDataUrl,
  currency,
  onBookAnother,
}) => {
  const [copied, setCopied] = useState(false);

  // Generate WhatsApp wa.me text
  const waPhone = '263772123456'; // Official InterAfrica Customer Care line
  const waMessage = encodeURIComponent(
    `Hello InterAfrica Zimbabwe! Please send my confirmed ticket:\nPNR: ${booking.pnr}\nRoute: ${booking.originCityName} to ${booking.destinationCityName}\nDate: ${booking.departureDate} at ${booking.departureTime}\nBus: ${booking.busName} (${booking.busNumber})\nSeats: ${booking.selectedSeats.join(', ')}\nPassengers: ${booking.passengers.map((p) => p.fullName).join(', ')}\nTotal: $${booking.pricing.totalPayableUsd} USD`
  );
  const waUrl = `https://wa.me/${waPhone}?text=${waMessage}`;

  const handlePrint = () => {
    window.print();
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}?pnr=${booking.pnr}&phone=${booking.contactPhone}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `InterAfrica Ticket ${booking.pnr}`,
        text: `My InterAfrica ticket for ${booking.originCityName} to ${booking.destinationCityName} on ${booking.departureDate}. Seats: ${booking.selectedSeats.join(', ')}.`,
        url: window.location.href,
      });
    } else {
      handleCopyLink();
    }
  };

  const isCashAtOffice = booking.paymentStatus === 'cash_at_office';

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Success Banner */}
      <div className="bg-emerald-600 rounded-3xl p-6 sm:p-8 text-white text-center shadow-xl mb-6 relative overflow-hidden">
        <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-3 backdrop-blur-xs">
          <CheckCircle className="w-10 h-10 text-white" />
        </div>
        <span className="inline-block px-3 py-1 rounded-full bg-emerald-500/50 text-xs font-bold uppercase tracking-wider mb-2 border border-emerald-400">
          {isCashAtOffice ? 'Seat Reserved (Cash at Office)' : 'Booking Confirmed & Ticket Issued'}
        </span>
        <h1 className="text-2xl sm:text-3xl font-black">
          {isCashAtOffice ? 'Reservation Successful' : 'Have a Safe Journey!'}
        </h1>
        <p className="text-xs sm:text-sm text-emerald-100 mt-1 max-w-md mx-auto">
          {isCashAtOffice
            ? 'Your seats are held. Please present this reference at any InterAfrica terminal office to pay within 2 hours.'
            : 'Your official InterAfrica bus booking and e-ticket are confirmed and ready for boarding.'}
        </p>

        {/* PNR display */}
        <div className="mt-5 inline-flex items-center gap-2 bg-white text-blue-950 px-5 py-2.5 rounded-2xl shadow-lg">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Booking Reference (PNR):
          </span>
          <span className="text-lg font-black tracking-wider text-blue-950">{booking.pnr}</span>
        </div>
      </div>

      {/* Prominent WhatsApp Call-To-Action Banner (Section 8 key requirement) */}
      <div className="bg-emerald-50 border-2 border-emerald-500/40 rounded-2xl p-5 mb-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-md">
            <MessageSquare className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-sm font-black text-emerald-950">
              Get Your Ticket & Boarding Pass on WhatsApp
            </h3>
            <p className="text-xs text-emerald-700">
              Click to open WhatsApp directly with your verified PNR and ticket details.
            </p>
          </div>
        </div>

        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition-all shrink-0 cursor-pointer"
        >
          <span>Open in WhatsApp</span>
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>

      {/* Main Printable Ticket Card */}
      <div className="bg-white rounded-3xl border-2 border-slate-200 shadow-xl overflow-hidden print:shadow-none print:border-slate-400 mb-6">
        {/* Ticket Header */}
        <div className="bg-blue-950 p-6 text-white flex flex-wrap justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-blue-950 font-black flex items-center justify-center">
              <Bus className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-lg tracking-tight">INTERAFRICA</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-400 text-blue-950">
                  OFFICIAL TICKET
                </span>
              </div>
              <p className="text-xs text-blue-200">Zimbabwe Intercity Passenger Services</p>
            </div>
          </div>

          <div className="text-right">
            <div className="text-xs text-blue-300 font-medium">PNR Reference</div>
            <div className="text-xl font-mono font-black text-amber-400">{booking.pnr}</div>
          </div>
        </div>

        {/* Route Banner */}
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex flex-wrap justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div>
              <div className="text-xl font-black text-slate-900">{booking.originCityName}</div>
              <div className="text-xs text-slate-500 font-medium">Boarding Point: {booking.boardingPoint}</div>
            </div>
            <span className="text-lg font-bold text-slate-400">→</span>
            <div>
              <div className="text-xl font-black text-slate-900">{booking.destinationCityName}</div>
              <div className="text-xs text-slate-500 font-medium">Dropping Point: {booking.droppingPoint}</div>
            </div>
          </div>

          <div className="text-right">
            <div className="text-xs font-bold text-slate-500 uppercase">Departure Time</div>
            <div className="text-lg font-black text-blue-950">
              {booking.departureDate} at {booking.departureTime}
            </div>
          </div>
        </div>

        <div className="px-6 pt-5">
          <BusPreview
            busName={booking.busName}
            busType={booking.busType}
            busNumber={booking.busNumber}
            className="mx-auto max-w-xl"
          />
        </div>

        {/* Ticket Body: QR Code & Passengers */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* QR Code */}
          <div className="md:col-span-4 flex flex-col items-center justify-center p-4 bg-slate-50 rounded-2xl border border-slate-200">
            {qrCodeDataUrl ? (
              <img
                src={qrCodeDataUrl}
                alt={`QR code for ticket ${booking.pnr}`}
                className="w-40 h-40 object-contain rounded-lg"
              />
            ) : (
              <QrCode className="w-32 h-32 text-slate-400" />
            )}
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-2 text-center">
              Scan to Board • Conductor QR
            </div>
          </div>

          {/* Passenger & Coach Info */}
          <div className="md:col-span-8 space-y-4">
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-400 font-medium block">Coach Name & Reg:</span>
                <span className="font-bold text-slate-900 text-sm">
                  {booking.busName} ({booking.busNumber})
                </span>
              </div>
              <div>
                <span className="text-slate-400 font-medium block">Coach Class:</span>
                <span className="font-bold text-slate-900 text-sm">{booking.busType}</span>
              </div>
              <div>
                <span className="text-slate-400 font-medium block">Assigned Seats:</span>
                <span className="font-black text-blue-900 text-sm">
                  {booking.selectedSeats.join(', ')}
                </span>
              </div>
              <div>
                <span className="text-slate-400 font-medium block">Payment Status:</span>
                <span
                  className={`inline-block font-black uppercase text-[11px] px-2 py-0.5 rounded ${
                    isCashAtOffice
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {isCashAtOffice ? 'Pay Cash at Terminal' : 'PAID & CONFIRMED'}
                </span>
              </div>
            </div>

            {/* Passenger List */}
            <div className="pt-3 border-t border-slate-100">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Passengers
              </span>
              <div className="space-y-1.5">
                {booking.passengers.map((p, idx) => (
                  <div
                    key={p.seatNumber}
                    className="flex justify-between items-center text-xs p-2 rounded-lg bg-slate-50"
                  >
                    <div className="flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-bold text-slate-800">{p.fullName}</span>
                      <span className="text-[11px] text-slate-500">
                        ({p.gender}, Age {p.age})
                      </span>
                    </div>
                    <span className="font-black text-blue-900">Seat {p.seatNumber}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Fare and Bus Levy Summary Line */}
        <div className="bg-slate-50 p-6 border-t border-slate-200">
          <div className="space-y-1 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Passenger Ticket Fares ({booking.pricing.seatCount} seats):</span>
              <span className="font-bold text-slate-800">
                ${booking.pricing.ticketFaresSubtotalUsd.toFixed(2)} USD
              </span>
            </div>
            {booking.pricing.busLevyTotalUsd > 0 && (
              <div className="flex justify-between text-slate-600">
                <span>Zimbabwe Statutory Bus Levy:</span>
                <span className="font-bold text-slate-800">
                  ${booking.pricing.busLevyTotalUsd.toFixed(2)} USD
                </span>
              </div>
            )}
            {booking.pricing.snacksSubtotalUsd > 0 && (
              <div className="flex justify-between text-slate-600">
                <span>Onboard Snacks & Drinks:</span>
                <span className="font-bold text-slate-800">
                  ${booking.pricing.snacksSubtotalUsd.toFixed(2)} USD
                </span>
              </div>
            )}
            {booking.pricing.discountUsd > 0 && (
              <div className="flex justify-between text-emerald-700 font-semibold">
                <span>Promotional Discount:</span>
                <span>-${booking.pricing.discountUsd.toFixed(2)} USD</span>
              </div>
            )}
            <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline">
              <span className="font-black text-slate-900 text-sm">Total Paid:</span>
              <div className="text-right">
                <span className="font-black text-blue-950 text-lg">
                  ${booking.pricing.totalPayableUsd.toFixed(2)} USD
                </span>
                <span className="block text-[11px] text-amber-700 font-bold">
                  ({booking.pricing.totalPayableZiG.toFixed(2)} ZiG)
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Linked Separate Refreshment Order Voucher (if snacks were ordered) */}
      {booking.snacks && booking.snacks.length > 0 && (
        <div className="bg-white rounded-2xl border-2 border-purple-200 shadow-sm p-5 mb-6">
          <div className="flex items-center justify-between border-b border-purple-100 pb-3 mb-3">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-purple-600" />
              <h3 className="text-sm font-black text-slate-900">
                Onboard Refreshment Voucher (Linked to PNR: {booking.pnr})
              </h3>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-800 uppercase">
              Collect at Terminal
            </span>
          </div>

          <div className="space-y-2 text-xs">
            {booking.snacks.map((s) => (
              <div key={s.productId} className="flex justify-between items-center text-slate-700">
                <span>
                  {s.quantity}× {s.productName} ({s.packSize})
                </span>
                <span className="font-bold text-slate-900">${s.lineTotalUsd.toFixed(2)} USD</span>
              </div>
            ))}
            <div className="pt-2 border-t border-slate-100 flex justify-between font-bold text-purple-900">
              <span>Refreshment Subtotal:</span>
              <span>${booking.pricing.snacksSubtotalUsd.toFixed(2)} USD</span>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={handlePrint}
          className="px-5 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
        >
          <Printer className="w-4 h-4" />
          <span>Print / Save PDF</span>
        </button>

        <button
          type="button"
          onClick={handleShare}
          className="px-5 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
        >
          <Share2 className="w-4 h-4" />
          <span>Share Ticket</span>
        </button>

        <button
          type="button"
          onClick={handleCopyLink}
          className="px-5 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
          <span>{copied ? 'Link Copied!' : 'Copy Ticket Link'}</span>
        </button>

        <button
          type="button"
          onClick={onBookAnother}
          className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-md shadow-blue-500/20 cursor-pointer"
        >
          Book Another Trip
        </button>
      </div>
    </div>
  );
};
