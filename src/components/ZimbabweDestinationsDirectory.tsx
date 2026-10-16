import React, { useState } from 'react';
import { MapPin, Search, Bus, Info } from 'lucide-react';
import { DestinationCity, BusRoute } from '../types/index.ts';

interface ZimbabweDestinationsDirectoryProps {
  cities: DestinationCity[];
  routes: BusRoute[];
  onSelectCity: (cityName: string) => void;
}

export const ZimbabweDestinationsDirectory: React.FC<ZimbabweDestinationsDirectoryProps> = ({
  cities,
  routes,
  onSelectCity,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProvince, setSelectedProvince] = useState<string>('all');

  const provinces = Array.from(new Set(cities.map((c) => c.province))).sort();

  const filteredCities = cities.filter((city) => {
    if (selectedProvince !== 'all' && city.province !== selectedProvince) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      city.name.toLowerCase().includes(q) ||
      city.province.toLowerCase().includes(q) ||
      city.terminals.some((t) => t.name.toLowerCase().includes(q) || t.address.toLowerCase().includes(q))
    );
  });

  const isCityServedDirectly = (cityId: string) => {
    return routes.some(
      (r) => r.isActive && (r.originCityId === cityId || r.destinationCityId === cityId)
    );
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:py-10">
      {/* Title */}
      <div className="mb-6 max-w-2xl">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Zimbabwe destinations
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          Browse {cities.length} listed destinations and their terminals across Zimbabwe.
        </p>
      </div>

      {/* Directory vs Route Distinction Notice (Mandated by Section 1) */}
      <div className="mb-5 flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm leading-relaxed text-blue-900">
        <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <strong className="mb-0.5 block font-semibold">Route availability</strong>
          <span>
            This directory lists all verified terminals and towns in Zimbabwe. A town being in the directory does not imply direct InterAfrica scheduled service to all pairs. Departures are bookable only when their exact route schedule and fare are verified in the system.
          </span>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="mb-6 flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
          <label htmlFor="destination-search" className="sr-only">Search destinations</label>
          <input
            id="destination-search"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search city, town, terminal or province..."
            className="w-full rounded-lg border border-slate-300 py-3 pl-9 pr-3 text-sm text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
          />
        </div>

        <label htmlFor="destination-province" className="sr-only">Filter by province</label>
        <select
          id="destination-province"
          value={selectedProvince}
          onChange={(e) => setSelectedProvince(e.target.value)}
          className="rounded-lg border border-slate-300 bg-white px-3 py-3 text-sm text-slate-700 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20 sm:min-w-52"
        >
          <option value="all">All Provinces ({cities.length} towns)</option>
          {provinces.map((prov) => (
            <option key={prov} value={prov}>
              {prov}
            </option>
          ))}
        </select>
      </div>

      {/* Cities Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredCities.map((city) => {
          const hasDirectService = isCityServedDirectly(city.id);

          return (
            <div
              key={city.id}
              className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-4 transition-colors hover:border-blue-300"
            >
              <div>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-base font-black text-slate-900 flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-blue-600" />
                      <span>{city.name}</span>
                    </h3>
                    <span className="text-[11px] text-slate-500 font-medium">
                      {city.province}
                    </span>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                      hasDirectService
                        ? 'bg-emerald-50 text-emerald-800'
                          : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {hasDirectService ? 'Active route' : 'Listed destination'}
                  </span>
                </div>

                {/* Terminals */}
                <div className="mt-3 space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Terminals & Boarding Points:
                  </span>
                  {city.terminals.map((t) => (
                    <div
                      key={t.id}
                      className="text-xs p-2 rounded-lg bg-slate-50 border border-slate-100 text-slate-700"
                    >
                      <div className="font-semibold text-slate-900">{t.name}</div>
                      <div className="text-[10px] text-slate-500">{t.address}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
                <button
                  type="button"
                  onClick={() => onSelectCity(city.name)}
                  className="inline-flex min-h-10 items-center gap-1 rounded-lg bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700 transition-colors hover:bg-blue-600 hover:text-white focus-visible:outline-2 focus-visible:outline-blue-700"
                >
                  <Bus className="w-3.5 h-3.5" />
                  <span>Search from {city.name}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
      {filteredCities.length === 0 && (
        <div className="rounded-xl border border-slate-200 bg-white px-4 py-12 text-center" role="status">
          <h2 className="text-base font-semibold text-slate-900">No destinations found</h2>
          <p className="mt-1 text-sm text-slate-600">Try a different search or province filter.</p>
        </div>
      )}
    </div>
  );
};
