import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { firebaseErrorMessage, firebaseService } from '@/services/firebaseServices';
import { type Booking, type BookingStatus, type DemoUser, type NotificationItem, type ParkingLocation, type ParkingSlot, type SlotStatus } from '@/data/mock';
import { parkingService, type FirestoreParkingLocationDoc } from '@/services/parkingService';
import { isBookingCurrentlyActive, normalizeSlotLabel } from '@/lib/bookingTime';

interface AppContextValue {
  user: DemoUser | null;
  bookings: Booking[];
  allBookings: Booking[];
  allUsers: DemoUser[];
  parkingLocations: ParkingLocation[];
  parkingSlots: ParkingSlot[];
  parkingLoading: boolean;
  parkingError: string | null;
  authLoading: boolean;
  authError: string;
  login: (email: string, password: string) => Promise<DemoUser>;
  loginWithGoogle: () => Promise<DemoUser>;
  adminLogin: (email: string, password: string) => Promise<DemoUser>;
  register: (name: string, email: string, phone: string, password: string) => Promise<DemoUser>;
  resetPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (updates: Partial<Pick<DemoUser, 'name' | 'phone' | 'vehicle'>>) => Promise<void>;
  addBooking: (
    booking: Omit<Booking, 'id' | 'createdAt' | 'status'> & {
      slotId?: string;
      slotNumber?: string;
      startTime?: string;
      endTime?: string;
      address?: string;
    },
  ) => Promise<Booking>;
  cancelBooking: (id: string) => Promise<void>;
  adminCreateBooking: (booking: Omit<Booking, 'id' | 'createdAt' | 'status'> & { userId?: string; userName?: string; userEmail?: string }) => Promise<Booking>;
  adminCancelBooking: (id: string, uid?: string) => Promise<void>;
  adminUpdateBookingStatus: (id: string, status: BookingStatus, uid?: string) => Promise<void>;
  adminUpdateSlotStatus: (slotId: string, status: SlotStatus) => Promise<void>;
  adminAddParkingSlot: (data: { slotNumber: string; locationId?: string; sensor?: string; status?: SlotStatus; floor?: string }) => Promise<string>;
  adminDeleteParkingSlot: (slotId: string) => Promise<void>;
  adminAddParkingLocation: (data: { name: string; address: string; pricePerHour: number; totalSlots?: number; zone?: string; hours?: string; facilities?: string[]; distance?: string; rating?: number; accent?: string }) => Promise<string>;
  adminUpdateParkingLocation: (id: string, data: Partial<FirestoreParkingLocationDoc>) => Promise<void>;
  adminDeleteParkingLocation: (id: string) => Promise<void>;
  refreshUsers: () => Promise<void>;
  notifications: NotificationItem[];
  unreadCount: number;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<DemoUser | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [allBookings, setAllBookings] = useState<Booking[]>([]);
  const [allUsers, setAllUsers] = useState<DemoUser[]>([]);
  const [parkingLocations, setParkingLocations] = useState<ParkingLocation[]>([]);
  const [parkingSlots, setParkingSlots] = useState<ParkingSlot[]>([]);
  const [parkingLoading, setParkingLoading] = useState(true);
  const [parkingError, setParkingError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState('');
  const [timeTick, setTimeTick] = useState(0);

  // Periodically check for expired reservations, tick clock, and sync Firestore
  useEffect(() => {
    // Initial reconciliation
    firebaseService.reconcileExpiredBookingsAndSlots();

    const interval = setInterval(() => {
      setTimeTick((t) => t + 1);
      firebaseService.reconcileExpiredBookingsAndSlots();
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  // Real-time subscription to all bookings so that every user sees live reservation statuses
  useEffect(() => {
    const unsubscribeAll = firebaseService.subscribeToAllBookings(
      (list) => {
        setAllBookings(list);
      },
      (error) => {
        console.warn('Could not subscribe to all bookings:', error);
      },
    );
    return () => unsubscribeAll();
  }, []);

  useEffect(() => {
    const unsubParking = parkingService.subscribeToLiveParkingData((data) => {
      setParkingLocations(data.locations);
      setParkingSlots(data.slots);
      setParkingLoading(data.loading);
      setParkingError(data.error);
    });

    return () => {
      unsubParking();
    };
  }, []);

  useEffect(() => {
    let unsubscribeBookings: (() => void) | undefined;
    const unsubscribeAuth = firebaseService.authStateChanged(
      (nextUser) => {
        unsubscribeBookings?.();
        unsubscribeBookings = undefined;
        setUser(nextUser);
        setBookings([]);
        setAuthError('');
        setAuthLoading(false);
        if (nextUser) {
          unsubscribeBookings = firebaseService.subscribeToBookings(
            nextUser.id,
            setBookings,
            (error) => setAuthError(error.message),
          );
          if (nextUser.role === 'admin') {
            firebaseService.fetchAllUsers().then(setAllUsers);
          }
        }
      },
      (error) => {
        unsubscribeBookings?.();
        unsubscribeBookings = undefined;
        setUser(null);
        setBookings([]);
        const code = typeof error === 'object' && error && 'code' in error ? String(error.code) : '';
        if (code !== 'permission-denied') {
          setAuthError(error.message);
        }
        setAuthLoading(false);
      },
    );

    return () => {
      unsubscribeAuth();
      unsubscribeBookings?.();
    };
  }, []);

  // Dynamically compute effective slots based on active reservations vs expired reservations
  const effectiveParkingSlots = useMemo(() => {
    const now = new Date();
    return parkingSlots.map((slot) => {
      // If slot is marked as 'reserved', check if there is an active reservation right now
      if (slot.status === 'reserved') {
        const cleanLabel = normalizeSlotLabel(slot.label);
        const hasActiveReservation = allBookings.some((b) => {
          const bSlot = normalizeSlotLabel(b.slotNumber || b.slot || b.slotId || '');
          return bSlot === cleanLabel && isBookingCurrentlyActive(b, now);
        });

        // If no active reservation currently covers this exact moment, the slot is now available!
        if (!hasActiveReservation) {
          return { ...slot, status: 'available' as SlotStatus };
        }
      }
      return slot;
    });
  }, [parkingSlots, allBookings, timeTick]);

  // Dynamically compute effective locations using the effective parking slots
  const effectiveParkingLocations = useMemo(() => {
    return parkingLocations.map((loc) => {
      const locSlots = effectiveParkingSlots.filter(
        (s) => !s.locationId || s.locationId === loc.id || loc.id === 'metropark_001',
      );
      const availableCount = locSlots.filter((s) => s.status === 'available').length;
      return {
        ...loc,
        slots: locSlots,
        availableSlots: locSlots.length > 0 ? availableCount : loc.availableSlots,
      };
    });
  }, [parkingLocations, effectiveParkingSlots]);

  const login = async (email: string, password: string) => {
    setAuthError('');
    try {
      const nextUser = await firebaseService.login(email, password);
      setUser(nextUser);
      return nextUser;
    } catch (error) {
      const message = firebaseErrorMessage(error);
      setAuthError(message);
      throw new Error(message);
    }
  };

  const loginWithGoogle = async () => {
    setAuthError('');
    try {
      const nextUser = await firebaseService.loginWithGoogle();
      setUser(nextUser);
      return nextUser;
    } catch (error) {
      const message = firebaseErrorMessage(error);
      setAuthError(message);
      throw new Error(message);
    }
  };

  const adminLogin = async (email: string, password: string) => {
    setAuthError('');
    try {
      const nextUser = await firebaseService.adminLogin(email, password);
      setUser(nextUser);
      return nextUser;
    } catch (error) {
      const message = error instanceof Error ? error.message : firebaseErrorMessage(error);
      setAuthError(message);
      throw new Error(message);
    }
  };

  const register = async (name: string, email: string, phone: string, password: string) => {
    setAuthError('');
    try {
      const nextUser = await firebaseService.register(name, email, phone, password);
      setUser(nextUser);
      return nextUser;
    } catch (error) {
      const message = firebaseErrorMessage(error);
      setAuthError(message);
      throw new Error(message);
    }
  };

  const resetPassword = async (email: string) => {
    await firebaseService.resetPassword(email);
  };

  const logout = async () => {
    await firebaseService.logout();
    setUser(null);
    setBookings([]);
    setAllBookings([]);
    setAllUsers([]);
  };

  const updateUserProfile = async (updates: Partial<Pick<DemoUser, 'name' | 'phone' | 'vehicle'>>) => {
    const firebaseUser = firebaseService.getCurrentUser();
    if (!firebaseUser) throw new Error('You need to be signed in to update your profile.');
    const nextUser = await firebaseService.updateUser(firebaseUser, updates);
    setUser(nextUser);
  };

  const addBooking = async (booking: Omit<Booking, 'id' | 'createdAt' | 'status'>) => {
    if (!user) throw new Error('Sign in before confirming a reservation.');
    const next = await firebaseService.createBooking(user.id, booking);
    const cleanSlotLabel = String(booking.slot || booking.slotNumber || '').replace(/^(slot_)+/i, '').trim().toUpperCase();
    const location = parkingLocations.find((item) => item.id === booking.locationId);
    const slot = location?.slots.find((item) => item.label === cleanSlotLabel || item.id === booking.slotId);
    if (location && slot && slot.status === 'available') {
      slot.status = 'reserved';
      location.availableSlots = Math.max(0, location.availableSlots - 1);
    }
    setBookings((current) => (current.some((item) => item.id === next.id) ? current : [next, ...current]));
    return next;
  };

  const cancelBooking = async (id: string) => {
    if (!user) throw new Error('Sign in before managing a reservation.');
    const booking = bookings.find((item) => item.id === id);
    await firebaseService.cancelBooking(user.id, id);
    if (booking) {
      const cleanSlotLabel = String(booking.slot || booking.slotNumber || '').replace(/^(slot_)+/i, '').trim().toUpperCase();
      const location = parkingLocations.find((item) => item.id === booking.locationId);
      const slot = location?.slots.find((item) => item.label === cleanSlotLabel || item.id === booking.slotId);
      if (location && slot && slot.status === 'reserved') {
        slot.status = 'available';
        location.availableSlots += 1;
      }
    }
    setBookings((current) => current.map((item) => (item.id === id ? { ...item, status: 'cancelled' } : item)));
  };

  const adminCreateBooking = async (booking: Omit<Booking, 'id' | 'createdAt' | 'status'> & { userId?: string; userName?: string; userEmail?: string }) => {
    const next = await firebaseService.adminCreateBooking(booking);
    setAllBookings((current) => (current.some((item) => item.id === next.id) ? current : [next, ...current]));
    return next;
  };

  const adminCancelBooking = async (id: string, uid?: string) => {
    await firebaseService.updateBookingStatus(id, 'cancelled', uid);
    setAllBookings((current) => current.map((item) => (item.id === id ? { ...item, status: 'cancelled' } : item)));
  };

  const adminUpdateBookingStatus = async (id: string, status: BookingStatus, uid?: string) => {
    await firebaseService.updateBookingStatus(id, status, uid);
    setAllBookings((current) => current.map((item) => (item.id === id ? { ...item, status } : item)));
  };

  const adminUpdateSlotStatus = async (slotId: string, status: SlotStatus) => {
    await parkingService.updateSlotStatus(slotId, status);
  };

  const adminAddParkingSlot = async (data: {
    slotNumber: string;
    locationId?: string;
    sensor?: string;
    status?: SlotStatus;
    floor?: string;
  }) => {
    return await parkingService.addParkingSlot(data);
  };

  const adminDeleteParkingSlot = async (slotId: string) => {
    await parkingService.deleteParkingSlot(slotId);
  };

  const adminAddParkingLocation = async (data: {
    name: string;
    address: string;
    pricePerHour: number;
    totalSlots?: number;
    zone?: string;
    hours?: string;
    facilities?: string[];
    distance?: string;
    rating?: number;
    accent?: string;
  }) => {
    return await parkingService.addParkingLocation(data);
  };

  const adminUpdateParkingLocation = async (
    id: string,
    data: Partial<FirestoreParkingLocationDoc>,
  ) => {
    await parkingService.updateParkingLocation(id, data);
  };

  const adminDeleteParkingLocation = async (id: string) => {
    await parkingService.deleteParkingLocation(id);
  };

  const refreshUsers = async () => {
    const users = await firebaseService.fetchAllUsers();
    setAllUsers(users);
  };

  const [readNotificationIds, setReadNotificationIds] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('parkwise_read_notifications') || '[]');
    } catch {
      return [];
    }
  });

  const markNotificationAsRead = (id: string) => {
    setReadNotificationIds((prev) => {
      if (prev.includes(id)) return prev;
      const updated = [...prev, id];
      try {
        localStorage.setItem('parkwise_read_notifications', JSON.stringify(updated));
      } catch {
        // Ignore local storage error
      }
      return updated;
    });
  };

  const markAllNotificationsAsRead = () => {
    const allIds = userNotifications.map((n) => n.id);
    setReadNotificationIds((prev) => {
      const updated = Array.from(new Set([...prev, ...allIds]));
      try {
        localStorage.setItem('parkwise_read_notifications', JSON.stringify(updated));
      } catch {
        // Ignore local storage error
      }
      return updated;
    });
  };

  // Build notifications dynamically: DO NOT send any notifications to users without reservations!
  const userNotifications = useMemo<NotificationItem[]>(() => {
    if (!user) return [];
    // User without any reservations receives NO notifications
    if (!bookings || bookings.length === 0) {
      return [];
    }

    return bookings.map((b) => {
      const slotLabel = b.slot || b.slotNumber || 'Assigned slot';
      const locName = b.locationName || 'Parking Facility';
      const dateStr = b.date || 'Today';
      const timeStr = b.time || b.startTime || '';
      const formattedTime = timeStr ? `${dateStr} · ${timeStr}` : dateStr;

      let title = `Reservation Confirmed · ${locName}`;
      let detail = `Slot ${slotLabel} is reserved for ${formattedTime}.`;
      let type: 'booking' | 'system' | 'availability' = 'booking';

      if (b.status === 'active') {
        title = `Active Parking Session · ${locName}`;
        detail = `Currently parked in Slot ${slotLabel} (${b.duration} hr pass).`;
        type = 'availability';
      } else if (b.status === 'completed') {
        title = `Parking Completed · ${locName}`;
        detail = `Completed parking session for Slot ${slotLabel} on ${dateStr}.`;
        type = 'system';
      } else if (b.status === 'cancelled') {
        title = `Reservation Cancelled · ${locName}`;
        detail = `Slot ${slotLabel} reservation on ${dateStr} has been cancelled.`;
        type = 'system';
      }

      const notifId = `notif-${b.id}-${b.status}`;
      const isRead = readNotificationIds.includes(notifId);

      return {
        id: notifId,
        title,
        detail,
        time: b.createdAt || 'Recent',
        unread: !isRead,
        type,
      };
    });
  }, [user, bookings, readNotificationIds]);

  const unreadCount = useMemo(
    () => userNotifications.filter((item) => item.unread).length,
    [userNotifications],
  );

  const value = useMemo(
    () => ({
      user,
      bookings,
      allBookings,
      allUsers,
      parkingLocations: effectiveParkingLocations,
      parkingSlots: effectiveParkingSlots,
      parkingLoading,
      parkingError,
      authLoading,
      authError,
      login,
      loginWithGoogle,
      adminLogin,
      register,
      resetPassword,
      logout,
      updateUserProfile,
      addBooking,
      cancelBooking,
      adminCreateBooking,
      adminCancelBooking,
      adminUpdateBookingStatus,
      adminUpdateSlotStatus,
      adminAddParkingSlot,
      adminDeleteParkingSlot,
      adminAddParkingLocation,
      adminUpdateParkingLocation,
      adminDeleteParkingLocation,
      refreshUsers,
      notifications: userNotifications,
      unreadCount,
      markNotificationAsRead,
      markAllNotificationsAsRead,
    }),
    [
      user,
      bookings,
      allBookings,
      allUsers,
      effectiveParkingLocations,
      effectiveParkingSlots,
      parkingLoading,
      parkingError,
      authLoading,
      authError,
      userNotifications,
      unreadCount,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}
