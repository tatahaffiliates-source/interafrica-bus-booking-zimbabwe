# InterAfrica Zimbabwe Bus Booking Platform (redBus-Style System)

A full-stack intercity bus reservation platform engineered specifically for **InterAfrica Zimbabwe**.

## Features & Implementation Overview

### 1. Zimbabwe Destination Directory (45+ Towns)
- **Directory**: Comprehensive index of 45+ Zimbabwe cities, towns, and growth points (Harare, Bulawayo, Mutare, Gweru, Masvingo, Kwekwe, Kadoma, Chinhoyi, Marondera, Bindura, Rusape, Nyazura, Chegutu, Zvishavane, Shurugwi, Chiredzi, Triangle, Beitbridge, Gwanda, Plumtree, Victoria Falls, Hwange, Kariba, Karoi, Chipinge, Nyanga, Chivhu, Mvuma, Lupane, Binga, Tsholotsho, Filabusi, Mount Darwin, Murehwa, Mutoko, Macheke, Rutenga, Ngezi, Norton, Chitungwiza, Redcliff, Esigodini, Maphisa, Nkayi, Gokwe, Juru, Buhera, Birchenough Bridge, Odzi, Penhalonga, Mount Selinda).
- **Accuracy Guarantee**: The directory is distinct from the active routes list. Unverified routes return `"No scheduled service currently available"` and suggest verified alternative routes (e.g. Harare <-> Bulawayo, Bulawayo <-> Vic Falls).
- **Search & Autocomplete**: Fuzzy matching across city names, terminals (Roadport, Mbare Musika, Lobengula St Depot, Sakubva, Chinotimba, etc.) and provinces, with swap origin/destination and browser geolocation fallback.

### 2. 50-Seat Coach Layout (Faithful to Reference Floorplan)
- **Coach Exterior & Cab**: Front windshield with driver cab on the right and passenger entrance stairs on the front left.
- **Attendant Seating**: 2 attendant/crew seats positioned directly behind the front entrance.
- **2+2 Seating Rows**: 11 rows of 4 seats (Left: 1-2, 5-6, 9-10, 13-14, 17-18, 21-22, 25-26, 29-30, 33-34, 37-38, 41-42. Right: 3-4, 7-8, 11-12, 15-16, 19-20, 23-24, 27-28, 31-32, 35-36, 39-40, 43-44).
- **Rear Bench**: 6 seats across the back row (45, 46, 47, 48, 49, 50).
- **Aisle & Exits**: Central wooden-plank aisle with emergency exits clearly indicated on both flanks.
- **Real-Time Seat Holds**: In-memory atomic locking per trip with a 10-minute expiring countdown. Expired holds are automatically released to the available pool. Two passengers attempting to reserve the same seat simultaneously are handled cleanly.

### 3. Onboard Refreshments Shop & Cart
- **Categories**: Chips & Packaged Snacks (Bakers Inn potato crisps, Probrands roasted peanuts, Lobels shortbread cookies) and Cold Drinks (Schweppes spring water, Coca-Cola, Mazoe Orange Crush, Cascade peach fruit drink).
- **Stock Tracking**: Atomic backend stock subtraction with overselling prevention.
- **Isolated Cart**: Cart is strictly bound to the specific trip session and never leaks across journeys.
- **Skip Option**: Prominent "Skip Snacks & Continue" option allows passenger tickets to be purchased independently.

### 4. Pricing Engine & Bus Levy
- **Calculation Formula**: Total Payable = Ticket Fares + Bus Levy + Snacks Subtotal + Booking Fees - Discounts.
- **Separate Bus Levy**: Configurable statutory line item (e.g. $1.00 USD/seat), never double-counted.
- **Multi-Currency (USD & ZiG)**: Fares anchored in USD; optional ZiG equivalent calculated using the admin-configured exchange rate (default: 1 USD = 27.50 ZiG, showing official RBZ source and timestamp).

### 5. Pluggable Zimbabwe Payments
- **Supported Methods**: EcoCash (`*151#` push), OneMoney (`*111#`), Paynow, InnBucks, Zimswitch / Visa / Mastercard, and Cash at Office (with 2-hour hold expiry).
- **Strict Status Handling**: `paid`, `pending`, `failed`, or `cash_at_office`. A failed transaction never marks an order paid and automatically releases seats and stock.

### 6. Scannable Ticket & WhatsApp Handoff
- **PNR Reference**: Unique alphanumeric code (e.g., `IA-ZW-74921`).
- **QR Code**: High-resolution scannable QR code encoding PNR, bus registration, seats, and date.
- **WhatsApp Integration**: "Get your ticket on WhatsApp" button generates a direct `wa.me` message pre-filled with ticket details.
- **Conductor Scanner**: Station staff tool for scanning QR codes, checking passenger manifests, and marking passengers as boarded.

### 7. Automated Acceptance Tests
Run the automated test suite with:
```bash
npm test
```
Validates all 15 acceptance criteria:
1. Select an available seat.
2. Deselect a seat.
3. Booked seats cannot be selected.
4. Two users cannot reserve the same seat simultaneously.
5. Expired seat holds are released.
6. Cart supports multiple products and quantities.
7. Removing a product updates totals.
8. Customers can skip snacks entirely.
9. Snack stock cannot be oversold.
10. Levy applies only when applicable.
11. Totals combine tickets, levy, snacks and approved fees correctly.
12. USD correct; ZiG uses configured rate.
13. Receipt shows seats and snacks right.
14. Failed payment never creates a falsely paid order.
15. Full flow works on mobile and desktop.
Plus: Unverified routes return "No scheduled service currently available", snack carts are session-isolated, and bus levies are never double-counted.
