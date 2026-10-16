// server.ts
import express2 from "express";
import path from "path";
import { fileURLToPath } from "url";

// src/server/api.ts
import express from "express";
import QRCode from "qrcode";

// src/server/db.ts
var ZIMBABWE_CITIES = [
  {
    id: "harare",
    name: "Harare",
    province: "Harare Metropolitan",
    isPopular: true,
    terminals: [
      { id: "har-roadport", cityId: "harare", name: "Roadport International Terminal (Robert Mugabe Rd)", address: "Robert Mugabe Way & 5th St, Harare", isBoardingPoint: true, isDroppingPoint: true },
      { id: "har-mbare", cityId: "harare", name: "Mbare Musika Bus Terminus", address: "Ardbennie Rd, Mbare, Harare", isBoardingPoint: true, isDroppingPoint: true },
      { id: "har-showground", cityId: "harare", name: "Exhibition Park / Showgrounds Gate", address: "Samora Machel Ave W, Harare", isBoardingPoint: true, isDroppingPoint: true }
    ]
  },
  {
    id: "bulawayo",
    name: "Bulawayo",
    province: "Bulawayo Metropolitan",
    isPopular: true,
    terminals: [
      { id: "byo-interafrica-depot", cityId: "bulawayo", name: "InterAfrica Bulawayo City Depot (Lobengula St)", address: "Lobengula St & 3rd Ave, Bulawayo", isBoardingPoint: true, isDroppingPoint: true },
      { id: "byo-renkini", cityId: "bulawayo", name: "Renkini Bus Terminus", address: "6th Ave Ext, Bulawayo", isBoardingPoint: true, isDroppingPoint: true }
    ]
  },
  {
    id: "mutare",
    name: "Mutare",
    province: "Manicaland",
    isPopular: true,
    terminals: [
      { id: "mut-main-terminal", cityId: "mutare", name: "Mutare Main Bus Terminus (Sakubva)", address: "Sakubva, Mutare", isBoardingPoint: true, isDroppingPoint: true },
      { id: "mut-interafrica-office", cityId: "mutare", name: "InterAfrica Booking Office (Aerodrome Rd)", address: "Aerodrome Rd, Mutare CBD", isBoardingPoint: true, isDroppingPoint: true }
    ]
  },
  {
    id: "gweru",
    name: "Gweru",
    province: "Midlands",
    isPopular: true,
    terminals: [
      { id: "gwe-kudzanayi", cityId: "gweru", name: "Kudzanayi Long Distance Bus Terminus", address: "Lobengula Ave, Gweru", isBoardingPoint: true, isDroppingPoint: true }
    ]
  },
  {
    id: "masvingo",
    name: "Masvingo",
    province: "Masvingo",
    isPopular: true,
    terminals: [
      { id: "mas-mucheke", cityId: "masvingo", name: "Mucheke Bus Terminus", address: "Mucheke, Masvingo", isBoardingPoint: true, isDroppingPoint: true },
      { id: "mas-exor", cityId: "masvingo", name: "Exor Service Station Boarding Point", address: "Beitbridge Highway, Masvingo", isBoardingPoint: true, isDroppingPoint: true }
    ]
  },
  {
    id: "kwekwe",
    name: "Kwekwe",
    province: "Midlands",
    isPopular: true,
    terminals: [
      { id: "kwe-main", cityId: "kwekwe", name: "Kwekwe Rank & InterAfrica Office", address: "Robert Mugabe Way, Kwekwe", isBoardingPoint: true, isDroppingPoint: true }
    ]
  },
  {
    id: "kadoma",
    name: "Kadoma",
    province: "Mashonaland West",
    isPopular: true,
    terminals: [
      { id: "kad-main", cityId: "kadoma", name: "Kadoma Bus Terminus (Sam Levy / CBD)", address: "Harare-Bulawayo Hwy, Kadoma", isBoardingPoint: true, isDroppingPoint: true }
    ]
  },
  {
    id: "chinhoyi",
    name: "Chinhoyi",
    province: "Mashonaland West",
    isPopular: true,
    terminals: [
      { id: "chi-rank", cityId: "chinhoyi", name: "Chinhoyi Main Bus Terminus", address: "Magamba Way, Chinhoyi", isBoardingPoint: true, isDroppingPoint: true }
    ]
  },
  {
    id: "marondera",
    name: "Marondera",
    province: "Mashonaland East",
    isPopular: true,
    terminals: [
      { id: "mar-main", cityId: "marondera", name: "Marondera Flyover Boarding Rank", address: "Harare-Mutare Hwy, Marondera", isBoardingPoint: true, isDroppingPoint: true }
    ]
  },
  {
    id: "bindura",
    name: "Bindura",
    province: "Mashonaland Central",
    isPopular: true,
    terminals: [
      { id: "bin-rank", cityId: "bindura", name: "Bindura Town Bus Terminus", address: "Trojan Rd, Bindura", isBoardingPoint: true, isDroppingPoint: true }
    ]
  },
  { id: "rusape", name: "Rusape", province: "Manicaland", terminals: [{ id: "rus-main", cityId: "rusape", name: "Rusape Bus Rank", address: "Harare-Mutare Rd, Rusape", isBoardingPoint: true, isDroppingPoint: true }] },
  { id: "nyazura", name: "Nyazura", province: "Manicaland", terminals: [{ id: "nya-main", cityId: "nyazura", name: "Nyazura Stop", address: "Mutare Rd, Nyazura", isBoardingPoint: true, isDroppingPoint: true }] },
  { id: "chegutu", name: "Chegutu", province: "Mashonaland West", terminals: [{ id: "che-main", cityId: "chegutu", name: "Chegutu Bus Stop", address: "Bulawayo Rd, Chegutu", isBoardingPoint: true, isDroppingPoint: true }] },
  { id: "zvishavane", name: "Zvishavane", province: "Midlands", terminals: [{ id: "zvi-main", cityId: "zvishavane", name: "Zvishavane Bus Terminus (Mandava)", address: "Mandava, Zvishavane", isBoardingPoint: true, isDroppingPoint: true }] },
  { id: "shurugwi", name: "Shurugwi", province: "Midlands", terminals: [{ id: "shu-main", cityId: "shurugwi", name: "Shurugwi Main Rank", address: "Chroma Rd, Shurugwi", isBoardingPoint: true, isDroppingPoint: true }] },
  { id: "chiredzi", name: "Chiredzi", province: "Masvingo", terminals: [{ id: "chr-main", cityId: "chiredzi", name: "Chiredzi Bus Rank", address: "Tshovani, Chiredzi", isBoardingPoint: true, isDroppingPoint: true }] },
  { id: "triangle", name: "Triangle", province: "Masvingo", terminals: [{ id: "tri-main", cityId: "triangle", name: "Triangle Sugar Estates Stop", address: "Triangle Commercial Centre", isBoardingPoint: true, isDroppingPoint: true }] },
  { id: "beitbridge", name: "Beitbridge", province: "Matabeleland South", isPopular: true, terminals: [{ id: "bei-border", cityId: "beitbridge", name: "Beitbridge Border Terminal & InterAfrica Yard", address: "Dulivhadzimu Bus Terminus, Beitbridge", isBoardingPoint: true, isDroppingPoint: true }] },
  { id: "gwanda", name: "Gwanda", province: "Matabeleland South", terminals: [{ id: "gwa-main", cityId: "gwanda", name: "Gwanda Bus Rank", address: "Beitbridge-Bulawayo Hwy, Gwanda", isBoardingPoint: true, isDroppingPoint: true }] },
  { id: "plumtree", name: "Plumtree", province: "Matabeleland South", terminals: [{ id: "plu-border", cityId: "plumtree", name: "Plumtree Border Rank", address: "Main Border Rd, Plumtree", isBoardingPoint: true, isDroppingPoint: true }] },
  { id: "victoria-falls", name: "Victoria Falls", province: "Matabeleland North", isPopular: true, terminals: [{ id: "vic-chinotimba", cityId: "victoria-falls", name: "Chinotimba Bus Terminus & InterAfrica Office", address: "Pioneers Way, Victoria Falls", isBoardingPoint: true, isDroppingPoint: true }] },
  { id: "hwange", name: "Hwange", province: "Matabeleland North", terminals: [{ id: "hwa-main", cityId: "hwange", name: "Hwange Town Rank (Empumalanga)", address: "Empumalanga, Hwange", isBoardingPoint: true, isDroppingPoint: true }] },
  { id: "kariba", name: "Kariba", province: "Mashonaland West", isPopular: true, terminals: [{ id: "kar-nhedziwa", cityId: "kariba", name: "Kariba Mahombekombe Bus Rank", address: "Mahombekombe, Kariba", isBoardingPoint: true, isDroppingPoint: true }] },
  { id: "karoi", name: "Karoi", province: "Mashonaland West", terminals: [{ id: "kri-main", cityId: "karoi", name: "Karoi Main Rank", address: "Chirundu Highway, Karoi", isBoardingPoint: true, isDroppingPoint: true }] },
  { id: "chipinge", name: "Chipinge", province: "Manicaland", terminals: [{ id: "chp-main", cityId: "chipinge", name: "Chipinge Town Bus Rank", address: "Main St, Chipinge", isBoardingPoint: true, isDroppingPoint: true }] },
  { id: "nyanga", name: "Nyanga", province: "Manicaland", terminals: [{ id: "nya-village", cityId: "nyanga", name: "Nyanga Village Bus Stop", address: "Nyanga Main St", isBoardingPoint: true, isDroppingPoint: true }] },
  { id: "chivhu", name: "Chivhu", province: "Mashonaland East", terminals: [{ id: "chv-main", cityId: "chivhu", name: "Chivhu Rank (Enkeldoorn)", address: "Harare-Masvingo Hwy, Chivhu", isBoardingPoint: true, isDroppingPoint: true }] },
  { id: "mvuma", name: "Mvuma", province: "Midlands", terminals: [{ id: "mvu-main", cityId: "mvuma", name: "Mvuma Junction Stop", address: "Gweru Turnoff, Mvuma", isBoardingPoint: true, isDroppingPoint: true }] },
  { id: "lupane", name: "Lupane", province: "Matabeleland North", terminals: [{ id: "lup-centre", cityId: "lupane", name: "Lupane Centre Bus Stop", address: "Vic Falls Hwy, Lupane", isBoardingPoint: true, isDroppingPoint: true }] },
  { id: "binga", name: "Binga", province: "Matabeleland North", terminals: [{ id: "bin-centre", cityId: "binga", name: "Binga Centre Rank", address: "Lake Kariba View Rd, Binga", isBoardingPoint: true, isDroppingPoint: true }] },
  { id: "tsholotsho", name: "Tsholotsho", province: "Matabeleland North", terminals: [{ id: "tsh-main", cityId: "tsholotsho", name: "Tsholotsho Business Centre Rank", address: "Main St, Tsholotsho", isBoardingPoint: true, isDroppingPoint: true }] },
  { id: "filabusi", name: "Filabusi", province: "Matabeleland South", terminals: [{ id: "fil-centre", cityId: "filabusi", name: "Filabusi Growth Point Rank", address: "Filabusi Centre", isBoardingPoint: true, isDroppingPoint: true }] },
  { id: "mount-darwin", name: "Mount Darwin", province: "Mashonaland Central", terminals: [{ id: "mdr-rank", cityId: "mount-darwin", name: "Mount Darwin Rank", address: "Hospital Rd, Mount Darwin", isBoardingPoint: true, isDroppingPoint: true }] },
  { id: "murehwa", name: "Murehwa", province: "Mashonaland East", terminals: [{ id: "mur-centre", cityId: "murehwa", name: "Murehwa Centre Bus Terminus", address: "Mutoko Rd, Murehwa", isBoardingPoint: true, isDroppingPoint: true }] },
  { id: "mutoko", name: "Mutoko", province: "Mashonaland East", terminals: [{ id: "mtk-centre", cityId: "mutoko", name: "Mutoko Growth Point Rank", address: "Nyamapanda Hwy, Mutoko", isBoardingPoint: true, isDroppingPoint: true }] },
  { id: "macheke", name: "Macheke", province: "Mashonaland East", terminals: [{ id: "mac-main", cityId: "macheke", name: "Macheke Layby", address: "Harare-Mutare Rd, Macheke", isBoardingPoint: true, isDroppingPoint: true }] },
  { id: "rutenga", name: "Rutenga", province: "Masvingo", terminals: [{ id: "rut-growth", cityId: "rutenga", name: "Rutenga Growth Point", address: "Beitbridge Hwy, Rutenga", isBoardingPoint: true, isDroppingPoint: true }] },
  { id: "ngezi", name: "Ngezi", province: "Mashonaland West", terminals: [{ id: "nge-mine", cityId: "ngezi", name: "Ngezi Mine Bus Stop", address: "Zimplats Main Gate, Ngezi", isBoardingPoint: true, isDroppingPoint: true }] },
  { id: "norton", name: "Norton", province: "Mashonaland West", terminals: [{ id: "nor-katanga", cityId: "norton", name: "Katanga Bus Terminus, Norton", address: "Katanga, Norton", isBoardingPoint: true, isDroppingPoint: true }] },
  { id: "chitungwiza", name: "Chitungwiza", province: "Harare Metropolitan", terminals: [{ id: "cht-makoni", cityId: "chitungwiza", name: "Makoni Shopping Centre Terminus", address: "Seke Rd, Chitungwiza", isBoardingPoint: true, isDroppingPoint: true }] },
  { id: "redcliff", name: "Redcliff", province: "Midlands", terminals: [{ id: "red-centre", cityId: "redcliff", name: "Redcliff Town Centre Stop", address: "Redcliff Main St", isBoardingPoint: true, isDroppingPoint: true }] },
  { id: "esigodini", name: "Esigodini", province: "Matabeleland South", terminals: [{ id: "esi-centre", cityId: "esigodini", name: "Esigodini Rank", address: "Bulawayo-Beitbridge Hwy", isBoardingPoint: true, isDroppingPoint: true }] },
  { id: "maphisa", name: "Maphisa", province: "Matabeleland South", terminals: [{ id: "map-growth", cityId: "maphisa", name: "Maphisa Growth Point Rank", address: "Maphisa Centre", isBoardingPoint: true, isDroppingPoint: true }] },
  { id: "nkayi", name: "Nkayi", province: "Matabeleland North", terminals: [{ id: "nka-centre", cityId: "nkayi", name: "Nkayi Centre Rank", address: "Main St, Nkayi", isBoardingPoint: true, isDroppingPoint: true }] },
  { id: "gokwe", name: "Gokwe", province: "Midlands", terminals: [{ id: "gok-centre", cityId: "gokwe", name: "Gokwe Centre Bus Rank", address: "Gokwe Growth Point", isBoardingPoint: true, isDroppingPoint: true }] },
  { id: "juru", name: "Juru", province: "Mashonaland East", terminals: [{ id: "jur-growth", cityId: "juru", name: "Juru Growth Point Stop", address: "Mutoko Hwy, Juru", isBoardingPoint: true, isDroppingPoint: true }] },
  { id: "buhera", name: "Buhera", province: "Manicaland", terminals: [{ id: "buh-centre", cityId: "buhera", name: "Buhera Town Rank", address: "Murambinda Growth Point", isBoardingPoint: true, isDroppingPoint: true }] },
  { id: "birchenough-bridge", name: "Birchenough Bridge", province: "Manicaland", terminals: [{ id: "bir-bridge", cityId: "birchenough-bridge", name: "Birchenough Bridge Rank", address: "Save River Highway, Birchenough Bridge", isBoardingPoint: true, isDroppingPoint: true }] },
  { id: "odzi", name: "Odzi", province: "Manicaland", terminals: [{ id: "odz-station", cityId: "odzi", name: "Odzi Railway Crossing Rank", address: "Mutare-Harare Rd, Odzi", isBoardingPoint: true, isDroppingPoint: true }] },
  { id: "penhalonga", name: "Penhalonga", province: "Manicaland", terminals: [{ id: "pen-centre", cityId: "penhalonga", name: "Penhalonga Mining Centre Stop", address: "Old Mutare Rd, Penhalonga", isBoardingPoint: true, isDroppingPoint: true }] },
  { id: "mount-selinda", name: "Mount Selinda", province: "Manicaland", terminals: [{ id: "msl-mission", cityId: "mount-selinda", name: "Mount Selinda Mission Stop", address: "Chirinda Forest Rd, Mount Selinda", isBoardingPoint: true, isDroppingPoint: true }] }
];
function generateCoach50Seats() {
  const seats = [];
  let seatNum = 1;
  for (let row = 1; row <= 11; row++) {
    seats.push({ seatNumber: String(seatNum++), row, column: "left-window", deck: "lower" });
    seats.push({ seatNumber: String(seatNum++), row, column: "left-aisle", deck: "lower" });
    seats.push({ seatNumber: String(seatNum++), row, column: "right-aisle", deck: "lower" });
    seats.push({ seatNumber: String(seatNum++), row, column: "right-window", deck: "lower" });
  }
  for (let i = 0; i < 6; i++) {
    seats.push({
      seatNumber: String(seatNum++),
      row: 12,
      column: "rear",
      deck: "lower",
      isRearBench: true
    });
  }
  return seats;
}
var COACH_50_SEATS = generateCoach50Seats();
var INITIAL_ROUTES = [
  {
    id: "route-har-byo",
    originCityId: "harare",
    originCityName: "Harare",
    destinationCityId: "bulawayo",
    destinationCityName: "Bulawayo",
    distanceKm: 439,
    estimatedDuration: "5h 45m",
    departureTerminals: ["har-roadport", "har-showground"],
    arrivalTerminals: ["byo-interafrica-depot", "byo-renkini"],
    intermediateStops: ["Norton", "Chegutu", "Kadoma", "Kwekwe", "Gweru"],
    baseFareUsd: 18,
    busLevyUsd: 1,
    isLevyApplicable: true,
    isActive: true,
    operatingDays: [0, 1, 2, 3, 4, 5, 6],
    isSampleData: true
  },
  {
    id: "route-byo-har",
    originCityId: "bulawayo",
    originCityName: "Bulawayo",
    destinationCityId: "harare",
    destinationCityName: "Harare",
    distanceKm: 439,
    estimatedDuration: "5h 45m",
    departureTerminals: ["byo-interafrica-depot", "byo-renkini"],
    arrivalTerminals: ["har-roadport", "har-showground"],
    intermediateStops: ["Gweru", "Kwekwe", "Kadoma", "Chegutu", "Norton"],
    baseFareUsd: 18,
    busLevyUsd: 1,
    isLevyApplicable: true,
    isActive: true,
    operatingDays: [0, 1, 2, 3, 4, 5, 6],
    isSampleData: true
  },
  {
    id: "route-har-mut",
    originCityId: "harare",
    originCityName: "Harare",
    destinationCityId: "mutare",
    destinationCityName: "Mutare",
    distanceKm: 263,
    estimatedDuration: "3h 30m",
    departureTerminals: ["har-roadport"],
    arrivalTerminals: ["mut-interafrica-office", "mut-main-terminal"],
    intermediateStops: ["Marondera", "Macheke", "Rusape", "Nyazura", "Odzi"],
    baseFareUsd: 12,
    busLevyUsd: 1,
    isLevyApplicable: true,
    isActive: true,
    operatingDays: [0, 1, 2, 3, 4, 5, 6],
    isSampleData: true
  },
  {
    id: "route-mut-har",
    originCityId: "mutare",
    originCityName: "Mutare",
    destinationCityId: "harare",
    destinationCityName: "Harare",
    distanceKm: 263,
    estimatedDuration: "3h 30m",
    departureTerminals: ["mut-interafrica-office", "mut-main-terminal"],
    arrivalTerminals: ["har-roadport"],
    intermediateStops: ["Odzi", "Nyazura", "Rusape", "Macheke", "Marondera"],
    baseFareUsd: 12,
    busLevyUsd: 1,
    isLevyApplicable: true,
    isActive: true,
    operatingDays: [0, 1, 2, 3, 4, 5, 6],
    isSampleData: true
  },
  {
    id: "route-byo-vic",
    originCityId: "bulawayo",
    originCityName: "Bulawayo",
    destinationCityId: "victoria-falls",
    destinationCityName: "Victoria Falls",
    distanceKm: 438,
    estimatedDuration: "5h 30m",
    departureTerminals: ["byo-interafrica-depot"],
    arrivalTerminals: ["vic-chinotimba"],
    intermediateStops: ["Insuza", "Lupane", "Halfway", "Hwange"],
    baseFareUsd: 20,
    busLevyUsd: 1,
    isLevyApplicable: true,
    isActive: true,
    operatingDays: [0, 1, 2, 3, 4, 5, 6],
    isSampleData: true
  },
  {
    id: "route-vic-byo",
    originCityId: "victoria-falls",
    originCityName: "Victoria Falls",
    destinationCityId: "bulawayo",
    destinationCityName: "Bulawayo",
    distanceKm: 438,
    estimatedDuration: "5h 30m",
    departureTerminals: ["vic-chinotimba"],
    arrivalTerminals: ["byo-interafrica-depot"],
    intermediateStops: ["Hwange", "Halfway", "Lupane", "Insuza"],
    baseFareUsd: 20,
    busLevyUsd: 1,
    isLevyApplicable: true,
    isActive: true,
    operatingDays: [0, 1, 2, 3, 4, 5, 6],
    isSampleData: true
  },
  {
    id: "route-har-bei",
    originCityId: "harare",
    originCityName: "Harare",
    destinationCityId: "beitbridge",
    destinationCityName: "Beitbridge",
    distanceKm: 580,
    estimatedDuration: "7h 15m",
    departureTerminals: ["har-roadport", "har-mbare"],
    arrivalTerminals: ["bei-border"],
    intermediateStops: ["Chivhu", "Mvuma", "Masvingo", "Ngundu", "Rutenga"],
    baseFareUsd: 25,
    busLevyUsd: 1.5,
    isLevyApplicable: true,
    isActive: true,
    operatingDays: [0, 1, 2, 3, 4, 5, 6],
    isSampleData: true
  },
  {
    id: "route-har-mas",
    originCityId: "harare",
    originCityName: "Harare",
    destinationCityId: "masvingo",
    destinationCityName: "Masvingo",
    distanceKm: 293,
    estimatedDuration: "3h 45m",
    departureTerminals: ["har-roadport"],
    arrivalTerminals: ["mas-mucheke", "mas-exor"],
    intermediateStops: ["Beatrice", "Chivhu", "Mvuma"],
    baseFareUsd: 14,
    busLevyUsd: 1,
    isLevyApplicable: true,
    isActive: true,
    operatingDays: [0, 1, 2, 3, 4, 5, 6],
    isSampleData: true
  }
];
var INITIAL_SNACK_PRODUCTS = [
  {
    id: "snk-chips-salt-vinegar",
    name: "Bakers Inn Potato Crisps (Salt & Vinegar)",
    category: "chips_and_snacks",
    packSize: "125g Large Pack",
    priceUsd: 1.5,
    stockQuantity: 45,
    maxQtyPerBooking: 6,
    isAvailable: true,
    fulfilmentMethod: "boarding_point_collection"
  },
  {
    id: "snk-chips-cheese-onion",
    name: "Bakers Inn Potato Crisps (Cheese & Onion)",
    category: "chips_and_snacks",
    packSize: "125g Large Pack",
    priceUsd: 1.5,
    stockQuantity: 50,
    maxQtyPerBooking: 6,
    isAvailable: true,
    fulfilmentMethod: "boarding_point_collection"
  },
  {
    id: "snk-peanuts-salted",
    name: "Probrands Roasted & Salted Groundnuts",
    category: "chips_and_snacks",
    packSize: "150g Foil Pouch",
    priceUsd: 1,
    stockQuantity: 60,
    maxQtyPerBooking: 8,
    isAvailable: true,
    fulfilmentMethod: "boarding_point_collection"
  },
  {
    id: "snk-biscuits-shortbread",
    name: "Lobels Traditional Shortbread Cookies",
    category: "chips_and_snacks",
    packSize: "200g Box",
    priceUsd: 1.25,
    stockQuantity: 35,
    maxQtyPerBooking: 5,
    isAvailable: true,
    fulfilmentMethod: "boarding_point_collection"
  },
  {
    id: "drk-mineral-water",
    name: "Schweppes Natural Spring Still Mineral Water",
    category: "drinks",
    packSize: "500ml Chilled Bottle",
    priceUsd: 1,
    stockQuantity: 80,
    maxQtyPerBooking: 10,
    isAvailable: true,
    fulfilmentMethod: "boarding_point_collection"
  },
  {
    id: "drk-coca-cola",
    name: "Coca-Cola Classic (Ice Cold)",
    category: "drinks",
    packSize: "500ml PET Bottle",
    priceUsd: 1.5,
    stockQuantity: 75,
    maxQtyPerBooking: 6,
    isAvailable: true,
    fulfilmentMethod: "boarding_point_collection"
  },
  {
    id: "drk-mazoe-crush",
    name: "Mazoe Orange Crush Refreshment Bottle",
    category: "drinks",
    packSize: "500ml Ready-to-Drink",
    priceUsd: 1.5,
    stockQuantity: 50,
    maxQtyPerBooking: 6,
    isAvailable: true,
    fulfilmentMethod: "boarding_point_collection"
  },
  {
    id: "drk-cascade-peach",
    name: "Cascade Dairy Fruit Blend (Peach)",
    category: "drinks",
    packSize: "400ml Chilled Pouch",
    priceUsd: 1.25,
    stockQuantity: 40,
    maxQtyPerBooking: 6,
    isAvailable: true,
    fulfilmentMethod: "boarding_point_collection"
  }
];
var Store = class {
  constructor() {
    this.cities = [...ZIMBABWE_CITIES];
    this.routes = [...INITIAL_ROUTES];
    this.trips = [];
    this.tripSeats = /* @__PURE__ */ new Map();
    // tripId -> seatNumber -> state
    this.snackProducts = [...INITIAL_SNACK_PRODUCTS];
    this.bookings = /* @__PURE__ */ new Map();
    // pnr -> record
    this.notifications = [];
    this.currency = {
      usdToZigRate: 27.5,
      source: "Reserve Bank of Zimbabwe Interbank Official Rate",
      lastUpdated: (/* @__PURE__ */ new Date()).toISOString(),
      isRateActive: true
    };
    this.sampleDataActive = true;
    this.seedTripsForNextDays(7);
  }
  // Seed scheduled trips for routes across next N days
  seedTripsForNextDays(daysAhead) {
    const today = /* @__PURE__ */ new Date();
    this.trips = [];
    this.tripSeats.clear();
    const departureTimes = [
      { time: "06:30", name: "Morning Cruiser", type: "Luxury Coach", durationAdd: 0 },
      { time: "09:00", name: "Express Shuttle", type: "Semi-Luxury Express", durationAdd: 0 },
      { time: "13:30", name: "Afternoon Pioneer", type: "Standard Intercity", durationAdd: 15 },
      { time: "17:00", name: "Sundowner Express", type: "Luxury Coach", durationAdd: 0 }
    ];
    for (let dayOffset = 0; dayOffset < daysAhead; dayOffset++) {
      const dateObj = new Date(today);
      dateObj.setDate(today.getDate() + dayOffset);
      const dateStr = dateObj.toISOString().split("T")[0];
      for (const route of this.routes) {
        if (!route.isActive) continue;
        departureTimes.forEach((dt, idx) => {
          const tripId = `trip-${route.id}-${dateStr}-${idx + 1}`;
          const busNumber = `IA-ZW-${100 + idx * 23 + dayOffset * 7}`;
          const originCity = this.cities.find((c) => c.id === route.originCityId);
          const destCity = this.cities.find((c) => c.id === route.destinationCityId);
          const boardingPoints = originCity?.terminals.map((t, i) => ({
            id: t.id,
            name: t.name,
            time: this.addMinutesToTime(dt.time, i * 15)
          })) || [];
          const arrivalTime = this.calculateArrivalTime(dt.time, route.estimatedDuration);
          const droppingPoints = destCity?.terminals.map((t, i) => ({
            id: t.id,
            name: t.name,
            time: this.addMinutesToTime(arrivalTime, i * 15)
          })) || [];
          const trip = {
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
              usbCharging: dt.type === "Luxury Coach",
              onboardAudio: true,
              recliningSeats: true,
              overheadLuggage: true,
              readingLight: true,
              wifi: dt.type === "Luxury Coach"
            },
            boardingPoints,
            droppingPoints,
            cancellationPolicy: {
              freeCancellationHours: 24,
              feePercentage: 15
            },
            luggagePolicy: "1 personal item (up to 7kg) + 1 checked bag (up to 20kg) included free. Excess luggage billed at $1.50/kg."
          };
          this.trips.push(trip);
          const seatMap = /* @__PURE__ */ new Map();
          for (const s of COACH_50_SEATS) {
            seatMap.set(s.seatNumber, {
              seatNumber: s.seatNumber,
              status: "available"
            });
          }
          if (idx === 0) {
            seatMap.set("3", { seatNumber: "3", status: "booked", bookedByPnr: "IA-DEMO-01" });
            seatMap.set("4", { seatNumber: "4", status: "booked", bookedByPnr: "IA-DEMO-01" });
            seatMap.set("11", { seatNumber: "11", status: "booked", bookedByPnr: "IA-DEMO-02" });
            trip.availableSeatsCount = 47;
          }
          this.tripSeats.set(tripId, seatMap);
        });
      }
    }
  }
  addMinutesToTime(timeStr, minutesToAdd) {
    const [hh, mm] = timeStr.split(":").map(Number);
    const date = /* @__PURE__ */ new Date();
    date.setHours(hh, mm + minutesToAdd, 0, 0);
    return date.toTimeString().slice(0, 5);
  }
  calculateArrivalTime(startTime, durationStr) {
    const [sH, sM] = startTime.split(":").map(Number);
    let dH = 0;
    let dM = 0;
    const hMatch = durationStr.match(/(\d+)h/);
    const mMatch = durationStr.match(/(\d+)m/);
    if (hMatch) dH = parseInt(hMatch[1], 10);
    if (mMatch) dM = parseInt(mMatch[1], 10);
    const date = /* @__PURE__ */ new Date();
    date.setHours(sH + dH, sM + dM, 0, 0);
    return date.toTimeString().slice(0, 5);
  }
  // Periodic hold cleanup: Expire holds older than heldExpiresAt
  reapExpiredHolds() {
    const now = Date.now();
    let reapedCount = 0;
    for (const [tripId, seatsMap] of this.tripSeats.entries()) {
      let releasedForTrip = 0;
      for (const [seatNum, seatState] of seatsMap.entries()) {
        if (seatState.status === "held" && seatState.heldExpiresAt && seatState.heldExpiresAt <= now) {
          seatsMap.set(seatNum, {
            seatNumber: seatNum,
            status: "available"
          });
          releasedForTrip++;
          reapedCount++;
        }
      }
      if (releasedForTrip > 0) {
        const trip = this.trips.find((t) => t.id === tripId);
        if (trip) {
          trip.availableSeatsCount = Array.from(seatsMap.values()).filter((s) => s.status === "available").length;
        }
      }
    }
    return reapedCount;
  }
  // Atomic hold reservation for multiple seats on a trip
  holdSeats(tripId, seatNumbers, sessionId, holdDurationMinutes = 10) {
    this.reapExpiredHolds();
    const trip = this.trips.find((t) => t.id === tripId);
    if (!trip) {
      return { success: false, error: "Trip not found or no longer scheduled" };
    }
    let seatMap = this.tripSeats.get(tripId);
    if (!seatMap) {
      seatMap = /* @__PURE__ */ new Map();
      this.tripSeats.set(tripId, seatMap);
    }
    const now = Date.now();
    const expiresAt = now + holdDurationMinutes * 60 * 1e3;
    for (const num of seatNumbers) {
      const current = seatMap.get(num);
      if (!current) {
        return { success: false, error: `Seat ${num} does not exist on this coach layout` };
      }
      if (current.status === "booked") {
        return { success: false, error: `Seat ${num} is already booked by another passenger` };
      }
      if (current.status === "held" && current.heldBySessionId !== sessionId) {
        if (current.heldExpiresAt && current.heldExpiresAt > now) {
          return { success: false, error: `Seat ${num} is currently held by another passenger. Please select another seat.` };
        }
      }
    }
    for (const num of seatNumbers) {
      seatMap.set(num, {
        seatNumber: num,
        status: "held",
        heldBySessionId: sessionId,
        heldExpiresAt: expiresAt
      });
    }
    trip.availableSeatsCount = Array.from(seatMap.values()).filter((s) => s.status === "available").length;
    return { success: true, heldUntil: expiresAt };
  }
  // Release seats held by session
  releaseHeldSeats(tripId, seatNumbers, sessionId) {
    const seatMap = this.tripSeats.get(tripId);
    if (!seatMap) return false;
    let modified = false;
    for (const num of seatNumbers) {
      const seat = seatMap.get(num);
      if (seat && seat.status === "held" && seat.heldBySessionId === sessionId) {
        seatMap.set(num, {
          seatNumber: num,
          status: "available"
        });
        modified = true;
      }
    }
    if (modified) {
      const trip = this.trips.find((t) => t.id === tripId);
      if (trip) {
        trip.availableSeatsCount = Array.from(seatMap.values()).filter((s) => s.status === "available").length;
      }
    }
    return modified;
  }
  // Calculate pricing strictly on backend
  calculatePricing(tripId, seatCount, snackItems, couponCode) {
    const trip = this.trips.find((t) => t.id === tripId);
    if (!trip) {
      return { success: false, error: "Invalid trip ID" };
    }
    if (seatCount <= 0) {
      return { success: false, error: "Must select at least 1 passenger seat" };
    }
    const baseFarePerSeatUsd = trip.fareUsd;
    const ticketFaresSubtotalUsd = baseFarePerSeatUsd * seatCount;
    const busLevyPerSeatUsd = trip.isLevyApplicable ? trip.busLevyUsd : 0;
    const busLevyTotalUsd = busLevyPerSeatUsd * seatCount;
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
          error: `Insufficient stock for "${product.name}". Available: ${product.stockQuantity}, Requested: ${item.quantity}`
        };
      }
      if (item.quantity > product.maxQtyPerBooking) {
        return {
          success: false,
          error: `Maximum allowed for "${product.name}" is ${product.maxQtyPerBooking} per booking`
        };
      }
      snacksSubtotalUsd += product.priceUsd * item.quantity;
    }
    const bookingFeeUsd = 0;
    let discountUsd = 0;
    if (couponCode) {
      const cleanCode = couponCode.trim().toUpperCase();
      if (cleanCode === "INTERAFRICA2026") {
        discountUsd = Number((ticketFaresSubtotalUsd * 0.1).toFixed(2));
      } else if (cleanCode === "WELCOMEZW") {
        discountUsd = 2;
      }
    }
    const totalPayableUsd = Number(
      (ticketFaresSubtotalUsd + busLevyTotalUsd + snacksSubtotalUsd + bookingFeeUsd - discountUsd).toFixed(2)
    );
    const totalPayableZiG = Number(
      (totalPayableUsd * this.currency.usdToZigRate).toFixed(2)
    );
    const pricing = {
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
      zigRateTimestamp: this.currency.lastUpdated
    };
    return { success: true, pricing };
  }
  // Create booking record with transactional seat & snack reservation
  createBooking(params) {
    this.reapExpiredHolds();
    const trip = this.trips.find((t) => t.id === params.tripId);
    if (!trip) return { success: false, error: "Trip not found" };
    const route = this.routes.find((r) => r.id === trip.routeId);
    if (!route) return { success: false, error: "Route not found" };
    const seatNumbers = params.passengers.map((p) => p.seatNumber);
    if (seatNumbers.length === 0) {
      return { success: false, error: "At least one seat must be selected" };
    }
    const seatMap = this.tripSeats.get(params.tripId);
    if (!seatMap) return { success: false, error: "Trip seat map unavailable" };
    for (const num of seatNumbers) {
      const current = seatMap.get(num);
      if (!current) return { success: false, error: `Invalid seat ${num}` };
      if (current.status === "booked") {
        return { success: false, error: `Seat ${num} has already been booked by another customer` };
      }
      if (current.status === "held" && current.heldBySessionId !== params.sessionId) {
        return { success: false, error: `Seat ${num} is currently held by someone else` };
      }
    }
    for (const item of params.snackItems) {
      const prod = this.snackProducts.find((p) => p.id === item.productId);
      if (!prod || prod.stockQuantity < item.quantity) {
        return { success: false, error: `Stock changed for snack "${prod?.name || item.productId}". Please review your cart.` };
      }
    }
    const pricingRes = this.calculatePricing(
      params.tripId,
      seatNumbers.length,
      params.snackItems,
      params.couponCode
    );
    if (!pricingRes.success || !pricingRes.pricing) {
      return { success: false, error: pricingRes.error || "Pricing error" };
    }
    const pnr = `IA-ZW-${Math.floor(1e5 + Math.random() * 9e5)}`;
    const bookedSnacks = params.snackItems.map((item) => {
      const prod = this.snackProducts.find((p) => p.id === item.productId);
      prod.stockQuantity -= item.quantity;
      return {
        productId: prod.id,
        productName: prod.name,
        packSize: prod.packSize,
        unitPriceUsd: prod.priceUsd,
        quantity: item.quantity,
        lineTotalUsd: Number((prod.priceUsd * item.quantity).toFixed(2))
      };
    });
    for (const num of seatNumbers) {
      seatMap.set(num, {
        seatNumber: num,
        status: "booked",
        bookedByPnr: pnr
      });
    }
    trip.availableSeatsCount = Array.from(seatMap.values()).filter((s) => s.status === "available").length;
    const paymentStatus = params.paymentMethod === "cash_at_office" ? "cash_at_office" : "paid";
    const booking = {
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
      status: "confirmed",
      paymentStatus,
      paymentMethod: params.paymentMethod,
      paymentReference: `PAY-${pnr}-${Date.now().toString().slice(-4)}`,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    this.bookings.set(pnr, booking);
    this.notifications.push({
      id: `notif-${Date.now()}-1`,
      pnr,
      channel: "whatsapp",
      recipient: params.contactPhone,
      messageType: "ticket",
      status: "delivered",
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      content: `Your InterAfrica ticket ${pnr} for ${route.originCityName} to ${route.destinationCityName} on ${trip.departureDate} is confirmed. Seats: ${seatNumbers.join(", ")}.`
    });
    return { success: true, booking };
  }
  // Mark passenger as boarded (Conductor scanner)
  boardPassenger(pnr, conductorId = "COND-001") {
    const booking = this.bookings.get(pnr.trim().toUpperCase());
    if (!booking) {
      return { success: false, error: "PNR not found in InterAfrica system" };
    }
    if (booking.status === "cancelled") {
      return { success: false, error: "This ticket was cancelled and is invalid for boarding" };
    }
    if (booking.paymentStatus === "failed") {
      return { success: false, error: "Ticket payment failed. Customer must pay before boarding." };
    }
    booking.status = "boarded";
    booking.boardedAt = (/* @__PURE__ */ new Date()).toISOString();
    booking.boardedByConductorId = conductorId;
    return { success: true, booking };
  }
  // Cancel booking with refund slabs
  cancelBooking(pnr, reason) {
    const booking = this.bookings.get(pnr.trim().toUpperCase());
    if (!booking) {
      return { success: false, error: "Booking not found" };
    }
    if (booking.status === "cancelled") {
      return { success: false, error: "Booking is already cancelled" };
    }
    if (booking.status === "boarded") {
      return { success: false, error: "Cannot cancel a ticket that has already been boarded" };
    }
    const seatMap = this.tripSeats.get(booking.tripId);
    if (seatMap) {
      for (const seatNum of booking.selectedSeats) {
        const s = seatMap.get(seatNum);
        if (s && s.bookedByPnr === booking.pnr) {
          seatMap.set(seatNum, {
            seatNumber: seatNum,
            status: "available"
          });
        }
      }
      const trip = this.trips.find((t) => t.id === booking.tripId);
      if (trip) {
        trip.availableSeatsCount = Array.from(seatMap.values()).filter((s) => s.status === "available").length;
      }
    }
    for (const snack of booking.snacks) {
      const prod = this.snackProducts.find((p) => p.id === snack.productId);
      if (prod) {
        prod.stockQuantity += snack.quantity;
      }
    }
    const feePercentage = 0.15;
    const fareTotal = booking.pricing.ticketFaresSubtotalUsd;
    const cancellationFeeUsd = Number((fareTotal * feePercentage).toFixed(2));
    const refundAmountUsd = Number((booking.pricing.totalPayableUsd - cancellationFeeUsd).toFixed(2));
    booking.status = "cancelled";
    booking.notes = `Cancelled: ${reason || "Customer requested"}. Refunded: $${refundAmountUsd}`;
    this.notifications.push({
      id: `notif-${Date.now()}-cancel`,
      pnr: booking.pnr,
      channel: "whatsapp",
      recipient: booking.contactPhone,
      messageType: "cancellation",
      status: "delivered",
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      content: `Your InterAfrica booking ${booking.pnr} has been cancelled. Refund of $${refundAmountUsd} USD has been initiated to your original payment method.`
    });
    return { success: true, refundAmountUsd, cancellationFeeUsd };
  }
};
var db = new Store();

// src/server/api.ts
var apiRouter = express.Router();
apiRouter.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    system: "InterAfrica Bus Booking Zimbabwe",
    market: "Zimbabwe (ZWL/ZiG, USD)",
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  });
});
apiRouter.get("/cities", (req, res) => {
  const query = (req.query.q || "").toLowerCase().trim();
  if (!query) {
    return res.json({ cities: db.cities });
  }
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
apiRouter.get("/currency", (_req, res) => {
  res.json({ currency: db.currency });
});
apiRouter.post("/currency", (req, res) => {
  const { rate, source } = req.body;
  if (!rate || isNaN(Number(rate)) || Number(rate) <= 0) {
    return res.status(400).json({ error: "Valid positive exchange rate is required" });
  }
  db.currency.usdToZigRate = Number(rate);
  db.currency.source = source || db.currency.source;
  db.currency.lastUpdated = (/* @__PURE__ */ new Date()).toISOString();
  return res.json({ success: true, currency: db.currency });
});
apiRouter.get("/trips/search", (req, res) => {
  const origin = (req.query.origin || "").toLowerCase().trim();
  const destination = (req.query.destination || "").toLowerCase().trim();
  const date = (req.query.date || "").trim();
  if (!origin || !destination) {
    return res.status(400).json({ error: "Origin and destination are required" });
  }
  const activeRoute = db.routes.find((r) => {
    const matchOrigin = r.originCityId.toLowerCase() === origin || r.originCityName.toLowerCase() === origin;
    const matchDest = r.destinationCityId.toLowerCase() === destination || r.destinationCityName.toLowerCase() === destination;
    return matchOrigin && matchDest && r.isActive;
  });
  if (!activeRoute) {
    const isOriginInZim = db.cities.some((c) => c.id === origin || c.name.toLowerCase() === origin);
    const isDestInZim = db.cities.some((c) => c.id === destination || c.name.toLowerCase() === destination);
    const alternatives = [
      { from: "Harare", to: "Bulawayo", sampleFare: 18 },
      { from: "Harare", to: "Mutare", sampleFare: 12 },
      { from: "Bulawayo", to: "Victoria Falls", sampleFare: 20 },
      { from: "Harare", to: "Beitbridge", sampleFare: 25 }
    ];
    return res.json({
      hasService: false,
      message: "No scheduled service currently available for this route.",
      isOriginVerifiedInDirectory: isOriginInZim,
      isDestinationVerifiedInDirectory: isDestInZim,
      trips: [],
      suggestedRoutes: alternatives
    });
  }
  db.reapExpiredHolds();
  let matchingTrips = db.trips.filter((t) => t.routeId === activeRoute.id);
  if (date) {
    matchingTrips = matchingTrips.filter((t) => t.departureDate === date);
  }
  return res.json({
    hasService: true,
    route: activeRoute,
    trips: matchingTrips,
    currency: db.currency
  });
});
apiRouter.get("/trips/:tripId/seats", (req, res) => {
  const { tripId } = req.params;
  db.reapExpiredHolds();
  const trip = db.trips.find((t) => t.id === tripId);
  if (!trip) {
    return res.status(404).json({ error: "Trip not found" });
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
    currency: db.currency
  });
});
apiRouter.post("/trips/:tripId/hold", (req, res) => {
  const { tripId } = req.params;
  const { seatNumbers, sessionId } = req.body;
  if (!sessionId) {
    return res.status(400).json({ error: "Client session ID is required" });
  }
  if (!Array.isArray(seatNumbers) || seatNumbers.length === 0) {
    return res.status(400).json({ error: "Must specify at least one seat number" });
  }
  const result = db.holdSeats(tripId, seatNumbers, sessionId, 10);
  if (!result.success) {
    return res.status(409).json({ error: result.error });
  }
  res.json({
    success: true,
    heldUntil: result.heldUntil,
    message: `Seats ${seatNumbers.join(", ")} successfully reserved for 10 minutes.`
  });
});
apiRouter.post("/trips/:tripId/release", (req, res) => {
  const { tripId } = req.params;
  const { seatNumbers, sessionId } = req.body;
  if (!sessionId || !Array.isArray(seatNumbers)) {
    return res.status(400).json({ error: "Invalid request" });
  }
  const released = db.releaseHeldSeats(tripId, seatNumbers, sessionId);
  res.json({ success: released });
});
apiRouter.get("/snacks", (_req, res) => {
  res.json({
    snacks: db.snackProducts,
    currency: db.currency
  });
});
apiRouter.post("/pricing/calculate", (req, res) => {
  const { tripId, seatCount, snackItems, couponCode } = req.body;
  if (!tripId) {
    return res.status(400).json({ error: "Trip ID is required" });
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
    pricing: result.pricing
  });
});
apiRouter.post("/bookings", async (req, res) => {
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
    paymentMethod
  } = req.body;
  if (!tripId || !sessionId || !Array.isArray(passengers) || passengers.length === 0) {
    return res.status(400).json({ error: "Trip, session, and passengers are required" });
  }
  if (!boardingPoint || !droppingPoint || !contactPhone) {
    return res.status(400).json({ error: "Boarding point, dropping point, and contact phone are required" });
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
    paymentMethod: paymentMethod || "ecocash"
  });
  if (!result.success || !result.booking) {
    return res.status(400).json({ error: result.error || "Failed to complete booking" });
  }
  try {
    const qrPayload = JSON.stringify({
      pnr: result.booking.pnr,
      bus: result.booking.busNumber,
      seats: result.booking.selectedSeats,
      date: result.booking.departureDate,
      passengers: result.booking.passengers.map((p) => p.fullName)
    });
    const qrCodeDataUrl = await QRCode.toDataURL(qrPayload, {
      errorCorrectionLevel: "H",
      margin: 2,
      width: 256,
      color: {
        dark: "#1e3a8a",
        light: "#ffffff"
      }
    });
    return res.status(201).json({
      success: true,
      booking: result.booking,
      qrCodeDataUrl
    });
  } catch (err) {
    return res.status(201).json({
      success: true,
      booking: result.booking,
      qrCodeDataUrl: ""
    });
  }
});
apiRouter.get("/bookings/:pnr", async (req, res) => {
  const pnr = req.params.pnr.trim().toUpperCase();
  const phone = (req.query.phone || "").trim();
  const booking = db.bookings.get(pnr);
  if (!booking) {
    return res.status(404).json({ error: "Booking reference (PNR) not found" });
  }
  if (phone && booking.contactPhone.replace(/\D/g, "") !== phone.replace(/\D/g, "")) {
    return res.status(403).json({ error: "Phone number does not match this booking record" });
  }
  let qrCodeDataUrl = "";
  try {
    const qrPayload = JSON.stringify({
      pnr: booking.pnr,
      bus: booking.busNumber,
      seats: booking.selectedSeats,
      date: booking.departureDate
    });
    qrCodeDataUrl = await QRCode.toDataURL(qrPayload, { width: 256 });
  } catch (e) {
  }
  res.json({
    booking,
    qrCodeDataUrl
  });
});
apiRouter.post("/bookings/:pnr/cancel", (req, res) => {
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
    message: `Booking ${pnr} cancelled successfully. Refund of $${result.refundAmountUsd} USD processed.`
  });
});
apiRouter.post("/bookings/:pnr/board", (req, res) => {
  const pnr = req.params.pnr.trim().toUpperCase();
  const { conductorId } = req.body;
  const result = db.boardPassenger(pnr, conductorId || "CONDUCTOR-HARARE-01");
  if (!result.success) {
    return res.status(400).json({ error: result.error });
  }
  res.json({
    success: true,
    booking: result.booking,
    message: `Passenger for PNR ${pnr} successfully marked as BOARDED.`
  });
});
apiRouter.get("/notifications", (req, res) => {
  const pnr = req.query.pnr;
  if (pnr) {
    const filtered = db.notifications.filter((n) => n.pnr === pnr.toUpperCase());
    return res.json({ notifications: filtered });
  }
  return res.json({ notifications: db.notifications });
});
apiRouter.get("/admin/routes", (_req, res) => {
  res.json({ routes: db.routes });
});
apiRouter.post("/admin/routes", (req, res) => {
  const newRoute = req.body;
  if (!newRoute.originCityName || !newRoute.destinationCityName || !newRoute.baseFareUsd) {
    return res.status(400).json({ error: "Missing required route fields" });
  }
  const id = `route-${Date.now()}`;
  const route = { ...newRoute, id, isActive: true };
  db.routes.push(route);
  res.status(201).json({ success: true, route });
});
apiRouter.put("/admin/routes/:id", (req, res) => {
  const { id } = req.params;
  const idx = db.routes.findIndex((r) => r.id === id);
  if (idx === -1) return res.status(404).json({ error: "Route not found" });
  db.routes[idx] = { ...db.routes[idx], ...req.body };
  res.json({ success: true, route: db.routes[idx] });
});
apiRouter.put("/admin/snacks/:id", (req, res) => {
  const { id } = req.params;
  const prod = db.snackProducts.find((p) => p.id === id);
  if (!prod) return res.status(404).json({ error: "Snack not found" });
  Object.assign(prod, req.body);
  res.json({ success: true, product: prod });
});
apiRouter.get("/admin/reports", (_req, res) => {
  const allBookings = Array.from(db.bookings.values());
  const confirmed = allBookings.filter((b) => b.status === "confirmed" || b.status === "boarded");
  const totalRevenueUsd = confirmed.reduce((sum, b) => sum + b.pricing.totalPayableUsd, 0);
  const ticketRevenueUsd = confirmed.reduce((sum, b) => sum + b.pricing.ticketFaresSubtotalUsd, 0);
  const busLevyRevenueUsd = confirmed.reduce((sum, b) => sum + b.pricing.busLevyTotalUsd, 0);
  const snackRevenueUsd = confirmed.reduce((sum, b) => sum + b.pricing.snacksSubtotalUsd, 0);
  const totalSeatsSold = confirmed.reduce((sum, b) => sum + b.selectedSeats.length, 0);
  const cancelledCount = allBookings.filter((b) => b.status === "cancelled").length;
  res.json({
    metrics: {
      totalBookings: allBookings.length,
      confirmedBookings: confirmed.length,
      cancelledBookings: cancelledCount,
      totalSeatsSold,
      totalRevenueUsd: Number(totalRevenueUsd.toFixed(2)),
      ticketRevenueUsd: Number(ticketRevenueUsd.toFixed(2)),
      busLevyRevenueUsd: Number(busLevyRevenueUsd.toFixed(2)),
      snackRevenueUsd: Number(snackRevenueUsd.toFixed(2))
    },
    recentBookings: allBookings.slice(-20).reverse()
  });
});

// server.ts
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);
async function startServer() {
  const app = express2();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3e3;
  const isProd = process.env.NODE_ENV === "production";
  app.use(express2.json());
  app.use("/api", apiRouter);
  if (!isProd) {
    const { createServer } = await import("vite");
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, "dist");
    app.use(express2.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.resolve(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[InterAfrica Zimbabwe] Server running on http://0.0.0.0:${PORT}`);
  });
}
startServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
