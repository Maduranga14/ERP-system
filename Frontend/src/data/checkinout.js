/**
 * Mock data for Check-In / Check-Out module
 * Hotel Grande ERP System
 */

/* ── Today's Arrivals (status = Confirmed / Pending) ─────────────── */
export const TODAYS_ARRIVALS = [
  {
    id: 'RES-1001',
    guest: { name: 'John Doe',        initials: 'JD', phone: '+1 555-0101', email: 'j.doe@email.com',         nationalId: 'ID-112233', emergencyContact: 'Jane Doe — +1 555-0102' },
    room:  { number: '402', type: 'Deluxe Sea View Suite', floor: 4, status: 'Available' },
    guests: 2,
    checkIn:  'Today',
    checkOut: '25 Oct 2026',
    nights: 3,
    specialRequests: 'Sea-facing room preferred. Late arrival after 10 PM.',
    status: 'Confirmed',
    totalAmount: 1350,
    depositPaid: 450,
  },
  {
    id: 'RES-1002',
    guest: { name: 'Elena Smith',     initials: 'ES', phone: '+1 555-0202', email: 'e.smith@email.com',       nationalId: 'ID-445566', emergencyContact: '' },
    room:  { number: null, type: 'Ocean Suite', floor: null, status: null },
    guests: 1,
    checkIn:  'Today',
    checkOut: '28 Oct 2026',
    nights: 5,
    specialRequests: 'Hypoallergenic pillows required.',
    status: 'Confirmed',
    totalAmount: 2250,
    depositPaid: 500,
  },
  {
    id: 'RES-1003',
    guest: { name: 'Michael Brown',   initials: 'MB', phone: '+1 555-0303', email: 'm.brown@email.com',       nationalId: 'ID-778899', emergencyContact: 'Anna Brown — +1 555-0304' },
    room:  { number: '205', type: 'Deluxe Ocean View', floor: 2, status: 'Available' },
    guests: 3,
    checkIn:  'Today',
    checkOut: '27 Oct 2026',
    nights: 4,
    specialRequests: '',
    status: 'Pending',
    totalAmount: 980,
    depositPaid: 0,
  },
  {
    id: 'RES-1004',
    guest: { name: 'Priya Sharma',    initials: 'PS', phone: '+91 98765 43210', email: 'priya.s@corp.in',   nationalId: 'ID-567890', emergencyContact: '' },
    room:  { number: '310', type: 'Executive Studio', floor: 3, status: 'Available' },
    guests: 2,
    checkIn:  'Today',
    checkOut: '26 Oct 2026',
    nights: 2,
    specialRequests: 'Strictly vegetarian — coordinate with kitchen.',
    status: 'Confirmed',
    totalAmount: 760,
    depositPaid: 380,
  },
];

/* ── Current Guests (status = Checked In) ───────────────────────── */
export const CURRENT_STAYS = [
  {
    id: 'RES-0988',
    guest: { name: 'Alexander Sterling', initials: 'AS', phone: '+1 555-0123', email: 'alex.s@luxury.com', nationalId: 'ID-982741' },
    room:  { number: '402', type: 'Deluxe Sea View Suite', floor: 4 },
    guests: 2,
    checkIn:  'Oct 18, 2026',
    checkOut: 'Oct 24, 2026',
    nights: 6,
    status: 'Checked In',
    charges: [
      { label: 'Room Charges', amount: 2700 },
      { label: 'Laundry',      amount: 45   },
      { label: 'Breakfast',    amount: 90   },
      { label: 'Mini Bar',     amount: 35   },
    ],
    tax:      287,
    discount: -150,
    totalAmount: 3007,
    amountPaid:  1500,
  },
  {
    id: 'RES-1002',
    guest: { name: 'Margot Chen',       initials: 'MC', phone: '+1 555-0198', email: 'margot@example.com', nationalId: 'ID-773210' },
    room:  { number: '112', type: 'Deluxe King Garden', floor: 1 },
    guests: 1,
    checkIn:  'Oct 20, 2026',
    checkOut: 'Oct 21, 2026',
    nights: 1,
    status: 'Checked In',
    charges: [
      { label: 'Room Charges', amount: 450 },
      { label: 'Breakfast',    amount: 20  },
    ],
    tax:      47,
    discount: 0,
    totalAmount: 517,
    amountPaid:  0,
  },
  {
    id: 'RES-0975',
    guest: { name: 'Robert White',      initials: 'RW', phone: '+1 555-0404', email: 'r.white@email.com',  nationalId: 'ID-001984' },
    room:  { number: '510', type: 'Penthouse Suite', floor: 5 },
    guests: 4,
    checkIn:  'Oct 17, 2026',
    checkOut: 'Oct 24, 2026',
    nights: 7,
    status: 'Checked In',
    charges: [
      { label: 'Room Charges', amount: 4900 },
      { label: 'Spa',          amount: 200  },
      { label: 'Dining',       amount: 350  },
      { label: 'Airport Transfer', amount: 80 },
    ],
    tax:      553,
    discount: -250,
    totalAmount: 5833,
    amountPaid:  3000,
  },
];

/* ── Available rooms for room assignment ────────────────────────── */
export const AVAILABLE_ROOMS_FOR_CHECKIN = [
  { number: '101', type: 'Standard King',          floor: 1, pricePerNight: 120 },
  { number: '205', type: 'Deluxe Ocean View',      floor: 2, pricePerNight: 245 },
  { number: '310', type: 'Executive Studio',       floor: 3, pricePerNight: 190 },
  { number: '118', type: 'Deluxe King Garden',     floor: 1, pricePerNight: 175 },
  { number: '407', type: 'Superior Queen',         floor: 4, pricePerNight: 215 },
  { number: '502', type: 'Junior Suite',           floor: 5, pricePerNight: 320 },
];
