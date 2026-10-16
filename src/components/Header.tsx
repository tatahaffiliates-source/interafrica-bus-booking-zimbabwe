import React, { useState } from 'react';
import { Search, Ticket, ShieldCheck, Settings, MapPin, Info, Menu, X } from 'lucide-react';
import { CurrencyConfig } from '../types/index.ts';
import interAfricaLogo from '../public/images/interafrica-logo-mark.png';

interface HeaderProps {
  currentTab: 'search' | 'manage' | 'conductor' | 'admin' | 'directory';
  onSelectTab: (tab: 'search' | 'manage' | 'conductor' | 'admin' | 'directory') => void;
  currency: CurrencyConfig | null;
  displayCurrency: 'USD' | 'ZiG';
  onToggleCurrency: (currency: 'USD' | 'ZiG') => void;
}

type AppTab = HeaderProps['currentTab'];

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  currency,
  displayCurrency,
  onToggleCurrency,
}) => {
  const [showRateDetails, setShowRateDetails] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const selectTab = (tab: AppTab) => {
    onSelectTab(tab);
    setMenuOpen(false);
  };

  const navClass = (tab: AppTab) =>
    `inline-flex min-h-10 items-center justify-center gap-2 rounded-lg px-3 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400 ${
      currentTab === tab
        ? 'bg-white/10 text-white'
        : 'text-slate-300 hover:bg-white/5 hover:text-white'
    }`;

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-blue-950 text-white">
      <div className="border-b border-white/10 bg-blue-900">
        <div className="mx-auto flex min-h-8 max-w-7xl items-center justify-between gap-2 px-3 sm:px-6 lg:px-8">
          <span className="inline-flex shrink-0 items-center gap-1.5 text-[10px] font-semibold tracking-wide text-amber-200 sm:text-xs">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
            SAMPLE DATA
            <span className="hidden sm:inline">· PROTOTYPE MODE</span>
            <span className="hidden min-[380px]:inline sm:hidden">· PROTOTYPE</span>
          </span>

          {currency && (
            <div className="flex items-center gap-2 text-[11px] sm:gap-3">
              <button
                type="button"
                aria-expanded={showRateDetails}
                aria-label={`1 USD equals ${currency.usdToZigRate.toFixed(2)} ZiG. Show exchange-rate details`}
                onClick={() => setShowRateDetails((shown) => !shown)}
                className="inline-flex min-h-8 items-center gap-1 text-slate-200 transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400"
              >
                <span className="hidden min-[380px]:inline">1 USD = {currency.usdToZigRate.toFixed(2)} ZiG</span>
                <span className="min-[380px]:hidden">Exchange rate</span>
                <Info className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
              <div role="group" aria-label="Display currency" className="inline-flex rounded-md border border-white/15 p-0.5">
                {(['USD', 'ZiG'] as const).map((unit) => (
                  <button
                    key={unit}
                    type="button"
                    aria-pressed={displayCurrency === unit}
                    onClick={() => onToggleCurrency(unit)}
                    className={`min-h-7 rounded px-2 text-[10px] font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-amber-400 ${
                      displayCurrency === unit
                        ? 'bg-white text-blue-950'
                        : 'text-slate-200 hover:bg-white/10'
                    }`}
                  >
                    {unit}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        {showRateDetails && currency && (
          <div className="border-t border-white/10 bg-blue-900 px-4 py-2 text-xs text-slate-200">
            <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
              <span>
                1 USD = {currency.usdToZigRate.toFixed(2)} ZiG · {currency.source} · Updated{' '}
                {new Date(currency.lastUpdated).toLocaleDateString()}
              </span>
              <button
                type="button"
                onClick={() => setShowRateDetails(false)}
                className="min-h-8 shrink-0 underline underline-offset-2 hover:text-white focus-visible:outline-2 focus-visible:outline-amber-400"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="mx-auto flex min-h-[68px] max-w-7xl items-center justify-between gap-3 px-3 sm:px-6 lg:min-h-[76px] lg:px-8">
        <button
          type="button"
          onClick={() => selectTab('search')}
          aria-label="InterAfrica home"
          className="flex shrink-0 items-center text-left focus-visible:rounded-xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-400"
        >
          <span className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl bg-white shadow-sm sm:h-12 sm:w-12">
            <img src={interAfricaLogo} alt="" className="h-full w-full object-contain" />
          </span>
        </button>

        <nav aria-label="Main navigation" className="hidden items-center gap-1 lg:flex">
          <button type="button" aria-current={currentTab === 'search' ? 'page' : undefined} onClick={() => selectTab('search')} className={navClass('search')}>
            <Search className="h-4 w-4" aria-hidden="true" />
            Search
          </button>
          <button type="button" aria-current={currentTab === 'directory' ? 'page' : undefined} onClick={() => selectTab('directory')} className={navClass('directory')}>
            Destinations
          </button>
          <button type="button" aria-current={currentTab === 'conductor' ? 'page' : undefined} onClick={() => selectTab('conductor')} className={navClass('conductor')}>
            Conductor check-in
          </button>
          <button type="button" aria-current={currentTab === 'admin' ? 'page' : undefined} onClick={() => selectTab('admin')} className={navClass('admin')}>
            Operations
          </button>
        </nav>

        <div className="ml-auto flex shrink-0 items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={() => selectTab('manage')}
            aria-label="My Ticket"
            title="My Ticket"
            className={`inline-flex h-9 w-9 items-center justify-center gap-2 rounded-lg px-0 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400 min-[380px]:h-10 min-[380px]:w-auto min-[380px]:px-2.5 sm:px-3 ${
              currentTab === 'manage' ? 'bg-white/10 text-white' : 'text-slate-200 hover:bg-white/5 hover:text-white'
            }`}
          >
            <Ticket className="h-4 w-4" aria-hidden="true" />
            <span className="hidden min-[380px]:inline">My Ticket</span>
          </button>
          <button
            type="button"
            aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-200 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400 lg:hidden"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav aria-label="More navigation" className="border-t border-white/10 bg-blue-950 px-3 py-2 lg:hidden">
          <button type="button" aria-current={currentTab === 'search' ? 'page' : undefined} onClick={() => selectTab('search')} className={`${navClass('search')} w-full justify-start`}>
            <Search className="h-4 w-4" aria-hidden="true" />
            Search
          </button>
          <button type="button" onClick={() => selectTab('directory')} className={`${navClass('directory')} w-full justify-start`}>
            <MapPin className="h-4 w-4" aria-hidden="true" />
            Destinations
          </button>
          <button type="button" onClick={() => selectTab('conductor')} className={`${navClass('conductor')} w-full justify-start`}>
            <ShieldCheck className="h-4 w-4" aria-hidden="true" />
            Conductor check-in
          </button>
          <button type="button" onClick={() => selectTab('admin')} className={`${navClass('admin')} w-full justify-start`}>
            <Settings className="h-4 w-4" aria-hidden="true" />
            Admin & operations
          </button>
        </nav>
      )}
    </header>
  );
};
