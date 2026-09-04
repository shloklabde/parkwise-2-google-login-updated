import {
  collection,
  doc,
  onSnapshot,
  getDocs,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  type Unsubscribe,
  type FirestoreError,
} from 'firebase/firestore';
import { firestore } from '@/lib/firebase';
import type { ParkingLocation, ParkingSlot, SlotStatus } from '@/data/mock';

export type { ParkingLocation, ParkingSlot, SlotStatus };

export interface FirestoreParkingSlotDoc {
  locationId?: string;
  sensor?: string;
  sensorId?: string;
  slotNumber?: string;
  slot?: string;
  status?: string;
  floor?: string;
  lastUpdated?: string | { toDate?: () => Date };
  [key: string]: unknown;
}

export interface FirestoreParkingLocationDoc {
  name?: string;
  locationName?: string;
  address?: string;
  location?: string;
  distance?: string;
  rating?: number;
  pricePerHour?: number;
  rate?: number;
  totalSlots?: number;
  availableSlots?: number;
  facilities?: string[];
  hours?: string;
  zone?: string;
  accent?: string;
  [key: string]: unknown;
}

export const PARKING_LOCATIONS_COLLECTION = 'parkingLocation';
export const PARKING_SLOTS_COLLECTION = 'ParkingSlots';

export function normalizeSlotStatus(status?: unknown): SlotStatus {
  const normalized = String(status || '').trim().toLowerCase();
  if (normalized === 'occupied' || normalized === 'busy') return 'occupied';
  if (normalized === 'reserved' || normalized === 'booked') return 'reserved';
  if (normalized === 'maintenance' || normalized === 'service' || normalized === 'repair') return 'maintenance';
  return 'available';
}

function formatRelativeTime(val?: unknown): string {
  if (!val) return 'Just now';
  if (typeof val === 'string') return val;
  if (typeof val === 'object' && val && 'toDate' in val && typeof (val as { toDate: () => Date }).toDate === 'function') {
    const d = (val as { toDate: () => Date }).toDate();
    const diff = Math.floor((Date.now() - d.getTime()) / 1000);
    if (diff < 60) return `${Math.max(1, diff)} sec ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
    return `${Math.floor(diff / 3600)} hr ago`;
  }
  return 'Just now';
}

export function parseParkingSlotDoc(id: string, data: FirestoreParkingSlotDoc): ParkingSlot {
  const label = data.slotNumber || data.slot || id.replace(/^Slot_/i, '');
  const status = normalizeSlotStatus(data.status);
  const sensorId = data.sensor || data.sensorId || `ESP32-${label}`;
  const floor = data.floor || (label.startsWith('B') ? 'P2' : 'P1');
  const lastUpdated = formatRelativeTime(data.lastUpdated);

  return {
    id,
    label,
    status,
    floor,
    sensorId,
    lastUpdated,
    locationId: data.locationId || 'metropark_001',
  };
}

export function parseParkingLocationDoc(
  id: string,
  data: FirestoreParkingLocationDoc,
  allSlots: ParkingSlot[],
): ParkingLocation {
  const locationSlots = allSlots.filter((slot) => {
    const slotLocId = slot.locationId;
    if (slotLocId) return slotLocId === id;
    return true;
  });

  const slotsToUse = locationSlots.length > 0 ? locationSlots : allSlots;
  const availableCount = slotsToUse.filter((s) => s.status === 'available').length;
  const totalCount = typeof data.totalSlots === 'number' && data.totalSlots > 0 ? data.totalSlots : slotsToUse.length || 4;

  const defaultAccents = [
    'from-[#246d68] to-[#4a9384]',
    'from-[#2b625f] to-[#4a8d84]',
    'from-[#c97868] to-[#e8aa72]',
    'from-[#2b7569] to-[#72a486]',
  ];
  const accentIndex = Math.abs(id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)) % defaultAccents.length;

  return {
    id,
    name: data.name || data.locationName || `Parking Location ${id}`,
    address: data.address || data.location || 'City Center Facility',
    distance: data.distance || '1.2 km',
    rating: typeof data.rating === 'number' ? data.rating : 4.6,
    pricePerHour: typeof data.pricePerHour === 'number' ? data.pricePerHour : typeof data.rate === 'number' ? data.rate : 30,
    totalSlots: totalCount,
    availableSlots: availableCount,
    facilities: Array.isArray(data.facilities) && data.facilities.length > 0 ? data.facilities : ['Covered', 'EV charging', '24/7', 'CCTV'],
    hours: data.hours || 'Open 24 hours',
    zone: data.zone || 'Central',
    accent: data.accent || defaultAccents[accentIndex],
    slots: slotsToUse,
  };
}

export const parkingService = {
  /**
   * Real-time subscription to ParkingSlots collection
   */
  subscribeToParkingSlots(
    callback: (slots: ParkingSlot[]) => void,
    onError?: (error: FirestoreError | Error) => void,
  ): Unsubscribe {
    const slotsCol = collection(firestore, PARKING_SLOTS_COLLECTION);
    return onSnapshot(
      slotsCol,
      (snapshot) => {
        const slots: ParkingSlot[] = snapshot.docs.map((docSnap) => {
          const data = docSnap.data() as FirestoreParkingSlotDoc;
          return parseParkingSlotDoc(docSnap.id, data);
        });

        // Sort slots naturally (Slot_A1, Slot_A2, Slot_A3, Slot_A4...)
        slots.sort((a, b) => a.label.localeCompare(b.label, undefined, { numeric: true, sensitivity: 'base' }));
        callback(slots);
      },
      (error) => {
        console.warn('ParkingSlots subscription notice:', error);
        onError?.(error);
      },
    );
  },

  /**
   * Real-time subscription to parkingLocation collection
   */
  subscribeToParkingLocations(
    callback: (locations: { id: string; data: FirestoreParkingLocationDoc }[]) => void,
    onError?: (error: FirestoreError | Error) => void,
  ): Unsubscribe {
    const locsCol = collection(firestore, PARKING_LOCATIONS_COLLECTION);
    return onSnapshot(
      locsCol,
      (snapshot) => {
        const locs = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          data: docSnap.data() as FirestoreParkingLocationDoc,
        }));
        callback(locs);
      },
      (error) => {
        console.warn('parkingLocation subscription notice:', error);
        onError?.(error);
      },
    );
  },

  /**
   * Real-time listener for combined parking locations and slots
   */
  subscribeToLiveParkingData(
    callback: (data: { locations: ParkingLocation[]; slots: ParkingSlot[]; loading: boolean; error: string | null }) => void,
  ): Unsubscribe {
    let currentSlots: ParkingSlot[] = [];
    let currentRawLocations: { id: string; data: FirestoreParkingLocationDoc }[] = [];
    let slotsLoaded = false;
    let locationsLoaded = false;
    let errorMessage: string | null = null;

    const buildAndEmit = () => {
      const loading = !slotsLoaded && !locationsLoaded;

      let locations: ParkingLocation[] = [];

      if (currentRawLocations.length > 0) {
        locations = currentRawLocations.map((raw) => {
          const locSlots = currentSlots.filter((s) => {
            const locId = s.locationId;
            return !locId || locId === raw.id;
          });
          const slotsForLoc = locSlots.length > 0 ? locSlots : currentSlots;
          return parseParkingLocationDoc(raw.id, raw.data, slotsForLoc);
        });
      } else if (currentSlots.length > 0) {
        const availableCount = currentSlots.filter((s) => s.status === 'available').length;
        locations = [
          {
            id: 'metropark_001',
            name: 'SmartPark Metro',
            address: '18 Residency Road, Ashok Nagar',
            distance: '1.2 km',
            rating: 4.8,
            pricePerHour: 30,
            totalSlots: currentSlots.length,
            availableSlots: availableCount,
            facilities: ['Covered', 'EV charging', '24/7', 'CCTV'],
            hours: 'Open 24 hours',
            zone: 'Central',
            accent: 'from-[#246d68] to-[#4a9384]',
            slots: currentSlots,
          },
        ];
      }

      callback({
        locations,
        slots: currentSlots,
        loading,
        error: errorMessage,
      });
    };

    const unsubSlots = this.subscribeToParkingSlots(
      (slots) => {
        currentSlots = slots;
        slotsLoaded = true;
        errorMessage = null;
        buildAndEmit();
      },
      (err) => {
        slotsLoaded = true;
        errorMessage = err instanceof Error ? err.message : 'Error fetching ParkingSlots';
        buildAndEmit();
      },
    );

    const unsubLocs = this.subscribeToParkingLocations(
      (locs) => {
        currentRawLocations = locs;
        locationsLoaded = true;
        errorMessage = null;
        buildAndEmit();
      },
      (err) => {
        locationsLoaded = true;
        buildAndEmit();
      },
    );

    return () => {
      unsubSlots();
      unsubLocs();
    };
  },

  /**
   * Update Slot status in Firestore ParkingSlots collection
   * Testing manual status change: 'available' | 'occupied' | 'reserved' | 'maintenance'
   */
  async updateSlotStatus(slotId: string, status: SlotStatus): Promise<void> {
    const targetId = slotId.startsWith('Slot_') ? slotId : `Slot_${slotId}`;
    const slotRef = doc(firestore, PARKING_SLOTS_COLLECTION, targetId);
    await setDoc(
      slotRef,
      {
        status,
        lastUpdated: serverTimestamp(),
      },
      { merge: true },
    );
  },

  /**
   * Add / upsert a slot in Firestore ParkingSlots collection
   */
  async addParkingSlot(data: {
    slotNumber: string;
    locationId?: string;
    sensor?: string;
    status?: SlotStatus;
    floor?: string;
  }): Promise<string> {
    const cleanNumber = data.slotNumber.trim().toUpperCase();
    const docId = `Slot_${cleanNumber}`;
    const slotRef = doc(firestore, PARKING_SLOTS_COLLECTION, docId);
    await setDoc(
      slotRef,
      {
        slotNumber: cleanNumber,
        slot: cleanNumber,
        locationId: data.locationId || 'metropark_001',
        sensor: data.sensor || `ESP32-${cleanNumber}`,
        sensorId: data.sensor || `ESP32-${cleanNumber}`,
        status: data.status || 'available',
        floor: data.floor || (cleanNumber.startsWith('B') ? 'P2' : 'P1'),
        lastUpdated: serverTimestamp(),
      },
      { merge: true },
    );
    return docId;
  },

  /**
   * Delete a slot document from Firestore ParkingSlots collection
   */
  async deleteParkingSlot(slotId: string): Promise<void> {
    const targetId = slotId.startsWith('Slot_') ? slotId : `Slot_${slotId}`;
    const slotRef = doc(firestore, PARKING_SLOTS_COLLECTION, targetId);
    await deleteDoc(slotRef);
  },

  /**
   * Add a new parking location document to Firestore parkingLocation collection
   */
  async addParkingLocation(data: {
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
  }): Promise<string> {
    const colRef = collection(firestore, PARKING_LOCATIONS_COLLECTION);
    const docRef = await addDoc(colRef, {
      name: data.name.trim(),
      locationName: data.name.trim(),
      address: data.address.trim(),
      location: data.address.trim(),
      pricePerHour: Number(data.pricePerHour) || 30,
      totalSlots: Number(data.totalSlots) || 4,
      availableSlots: Number(data.totalSlots) || 4,
      zone: data.zone || 'Central',
      hours: data.hours || 'Open 24 hours',
      facilities: data.facilities && data.facilities.length > 0 ? data.facilities : ['Covered', 'EV charging', '24/7', 'CCTV'],
      distance: data.distance || '1.0 km',
      rating: typeof data.rating === 'number' ? data.rating : 4.8,
      accent: data.accent || 'from-[#246d68] to-[#4a9384]',
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  },

  /**
   * Update a parking location document in Firestore parkingLocation collection
   */
  async updateParkingLocation(
    id: string,
    data: Partial<FirestoreParkingLocationDoc>,
  ): Promise<void> {
    const locRef = doc(firestore, PARKING_LOCATIONS_COLLECTION, id);
    await updateDoc(locRef, {
      ...data,
      updatedAt: serverTimestamp(),
    });
  },

  /**
   * Delete a parking location document from Firestore parkingLocation collection
   */
  async deleteParkingLocation(id: string): Promise<void> {
    const locRef = doc(firestore, PARKING_LOCATIONS_COLLECTION, id);
    await deleteDoc(locRef);
  },
};

