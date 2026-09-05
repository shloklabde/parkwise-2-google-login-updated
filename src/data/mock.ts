export type SlotStatus = 'available' | 'occupied' | 'reserved' | 'maintenance';
export type BookingStatus = 'confirmed' | 'upcoming' | 'active' | 'completed' | 'cancelled';

export interface ParkingSlot {
  id: string;
  label: string;
  status: SlotStatus;
  floor: string;
  sensorId: string;
  lastUpdated: string;
  locationId?: string;
}

export interface ParkingLocation {
  id: string;
  name: string;
  address: string;
  distance: string;
  rating: number;
  pricePerHour: number;
  totalSlots: number;
  availableSlots: number;
  facilities: string[];
  hours: string;
  zone: string;
  accent: string;
  slots: ParkingSlot[];
  latitude?: number;
  longitude?: number;
}

export interface Booking {
  id: string;
  userId?: string;
  userEmail?: string;
  userName?: string;
  locationId: string;
  locationName: string;
  address?: string;
  slot: string;
  slotId?: string;
  slotNumber?: string;
  date: string;
  startTime?: string;
  endTime?: string;
  time?: string;
  duration: number;
  amount: number;
  status: BookingStatus;
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  detail: string;
  time: string;
  unread: boolean;
  type: 'booking' | 'system' | 'availability';
}

export interface DemoUser {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  phone: string;
  vehicle: string;
  joined: string;
}

const makeSlots = (prefix: string, count: number, reserved: number[] = [], occupied: number[] = [], maintenance: number[] = []): ParkingSlot[] =>
  Array.from({ length: count }, (_, index) => {
    const number = index + 1;
    const row = String.fromCharCode(65 + Math.floor(index / 6));
    return {
      id: `${prefix}-${number}`,
      label: `${row}${(index % 6) + 1}`,
      status: maintenance.includes(number) ? 'maintenance' : reserved.includes(number) ? 'reserved' : occupied.includes(number) ? 'occupied' : 'available',
      floor: index > 11 ? 'P2' : 'P1',
      sensorId: `ESP32-${prefix}-S${String(number).padStart(2, '0')}`,
      lastUpdated: `${4 + (index % 9)} sec ago`,
    };
  });

export const parkingLocations: ParkingLocation[] = [
  { id: 'metropark_001', name: 'MetroPark', address: 'Sector 12, Kharghar, Navi Mumbai, Maharashtra 410210, India', distance: '0.8 km', rating: 4.8, pricePerHour: 30, totalSlots: 36, availableSlots: 19, facilities: ['Covered', 'EV charging', '24/7', 'CCTV'], hours: 'Open 24 hours', zone: 'Kharghar', accent: 'from-[#246d68] to-[#4a9384]', latitude: 19.0439, longitude: 73.0656, slots: makeSlots('METRO1', 36, [3, 14, 28], [2, 5, 9, 12, 17, 24, 31, 35], [21]) },
  { id: 'abc-mall', name: 'ABC Mall Parking', address: '18 Residency Road, Ashok Nagar', distance: '1.2 km', rating: 4.6, pricePerHour: 30, totalSlots: 36, availableSlots: 19, facilities: ['Covered', 'EV charging', '24/7', 'CCTV'], hours: 'Open 24 hours', zone: 'Central', accent: 'from-[#246d68] to-[#4a9384]', latitude: 12.9724, longitude: 77.6045, slots: makeSlots('ABC', 36, [3, 14, 28], [2, 5, 9, 12, 17, 24, 31, 35], [21]) },
  { id: 'xyz-park', name: 'XYZ Business Park', address: '72 Outer Ring Road, Bellandur', distance: '2.8 km', rating: 4.8, pricePerHour: 45, totalSlots: 48, availableSlots: 28, facilities: ['Covered', 'Security', 'EV charging'], hours: '05:00 – 23:00', zone: 'East', accent: 'from-[#2b625f] to-[#4a8d84]', latitude: 12.9304, longitude: 77.6784, slots: makeSlots('XYZ', 48, [4, 11, 22, 30], [1, 6, 8, 15, 18, 25, 32, 37, 43, 47], [19, 40]) },
  { id: 'city-center', name: 'City Center Parking', address: '1 MG Road, Shivaji Nagar', distance: '3.4 km', rating: 4.4, pricePerHour: 25, totalSlots: 30, availableSlots: 11, facilities: ['Accessible', 'CCTV', 'Valet'], hours: '06:00 – 00:00', zone: 'Central', accent: 'from-[#c97868] to-[#e8aa72]', latitude: 12.9756, longitude: 77.6066, slots: makeSlots('CITY', 30, [2, 5, 18], [1, 3, 6, 8, 9, 12, 14, 21, 23, 26, 29], [16]) },
  { id: 'metro-station', name: 'Metro Station Parking', address: 'Purple Line, Indiranagar Station', distance: '4.1 km', rating: 4.2, pricePerHour: 20, totalSlots: 42, availableSlots: 26, facilities: ['24/7', 'Accessible', 'Two-wheeler'], hours: 'Open 24 hours', zone: 'South', accent: 'from-[#2b7569] to-[#72a486]', latitude: 12.9784, longitude: 77.6408, slots: makeSlots('METRO', 42, [7, 15, 24], [2, 4, 12, 18, 26, 33, 39], [30]) },
  { id: 'tech-park', name: 'Tech Park Parking', address: '9 Innovation Drive, Whitefield', distance: '7.6 km', rating: 4.7, pricePerHour: 35, totalSlots: 60, availableSlots: 41, facilities: ['Covered', 'EV charging', 'Security'], hours: '05:30 – 23:30', zone: 'East', accent: 'from-[#356461] to-[#7e9d83]', latitude: 12.9698, longitude: 77.7499, slots: makeSlots('TECH', 60, [1, 9, 16, 36], [4, 7, 13, 21, 29, 42, 50, 56], [32, 58]) },
];

export const demoUsers: DemoUser[] = [
  { id: 'u-001', name: 'Aarav Mehta', email: 'user@parkwise.com', role: 'user', phone: '+91 98765 43210', vehicle: 'KA 03 MN 2841 · Sedan', joined: 'May 2024' },
  { id: 'u-002', name: 'Nisha Kapoor', email: 'nisha.kapoor@email.com', role: 'user', phone: '+91 98452 11892', vehicle: 'KA 05 JP 7712 · Hatchback', joined: 'Jun 2024' },
  { id: 'u-003', name: 'Rohan Iyer', email: 'rohan.iyer@email.com', role: 'user', phone: '+91 99001 66329', vehicle: 'KA 01 RT 1098 · SUV', joined: 'Aug 2024' },
  { id: 'a-001', name: 'Maya Rao', email: 'admin@parkwise.com', role: 'admin', phone: '+91 99887 40020', vehicle: '—', joined: 'Jan 2024' },
];

export const initialBookings: Booking[] = [
  { id: 'SP-10284', locationId: 'abc-mall', locationName: 'ABC Mall Parking', slot: 'A3', date: '14 Aug 2026', time: '5:30 PM', duration: 2, amount: 60, status: 'upcoming', createdAt: '12 Aug 2026' },
  { id: 'SP-10251', locationId: 'xyz-park', locationName: 'XYZ Business Park', slot: 'B4', date: '08 Aug 2026', time: '10:00 AM', duration: 3, amount: 135, status: 'completed', createdAt: '07 Aug 2026' },
  { id: 'SP-10176', locationId: 'city-center', locationName: 'City Center Parking', slot: 'C2', date: '29 Jul 2026', time: '7:15 PM', duration: 1, amount: 25, status: 'completed', createdAt: '29 Jul 2026' },
];

export const notifications: NotificationItem[] = [];

export const devices = [
  { id: 'ESP32-001', location: 'ABC Mall Parking', status: 'Online', heartbeat: '5 seconds ago', sensors: '8/8', signal: 'Strong' },
  { id: 'ESP32-002', location: 'XYZ Business Park', status: 'Online', heartbeat: '8 seconds ago', sensors: '12/12', signal: 'Strong' },
  { id: 'ESP32-003', location: 'City Center Parking', status: 'Offline', heartbeat: '12 minutes ago', sensors: '24/30', signal: 'Needs attention' },
  { id: 'ESP32-004', location: 'Metro Station Parking', status: 'Online', heartbeat: '11 seconds ago', sensors: '10/10', signal: 'Stable' },
];

export const analyticsData = [
  { day: 'Mon', occupancy: 58, reservations: 42, revenue: 18400 },
  { day: 'Tue', occupancy: 64, reservations: 51, revenue: 22100 },
  { day: 'Wed', occupancy: 61, reservations: 47, revenue: 19800 },
  { day: 'Thu', occupancy: 72, reservations: 63, revenue: 26750 },
  { day: 'Fri', occupancy: 79, reservations: 76, revenue: 32200 },
  { day: 'Sat', occupancy: 68, reservations: 58, revenue: 24100 },
  { day: 'Sun', occupancy: 49, reservations: 31, revenue: 13600 },
];