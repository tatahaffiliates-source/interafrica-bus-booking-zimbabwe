import express, { Request, Response } from 'express';
import QRCode from 'qrcode';
import { db, ZIMBABWE_CITIES } from './db.ts';

export const apiRouter = express.Router();

// 1. Health check
apiRouter.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    system: 'InterAfrica Bus Booking Zimbabwe',
    market: 'Zimbabwe (ZWL/ZiG, USD)',
    timestamp: new Date().toISOString(),
  });
});

// 2. Directory of Cities & Boarding Points
apiRouter.get('/cities', (req: Request, res: Response) => {
  const query = (req.query.q as string || '').toLowerCase().trim();
  if (!query) {
    return res.json({ cities: db.cities });
  }

  // Search by city name, terminal name, or province
  const filtered = db.cities.filter((city) => {
    const matchCity = city.name.toLowerCase().includes(query);
    const matchProvince = city.province.toLowerCase().includes(query);
    const matchTerminal = city.terminals.some(
      (t) => t.name.toLowerCase().includes(query) || t.address.toLowerCase().includes(query)
    );
    return matchCity || matchProvince || matchTerminal;
  });

  return res.json({ cities: filtered });
});

// 3. Currency configuration (USD and ZiG)
apiRouter.get('/currency', (_req: Request, res: Response) => {
  res.json({ currency: db.currency });
});

apiRouter.post('/currency', (req: Request, res: Response) => {
  const { rate, source } = req.body;
  if (!rate || isNaN(Number(rate)) || Number(rate) <= 0) {
    return res.status(400).json({ error: 'Valid positive exchange rate is required' });
  }
  db.currency.usdToZigRate = Number(rate);
  db.currency.source = source || db.currency.source;
  db.currency.lastUpdated = new Date().toISOString();
  return res.json({ success: true, currency: db.currency });
});

// 4. Trip Search (Origin, Destination, Date)
apiRouter.get('/trips/search', (req: Request, res: Response) => {
  const origin = (req.query.origin as string || '').toLowerCase().trim();
  const destination = (req.query.destination as string || '').toLowerCase().trim();
  const date = (req.query.date as string || '').trim();

  if (!origin || !destination) {
    return res.status(400).json({ error: 'Origin and destination are required' });
  }

  // Find matching active route
  const activeRoute = db.routes.find((r) => {
    const matchOrigin =
      r.originCityId.toLowerCase() === origin ||
      r.originCityName.toLowerCase() === origin;
    const matchDest =
      r.destinationCityId.toLowerCase() === destination ||
      r.destinationCityName.toLowerCase() === destination;
    return matchOrigin && matchDest && r.isActive;
  });

  if (!activeRoute) {
    // Unverified pair: Return accurate message and suggest nearby connected hubs
    const isOriginInZim = db.cities.some((c) => c.id === origin || c.name.toLowerCase() === origin);
    const isDestInZim = db.cities.some((c) => c.id === destination || c.name.toLowerCase() === destination);

    const alternatives = [
      { from: 'Harare', to: 'Bulawayo', sampleFare: 18.00 },
      { from: 'Harare', to: 'Mutare', sampleFare: 12.00 },
      { from: 'Bulawayo', to: 'Victoria Falls', sampleFare: 20.00 },
      { from: 'Harare', to: 'Beitbridge', sampleFare: 25.00 },
    ];

    return res.json({
      hasService: false,
      message: 'No scheduled service currently available for this route.',
      isOriginVerifiedInDirectory: isOriginInZim,
      isDestinationVerifiedInDirectory: isDestInZim,
      trips: [],
      suggestedRoutes: alternatives,
    });
  }

  // Periodic hold cleanup
  db.reapExpiredHolds();

  // Search trips matching route and date
  let matchingTrips = db.trips.filter((t) => t.routeId === activeRoute.id);
  if (date) {
    matchingTrips = matchingTrips.filter((t) => t.departureDate === date);
  }

  return res.json({
    hasService: true,
    route: activeRoute,
    trips: matchingTrips,
    currency: db.currency,
  });
});

// 5. Trip Details & Seats
apiRouter.get('/trips/:tripId/seats', (req: Request, res: Response) => {
  const { tripId } = req.params;
  db.reapExpiredHolds();

  const trip = db.trips.find((t) => t.id === tripId);
  if (!trip) {
    return res.status(404).json({ error: 'Trip not found' });
  }

  const route = db.routes.find((r) => r.id === trip.routeId);
  const seatsMap = db.tripSeats.get(tripId);
  const seatStates = seatsMap ? Array.from(seatsMap.values()) : [];

  res.json({
    trip,
    route,
    seats: seatStates,
    coachCapacity: 50,
    holdDurationMinutes: 10,
    currency: db.currency,
  });
});

// 6. Hold Seats (Atomic Concurrency Protection)
apiRouter.post('/trips/:tripId/hold', (req: Request, res: Response) => {
  const { tripId } = req.params;
  const { seatNumbers, sessionId } = req.body;

  if (!sessionId) {
    return res.status(400).json({ error: 'Client session ID is required' });
  }

  if (!Array.isArray(seatNumbers) || seatNumbers.length === 0) {
    return res.status(400).json({ error: 'Must specify at least one seat number' });
  }

  const result = db.holdSeats(tripId, seatNumbers, sessionId, 10);
  if (!result.success) {
    return res.status(409).json({ error: result.error });
  }

  res.json({
    success: true,
    heldUntil: result.heldUntil,
    message: `Seats ${seatNumbers.join(', ')} successfully reserved for 10 minutes.`,
  });
});

// 7. Release Held Seats
apiRouter.post('/trips/:tripId/release', (req: Request, res: Response) => {
  const { tripId } = req.params;
  const { seatNumbers, sessionId } = req.body;

  if (!sessionId || !Array.isArray(seatNumbers)) {
    return res.status(400).json({ error: 'Invalid request' });
  }

  const released = db.releaseHeldSeats(tripId, seatNumbers, sessionId);
  res.json({ success: released });
});

// 8. Snack Shop Catalog
apiRouter.get('/snacks', (_req: Request, res: Response) => {
  res.json({
    snacks: db.snackProducts,
    currency: db.currency,
  });
});

// 9. Pricing Engine (Strict Backend Calculation)
apiRouter.post('/pricing/calculate', (req: Request, res: Response) => {
  const { tripId, seatCount, snackItems, couponCode } = req.body;

  if (!tripId) {
    return res.status(400).json({ error: 'Trip ID is required' });
  }

  const result = db.calculatePricing(
    tripId,
    Number(seatCount) || 1,
    Array.isArray(snackItems) ? snackItems : [],
    couponCode
  );

  if (!result.success) {
    return res.status(400).json({ error: result.error });
  }

  res.json({
    success: true,
    pricing: result.pricing,
  });
});

// 10. Create Booking (Confirm & Ticket Generation)
apiRouter.post('/bookings', async (req: Request, res: Response) => {
  const {
    tripId,
    sessionId,
    passengers,
    snackItems,
    boardingPoint,
    droppingPoint,
    contactPhone,
    contactEmail,
    couponCode,
    paymentMethod,
  } = req.body;

  if (!tripId || !sessionId || !Array.isArray(passengers) || passengers.length === 0) {
    return res.status(400).json({ error: 'Trip, session, and passengers are required' });
  }

  if (!boardingPoint || !droppingPoint || !contactPhone) {
    return res.status(400).json({ error: 'Boarding point, dropping point, and contact phone are required' });
  }

  const result = db.createBooking({
    tripId,
    sessionId,
    passengers,
    snackItems: Array.isArray(snackItems) ? snackItems : [],
    boardingPoint,
    droppingPoint,
    contactPhone,
    contactEmail,
    couponCode,
    paymentMethod: paymentMethod || 'ecocash',
  });

  if (!result.success || !result.booking) {
    return res.status(400).json({ error: result.error || 'Failed to complete booking' });
  }

  // Generate QR code for ticket verification
  try {
    const qrPayload = JSON.stringify({
      pnr: result.booking.pnr,
      bus: result.booking.busNumber,
      seats: result.booking.selectedSeats,
      date: result.booking.departureDate,
      passengers: result.booking.passengers.map((p) => p.fullName),
    });
    const qrCodeDataUrl = await QRCode.toDataURL(qrPayload, {
      errorCorrectionLevel: 'H',
      margin: 2,
      width: 256,
      color: {
        dark: '#1e3a8a',
        light: '#ffffff',
      },
    });

    return res.status(201).json({
      success: true,
      booking: result.booking,
      qrCodeDataUrl,
    });
  } catch (err) {
    return res.status(201).json({
      success: true,
      booking: result.booking,
      qrCodeDataUrl: '',
    });
  }
});

// 11. Retrieve Booking by PNR (Guest / Passenger Lookup)
apiRouter.get('/bookings/:pnr', async (req: Request, res: Response) => {
  const pnr = req.params.pnr.trim().toUpperCase();
  const phone = (req.query.phone as string || '').trim();

  const booking = db.bookings.get(pnr);
  if (!booking) {
    return res.status(404).json({ error: 'Booking reference (PNR) not found' });
  }

  // If phone supplied, verify matching phone
  if (phone && booking.contactPhone.replace(/\D/g, '') !== phone.replace(/\D/g, '')) {
    return res.status(403).json({ error: 'Phone number does not match this booking record' });
  }

  let qrCodeDataUrl = '';
  try {
    const qrPayload = JSON.stringify({
      pnr: booking.pnr,
      bus: booking.busNumber,
      seats: booking.selectedSeats,
      date: booking.departureDate,
    });
    qrCodeDataUrl = await QRCode.toDataURL(qrPayload, { width: 256 });
  } catch (e) {
    // continue
  }

  res.json({
    booking,
    qrCodeDataUrl,
  });
});

// 12. Cancel Booking
apiRouter.post('/bookings/:pnr/cancel', (req: Request, res: Response) => {
  const pnr = req.params.pnr.trim().toUpperCase();
  const { reason } = req.body;

  const result = db.cancelBooking(pnr, reason);
  if (!result.success) {
    return res.status(400).json({ error: result.error });
  }

  res.json({
    success: true,
    refundAmountUsd: result.refundAmountUsd,
    cancellationFeeUsd: result.cancellationFeeUsd,
    message: `Booking ${pnr} cancelled successfully. Refund of $${result.refundAmountUsd} USD processed.`,
  });
});

// 13. Conductor Check-In / Boarding Validation
apiRouter.post('/bookings/:pnr/board', (req: Request, res: Response) => {
  const pnr = req.params.pnr.trim().toUpperCase();
  const { conductorId } = req.body;

  const result = db.boardPassenger(pnr, conductorId || 'CONDUCTOR-HARARE-01');
  if (!result.success) {
    return res.status(400).json({ error: result.error });
  }

  res.json({
    success: true,
    booking: result.booking,
    message: `Passenger for PNR ${pnr} successfully marked as BOARDED.`,
  });
});

// 14. WhatsApp & SMS Notification Logs
apiRouter.get('/notifications', (req: Request, res: Response) => {
  const pnr = req.query.pnr as string;
  if (pnr) {
    const filtered = db.notifications.filter((n) => n.pnr === pnr.toUpperCase());
    return res.json({ notifications: filtered });
  }
  return res.json({ notifications: db.notifications });
});

// 15. Admin Management Routes
apiRouter.get('/admin/routes', (_req: Request, res: Response) => {
  res.json({ routes: db.routes });
});

apiRouter.post('/admin/routes', (req: Request, res: Response) => {
  const newRoute = req.body;
  if (!newRoute.originCityName || !newRoute.destinationCityName || !newRoute.baseFareUsd) {
    return res.status(400).json({ error: 'Missing required route fields' });
  }
  const id = `route-${Date.now()}`;
  const route = { ...newRoute, id, isActive: true };
  db.routes.push(route);
  res.status(201).json({ success: true, route });
});

apiRouter.put('/admin/routes/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const idx = db.routes.findIndex((r) => r.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Route not found' });
  db.routes[idx] = { ...db.routes[idx], ...req.body };
  res.json({ success: true, route: db.routes[idx] });
});

// Admin snacks stock & price update
apiRouter.put('/admin/snacks/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const prod = db.snackProducts.find((p) => p.id === id);
  if (!prod) return res.status(404).json({ error: 'Snack not found' });
  Object.assign(prod, req.body);
  res.json({ success: true, product: prod });
});

// Admin reports
apiRouter.get('/admin/reports', (_req: Request, res: Response) => {
  const allBookings = Array.from(db.bookings.values());
  const confirmed = allBookings.filter((b) => b.status === 'confirmed' || b.status === 'boarded');
  
  const totalRevenueUsd = confirmed.reduce((sum, b) => sum + b.pricing.totalPayableUsd, 0);
  const ticketRevenueUsd = confirmed.reduce((sum, b) => sum + b.pricing.ticketFaresSubtotalUsd, 0);
  const busLevyRevenueUsd = confirmed.reduce((sum, b) => sum + b.pricing.busLevyTotalUsd, 0);
  const snackRevenueUsd = confirmed.reduce((sum, b) => sum + b.pricing.snacksSubtotalUsd, 0);
  const totalSeatsSold = confirmed.reduce((sum, b) => sum + b.selectedSeats.length, 0);
  const cancelledCount = allBookings.filter((b) => b.status === 'cancelled').length;

  res.json({
    metrics: {
      totalBookings: allBookings.length,
      confirmedBookings: confirmed.length,
      cancelledBookings: cancelledCount,
      totalSeatsSold,
      totalRevenueUsd: Number(totalRevenueUsd.toFixed(2)),
      ticketRevenueUsd: Number(ticketRevenueUsd.toFixed(2)),
      busLevyRevenueUsd: Number(busLevyRevenueUsd.toFixed(2)),
      snackRevenueUsd: Number(snackRevenueUsd.toFixed(2)),
    },
    recentBookings: allBookings.slice(-20).reverse(),
  });
});
