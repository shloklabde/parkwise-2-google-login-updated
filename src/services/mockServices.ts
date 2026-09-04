import { demoUsers, initialBookings, parkingLocations, type Booking, type ParkingLocation } from '@/data/mock';

export const authService = {
  login(email: string, password: string) {
    if (email === 'user@parkwise.com' && password === 'user123') return demoUsers[0];
    if (email === 'admin@parkwise.com' && password === 'admin123') return demoUsers[3];
    throw new Error('That email and password combination is not recognised.');
  },
  register(name: string, email: string, phone: string) {
    return { id: `u-${Date.now()}`, name, email, role: 'user' as const, phone, vehicle: 'Add a vehicle', joined: 'Today' };
  },
};

export const parkingService = {
  list(): ParkingLocation[] { return parkingLocations; },
  get(id: string): ParkingLocation | undefined { return parkingLocations.find((location) => location.id === id); },
};

export const bookingService = {
  list(): Booking[] { return initialBookings; },
  create(booking: Omit<Booking, 'id' | 'createdAt' | 'status'>): Booking {
    return { ...booking, id: `SP-${Math.floor(10000 + Math.random() * 89999)}`, createdAt: 'Today', status: 'upcoming' };
  },
};