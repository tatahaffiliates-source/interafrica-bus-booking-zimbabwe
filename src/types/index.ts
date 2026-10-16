export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'boarded';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'cash_at_office';
export type PaymentMethod = 'ecocash' | 'onemoney' | 'paynow' | 'innbucks' | 'card' | 'cash_at_office';

export interface DestinationCity {
  id: string;
  name: string;
  province: string;
  isPopular?: boolean;
  terminals: Terminal[];
}

export interface Terminal {
  id: string;
  cityId: string;
  name: string;
  address: string;
  isBoardingPoint: boolean;
  isDroppingPoint: boolean;
}

export interface BusAmenities {
  airConditioning: boolean;
  usbCharging: boolean;
  onboardAudio: boolean;
  recliningSeats: boolean;
  overheadLuggage: boolean;
  readingLight: boolean;
  wifi?: boolean;
}

export interface BusRoute {
  id: string;
  originCityId: string;
  originCityName: string;
  destinationCityId: string;
  destinationCityName: string;
  distanceKm: number;
  estimatedDuration: string;
  departureTerminals: string[];
  arrivalTerminals: string[];
  intermediateStops: string[];
  baseFareUsd: number;
  busLevyUsd: number;
  isLevyApplicable: boolean;
  isActive: boolean;
  operatingDays: number[]; // 0 = Sun, 1 = Mon ...
  isSampleData?: boolean;
}

export interface ScheduledTrip {
  id: string;
  routeId: string;
  busNumber: string;
  busName: string;
  busType: 'Luxury Coach' | 'Semi-Luxury Express' | 'Standard Intercity';
  departureDate: string; // YYYY-MM-DD
  departureTime: string; // HH:mm
  arrivalTime: string;
  duration: string;
  totalSeats: number;
  availableSeatsCount: number;
  fareUsd: number;
  busLevyUsd: number;
  isLevyApplicable: boolean;
  snackShopEnabled: boolean;
  amenities: BusAmenities;
  boardingPoints: { id: string; name: string; time: string }[];
  droppingPoints: { id: string; name: string; time: string }[];
  cancellationPolicy: {
    freeCancellationHours: number;
    feePercentage: number;
  };
  luggagePolicy: string;
}

export type SeatStatus = 'available' | 'selected' | 'booked' | 'held' | 'reserved_female';

export interface CoachSeat {
  seatNumber: string; // "1", "2" ... "50"
  row: number; // 1 to 12
  column: 'left-window' | 'left-aisle' | 'right-aisle' | 'right-window' | 'rear';
  deck: 'lower';
  isRearBench?: boolean;
  isAttendantSeat?: boolean;
}

export interface TripSeatState {
  seatNumber: string;
  status: SeatStatus;
  heldBySessionId?: string;
  heldExpiresAt?: number; // timestamp ms
  bookedByPnr?: string;
  genderRule?: 'female' | 'any';
}

export interface SnackProduct {
  id: string;
  name: string;
  category: 'chips_and_snacks' | 'drinks';
  packSize: string;
  priceUsd: number;
  stockQuantity: number;
  maxQtyPerBooking: number;
  isAvailable: boolean;
  fulfilmentMethod: 'boarding_point_collection' | 'onboard_delivery';
}

export interface CartItem {
  productId: string;
  product: SnackProduct;
  quantity: number;
  unitPriceUsd: number;
}

export interface PassengerInfo {
  seatNumber: string;
  fullName: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  idNumber?: string;
}

export interface PricingBreakdown {
  seatCount: number;
  baseFarePerSeatUsd: number;
  ticketFaresSubtotalUsd: number;
  busLevyPerSeatUsd: number;
  busLevyTotalUsd: number;
  snacksSubtotalUsd: number;
  bookingFeeUsd: number;
  discountUsd: number;
  totalPayableUsd: number;
  totalPayableZiG: number;
  zigExchangeRate: number;
  zigRateSource: string;
  zigRateTimestamp: string;
}

export interface BookingRecord {
  pnr: string;
  tripId: string;
  routeId: string;
  originCityName: string;
  destinationCityName: string;
  departureDate: string;
  departureTime: string;
  arrivalTime: string;
  busName: string;
  busNumber: string;
  busType: string;
  boardingPoint: string;
  droppingPoint: string;
  passengers: PassengerInfo[];
  selectedSeats: string[];
  snacks: {
    productId: string;
    productName: string;
    packSize: string;
    unitPriceUsd: number;
    quantity: number;
    lineTotalUsd: number;
  }[];
  pricing: PricingBreakdown;
  contactPhone: string;
  contactEmail?: string;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  paymentMethod?: PaymentMethod;
  paymentReference?: string;
  createdAt: string;
  holdExpiresAt?: number;
  boardedAt?: string;
  boardedByConductorId?: string;
  notes?: string;
}

export interface CurrencyConfig {
  usdToZigRate: number;
  source: string;
  lastUpdated: string;
  isRateActive: boolean;
}

export interface NotificationLog {
  id: string;
  pnr: string;
  channel: 'whatsapp' | 'sms' | 'email';
  recipient: string;
  messageType: 'ticket' | 'confirmation' | 'reminder_24h' | 'reminder_2h' | 'cancellation';
  status: 'sent' | 'delivered' | 'failed' | 'fallback_used';
  timestamp: string;
  content: string;
  error?: string;
}
