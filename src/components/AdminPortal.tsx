import { useState, type FormEvent, type ReactNode } from 'react';
import { Link, useLocation } from 'wouter';
import {
  ArrowRight,
  ArrowLeft,
  LockKeyhole,
  Mail,
  ShieldCheck,
  ParkingSquare,
  Plus,
  Search,
  Filter,
  X,
  Check,
  CalendarDays,
  MapPin,
  Clock3,
  CreditCard,
  Car,
  UserRound,
  Trash2,
  Edit2,
  Gauge,
  AlertTriangle,
  RefreshCw,
  Activity,
  Zap,
  CheckCircle2,
  XCircle,
  Wrench,
} from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { type Booking, type BookingStatus, type ParkingLocation, type ParkingSlot, type SlotStatus } from '@/data/mock';
import { StatusBadge, PageHeader, EmptyState, StatCard } from '@/components/SmartParkUI';
import { ADMIN_EMAIL } from '@/services/firebaseServices';
import type { FirestoreParkingLocationDoc } from '@/services/parkingService';
import { GoogleSignInButton } from '@/components/GoogleSignInButton';

const money = (value: number) => `₹${value.toLocaleString('en-IN')}`;

function Button({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  disabled = false,
  className = '',
}: {
  children: ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit';
  variant?: 'primary' | 'quiet' | 'outline' | 'danger' | 'success' | 'warning';
  disabled?: boolean;
  className?: string;
}) {
  const classes = {
    primary: 'bg-[#153b5b] text-white hover:bg-[#214d6d]',
    quiet: 'bg-[#e5f1f0] text-[#286b70] hover:bg-[#d7eae8]',
    outline: 'border border-[#d5e2e6] bg-white text-[#36576a] hover:bg-[#f1f7f7]',
    danger: 'border border-[#f1ceca] bg-white text-[#b2534e] hover:bg-[#fdf1f0]',
    success: 'bg-[#287850] text-white hover:bg-[#1f6341]',
    warning: 'bg-[#d99726] text-white hover:bg-[#c2841b]',
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-all hover:-translate-y-px disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 ${classes[variant]} ${className}`}
    >
      {children}
    </button>
  );
}

export function AdminLoginPage() {
  const { adminLogin } = useApp();
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      await adminLogin(email, password);
      setLocation('/admin/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to sign in.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-[100dvh] bg-[#0f2640]">
      <div className="relative flex flex-col items-center justify-center px-5 py-12">
        <div className="absolute inset-0 grid-fade opacity-30" />
        <div className="absolute -top-20 -right-20 h-80 w-80 rounded-full border border-white/8" />
        <div className="absolute -bottom-20 -left-20 h-80 w-80 rounded-full border border-white/8" />

        <div className="relative w-full max-w-[440px]">
          <Link href="/" className="mb-10 flex items-center gap-2.5">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-white/10 text-[#f6bd60]">
              <ParkingSquare size={21} strokeWidth={2.5} />
            </span>
            <span className="font-display text-[18px] font-bold tracking-[-.04em] text-white">
              park<span className="text-[#e9a84d]">wise</span>
            </span>
          </Link>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm">
            <div className="mb-6">
              <span className="inline-flex items-center gap-2 rounded-full bg-[#f4c26f]/15 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[.14em] text-[#f4c26f]">
                <ShieldCheck size={13} /> Admin portal
              </span>
              <h1 className="mt-4 font-display text-2xl font-bold tracking-[-.04em] text-white">Operator sign in</h1>
              <p className="mt-2 text-sm text-white/55">Access the Parkwise management console.</p>
            </div>

            <div className="mb-6">
              <GoogleSignInButton
                variant="dark"
                label="Sign in with Google Admin"
                onError={(err) => setError(err)}
              />
              <div className="relative my-5 flex items-center justify-center">
                <div className="w-full border-t border-white/10" />
                <span className="absolute bg-[#152e4b] px-3 text-[10px] font-bold uppercase tracking-wider text-white/40">
                  Or admin password
                </span>
              </div>
            </div>

            <form onSubmit={submit} className="space-y-4">
              <label className="block text-xs font-bold text-white/70">
                Admin email
                <div className="relative mt-2">
                  <Mail size={16} className="absolute left-4 top-3.5 text-white/40" />
                  <input
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={ADMIN_EMAIL}
                    className="w-full rounded-xl border border-white/15 bg-white/5 px-11 py-3 text-sm text-white outline-none transition focus:border-[#f4c26f] focus:ring-4 focus:ring-[#f4c26f]/15 placeholder:text-white/30"
                  />
                </div>
              </label>
              <label className="block text-xs font-bold text-white/70">
                Password
                <div className="relative mt-2">
                  <LockKeyhole size={16} className="absolute left-4 top-3.5 text-white/40" />
                  <input
                    required
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full rounded-xl border border-white/15 bg-white/5 px-11 py-3 text-sm text-white outline-none transition focus:border-[#f4c26f] focus:ring-4 focus:ring-[#f4c26f]/15 placeholder:text-white/30"
                  />
                </div>
              </label>
              {error && (
                <div className="rounded-xl bg-[#fceceb]/15 px-3 py-2 text-xs font-semibold text-[#f0a8a4]">
                  {error}
                </div>
              )}
              <Button type="submit" disabled={loading} className="w-full !bg-[#f4c26f] !text-[#443116] hover:!bg-[#ffd080]">
                {loading ? 'Signing in…' : 'Sign in to console'} <ArrowRight size={16} />
              </Button>
            </form>

            <div className="mt-6 rounded-xl border border-white/8 bg-white/3 p-3.5 text-[11px] leading-5 text-white/45">
              <p className="font-bold text-white/60">Default admin credentials</p>
              <p className="mt-1">Email: {ADMIN_EMAIL}</p>
              <p>Password: Shlok@123</p>
            </div>
          </div>

          <Link href="/login" className="mt-6 flex items-center justify-center gap-2 text-sm font-bold text-white/50 hover:text-white/80">
            <ArrowLeft size={14} /> Back to user sign in
          </Link>
        </div>
      </div>
    </div>
  );
}

// ========================================
// ADMIN DASHBOARD
// ========================================
export function AdminDashboardView() {
  const { allBookings, user, parkingLocations, parkingSlots } = useApp();

  // Firestore calculated real-time slot statistics
  const totalSlots = parkingSlots.length || parkingLocations.reduce((sum, l) => sum + l.totalSlots, 0);
  const availableSlots = parkingSlots.filter((s) => s.status === 'available').length;
  const occupiedSlots = parkingSlots.filter((s) => s.status === 'occupied').length;
  const reservedSlots = parkingSlots.filter((s) => s.status === 'reserved').length;
  const maintenanceSlots = parkingSlots.filter((s) => s.status === 'maintenance').length;

  // Firestore calculated real-time booking statistics
  const totalBookings = allBookings.length;
  const confirmedBookings = allBookings.filter((b) => b.status === 'confirmed' || b.status === 'upcoming').length;
  const cancelledBookings = allBookings.filter((b) => b.status === 'cancelled').length;
  const completedBookings = allBookings.filter((b) => b.status === 'completed').length;
  const activeBookings = allBookings.filter((b) => b.status === 'active').length;

  const recent = allBookings.slice(0, 6);
  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div>
      <PageHeader
        eyebrow={today}
        title={`Welcome back, ${user?.name || 'Admin'}.`}
        detail="Real-time operator telemetry computed directly from Firestore collections."
        action={
          <div className="flex flex-wrap gap-2">
            <Link
              href="/admin/slots"
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#d5e2e6] bg-white px-3.5 py-2.5 text-xs font-bold text-[#36576a] hover:bg-[#f1f7f7]"
            >
              <Activity size={14} /> Manage slots
            </Link>
            <Link
              href="/admin/new-booking"
              className="inline-flex items-center gap-2 rounded-xl bg-[#153b5b] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#214d6d]"
            >
              <Plus size={15} /> New booking
            </Link>
          </div>
        }
      />

      {/* Section 1: Parking Space Metrics from Firestore */}
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-xs font-bold uppercase tracking-[.14em] text-[#71858f]">
          Parking Slot Capacity (Firestore: ParkingSlots)
        </h2>
        <span className="flex items-center gap-1.5 text-[11px] font-bold text-[#287850]">
          <span className="h-2 w-2 rounded-full bg-[#34a853] pulse-dot" /> Live Firestore listener
        </span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard label="Total parking slots" value={`${totalSlots}`} icon={ParkingSquare} tone="navy" />
        <StatCard label="Available slots" value={`${availableSlots}`} icon={Gauge} tone="green" />
        <StatCard label="Occupied slots" value={`${occupiedSlots}`} icon={Car} tone="teal" />
        <StatCard label="Reserved slots" value={`${reservedSlots}`} icon={Clock3} tone="gold" />
        <StatCard label="Maintenance slots" value={`${maintenanceSlots}`} icon={Wrench} tone="navy" />
      </div>

      {/* Section 2: Booking Metrics from Firestore */}
      <div className="mb-2 mt-6 flex items-center justify-between">
        <h2 className="text-xs font-bold uppercase tracking-[.14em] text-[#71858f]">
          Reservations Telemetry (Firestore: bookings)
        </h2>
        <Link href="/admin/reservations" className="text-xs font-bold text-[#286b70] hover:underline">
          View all bookings →
        </Link>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total bookings" value={`${totalBookings}`} icon={CalendarDays} tone="navy" />
        <StatCard label="Confirmed bookings" value={`${confirmedBookings}`} icon={CheckCircle2} tone="green" />
        <StatCard label="Cancelled bookings" value={`${cancelledBookings}`} icon={XCircle} tone="gold" />
        <StatCard label="Completed trips" value={`${completedBookings}`} icon={CreditCard} tone="teal" />
      </div>

      {/* Section 3: Live Locations and Recent Reservations */}
      <div className="mt-6 grid gap-5 xl:grid-cols-[1.1fr_.9fr]">
        <section className="rounded-2xl border border-[#dfe7eb] bg-white p-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-lg font-bold text-[#294a5f]">Live parking locations</h2>
              <p className="mt-1 text-xs text-[#84939b]">Real-time capacity from Firestore: parkingLocation</p>
            </div>
            <Link href="/admin/locations" className="text-xs font-bold text-[#286b70]">
              Manage locations
            </Link>
          </div>

          <div className="mt-4 space-y-3">
            {parkingLocations.length ? (
              parkingLocations.map((location) => (
                <div key={location.id} className="flex items-center justify-between rounded-xl bg-[#f5f8f8] p-3.5">
                  <div className="min-w-0 flex-1 pr-3">
                    <p className="truncate text-xs font-bold text-[#345064]">{location.name}</p>
                    <p className="mt-0.5 truncate text-[11px] text-[#8b9aa1]">{location.address}</p>
                    <p className="mt-1 text-[10px] font-semibold text-[#287850]">
                      {location.availableSlots} available of {location.totalSlots} slots · ₹{location.pricePerHour}/hr
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-20 overflow-hidden rounded-full bg-[#dfeae5]">
                      <div
                        className="h-full rounded-full bg-[#43947c] transition-all duration-300"
                        style={{ width: `${(location.availableSlots / Math.max(1, location.totalSlots)) * 100}%` }}
                      />
                    </div>
                    <Link
                      href="/admin/slots"
                      className="rounded-lg border border-[#d5e2e6] bg-white px-2.5 py-1 text-[10px] font-bold text-[#345064] hover:bg-[#edf4f4]"
                    >
                      Slots
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-[#8b9aa1]">No parking locations found in Firestore.</p>
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-[#dfe7eb] bg-white p-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-lg font-bold text-[#294a5f]">Recent reservations</h2>
              <p className="mt-1 text-xs text-[#84939b]">Real-time queue across Parkwise</p>
            </div>
            <Link href="/admin/reservations" className="text-xs font-bold text-[#286b70]">
              Open queue <ArrowRight size={13} className="ml-1 inline" />
            </Link>
          </div>

          {recent.length ? (
            <div className="mt-4 space-y-2.5">
              {recent.map((booking) => (
                <div key={booking.id} className="flex items-center justify-between rounded-xl bg-[#f5f8f8] p-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[#e7eef7] text-[#3b6482]">
                      <CalendarDays size={14} />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-xs font-bold text-[#345064]">{booking.locationName}</p>
                      <p className="text-[10px] text-[#8b9aa1]">
                        {booking.id} · {booking.userName || 'Walk-in'} · Slot {booking.slot} · {booking.date}
                      </p>
                    </div>
                  </div>
                  <StatusBadge status={booking.status} />
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-4">
              <EmptyState
                icon={CalendarDays}
                title="No bookings yet"
                detail="Bookings created in the app will stream here automatically."
                action={
                  <Link
                    href="/admin/new-booking"
                    className="inline-flex items-center gap-2 rounded-xl bg-[#153b5b] px-4 py-2 text-xs font-bold text-white"
                  >
                    <Plus size={14} /> Create booking
                  </Link>
                }
              />
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

// ========================================
// ADMIN PARKING LOCATIONS
// ========================================
export function AdminLocationsPage() {
  const {
    parkingLocations,
    adminAddParkingLocation,
    adminUpdateParkingLocation,
    adminDeleteParkingLocation,
  } = useApp();

  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editLocation, setEditLocation] = useState<ParkingLocation | null>(null);
  const [deleteLocation, setDeleteLocation] = useState<ParkingLocation | null>(null);

  const filtered = parkingLocations.filter((loc) => {
    const text = `${loc.name} ${loc.address} ${loc.zone || ''}`.toLowerCase();
    return text.includes(search.toLowerCase());
  });

  return (
    <div>
      <PageHeader
        eyebrow="Network inventory"
        title="Parking locations"
        detail="Manage locations, capacity, pricing, and operating rules directly in Firestore: parkingLocation."
        action={
          <Button onClick={() => setShowAddModal(true)}>
            <Plus size={15} /> Add parking location
          </Button>
        }
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex flex-1 items-center gap-2 rounded-xl border border-[#d9e4e8] bg-white px-4">
          <Search size={16} className="text-[#81949d]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by location name or address…"
            className="w-full bg-transparent py-3 text-sm outline-none placeholder:text-[#9aabb2]"
          />
        </div>
      </div>

      {filtered.length ? (
        <div className="overflow-hidden rounded-2xl border border-[#dfe7eb] bg-white">
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full text-left">
              <thead className="bg-[#f5f8f8] text-[10px] font-bold uppercase tracking-[.1em] text-[#8a999f]">
                <tr>
                  {['Location Name', 'Address', 'Hourly Rate', 'Total Capacity', 'Available Now', 'Facilities', 'Actions'].map((header) => (
                    <th key={header} className="px-5 py-3.5 font-bold">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#edf1f2] text-xs">
                {filtered.map((location) => (
                  <tr key={location.id} className="hover:bg-[#fbfcfc]">
                    <td className="px-5 py-4 font-bold text-[#345064]">{location.name}</td>
                    <td className="px-5 py-4 text-[#7c8c94]">{location.address}</td>
                    <td className="px-5 py-4 font-bold text-[#345064]">₹{location.pricePerHour}/hr</td>
                    <td className="px-5 py-4 font-semibold text-[#345064]">{location.totalSlots} bays</td>
                    <td className="px-5 py-4 font-semibold text-[#27784f]">
                      <span className="inline-flex items-center gap-1 rounded-md bg-[#e3f3e9] px-2 py-1 text-xs font-bold text-[#287850]">
                        {location.availableSlots} available
                      </span>
                    </td>
                    <td className="px-5 py-4 text-[#7c8c94]">
                      <div className="flex flex-wrap gap-1 max-w-[200px]">
                        {location.facilities.slice(0, 3).map((f) => (
                          <span key={f} className="rounded bg-[#f0f4f5] px-1.5 py-0.5 text-[10px] text-[#556973]">
                            {f}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setEditLocation(location)}
                          className="inline-flex items-center gap-1 rounded-lg border border-[#d5e2e6] bg-white px-2.5 py-1.5 text-xs font-bold text-[#36576a] hover:bg-[#f1f7f7]"
                        >
                          <Edit2 size={13} /> Edit
                        </button>
                        <button
                          onClick={() => setDeleteLocation(location)}
                          className="inline-flex items-center gap-1 rounded-lg border border-[#f1ceca] bg-white px-2.5 py-1.5 text-xs font-bold text-[#b2534e] hover:bg-[#fdf1f0]"
                        >
                          <Trash2 size={13} /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="divide-y divide-[#edf1f2] md:hidden">
            {filtered.map((location) => (
              <div key={location.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-[#345064]">{location.name}</h3>
                    <p className="mt-1 text-xs text-[#7c8c94]">{location.address}</p>
                    <p className="mt-1 text-xs font-bold text-[#287850]">
                      ₹{location.pricePerHour}/hr · {location.availableSlots}/{location.totalSlots} available
                    </p>
                  </div>
                </div>
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => setEditLocation(location)}
                    className="flex-1 rounded-lg border border-[#d5e2e6] py-2 text-xs font-bold text-[#36576a] hover:bg-[#f1f7f7]"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => setDeleteLocation(location)}
                    className="flex-1 rounded-lg border border-[#f1ceca] py-2 text-xs font-bold text-[#b2534e] hover:bg-[#fdf1f0]"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <EmptyState
          icon={MapPin}
          title={search ? 'No locations match your search' : 'No parking locations yet'}
          detail="Locations saved in the parkingLocation collection will appear here in real time."
          action={
            <Button onClick={() => setShowAddModal(true)}>
              <Plus size={14} /> Add parking location
            </Button>
          }
        />
      )}

      {/* Add Location Modal */}
      {showAddModal && (
        <LocationModal
          title="Add Parking Location"
          onClose={() => setShowAddModal(false)}
          onSave={async (data) => {
            await adminAddParkingLocation(data);
            setShowAddModal(false);
          }}
        />
      )}

      {/* Edit Location Modal */}
      {editLocation && (
        <LocationModal
          title="Edit Parking Location"
          initialData={editLocation}
          onClose={() => setEditLocation(null)}
          onSave={async (data) => {
            await adminUpdateParkingLocation(editLocation.id, data);
            setEditLocation(null);
          }}
        />
      )}

      {/* Delete Location Confirmation */}
      {deleteLocation && (
        <DeleteConfirmModal
          title="Delete Parking Location"
          message={`Are you sure you want to delete "${deleteLocation.name}"? This action removes the document from Firestore: parkingLocation.`}
          onClose={() => setDeleteLocation(null)}
          onConfirm={async () => {
            await adminDeleteParkingLocation(deleteLocation.id);
            setDeleteLocation(null);
          }}
        />
      )}
    </div>
  );
}

function LocationModal({
  title,
  initialData,
  onClose,
  onSave,
}: {
  title: string;
  initialData?: ParkingLocation;
  onClose: () => void;
  onSave: (data: {
    name: string;
    address: string;
    pricePerHour: number;
    totalSlots: number;
    zone?: string;
    hours?: string;
    facilities?: string[];
  }) => Promise<void>;
}) {
  const [name, setName] = useState(initialData?.name || '');
  const [address, setAddress] = useState(initialData?.address || '');
  const [pricePerHour, setPricePerHour] = useState(initialData?.pricePerHour || 30);
  const [totalSlots, setTotalSlots] = useState(initialData?.totalSlots || 4);
  const [zone, setZone] = useState(initialData?.zone || 'Central');
  const [hours, setHours] = useState(initialData?.hours || 'Open 24 hours');
  const [facilities, setFacilities] = useState(initialData?.facilities?.join(', ') || 'Covered, EV charging, 24/7, CCTV');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return setError('Please enter a location name.');
    if (!address.trim()) return setError('Please enter an address.');
    setLoading(true);
    try {
      await onSave({
        name: name.trim(),
        address: address.trim(),
        pricePerHour: Number(pricePerHour) || 30,
        totalSlots: Number(totalSlots) || 4,
        zone: zone.trim(),
        hours: hours.trim(),
        facilities: facilities.split(',').map((s) => s.trim()).filter(Boolean),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save location.');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] grid place-items-center bg-[#122f49]/50 p-5" onClick={onClose}>
      <div className="w-full max-w-[500px] rounded-3xl bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between">
          <div>
            <h2 className="font-display text-xl font-bold text-[#183653]">{title}</h2>
            <p className="mt-1 text-xs text-[#8b999f]">Saves to Firestore collection: parkingLocation</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-[#8a999f] hover:bg-[#f5f8f8]">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={submit} className="mt-5 space-y-4">
          <label className="block text-xs font-bold text-[#506875]">
            Location Name
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. City Center Parking"
              className="mt-1.5 w-full rounded-xl border border-[#d9e4e8] px-3.5 py-2.5 text-sm outline-none focus:border-[#7faeb5]"
            />
          </label>

          <label className="block text-xs font-bold text-[#506875]">
            Address
            <input
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. Sector 12, Kharghar, Navi Mumbai"
              className="mt-1.5 w-full rounded-xl border border-[#d9e4e8] px-3.5 py-2.5 text-sm outline-none focus:border-[#7faeb5]"
            />
          </label>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-xs font-bold text-[#506875]">
              Hourly Rate (₹)
              <input
                required
                type="number"
                min="1"
                value={pricePerHour}
                onChange={(e) => setPricePerHour(Number(e.target.value))}
                className="mt-1.5 w-full rounded-xl border border-[#d9e4e8] px-3.5 py-2.5 text-sm outline-none focus:border-[#7faeb5]"
              />
            </label>
            <label className="block text-xs font-bold text-[#506875]">
              Total Capacity (Slots)
              <input
                required
                type="number"
                min="1"
                value={totalSlots}
                onChange={(e) => setTotalSlots(Number(e.target.value))}
                className="mt-1.5 w-full rounded-xl border border-[#d9e4e8] px-3.5 py-2.5 text-sm outline-none focus:border-[#7faeb5]"
              />
            </label>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-xs font-bold text-[#506875]">
              Zone / Area
              <input
                value={zone}
                onChange={(e) => setZone(e.target.value)}
                placeholder="e.g. Central, East"
                className="mt-1.5 w-full rounded-xl border border-[#d9e4e8] px-3.5 py-2.5 text-sm outline-none focus:border-[#7faeb5]"
              />
            </label>
            <label className="block text-xs font-bold text-[#506875]">
              Operating Hours
              <input
                value={hours}
                onChange={(e) => setHours(e.target.value)}
                placeholder="e.g. Open 24 hours"
                className="mt-1.5 w-full rounded-xl border border-[#d9e4e8] px-3.5 py-2.5 text-sm outline-none focus:border-[#7faeb5]"
              />
            </label>
          </div>

          <label className="block text-xs font-bold text-[#506875]">
            Facilities (comma separated)
            <input
              value={facilities}
              onChange={(e) => setFacilities(e.target.value)}
              placeholder="Covered, EV charging, 24/7, CCTV"
              className="mt-1.5 w-full rounded-xl border border-[#d9e4e8] px-3.5 py-2.5 text-sm outline-none focus:border-[#7faeb5]"
            />
          </label>

          {error && (
            <div className="rounded-xl bg-[#fceceb] px-3 py-2 text-xs font-semibold text-[#aa504c]">
              {error}
            </div>
          )}

          <div className="mt-6 flex gap-2 pt-2">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Saving…' : 'Save location'}
            </Button>
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ========================================
// ADMIN PARKING SLOTS
// ========================================
export function AdminSlotsPage() {
  const { parkingSlots, parkingLocations, adminUpdateSlotStatus, adminAddParkingSlot, adminDeleteParkingSlot } = useApp();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [deleteSlotId, setDeleteSlotId] = useState<string | null>(null);
  const [updatingSlotId, setUpdatingSlotId] = useState<string | null>(null);

  const statuses: SlotStatus[] = ['available', 'occupied', 'reserved', 'maintenance'];

  const filtered = parkingSlots.filter((slot) => {
    const matchesStatus = statusFilter === 'all' || slot.status === statusFilter;
    const text = `${slot.label} ${slot.id} ${slot.locationId || ''} ${slot.sensorId || ''}`.toLowerCase();
    return matchesStatus && text.includes(search.toLowerCase());
  });

  const handleManualStatusChange = async (slotId: string, nextStatus: SlotStatus) => {
    setUpdatingSlotId(slotId);
    try {
      await adminUpdateSlotStatus(slotId, nextStatus);
    } catch (err) {
      console.error('Failed to change slot status:', err);
    } finally {
      setUpdatingSlotId(null);
    }
  };

  return (
    <div>
      <PageHeader
        eyebrow="Space-level control"
        title="Parking slots"
        detail="Inspect bays, sensor IDs, and test manual status overrides in Firestore: ParkingSlots."
        action={
          <Button onClick={() => setShowAddModal(true)}>
            <Plus size={15} /> Add parking slot
          </Button>
        }
      />

      {/* Status counts bar */}
      <div className="mb-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex items-center justify-between rounded-2xl border border-[#dfe7eb] bg-white p-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[.1em] text-[#8a999f]">Total bays</p>
            <p className="mt-1 font-display text-2xl font-bold text-[#183653]">{parkingSlots.length}</p>
          </div>
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#edf4f8] text-[#153b5b]">
            <ParkingSquare size={20} />
          </span>
        </div>
        <div className="flex items-center justify-between rounded-2xl border border-[#dfe7eb] bg-white p-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[.1em] text-[#8a999f]">Available</p>
            <p className="mt-1 font-display text-2xl font-bold text-[#287850]">
              {parkingSlots.filter((s) => s.status === 'available').length}
            </p>
          </div>
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#e3f3e9] text-[#287850]">
            <CheckCircle2 size={20} />
          </span>
        </div>
        <div className="flex items-center justify-between rounded-2xl border border-[#dfe7eb] bg-white p-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[.1em] text-[#8a999f]">Occupied</p>
            <p className="mt-1 font-display text-2xl font-bold text-[#20496d]">
              {parkingSlots.filter((s) => s.status === 'occupied').length}
            </p>
          </div>
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#e6eff5] text-[#20496d]">
            <Car size={20} />
          </span>
        </div>
        <div className="flex items-center justify-between rounded-2xl border border-[#dfe7eb] bg-white p-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[.1em] text-[#8a999f]">Reserved / Maint</p>
            <p className="mt-1 font-display text-2xl font-bold text-[#c28636]">
              {parkingSlots.filter((s) => s.status === 'reserved' || s.status === 'maintenance').length}
            </p>
          </div>
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#fef5e7] text-[#c28636]">
            <Clock3 size={20} />
          </span>
        </div>
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex flex-1 items-center gap-2 rounded-xl border border-[#d9e4e8] bg-white px-4">
          <Search size={16} className="text-[#81949d]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by slot number, location, or sensor ID…"
            className="w-full bg-transparent py-3 text-sm outline-none placeholder:text-[#9aabb2]"
          />
        </div>
        <div className="flex gap-1 overflow-x-auto rounded-xl bg-[#eaf0f1] p-1">
          {[['all', 'All'], ['available', 'Available'], ['occupied', 'Occupied'], ['reserved', 'Reserved'], ['maintenance', 'Maintenance']].map(
            ([val, lbl]) => (
              <button
                key={val}
                onClick={() => setStatusFilter(val)}
                className={`whitespace-nowrap rounded-lg px-3.5 py-2 text-xs font-bold transition-all ${
                  statusFilter === val ? 'bg-white text-[#234b63] shadow-sm' : 'text-[#82939c] hover:text-[#345064]'
                }`}
              >
                {lbl}
              </button>
            ),
          )}
        </div>
      </div>

      <div className="mb-3 flex items-center justify-between rounded-xl bg-[#eef5f3] px-4 py-2.5 text-xs text-[#2c6569]">
        <span className="flex items-center gap-2 font-bold">
          <Activity size={15} /> Real-time Manual Testing Override
        </span>
        <span className="text-[11px] text-[#4d7f83]">
          Click any status pill to update the Firestore document instantly.
        </span>
      </div>

      {filtered.length ? (
        <div className="overflow-hidden rounded-2xl border border-[#dfe7eb] bg-white">
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full text-left">
              <thead className="bg-[#f5f8f8] text-[10px] font-bold uppercase tracking-[.1em] text-[#8a999f]">
                <tr>
                  {['Slot number', 'Location', 'Status', 'Sensor ID', 'Last updated', 'Manual status override (testing)', 'Actions'].map(
                    (header) => (
                      <th key={header} className="px-4 py-3.5 font-bold">
                        {header}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#edf1f2] text-xs">
                {filtered.map((slot) => {
                  const locationObj = parkingLocations.find((l) => l.id === slot.locationId);
                  const locationName = locationObj ? locationObj.name : slot.locationId || 'SmartPark Metro';
                  const isUpdating = updatingSlotId === slot.id;

                  return (
                    <tr key={slot.id} className="hover:bg-[#fbfcfc]">
                      <td className="px-4 py-4 font-mono font-bold text-[#345064]">
                        <span className="rounded-lg bg-[#f0f4f5] px-2.5 py-1 text-sm font-bold text-[#183653]">
                          {slot.label}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-[#556c78]">
                        <p className="font-semibold text-[#345064]">{locationName}</p>
                        <p className="text-[10px] text-[#8b9aa1]">{slot.locationId || 'default'}</p>
                      </td>
                      <td className="px-4 py-4">
                        <StatusBadge status={slot.status} />
                      </td>
                      <td className="px-4 py-4 font-mono text-xs text-[#526d7c]">{slot.sensorId || `ESP32-${slot.label}`}</td>
                      <td className="px-4 py-4 text-[#8b9aa1]">{slot.lastUpdated}</td>
                      <td className="px-4 py-4">
                        <div className="flex flex-wrap gap-1.5">
                          {statuses.map((st) => (
                            <button
                              key={st}
                              disabled={isUpdating || slot.status === st}
                              onClick={() => handleManualStatusChange(slot.id, st)}
                              className={`rounded-lg px-2.5 py-1 text-[11px] font-bold capitalize transition-all ${
                                slot.status === st
                                  ? st === 'available'
                                    ? 'bg-[#287850] text-white shadow-sm'
                                    : st === 'occupied'
                                    ? 'bg-[#214b69] text-white shadow-sm'
                                    : st === 'reserved'
                                    ? 'bg-[#d99726] text-white shadow-sm'
                                    : 'bg-[#7c8b93] text-white shadow-sm'
                                  : 'border border-[#d5e2e6] bg-white text-[#526a78] hover:bg-[#f2f7f7]'
                              }`}
                            >
                              {slot.status === st && <Check size={10} className="mr-1 inline" />}
                              {st}
                            </button>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <button
                          onClick={() => setDeleteSlotId(slot.id)}
                          className="rounded-lg p-1.5 text-[#b2534e] hover:bg-[#fdf1f0]"
                          title="Delete slot"
                        >
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="divide-y divide-[#edf1f2] md:hidden">
            {filtered.map((slot) => {
              const locationObj = parkingLocations.find((l) => l.id === slot.locationId);
              const locationName = locationObj ? locationObj.name : slot.locationId || 'SmartPark Metro';

              return (
                <div key={slot.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="rounded-lg bg-[#f0f4f5] px-2.5 py-1 font-mono text-sm font-bold text-[#183653]">
                        {slot.label}
                      </span>
                      <p className="mt-2 text-xs font-semibold text-[#345064]">{locationName}</p>
                      <p className="text-[10px] text-[#8b9aa1]">Sensor: {slot.sensorId || `ESP32-${slot.label}`}</p>
                      <p className="text-[10px] text-[#8b9aa1]">Updated: {slot.lastUpdated}</p>
                    </div>
                    <StatusBadge status={slot.status} />
                  </div>

                  <div className="mt-3">
                    <p className="mb-1.5 text-[10px] font-bold uppercase tracking-[.1em] text-[#8b9aa1]">
                      Change status (Testing):
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {statuses.map((st) => (
                        <button
                          key={st}
                          onClick={() => handleManualStatusChange(slot.id, st)}
                          className={`rounded-lg px-2.5 py-1 text-[11px] font-bold capitalize transition-all ${
                            slot.status === st
                              ? 'bg-[#153b5b] text-white shadow-sm'
                              : 'border border-[#d5e2e6] bg-white text-[#526a78] hover:bg-[#f2f7f7]'
                          }`}
                        >
                          {st}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <EmptyState
          icon={ParkingSquare}
          title={search ? 'No slots match your search' : 'No slots found'}
          detail="Slots in the ParkingSlots collection will appear here automatically."
          action={
            <Button onClick={() => setShowAddModal(true)}>
              <Plus size={14} /> Add parking slot
            </Button>
          }
        />
      )}

      {/* Add Slot Modal */}
      {showAddModal && (
        <AddSlotModal
          locations={parkingLocations}
          onClose={() => setShowAddModal(false)}
          onSave={async (data) => {
            await adminAddParkingSlot(data);
            setShowAddModal(false);
          }}
        />
      )}

      {/* Delete Slot Modal */}
      {deleteSlotId && (
        <DeleteConfirmModal
          title="Delete Parking Slot"
          message={`Are you sure you want to delete slot "${deleteSlotId}" from Firestore: ParkingSlots?`}
          onClose={() => setDeleteSlotId(null)}
          onConfirm={async () => {
            await adminDeleteParkingSlot(deleteSlotId);
            setDeleteSlotId(null);
          }}
        />
      )}
    </div>
  );
}

function AddSlotModal({
  locations,
  onClose,
  onSave,
}: {
  locations: ParkingLocation[];
  onClose: () => void;
  onSave: (data: {
    slotNumber: string;
    locationId?: string;
    sensor?: string;
    status?: SlotStatus;
    floor?: string;
  }) => Promise<void>;
}) {
  const [slotNumber, setSlotNumber] = useState('');
  const [locationId, setLocationId] = useState(locations[0]?.id || 'metropark_001');
  const [sensor, setSensor] = useState('');
  const [status, setStatus] = useState<SlotStatus>('available');
  const [floor, setFloor] = useState('P1');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!slotNumber.trim()) return setError('Please enter a slot number (e.g. A5, B2).');
    setLoading(true);
    try {
      await onSave({
        slotNumber: slotNumber.trim(),
        locationId,
        sensor: sensor.trim() || `ESP32-${slotNumber.trim()}`,
        status,
        floor,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to create slot.');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] grid place-items-center bg-[#122f49]/50 p-5" onClick={onClose}>
      <div className="w-full max-w-[460px] rounded-3xl bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between">
          <div>
            <h2 className="font-display text-xl font-bold text-[#183653]">Add Parking Slot</h2>
            <p className="mt-1 text-xs text-[#8b999f]">Saves document into Firestore: ParkingSlots</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-[#8a999f] hover:bg-[#f5f8f8]">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={submit} className="mt-5 space-y-4">
          <label className="block text-xs font-bold text-[#506875]">
            Slot Number / Label
            <input
              required
              value={slotNumber}
              onChange={(e) => {
                setSlotNumber(e.target.value);
                if (!sensor) setSensor(`ESP32-${e.target.value.toUpperCase()}`);
              }}
              placeholder="e.g. A5, B1"
              className="mt-1.5 w-full rounded-xl border border-[#d9e4e8] px-3.5 py-2.5 text-sm outline-none focus:border-[#7faeb5]"
            />
          </label>

          <label className="block text-xs font-bold text-[#506875]">
            Parking Location
            <select
              value={locationId}
              onChange={(e) => setLocationId(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-[#d9e4e8] bg-white px-3.5 py-2.5 text-sm outline-none focus:border-[#7faeb5]"
            >
              {locations.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.name}
                </option>
              ))}
            </select>
          </label>

          <label className="block text-xs font-bold text-[#506875]">
            Sensor ID
            <input
              value={sensor}
              onChange={(e) => setSensor(e.target.value)}
              placeholder="e.g. ESP32-A5"
              className="mt-1.5 w-full rounded-xl border border-[#d9e4e8] px-3.5 py-2.5 text-sm outline-none focus:border-[#7faeb5]"
            />
          </label>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-xs font-bold text-[#506875]">
              Initial Status
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as SlotStatus)}
                className="mt-1.5 w-full rounded-xl border border-[#d9e4e8] bg-white px-3.5 py-2.5 text-sm outline-none focus:border-[#7faeb5]"
              >
                <option value="available">available</option>
                <option value="occupied">occupied</option>
                <option value="reserved">reserved</option>
                <option value="maintenance">maintenance</option>
              </select>
            </label>
            <label className="block text-xs font-bold text-[#506875]">
              Floor / Level
              <input
                value={floor}
                onChange={(e) => setFloor(e.target.value)}
                placeholder="P1, Ground"
                className="mt-1.5 w-full rounded-xl border border-[#d9e4e8] px-3.5 py-2.5 text-sm outline-none focus:border-[#7faeb5]"
              />
            </label>
          </div>

          {error && (
            <div className="rounded-xl bg-[#fceceb] px-3 py-2 text-xs font-semibold text-[#aa504c]">
              {error}
            </div>
          )}

          <div className="mt-6 flex gap-2 pt-2">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Creating slot…' : 'Create slot'}
            </Button>
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DeleteConfirmModal({
  title,
  message,
  onClose,
  onConfirm,
}: {
  title: string;
  message: string;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}) {
  const [loading, setLoading] = useState(false);

  const handle = async () => {
    setLoading(true);
    try {
      await onConfirm();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] grid place-items-center bg-[#122f49]/50 p-5" onClick={onClose}>
      <div className="w-full max-w-[420px] rounded-3xl bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3 text-[#b2534e]">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#fdf1f0]">
            <AlertTriangle size={20} />
          </span>
          <h2 className="font-display text-lg font-bold text-[#183653]">{title}</h2>
        </div>
        <p className="mt-3 text-xs leading-5 text-[#6b7c85]">{message}</p>
        <div className="mt-6 flex gap-2">
          <Button variant="danger" disabled={loading} onClick={handle} className="flex-1">
            {loading ? 'Deleting…' : 'Yes, delete'}
          </Button>
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}

// ========================================
// ADMIN BOOKINGS / RESERVATIONS
// ========================================
export function AdminReservationsPage() {
  const { allBookings, adminCancelBooking, adminUpdateBookingStatus } = useApp();
  const [tab, setTab] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [actionBooking, setActionBooking] = useState<Booking | null>(null);

  const filtered = allBookings.filter((booking) => {
    const matchesTab = tab === 'all' || booking.status === tab;
    const text = `${booking.id} ${booking.locationName} ${booking.userName || ''} ${booking.userEmail || ''} ${booking.slot}`.toLowerCase();
    const matchesSearch = text.includes(search.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const stats = {
    total: allBookings.length,
    confirmed: allBookings.filter((b) => b.status === 'confirmed' || b.status === 'upcoming').length,
    active: allBookings.filter((b) => b.status === 'active').length,
    cancelled: allBookings.filter((b) => b.status === 'cancelled').length,
    revenue: allBookings.filter((b) => b.status === 'completed').reduce((sum, b) => sum + b.amount, 0),
  };

  return (
    <div>
      <PageHeader
        eyebrow="Booking queue"
        title="All reservations"
        detail="Manage every booking across the Parkwise network in real time from Firestore: bookings."
        action={
          <Link
            href="/admin/new-booking"
            className="inline-flex items-center gap-2 rounded-xl bg-[#153b5b] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#214d6d]"
          >
            <Plus size={15} /> New booking
          </Link>
        }
      />

      <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total bookings" value={`${stats.total}`} icon={CalendarDays} />
        <StatCard label="Confirmed" value={`${stats.confirmed}`} icon={CheckCircle2} tone="green" />
        <StatCard label="Cancelled" value={`${stats.cancelled}`} icon={XCircle} tone="gold" />
        <StatCard label="Revenue (completed)" value={money(stats.revenue)} icon={CreditCard} tone="teal" />
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex flex-1 items-center gap-2 rounded-xl border border-[#d9e4e8] bg-white px-4">
          <Search size={16} className="text-[#81949d]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by booking ID, location, user, or slot…"
            className="w-full bg-transparent py-3 text-sm outline-none placeholder:text-[#9aabb2]"
          />
        </div>
        <div className="flex gap-1 overflow-x-auto rounded-xl bg-[#eaf0f1] p-1">
          {[
            ['all', 'All'],
            ['confirmed', 'Confirmed'],
            ['active', 'Active'],
            ['completed', 'Completed'],
            ['cancelled', 'Cancelled'],
          ].map(([value, label]) => (
            <button
              key={value}
              onClick={() => setTab(value)}
              className={`whitespace-nowrap rounded-lg px-4 py-2 text-xs font-bold ${
                tab === value ? 'bg-white text-[#234b63] shadow-sm' : 'text-[#82939c]'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length ? (
        <div className="overflow-hidden rounded-2xl border border-[#dfe7eb] bg-white">
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full text-left">
              <thead className="bg-[#f5f8f8] text-[10px] font-bold uppercase tracking-[.1em] text-[#8a999f]">
                <tr>
                  {[
                    'Booking ID',
                    'User',
                    'Parking location',
                    'Slot',
                    'Date',
                    'Start time',
                    'End time',
                    'Amount',
                    'Status',
                    'Actions',
                  ].map((header) => (
                    <th key={header} className="px-4 py-3.5 font-bold">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#edf1f2] text-xs">
                {filtered.map((booking) => {
                  const startTime = booking.startTime || booking.time?.split('-')[0]?.trim() || '10:00 AM';
                  const endTime = booking.endTime || booking.time?.split('-')[1]?.trim() || '12:00 PM';

                  return (
                    <tr key={booking.id} className="hover:bg-[#fbfcfc]">
                      <td className="px-4 py-4 font-mono font-bold text-[#345064]">{booking.id}</td>
                      <td className="px-4 py-4">
                        <p className="font-semibold text-[#345064]">{booking.userName || 'Walk-in'}</p>
                        <p className="text-[10px] text-[#8b9aa1]">{booking.userEmail || '—'}</p>
                      </td>
                      <td className="px-4 py-4 text-[#526a78]">{booking.locationName}</td>
                      <td className="px-4 py-4 font-bold text-[#345064]">
                        <span className="rounded-md bg-[#f0f4f5] px-2 py-0.5 font-mono">{booking.slot}</span>
                      </td>
                      <td className="px-4 py-4 text-[#526a78]">{booking.date}</td>
                      <td className="px-4 py-4 text-[#526a78] font-semibold">{startTime}</td>
                      <td className="px-4 py-4 text-[#526a78] font-semibold">{endTime}</td>
                      <td className="px-4 py-4 font-bold text-[#345064]">{money(booking.amount)}</td>
                      <td className="px-4 py-4">
                        <StatusBadge status={booking.status} />
                      </td>
                      <td className="px-4 py-4">
                        <button
                          onClick={() => setActionBooking(booking)}
                          className="rounded-lg border border-[#d5e2e6] px-2.5 py-1.5 text-[10px] font-bold text-[#36576a] hover:bg-[#f1f7f7]"
                        >
                          Manage
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="divide-y divide-[#edf1f2] md:hidden">
            {filtered.map((booking) => (
              <div key={booking.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-mono text-[10px] font-bold text-[#c28636]">{booking.id}</p>
                    <p className="mt-1 text-sm font-bold text-[#345064]">{booking.locationName}</p>
                    <p className="mt-1 text-xs text-[#7c8c94]">
                      {booking.userName || 'Walk-in'} · Slot {booking.slot}
                    </p>
                    <p className="mt-1 text-xs text-[#8b9aa1]">
                      {booking.date} · {booking.startTime || booking.time} · {money(booking.amount)}
                    </p>
                  </div>
                  <StatusBadge status={booking.status} />
                </div>
                <button
                  onClick={() => setActionBooking(booking)}
                  className="mt-3 w-full rounded-lg border border-[#d5e2e6] py-2 text-xs font-bold text-[#36576a] hover:bg-[#f1f7f7]"
                >
                  Manage booking
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <EmptyState
          icon={CalendarDays}
          title={search ? 'No bookings match your search' : 'No bookings yet'}
          detail={
            search
              ? 'Try a different search term or clear the filter.'
              : 'Bookings made by users will appear here in real time. You can also create one manually.'
          }
          action={
            <Link
              href="/admin/new-booking"
              className="inline-flex items-center gap-2 rounded-xl bg-[#153b5b] px-4 py-2.5 text-xs font-bold text-white"
            >
              <Plus size={14} /> Create booking
            </Link>
          }
        />
      )}

      {actionBooking && (
        <ManageBookingModal
          booking={actionBooking}
          onClose={() => setActionBooking(null)}
          onCancel={async (id) => {
            await adminCancelBooking(id, actionBooking.userId);
            setActionBooking(null);
          }}
          onUpdateStatus={async (id, status) => {
            await adminUpdateBookingStatus(id, status, actionBooking.userId);
            setActionBooking(null);
          }}
        />
      )}
    </div>
  );
}

function ManageBookingModal({
  booking,
  onClose,
  onCancel,
  onUpdateStatus,
}: {
  booking: Booking;
  onClose: () => void;
  onCancel: (id: string) => Promise<void>;
  onUpdateStatus: (id: string, status: BookingStatus) => Promise<void>;
}) {
  const [loading, setLoading] = useState(false);
  const statuses: BookingStatus[] = ['confirmed', 'active', 'completed', 'cancelled'];
  const displayStartTime = booking.startTime || booking.time?.split('-')[0]?.trim() || '10:00 AM';
  const displayEndTime = booking.endTime || booking.time?.split('-')[1]?.trim() || '12:00 PM';

  const handle = async (fn: () => Promise<void>) => {
    setLoading(true);
    try {
      await fn();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] grid place-items-center bg-[#122f49]/50 p-5" onClick={onClose}>
      <div className="w-full max-w-[480px] rounded-3xl bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between">
          <div>
            <p className="font-mono text-[10px] font-bold uppercase tracking-[.12em] text-[#c28636]">{booking.id}</p>
            <h2 className="mt-1 font-display text-xl font-bold text-[#183653]">{booking.locationName}</h2>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-[#8a999f] hover:bg-[#f5f8f8]">
            <X size={18} />
          </button>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {[
            ['User', booking.userName || 'Walk-in'],
            ['Email', booking.userEmail || '—'],
            ['Slot', booking.slot],
            ['Date', booking.date],
            ['Start Time', displayStartTime],
            ['End Time', displayEndTime],
            ['Duration', `${booking.duration} hours`],
            ['Amount', money(booking.amount)],
            ['Status', booking.status],
          ].map(([label, value]) => (
            <div key={label} className="rounded-xl bg-[#f5f8f8] p-3">
              <p className="text-[10px] font-bold uppercase tracking-[.1em] text-[#8b999f]">{label}</p>
              <p className="mt-1 text-sm font-bold text-[#345064] capitalize">{value}</p>
            </div>
          ))}
        </div>

        <div className="mt-5">
          <p className="mb-2 text-[11px] font-bold uppercase tracking-[.12em] text-[#84939b]">Change status</p>
          <div className="flex flex-wrap gap-2">
            {statuses.map((status) => (
              <button
                key={status}
                disabled={loading || status === booking.status}
                onClick={() => handle(() => onUpdateStatus(booking.id, status))}
                className={`rounded-xl border px-3 py-2 text-xs font-bold capitalize transition-colors ${
                  status === booking.status
                    ? 'border-[#98bcc3] bg-[#e6f2f1] text-[#286a70]'
                    : 'border-[#dfe7eb] bg-white text-[#71818b] hover:bg-[#f2f7f7]'
                }`}
              >
                {status === booking.status && <Check size={12} className="mr-1 inline" />}
                {status}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 flex gap-2">
          {booking.status !== 'cancelled' && (
            <Button variant="danger" disabled={loading} onClick={() => handle(() => onCancel(booking.id))} className="flex-1">
              Cancel booking
            </Button>
          )}
          <Button variant="outline" onClick={onClose} className="flex-1">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}

export function AdminNewBookingPage() {
  const { allUsers, adminCreateBooking, parkingLocations } = useApp();
  const [, setLocation] = useLocation();
  const [locationId, setLocationId] = useState('');
  const [slot, setSlot] = useState('');
  const [date, setDate] = useState(
    new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
  );
  const [time, setTime] = useState('12:00 PM');
  const [duration, setDuration] = useState(2);
  const [userMode, setUserMode] = useState<'walk-in' | 'existing'>('walk-in');
  const [selectedUserId, setSelectedUserId] = useState('');
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const activeLocationId = locationId || parkingLocations[0]?.id || '';
  const location = parkingLocations.find((l) => l.id === activeLocationId);
  const availableSlots = location?.slots.filter((s) => s.status === 'available') || [];

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    if (!slot) return setError('Select a parking slot.');
    if (!location) return setError('Select a parking location.');
    setLoading(true);
    try {
      let userId = 'walk-in';
      let userName = guestName;
      let userEmail = guestEmail;
      if (userMode === 'existing') {
        const selectedUser = allUsers.find((u) => u.id === selectedUserId);
        if (!selectedUser) return setError('Select a user.');
        userId = selectedUser.id;
        userName = selectedUser.name;
        userEmail = selectedUser.email;
      } else {
        if (!guestName.trim()) return setError('Enter a guest name.');
      }
      await adminCreateBooking({
        locationId: location.id,
        locationName: location.name,
        slot,
        date,
        time,
        duration,
        amount: location.pricePerHour * duration,
        userId,
        userName,
        userEmail,
      });
      setLocation('/admin/reservations');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to create booking.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Link href="/admin/reservations" className="mb-6 inline-flex items-center gap-2 text-xs font-bold text-[#6d838e]">
        <ArrowLeft size={14} />
        Back to reservations
      </Link>
      <PageHeader eyebrow="Manual entry" title="New booking" detail="Create a reservation on behalf of a user or walk-in guest." />

      <form onSubmit={submit} className="grid gap-5 lg:grid-cols-[1.2fr_.8fr]">
        <div className="space-y-5">
          <section className="rounded-2xl border border-[#dfe7eb] bg-white p-5">
            <h2 className="font-display text-lg font-bold text-[#294a5f]">Booking details</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <label className="text-xs font-bold text-[#71838d]">
                Parking location
                <select
                  value={activeLocationId}
                  onChange={(e) => {
                    setLocationId(e.target.value);
                    setSlot('');
                  }}
                  className="mt-1.5 w-full rounded-xl border border-[#d9e4e8] bg-white px-3 py-2.5 text-sm font-semibold text-[#345064] outline-none focus:border-[#7faeb5]"
                >
                  {parkingLocations.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-xs font-bold text-[#71838d]">
                Slot
                <select
                  value={slot}
                  onChange={(e) => setSlot(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-[#d9e4e8] bg-white px-3 py-2.5 text-sm font-semibold text-[#345064] outline-none focus:border-[#7faeb5]"
                >
                  <option value="">Select an available slot</option>
                  {availableSlots.map((s) => (
                    <option key={s.id} value={s.label}>
                      {s.label} ({s.floor})
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-xs font-bold text-[#71838d]">
                Arrival date
                <input
                  type="text"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-[#d9e4e8] px-3 py-2.5 text-sm font-semibold text-[#345064] outline-none focus:border-[#7faeb5]"
                />
              </label>
              <label className="text-xs font-bold text-[#71838d]">
                Arrival time
                <input
                  type="text"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-[#d9e4e8] px-3 py-2.5 text-sm font-semibold text-[#345064] outline-none focus:border-[#7faeb5]"
                />
              </label>
              <label className="text-xs font-bold text-[#71838d]">
                Duration
                <select
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="mt-1.5 w-full rounded-xl border border-[#d9e4e8] bg-white px-3 py-2.5 text-sm font-semibold text-[#345064] outline-none focus:border-[#7faeb5]"
                >
                  <option value="1">1 hour</option>
                  <option value="2">2 hours</option>
                  <option value="3">3 hours</option>
                  <option value="4">4 hours</option>
                </select>
              </label>
            </div>
          </section>

          <section className="rounded-2xl border border-[#dfe7eb] bg-white p-5">
            <h2 className="font-display text-lg font-bold text-[#294a5f]">Customer</h2>
            <div className="mt-4 flex gap-1 rounded-xl bg-[#eaf0f1] p-1">
              {[
                ['walk-in', 'Walk-in guest'],
                ['existing', 'Existing user'],
              ].map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setUserMode(value as 'walk-in' | 'existing')}
                  className={`flex-1 rounded-lg px-4 py-2 text-xs font-bold ${
                    userMode === value ? 'bg-white text-[#234b63] shadow-sm' : 'text-[#82939c]'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="mt-4">
              {userMode === 'existing' ? (
                <label className="text-xs font-bold text-[#71838d]">
                  Select user
                  <select
                    value={selectedUserId}
                    onChange={(e) => setSelectedUserId(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-[#d9e4e8] bg-white px-3 py-2.5 text-sm font-semibold text-[#345064] outline-none focus:border-[#7faeb5]"
                  >
                    <option value="">Choose a user…</option>
                    {allUsers.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} — {u.email}
                      </option>
                    ))}
                  </select>
                </label>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="text-xs font-bold text-[#71838d]">
                    Guest name
                    <input
                      type="text"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      placeholder="Walk-in customer"
                      className="mt-1.5 w-full rounded-xl border border-[#d9e4e8] px-3 py-2.5 text-sm font-semibold text-[#345064] outline-none focus:border-[#7faeb5]"
                    />
                  </label>
                  <label className="text-xs font-bold text-[#71838d]">
                    Guest email (optional)
                    <input
                      type="email"
                      value={guestEmail}
                      onChange={(e) => setGuestEmail(e.target.value)}
                      placeholder="guest@example.com"
                      className="mt-1.5 w-full rounded-xl border border-[#d9e4e8] px-3 py-2.5 text-sm font-semibold text-[#345064] outline-none focus:border-[#7faeb5]"
                    />
                  </label>
                </div>
              )}
            </div>
          </section>
        </div>

        <div className="h-fit rounded-2xl border border-[#dfe7eb] bg-white p-5 lg:sticky lg:top-[90px]">
          <p className="text-xs font-bold uppercase tracking-[.12em] text-[#c28636]">Summary</p>
          <h2 className="mt-2 font-display text-xl font-bold text-[#183653]">{location?.name || 'Select a location'}</h2>
          <div className="mt-5 space-y-3 text-xs">
            <div className="flex justify-between text-[#7b8d96]">
              <span>Slot</span>
              <strong className="text-[#345064]">{slot || '—'}</strong>
            </div>
            <div className="flex justify-between text-[#7b8d96]">
              <span>Date</span>
              <strong className="text-[#345064]">{date}</strong>
            </div>
            <div className="flex justify-between text-[#7b8d96]">
              <span>Time</span>
              <strong className="text-[#345064]">{time}</strong>
            </div>
            <div className="flex justify-between text-[#7b8d96]">
              <span>Duration</span>
              <strong className="text-[#345064]">{duration} hours</strong>
            </div>
            <div className="flex justify-between text-[#7b8d96]">
              <span>Rate</span>
              <strong className="text-[#345064]">{location ? `₹${location.pricePerHour} / hour` : '—'}</strong>
            </div>
            <div className="flex justify-between border-t border-[#e7edef] pt-3 text-sm font-bold text-[#183653]">
              <span>Total</span>
              <span>{location ? money(location.pricePerHour * duration) : '—'}</span>
            </div>
          </div>
          {error && (
            <div className="mt-4 rounded-xl bg-[#fceceb] px-3 py-2 text-xs font-semibold text-[#aa504c]">
              {error}
            </div>
          )}
          <Button type="submit" disabled={loading || !slot} className="mt-5 w-full">
            {loading ? 'Creating booking…' : 'Create booking'} <ArrowRight size={15} />
          </Button>
        </div>
      </form>
    </div>
  );
}
