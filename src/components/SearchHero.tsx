import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeftRight, Calendar, Users, MapPin, Search, Navigation, CheckCircle } from 'lucide-react';
import { DestinationCity } from '../types/index.ts';

interface SearchHeroProps {
  cities: DestinationCity[];
  origin: string;
  destination: string;
  departureDate: string;
  passengerCount: number;
  onOriginChange: (val: string) => void;
  onDestinationChange: (val: string) => void;
  onDateChange: (val: string) => void;
  onPassengerCountChange: (count: number) => void;
  onSearch: () => void;
  isLoading: boolean;
}

export const SearchHero: React.FC<SearchHeroProps> = ({
  cities,
  origin,
  destination,
  departureDate,
  passengerCount,
  onOriginChange,
  onDestinationChange,
  onDateChange,
  onPassengerCountChange,
  onSearch,
  isLoading,
}) => {
  const [originInput, setOriginInput] = useState(origin);
  const [destInput, setDestInput] = useState(destination);
  const [showOriginDropdown, setShowOriginDropdown] = useState(false);
  const [showDestDropdown, setShowDestDropdown] = useState(false);
  const [geoLocating, setGeoLocating] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const originRef = useRef<HTMLDivElement>(null);
  const destRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setOriginInput(origin);
  }, [origin]);

  useEffect(() => {
    setDestInput(destination);
  }, [destination]);

  // Click outside listener
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (originRef.current && !originRef.current.contains(event.target as Node)) {
        setShowOriginDropdown(false);
      }
      if (destRef.current && !destRef.current.contains(event.target as Node)) {
        setShowDestDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter cities for autocomplete
  const filterList = (text: string) => {
    const q = text.toLowerCase().trim();
    if (!q) {
      // Return popular ones first
      return cities.filter((c) => c.isPopular).slice(0, 8);
    }
    return cities
      .filter((c) => {
        const nameMatch = c.name.toLowerCase().includes(q);
        const provMatch = c.province.toLowerCase().includes(q);
        const termMatch = c.terminals.some((t) => t.name.toLowerCase().includes(q));
        return nameMatch || provMatch || termMatch;
      })
      .slice(0, 8);
  };

  const handleSwap = () => {
    const temp = originInput;
    setOriginInput(destInput);
    setDestInput(temp);
    onOriginChange(destInput);
    onDestinationChange(temp);
    setErrorMessage('');
  };

  const handleQuickDate = (daysFromToday: number) => {
    const d = new Date();
    d.setDate(d.getDate() + daysFromToday);
    const dateStr = d.toISOString().split('T')[0];
    onDateChange(dateStr);
  };

  const handleGeoLocation = () => {
    if (!navigator.geolocation) {
      setErrorMessage('Geolocation not supported by your browser');
      return;
    }
    setGeoLocating(true);
    setErrorMessage('');

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGeoLocating(false);
        // Default Zimbabwe coordinate heuristics (Harare ~ -17.82, 31.05; Bulawayo ~ -20.15, 28.58)
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        // In Zimbabwe: closer to Bulawayo or Harare?
        const distToByo = Math.hypot(lat - (-20.15), lon - 28.58);
        const distToHarare = Math.hypot(lat - (-17.82), lon - 31.05);

        if (distToByo < distToHarare) {
          setOriginInput('Bulawayo');
          onOriginChange('Bulawayo');
        } else {
          setOriginInput('Harare');
          onOriginChange('Harare');
        }
      },
      () => {
        setGeoLocating(false);
        setErrorMessage('Location access denied. Please select your terminal manually.');
      },
      { timeout: 7000 }
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const normalizedOrigin = originInput.trim();
    const normalizedDestination = destInput.trim();
    if (!normalizedOrigin || !normalizedDestination) {
      setErrorMessage('Please enter both departure and destination towns');
      return;
    }
    if (normalizedOrigin.toLowerCase() === normalizedDestination.toLowerCase()) {
      setErrorMessage('Departure and destination cannot be the same city');
      return;
    }
    setErrorMessage('');
    setOriginInput(normalizedOrigin);
    setDestInput(normalizedDestination);
    onOriginChange(normalizedOrigin);
    onDestinationChange(normalizedDestination);
    onSearch();
  };

  const selectPopularRoute = (from: string, to: string) => {
    setOriginInput(from);
    onOriginChange(from);
    setDestInput(to);
    onDestinationChange(to);
    setErrorMessage('');
  };

  const originMatches = showOriginDropdown ? filterList(originInput) : [];
  const destinationMatches = showDestDropdown ? filterList(destInput) : [];

  return (
    <div id="booking-search" className="relative z-10 mx-auto -mt-8 w-full max-w-6xl px-4 pb-10">
        {/* Main Search Card */}
        <form
          onSubmit={handleSubmit}
          className="rounded-xl border border-slate-200 bg-white p-4 text-slate-800 shadow-lg sm:p-6"
        >
          {errorMessage && (
            <div role="alert" className="mb-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700">
              <span aria-hidden="true">⚠</span>
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="grid grid-cols-2 items-end gap-3 md:grid-cols-12">
            {/* Origin */}
            <div ref={originRef} className="relative md:col-span-4">
              <label htmlFor="origin-city" className="mb-1.5 block text-xs font-medium text-slate-700">
                From
              </label>
              <div className="relative flex items-center">
                <MapPin className="absolute left-3 w-4 h-4 text-slate-400" />
                <input
                  id="origin-city"
                  type="text"
                  value={originInput}
                  onChange={(e) => {
                    setOriginInput(e.target.value);
                    onOriginChange(e.target.value);
                    setShowOriginDropdown(true);
                  }}
                  onFocus={() => setShowOriginDropdown(true)}
                  onKeyDown={(event) => {
                    if (event.key === 'Escape') setShowOriginDropdown(false);
                  }}
                  aria-label="From city or terminal"
                  aria-expanded={showOriginDropdown}
                  aria-controls="origin-options"
                  placeholder="City or terminal"
                  className="w-full rounded-lg border border-slate-300 py-3 pl-9 pr-10 text-sm text-slate-900 transition-colors placeholder:font-normal placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                  autoComplete="off"
                />
                <button
                  type="button"
                  onClick={handleGeoLocation}
                  disabled={geoLocating}
                  title="Detect current location"
                  aria-label="Detect current location"
                  className="absolute right-2 rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-blue-700 focus-visible:outline-2 focus-visible:outline-blue-600"
                >
                  <Navigation className={`w-4 h-4 ${geoLocating ? 'animate-spin text-blue-600' : ''}`} />
                </button>
              </div>

              {/* Autocomplete dropdown */}
              {showOriginDropdown && (
                <div id="origin-options" className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-50 max-h-64 overflow-y-auto">
                  <div className="p-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                    Zimbabwe Destinations
                  </div>
                  {originMatches.map((city) => (
                    <button
                      key={city.id}
                      type="button"
                      onClick={() => {
                        setOriginInput(city.name);
                        onOriginChange(city.name);
                        setShowOriginDropdown(false);
                      }}
                      className="flex w-full cursor-pointer items-center justify-between border-b border-slate-50 p-2.5 text-left transition-colors hover:bg-blue-50"
                    >
                      <div>
                        <div className="text-xs font-bold text-slate-800">{city.name}</div>
                        <div className="text-[11px] text-slate-500">
                          {city.terminals[0]?.name || city.province}
                        </div>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                        {city.province}
                      </span>
                    </button>
                  ))}
                  {originMatches.length === 0 && (
                    <p className="p-3 text-sm text-slate-600">No destinations match your search.</p>
                  )}
                </div>
              )}
            </div>

            {/* Destination */}
            <div ref={destRef} className="relative md:col-span-4">
              <div className="mb-1.5 flex min-h-5 items-center justify-between gap-2">
                <label htmlFor="destination-city" className="text-xs font-medium text-slate-700">To</label>
                <button
                  type="button"
                  onClick={handleSwap}
                  aria-label="Swap origin and destination"
                  className="inline-flex min-h-8 items-center gap-1 rounded-md px-1.5 text-xs font-medium text-blue-700 transition-colors hover:bg-blue-50 focus-visible:outline-2 focus-visible:outline-blue-600"
                >
                  <ArrowLeftRight className="h-3.5 w-3.5" aria-hidden="true" />
                  Swap
                </button>
              </div>
              <div className="relative flex items-center">
                <MapPin className="absolute left-3 w-4 h-4 text-amber-500" />
                <input
                  id="destination-city"
                  type="text"
                  value={destInput}
                  onChange={(e) => {
                    setDestInput(e.target.value);
                    onDestinationChange(e.target.value);
                    setShowDestDropdown(true);
                  }}
                  onFocus={() => setShowDestDropdown(true)}
                  onKeyDown={(event) => {
                    if (event.key === 'Escape') setShowDestDropdown(false);
                  }}
                  aria-label="To city or terminal"
                  aria-expanded={showDestDropdown}
                  aria-controls="destination-options"
                  placeholder="City or terminal"
                  className="w-full rounded-lg border border-slate-300 py-3 pl-9 pr-3 text-sm text-slate-900 transition-colors placeholder:font-normal placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                  autoComplete="off"
                />
              </div>

              {showDestDropdown && (
                <div id="destination-options" className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-50 max-h-64 overflow-y-auto">
                  <div className="p-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                    Zimbabwe Destinations
                  </div>
                  {destinationMatches.map((city) => (
                    <button
                      key={city.id}
                      type="button"
                      onClick={() => {
                        setDestInput(city.name);
                        onDestinationChange(city.name);
                        setShowDestDropdown(false);
                      }}
                      className="flex w-full cursor-pointer items-center justify-between border-b border-slate-50 p-2.5 text-left transition-colors hover:bg-blue-50"
                    >
                      <div>
                        <div className="text-xs font-bold text-slate-800">{city.name}</div>
                        <div className="text-[11px] text-slate-500">
                          {city.terminals[0]?.name || city.province}
                        </div>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                        {city.province}
                      </span>
                    </button>
                  ))}
                  {destinationMatches.length === 0 && (
                    <p className="p-3 text-sm text-slate-600">No destinations match your search.</p>
                  )}
                </div>
              )}
            </div>

            {/* Travel Date */}
            <div className="col-span-2 md:col-span-4">
              <div className="flex justify-between items-center mb-1">
                <label htmlFor="departure-date" className="text-xs font-medium text-slate-700">
                  Date
                </label>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => handleQuickDate(0)}
                    className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 hover:bg-blue-100 text-slate-700 hover:text-blue-700"
                  >
                    Today
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickDate(1)}
                    className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 hover:bg-blue-100 text-slate-700 hover:text-blue-700"
                  >
                    Tomorrow
                  </button>
                </div>
              </div>

              <div className="relative flex items-center">
                <Calendar className="absolute left-3 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  id="departure-date"
                  type="date"
                  value={departureDate}
                  onChange={(e) => onDateChange(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full rounded-lg border border-slate-300 py-3 pl-9 pr-3 text-sm text-slate-900 transition-colors focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                />
              </div>
            </div>
          </div>

          {/* Bottom row: Passengers & Submit */}
          <div className="mt-5 flex flex-col items-center justify-between gap-4 border-t border-slate-100 pt-4 sm:flex-row">
            <div className="flex w-full items-center gap-2 sm:w-auto max-[360px]:gap-1.5">
              <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                <Users className="w-4 h-4 text-slate-400 max-[360px]:hidden" />
                <span>Passengers:</span>
              </div>
              <div className="flex items-center bg-slate-100 rounded-lg p-1 border border-slate-200">
                {[1, 2, 3, 4, 5, 6].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => onPassengerCountChange(num)}
                    aria-pressed={passengerCount === num}
                    className={`h-7 w-7 rounded-md text-xs font-bold transition-all max-[360px]:w-6 ${
                      passengerCount === num
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="flex min-h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-amber-500 px-8 py-3 text-sm font-semibold text-blue-950 transition-colors hover:bg-amber-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-950 sm:w-auto"
            >
              <Search className="w-4 h-4 stroke-[3]" />
              <span>{isLoading ? 'Searching...' : 'Search Buses'}</span>
            </button>
          </div>
        </form>
        {/* Popular Route Shortcuts */}
        <div className="mt-3 flex flex-wrap items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs">
          <span className="font-medium text-slate-600">Popular routes:</span>
          <button
            type="button"
            onClick={() => selectPopularRoute('Harare', 'Bulawayo')}
            className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-slate-700 transition-colors hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
          >
            Harare → Bulawayo
          </button>
          <button
            type="button"
            onClick={() => selectPopularRoute('Harare', 'Mutare')}
            className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-slate-700 transition-colors hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
          >
            Harare → Mutare
          </button>
          <button
            type="button"
            onClick={() => selectPopularRoute('Bulawayo', 'Victoria Falls')}
            className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-slate-700 transition-colors hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
          >
            Bulawayo → Vic Falls
          </button>
          <button
            type="button"
            onClick={() => selectPopularRoute('Harare', 'Beitbridge')}
            className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-slate-700 transition-colors hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
          >
            Harare → Beitbridge
          </button>
        </div>
    </div>
  );
};
