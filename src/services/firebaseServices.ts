import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  type User as FirebaseUser,
} from 'firebase/auth';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  type Unsubscribe,
} from 'firebase/firestore';
import { firebaseAuth, firestore } from '@/lib/firebase';
import type { Booking, BookingStatus, DemoUser } from '@/data/mock';

const userRef = (uid: string) => doc(firestore, 'users', uid);
const allUsersRef = () => collection(firestore, 'users');
const bookingsCollectionRef = () => collection(firestore, 'bookings');
const bookingDocRef = (id: string) => doc(firestore, 'bookings', id);
const parkingSlotsCollectionRef = () => collection(firestore, 'ParkingSlots');
const parkingSlotDocRef = (id: string) => doc(firestore, 'ParkingSlots', id);

const ADMIN_EMAIL = 'shloklabde60@gmail.com';
const ADMIN_PASSWORD = 'Shlok@123';

function displayJoinedDate() {
  return new Intl.DateTimeFormat('en-IN', { month: 'short', year: 'numeric' }).format(new Date());
}

function profileFromFirebaseUser(firebaseUser: FirebaseUser, data?: Record<string, unknown>): DemoUser {
  const isAdminEmail = firebaseUser.email?.toLowerCase() === ADMIN_EMAIL;
  return {
    id: firebaseUser.uid,
    name: String(data?.name || firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Parkwise user'),
    email: firebaseUser.email || '',
    role: isAdminEmail || data?.role === 'admin' ? 'admin' : 'user',
    phone: String(data?.phone || ''),
    vehicle: String(data?.vehicle || 'Add a vehicle'),
    joined: String(data?.joined || displayJoinedDate()),
  };
}

async function ensureUserProfile(firebaseUser: FirebaseUser, profile?: { name?: string; phone?: string }) {
  const fallback = profileFromFirebaseUser(firebaseUser, profile);
  try {
    const snapshot = await getDoc(userRef(firebaseUser.uid));
    const existing = snapshot.exists() ? (snapshot.data() as Record<string, unknown>) : undefined;
    const next = profileFromFirebaseUser(firebaseUser, {
      ...existing,
      ...(profile || {}),
    });
    const isAdminEmail = firebaseUser.email?.toLowerCase() === ADMIN_EMAIL;
    const role = isAdminEmail || existing?.role === 'admin' ? 'admin' : next.role;
    await setDoc(
      userRef(firebaseUser.uid),
      {
        uid: firebaseUser.uid,
        name: next.name,
        email: next.email,
        role,
        phone: next.phone,
        vehicle: next.vehicle,
        joined: next.joined,
        updatedAt: serverTimestamp(),
        ...(snapshot.exists() ? {} : { createdAt: serverTimestamp() }),
      },
      { merge: true },
    );
    return { ...next, role: role as 'user' | 'admin' };
  } catch {
    return fallback;
  }
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: firebaseAuth.currentUser?.uid,
      email: firebaseAuth.currentUser?.email,
      emailVerified: firebaseAuth.currentUser?.emailVerified,
      isAnonymous: firebaseAuth.currentUser?.isAnonymous,
      tenantId: firebaseAuth.currentUser?.tenantId,
      providerInfo:
        firebaseAuth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.warn('Firestore Error Context:', JSON.stringify(errInfo));
  return errInfo;
}

function errorMessage(error: unknown) {
  const code = typeof error === 'object' && error && 'code' in error ? String(error.code) : '';
  const messages: Record<string, string> = {
    'auth/invalid-credential': 'Invalid email/phone or password. Please try again.',
    'auth/invalid-email': 'Please enter a valid Gmail or email address.',
    'auth/email-already-in-use': 'An account with this email already exists. Try signing in.',
    'auth/weak-password': 'Use at least 6 characters for your password.',
    'auth/user-not-found': 'No account found with this email address. Please check and try again.',
    'auth/wrong-password': 'Incorrect password. Please try again or reset your password.',
    'auth/too-many-requests': 'Too many attempts. Please wait a moment and try again.',
    'auth/network-request-failed': 'A network error interrupted the request. Try again.',
  };
  return messages[code] || (error instanceof Error ? error.message : 'Something went wrong. Try again.');
}

export interface CreateBookingParams {
  locationId: string;
  locationName: string;
  address?: string;
  slotId?: string;
  slotNumber?: string;
  slot?: string;
  date: string;
  startTime?: string;
  endTime?: string;
  time?: string;
  duration: number;
  amount: number;
  userName?: string;
  userEmail?: string;
}

function parseBookingDoc(id: string, data: Record<string, unknown>): Booking {
  const slotNumber = String(data.slotNumber || data.slot || 'A1');
  const startTime = data.startTime ? String(data.startTime) : '';
  const endTime = data.endTime ? String(data.endTime) : '';
  const time = data.time ? String(data.time) : startTime && endTime ? `${startTime} - ${endTime}` : '12:00 PM';
  const rawStatus = String(data.status || 'confirmed').toLowerCase();
  const status: BookingStatus =
    rawStatus === 'cancelled'
      ? 'cancelled'
      : rawStatus === 'completed'
      ? 'completed'
      : rawStatus === 'active'
      ? 'active'
      : rawStatus === 'upcoming'
      ? 'upcoming'
      : 'confirmed';

  return {
    id,
    userId: String(data.userId || ''),
    userEmail: data.userEmail ? String(data.userEmail) : undefined,
    userName: data.userName ? String(data.userName) : undefined,
    locationId: String(data.locationId || 'metropark_001'),
    locationName: String(data.locationName || 'MetroPark Facility'),
    address: data.address ? String(data.address) : undefined,
    slot: slotNumber,
    slotId: data.slotId ? String(data.slotId) : undefined,
    slotNumber,
    date: String(data.date || ''),
    startTime: startTime || undefined,
    endTime: endTime || undefined,
    time,
    duration: typeof data.duration === 'number' ? data.duration : 1,
    amount: typeof data.amount === 'number' ? data.amount : 0,
    status,
    createdAt: String(data.createdAt || new Date().toISOString()),
  };
}

export const firebaseService = {
  authStateChanged(callback: (user: DemoUser | null) => void, onError: (error: Error) => void): Unsubscribe {
    return onAuthStateChanged(
      firebaseAuth,
      async (firebaseUser) => {
        try {
          callback(firebaseUser ? await ensureUserProfile(firebaseUser) : null);
        } catch (error) {
          onError(error instanceof Error ? error : new Error('Unable to load your profile.'));
        }
      },
      onError,
    );
  },

  async findEmailByPhone(phoneInput: string): Promise<string | null> {
    const clean = phoneInput.replace(/\D/g, '').slice(-10);
    if (clean.length !== 10) return null;
    try {
      const snap = await getDocs(allUsersRef());
      for (const doc of snap.docs) {
        const data = doc.data();
        const docPhone = String(data.phone || '').replace(/\D/g, '').slice(-10);
        if (docPhone === clean && data.email) {
          return String(data.email);
        }
      }
    } catch {
      // Ignore query errors and fallback
    }
    return null;
  },

  async login(identifier: string, password: string) {
    try {
      let targetEmail = identifier.trim();
      if (!targetEmail.includes('@')) {
        const cleanDigits = targetEmail.replace(/\D/g, '').slice(-10);
        if (cleanDigits.length === 10) {
          const foundEmail = await this.findEmailByPhone(cleanDigits);
          if (foundEmail) {
            targetEmail = foundEmail;
          } else {
            throw new Error('No account found with this 10-digit phone number. Please check the number or sign in with your email address.');
          }
        } else {
          throw new Error('Please enter a valid email address or 10-digit phone number.');
        }
      }

      const credential = await signInWithEmailAndPassword(firebaseAuth, targetEmail, password);
      return ensureUserProfile(credential.user);
    } catch (error) {
      if (error instanceof Error && error.message.includes('No account found with this 10-digit phone number')) {
        throw error;
      }
      const code = typeof error === 'object' && error && 'code' in error ? String(error.code) : '';
      if (identifier.trim().toLowerCase() === ADMIN_EMAIL && (code === 'auth/user-not-found' || code === 'auth/invalid-credential')) {
        try {
          const credential = await createUserWithEmailAndPassword(firebaseAuth, ADMIN_EMAIL, password);
          await updateProfile(credential.user, { displayName: 'Admin' });
          return ensureUserProfile(credential.user, { name: 'Admin' });
        } catch {
          // Fall through to standard error
        }
      }
      throw new Error(errorMessage(error));
    }
  },

  async loginWithGoogle(): Promise<DemoUser> {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    try {
      const credential = await signInWithPopup(firebaseAuth, provider);
      return await ensureUserProfile(credential.user);
    } catch (error) {
      const code = typeof error === 'object' && error && 'code' in error ? String(error.code) : '';
      if (code === 'auth/popup-closed-by-user') {
        throw new Error('Google sign-in popup was closed before completing.');
      }
      if (code === 'auth/popup-blocked') {
        throw new Error('Sign-in popup was blocked by your browser. Please allow popups or open in a new tab.');
      }
      if (code === 'auth/cancelled-popup-request') {
        throw new Error('Google sign-in attempt was cancelled.');
      }
      if (code === 'auth/unauthorized-domain') {
        throw new Error(
          'This domain is not yet authorized for Google Sign-in in Firebase Console. Please add this domain in Firebase Console > Authentication > Settings > Authorized domains.'
        );
      }
      throw new Error(errorMessage(error));
    }
  },

  async adminLogin(email: string, password: string) {
    try {
      let credential;
      try {
        credential = await signInWithEmailAndPassword(firebaseAuth, email.trim(), password);
      } catch (signInErr) {
        const code = typeof signInErr === 'object' && signInErr && 'code' in signInErr ? String(signInErr.code) : '';
        if (email.trim().toLowerCase() === ADMIN_EMAIL && (code === 'auth/user-not-found' || code === 'auth/invalid-credential')) {
          credential = await createUserWithEmailAndPassword(firebaseAuth, ADMIN_EMAIL, password);
          await updateProfile(credential.user, { displayName: 'Admin' });
        } else {
          throw signInErr;
        }
      }

      const profile = await ensureUserProfile(credential.user);
      if (profile.role !== 'admin') {
        await signOut(firebaseAuth);
        throw new Error('This portal is for administrators only. Your account does not have admin access.');
      }
      return profile;
    } catch (error) {
      if (error instanceof Error && error.message.includes('administrators only')) {
        throw error;
      }
      throw new Error(errorMessage(error));
    }
  },

  async register(name: string, email: string, phone: string, password: string) {
    try {
      const credential = await createUserWithEmailAndPassword(firebaseAuth, email.trim(), password);
      await updateProfile(credential.user, { displayName: name.trim() });
      return ensureUserProfile(credential.user, { name: name.trim(), phone: phone.trim() });
    } catch (error) {
      throw new Error(errorMessage(error));
    }
  },

  async resetPassword(email: string) {
    try {
      await sendPasswordResetEmail(firebaseAuth, email.trim());
    } catch (error) {
      throw new Error(errorMessage(error));
    }
  },

  logout() {
    return signOut(firebaseAuth);
  },

  /**
   * Real-time subscription to user's bookings from Firestore collection 'bookings'
   */
  subscribeToBookings(uid: string, callback: (bookings: Booking[]) => void, onError: (error: Error) => void): Unsubscribe {
    const bookingQuery = query(bookingsCollectionRef(), where('userId', '==', uid));
    return onSnapshot(
      bookingQuery,
      (snapshot) => {
        const list: Booking[] = snapshot.docs.map((docSnap) => parseBookingDoc(docSnap.id, docSnap.data()));
        list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        callback(list);
      },
      (error) => {
        const code = typeof error === 'object' && error && 'code' in error ? String(error.code) : '';
        if (code === 'permission-denied') {
          callback([]);
        } else {
          onError(new Error(error.message || 'Unable to load your bookings.'));
        }
      },
    );
  },

  /**
   * Real-time subscription to all bookings for Admin from Firestore collection 'bookings'
   */
  subscribeToAllBookings(callback: (bookings: Booking[]) => void, onError: (error: Error) => void): Unsubscribe {
    const allQuery = bookingsCollectionRef();
    return onSnapshot(
      allQuery,
      (snapshot) => {
        const list: Booking[] = snapshot.docs.map((docSnap) => parseBookingDoc(docSnap.id, docSnap.data()));
        list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        callback(list);
      },
      (error) => {
        const code = typeof error === 'object' && error && 'code' in error ? String(error.code) : '';
        if (code === 'permission-denied') {
          callback([]);
        } else {
          onError(new Error(error.message || 'Unable to load bookings.'));
        }
      },
    );
  },

  /**
   * Create a booking using a Firestore transaction:
   * 1. Check if slot status is "available".
   * 2. If available, change slot status to "reserved".
   * 3. Create document in 'bookings' collection.
   * 4. If already reserved/occupied, throw "Sorry, this parking slot is no longer available."
   */
  async createBooking(uid: string, params: CreateBookingParams): Promise<Booking> {
    const slotNumber = params.slotNumber || params.slot || 'A1';
    const targetSlotId = params.slotId || `Slot_${slotNumber}`;
    const newBookingRef = doc(bookingsCollectionRef());
    const slotRef = parkingSlotDocRef(targetSlotId);
    const createdAtIso = new Date().toISOString();

    const startTime = params.startTime || params.time?.split('-')[0]?.trim() || '10:00 AM';
    const endTime = params.endTime || params.time?.split('-')[1]?.trim() || '12:00 PM';
    const time = `${startTime} - ${endTime}`;

    try {
      await runTransaction(firestore, async (transaction) => {
        const slotSnap = await transaction.get(slotRef);
        
        if (slotSnap.exists()) {
          const slotData = slotSnap.data();
          const currentStatus = String(slotData.status || '').toLowerCase().trim();
          if (currentStatus !== 'available') {
            throw new Error('Sorry, this parking slot is no longer available.');
          }
          transaction.update(slotRef, {
            status: 'reserved',
            reservedBy: uid,
            reservedAt: serverTimestamp(),
            lastUpdated: serverTimestamp(),
          });
        }

        transaction.set(newBookingRef, {
          userId: uid,
          locationId: params.locationId,
          locationName: params.locationName,
          address: params.address || '',
          slotId: targetSlotId,
          slotNumber: slotNumber,
          slot: slotNumber,
          date: params.date,
          startTime: startTime,
          endTime: endTime,
          time: time,
          duration: params.duration,
          status: 'confirmed',
          amount: params.amount,
          createdAt: createdAtIso,
          createdAtServer: serverTimestamp(),
        });
      });

      return {
        id: newBookingRef.id,
        userId: uid,
        locationId: params.locationId,
        locationName: params.locationName,
        address: params.address,
        slotId: targetSlotId,
        slotNumber: slotNumber,
        slot: slotNumber,
        date: params.date,
        startTime: startTime,
        endTime: endTime,
        time: time,
        duration: params.duration,
        amount: params.amount,
        status: 'confirmed',
        createdAt: createdAtIso,
      };
    } catch (err) {
      if (err instanceof Error && err.message.includes('no longer available')) {
        throw err;
      }
      // If transaction failed due to network or rules, provide clear error
      throw new Error(err instanceof Error ? err.message : 'Unable to reserve slot. Please try again.');
    }
  },

  /**
   * Admin booking creation
   */
  async adminCreateBooking(params: CreateBookingParams & { userId?: string }): Promise<Booking> {
    const uid = params.userId || 'admin_entry';
    return this.createBooking(uid, params);
  },

  /**
   * Cancel booking with transaction:
   * 1. Check booking exists and is cancellable.
   * 2. Read parking slot document BEFORE performing any writes.
   * 3. Change booking status to 'cancelled'.
   * 4. Change corresponding parking slot status 'reserved' -> 'available'.
   * 5. Disallow cancelling 'completed' bookings.
   */
  async cancelBooking(uid: string, bookingId: string): Promise<void> {
    const bookingRef = bookingDocRef(bookingId);

    try {
      await runTransaction(firestore, async (transaction) => {
        // --- STEP 1: ALL READS FIRST ---
        const bookingSnap = await transaction.get(bookingRef);
        if (!bookingSnap.exists()) {
          throw new Error('Booking not found.');
        }
        const data = bookingSnap.data();
        if (data.status === 'completed') {
          throw new Error('Completed bookings cannot be cancelled.');
        }
        if (data.status === 'cancelled') {
          return; // Already cancelled
        }

        const slotId = data.slotId || (data.slotNumber ? `Slot_${data.slotNumber}` : data.slot ? `Slot_${data.slot}` : null);
        const slotRef = slotId ? parkingSlotDocRef(slotId) : null;
        let slotSnap: { exists: () => boolean; data: () => Record<string, unknown> } | null = null;
        if (slotRef) {
          slotSnap = (await transaction.get(slotRef)) as { exists: () => boolean; data: () => Record<string, unknown> };
        }

        // --- STEP 2: ALL WRITES AFTER ---
        transaction.update(bookingRef, {
          status: 'cancelled',
          cancelledAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });

        if (slotRef && slotSnap && slotSnap.exists()) {
          const slotData = slotSnap.data();
          const slotStatus = String(slotData.status || '').toLowerCase().trim();
          if (slotStatus === 'reserved') {
            transaction.update(slotRef, {
              status: 'available',
              reservedBy: null,
              lastUpdated: serverTimestamp(),
            });
          }
        }
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `bookings/${bookingId}`);
      throw error;
    }
  },

  async updateBookingStatus(id: string, status: BookingStatus, _uid?: string): Promise<void> {
    const bookingRef = bookingDocRef(id);
    try {
      await runTransaction(firestore, async (transaction) => {
        // --- STEP 1: ALL READS FIRST ---
        const bookingSnap = await transaction.get(bookingRef);
        if (!bookingSnap.exists()) return;
        const data = bookingSnap.data();

        const slotId = data.slotId || (data.slotNumber ? `Slot_${data.slotNumber}` : data.slot ? `Slot_${data.slot}` : null);
        const slotRef = (status === 'cancelled' || status === 'completed') && slotId ? parkingSlotDocRef(slotId) : null;
        let slotSnap: { exists: () => boolean; data: () => Record<string, unknown> } | null = null;
        if (slotRef) {
          slotSnap = (await transaction.get(slotRef)) as { exists: () => boolean; data: () => Record<string, unknown> };
        }

        // --- STEP 2: ALL WRITES AFTER ---
        transaction.update(bookingRef, { status, updatedAt: serverTimestamp() });

        // If completing or cancelling, free up the reserved slot
        if (slotRef && slotSnap && slotSnap.exists()) {
          const slotData = slotSnap.data();
          const currentStatus = String(slotData.status || '').toLowerCase().trim();
          if (currentStatus === 'reserved') {
            transaction.update(slotRef, {
              status: 'available',
              reservedBy: null,
              lastUpdated: serverTimestamp(),
            });
          }
        }
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `bookings/${id}`);
      throw error;
    }
  },

  async fetchAllUsers(): Promise<DemoUser[]> {
    try {
      const snapshot = await getDocs(allUsersRef());
      return snapshot.docs.map((item) => {
        const data = item.data() as Record<string, unknown>;
        return {
          id: item.id,
          name: String(data.name || 'Unknown'),
          email: String(data.email || ''),
          role: data.role === 'admin' ? 'admin' : 'user',
          phone: String(data.phone || ''),
          vehicle: String(data.vehicle || '—'),
          joined: String(data.joined || displayJoinedDate()),
        } as DemoUser;
      });
    } catch {
      return [];
    }
  },

  async updateUser(firebaseUser: FirebaseUser, updates: Partial<Pick<DemoUser, 'name' | 'phone' | 'vehicle'>>) {
    if (updates.name) await updateProfile(firebaseUser, { displayName: updates.name });
    try {
      await setDoc(userRef(firebaseUser.uid), { ...updates, updatedAt: serverTimestamp() }, { merge: true });
    } catch {
      // Firestore write failure
    }
    return ensureUserProfile(firebaseUser);
  },

  getCurrentUser() {
    return firebaseAuth.currentUser;
  },
};

export { errorMessage as firebaseErrorMessage, ADMIN_EMAIL };

