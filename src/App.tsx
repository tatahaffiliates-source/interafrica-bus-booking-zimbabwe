import React, { useState, useEffect } from 'react';
import { Header } from './components/Header.tsx';
import { HeroCarousel } from './components/HeroCarousel.tsx';
import { SearchHero } from './components/SearchHero.tsx';
import { SearchResults } from './components/SearchResults.tsx';
import { CoachSeatMap } from './components/CoachSeatMap.tsx';
import { SnackShop } from './components/SnackShop.tsx';
import { PassengerDetailsForm } from './components/PassengerDetailsForm.tsx';
import { OrderReviewAndPayment } from './components/OrderReviewAndPayment.tsx';
import { TicketConfirmation } from './components/TicketConfirmation.tsx';
import { ManageBooking } from './components/ManageBooking.tsx';
import { ConductorScanner } from './components/ConductorScanner.tsx';
import { AdminPortal } from './components/AdminPortal.tsx';
import { ZimbabweDestinationsDirectory } from './components/ZimbabweDestinationsDirectory.tsx';
import {
  DestinationCity,
  BusRoute,
  ScheduledTrip,
  TripSeatState,
  SnackProduct,
  BookingRecord,
  CurrencyConfig,
  PricingBreakdown,
  PassengerInfo,
  PaymentMethod,
} from './types/index.ts';
import {
  fetchCities,
  fetchCurrency,
  searchTrips,
  fetchTripSeats,
  holdSeats,
  releaseHeldSeats,
  fetchSnacks,
  calculatePricing,
  createBooking,
} from './services/api.ts';

export default function App() {
  // Navigation tab state
  const [currentTab, setCurrentTab] = useState<'search' | 'manage' | 'conductor' | 'admin' | 'directory'>('search');
  
  // Currency state
  const [currency, setCurrency] = useState<CurrencyConfig | null>(null);
  const [displayCurrency, setDisplayCurrency] = useState<'USD' | 'ZiG'>('USD');

  // Directory and Routes data
  const [cities, setCities] = useState<DestinationCity[]>([]);
  const [routes, setRoutes] = useState<BusRoute[]>([]);
  const [snacksCatalog, setSnacksCatalog] = useState<SnackProduct[]>([]);

  // Search Flow state (Step 1)
  const [origin, setOrigin] = useState('Harare');
  const [destination, setDestination] = useState('Bulawayo');
  const [departureDate, setDepartureDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [passengerCount, setPassengerCount] = useState(1);
  const [isSearching, setIsSearching] = useState(false);
  const [searchHasRun, setSearchHasRun] = useState(false);
  const [searchResults, setSearchResults] = useState<{
    hasService: boolean;
    message?: string;
    route?: BusRoute;
    trips: ScheduledTrip[];
    suggestedRoutes?: { from: string; to: string; sampleFare: number }[];
  }>({ hasService: true, trips: [] });

  // Booking Flow Steps:
  // 'search' -> 'seats' -> 'snacks' -> 'passengers' -> 'payment' -> 'confirmation'
  const [bookingStep, setBookingStep] = useState<'search' | 'seats' | 'snacks' | 'passengers' | 'payment' | 'confirmation'>('search');

  // Selected Trip & Seats (Step 2 & 3)
  const [selectedTrip, setSelectedTrip] = useState<ScheduledTrip | null>(null);
  const [activeRoute, setActiveRoute] = useState<BusRoute | null>(null);
  const [tripSeats, setTripSeats] = useState<TripSeatState[]>([]);
  const [selectedSeatNumbers, setSelectedSeatNumbers] = useState<string[]>([]);
  const [sessionId] = useState(() => `sess-${Math.random().toString(36).substring(2, 9)}`);
  const [holdExpiresAt, setHoldExpiresAt] = useState<number | null>(null);
  const [isLoadingHold, setIsLoadingHold] = useState(false);
  const [holdErrorMessage, setHoldErrorMessage] = useState('');

  // Snacks Cart (Step 4) - isolated strictly per journey session
  const [snackCart, setSnackCart] = useState<{ productId: string; quantity: number }[]>([]);

  // Passenger Details (Step 5)
  const [passengers, setPassengers] = useState<PassengerInfo[]>([]);
  const [boardingPoint, setBoardingPoint] = useState('');
  const [droppingPoint, setDroppingPoint] = useState('');
  const [contactPhone, setContactPhone] = useState('+263');
  const [contactEmail, setContactEmail] = useState('');

  // Pricing & Coupon (Step 6)
  const [pricing, setPricing] = useState<PricingBreakdown | null>(null);
  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Confirmed Booking Record (Step 7)
  const [confirmedBooking, setConfirmedBooking] = useState<BookingRecord | null>(null);
  const [confirmedQrCode, setConfirmedQrCode] = useState<string>('');

  // Initial Data Fetch
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const [citiesData, currData, snacksData] = await Promise.all([
        fetchCities(),
        fetchCurrency(),
        fetchSnacks(),
      ]);
      setCities(citiesData);
      setCurrency(currData);
      setSnacksCatalog(snacksData);

      // Load admin routes for directory overview
      const routesRes = await fetch('/api/admin/routes');
      const routesData = await routesRes.json();
      if (routesData.routes) setRoutes(routesData.routes);
    } catch (err) {
      console.error('Failed to load initial data:', err);
    }
  };

  // Perform Bus Search
  const handleSearch = async () => {
    setIsSearching(true);
    setSearchHasRun(true);
    setBookingStep('search');

    try {
      const res = await searchTrips(origin, destination, departureDate);
      setSearchResults(res);
      if (res.route) setActiveRoute(res.route);
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setIsSearching(false);
    }
  };

  // Trigger search on mount for default popular Harare <-> Bulawayo
  useEffect(() => {
    handleSearch();
  }, []);

  // When passenger selects a trip from search results -> load seat map
  const handleSelectTrip = async (trip: ScheduledTrip) => {
    setSelectedTrip(trip);
    setSelectedSeatNumbers([]);
    setHoldExpiresAt(null);
    setHoldErrorMessage('');
    setSnackCart([]); // Ensure snack cart is reset for new trip session

    try {
      const seatData = await fetchTripSeats(trip.id);
      setTripSeats(seatData.seats);
      setActiveRoute(seatData.route);
      setBookingStep('seats');
    } catch (err) {
      console.error('Failed to fetch trip seats:', err);
    }
  };

  // Seat toggle with backend atomic hold check
  const handleToggleSeat = async (seatNumber: string) => {
    if (!selectedTrip) return;
    setHoldErrorMessage('');

    const isAlreadySelected = selectedSeatNumbers.includes(seatNumber);
    let updatedSelection: string[];

    if (isAlreadySelected) {
      // Deselect
      updatedSelection = selectedSeatNumbers.filter((s) => s !== seatNumber);
      setSelectedSeatNumbers(updatedSelection);
      // Release held seat on backend
      await releaseHeldSeats(selectedTrip.id, [seatNumber], sessionId);
      if (updatedSelection.length === 0) {
        setHoldExpiresAt(null);
      }
    } else {
      // Check maximum limit
      if (selectedSeatNumbers.length >= passengerCount) {
        setHoldErrorMessage(`You have selected the maximum ${passengerCount} seat(s) for your passenger count.`);
        return;
      }

      updatedSelection = [...selectedSeatNumbers, seatNumber];
      setIsLoadingHold(true);

      try {
        const holdRes = await holdSeats(selectedTrip.id, updatedSelection, sessionId);
        if (!holdRes.success) {
          setHoldErrorMessage(holdRes.error || 'Seat could not be reserved');
        } else {
          setSelectedSeatNumbers(updatedSelection);
          if (holdRes.heldUntil) setHoldExpiresAt(holdRes.heldUntil);
        }
      } catch (err: any) {
        setHoldErrorMessage(err.message || 'Error holding seat');
      } finally {
        setIsLoadingHold(false);
      }
    }
  };

  // Seat hold expired handler
  const handleHoldExpired = () => {
    setSelectedSeatNumbers([]);
    setHoldExpiresAt(null);
    setHoldErrorMessage('Your 10-minute seat reservation has expired. Please select your seats again.');
    if (selectedTrip) {
      fetchTripSeats(selectedTrip.id).then((d) => setTripSeats(d.seats));
    }
  };

  // Step 3 -> Step 4: Proceed to Snack Shop
  const handleProceedToSnacks = () => {
    if (selectedSeatNumbers.length === 0) return;
    if (selectedTrip?.snackShopEnabled) {
      setBookingStep('snacks');
    } else {
      handleProceedToPassengers();
    }
  };

  // Snack Cart Update
  const handleUpdateSnackQuantity = (productId: string, quantity: number) => {
    setSnackCart((prev) => {
      if (quantity <= 0) {
        return prev.filter((item) => item.productId !== productId);
      }
      const existing = prev.find((item) => item.productId === productId);
      if (existing) {
        return prev.map((item) => (item.productId === productId ? { ...item, quantity } : item));
      }
      return [...prev, { productId, quantity }];
    });
  };

  const handleClearSnackCart = () => {
    setSnackCart([]);
  };

  // Step 4 -> Step 5: Proceed to Passenger Details Form
  const handleProceedToPassengers = () => {
    // Initialize passengers array based on selected seat numbers
    const initialPassengers: PassengerInfo[] = selectedSeatNumbers.map((seatNum, idx) => {
      const existing = passengers[idx];
      return {
        seatNumber: seatNum,
        fullName: existing?.fullName || '',
        age: existing?.age || 28,
        gender: existing?.gender || 'male',
      };
    });
    setPassengers(initialPassengers);

    // Default boarding & dropping points from trip
    if (selectedTrip) {
      if (!boardingPoint && selectedTrip.boardingPoints.length > 0) {
        setBoardingPoint(selectedTrip.boardingPoints[0].name);
      }
      if (!droppingPoint && selectedTrip.droppingPoints.length > 0) {
        setDroppingPoint(selectedTrip.droppingPoints[0].name);
      }
    }

    setBookingStep('passengers');
  };

  const handleUpdatePassenger = (index: number, field: keyof PassengerInfo, value: any) => {
    setPassengers((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  // Step 5 -> Step 6: Proceed to Order Review & Payment
  const handleProceedToReview = async () => {
    if (!selectedTrip) return;
    try {
      const res = await calculatePricing(
        selectedTrip.id,
        selectedSeatNumbers.length,
        snackCart,
        couponCode
      );
      if (res.success && res.pricing) {
        setPricing(res.pricing);
        setBookingStep('payment');
      } else {
        alert(res.error || 'Pricing calculation failed');
      }
    } catch (err: any) {
      alert('Failed to calculate pricing: ' + err.message);
    }
  };

  // Coupon Application
  const handleApplyCoupon = async (code: string) => {
    if (!selectedTrip) return;
    setCouponCode(code);
    setCouponError('');
    setCouponSuccess('');

    const res = await calculatePricing(
      selectedTrip.id,
      selectedSeatNumbers.length,
      snackCart,
      code
    );

    if (res.success && res.pricing) {
      setPricing(res.pricing);
      if (res.pricing.discountUsd > 0) {
        setCouponSuccess(`Coupon applied! You saved $${res.pricing.discountUsd.toFixed(2)} USD.`);
      } else {
        setCouponError('Invalid coupon code or expired promotion');
      }
    } else {
      setCouponError(res.error || 'Failed to apply coupon');
    }
  };

  // Step 6 -> Step 7: Confirm Booking & Payment
  const handleConfirmPayment = async (method: PaymentMethod) => {
    if (!selectedTrip) return;
    setIsProcessingPayment(true);

    try {
      const res = await createBooking({
        tripId: selectedTrip.id,
        sessionId,
        passengers,
        snackItems: snackCart,
        boardingPoint,
        droppingPoint,
        contactPhone,
        contactEmail,
        couponCode,
        paymentMethod: method,
      });

      if (!res.success || !res.booking) {
        throw new Error(res.error || 'Booking creation failed');
      }

      setConfirmedBooking(res.booking);
      setConfirmedQrCode(res.qrCodeDataUrl || '');
      setBookingStep('confirmation');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  // Book Another Trip
  const handleBookAnother = () => {
    setSelectedTrip(null);
    setSelectedSeatNumbers([]);
    setSnackCart([]);
    setPassengers([]);
    setConfirmedBooking(null);
    setBookingStep('search');
    handleSearch();
  };

  // View full ticket from Manage Booking lookup
  const handleViewTicketFromManage = (b: BookingRecord) => {
    setConfirmedBooking(b);
    setBookingStep('confirmation');
    setCurrentTab('search');
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-800">
      {/* Top Global Header with USD / ZiG converter & Navigation */}
      <Header
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setCurrentTab(tab);
          if (tab === 'search' && bookingStep === 'confirmation') {
            setBookingStep('search');
          }
        }}
        currency={currency}
        displayCurrency={displayCurrency}
        onToggleCurrency={setDisplayCurrency}
      />

      {/* Main App Content View */}
      <main className="flex-1 pb-16">
        {/* VIEW 1: PASSENGER SEARCH & BOOKING FLOW */}
        {currentTab === 'search' && (
          <div>
            {bookingStep === 'search' && (
              <>
                <HeroCarousel />
                <SearchHero
                  cities={cities}
                  origin={origin}
                  destination={destination}
                  departureDate={departureDate}
                  passengerCount={passengerCount}
                  onOriginChange={setOrigin}
                  onDestinationChange={setDestination}
                  onDateChange={setDepartureDate}
                  onPassengerCountChange={setPassengerCount}
                  onSearch={handleSearch}
                  isLoading={isSearching}
                />

                {searchHasRun && (
                  <SearchResults
                    hasService={searchResults.hasService}
                    message={searchResults.message}
                    route={searchResults.route}
                    trips={searchResults.trips}
                    currency={currency}
                    displayCurrency={displayCurrency}
                    departureDate={departureDate}
                    onDateChange={(newDate) => {
                      setDepartureDate(newDate);
                      handleSearch();
                    }}
                    onSelectTrip={handleSelectTrip}
                    suggestedRoutes={searchResults.suggestedRoutes}
                    onSelectSuggestedRoute={(from, to) => {
                      setOrigin(from);
                      setDestination(to);
                      searchTrips(from, to, departureDate).then(setSearchResults);
                    }}
                  />
                )}
              </>
            )}

            {bookingStep === 'seats' && selectedTrip && activeRoute && (
              <CoachSeatMap
                trip={selectedTrip}
                route={activeRoute}
                seats={tripSeats}
                selectedSeatNumbers={selectedSeatNumbers}
                maxSeatsAllowed={passengerCount}
                onToggleSeat={handleToggleSeat}
                holdExpiresAt={holdExpiresAt}
                onHoldExpired={handleHoldExpired}
                currency={currency}
                displayCurrency={displayCurrency}
                onContinue={handleProceedToSnacks}
                onBack={() => setBookingStep('search')}
                isLoadingHold={isLoadingHold}
                holdErrorMessage={holdErrorMessage}
              />
            )}

            {bookingStep === 'snacks' && selectedTrip && (
              <SnackShop
                trip={selectedTrip}
                products={snacksCatalog}
                cart={snackCart}
                onUpdateQuantity={handleUpdateSnackQuantity}
                onClearCart={handleClearSnackCart}
                currency={currency}
                displayCurrency={displayCurrency}
                onContinue={handleProceedToPassengers}
                onSkip={handleProceedToPassengers}
                onBack={() => setBookingStep('seats')}
              />
            )}

            {bookingStep === 'passengers' && selectedTrip && activeRoute && (
              <PassengerDetailsForm
                trip={selectedTrip}
                route={activeRoute}
                selectedSeats={selectedSeatNumbers}
                passengers={passengers}
                boardingPoint={boardingPoint}
                droppingPoint={droppingPoint}
                contactPhone={contactPhone}
                contactEmail={contactEmail}
                onUpdatePassenger={handleUpdatePassenger}
                onBoardingPointChange={setBoardingPoint}
                onDroppingPointChange={setDroppingPoint}
                onPhoneChange={setContactPhone}
                onEmailChange={setContactEmail}
                onContinue={handleProceedToReview}
                onBack={() =>
                  selectedTrip.snackShopEnabled
                    ? setBookingStep('snacks')
                    : setBookingStep('seats')
                }
              />
            )}

            {bookingStep === 'payment' && selectedTrip && activeRoute && pricing && (
              <OrderReviewAndPayment
                trip={selectedTrip}
                route={activeRoute}
                passengers={passengers}
                snacks={snackCart}
                allProducts={snacksCatalog}
                boardingPoint={boardingPoint}
                droppingPoint={droppingPoint}
                contactPhone={contactPhone}
                pricing={pricing}
                couponCode={couponCode}
                onApplyCoupon={handleApplyCoupon}
                couponError={couponError}
                couponSuccess={couponSuccess}
                onConfirmPayment={handleConfirmPayment}
                isProcessing={isProcessingPayment}
                onBack={() => setBookingStep('passengers')}
                displayCurrency={displayCurrency}
              />
            )}

            {bookingStep === 'confirmation' && confirmedBooking && (
              <TicketConfirmation
                booking={confirmedBooking}
                qrCodeDataUrl={confirmedQrCode}
                currency={currency}
                onBookAnother={handleBookAnother}
              />
            )}
          </div>
        )}

        {/* VIEW 2: MANAGE BOOKINGS */}
        {currentTab === 'manage' && (
          <ManageBooking
            currency={currency}
            displayCurrency={displayCurrency}
            onViewFullTicket={handleViewTicketFromManage}
          />
        )}

        {/* VIEW 3: CONDUCTOR CHECK-IN SCANNER */}
        {currentTab === 'conductor' && <ConductorScanner />}

        {/* VIEW 4: ADMIN OPERATIONS & REPORTS */}
        {currentTab === 'admin' && (
          <AdminPortal
            routes={routes}
            snacks={snacksCatalog}
            currency={currency}
            onRefreshData={loadInitialData}
          />
        )}

        {/* VIEW 5: ZIMBABWE DESTINATIONS DIRECTORY */}
        {currentTab === 'directory' && (
          <ZimbabweDestinationsDirectory
            cities={cities}
            routes={routes}
            onSelectCity={(cityName) => {
              setOrigin(cityName);
              setCurrentTab('search');
              setBookingStep('search');
            }}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-blue-950 text-slate-400 text-xs py-8 border-t border-blue-900">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div>
            <div className="text-white font-black text-sm">InterAfrica Bus Booking Zimbabwe</div>
            <p className="text-[11px] text-blue-300 mt-0.5">
              Official intercity coach bookings across Zimbabwe. All fares & seat availability calculated on backend.
            </p>
          </div>
          <div className="text-center sm:text-right text-[11px]">
            <div>Primary Currency: USD • Configurable RBZ ZiG Interbank Rate</div>
            <div className="text-slate-500 mt-1">© 2026 InterAfrica Zimbabwe. All rights reserved.</div>
          </div>
        </div>
      </footer>
    </div>
  );
}
