/**
 * Mock Room data for Hotel Grande ERP – Room Management Module
 */

export const ROOMS = [
  {
    id: '101',
    number: '101',
    type: 'Standard King',
    floor: 1,
    capacity: 2,
    pricePerNight: 120,
    bedType: 'King Size',
    status: 'Available',
    lastCleaned: 'Today, 09:15 AM',
    viewType: 'City View',
    wing: 'East Wing',
    description: 'A comfortable standard king room with city views and modern amenities. Features premium bedding, a spacious work area, and all essential conveniences for a pleasant stay.',
    amenities: ['Wi-Fi', 'Air Conditioning', 'Smart TV', 'Mini Bar', 'Room Service'],
    currentReservation: null,
    cleaningHistory: [
      { staff: 'Sarah Jennings', task: 'Daily Deep Clean',  date: 'Jul 2, 2024', status: 'Completed' },
      { staff: 'David Chen',     task: 'Turndown Service',  date: 'Jul 1, 2024', status: 'Completed' },
    ],
    maintenanceHistory: [],
  },
  {
    id: '205',
    number: '205',
    type: 'Deluxe Ocean View',
    floor: 2,
    capacity: 3,
    pricePerNight: 245,
    bedType: 'King + Single',
    status: 'Occupied',
    lastCleaned: 'Yesterday',
    viewType: 'Ocean Front',
    wing: 'West Wing',
    description: 'The Deluxe Ocean View room offers breathtaking panoramic sea views from a private balcony. Featuring luxurious furnishings and an en-suite marble bathroom.',
    amenities: ['Wi-Fi', 'Air Conditioning', 'Smart TV', 'Mini Bar', 'Balcony', 'Sea View', 'Room Service', 'Breakfast'],
    currentReservation: {
      guestName:  'Alexander Sterling',
      bookingId:  '#GH-99201',
      checkIn:    'Oct 18, 2023',
      checkOut:   'Oct 24, 2023',
      checkInTime:'14:00 PM',
      checkOutTime:'11:00 AM',
    },
    cleaningHistory: [
      { staff: 'Sarah Jennings', task: 'Daily Deep Clean', date: 'Jul 2, 2024', status: 'Completed' },
      { staff: 'David Chen',     task: 'Turndown Service', date: 'Jul 1, 2024', status: 'Completed' },
    ],
    maintenanceHistory: [
      { issue: 'AC Filter Repair',  date: 'Jun 20, 2024', tech: 'Marco R.', status: 'Resolved' },
      { issue: 'TV Replacement',    date: 'May 15, 2024', tech: 'Sam L.',   status: 'Resolved' },
    ],
  },
  {
    id: '401',
    number: '401',
    type: 'Presidential Suite',
    floor: 4,
    capacity: 4,
    pricePerNight: 850,
    bedType: 'King',
    status: 'Maintenance',
    lastCleaned: '-',
    viewType: 'Ocean Front',
    wing: 'North Wing',
    description: 'Our flagship Presidential Suite spans the entire north wing of the 4th floor. Featuring a full living room, private dining area, and butler service.',
    amenities: ['Wi-Fi', 'Air Conditioning', 'Smart TV', 'Mini Bar', 'Balcony', 'Sea View', 'Room Service', 'Breakfast'],
    currentReservation: null,
    cleaningHistory: [],
    maintenanceHistory: [
      { issue: 'Plumbing Repair',  date: 'Jul 3, 2024', tech: 'Marco R.', status: 'In Progress' },
    ],
  },
  {
    id: '102',
    number: '102',
    type: 'Standard King',
    floor: 1,
    capacity: 2,
    pricePerNight: 120,
    bedType: 'King Size',
    status: 'Reserved',
    lastCleaned: 'Today, 07:00 AM',
    viewType: 'City View',
    wing: 'East Wing',
    description: 'Standard King room with city view, ideal for business travellers.',
    amenities: ['Wi-Fi', 'Air Conditioning', 'Smart TV'],
    currentReservation: null,
    cleaningHistory: [
      { staff: 'Sarah Jennings', task: 'Full Clean', date: 'Jul 2, 2024', status: 'Completed' },
    ],
    maintenanceHistory: [],
  },
  {
    id: '302',
    number: '302',
    type: 'Deluxe Suite',
    floor: 3,
    capacity: 2,
    pricePerNight: 380,
    bedType: 'King Size',
    status: 'Cleaning',
    lastCleaned: 'In Progress',
    viewType: 'Garden View',
    wing: 'South Wing',
    description: 'Spacious Deluxe Suite with garden views, a sitting area, and premium amenities.',
    amenities: ['Wi-Fi', 'Air Conditioning', 'Smart TV', 'Mini Bar', 'Room Service'],
    currentReservation: null,
    cleaningHistory: [
      { staff: 'Maria Santos', task: 'Standard Clean', date: 'Jul 3, 2024', status: 'In Progress' },
    ],
    maintenanceHistory: [],
  },
  {
    id: '402',
    number: '402',
    type: 'Deluxe Sea View Suite',
    floor: 4,
    capacity: 3,
    pricePerNight: 450,
    bedType: 'King + Single',
    status: 'Occupied',
    lastCleaned: 'Jul 2, 2024',
    viewType: 'Ocean Front',
    wing: 'North Wing',
    description: 'The Deluxe Sea View Suite offers unparalleled luxury with panoramic vistas of the horizon. Located on our exclusive 4th floor, this suite features hand-crafted furniture, premium Italian linens, and a private balcony designed for ultimate relaxation. Perfect for small families or executive stays.',
    amenities: ['Wi-Fi', 'Air Conditioning', 'Mini Bar', 'Smart TV', 'Balcony', 'Espresso Machine', 'Security Safe', 'Rain Shower'],
    currentReservation: {
      guestName:  'Alexander Sterling',
      bookingId:  '#GH-99201',
      checkIn:    'Oct 18, 2023',
      checkOut:   'Oct 24, 2023',
      checkInTime:'14:00 PM',
      checkOutTime:'11:00 AM',
    },
    cleaningHistory: [
      { staff: 'Sarah Jennings', task: 'Daily Deep Clean', date: 'Jul 2, 2024', status: 'Completed' },
      { staff: 'David Chen',     task: 'Turndown Service', date: 'Jul 1, 2024', status: 'Completed' },
    ],
    maintenanceHistory: [
      { issue: 'AC Filter Repair', date: 'Jun 20, 2024', tech: 'Marco R.', status: 'Resolved' },
      { issue: 'TV Replacement',   date: 'May 15, 2024', tech: 'Sam L.',   status: 'Resolved' },
    ],
  },
];

export const ROOM_TYPES   = ['All Types', 'Standard King', 'Deluxe Ocean View', 'Deluxe Suite', 'Deluxe Sea View Suite', 'Presidential Suite'];
export const ROOM_STATUSES = ['All Status', 'Available', 'Occupied', 'Reserved', 'Cleaning', 'Maintenance', 'Down'];
export const FLOOR_OPTIONS = ['All Floors', '1', '2', '3', '4', '5'];
export const FLOOR_LABELS  = ['Ground Floor', '1st Floor', '2nd Floor', '3rd Floor', '4th Floor', '5th Floor'];
export const BED_TYPES     = ['King Size', 'Queen Size', 'Twin', 'King + Single', 'Double'];

export const AMENITY_OPTIONS = [
  'Wi-Fi', 'Air Conditioning', 'Mini Bar', 'Smart TV',
  'Balcony', 'Sea View', 'Breakfast', 'Room Service',
];

export const AMENITY_ICONS = {
  'Wi-Fi':            '📶',
  'Air Conditioning': '❄️',
  'Mini Bar':         '🍷',
  'Smart TV':         '📺',
  'Balcony':          '🏗️',
  'Sea View':         '🌊',
  'Breakfast':        '🍳',
  'Room Service':     '🛎️',
  'Espresso Machine': '☕',
  'Security Safe':    '🔒',
  'Rain Shower':      '🚿',
  'Climate Control':  '🌡️',
};

export const STATUS_STYLE = {
  Available:   { bg: 'bg-green-100',  text: 'text-green-700',  border: 'border-green-200',  dot: 'bg-green-500'  },
  Occupied:    { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-200', dot: 'bg-orange-500' },
  Reserved:    { bg: 'bg-blue-100',   text: 'text-blue-700',   border: 'border-blue-200',   dot: 'bg-blue-500'   },
  Cleaning:    { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-200', dot: 'bg-purple-500' },
  Maintenance: { bg: 'bg-red-100',    text: 'text-red-700',    border: 'border-red-200',    dot: 'bg-red-500'    },
  Down:        { bg: 'bg-gray-100',   text: 'text-gray-600',   border: 'border-gray-200',   dot: 'bg-gray-400'   },
};
