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
} from '../types/index.ts';

export async function fetchCities(query?: string): Promise<DestinationCity[]> {
  const url = query ? `/api/cities?q=${encodeURIComponent(query)}` : '/api/cities';
  const res = await fetch(url);
  const data = await res.json();
  return data.cities || [];
}

export async function fetchCurrency(): Promise<CurrencyConfig> {
  const res = await fetch('/api/currency');
  const data = await res.json();
  return data.currency;
}

export async function searchTrips(origin: string, destination: string, date: string): Promise<{
  hasService: boolean;
  message?: string;
  route?: BusRoute;
  trips: ScheduledTrip[];
  currency?: CurrencyConfig;
  suggestedRoutes?: { from: string; to: string; sampleFare: number }[];
}> {
  const res = await fetch(
    `/api/trips/search?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&date=${encodeURIComponent(date)}`
  );
  return res.json();
}

export async function fetchTripSeats(tripId: string): Promise<{
  trip: ScheduledTrip;
  route: BusRoute;
  seats: TripSeatState[];
  coachCapacity: number;
  holdDurationMinutes: number;
  currency: CurrencyConfig;
}> {
  const res = await fetch(`/api/trips/${tripId}/seats`);
  if (!res.ok) throw new Error('Failed to fetch seats');
  return res.json();
}

export async function holdSeats(tripId: string, seatNumbers: string[], sessionId: string): Promise<{
  success: boolean;
  heldUntil?: number;
  error?: string;
}> {
  const res = await fetch(`/api/trips/${tripId}/hold`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ seatNumbers, sessionId }),
  });
  return res.json();
}

export async function releaseHeldSeats(tripId: string, seatNumbers: string[], sessionId: string): Promise<boolean> {
  const res = await fetch(`/api/trips/${tripId}/release`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ seatNumbers, sessionId }),
  });
  const data = await res.json();
  return data.success;
}

export async function fetchSnacks(): Promise<SnackProduct[]> {
  const res = await fetch('/api/snacks');
  const data = await res.json();
  return data.snacks || [];
}

export async function calculatePricing(
  tripId: string,
  seatCount: number,
  snackItems: { productId: string; quantity: number }[],
  couponCode?: string
): Promise<{ success: boolean; pricing?: PricingBreakdown; error?: string }> {
  const res = await fetch('/api/pricing/calculate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tripId, seatCount, snackItems, couponCode }),
  });
  return res.json();
}

export async function createBooking(payload: {
  tripId: string;
  sessionId: string;
  passengers: PassengerInfo[];
  snackItems: { productId: string; quantity: number }[];
  boardingPoint: string;
  droppingPoint: string;
  contactPhone: string;
  contactEmail?: string;
  couponCode?: string;
  paymentMethod: PaymentMethod;
}): Promise<{ success: boolean; booking?: BookingRecord; qrCodeDataUrl?: string; error?: string }> {
  const res = await fetch('/api/bookings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return res.json();
}

export async function fetchBookingByPnr(pnr: string, phone?: string): Promise<{
  booking?: BookingRecord;
  qrCodeDataUrl?: string;
  error?: string;
}> {
  const url = phone
    ? `/api/bookings/${encodeURIComponent(pnr)}?phone=${encodeURIComponent(phone)}`
    : `/api/bookings/${encodeURIComponent(pnr)}`;
  const res = await fetch(url);
  return res.json();
}

export async function cancelBooking(pnr: string, reason?: string): Promise<{
  success: boolean;
  refundAmountUsd?: number;
  cancellationFeeUsd?: number;
  error?: string;
}> {
  const res = await fetch(`/api/bookings/${encodeURIComponent(pnr)}/cancel`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reason }),
  });
  return res.json();
}

export async function boardPassenger(pnr: string, conductorId?: string): Promise<{
  success: boolean;
  booking?: BookingRecord;
  error?: string;
}> {
  const res = await fetch(`/api/bookings/${encodeURIComponent(pnr)}/board`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ conductorId }),
  });
  return res.json();
}

export async function updateCurrency(rate: number, source: string): Promise<CurrencyConfig> {
  const res = await fetch('/api/currency', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ rate, source }),
  });
  const data = await res.json();
  return data.currency;
}

export async function fetchAdminReports(): Promise<any> {
  const res = await fetch('/api/admin/reports');
  return res.json();
}
