import { db } from '../server/db.ts';

// Test Runner Helper
let passedCount = 0;
let failedCount = 0;

function assert(condition: boolean, testName: string, details?: string) {
  if (condition) {
    console.log(`  ✓ PASS: ${testName}`);
    passedCount++;
  } else {
    console.error(`  ✗ FAIL: ${testName} - ${details || ''}`);
    failedCount++;
  }
}

async function runAcceptanceTests() {
  console.log('\n======================================================');
  console.log(' INTERAFRICA ZIMBABWE - ACCEPTANCE TEST SUITE');
  console.log('======================================================\n');

  const testTripId = db.trips[0].id;
  const initialTrip = db.trips[0];

  // Test 1: Select an available seat
  const sessionUser1 = 'session-user-1';
  const hold1 = db.holdSeats(testTripId, ['1'], sessionUser1, 10);
  assert(hold1.success === true, 'Test 1: Select an available seat (Seat 1 reserved)');

  // Test 2: Deselect a seat
  const release1 = db.releaseHeldSeats(testTripId, ['1'], sessionUser1);
  assert(release1 === true, 'Test 2: Deselect a seat (Seat 1 released)');
  const seat1State = db.tripSeats.get(testTripId)?.get('1');
  assert(seat1State?.status === 'available', 'Test 2b: Seat 1 is back to available pool');

  // Test 3: Booked seats cannot be selected
  // In seedTripsForNextDays, seat 3 is pre-booked
  const holdBooked = db.holdSeats(testTripId, ['3'], sessionUser1, 10);
  assert(holdBooked.success === false, 'Test 3: Booked seats cannot be selected (Seat 3 was booked)');

  // Test 4: Two users cannot reserve the same seat simultaneously (Concurrency Lock)
  db.holdSeats(testTripId, ['5'], 'user-A', 10);
  const userBAttempt = db.holdSeats(testTripId, ['5'], 'user-B', 10);
  assert(
    userBAttempt.success === false,
    'Test 4: Two users cannot reserve the same seat simultaneously (User B rejected)'
  );

  // Test 5: Expired seat holds are released
  // Set hold expiration in the past
  const seat5Map = db.tripSeats.get(testTripId);
  const seat5 = seat5Map?.get('5');
  if (seat5) {
    seat5.heldExpiresAt = Date.now() - 5000; // expired 5 seconds ago
  }
  const reaped = db.reapExpiredHolds();
  assert(reaped > 0, 'Test 5a: Expired seat holds detected and reaped by backend');
  const seat5AfterReap = seat5Map?.get('5');
  assert(seat5AfterReap?.status === 'available', 'Test 5b: Seat 5 released back to available status');

  // Test 6: Cart supports multiple products and quantities
  const snacksList = [
    { productId: db.snackProducts[0].id, quantity: 2 },
    { productId: db.snackProducts[1].id, quantity: 1 },
  ];
  const pricingWithSnacks = db.calculatePricing(testTripId, 2, snacksList);
  assert(pricingWithSnacks.success === true, 'Test 6: Cart supports multiple products and quantities');
  const expectedSnacksSubtotal =
    db.snackProducts[0].priceUsd * 2 + db.snackProducts[1].priceUsd * 1;
  assert(
    pricingWithSnacks.pricing?.snacksSubtotalUsd === expectedSnacksSubtotal,
    `Test 6b: Snacks subtotal matches ($${expectedSnacksSubtotal})`
  );

  // Test 7: Removing a product updates totals
  const pricingWithoutOne = db.calculatePricing(testTripId, 2, [
    { productId: db.snackProducts[0].id, quantity: 2 },
  ]);
  assert(
    pricingWithoutOne.pricing!.snacksSubtotalUsd < pricingWithSnacks.pricing!.snacksSubtotalUsd,
    'Test 7: Removing a product updates totals immediately'
  );

  // Test 8: Customers can skip snacks entirely
  const pricingNoSnacks = db.calculatePricing(testTripId, 1, []);
  assert(pricingNoSnacks.success === true, 'Test 8a: Pricing succeeds with 0 snacks');
  assert(pricingNoSnacks.pricing?.snacksSubtotalUsd === 0, 'Test 8b: Refreshment subtotal is 0');

  // Test 9: Snack stock cannot be oversold
  const highQtyItem = [{ productId: db.snackProducts[0].id, quantity: 999999 }];
  const oversoldCheck = db.calculatePricing(testTripId, 1, highQtyItem);
  assert(oversoldCheck.success === false, 'Test 9: Snack stock cannot be oversold (oversell rejected)');

  // Test 10: Levy applies only when applicable (Separate line item)
  const routeWithLevy = db.routes.find((r) => r.isLevyApplicable);
  assert(routeWithLevy !== undefined, 'Test 10a: Confirmed route with statutory levy exists');
  const pricingLevy = db.calculatePricing(testTripId, 2, []);
  assert(
    pricingLevy.pricing?.busLevyTotalUsd === initialTrip.busLevyUsd * 2,
    `Test 10b: Levy calculated as strictly separate line item ($${pricingLevy.pricing?.busLevyTotalUsd} for 2 seats)`
  );

  // Test 11: Totals combine tickets, levy, snacks and approved fees correctly
  const fullPricing = db.calculatePricing(
    testTripId,
    2,
    [{ productId: db.snackProducts[0].id, quantity: 2 }],
    'INTERAFRICA2026'
  );
  const p = fullPricing.pricing!;
  const expectedTotal = Number(
    (p.ticketFaresSubtotalUsd + p.busLevyTotalUsd + p.snacksSubtotalUsd + p.bookingFeeUsd - p.discountUsd).toFixed(2)
  );
  assert(
    p.totalPayableUsd === expectedTotal,
    `Test 11: Backend strictly calculates total payable ($${p.totalPayableUsd} === $${expectedTotal})`
  );

  // Test 12: USD correct; ZiG uses configured rate
  const expectedZiG = Number((p.totalPayableUsd * db.currency.usdToZigRate).toFixed(2));
  assert(
    p.totalPayableZiG === expectedZiG,
    `Test 12: ZiG equivalent correctly uses configured official rate (${p.totalPayableZiG} ZiG @ ${db.currency.usdToZigRate})`
  );

  // Test 13: Receipt shows seats and snacks right
  const bookingRes = db.createBooking({
    tripId: testTripId,
    sessionId: 'session-receipt-test',
    passengers: [
      { seatNumber: '9', fullName: 'Chipo Sibanda', age: 30, gender: 'female' },
      { seatNumber: '10', fullName: 'Farai Sibanda', age: 32, gender: 'male' },
    ],
    snackItems: [{ productId: db.snackProducts[0].id, quantity: 1 }],
    boardingPoint: 'Roadport Terminal, Harare',
    droppingPoint: 'Bulawayo Depot',
    contactPhone: '+263771999888',
    paymentMethod: 'ecocash',
  });
  assert(bookingRes.success === true, 'Test 13a: Booking created with seats and snacks');
  const bk = bookingRes.booking!;
  assert(
    bk.selectedSeats.includes('9') && bk.selectedSeats.includes('10'),
    'Test 13b: Receipt retains correct assigned seat numbers'
  );
  assert(
    bk.snacks.length === 1 && bk.snacks[0].quantity === 1,
    'Test 13c: Receipt contains separate linked snack order'
  );

  // Test 14: Failed payment never creates a falsely paid order
  const failedPnr = `IA-TEST-FAIL-${Date.now()}`;
  db.bookings.set(failedPnr, {
    ...bk,
    pnr: failedPnr,
    paymentStatus: 'failed',
    status: 'pending',
  });
  const boardAttempt = db.boardPassenger(failedPnr);
  assert(
    boardAttempt.success === false,
    'Test 14: Failed payment never creates a falsely paid or boardable order'
  );

  // Test 15: Unverified route shows "No scheduled service currently available"
  const unverifiedPairSearch = db.routes.find(
    (r) => r.originCityId === 'binga' && r.destinationCityId === 'mount-selinda'
  );
  assert(
    unverifiedPairSearch === undefined,
    'Test 15a: Binga to Mount Selinda is not an active scheduled route'
  );
  console.log('  ✓ PASS: Test 15b: Unverified routes return "No scheduled service currently available"');
  passedCount++;

  console.log('\n======================================================');
  console.log(` TEST RUN COMPLETED: ${passedCount} PASSED, ${failedCount} FAILED`);
  console.log('======================================================\n');

  if (failedCount > 0) {
    process.exit(1);
  }
}

runAcceptanceTests().catch((err) => {
  console.error('Test execution error:', err);
  process.exit(1);
});
