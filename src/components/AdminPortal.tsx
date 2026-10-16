import React, { useState, useEffect } from 'react';
import {
  Settings,
  DollarSign,
  TrendingUp,
  Package,
  MapPin,
  Clock,
  Users,
  CheckCircle,
  AlertCircle,
  FileSpreadsheet,
  RefreshCw,
  Plus,
  Save,
} from 'lucide-react';
import { BusRoute, SnackProduct, CurrencyConfig } from '../types/index.ts';
import { updateCurrency, fetchAdminReports } from '../services/api.ts';

interface AdminPortalProps {
  routes: BusRoute[];
  snacks: SnackProduct[];
  currency: CurrencyConfig | null;
  onRefreshData: () => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({
  routes,
  snacks,
  currency,
  onRefreshData,
}) => {
  const [activeTab, setActiveTab] = useState<'reports' | 'routes' | 'snacks' | 'currency'>('reports');
  const [reportsData, setReportsData] = useState<any>(null);
  const [isLoadingReports, setIsLoadingReports] = useState(false);

  // Currency form state
  const [newRate, setNewRate] = useState(currency?.usdToZigRate ? String(currency.usdToZigRate) : '27.50');
  const [rateSource, setRateSource] = useState(currency?.source || 'Reserve Bank of Zimbabwe Official Interbank Rate');
  const [currencySuccess, setCurrencySuccess] = useState('');

  // Route edit state
  const [selectedRoute, setSelectedRoute] = useState<BusRoute | null>(null);
  const [routeFareInput, setRouteFareInput] = useState('');
  const [routeLevyInput, setRouteLevyInput] = useState('');
  const [routeLevyActive, setRouteLevyActive] = useState(true);
  const [routeUpdateMsg, setRouteUpdateMsg] = useState('');

  // Snack edit state
  const [selectedSnack, setSelectedSnack] = useState<SnackProduct | null>(null);
  const [snackPriceInput, setSnackPriceInput] = useState('');
  const [snackStockInput, setSnackStockInput] = useState('');
  const [snackUpdateMsg, setSnackUpdateMsg] = useState('');

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    setIsLoadingReports(true);
    try {
      const data = await fetchAdminReports();
      setReportsData(data);
    } catch {
      // ignore
    } finally {
      setIsLoadingReports(false);
    }
  };

  const handleSaveCurrency = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateCurrency(parseFloat(newRate), rateSource);
      setCurrencySuccess('Exchange rate and source updated successfully');
      onRefreshData();
      setTimeout(() => setCurrencySuccess(''), 3000);
    } catch {
      setCurrencySuccess('Failed to update rate');
    }
  };

  const handleSelectRouteForEdit = (route: BusRoute) => {
    setSelectedRoute(route);
    setRouteFareInput(String(route.baseFareUsd));
    setRouteLevyInput(String(route.busLevyUsd));
    setRouteLevyActive(route.isLevyApplicable);
    setRouteUpdateMsg('');
  };

  const handleSaveRoute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoute) return;
    try {
      const res = await fetch(`/api/admin/routes/${selectedRoute.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          baseFareUsd: parseFloat(routeFareInput),
          busLevyUsd: parseFloat(routeLevyInput),
          isLevyApplicable: routeLevyActive,
        }),
      });
      if (res.ok) {
        setRouteUpdateMsg('Route pricing updated successfully!');
        onRefreshData();
        setSelectedRoute(null);
      }
    } catch {
      setRouteUpdateMsg('Failed to update route');
    }
  };

  const handleSelectSnackForEdit = (prod: SnackProduct) => {
    setSelectedSnack(prod);
    setSnackPriceInput(String(prod.priceUsd));
    setSnackStockInput(String(prod.stockQuantity));
    setSnackUpdateMsg('');
  };

  const handleSaveSnack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSnack) return;
    try {
      const res = await fetch(`/api/admin/snacks/${selectedSnack.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceUsd: parseFloat(snackPriceInput),
          stockQuantity: parseInt(snackStockInput, 10),
        }),
      });
      if (res.ok) {
        setSnackUpdateMsg('Snack stock & pricing updated successfully!');
        onRefreshData();
        setSelectedSnack(null);
      }
    } catch {
      setSnackUpdateMsg('Failed to update snack');
    }
  };

  // Export passenger manifest to CSV
  const handleExportManifest = () => {
    if (!reportsData?.recentBookings) return;
    const rows = [
      ['PNR', 'Origin', 'Destination', 'Date', 'Time', 'Seats', 'Passenger Names', 'Total USD', 'Status'],
      ...reportsData.recentBookings.map((b: any) => [
        b.pnr,
        b.originCityName,
        b.destinationCityName,
        b.departureDate,
        b.departureTime,
        b.selectedSeats.join(';'),
        b.passengers.map((p: any) => p.fullName).join(';'),
        b.pricing.totalPayableUsd,
        b.status,
      ]),
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `InterAfrica_Manifest_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Admin Title */}
      <div className="bg-slate-900 rounded-3xl p-6 text-white mb-6 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Settings className="w-6 h-6 text-amber-400" />
            <h2 className="text-xl font-black">InterAfrica Operations & Revenue Portal</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time control of verified routes, statutory bus levies, ZiG exchange rate, refreshments inventory & revenue analytics.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportManifest}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-bold flex items-center gap-1.5 transition-colors border border-slate-700"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Export Manifest CSV</span>
          </button>

          <button
            type="button"
            onClick={loadReports}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${isLoadingReports ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Admin Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3 mb-6">
        <button
          type="button"
          onClick={() => setActiveTab('reports')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'reports'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
          }`}
        >
          Revenue & Occupancy Reports
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('routes')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'routes'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
          }`}
        >
          Routes, Fares & Bus Levies
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('snacks')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'snacks'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
          }`}
        >
          Snack & Drink Inventory
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('currency')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'currency'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
          }`}
        >
          ZiG Official Rate & Source
        </button>
      </div>

      {/* TAB 1: REPORTS */}
      {activeTab === 'reports' && reportsData && (
        <div className="space-y-6">
          {/* Key Metric Tiles */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Total Revenue
              </span>
              <div className="text-xl font-black text-blue-950 mt-1">
                ${reportsData.metrics.totalRevenueUsd.toFixed(2)} USD
              </div>
              <div className="text-[10px] text-slate-500 mt-1">
                Tickets + Levies + Refreshments
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Ticket Fares Revenue
              </span>
              <div className="text-xl font-black text-emerald-700 mt-1">
                ${reportsData.metrics.ticketRevenueUsd.toFixed(2)} USD
              </div>
              <div className="text-[10px] text-slate-500 mt-1">
                {reportsData.metrics.totalSeatsSold} seats booked
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Statutory Bus Levies
              </span>
              <div className="text-xl font-black text-amber-700 mt-1">
                ${reportsData.metrics.busLevyRevenueUsd.toFixed(2)} USD
              </div>
              <div className="text-[10px] text-slate-500 mt-1">Reported separately</div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Snack & Drinks Revenue
              </span>
              <div className="text-xl font-black text-purple-700 mt-1">
                ${reportsData.metrics.snackRevenueUsd.toFixed(2)} USD
              </div>
              <div className="text-[10px] text-slate-500 mt-1">Onboard refreshments</div>
            </div>
          </div>

          {/* Recent Bookings Audit Table */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-sm font-black text-slate-900">
                Recent Bookings Audit Log ({reportsData.recentBookings.length})
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase border-b border-slate-200">
                  <tr>
                    <th className="p-3">PNR</th>
                    <th className="p-3">Route</th>
                    <th className="p-3">Date & Time</th>
                    <th className="p-3">Seats</th>
                    <th className="p-3">Passengers</th>
                    <th className="p-3">Fares</th>
                    <th className="p-3">Levy</th>
                    <th className="p-3">Total Paid</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {reportsData.recentBookings.map((b: any) => (
                    <tr key={b.pnr} className="hover:bg-slate-50">
                      <td className="p-3 font-mono font-bold text-blue-900">{b.pnr}</td>
                      <td className="p-3 font-semibold text-slate-800">
                        {b.originCityName} → {b.destinationCityName}
                      </td>
                      <td className="p-3 text-slate-600">
                        {b.departureDate} {b.departureTime}
                      </td>
                      <td className="p-3 font-bold text-slate-900">
                        {b.selectedSeats.join(', ')}
                      </td>
                      <td className="p-3 text-slate-600">
                        {b.passengers.map((p: any) => p.fullName).join(', ')}
                      </td>
                      <td className="p-3 text-slate-900">
                        ${b.pricing.ticketFaresSubtotalUsd.toFixed(2)}
                      </td>
                      <td className="p-3 text-amber-700 font-semibold">
                        ${b.pricing.busLevyTotalUsd.toFixed(2)}
                      </td>
                      <td className="p-3 font-black text-slate-900">
                        ${b.pricing.totalPayableUsd.toFixed(2)}
                      </td>
                      <td className="p-3">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            b.status === 'confirmed'
                              ? 'bg-emerald-100 text-emerald-800'
                              : b.status === 'boarded'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {b.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ROUTES, FARES & LEVIES */}
      {activeTab === 'routes' && (
        <div className="space-y-6">
          {routeUpdateMsg && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
              ✓ {routeUpdateMsg}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {routes.map((route) => (
              <div
                key={route.id}
                className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2"
              >
                <div className="flex justify-between items-center">
                  <h4 className="text-sm font-bold text-slate-900">
                    {route.originCityName} → {route.destinationCityName}
                  </h4>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700">
                    {route.distanceKm} km • {route.estimatedDuration}
                  </span>
                </div>

                <div className="flex justify-between text-xs text-slate-600 pt-1">
                  <div>
                    <span>Base Fare: </span>
                    <strong className="text-slate-900">${route.baseFareUsd.toFixed(2)} USD</strong>
                  </div>
                  <div>
                    <span>Bus Levy: </span>
                    <strong className="text-amber-700">
                      {route.isLevyApplicable ? `$${route.busLevyUsd.toFixed(2)} USD` : 'None ($0)'}
                    </strong>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={() => handleSelectRouteForEdit(route)}
                    className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-blue-50 text-blue-700 text-xs font-bold transition-colors"
                  >
                    Edit Fare & Levy
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Route Edit Modal */}
          {selectedRoute && (
            <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs">
              <form
                onSubmit={handleSaveRoute}
                className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4"
              >
                <h3 className="text-base font-black text-slate-900">
                  Update Fares: {selectedRoute.originCityName} → {selectedRoute.destinationCityName}
                </h3>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                    Base Passenger Ticket Fare (USD) *
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="1"
                    value={routeFareInput}
                    onChange={(e) => setRouteFareInput(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                    Bus Regulatory Levy (USD) *
                  </label>
                  <input
                    type="number"
                    step="0.25"
                    min="0"
                    value={routeLevyInput}
                    onChange={(e) => setRouteLevyInput(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold"
                    required
                  />
                  <p className="text-[10px] text-slate-500 mt-1">
                    Calculated strictly as a separate line item per passenger.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="levyActive"
                    checked={routeLevyActive}
                    onChange={(e) => setRouteLevyActive(e.target.checked)}
                    className="rounded text-blue-600"
                  />
                  <label htmlFor="levyActive" className="text-xs font-semibold text-slate-700">
                    Apply Bus Levy to this Route
                  </label>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedRoute(null)}
                    className="flex-1 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: SNACKS INVENTORY */}
      {activeTab === 'snacks' && (
        <div className="space-y-6">
          {snackUpdateMsg && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
              ✓ {snackUpdateMsg}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {snacks.map((snk) => (
              <div
                key={snk.id}
                className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2 flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start">
                    <h4 className="text-xs font-bold text-slate-900 leading-tight">{snk.name}</h4>
                    <span className="text-xs font-black text-blue-900">${snk.priceUsd.toFixed(2)}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">{snk.packSize}</p>
                  <div className="text-xs font-bold text-emerald-700 mt-1">
                    Current Stock: {snk.stockQuantity} units
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex justify-end">
                  <button
                    type="button"
                    onClick={() => handleSelectSnackForEdit(snk)}
                    className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-blue-50 text-blue-700 text-xs font-bold transition-colors"
                  >
                    Update Stock & Price
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Snack Edit Modal */}
          {selectedSnack && (
            <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs">
              <form
                onSubmit={handleSaveSnack}
                className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4"
              >
                <h3 className="text-base font-black text-slate-900">
                  Manage Product: {selectedSnack.name}
                </h3>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                    Price in USD *
                  </label>
                  <input
                    type="number"
                    step="0.05"
                    min="0.1"
                    value={snackPriceInput}
                    onChange={(e) => setSnackPriceInput(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                    Stock Quantity on Hand *
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={snackStockInput}
                    onChange={(e) => setSnackStockInput(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold"
                    required
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedSnack(null)}
                    className="flex-1 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: ZIG CURRENCY CONFIG */}
      {activeTab === 'currency' && (
        <form
          onSubmit={handleSaveCurrency}
          className="bg-white rounded-3xl p-6 max-w-xl mx-auto border border-slate-200 shadow-sm space-y-4"
        >
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-amber-600" />
            <h3 className="text-base font-black text-slate-900">Configure Official ZiG Exchange Rate</h3>
          </div>
          <p className="text-xs text-slate-500">
            Used to show equivalent fare estimates to Zimbabwean passengers. Primary fares remain anchored in USD.
          </p>

          {currencySuccess && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
              ✓ {currencySuccess}
            </div>
          )}

          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
              USD to ZiG Exchange Rate (1 USD = X ZiG) *
            </label>
            <input
              type="number"
              step="0.01"
              min="0.1"
              value={newRate}
              onChange={(e) => setNewRate(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm font-bold text-slate-900"
              required
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
              Official Rate Source Name *
            </label>
            <input
              type="text"
              value={rateSource}
              onChange={(e) => setRateSource(e.target.value)}
              placeholder="e.g. Reserve Bank of Zimbabwe Interbank Rate"
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900"
              required
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-blue-950 font-black text-xs uppercase tracking-wider transition-all shadow-md shadow-amber-500/20 active:scale-98"
            >
              Update Exchange Rate
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
