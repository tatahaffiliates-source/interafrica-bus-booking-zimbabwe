import React, { useState } from 'react';
import {
  Clock,
  MapPin,
  Wifi,
  Zap,
  Wind,
  Shield,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Sparkles,
  Info,
} from 'lucide-react';
import { ScheduledTrip, BusRoute, CurrencyConfig } from '../types/index.ts';
import { BusPreview } from './BusPreview.tsx';

interface SearchResultsProps {
  hasService: boolean;
  message?: string;
  route?: BusRoute;
  trips: ScheduledTrip[];
  currency: CurrencyConfig | null;
  displayCurrency: 'USD' | 'ZiG';
  departureDate: string;
  onDateChange: (date: string) => void;
  onSelectTrip: (trip: ScheduledTrip) => void;
  suggestedRoutes?: { from: string; to: string; sampleFare: number }[];
  onSelectSuggestedRoute: (from: string, to: string) => void;
}

export const SearchResults: React.FC<SearchResultsProps> = ({
  hasService,
  message,
  route,
  trips,
  currency,
  displayCurrency,
  departureDate,
  onDateChange,
  onSelectTrip,
  suggestedRoutes,
  onSelectSuggestedRoute,
}) => {
  const [expandedTripId, setExpandedTripId] = useState<string | null>(null);
  const [filterBusType, setFilterBusType] = useState<string>('all');
  const [filterTimeBand, setFilterTimeBand] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'cheapest' | 'earliest' | 'fastest'>('earliest');

  // Change date by offset (-1 or +1)
  const shiftDate = (deltaDays: number) => {
    const cur = new Date(departureDate);
    cur.setDate(cur.getDate() + deltaDays);
    const todayStr = new Date().toISOString().split('T')[0];
    const newDateStr = cur.toISOString().split('T')[0];
    if (newDateStr >= todayStr) {
      onDateChange(newDateStr);
    }
  };

  // Format currency display
  const renderPrice = (usdFare: number) => {
    if (displayCurrency === 'ZiG' && currency) {
      const zig = (usdFare * currency.usdToZigRate).toFixed(2);
      return (
        <div>
          <span className="text-xl font-black text-amber-600">{zig} ZiG</span>
          <span className="block text-[10px] text-slate-500 font-normal">
            (${usdFare.toFixed(2)} USD)
          </span>
        </div>
      );
    }
    return (
      <div>
        <span className="text-xl font-black text-blue-950">${usdFare.toFixed(2)}</span>
        <span className="text-xs text-slate-500 font-normal"> USD</span>
        {currency && (
          <span className="block text-[10px] text-slate-500 font-normal">
            ~{(usdFare * currency.usdToZigRate).toFixed(2)} ZiG
          </span>
        )}
      </div>
    );
  };

  // If no scheduled service exists for this route:
  if (!hasService) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-center text-amber-900 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-amber-100 mx-auto flex items-center justify-center text-amber-600 mb-3">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold">No Scheduled Service Currently Available</h3>
          <p className="text-sm text-amber-800 mt-1 max-w-md mx-auto">
            {message || 'InterAfrica does not operate direct scheduled departures on this specific route.'}
          </p>
          <div className="mt-2 text-xs font-semibold uppercase tracking-wider text-amber-700">
            Accuracy Policy: Verified Schedules Only
          </div>

          {suggestedRoutes && suggestedRoutes.length > 0 && (
            <div className="mt-6 pt-6 border-t border-amber-200/80">
              <h4 className="text-xs font-bold text-amber-950 uppercase tracking-wider mb-3">
                Suggested Alternative Active Routes:
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl mx-auto text-left">
                {suggestedRoutes.map((sr, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => onSelectSuggestedRoute(sr.from, sr.to)}
                    className="p-3 bg-white rounded-xl border border-amber-200 hover:border-blue-500 hover:shadow-md transition-all flex justify-between items-center group cursor-pointer"
                  >
                    <div>
                      <div className="text-xs font-bold text-slate-800 group-hover:text-blue-600">
                        {sr.from} → {sr.to}
                      </div>
                      <div className="text-[11px] text-slate-500">Regular Daily Departures</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-black text-blue-900">${sr.sampleFare.toFixed(2)}</div>
                      <span className="text-[10px] text-blue-600 font-semibold group-hover:underline">
                        View Buses →
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Filter & sort trips
  const filteredTrips = trips
    .filter((trip) => {
      if (filterBusType !== 'all' && trip.busType !== filterBusType) return false;
      if (filterTimeBand !== 'all') {
        const hour = parseInt(trip.departureTime.split(':')[0], 10);
        if (filterTimeBand === 'morning' && (hour < 6 || hour >= 12)) return false;
        if (filterTimeBand === 'afternoon' && (hour < 12 || hour >= 18)) return false;
        if (filterTimeBand === 'evening' && hour < 18) return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'cheapest') return a.fareUsd - b.fareUsd;
      if (sortBy === 'earliest') return a.departureTime.localeCompare(b.departureTime);
      if (sortBy === 'fastest') return a.duration.localeCompare(b.duration);
      return 0;
    });

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Date Bar & Results Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-xs mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900">
              {route?.originCityName} to {route?.destinationCityName}
            </h2>
            <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-xs font-bold">
              {trips.length} Departures
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Distance: {route?.distanceKm} km • Avg. Duration: {route?.estimatedDuration}
          </p>
        </div>

        {/* Previous/Next Day Navigator */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => shiftDate(-1)}
            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors"
            title="Previous Day"
            aria-label="Previous day"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="text-xs font-bold px-3 py-1.5 bg-slate-100 rounded-lg text-slate-800">
            {new Date(departureDate).toLocaleDateString('en-ZW', {
              weekday: 'short',
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })}
          </div>
          <button
            type="button"
            onClick={() => shiftDate(1)}
            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors"
            title="Next Day"
            aria-label="Next day"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filter and Sort Controls */}
      <div className="mb-6 flex flex-col items-start justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3 text-sm sm:flex-row sm:items-center">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-medium text-slate-600">
            Filters:
          </span>
          {/* Time Band */}
          <select
            value={filterTimeBand}
            onChange={(e) => setFilterTimeBand(e.target.value)}
            aria-label="Filter by departure time"
            className="min-h-10 max-w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
          >
            <option value="all">All Times</option>
            <option value="morning">Morning (06:00 - 12:00)</option>
            <option value="afternoon">Afternoon (12:00 - 18:00)</option>
            <option value="evening">Evening (18:00+)</option>
          </select>

          {/* Bus Type */}
          <select
            value={filterBusType}
            onChange={(e) => setFilterBusType(e.target.value)}
            aria-label="Filter by coach type"
            className="min-h-10 max-w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
          >
            <option value="all">All Coach Types</option>
            <option value="Luxury Coach">Luxury Coach</option>
            <option value="Semi-Luxury Express">Semi-Luxury Express</option>
            <option value="Standard Intercity">Standard Intercity</option>
          </select>
        </div>

        {/* Sorting */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-medium text-slate-600">
            Sort by:
          </span>
          <button
            type="button"
            onClick={() => setSortBy('earliest')}
            aria-pressed={sortBy === 'earliest'}
            className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
              sortBy === 'earliest'
                ? 'bg-blue-600 text-white'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            Earliest
          </button>
          <button
            type="button"
            onClick={() => setSortBy('cheapest')}
            aria-pressed={sortBy === 'cheapest'}
            className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
              sortBy === 'cheapest'
                ? 'bg-blue-600 text-white'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            Cheapest
          </button>
          <button
            type="button"
            onClick={() => setSortBy('fastest')}
            aria-pressed={sortBy === 'fastest'}
            className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
              sortBy === 'fastest'
                ? 'bg-blue-600 text-white'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            Fastest
          </button>
        </div>
      </div>

      {/* Trips List */}
      <div className="space-y-3">
        {filteredTrips.map((trip) => {
          const isExpanded = expandedTripId === trip.id;
          return (
            <div
              key={trip.id}
              className="overflow-hidden rounded-xl border border-slate-200 bg-white transition-colors hover:border-blue-300"
            >
              {/* Main Card Header */}
              <div className="p-4 sm:p-5">
                <BusPreview
                  busName={trip.busName}
                  busType={trip.busType}
                  busNumber={trip.busNumber}
                  className="mb-4 max-w-xl"
                />
                <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-4">
                  {/* Left: Operator & Times */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <span className="text-base font-semibold text-slate-900">
                        {trip.busName}
                      </span>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                        {trip.busType}
                      </span>
                    </div>

                    {/* Timeline row */}
                    <div className="grid grid-cols-3 items-center gap-2 max-w-md">
                      <div>
                        <div className="text-lg font-black text-slate-900">{trip.departureTime}</div>
                        <div className="text-[11px] font-semibold text-slate-600 truncate">
                          {trip.boardingPoints[0]?.name || route?.originCityName}
                        </div>
                      </div>

                      <div className="text-center">
                        <div className="text-[11px] text-slate-400 font-medium">{trip.duration}</div>
                        <div className="relative flex items-center justify-center my-1">
                          <div className="w-full h-0.5 bg-slate-200"></div>
                          <div className="absolute w-2 h-2 rounded-full bg-blue-600"></div>
                        </div>
                        <div className="text-[10px] text-emerald-600 font-semibold">Direct Route</div>
                      </div>

                      <div className="text-right">
                        <div className="text-lg font-black text-slate-900">{trip.arrivalTime}</div>
                        <div className="text-[11px] font-semibold text-slate-600 truncate">
                          {trip.droppingPoints[0]?.name || route?.destinationCityName}
                        </div>
                      </div>
                    </div>

                    {/* Amenities Icons */}
                    <div className="flex items-center gap-3 mt-3 text-slate-500 text-xs">
                      {trip.amenities.airConditioning && (
                        <span className="flex items-center gap-1 text-[11px]" title="Air Conditioned Coach">
                          <Wind className="w-3.5 h-3.5 text-blue-500" /> A/C
                        </span>
                      )}
                      {trip.amenities.usbCharging && (
                        <span className="flex items-center gap-1 text-[11px]" title="USB Charging at Seat">
                          <Zap className="w-3.5 h-3.5 text-amber-500" /> USB
                        </span>
                      )}
                      {trip.amenities.wifi && (
                        <span className="flex items-center gap-1 text-[11px]" title="Free Onboard Wi-Fi">
                          <Wifi className="w-3.5 h-3.5 text-emerald-500" /> Wi-Fi
                        </span>
                      )}
                      {trip.snackShopEnabled && (
                        <span className="flex items-center gap-1 text-[11px] text-purple-600 font-medium">
                          <Sparkles className="w-3 h-3 text-purple-500" /> Onboard Snacks
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Right: Availability, Fare & Action */}
                  <div className="flex sm:flex-row lg:flex-col items-start sm:items-center lg:items-end justify-between border-t lg:border-t-0 pt-3 lg:pt-0 border-slate-100 gap-3">
                    <div className="lg:text-right">
                      {renderPrice(trip.fareUsd)}
                      <div className="mt-1">
                        <span className="inline-block px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {trip.availableSeatsCount} seats available
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setExpandedTripId(isExpanded ? null : trip.id)}
                        className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-semibold flex items-center gap-1 transition-colors"
                        title="View Trip Details & Timeline"
                      >
                        <span>Details</span>
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>

                      <button
                        type="button"
                        onClick={() => onSelectTrip(trip)}
                        className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wide transition-all shadow-md shadow-blue-500/20 active:scale-98 cursor-pointer"
                      >
                        Select Seats
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Accordion: Bus Details, Route Timeline, Boarding & Dropping, Policies */}
              {isExpanded && (
                <div className="bg-slate-50 p-4 border-t border-slate-200 text-xs text-slate-700 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Boarding Points */}
                    <div className="bg-white p-3 rounded-xl border border-slate-200">
                      <div className="font-bold text-slate-900 mb-2 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-blue-600" />
                        Boarding Terminals
                      </div>
                      <div className="space-y-1.5">
                        {trip.boardingPoints.map((bp) => (
                          <div key={bp.id} className="flex justify-between items-center text-[11px]">
                            <span className="text-slate-800 font-medium">{bp.name}</span>
                            <span className="font-bold text-blue-700">{bp.time}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Dropping Points */}
                    <div className="bg-white p-3 rounded-xl border border-slate-200">
                      <div className="font-bold text-slate-900 mb-2 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-amber-600" />
                        Dropping Terminals
                      </div>
                      <div className="space-y-1.5">
                        {trip.droppingPoints.map((dp) => (
                          <div key={dp.id} className="flex justify-between items-center text-[11px]">
                            <span className="text-slate-800 font-medium">{dp.name}</span>
                            <span className="font-bold text-amber-700">{dp.time}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Intermediate Stops */}
                  {route?.intermediateStops && route.intermediateStops.length > 0 && (
                    <div className="bg-white p-3 rounded-xl border border-slate-200">
                      <span className="font-bold text-slate-900">En-route stops: </span>
                      <span className="text-slate-600">{route.intermediateStops.join(' • ')}</span>
                    </div>
                  )}

                  {/* Policies: Cancellation & Luggage */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white p-3 rounded-xl border border-slate-200">
                      <div className="font-bold text-slate-900 mb-1 flex items-center gap-1">
                        <Shield className="w-3.5 h-3.5 text-emerald-600" />
                        Cancellation & Refund Policy
                      </div>
                      <p className="text-[11px] text-slate-600">
                        Free cancellation up to {trip.cancellationPolicy.freeCancellationHours} hours before departure (15% administration fee applies). After 24h, 30% retention fee applies.
                      </p>
                    </div>

                    <div className="bg-white p-3 rounded-xl border border-slate-200">
                      <div className="font-bold text-slate-900 mb-1 flex items-center gap-1">
                        <Info className="w-3.5 h-3.5 text-blue-600" />
                        Luggage Allowance
                      </div>
                      <p className="text-[11px] text-slate-600">{trip.luggagePolicy}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {filteredTrips.length === 0 && (
          <div role="status" className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-600">
            <h3 className="font-semibold text-slate-900">
              {trips.length === 0 ? 'No departures are available for this search.' : 'No journeys match these filters.'}
            </h3>
            <p className="mt-1 text-sm">
              {trips.length === 0 ? 'Try another journey or date.' : 'Adjust the time or coach type filters to see available departures.'}
            </p>
            <button
              onClick={() => {
                setFilterBusType('all');
                setFilterTimeBand('all');
              }}
              className="mt-2 text-xs text-blue-600 font-bold hover:underline"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
