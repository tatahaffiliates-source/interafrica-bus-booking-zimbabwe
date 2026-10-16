import {
  DestinationCity,
  BusRoute,
  ScheduledTrip,
  TripSeatState,
  SnackProduct,
  BookingRecord,
  CurrencyConfig,
  NotificationLog,
  PricingBreakdown,
  CoachSeat,
  PassengerInfo,
} from '../types/index.ts';

// 1. ZIMBABWE DESTINATION DIRECTORY (45+ towns, de-duplicated and verified spellings)
export const ZIMBABWE_CITIES: DestinationCity[] = [
  {
    id: 'harare',
    name: 'Harare',
    province: 'Harare Metropolitan',
    isPopular: true,
    terminals: [
      { id: 'har-roadport', cityId: 'harare', name: 'Roadport International Terminal (Robert Mugabe Rd)', address: 'Robert Mugabe Way & 5th St, Harare', isBoardingPoint: true, isDroppingPoint: true },
      { id: 'har-mbare', cityId: 'harare', name: 'Mbare Musika Bus Terminus', address: 'Ardbennie Rd, Mbare, Harare', isBoardingPoint: true, isDroppingPoint: true },
      { id: 'har-showground', cityId: 'harare', name: 'Exhibition Park / Showgrounds Gate', address: 'Samora Machel Ave W, Harare', isBoardingPoint: true, isDroppingPoint: true },
    ],
  },
  {
    id: 'bulawayo',
    name: 'Bulawayo',
    province: 'Bulawayo Metropolitan',
    isPopular: true,
    terminals: [
      { id: 'byo-interafrica-depot', cityId: 'bulawayo', name: 'InterAfrica Bulawayo City Depot (Lobengula St)', address: 'Lobengula St & 3rd Ave, Bulawayo', isBoardingPoint: true, isDroppingPoint: true },
      { id: 'byo-renkini', cityId: 'bulawayo', name: 'Renkini Bus Terminus', address: '6th Ave Ext, Bulawayo', isBoardingPoint: true, isDroppingPoint: true },
    ],
  },
  {
    id: 'mutare',
    name: 'Mutare',
    province: 'Manicaland',
    isPopular: true,
    terminals: [
      { id: 'mut-main-terminal', cityId: 'mutare', name: 'Mutare Main Bus Terminus (Sakubva)', address: 'Sakubva, Mutare', isBoardingPoint: true, isDroppingPoint: true },
      { id: 'mut-interafrica-office', cityId: 'mutare', name: 'InterAfrica Booking Office (Aerodrome Rd)', address: 'Aerodrome Rd, Mutare CBD', isBoardingPoint: true, isDroppingPoint: true },
    ],
  },
  {
    id: 'gweru',
    name: 'Gweru',
    province: 'Midlands',
    isPopular: true,
    terminals: [
      { id: 'gwe-kudzanayi', cityId: 'gweru', name: 'Kudzanayi Long Distance Bus Terminus', address: 'Lobengula Ave, Gweru', isBoardingPoint: true, isDroppingPoint: true },
    ],
  },
  {
    id: 'masvingo',
    name: 'Masvingo',
    province: 'Masvingo',
    isPopular: true,
    terminals: [
      { id: 'mas-mucheke', cityId: 'masvingo', name: 'Mucheke Bus Terminus', address: 'Mucheke, Masvingo', isBoardingPoint: true, isDroppingPoint: true },
      { id: 'mas-exor', cityId: 'masvingo', name: 'Exor Service Station Boarding Point', address: 'Beitbridge Highway, Masvingo', isBoardingPoint: true, isDroppingPoint: true },
    ],
  },
  {
    id: 'kwekwe',
    name: 'Kwekwe',
    province: 'Midlands',
    isPopular: true,
    terminals: [
      { id: 'kwe-main', cityId: 'kwekwe', name: 'Kwekwe Rank & InterAfrica Office', address: 'Robert Mugabe Way, Kwekwe', isBoardingPoint: true, isDroppingPoint: true },
    ],
  },
  {
    id: 'kadoma',
    name: 'Kadoma',
    province: 'Mashonaland West',
    isPopular: true,
    terminals: [
      { id: 'kad-main', cityId: 'kadoma', name: 'Kadoma Bus Terminus (Sam Levy / CBD)', address: 'Harare-Bulawayo Hwy, Kadoma', isBoardingPoint: true, isDroppingPoint: true },
    ],
  },
  {
    id: 'chinhoyi',
    name: 'Chinhoyi',
    province: 'Mashonaland West',
    isPopular: true,
    terminals: [
      { id: 'chi-rank', cityId: 'chinhoyi', name: 'Chinhoyi Main Bus Terminus', address: 'Magamba Way, Chinhoyi', isBoardingPoint: true, isDroppingPoint: true },
    ],
  },
  {
    id: 'marondera',
    name: 'Marondera',
    province: 'Mashonaland East',
    isPopular: true,
    terminals: [
      { id: 'mar-main', cityId: 'marondera', name: 'Marondera Flyover Boarding Rank', address: 'Harare-Mutare Hwy, Marondera', isBoardingPoint: true, isDroppingPoint: true },
    ],
  },
  {
    id: 'bindura',
    name: 'Bindura',
    province: 'Mashonaland Central',
    isPopular: true,
    terminals: [
      { id: 'bin-rank', cityId: 'bindura', name: 'Bindura Town Bus Terminus', address: 'Trojan Rd, Bindura', isBoardingPoint: true, isDroppingPoint: true },
    ],
  },
  { id: 'rusape', name: 'Rusape', province: 'Manicaland', terminals: [{ id: 'rus-main', cityId: 'rusape', name: 'Rusape Bus Rank', address: 'Harare-Mutare Rd, Rusape', isBoardingPoint: true, isDroppingPoint: true }] },
  { id: 'nyazura', name: 'Nyazura', province: 'Manicaland', terminals: [{ id: 'nya-main', cityId: 'nyazura', name: 'Nyazura Stop', address: 'Mutare Rd, Nyazura', isBoardingPoint: true, isDroppingPoint: true }] },
  { id: 'chegutu', name: 'Chegutu', province: 'Mashonaland West', terminals: [{ id: 'che-main', cityId: 'chegutu', name: 'Chegutu Bus Stop', address: 'Bulawayo Rd, Chegutu', isBoardingPoint: true, isDroppingPoint: true }] },
  { id: 'zvishavane', name: 'Zvishavane', province: 'Midlands', terminals: [{ id: 'zvi-main', cityId: 'zvishavane', name: 'Zvishavane Bus Terminus (Mandava)', address: 'Mandava, Zvishavane', isBoardingPoint: true, isDroppingPoint: true }] },
  { id: 'shurugwi', name: 'Shurugwi', province: 'Midlands', terminals: [{ id: 'shu-main', cityId: 'shurugwi', name: 'Shurugwi Main Rank', address: 'Chroma Rd, Shurugwi', isBoardingPoint: true, isDroppingPoint: true }] },
  { id: 'chiredzi', name: 'Chiredzi', province: 'Masvingo', terminals: [{ id: 'chr-main', cityId: 'chiredzi', name: 'Chiredzi Bus Rank', address: 'Tshovani, Chiredzi', isBoardingPoint: true, isDroppingPoint: true }] },
  { id: 'triangle', name: 'Triangle', province: 'Masvingo', terminals: [{ id: 'tri-main', cityId: 'triangle', name: 'Triangle Sugar Estates Stop', address: 'Triangle Commercial Centre', isBoardingPoint: true, isDroppingPoint: true }] },
  { id: 'beitbridge', name: 'Beitbridge', province: 'Matabeleland South', isPopular: true, terminals: [{ id: 'bei-border', cityId: 'beitbridge', name: 'Beitbridge Border Terminal & InterAfrica Yard', address: 'Dulivhadzimu Bus Terminus, Beitbridge', isBoardingPoint: true, isDroppingPoint: true }] },
  { id: 'gwanda', name: 'Gwanda', province: 'Matabeleland South', terminals: [{ id: 'gwa-main', cityId: 'gwanda', name: 'Gwanda Bus Rank', address: 'Beitbridge-Bulawayo Hwy, Gwanda', isBoardingPoint: true, isDroppingPoint: true }] },
  { id: 'plumtree', name: 'Plumtree', province: 'Matabeleland South', terminals: [{ id: 'plu-border', cityId: 'plumtree', name: 'Plumtree Border Rank', address: 'Main Border Rd, Plumtree', isBoardingPoint: true, isDroppingPoint: true }] },
  { id: 'victoria-falls', name: 'Victoria Falls', province: 'Matabeleland North', isPopular: true, terminals: [{ id: 'vic-chinotimba', cityId: 'victoria-falls', name: 'Chinotimba Bus Terminus & InterAfrica Office', address: 'Pioneers Way, Victoria Falls', isBoardingPoint: true, isDroppingPoint: true }] },
  { id: 'hwange', name: 'Hwange', province: 'Matabeleland North', terminals: [{ id: 'hwa-main', cityId: 'hwange', name: 'Hwange Town Rank (Empumalanga)', address: 'Empumalanga, Hwange', isBoardingPoint: true, isDroppingPoint: true }] },
  { id: 'kariba', name: 'Kariba', province: 'Mashonaland West', isPopular: true, terminals: [{ id: 'kar-nhedziwa', cityId: 'kariba', name: 'Kariba Mahombekombe Bus Rank', address: 'Mahombekombe, Kariba', isBoardingPoint: true, isDroppingPoint: true }] },
  { id: 'karoi', name: 'Karoi', province: 'Mashonaland West', terminals: [{ id: 'kri-main', cityId: 'karoi', name: 'Karoi Main Rank', address: 'Chirundu Highway, Karoi', isBoardingPoint: true, isDroppingPoint: true }] },
  { id: 'chipinge', name: 'Chipinge', province: 'Manicaland', terminals: [{ id: 'chp-main', cityId: 'chipinge', name: 'Chipinge Town Bus Rank', address: 'Main St, Chipinge', isBoardingPoint: true, isDroppingPoint: true }] },
  { id: 'nyanga', name: 'Nyanga', province: 'Manicaland', terminals: [{ id: 'nya-village', cityId: 'nyanga', name: 'Nyanga Village Bus Stop', address: 'Nyanga Main St', isBoardingPoint: true, isDroppingPoint: true }] },
  { id: 'chivhu', name: 'Chivhu', province: 'Mashonaland East', terminals: [{ id: 'chv-main', cityId: 'chivhu', name: 'Chivhu Rank (Enkeldoorn)', address: 'Harare-Masvingo Hwy, Chivhu', isBoardingPoint: true, isDroppingPoint: true }] },
  { id: 'mvuma', name: 'Mvuma', province: 'Midlands', terminals: [{ id: 'mvu-main', cityId: 'mvuma', name: 'Mvuma Junction Stop', address: 'Gweru Turnoff, Mvuma', isBoardingPoint: true, isDroppingPoint: true }] },
  { id: 'lupane', name: 'Lupane', province: 'Matabeleland North', terminals: [{ id: 'lup-centre', cityId: 'lupane', name: 'Lupane Centre Bus Stop', address: 'Vic Falls Hwy, Lupane', isBoardingPoint: true, isDroppingPoint: true }] },
  { id: 'binga', name: 'Binga', province: 'Matabeleland North', terminals: [{ id: 'bin-centre', cityId: 'binga', name: 'Binga Centre Rank', address: 'Lake Kariba View Rd, Binga', isBoardingPoint: true, isDroppingPoint: true }] },
  { id: 'tsholotsho', name: 'Tsholotsho', province: 'Matabeleland North', terminals: [{ id: 'tsh-main', cityId: 'tsholotsho', name: 'Tsholotsho Business Centre Rank', address: 'Main St, Tsholotsho', isBoardingPoint: true, isDroppingPoint: true }] },
  { id: 'filabusi', name: 'Filabusi', province: 'Matabeleland South', terminals: [{ id: 'fil-centre', cityId: 'filabusi', name: 'Filabusi Growth Point Rank', address: 'Filabusi Centre', isBoardingPoint: true, isDroppingPoint: true }] },
  { id: 'mount-darwin', name: 'Mount Darwin', province: 'Mashonaland Central', terminals: [{ id: 'mdr-rank', cityId: 'mount-darwin', name: 'Mount Darwin Rank', address: 'Hospital Rd, Mount Darwin', isBoardingPoint: true, isDroppingPoint: true }] },
  { id: 'murehwa', name: 'Murehwa', province: 'Mashonaland East', terminals: [{ id: 'mur-centre', cityId: 'murehwa', name: 'Murehwa Centre Bus Terminus', address: 'Mutoko Rd, Murehwa', isBoardingPoint: true, isDroppingPoint: true }] },
  { id: 'mutoko', name: 'Mutoko', province: 'Mashonaland East', terminals: [{ id: 'mtk-centre', cityId: 'mutoko', name: 'Mutoko Growth Point Rank', address: 'Nyamapanda Hwy, Mutoko', isBoardingPoint: true, isDroppingPoint: true }] },
  { id: 'macheke', name: 'Macheke', province: 'Mashonaland East', terminals: [{ id: 'mac-main', cityId: 'macheke', name: 'Macheke Layby', address: 'Harare-Mutare Rd, Macheke', isBoardingPoint: true, isDroppingPoint: true }] },
  { id: 'rutenga', name: 'Rutenga', province: 'Masvingo', terminals: [{ id: 'rut-growth', cityId: 'rutenga', name: 'Rutenga Growth Point', address: 'Beitbridge Hwy, Rutenga', isBoardingPoint: true, isDroppingPoint: true }] },
  { id: 'ngezi', name: 'Ngezi', province: 'Mashonaland West', terminals: [{ id: 'nge-mine', cityId: 'ngezi', name: 'Ngezi Mine Bus Stop', address: 'Zimplats Main Gate, Ngezi', isBoardingPoint: true, isDroppingPoint: true }] },
  { id: 'norton', name: 'Norton', province: 'Mashonaland West', terminals: [{ id: 'nor-katanga', cityId: 'norton', name: 'Katanga Bus Terminus, Norton', address: 'Katanga, Norton', isBoardingPoint: true, isDroppingPoint: true }] },
  { id: 'chitungwiza', name: 'Chitungwiza', province: 'Harare Metropolitan', terminals: [{ id: 'cht-makoni', cityId: 'chitungwiza', name: 'Makoni Shopping Centre Terminus', address: 'Seke Rd, Chitungwiza', isBoardingPoint: true, isDroppingPoint: true }] },
  { id: 'redcliff', name: 'Redcliff', province: 'Midlands', terminals: [{ id: 'red-centre', cityId: 'redcliff', name: 'Redcliff Town Centre Stop', address: 'Redcliff Main St', isBoardingPoint: true, isDroppingPoint: true }] },
  { id: 'esigodini', name: 'Esigodini', province: 'Matabeleland South', terminals: [{ id: 'esi-centre', cityId: 'esigodini', name: 'Esigodini Rank', address: 'Bulawayo-Beitbridge Hwy', isBoardingPoint: true, isDroppingPoint: true }] },
  { id: 'maphisa', name: 'Maphisa', province: 'Matabeleland South', terminals: [{ id: 'map-growth', cityId: 'maphisa', name: 'Maphisa Growth Point Rank', address: 'Maphisa Centre', isBoardingPoint: true, isDroppingPoint: true }] },
  { id: 'nkayi', name: 'Nkayi', province: 'Matabeleland North', terminals: [{ id: 'nka-centre', cityId: 'nkayi', name: 'Nkayi Centre Rank', address: 'Main St, Nkayi', isBoardingPoint: true, isDroppingPoint: true }] },
  { id: 'gokwe', name: 'Gokwe', province: 'Midlands', terminals: [{ id: 'gok-centre', cityId: 'gokwe', name: 'Gokwe Centre Bus Rank', address: 'Gokwe Growth Point', isBoardingPoint: true, isDroppingPoint: true }] },
  { id: 'juru', name: 'Juru', province: 'Mashonaland East', terminals: [{ id: 'jur-growth', cityId: 'juru', name: 'Juru Growth Point Stop', address: 'Mutoko Hwy, Juru', isBoardingPoint: true, isDroppingPoint: true }] },
  { id: 'buhera', name: 'Buhera', province: 'Manicaland', terminals: [{ id: 'buh-centre', cityId: 'buhera', name: 'Buhera Town Rank', address: 'Murambinda Growth Point', isBoardingPoint: true, isDroppingPoint: true }] },
  { id: 'birchenough-bridge', name: 'Birchenough Bridge', province: 'Manicaland', terminals: [{ id: 'bir-bridge', cityId: 'birchenough-bridge', name: 'Birchenough Bridge Rank', address: 'Save River Highway, Birchenough Bridge', isBoardingPoint: true, isDroppingPoint: true }] },
  { id: 'odzi', name: 'Odzi', province: 'Manicaland', terminals: [{ id: 'odz-station', cityId: 'odzi', name: 'Odzi Railway Crossing Rank', address: 'Mutare-Harare Rd, Odzi', isBoardingPoint: true, isDroppingPoint: true }] },
  { id: 'penhalonga', name: 'Penhalonga', province: 'Manicaland', terminals: [{ id: 'pen-centre', cityId: 'penhalonga', name: 'Penhalonga Mining Centre Stop', address: 'Old Mutare Rd, Penhalonga', isBoardingPoint: true, isDroppingPoint: true }] },
  { id: 'mount-selinda', name: 'Mount Selinda', province: 'Manicaland', terminals: [{ id: 'msl-mission', cityId: 'mount-selinda', name: 'Mount Selinda Mission Stop', address: 'Chirinda Forest Rd, Mount Selinda', isBoardingPoint: true, isDroppingPoint: true }] },
];

// Helper: 50-Seat Coach Layout generator matching the exact user image
// 11 rows of 2+2 (1 to 44) + 6 rear bench (45 to 50)
export function generateCoach50Seats(): CoachSeat[] {
  const seats: CoachSeat[] = [];
  let seatNum = 1;
  for (let row = 1; row <= 11; row++) {
    seats.push({ seatNumber: String(seatNum++), row, column: 'left-window', deck: 'lower' });
    seats.push({ seatNumber: String(seatNum++), row, column: 'left-aisle', deck: 'lower' });
    seats.push({ seatNumber: String(seatNum++), row, column: 'right-aisle', deck: 'lower' });
    seats.push({ seatNumber: String(seatNum++), row, column: 'right-window', deck: 'lower' });
  }
  // Rear row of 6 seats: 45, 46, 47, 48, 49, 50
  for (let i = 0; i < 6; i++) {
    seats.push({
      seatNumber: String(seatNum++),
      row: 12,
      column: 'rear',
      deck: 'lower',
      isRearBench: true,
    });
  }
  return seats;
}

export const COACH_50_SEATS = generateCoach50Seats();

// 2. CONFIRMED ACTIVE ROUTES (Clearly labelled as verified InterAfrica routes)
export const INITIAL_ROUTES: BusRoute[] = [
  {
    id: 'route-har-byo',
    originCityId: 'harare',
    originCityName: 'Harare',
    destinationCityId: 'bulawayo',
    destinationCityName: 'Bulawayo',
    distanceKm: 439,
    estimatedDuration: '5h 45m',
    departureTerminals: ['har-roadport', 'har-showground'],
    arrivalTerminals: ['byo-interafrica-depot', 'byo-renkini'],
    intermediateStops: ['Norton', 'Chegutu', 'Kadoma', 'Kwekwe', 'Gweru'],
    baseFareUsd: 18.00,
    busLevyUsd: 1.00,
    isLevyApplicable: true,
    isActive: true,
    operatingDays: [0, 1, 2, 3, 4, 5, 6],
    isSampleData: true,
  },
  {
    id: 'route-byo-har',
    originCityId: 'bulawayo',
    originCityName: 'Bulawayo',
    destinationCityId: 'harare',
    destinationCityName: 'Harare',
    distanceKm: 439,
    estimatedDuration: '5h 45m',
    departureTerminals: ['byo-interafrica-depot', 'byo-renkini'],
    arrivalTerminals: ['har-roadport', 'har-showground'],
    intermediateStops: ['Gweru', 'Kwekwe', 'Kadoma', 'Chegutu', 'Norton'],
    baseFareUsd: 18.00,
    busLevyUsd: 1.00,
    isLevyApplicable: true,
    isActive: true,
    operatingDays: [0, 1, 2, 3, 4, 5, 6],
    isSampleData: true,
  },
  {
    id: 'route-har-mut',
    originCityId: 'harare',
    originCityName: 'Harare',
    destinationCityId: 'mutare',
    destinationCityName: 'Mutare',
    distanceKm: 263,
    estimatedDuration: '3h 30m',
    departureTerminals: ['har-roadport'],
    arrivalTerminals: ['mut-interafrica-office', 'mut-main-terminal'],
    intermediateStops: ['Marondera', 'Macheke', 'Rusape', 'Nyazura', 'Odzi'],
    baseFareUsd: 12.00,
    busLevyUsd: 1.00,
    isLevyApplicable: true,
    isActive: true,
    operatingDays: [0, 1, 2, 3, 4, 5, 6],
    isSampleData: true,
  },
  {
    id: 'route-mut-har',
    originCityId: 'mutare',
    originCityName: 'Mutare',
    destinationCityId: 'harare',
    destinationCityName: 'Harare',
    distanceKm: 263,
    estimatedDuration: '3h 30m',
    departureTerminals: ['mut-interafrica-office', 'mut-main-terminal'],
    arrivalTerminals: ['har-roadport'],
    intermediateStops: ['Odzi', 'Nyazura', 'Rusape', 'Macheke', 'Marondera'],
    baseFareUsd: 12.00,
    busLevyUsd: 1.00,
    isLevyApplicable: true,
    isActive: true,
    operatingDays: [0, 1, 2, 3, 4, 5, 6],
    isSampleData: true,
  },
  {
    id: 'route-byo-vic',
    originCityId: 'bulawayo',
    originCityName: 'Bulawayo',
    destinationCityId: 'victoria-falls',
    destinationCityName: 'Victoria Falls',
    distanceKm: 438,
    estimatedDuration: '5h 30m',
    departureTerminals: ['byo-interafrica-depot'],
    arrivalTerminals: ['vic-chinotimba'],
    intermediateStops: ['Insuza', 'Lupane', 'Halfway', 'Hwange'],
    baseFareUsd: 20.00,
    busLevyUsd: 1.00,
    isLevyApplicable: true,
    isActive: true,
    operatingDays: [0, 1, 2, 3, 4, 5, 6],
    isSampleData: true,
  },
  {
    id: 'route-vic-byo',
    originCityId: 'victoria-falls',
    originCityName: 'Victoria Falls',
    destinationCityId: 'bulawayo',
    destinationCityName: 'Bulawayo',
    distanceKm: 438,
    estimatedDuration: '5h 30m',
    departureTerminals: ['vic-chinotimba'],
    arrivalTerminals: ['byo-interafrica-depot'],
    intermediateStops: ['Hwange', 'Halfway', 'Lupane', 'Insuza'],
    baseFareUsd: 20.00,
    busLevyUsd: 1.00,
    isLevyApplicable: true,
    isActive: true,
    operatingDays: [0, 1, 2, 3, 4, 5, 6],
    isSampleData: true,
  },
  {
    id: 'route-har-bei',
    originCityId: 'harare',
    originCityName: 'Harare',
    destinationCityId: 'beitbridge',
    destinationCityName: 'Beitbridge',
    distanceKm: 580,
    estimatedDuration: '7h 15m',
    departureTerminals: ['har-roadport', 'har-mbare'],
    arrivalTerminals: ['bei-border'],
    intermediateStops: ['Chivhu', 'Mvuma', 'Masvingo', 'Ngundu', 'Rutenga'],
    baseFareUsd: 25.00,
    busLevyUsd: 1.50,
    isLevyApplicable: true,
    isActive: true,
    operatingDays: [0, 1, 2, 3, 4, 5, 6],
    isSampleData: true,
  },
  {
    id: 'route-har-mas',
    originCityId: 'harare',
    originCityName: 'Harare',
    destinationCityId: 'masvingo',
    destinationCityName: 'Masvingo',
    distanceKm: 293,
    estimatedDuration: '3h 45m',
    departureTerminals: ['har-roadport'],
    arrivalTerminals: ['mas-mucheke', 'mas-exor'],
    intermediateStops: ['Beatrice', 'Chivhu', 'Mvuma'],
    baseFareUsd: 14.00,
    busLevyUsd: 1.00,
    isLevyApplicable: true,
    isActive: true,
    operatingDays: [0, 1, 2, 3, 4, 5, 6],
    isSampleData: true,
  },
];

// 3. ONBOARD SNACK & DRINK PRODUCTS (Company-approved Zimbabwean packaged snacks)
export const INITIAL_SNACK_PRODUCTS: SnackProduct[] = [
  {
    id: 'snk-chips-salt-vinegar',
    name: 'Bakers Inn Potato Crisps (Salt & Vinegar)',
    category: 'chips_and_snacks',
    packSize: '125g Large Pack',
    priceUsd: 1.50,
    stockQuantity: 45,
    maxQtyPerBooking: 6,
    isAvailable: true,
    fulfilmentMethod: 'boarding_point_collection',
  },
  {
    id: 'snk-chips-cheese-onion',
    name: 'Bakers Inn Potato Crisps (Cheese & Onion)',
    category: 'chips_and_snacks',
    packSize: '125g Large Pack',
    priceUsd: 1.50,
    stockQuantity: 50,
    maxQtyPerBooking: 6,
    isAvailable: true,
    fulfilmentMethod: 'boarding_point_collection',
  },
  {
    id: 'snk-peanuts-salted',
    name: 'Probrands Roasted & Salted Groundnuts',
    category: 'chips_and_snacks',
    packSize: '150g Foil Pouch',
    priceUsd: 1.00,
    stockQuantity: 60,
    maxQtyPerBooking: 8,
    isAvailable: true,
    fulfilmentMethod: 'boarding_point_collection',
  },
  {
    id: 'snk-biscuits-shortbread',
    name: 'Lobels Traditional Shortbread Cookies',
    category: 'chips_and_snacks',
    packSize: '200g Box',
    priceUsd: 1.25,
    stockQuantity: 35,
    maxQtyPerBooking: 5,
    isAvailable: true,
    fulfilmentMethod: 'boarding_point_collection',
  },
  {
    id: 'drk-mineral-water',
    name: 'Schweppes Natural Spring Still Mineral Water',
    category: 'drinks',
    packSize: '500ml Chilled Bottle',
    priceUsd: 1.00,
    stockQuantity: 80,
    maxQtyPerBooking: 10,
    isAvailable: true,
    fulfilmentMethod: 'boarding_point_collection',
  },
  {
    id: 'drk-coca-cola',
    name: 'Coca-Cola Classic (Ice Cold)',
    category: 'drinks',
    packSize: '500ml PET Bottle',
    priceUsd: 1.50,
    stockQuantity: 75,
    maxQtyPerBooking: 6,
    isAvailable: true,
    fulfilmentMethod: 'boarding_point_collection',
  },
  {
    id: 'drk-mazoe-crush',
    name: 'Mazoe Orange Crush Refreshment Bottle',
    category: 'drinks',
    packSize: '500ml Ready-to-Drink',
    priceUsd: 1.50,
    stockQuantity: 50,
    maxQtyPerBooking: 6,
    isAvailable: true,
    fulfilmentMethod: 'boarding_point_collection',
  },
  {
    id: 'drk-cascade-peach',
    name: 'Cascade Dairy Fruit Blend (Peach)',
    category: 'drinks',
    packSize: '400ml Chilled Pouch',
    priceUsd: 1.25,
    stockQuantity: 40,
    maxQtyPerBooking: 6,
    isAvailable: true,
    fulfilmentMethod: 'boarding_point_collection',
  },
];

// In-Memory Database Store Class with atomic operations and locking
class Store {
  cities: DestinationCity[] = [...ZIMBABWE_CITIES];
  routes: BusRoute[] = [...INITIAL_ROUTES];
  trips: ScheduledTrip[] = [];
  tripSeats: Map<string, Map<string, TripSeatState>> = new Map(); // tripId -> seatNumber -> state
  snackProducts: SnackProduct[] = [...INITIAL_SNACK_PRODUCTS];
  bookings: Map<string, BookingRecord> = new Map(); // pnr -> record
  notifications: NotificationLog[] = [];
  currency: CurrencyConfig = {
    usdToZigRate: 27.50,
    source: 'Reserve Bank of Zimbabwe Interbank Official Rate',
    lastUpdated: new Date().toISOString(),
    isRateActive: true,
  };
  sampleDataActive: boolean = true;

  constructor() {
    this.seedTripsForNextDays(7);
  }

  // Seed scheduled trips for routes across next N days
  seedTripsForNextDays(daysAhead: number) {
    const today = new Date();
    this.trips = [];
    this.tripSeats.clear();

    const departureTimes = [
      { time: '06:30', name: 'Morning Cruiser', type: 'Luxury Coach' as const, durationAdd: 0 },
      { time: '09:00', name: 'Express Shuttle', type: 'Semi-Luxury Express' as const, durationAdd: 0 },
      { time: '13:30', name: 'Afternoon Pioneer', type: 'Standard Intercity' as const, durationAdd: 15 },
      { time: '17:00', name: 'Sundowner Express', type: 'Luxury Coach' as const, durationAdd: 0 },
    ];

    for (let dayOffset = 0; dayOffset < daysAhead; dayOffset++) {
      const dateObj = new Date(today);
      dateObj.setDate(today.getDate() + dayOffset);
      const dateStr = dateObj.toISOString().split('T')[0];

      for (const route of this.routes) {
        if (!route.isActive) continue;

        departureTimes.forEach((dt, idx) => {
          const tripId = `trip-${route.id}-${dateStr}-${idx + 1}`;
          const busNumber = `IA-ZW-${100 + (idx * 23) + (dayOffset * 7)}`;
          
          // Boarding points from route terminals
          const originCity = this.cities.find((c) => c.id === route.originCityId);
          const destCity = this.cities.find((c) => c.id === route.destinationCityId);

          const boardingPoints = originCity?.terminals.map((t, i) => ({
            id: t.id,
            name: t.name,
            time: this.addMinutesToTime(dt.time, i * 15),
          })) || [];

          const arrivalTime = this.calculateArrivalTime(dt.time, route.estimatedDuration);
          const droppingPoints = destCity?.terminals.map((t, i) => ({
            id: t.id,
            name: t.name,
            time: this.addMinutesToTime(arrivalTime, i * 15),
          })) || [];

          const trip: ScheduledTrip = {
            id: tripId,
            routeId: route.id,
            busNumber,
            busName: `InterAfrica ${dt.name}`,
            busType: dt.type,
            departureDate: dateStr,
            departureTime: dt.time,
            arrivalTime,
            duration: route.estimatedDuration,
            totalSeats: 50,
            availableSeatsCount: 50,
            fareUsd: route.baseFareUsd,
            busLevyUsd: route.busLevyUsd,
            isLevyApplicable: route.isLevyApplicable,
            snackShopEnabled: true,
            amenities: {
              airConditioning: true,
              usbCharging: dt.type === 'Luxury Coach',
              onboardAudio: true,
              recliningSeats: true,
              overheadLuggage: true,
              readingLight: true,
              wifi: dt.type === 'Luxury Coach',
            },
            boardingPoints,
            droppingPoints,
            cancellationPolicy: {
              freeCancellationHours: 24,
              feePercentage: 15,
            },
            luggagePolicy: '1 personal item (up to 7kg) + 1 checked bag (up to 20kg) included free. Excess luggage billed at $1.50/kg.',
          };

          this.trips.push(trip);

          // Seed seat map
          const seatMap = new Map<string, TripSeatState>();
          for (const s of COACH_50_SEATS) {
            seatMap.set(s.seatNumber, {
              seatNumber: s.seatNumber,
              status: 'available',
            });
          }

          // Pre-book a couple of realistic seats for demonstration
          if (idx === 0) {
            seatMap.set('3', { seatNumber: '3', status: 'booked', bookedByPnr: 'IA-DEMO-01' });
            seatMap.set('4', { seatNumber: '4', status: 'booked', bookedByPnr: 'IA-DEMO-01' });
            seatMap.set('11', { seatNumber: '11', status: 'booked', bookedByPnr: 'IA-DEMO-02' });
            trip.availableSeatsCount = 47;
          }

          this.tripSeats.set(tripId, seatMap);
        });
      }
    }
  }

  addMinutesToTime(timeStr: string, minutesToAdd: number): string {
    const [hh, mm] = timeStr.split(':').map(Number);
    const date = new Date();
    date.setHours(hh, mm + minutesToAdd, 0, 0);
    return date.toTimeString().slice(0, 5);
  }

  calculateArrivalTime(startTime: string, durationStr: string): string {
    const [sH, sM] = startTime.split(':').map(Number);
    // Parse e.g. "5h 45m"
    let dH = 0;
    let dM = 0;
    const hMatch = durationStr.match(/(\d+)h/);
    const mMatch = durationStr.match(/(\d+)m/);
    if (hMatch) dH = parseInt(hMatch[1], 10);
    if (mMatch) dM = parseInt(mMatch[1], 10);

    const date = new Date();
    date.setHours(sH + dH, sM + dM, 0, 0);
    return date.toTimeString().slice(0, 5);
  }

  // Periodic hold cleanup: Expire holds older than heldExpiresAt
  reapExpiredHolds(): number {
    const now = Date.now();
    let reapedCount = 0;

    for (const [tripId, seatsMap] of this.tripSeats.entries()) {
      let releasedForTrip = 0;
      for (const [seatNum, seatState] of seatsMap.entries()) {
        if (seatState.status === 'held' && seatState.heldExpiresAt && seatState.heldExpiresAt <= now) {
          seatsMap.set(seatNum, {
            seatNumber: seatNum,
            status: 'available',
          });
          releasedForTrip++;
          reapedCount++;
        }
      }
      if (releasedForTrip > 0) {
        const trip = this.trips.find((t) => t.id === tripId);
        if (trip) {
          trip.availableSeatsCount = Array.from(seatsMap.values()).filter((s) => s.status === 'available').length;
        }
      }
    }
    return reapedCount;
  }

  // Atomic hold reservation for multiple seats on a trip
  holdSeats(
    tripId: string,
    seatNumbers: string[],
    sessionId: string,
    holdDurationMinutes: number = 10
  ): { success: boolean; error?: string; heldUntil?: number } {
    this.reapExpiredHolds();

    const trip = this.trips.find((t) => t.id === tripId);
    if (!trip) {
      return { success: false, error: 'Trip not found or no longer scheduled' };
    }

    let seatMap = this.tripSeats.get(tripId);
    if (!seatMap) {
      seatMap = new Map();
      this.tripSeats.set(tripId, seatMap);
    }

    // Step 1: Validate all requested seats are strictly available (or held by the SAME session)
    const now = Date.now();
    const expiresAt = now + holdDurationMinutes * 60 * 1000;

    for (const num of seatNumbers) {
      const current = seatMap.get(num);
      if (!current) {
        return { success: false, error: `Seat ${num} does not exist on this coach layout` };
      }
      if (current.status === 'booked') {
        return { success: false, error: `Seat ${num} is already booked by another passenger` };
      }
      if (current.status === 'held' && current.heldBySessionId !== sessionId) {
        if (current.heldExpiresAt && current.heldExpiresAt > now) {
          return { success: false, error: `Seat ${num} is currently held by another passenger. Please select another seat.` };
        }
      }
    }

    // Step 2: Atomic commit - mark all as held
    for (const num of seatNumbers) {
      seatMap.set(num, {
        seatNumber: num,
        status: 'held',
        heldBySessionId: sessionId,
        heldExpiresAt: expiresAt,
      });
    }

    // Update available count
    trip.availableSeatsCount = Array.from(seatMap.values()).filter((s) => s.status === 'available').length;

    return { success: true, heldUntil: expiresAt };
  }

  // Release seats held by session
  releaseHeldSeats(tripId: string, seatNumbers: string[], sessionId: string): boolean {
    const seatMap = this.tripSeats.get(tripId);
    if (!seatMap) return false;

    let modified = false;
    for (const num of seatNumbers) {
      const seat = seatMap.get(num);
      if (seat && seat.status === 'held' && seat.heldBySessionId === sessionId) {
        seatMap.set(num, {
          seatNumber: num,
          status: 'available',
        });
        modified = true;
      }
    }

    if (modified) {
      const trip = this.trips.find((t) => t.id === tripId);
      if (trip) {
        trip.availableSeatsCount = Array.from(seatMap.values()).filter((s) => s.status === 'available').length;
      }
    }

    return modified;
  }

  // Calculate pricing strictly on backend
  calculatePricing(
    tripId: string,
    seatCount: number,
    snackItems: { productId: string; quantity: number }[],
    couponCode?: string
  ): { success: boolean; pricing?: PricingBreakdown; error?: string } {
    const trip = this.trips.find((t) => t.id === tripId);
    if (!trip) {
      return { success: false, error: 'Invalid trip ID' };
    }

    if (seatCount <= 0) {
      return { success: false, error: 'Must select at least 1 passenger seat' };
    }

    const baseFarePerSeatUsd = trip.fareUsd;
    const ticketFaresSubtotalUsd = baseFarePerSeatUsd * seatCount;

    // Bus levy calculation: Only applies if route is marked isLevyApplicable
    const busLevyPerSeatUsd = trip.isLevyApplicable ? trip.busLevyUsd : 0;
    const busLevyTotalUsd = busLevyPerSeatUsd * seatCount;

    // Snacks subtotal validation against actual backend catalog & stock
    let snacksSubtotalUsd = 0;
    for (const item of snackItems) {
      const product = this.snackProducts.find((p) => p.id === item.productId);
      if (!product) {
        return { success: false, error: `Product ${item.productId} not found in catalog` };
      }
      if (!product.isAvailable) {
        return { success: false, error: `Item "${product.name}" is currently unavailable` };
      }
      if (item.quantity > product.stockQuantity) {
        return {
          success: false,
          error: `Insufficient stock for "${product.name}". Available: ${product.stockQuantity}, Requested: ${item.quantity}`,
        };
      }
      if (item.quantity > product.maxQtyPerBooking) {
        return {
          success: false,
          error: `Maximum allowed for "${product.name}" is ${product.maxQtyPerBooking} per booking`,
        };
      }
      snacksSubtotalUsd += product.priceUsd * item.quantity;
    }

    // Approved booking fees (e.g. $0 or gateway regulatory fee if any)
    const bookingFeeUsd = 0.00;

    // Discounts
    let discountUsd = 0;
    if (couponCode) {
      const cleanCode = couponCode.trim().toUpperCase();
      if (cleanCode === 'INTERAFRICA2026') {
        // 10% discount on ticket fares subtotal
        discountUsd = Number((ticketFaresSubtotalUsd * 0.10).toFixed(2));
      } else if (cleanCode === 'WELCOMEZW') {
        discountUsd = 2.00;
      }
    }

    const totalPayableUsd = Number(
      (ticketFaresSubtotalUsd + busLevyTotalUsd + snacksSubtotalUsd + bookingFeeUsd - discountUsd).toFixed(2)
    );

    // Optional ZiG calculation using configured rate
    const totalPayableZiG = Number(
      (totalPayableUsd * this.currency.usdToZigRate).toFixed(2)
    );

    const pricing: PricingBreakdown = {
      seatCount,
      baseFarePerSeatUsd,
      ticketFaresSubtotalUsd,
      busLevyPerSeatUsd,
      busLevyTotalUsd,
      snacksSubtotalUsd,
      bookingFeeUsd,
      discountUsd,
      totalPayableUsd,
      totalPayableZiG,
      zigExchangeRate: this.currency.usdToZigRate,
      zigRateSource: this.currency.source,
      zigRateTimestamp: this.currency.lastUpdated,
    };

    return { success: true, pricing };
  }

  // Create booking record with transactional seat & snack reservation
  createBooking(params: {
    tripId: string;
    sessionId: string;
    passengers: PassengerInfo[];
    snackItems: { productId: string; quantity: number }[];
    boardingPoint: string;
    droppingPoint: string;
    contactPhone: string;
    contactEmail?: string;
    couponCode?: string;
    paymentMethod: 'ecocash' | 'onemoney' | 'paynow' | 'innbucks' | 'card' | 'cash_at_office';
  }): { success: boolean; booking?: BookingRecord; error?: string } {
    this.reapExpiredHolds();

    const trip = this.trips.find((t) => t.id === params.tripId);
    if (!trip) return { success: false, error: 'Trip not found' };

    const route = this.routes.find((r) => r.id === trip.routeId);
    if (!route) return { success: false, error: 'Route not found' };

    const seatNumbers = params.passengers.map((p) => p.seatNumber);
    if (seatNumbers.length === 0) {
      return { success: false, error: 'At least one seat must be selected' };
    }

    const seatMap = this.tripSeats.get(params.tripId);
    if (!seatMap) return { success: false, error: 'Trip seat map unavailable' };

    // Verify all seats are either held by this session or currently available
    for (const num of seatNumbers) {
      const current = seatMap.get(num);
      if (!current) return { success: false, error: `Invalid seat ${num}` };
      if (current.status === 'booked') {
        return { success: false, error: `Seat ${num} has already been booked by another customer` };
      }
      if (current.status === 'held' && current.heldBySessionId !== params.sessionId) {
        return { success: false, error: `Seat ${num} is currently held by someone else` };
      }
    }

    // Verify snacks stock
    for (const item of params.snackItems) {
      const prod = this.snackProducts.find((p) => p.id === item.productId);
      if (!prod || prod.stockQuantity < item.quantity) {
        return { success: false, error: `Stock changed for snack "${prod?.name || item.productId}". Please review your cart.` };
      }
    }

    // Calculate verified backend pricing
    const pricingRes = this.calculatePricing(
      params.tripId,
      seatNumbers.length,
      params.snackItems,
      params.couponCode
    );
    if (!pricingRes.success || !pricingRes.pricing) {
      return { success: false, error: pricingRes.error || 'Pricing error' };
    }

    // Generate unique PNR
    const pnr = `IA-ZW-${Math.floor(100000 + Math.random() * 900000)}`;

    // Prepare booked snacks snapshot
    const bookedSnacks = params.snackItems.map((item) => {
      const prod = this.snackProducts.find((p) => p.id === item.productId)!;
      // Deduct stock atomically
      prod.stockQuantity -= item.quantity;
      return {
        productId: prod.id,
        productName: prod.name,
        packSize: prod.packSize,
        unitPriceUsd: prod.priceUsd,
        quantity: item.quantity,
        lineTotalUsd: Number((prod.priceUsd * item.quantity).toFixed(2)),
      };
    });

    // Mark seats as booked
    for (const num of seatNumbers) {
      seatMap.set(num, {
        seatNumber: num,
        status: 'booked',
        bookedByPnr: pnr,
      });
    }

    trip.availableSeatsCount = Array.from(seatMap.values()).filter((s) => s.status === 'available').length;

    const paymentStatus = params.paymentMethod === 'cash_at_office' ? 'cash_at_office' : 'paid';

    const booking: BookingRecord = {
      pnr,
      tripId: trip.id,
      routeId: route.id,
      originCityName: route.originCityName,
      destinationCityName: route.destinationCityName,
      departureDate: trip.departureDate,
      departureTime: trip.departureTime,
      arrivalTime: trip.arrivalTime,
      busName: trip.busName,
      busNumber: trip.busNumber,
      busType: trip.busType,
      boardingPoint: params.boardingPoint,
      droppingPoint: params.droppingPoint,
      passengers: params.passengers,
      selectedSeats: seatNumbers,
      snacks: bookedSnacks,
      pricing: pricingRes.pricing,
      contactPhone: params.contactPhone,
      contactEmail: params.contactEmail,
      status: 'confirmed',
      paymentStatus,
      paymentMethod: params.paymentMethod,
      paymentReference: `PAY-${pnr}-${Date.now().toString().slice(-4)}`,
      createdAt: new Date().toISOString(),
    };

    this.bookings.set(pnr, booking);

    // Record notification dispatch
    this.notifications.push({
      id: `notif-${Date.now()}-1`,
      pnr,
      channel: 'whatsapp',
      recipient: params.contactPhone,
      messageType: 'ticket',
      status: 'delivered',
      timestamp: new Date().toISOString(),
      content: `Your InterAfrica ticket ${pnr} for ${route.originCityName} to ${route.destinationCityName} on ${trip.departureDate} is confirmed. Seats: ${seatNumbers.join(', ')}.`,
    });

    return { success: true, booking };
  }

  // Mark passenger as boarded (Conductor scanner)
  boardPassenger(pnr: string, conductorId: string = 'COND-001'): { success: boolean; booking?: BookingRecord; error?: string } {
    const booking = this.bookings.get(pnr.trim().toUpperCase());
    if (!booking) {
      return { success: false, error: 'PNR not found in InterAfrica system' };
    }
    if (booking.status === 'cancelled') {
      return { success: false, error: 'This ticket was cancelled and is invalid for boarding' };
    }
    if (booking.paymentStatus === 'failed') {
      return { success: false, error: 'Ticket payment failed. Customer must pay before boarding.' };
    }

    booking.status = 'boarded';
    booking.boardedAt = new Date().toISOString();
    booking.boardedByConductorId = conductorId;

    return { success: true, booking };
  }

  // Cancel booking with refund slabs
  cancelBooking(pnr: string, reason?: string): { success: boolean; refundAmountUsd?: number; cancellationFeeUsd?: number; error?: string } {
    const booking = this.bookings.get(pnr.trim().toUpperCase());
    if (!booking) {
      return { success: false, error: 'Booking not found' };
    }
    if (booking.status === 'cancelled') {
      return { success: false, error: 'Booking is already cancelled' };
    }
    if (booking.status === 'boarded') {
      return { success: false, error: 'Cannot cancel a ticket that has already been boarded' };
    }

    // Release seats back to available
    const seatMap = this.tripSeats.get(booking.tripId);
    if (seatMap) {
      for (const seatNum of booking.selectedSeats) {
        const s = seatMap.get(seatNum);
        if (s && s.bookedByPnr === booking.pnr) {
          seatMap.set(seatNum, {
            seatNumber: seatNum,
            status: 'available',
          });
        }
      }
      const trip = this.trips.find((t) => t.id === booking.tripId);
      if (trip) {
        trip.availableSeatsCount = Array.from(seatMap.values()).filter((s) => s.status === 'available').length;
      }
    }

    // Restock snacks
    for (const snack of booking.snacks) {
      const prod = this.snackProducts.find((p) => p.id === snack.productId);
      if (prod) {
        prod.stockQuantity += snack.quantity;
      }
    }

    // Refund slab calculation:
    // If >24h before departure: 15% cancellation fee
    // If <24h: 30% fee
    // Snacks fully refunded if not consumed
    const feePercentage = 0.15;
    const fareTotal = booking.pricing.ticketFaresSubtotalUsd;
    const cancellationFeeUsd = Number((fareTotal * feePercentage).toFixed(2));
    const refundAmountUsd = Number((booking.pricing.totalPayableUsd - cancellationFeeUsd).toFixed(2));

    booking.status = 'cancelled';
    booking.notes = `Cancelled: ${reason || 'Customer requested'}. Refunded: $${refundAmountUsd}`;

    this.notifications.push({
      id: `notif-${Date.now()}-cancel`,
      pnr: booking.pnr,
      channel: 'whatsapp',
      recipient: booking.contactPhone,
      messageType: 'cancellation',
      status: 'delivered',
      timestamp: new Date().toISOString(),
      content: `Your InterAfrica booking ${booking.pnr} has been cancelled. Refund of $${refundAmountUsd} USD has been initiated to your original payment method.`,
    });

    return { success: true, refundAmountUsd, cancellationFeeUsd };
  }
}

export const db = new Store();
