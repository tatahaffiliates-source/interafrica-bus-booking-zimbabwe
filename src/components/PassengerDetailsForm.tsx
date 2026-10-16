import React, { useState } from 'react';
import { User, Phone, Mail, MapPin, ArrowRight, ArrowLeft, ShieldCheck } from 'lucide-react';
import { ScheduledTrip, BusRoute, PassengerInfo } from '../types/index.ts';

interface PassengerDetailsFormProps {
  trip: ScheduledTrip;
  route: BusRoute;
  selectedSeats: string[];
  passengers: PassengerInfo[];
  boardingPoint: string;
  droppingPoint: string;
  contactPhone: string;
  contactEmail: string;
  onUpdatePassenger: (index: number, field: keyof PassengerInfo, value: any) => void;
  onBoardingPointChange: (val: string) => void;
  onDroppingPointChange: (val: string) => void;
  onPhoneChange: (val: string) => void;
  onEmailChange: (val: string) => void;
  onContinue: () => void;
  onBack: () => void;
}

export const PassengerDetailsForm: React.FC<PassengerDetailsFormProps> = ({
  trip,
  route,
  selectedSeats,
  passengers,
  boardingPoint,
  droppingPoint,
  contactPhone,
  contactEmail,
  onUpdatePassenger,
  onBoardingPointChange,
  onDroppingPointChange,
  onPhoneChange,
  onEmailChange,
  onContinue,
  onBack,
}) => {
  const [errorMsg, setErrorMsg] = useState('');

  const handleValidate = (e: React.FormEvent) => {
    e.preventDefault();
    // Validate all passengers have names
    for (let i = 0; i < passengers.length; i++) {
      if (!passengers[i].fullName.trim()) {
        setErrorMsg(`Please enter the full passenger name for Seat ${passengers[i].seatNumber}`);
        return;
      }
      if (!passengers[i].age || passengers[i].age < 1 || passengers[i].age > 120) {
        setErrorMsg(`Please enter a valid age for passenger in Seat ${passengers[i].seatNumber}`);
        return;
      }
    }

    if (!boardingPoint) {
      setErrorMsg('Please select a boarding terminal');
      return;
    }
    if (!droppingPoint) {
      setErrorMsg('Please select a dropping terminal');
      return;
    }
    if (!contactPhone.trim() || contactPhone.trim().length < 8) {
      setErrorMsg('Please enter a valid contact phone number (used for WhatsApp ticket delivery)');
      return;
    }

    setErrorMsg('');
    onContinue();
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
            ← Back to snacks
          </button>
          <h2 className="text-xl font-black text-slate-900">Passenger & Contact Details</h2>
          <p className="text-xs text-slate-500">
            Guest checkout enabled — no mandatory registration needed to book your ticket.
          </p>
        </div>
      </div>

      {errorMsg && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-semibold">
          ⚠️ {errorMsg}
        </div>
      )}

      <form onSubmit={handleValidate} className="space-y-6">
        {/* Boarding and Dropping Points */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-blue-600" />
            <span>Select Pickup & Drop-off Terminals</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                Boarding Terminal ({route.originCityName}) *
              </label>
              <select
                value={boardingPoint}
                onChange={(e) => onBoardingPointChange(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-blue-600"
                required
              >
                {trip.boardingPoints.map((bp) => (
                  <option key={bp.id} value={bp.name}>
                    {bp.name} ({bp.time})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                Dropping Terminal ({route.destinationCityName}) *
              </label>
              <select
                value={droppingPoint}
                onChange={(e) => onDroppingPointChange(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-blue-600"
                required
              >
                {trip.droppingPoints.map((dp) => (
                  <option key={dp.id} value={dp.name}>
                    {dp.name} ({dp.time})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Passenger Forms per Seat */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
            <User className="w-4 h-4 text-blue-600" />
            <span>Passenger Details ({passengers.length} Passenger{passengers.length > 1 ? 's' : ''})</span>
          </h3>

          <div className="space-y-4">
            {passengers.map((passenger, idx) => (
              <div
                key={passenger.seatNumber}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-900 bg-blue-100 px-2 py-0.5 rounded">
                    Passenger {idx + 1} (Seat {passenger.seatNumber})
                  </span>
                  <span className="text-[11px] text-slate-500">Coach Seat</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                  <div className="sm:col-span-6">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                      Full Name (as on National ID / Passport) *
                    </label>
                    <input
                      type="text"
                      value={passenger.fullName}
                      onChange={(e) => onUpdatePassenger(idx, 'fullName', e.target.value)}
                      placeholder="e.g. Tendai Moyo"
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-semibold text-slate-900 bg-white"
                      required
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                      Age *
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="120"
                      value={passenger.age || ''}
                      onChange={(e) => onUpdatePassenger(idx, 'age', parseInt(e.target.value, 10) || 0)}
                      placeholder="Age"
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-semibold text-slate-900 bg-white"
                      required
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                      Gender *
                    </label>
                    <select
                      value={passenger.gender}
                      onChange={(e) => onUpdatePassenger(idx, 'gender', e.target.value as any)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-semibold text-slate-900 bg-white"
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Info (for Ticket Delivery) */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
            <Phone className="w-4 h-4 text-emerald-600" />
            <span>Ticket Delivery & Communication Contact</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                WhatsApp & SMS Mobile Number *
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3 text-xs font-bold text-slate-400">ZW</span>
                <input
                  type="tel"
                  value={contactPhone}
                  onChange={(e) => onPhoneChange(e.target.value)}
                  placeholder="+263 77 123 4567"
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-blue-600"
                  required
                />
              </div>
              <p className="text-[10px] text-slate-500 mt-1">
                Your scannable ticket & WhatsApp referral links are delivered to this number.
              </p>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                Email Address (Optional)
              </label>
              <div className="relative flex items-center">
                <Mail className="absolute left-3 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => onEmailChange(e.target.value)}
                  placeholder="passenger@example.com"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <p className="text-[10px] text-slate-500 mt-1">
                Optional e-ticket PDF will also be sent to this email.
              </p>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-between gap-4 pt-2">
          <button
            type="button"
            onClick={onBack}
            className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-100 transition-colors"
          >
            ← Back
          </button>

          <button
            type="submit"
            className="px-8 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-blue-950 font-black text-xs uppercase tracking-wide flex items-center gap-2 shadow-lg shadow-amber-500/20 active:scale-98 transition-all cursor-pointer"
          >
            <span>Review Order & Payment</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};
