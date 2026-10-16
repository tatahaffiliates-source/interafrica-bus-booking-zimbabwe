import React, { useState, useEffect } from 'react';
import {
  Clock,
  Check,
  AlertCircle,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Info,
} from 'lucide-react';
import { ScheduledTrip, BusRoute, TripSeatState, CurrencyConfig } from '../types/index.ts';
import { COACH_50_SEATS } from '../server/db.ts';
import { BusPreview } from './BusPreview.tsx';

interface CoachSeatMapProps {
  trip: ScheduledTrip;
  route: BusRoute;
  seats: TripSeatState[];
  selectedSeatNumbers: string[];
  maxSeatsAllowed: number;
  onToggleSeat: (seatNumber: string) => void;
  holdExpiresAt: number | null;
  onHoldExpired: () => void;
  currency: CurrencyConfig | null;
  displayCurrency: 'USD' | 'ZiG';
  onContinue: () => void;
  onBack: () => void;
  isLoadingHold: boolean;
  holdErrorMessage?: string;
}

export const CoachSeatMap: React.FC<CoachSeatMapProps> = ({
  trip,
  route,
  seats,
  selectedSeatNumbers,
  maxSeatsAllowed,
  onToggleSeat,
  holdExpiresAt,
  onHoldExpired,
  currency,
  displayCurrency,
  onContinue,
  onBack,
  isLoadingHold,
  holdErrorMessage,
}) => {
  const [secondsRemaining, setSecondsRemaining] = useState<number>(600);

  // Timer countdown
  useEffect(() => {
    if (!holdExpiresAt) return;

    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.floor((holdExpiresAt - Date.now()) / 1000));
      setSecondsRemaining(remaining);
      if (remaining <= 0) {
        clearInterval(interval);
        onHoldExpired();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [holdExpiresAt, onHoldExpired]);

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const getSeatStatus = (seatNum: string): 'available' | 'selected' | 'booked' | 'held' => {
    if (selectedSeatNumbers.includes(seatNum)) return 'selected';
    const state = seats.find((s) => s.seatNumber === seatNum);
    if (!state) return 'available';
    if (state.status === 'booked') return 'booked';
    if (state.status === 'held') return 'held';
    return 'available';
  };

  // Calculate quick summary totals
  const seatFareSubtotal = trip.fareUsd * selectedSeatNumbers.length;
  const levySubtotal = trip.isLevyApplicable ? trip.busLevyUsd * selectedSeatNumbers.length : 0;
  const totalSubtotal = seatFareSubtotal + levySubtotal;

  const renderFormattedMoney = (usd: number) => {
    if (displayCurrency === 'ZiG' && currency) {
      return `${(usd * currency.usdToZigRate).toFixed(2)} ZiG`;
    }
    return `$${usd.toFixed(2)} USD`;
  };

  // Render individual seat button
  const renderSeatButton = (seatNum: string) => {
    const status = getSeatStatus(seatNum);
    const isSelected = status === 'selected';
    const isBooked = status === 'booked';
    const isHeld = status === 'held';
    const isAvailable = status === 'available';
    const statusLabel = {
      selected: 'selected',
      booked: 'booked',
      held: 'temporarily held',
      available: 'available',
    }[status];

    return (
      <button
        key={seatNum}
        type="button"
        disabled={isBooked || isHeld || isLoadingHold}
        onClick={() => onToggleSeat(seatNum)}
        aria-label={`Seat ${seatNum}, ${statusLabel}${isAvailable || isSelected ? `, ${renderFormattedMoney(trip.fareUsd)}` : ''}`}
        aria-pressed={isSelected}
        title={
          isBooked
            ? `Seat ${seatNum} is booked`
            : isHeld
            ? `Seat ${seatNum} is temporarily held`
            : `Seat ${seatNum} ($${trip.fareUsd})`
        }
        className={`relative w-10 h-11 sm:w-11 sm:h-12 rounded-lg font-bold text-xs flex flex-col items-center justify-center transition-all cursor-pointer shadow-xs ${
          isSelected
            ? 'bg-emerald-600 text-white border-2 border-emerald-400 scale-105 shadow-md shadow-emerald-600/30 ring-2 ring-emerald-300'
            : isBooked
            ? 'bg-slate-200 text-slate-400 border border-slate-300 cursor-not-allowed opacity-60'
            : isHeld
            ? 'bg-amber-100 text-amber-800 border border-amber-400 cursor-not-allowed'
            : 'bg-white hover:bg-emerald-50 text-slate-800 border-2 border-slate-300 hover:border-emerald-500'
        }`}
      >
        {/* Seat cushion icon styling */}
        <span className="text-[11px] font-bold">{seatNum}</span>
        {isSelected ? (
          <Check className="w-3 h-3 stroke-[3]" />
        ) : isBooked ? (
          <span className="text-[9px] font-semibold text-slate-400">Sold</span>
        ) : isHeld ? (
          <span className="text-[9px] font-semibold text-amber-800">Held</span>
        ) : (
          <span className="text-[10px] font-medium text-slate-600">${trip.fareUsd}</span>
        )}
      </button>
    );
  };

  return (
    <div className="mx-auto max-w-5xl px-3 py-6 sm:px-4">
      {/* Top Header & Trip Summary */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <button
            type="button"
            onClick={onBack}
            className="text-xs font-bold text-blue-600 hover:underline mb-1 inline-flex items-center gap-1"
          >
            ← Back to departures
          </button>
          <h1 className="text-lg font-semibold tracking-tight text-slate-900 sm:text-xl">
            {trip.busName} • {trip.departureTime}
          </h1>
          <p className="text-xs text-slate-500">
            {route.originCityName} → {route.destinationCityName} • {new Date(trip.departureDate).toLocaleDateString()}
          </p>
          <BusPreview
            busName={trip.busName}
            busType={trip.busType}
            busNumber={trip.busNumber}
            className="mt-3 max-w-lg"
          />
        </div>

        {/* Live Seat Hold Countdown */}
        {selectedSeatNumbers.length > 0 && holdExpiresAt && (
          <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 px-3.5 py-2 rounded-xl text-amber-900 shadow-xs">
            <Clock className="w-4 h-4 text-amber-600 animate-pulse" />
            <div className="text-xs">
              <span className="font-semibold">Seat Hold Active: </span>
              <span className="font-black text-amber-700 text-sm">
                {formatTimer(secondsRemaining)}
              </span>
            </div>
          </div>
        )}
      </div>

      {holdErrorMessage && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{holdErrorMessage}</span>
        </div>
      )}

      {/* Main Grid: Left is Legend & Coach Map; Right is Booking Selection Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Legend & Coach Graphic */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-4 sm:p-6 border border-slate-200 shadow-sm flex flex-col items-center">
          {/* Seat Status Legend */}
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mb-6 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-200 w-full">
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 rounded border-2 border-slate-300 bg-white"></div>
              <span>Available</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 rounded bg-emerald-600 text-white flex items-center justify-center">
                <Check className="w-3 h-3" />
              </div>
              <span className="font-semibold text-emerald-800">Selected</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 rounded bg-slate-200 border border-slate-300"></div>
              <span className="text-slate-400">Booked</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 rounded bg-amber-100 border border-amber-300"></div>
              <span className="text-amber-700">Held (10m)</span>
            </div>
          </div>

          <div className="text-[11px] text-slate-500 mb-4 font-medium flex items-center gap-1">
            <Info className="w-3.5 h-3.5 text-blue-500" />
            <span>Select up to {maxSeatsAllowed} passenger seat(s). Tap again to deselect.</span>
          </div>

          {/* Coach Frame Graphic (Matches User's Reference Layout) */}
          <div className="relative w-full max-w-sm overflow-hidden rounded-2xl border-2 border-blue-950 bg-slate-100 p-2.5 shadow-sm sm:p-4">
            {/* Front Cap / Windshield Area */}
            <div className="bg-linear-to-b from-blue-950 to-blue-900 rounded-t-[28px] p-3 text-white mb-3 text-center shadow-md">
              <div className="text-[10px] font-black uppercase tracking-widest text-blue-200">
                Front • Driver & Windshield
              </div>
              {/* Cockpit layout: Door & Steps on Left; Steering wheel & Driver on Right */}
              <div className="flex justify-between items-center mt-2 px-3">
                {/* Front Left Entrance Door & Steps */}
                <div className="flex items-center gap-1">
                  <div className="flex flex-col gap-0.5">
                    <div className="w-6 h-1.5 bg-slate-400 rounded-xs"></div>
                    <div className="w-6 h-1.5 bg-slate-300 rounded-xs"></div>
                    <div className="w-6 h-1.5 bg-slate-200 rounded-xs"></div>
                  </div>
                  <span className="text-[9px] font-bold text-amber-300 uppercase">Entrance</span>
                </div>

                {/* Front Right Driver Area */}
                <div className="flex items-center gap-1.5">
                  <div className="w-7 h-7 rounded-full border border-white/50 flex items-center justify-center bg-blue-800">
                    <span className="text-[10px] font-semibold">D</span>
                  </div>
                  <span className="text-[9px] font-bold text-slate-300 uppercase">Driver</span>
                </div>
              </div>
            </div>

            {/* Crew Seats Behind Front Entrance */}
            <div className="flex justify-between items-center px-2 py-1 mb-2 border-b border-slate-300/60">
              <div className="flex gap-1.5">
                <div className="w-8 h-8 rounded-md bg-slate-300 text-slate-600 text-[9px] font-bold flex items-center justify-center" title="Crew / Attendant Seat">
                  Crew
                </div>
                <div className="w-8 h-8 rounded-md bg-slate-300 text-slate-600 text-[9px] font-bold flex items-center justify-center" title="Crew / Attendant Seat">
                  Crew
                </div>
              </div>
              <span className="text-[10px] text-slate-400 font-medium">Cabin Forward</span>
            </div>

            {/* Coach Cabin with Central Wood Floor Aesthetic */}
            <div className="relative bg-stone-100 rounded-xl p-2 border border-stone-200 shadow-inner">
              {/* Emergency exits on sides */}
              <div className="absolute left-0 top-1/2 -translate-y-1/2 px-0.5 py-2 bg-amber-500 text-[8px] font-semibold text-white rounded-r tracking-tighter uppercase [writing-mode:vertical-lr]">
                Emergency Exit
              </div>
              <div className="absolute right-0 top-1/2 -translate-y-1/2 px-0.5 py-2 bg-amber-500 text-[8px] font-semibold text-white rounded-l tracking-tighter uppercase [writing-mode:vertical-lr]">
                Emergency Exit
              </div>

              {/* Rows 1 to 11 (2+2 layout: Left Window, Left Aisle, Aisle, Right Aisle, Right Window) */}
              <div className="space-y-2">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((row) => {
                  const s1 = String((row - 1) * 4 + 1);
                  const s2 = String((row - 1) * 4 + 2);
                  const s3 = String((row - 1) * 4 + 3);
                  const s4 = String((row - 1) * 4 + 4);

                  return (
                    <div key={row} className="flex items-center justify-between gap-1 sm:gap-2">
                      {/* Left Pair */}
                      <div className="flex gap-1 sm:gap-1.5">
                        {renderSeatButton(s1)}
                        {renderSeatButton(s2)}
                      </div>

                      {/* Central Aisle */}
                      <div className="flex-1 flex justify-center text-[10px] font-mono text-stone-400 select-none">
                        R{row}
                      </div>

                      {/* Right Pair */}
                      <div className="flex gap-1 sm:gap-1.5">
                        {renderSeatButton(s3)}
                        {renderSeatButton(s4)}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Rear Row of 6 Seats (45, 46, 47, 48, 49, 50) */}
              <div className="mt-3 pt-2 border-t-2 border-stone-300">
                <div className="text-[10px] text-center font-bold text-stone-500 mb-1">
                  Rear Bench (Seats 45 – 50)
                </div>
                <div className="grid grid-cols-6 gap-1">
                  {['45', '46', '47', '48', '49', '50'].map((num) => renderSeatButton(num))}
                </div>
              </div>
            </div>

            {/* Rear Bumper styling */}
            <div className="mt-2 text-center text-[9px] font-black uppercase tracking-widest text-slate-400">
              Rear • Engine Compartment
            </div>
          </div>
        </div>

        {/* Right Column: Fare & Selection Summary Panel */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 lg:sticky lg:top-24 lg:col-span-5">
          <h2 className="mb-4 border-b border-slate-100 pb-3 text-base font-semibold text-slate-900">
            Seat Selection Summary
          </h2>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between items-center text-slate-600">
              <span>Selected Seats:</span>
              <span className="font-bold text-slate-900">
                {selectedSeatNumbers.length > 0 ? selectedSeatNumbers.join(', ') : 'None selected'}
              </span>
            </div>

            <div className="flex justify-between items-center text-slate-600">
              <span>Passenger Count:</span>
              <span className="font-bold text-slate-900">
                {selectedSeatNumbers.length} of {maxSeatsAllowed} allowed
              </span>
            </div>

            <div className="flex justify-between items-center text-slate-600">
              <span>Fare Per Seat:</span>
              <span className="font-bold text-slate-900">${trip.fareUsd.toFixed(2)} USD</span>
            </div>

            <div className="flex justify-between items-center text-slate-600">
              <span>Ticket Fares Subtotal:</span>
              <span className="font-bold text-slate-900">${seatFareSubtotal.toFixed(2)} USD</span>
            </div>

            {trip.isLevyApplicable && (
              <div className="flex justify-between items-center text-slate-600 pt-1 border-t border-slate-100">
                <div className="flex items-center gap-1">
                  <span>ZRP/Regulatory Bus Levy:</span>
                  <span className="text-[10px] text-slate-400">(${trip.busLevyUsd}/seat)</span>
                </div>
                <span className="font-bold text-slate-900">${levySubtotal.toFixed(2)} USD</span>
              </div>
            )}

            {/* Running Total */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 mt-4">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-700">Subtotal Payable:</span>
                <div className="text-right">
                  <div className="text-lg font-black text-blue-950">
                    {renderFormattedMoney(totalSubtotal)}
                  </div>
                  {displayCurrency === 'USD' && currency && (
                    <div className="text-[10px] text-slate-500">
                      ≈ {(totalSubtotal * currency.usdToZigRate).toFixed(2)} ZiG
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 space-y-2">
            <button
              type="button"
              disabled={selectedSeatNumbers.length === 0 || isLoadingHold}
              onClick={onContinue}
              className={`w-full py-3 rounded-xl font-black text-xs uppercase tracking-wide flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md ${
                selectedSeatNumbers.length > 0 && !isLoadingHold
                  ? 'bg-amber-500 hover:bg-amber-400 text-blue-950 shadow-amber-500/20 active:scale-98'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <span>{trip.snackShopEnabled ? 'Continue to Refreshments' : 'Continue to Checkout'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={onBack}
              className="w-full py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-bold transition-colors"
            >
              Choose Different Trip
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
