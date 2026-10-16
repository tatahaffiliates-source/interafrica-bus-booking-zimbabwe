import React, { useState } from 'react';
import {
  QrCode,
  ShieldCheck,
  CheckCircle,
  AlertTriangle,
  User,
  Search,
  WifiOff,
  Bus,
} from 'lucide-react';
import { BookingRecord } from '../types/index.ts';
import { fetchBookingByPnr, boardPassenger } from '../services/api.ts';

export const ConductorScanner: React.FC = () => {
  const [scanInput, setScanInput] = useState('');
  const [booking, setBooking] = useState<BookingRecord | null>(null);
  const [boardedSuccess, setBoardedSuccess] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [offlineMode, setOfflineMode] = useState(false);

  // Parse QR payload or PNR input
  const handleScanOrSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const raw = scanInput.trim();
    if (!raw) return;

    let targetPnr = raw.toUpperCase();
    // In case the QR code was raw JSON
    try {
      if (raw.startsWith('{') && raw.endsWith('}')) {
        const parsed = JSON.parse(raw);
        if (parsed.pnr) targetPnr = parsed.pnr.toUpperCase();
      }
    } catch {
      // not json, use as-is
    }

    setIsProcessing(true);
    setStatusMessage('');
    setBoardedSuccess(false);

    try {
      const res = await fetchBookingByPnr(targetPnr);
      if (res.error || !res.booking) {
        setStatusMessage(res.error || `PNR "${targetPnr}" not recognized`);
        setBooking(null);
      } else {
        setBooking(res.booking);
        if (res.booking.status === 'boarded') {
          setStatusMessage(`Passenger was already BOARDED at ${res.booking.boardedAt ? new Date(res.booking.boardedAt).toLocaleTimeString() : 'earlier'}.`);
        } else if (res.booking.status === 'cancelled') {
          setStatusMessage('WARNING: This ticket was CANCELLED. Boarding denied.');
        }
      }
    } catch (err: any) {
      setStatusMessage('Network timeout. Switch to offline verification if at remote terminus.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmBoarding = async () => {
    if (!booking) return;
    setIsProcessing(true);
    try {
      const res = await boardPassenger(booking.pnr, 'CONDUCTOR-TERMINAL-01');
      if (res.success && res.booking) {
        setBooking(res.booking);
        setBoardedSuccess(true);
        setStatusMessage(`Passenger marked BOARDED for Seat(s) ${res.booking.selectedSeats.join(', ')}`);
      } else {
        setStatusMessage(res.error || 'Failed to board passenger');
      }
    } catch (err: any) {
      setStatusMessage(err.message || 'Error communicating with central booking depot');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Conductor Bar Header */}
      <div className="bg-slate-900 rounded-3xl p-6 text-white mb-6 shadow-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
            <h2 className="text-xl font-black">Conductor & Terminal Boarding Station</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Scan passenger QR code or enter PNR to verify seat assignment and mark passenger boarded.
          </p>
        </div>

        {/* Offline Mode Toggle for Zimbabwe Remote Roads */}
        <button
          type="button"
          onClick={() => setOfflineMode(!offlineMode)}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
            offlineMode
              ? 'bg-amber-500 text-slate-950 font-black'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          {offlineMode && <WifiOff className="w-3.5 h-3.5" />}
          <span>{offlineMode ? 'Low-Bandwidth Mode' : 'Online Mode'}</span>
        </button>
      </div>

      {/* QR Input / Scanner Simulation Form */}
      <form
        onSubmit={handleScanOrSearch}
        className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm mb-6 space-y-3"
      >
        <label className="block text-xs font-bold text-slate-700 uppercase">
          Scan QR Code Payload or Enter PNR
        </label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <QrCode className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={scanInput}
              onChange={(e) => setScanInput(e.target.value)}
              placeholder="Scan QR or enter PNR (e.g. IA-ZW-74921)"
              className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-xs font-mono font-bold text-slate-900 uppercase"
              autoFocus
            />
          </div>
          <button
            type="submit"
            disabled={isProcessing}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-wide cursor-pointer transition-colors"
          >
            {isProcessing ? 'Verifying...' : 'Verify'}
          </button>
        </div>

        {/* Quick Demo Fill Buttons */}
        <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-500">
          <span>Demo shortcuts:</span>
          <button
            type="button"
            onClick={() => setScanInput('IA-DEMO-01')}
            className="text-blue-600 hover:underline font-mono"
          >
            IA-DEMO-01
          </button>
          <span>•</span>
          <button
            type="button"
            onClick={() => setScanInput('IA-DEMO-02')}
            className="text-blue-600 hover:underline font-mono"
          >
            IA-DEMO-02
          </button>
        </div>
      </form>

      {statusMessage && (
        <div
          className={`mb-6 p-4 rounded-xl text-xs font-semibold flex items-center gap-2 ${
            boardedSuccess || booking?.status === 'boarded'
              ? 'bg-blue-50 border border-blue-200 text-blue-800'
              : booking?.status === 'cancelled'
              ? 'bg-red-50 border border-red-200 text-red-800'
              : 'bg-amber-50 border border-amber-200 text-amber-800'
          }`}
        >
          {boardedSuccess || booking?.status === 'boarded' ? (
            <CheckCircle className="w-4 h-4 text-blue-600 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          )}
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Ticket Details for Conductor Inspection */}
      {booking && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6 space-y-5">
          <div className="flex justify-between items-center pb-4 border-b border-slate-100">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Passenger PNR
              </span>
              <div className="text-2xl font-mono font-black text-blue-950">{booking.pnr}</div>
            </div>

            <div className="text-right">
              <span
                className={`inline-block px-3 py-1 rounded-full text-xs font-black uppercase ${
                  booking.status === 'boarded'
                    ? 'bg-emerald-100 text-emerald-800'
                    : booking.status === 'confirmed'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {booking.status === 'boarded' ? '✓ BOARDED' : booking.status}
              </span>
              <div className="text-[10px] text-slate-500 mt-1">
                Payment: <strong>{booking.paymentStatus}</strong>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-slate-400 block font-medium">Route:</span>
              <span className="font-bold text-slate-900 text-sm">
                {booking.originCityName} → {booking.destinationCityName}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Departure Date & Time:</span>
              <span className="font-bold text-slate-900 text-sm">
                {booking.departureDate} at {booking.departureTime}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Bus Unit:</span>
              <span className="font-bold text-slate-900 text-sm">
                {booking.busName} ({booking.busNumber})
              </span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Assigned Seats:</span>
              <span className="font-black text-emerald-700 text-base">
                {booking.selectedSeats.join(', ')}
              </span>
            </div>
          </div>

          {/* Passenger Names List */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
              Passengers on Manifest:
            </span>
            <div className="space-y-2">
              {booking.passengers.map((p) => (
                <div key={p.seatNumber} className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-900">{p.fullName}</span>
                  <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-900 font-bold">
                    Seat {p.seatNumber}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Refreshment Checklist for Onboard Attendant */}
          {booking.snacks && booking.snacks.length > 0 && (
            <div className="bg-purple-50 p-4 rounded-2xl border border-purple-200 text-xs">
              <span className="font-bold text-purple-900 block mb-1">
                Pre-ordered Refreshments to Hand Over:
              </span>
              <ul className="list-disc list-inside space-y-1 text-purple-800">
                {booking.snacks.map((s) => (
                  <li key={s.productId}>
                    {s.quantity}× {s.productName} ({s.packSize})
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Action Button: Confirm Boarding */}
          {booking.status === 'confirmed' && (
            <button
              type="button"
              disabled={isProcessing}
              onClick={handleConfirmBoarding}
              className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-wide flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 active:scale-98 cursor-pointer transition-all"
            >
              <ShieldCheck className="w-5 h-5" />
              <span>Confirm Passenger Boarded</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
