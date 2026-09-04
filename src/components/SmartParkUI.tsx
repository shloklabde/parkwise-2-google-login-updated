import { useState, type ReactNode } from 'react';
import { Link, useLocation } from 'wouter';
import { ArrowRight, Bell, Building2, CalendarDays, Car, Check, ChevronRight, CircleHelp, Clock3, Command, Compass, CreditCard, Gauge, History, Home, LayoutDashboard, LogOut, MapPin, Menu, Navigation, ParkingSquare, Search, Settings, ShieldCheck, SlidersHorizontal, Sparkles, Star, UserRound, X, Zap } from 'lucide-react';
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'motion/react';
import { cn } from '@/lib/utils';
import { useApp } from '@/contexts/AppContext';
import { parkingLocations, type Booking, type ParkingLocation, type ParkingSlot, type SlotStatus } from '@/data/mock';
import BorderGlow from '@/components/ui/BorderGlow';
import { FloatingNav, type FloatingNavItem } from '@/components/ui/floating-navbar';

export function AppLogo({ dark = false }: { dark?: boolean }) {
  return <Link href="/" data-testid="link-logo" className="flex items-center gap-2.5">
    <span className={`grid h-9 w-9 place-items-center rounded-xl ${dark ? 'bg-white/10 text-[#f6bd60]' : 'bg-[#153b5b] text-[#f6bd60]'}`}><ParkingSquare size={19} strokeWidth={2.5} /></span>
    <span className={`font-display text-[17px] font-bold tracking-[-.04em] ${dark ? 'text-white' : 'text-[#183653]'}`}>park<span className="text-[#e9a84d]">wise</span></span>
  </Link>;
}

export function StatusBadge({ status, label }: { status: string; label?: string }) {
  const styles: Record<string, string> = {
    confirmed: 'bg-[#dcf4e9] text-[#18724b]', upcoming: 'bg-[#e8f1f7] text-[#255d78]', active: 'bg-[#dcf4e9] text-[#18724b]', completed: 'bg-[#eef0f3] text-[#5c6873]', cancelled: 'bg-[#fce9e8] text-[#ae4642]',
    available: 'bg-[#dcf4e9] text-[#18724b]', occupied: 'bg-[#fce9e8] text-[#ae4642]', reserved: 'bg-[#e8e9fb] text-[#5656a8]', maintenance: 'bg-[#fff0d5] text-[#95641c]', online: 'bg-[#dcf4e9] text-[#18724b]', offline: 'bg-[#fce9e8] text-[#ae4642]',
  };
  return <span data-testid={`status-${status}`} className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold capitalize ${styles[status.toLowerCase()] || 'bg-muted text-muted-foreground'}`}><span className="h-1.5 w-1.5 rounded-full bg-current" />{label || status}</span>;
}

export function PublicNav() {
  const { user, logout, unreadCount } = useApp();
  const [location, setLocation] = useLocation();
  const [open, setOpen] = useState(false);

  const { scrollY } = useScroll();
  const [visible, setVisible] = useState(true);

  useMotionValueEvent(scrollY, "change", (current) => {
    if (typeof current === "number") {
      const prev = scrollY.getPrevious() ?? 0;
      const diff = current - prev;
      if (current < 50) {
        setVisible(true);
      } else {
        if (diff < -2) {
          setVisible(true);
        } else if (diff > 4) {
          setVisible(false);
          setOpen(false);
        }
      }
    }
  });

  const navItems: FloatingNavItem[] = [
    { name: 'Home', link: '/', icon: <Home size={14} strokeWidth={2.2} />, dataTestId: 'link-nav-Home' },
    { name: 'Find parking', link: '/parking', icon: <ParkingSquare size={14} strokeWidth={2.2} />, dataTestId: 'link-nav-Find-parking' },
    { name: 'My bookings', link: '/bookings', icon: <CalendarDays size={14} strokeWidth={2.2} />, dataTestId: 'link-nav-My-bookings' },
    { name: 'History', link: '/history', icon: <History size={14} strokeWidth={2.2} />, dataTestId: 'link-nav-History' },
  ];

  return (
    <motion.header
      initial={{ y: 0, opacity: 1 }}
      animate={{
        y: visible ? 0 : -100,
        opacity: visible ? 1 : 0,
      }}
      transition={{
        duration: 0.25,
        ease: "easeInOut",
      }}
      className="fixed top-0 left-0 right-0 z-50 pointer-events-none w-full"
    >
      <div className="mx-auto flex max-w-[1240px] items-center justify-between px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
        {/* 1. Left Pill: Parkwise Logo */}
        <div className="pointer-events-auto flex items-center">
          <Link
            href="/"
            data-testid="link-logo"
            className="group flex items-center gap-2.5 rounded-full border border-white/15 bg-[#153b5b]/95 px-3.5 py-1.5 sm:px-4 sm:py-2 text-white shadow-[0_8px_24px_rgba(21,59,91,0.28)] backdrop-blur-xl transition-all duration-200 hover:bg-[#1a4469] hover:border-white/25 hover:shadow-[0_8px_28px_rgba(21,59,91,0.36),0_0_16px_rgba(244,194,111,0.18)] hover:scale-[1.02]"
          >
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-white/15 text-[#f6bd60] shadow-sm transition-transform group-hover:scale-105">
              <ParkingSquare size={16} strokeWidth={2.5} />
            </span>
            <span className="font-display text-[15px] font-bold tracking-tight text-white">
              park<span className="text-[#f4c26f]">wise</span>
            </span>
          </Link>
        </div>

        {/* 2. Center Pill: Home, Find parking, My bookings, History */}
        <div className="pointer-events-auto hidden md:flex items-center justify-center">
          <FloatingNav
            navItems={navItems}
            activeLink={location}
            onNavigate={(href) => setLocation(href)}
          />
        </div>

        {/* 3. Right Pill: Notifications, Profile, Logout (styled like navbar, separate pill) */}
        <div className="pointer-events-auto flex items-center">
          <div className="flex items-center gap-1 sm:gap-1.5 rounded-full border border-white/15 bg-[#153b5b]/95 p-1.5 shadow-[0_8px_24px_rgba(21,59,91,0.28),0_0_14px_rgba(244,194,111,0.12)] backdrop-blur-xl">
            {user ? (
              <>
                {user.role === 'admin' && (
                  <Link
                    href="/admin/dashboard"
                    data-testid="link-admin-portal"
                    className="rounded-full bg-[#f4c26f]/20 px-2.5 py-1 text-[11px] sm:text-xs font-bold text-[#f4c26f] hover:bg-[#f4c26f]/30 transition-colors"
                  >
                    Admin
                  </Link>
                )}
                <Link
                  href="/notifications"
                  data-testid="link-notifications"
                  className="relative flex items-center justify-center rounded-full p-2 text-[#c4d4dc] transition-colors hover:bg-white/10 hover:text-white"
                  aria-label="Notifications"
                >
                  <Bell size={16} />
                  {unreadCount > 0 && (
                    <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-[#f4c26f] animate-pulse ring-2 ring-[#153b5b]" />
                  )}
                </Link>
                <div className="h-4 w-px bg-white/20 my-auto" />
                <Link
                  href={user.role === 'admin' ? '/admin/dashboard' : '/profile'}
                  data-testid="link-profile"
                  className="flex items-center gap-2 rounded-full bg-white/10 py-1 pl-1.5 pr-2.5 sm:pr-3 text-xs font-bold text-white transition-colors hover:bg-white/20"
                >
                  <span className="grid h-6 w-6 place-items-center rounded-full bg-[#f4c26f] text-[10px] font-black text-[#153b5b]">
                    {user.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                  </span>
                  <span className="hidden sm:inline max-w-24 truncate">{user.name.split(' ')[0]}</span>
                </Link>
                <div className="h-4 w-px bg-white/20 my-auto" />
                <button
                  onClick={logout}
                  data-testid="button-logout"
                  className="flex items-center justify-center rounded-full p-2 text-[#c4d4dc] transition-colors hover:bg-white/10 hover:text-[#f87171]"
                  aria-label="Log out"
                  title="Log out"
                >
                  <LogOut size={15} />
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  data-testid="link-login"
                  className="rounded-full px-3 py-1.5 text-xs font-semibold text-[#c4d4dc] transition-colors hover:bg-white/10 hover:text-white"
                >
                  Log in
                </Link>
                <Link
                  href="/register"
                  data-testid="link-register"
                  className="rounded-full bg-[#f4c26f] px-3.5 py-1.5 text-xs font-bold text-[#153b5b] shadow-sm transition-all hover:bg-[#ffd54f] hover:shadow-[0_0_12px_rgba(244,194,111,0.5)] active:scale-95"
                >
                  Sign up
                </Link>
              </>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setOpen(!open)}
              data-testid="button-mobile-menu"
              className="flex items-center justify-center rounded-full p-2 text-[#c4d4dc] hover:bg-white/10 hover:text-white md:hidden"
              aria-label="Open menu"
            >
              {open ? <X size={16} /> : <Menu size={16} />}
            </button>
          </div>
        </div>
      </div>

      {/* Floating mobile dropdown menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.18 }}
            className="pointer-events-auto mx-auto max-w-[1240px] px-4 md:hidden"
          >
            <div className="rounded-2xl border border-white/15 bg-[#153b5b]/98 p-4 shadow-[0_16px_36px_rgba(10,25,45,0.45)] backdrop-blur-2xl">
              <div className="space-y-1 border-b border-white/15 pb-3">
                {navItems.map((item) => (
                  <Link
                    key={item.link}
                    href={item.link}
                    onClick={() => setOpen(false)}
                    data-testid={item.dataTestId}
                    className={cn(
                      "flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors",
                      location === item.link ? "bg-white/15 text-[#f4c26f] font-bold" : "text-[#c4d4dc] hover:bg-white/10 hover:text-white"
                    )}
                  >
                    {item.icon}
                    <span>{item.name}</span>
                  </Link>
                ))}
              </div>
              <div className="pt-2.5 flex items-center justify-between text-xs">
                <Link
                  href={user ? '/profile' : '/login'}
                  onClick={() => setOpen(false)}
                  data-testid="link-mobile-account"
                  className="font-bold text-[#f4c26f] hover:underline py-1"
                >
                  {user ? 'Your account' : 'Log in'}
                </Link>
                <Link
                  href="/admin/login"
                  onClick={() => setOpen(false)}
                  data-testid="link-mobile-admin"
                  className="font-bold text-[#82c4be] hover:underline py-1"
                >
                  Admin portal
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}

export function UserShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-[100dvh] bg-[#f5f8fa] pb-24 md:pb-28">
      <PublicNav />
      <div className="pt-16 sm:pt-20">
        {children}
      </div>
      <footer className="mt-20 border-t border-[#dfe7ec] bg-[#eef4f6]">
        <div className="mx-auto flex max-w-[1240px] flex-col gap-4 px-5 py-8 text-xs text-[#72828c] md:flex-row md:items-center md:justify-between lg:px-8">
          <AppLogo />
          <span>Quietly making arrival predictable.</span>
          <span>Mock product experience · 2026</span>
        </div>
      </footer>
    </div>
  );
}

const adminLinks = [['/admin/dashboard', 'Overview', LayoutDashboard], ['/admin/locations', 'Locations', Building2], ['/admin/slots', 'Slot operations', ParkingSquare], ['/admin/reservations', 'Reservations', CalendarDays], ['/admin/users', 'Users', UserRound], ['/admin/devices', 'IoT devices', Zap], ['/admin/ai', 'AI monitoring', Sparkles], ['/admin/analytics', 'Analytics', Gauge], ['/admin/settings', 'Settings', Settings]] as const;

export function AdminShell({ children }: { children: ReactNode }) {
  const [location, setLocation] = useLocation();
  const [open, setOpen] = useState(false);
  const { user, logout } = useApp();
  return <div className="min-h-[100dvh] bg-[#f5f7f8]">
    <aside className={`fixed inset-y-0 left-0 z-50 w-[245px] bg-[#122f49] px-4 py-5 text-white transition-transform md:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="mb-9 flex items-center justify-between px-2"><AppLogo dark /><button onClick={() => setOpen(false)} className="rounded-lg p-1 text-white/70 md:hidden" aria-label="Close navigation"><X size={18} /></button></div>
      <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[.17em] text-white/40">Command center</p>
      <nav className="space-y-1">{adminLinks.map(([href, label, Icon]) => <button key={href} onClick={() => { setLocation(href); setOpen(false); }} data-testid={`link-admin-${label.toLowerCase().replaceAll(' ', '-')}`} className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[13px] font-semibold transition-colors ${location === href ? 'bg-white/12 text-[#f6bd60]' : 'text-white/65 hover:bg-white/7 hover:text-white'}`}><Icon size={17} strokeWidth={1.8} />{label}</button>)}</nav>
      <div className="absolute bottom-5 left-4 right-4 rounded-2xl border border-white/10 bg-white/5 p-3"><div className="flex items-center gap-2"><span className="grid h-8 w-8 place-items-center rounded-full bg-[#e8ad50] text-xs font-black text-[#34220c]">{(user?.name || 'Admin').split(' ').map((n) => n[0]).join('').slice(0, 2)}</span><div className="min-w-0"><p className="truncate text-xs font-bold">{user?.name || 'Admin'}</p><p className="text-[10px] text-white/45">System operator</p></div><button onClick={logout} className="ml-auto text-white/45 hover:text-white" aria-label="Log out"><LogOut size={14} /></button></div></div>
    </aside>
    {open && <button onClick={() => setOpen(false)} aria-label="Close menu" className="fixed inset-0 z-40 bg-[#122f49]/50 md:hidden" />}
    <div className="md:pl-[245px]"><header className="sticky top-0 z-30 flex h-[70px] items-center justify-between border-b border-[#e1e7eb] bg-[#f5f7f8]/90 px-5 backdrop-blur-xl lg:px-8"><button onClick={() => setOpen(true)} className="rounded-xl p-2 text-[#29475b] md:hidden" aria-label="Open navigation"><Menu size={20} /></button><div className="hidden items-center gap-2 text-sm font-semibold text-[#7c8c95] md:flex"><Command size={17} /> Parkwise operations <span className="ml-1 rounded-md bg-[#e3eef1] px-2 py-1 text-[10px] text-[#527482]">DEMO DATA</span></div><div className="ml-auto flex items-center gap-3"><button className="rounded-xl p-2 text-[#71818b] hover:bg-white" aria-label="Help"><CircleHelp size={18} /></button><Link href="/notifications" className="rounded-xl p-2 text-[#71818b] hover:bg-white" aria-label="Notifications"><Bell size={18} /></Link><span className="h-7 w-px bg-[#dfe6ea]" /><span className="text-xs font-bold text-[#344e5f]">{user?.name || 'Admin'}</span><span className="grid h-8 w-8 place-items-center rounded-full bg-[#d8e8ed] text-xs font-bold text-[#1d5b72]">{(user?.name || 'Admin').split(' ').map((n) => n[0]).join('').slice(0, 2)}</span></div></header><main className="mx-auto max-w-[1400px] px-5 py-7 pb-24 md:pb-28 lg:px-8">{children}</main></div>
  </div>;
}

export function PageHeader({ eyebrow, title, detail, action }: { eyebrow?: string; title: string; detail?: string; action?: ReactNode }) {
  return <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div>{eyebrow && <p className="mb-2 text-[11px] font-bold uppercase tracking-[.16em] text-[#c28636]">{eyebrow}</p>}<h1 className="font-display text-[28px] font-bold tracking-[-.04em] text-[#183653] md:text-[34px]">{title}</h1>{detail && <p className="mt-1.5 text-sm text-[#788994]">{detail}</p>}</div>{action}</div>;
}

export function StatCard({ label, value, delta, icon: Icon, tone = 'navy' }: { label: string; value: string; delta?: string; icon: typeof Gauge; tone?: 'navy' | 'teal' | 'gold' | 'green' }) {
  const tones = { navy: 'bg-[#e8eef4] text-[#1d506c]', teal: 'bg-[#dff2ef] text-[#247d78]', gold: 'bg-[#fff0d6] text-[#9a6c28]', green: 'bg-[#e3f3e9] text-[#24744b]' };
  return <div className="rounded-2xl border border-[#dfe7eb] bg-white p-4 shadow-[0_7px_20px_rgba(44,67,87,.04)]"><div className="flex items-start justify-between"><span className={`grid h-9 w-9 place-items-center rounded-xl ${tones[tone]}`}><Icon size={17} /></span>{delta && <span className="rounded-full bg-[#e3f3e9] px-2 py-1 text-[10px] font-bold text-[#287952]">{delta}</span>}</div><p className="mt-4 text-[12px] font-semibold text-[#7a8a94]">{label}</p><p className="mt-0.5 font-display text-[26px] font-bold tracking-[-.05em] text-[#183653]">{value}</p></div>;
}

export function MockMap({ locations = parkingLocations, compact = false }: { locations?: ParkingLocation[]; compact?: boolean }) {
  return <div data-testid="mock-map" className={`relative isolate overflow-hidden rounded-2xl border border-[#cfdde2] bg-[#dce9e7] ${compact ? 'h-[220px]' : 'h-[480px]'}`}>
    <div className="absolute inset-0 opacity-50" style={{ backgroundImage: 'linear-gradient(30deg, transparent 46%, #b5ceca 47%, #b5ceca 49%, transparent 50%), linear-gradient(145deg, transparent 42%, #b5ceca 43%, #b5ceca 45%, transparent 46%)', backgroundSize: '110px 90px' }} />
    <div className="absolute -left-10 top-20 h-20 w-[120%] rotate-[12deg] border-y-8 border-white/70 bg-[#c3d6d0]/40" />
    <div className="absolute left-1/4 top-0 h-[130%] w-9 rotate-[37deg] bg-white/70" />
    <div className="absolute bottom-0 right-1/4 h-[130%] w-5 -rotate-[28deg] bg-white/60" />
    <div className="absolute left-5 top-5 rounded-lg bg-white/85 px-2.5 py-1.5 text-[10px] font-bold text-[#55717b] shadow-sm"><span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-[#ddab50]" /> MOCK MAP · LIVE DATA PREVIEW</div>
    {locations.slice(0, 5).map((location, index) => <Link key={location.id} href={`/parking/${location.id}`} data-testid={`map-pin-${location.id}`} className="absolute transition-transform hover:scale-110" style={{ left: `${18 + (index * 17) % 68}%`, top: `${30 + (index * 23) % 52}%` }}><span className="relative grid h-9 w-9 place-items-center rounded-full border-4 border-white bg-[#173f5c] text-white shadow-lg"><MapPin size={16} fill="currentColor" /><span className="absolute -bottom-1 h-1.5 w-1.5 rotate-45 bg-[#173f5c]" /></span><span className="absolute left-1/2 top-10 hidden -translate-x-1/2 whitespace-nowrap rounded bg-[#173f5c] px-2 py-1 text-[10px] font-bold text-white group-hover:block">{location.name}</span></Link>)}
    {!compact && <div className="absolute bottom-4 left-4 rounded-xl bg-white/90 p-3 text-[11px] shadow-sm"><p className="font-bold text-[#345064]">5 locations in view</p><p className="mt-0.5 text-[#81909a]">Map tiles are a preview until maps connect.</p></div>}
  </div>;
}

export function ParkingCard({ location }: { location: ParkingLocation }) {
  return (
    <BorderGlow
      edgeSensitivity={30}
      glowColor="208 75 60"
      backgroundColor="#ffffff"
      borderRadius={20}
      glowRadius={36}
      glowIntensity={1.0}
      coneSpread={25}
      colors={['#153b5b', '#1d4c72', '#2563eb', '#38bdf8', '#82c4be']}
      className="w-full transition-transform duration-300 hover:-translate-y-1.5 hover:shadow-[0_20px_40px_-12px_rgba(21,59,91,0.18)]"
    >
      <article
        data-testid={`card-parking-${location.id}`}
        className="group relative flex h-full flex-col justify-between p-3"
      >
        <div className="relative z-10">
          <div className={`relative flex h-28 items-end overflow-hidden rounded-xl bg-gradient-to-br ${location.accent} p-3 shadow-inner`}>
            <div className="absolute inset-0 opacity-25 grid-fade" />
            <div className="relative flex w-full items-end justify-between">
              <div>
                <p className="text-[10px] font-semibold text-white/70">{location.zone} zone · {location.distance}</p>
                <h3 className="mt-0.5 font-display text-[17px] font-bold text-white tracking-tight">{location.name}</h3>
              </div>
              <span className="rounded-lg bg-white/15 px-2 py-1 text-[11px] font-bold text-white backdrop-blur-sm shadow-sm">
                <Star size={11} className="mr-1 inline fill-[#f7c36f] text-[#f7c36f]" />
                {location.rating}
              </span>
            </div>
          </div>
          <div className="px-1 pt-3">
            <div className="flex items-center justify-between gap-2">
              <p className="flex min-w-0 items-center gap-1.5 truncate text-xs text-[#71818b]">
                <MapPin size={13} className="shrink-0 text-[#8cabb3]" />
                {location.address}
              </p>
              <span className="shrink-0 text-xs font-bold text-[#183653]">₹{location.pricePerHour}/hr</span>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <span className="text-xs font-bold text-[#27754d]">
                <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-current shadow-[0_0_6px_#27754d]" />
                {location.availableSlots} spots open
              </span>
              <span className="text-[11px] text-[#91a0a8]">{location.totalSlots} total</span>
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {location.facilities.slice(0, 3).map((facility) => (
                <span key={facility} className="rounded-md bg-[#f0f4f5] px-2 py-1 text-[10px] font-semibold text-[#687b86]">
                  {facility}
                </span>
              ))}
            </div>
            <Link
              href={`/parking/${location.id}`}
              data-testid={`link-view-parking-${location.id}`}
              className="mt-3 flex items-center justify-between rounded-xl border border-[#dfe7eb] bg-[#fbfcfc] px-3 py-2.5 text-xs font-bold text-[#28566e] transition-all duration-200 hover:border-[#153b5b]/40 hover:bg-[#153b5b] hover:text-white hover:shadow-[0_4px_16px_rgba(21,59,91,0.25)]"
            >
              View location <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </article>
    </BorderGlow>
  );
}

const statusMeta: Record<SlotStatus, { label: string; className: string }> = {
  available: { label: 'Available', className: 'border-[#8bc7ab] bg-[#e5f5eb] text-[#27784f] hover:bg-[#cfeede]' },
  occupied: { label: 'Occupied', className: 'border-[#edb0ab] bg-[#fcedec] text-[#ad514b]' },
  reserved: { label: 'Reserved', className: 'border-[#b3b5e5] bg-[#e9eafa] text-[#5657a1]' },
  maintenance: { label: 'Service', className: 'border-[#e8c98d] bg-[#fff3dd] text-[#96691f]' },
};

export function SlotMap({ slots, selected, onSelect }: { slots: ParkingSlot[]; selected?: string; onSelect?: (slot: ParkingSlot) => void }) {
  return <div data-testid="parking-slot-map" className="overflow-x-auto rounded-2xl border border-[#dfe7eb] bg-[#f2f5f5] p-4 sm:p-6"><div className="mx-auto mb-5 max-w-[420px] rounded-lg border border-dashed border-[#9fbab9] bg-[#e1efed] py-2 text-center text-[10px] font-bold uppercase tracking-[.18em] text-[#56837e]">Entry / exit</div><div className="mx-auto grid min-w-[350px] max-w-[560px] grid-cols-6 gap-2 sm:gap-3">{slots.map((slot) => { const meta = statusMeta[slot.status]; const isSelected = selected === slot.id; const canSelect = slot.status === 'available'; return <button key={slot.id} disabled={!canSelect} onClick={() => onSelect?.(slot)} data-testid={`slot-${slot.id}`} aria-label={`${slot.label}, ${meta.label}`} className={`relative flex aspect-[.65] min-h-16 flex-col items-center justify-center rounded-xl border-2 text-[11px] font-bold transition-all ${isSelected ? 'border-[#e2a849] bg-[#fff0cc] text-[#805619] shadow-[0_0_0_3px_rgba(226,168,73,.18)]' : meta.className} ${canSelect ? 'cursor-pointer hover:-translate-y-0.5' : 'cursor-not-allowed opacity-80'}`}><Car size={16} className="mb-1 opacity-70" /><span>{slot.label}</span>{isSelected && <span className="absolute -right-1.5 -top-1.5 grid h-4 w-4 place-items-center rounded-full bg-[#e2a849] text-white"><Check size={10} /></span>}</button>; })}</div><div className="mt-6 flex flex-wrap justify-center gap-x-5 gap-y-2 border-t border-[#dfe7eb] pt-4 text-[10px] font-semibold text-[#71818b]">{Object.entries(statusMeta).map(([key, value]) => <span key={key} className="flex items-center gap-1.5"><span className={`h-2.5 w-2.5 rounded-sm border ${value.className}`} />{value.label}</span>)}</div></div>;
}

export function BookingCard({ booking, onCancel }: { booking: Booking; onCancel?: (id: string) => void }) {
  const isCancellable = (booking.status === 'upcoming' || booking.status === 'confirmed') && onCancel;
  const displayTime = booking.startTime && booking.endTime ? `${booking.startTime} - ${booking.endTime}` : (booking.time || '12:00 PM');
  return (
    <BorderGlow
      edgeSensitivity={30}
      glowColor="208 75 60"
      backgroundColor="#ffffff"
      borderRadius={20}
      glowRadius={36}
      glowIntensity={1.0}
      coneSpread={25}
      colors={['#153b5b', '#1d4c72', '#2563eb', '#38bdf8', '#82c4be']}
      className="w-full transition-transform duration-300 hover:-translate-y-1.5 hover:shadow-[0_20px_40px_-12px_rgba(21,59,91,0.18)]"
    >
      <article
        data-testid={`card-booking-${booking.id}`}
        className="group relative p-4"
      >
        <div className="relative z-10">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[.12em] text-[#c28636] flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-[#c28636] shadow-[0_0_5px_#c28636]" />
                {booking.id}
              </p>
              <h3 className="mt-1 font-display text-[18px] font-bold text-[#183653] transition-colors group-hover:text-[#153b5b]">
                {booking.locationName}
              </h3>
              <p className="mt-1 flex items-center gap-1.5 text-xs text-[#71818b]">
                <MapPin size={13} className="text-[#8cabb3]" />
                Slot {booking.slotNumber || booking.slot} · {booking.date}
              </p>
            </div>
            <StatusBadge status={booking.status} />
          </div>
          <div className="my-4 grid grid-cols-3 gap-2 rounded-xl bg-[#f4f7f7] p-3 transition-colors duration-200 group-hover:bg-[#eef5f6]">
            <div>
              <p className="text-[10px] text-[#82919a]">Time</p>
              <p className="mt-1 truncate text-xs font-bold text-[#345064]">{displayTime}</p>
            </div>
            <div>
              <p className="text-[10px] text-[#82919a]">Duration</p>
              <p className="mt-1 text-xs font-bold text-[#345064]">{booking.duration} hour{booking.duration > 1 ? 's' : ''}</p>
            </div>
            <div>
              <p className="text-[10px] text-[#82919a]">Amount</p>
              <p className="mt-1 text-xs font-bold text-[#183653]">₹{booking.amount}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Link
              href={`/bookings/${booking.id}`}
              data-testid={`link-booking-${booking.id}`}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-[#153b5b] px-3 py-2.5 text-xs font-bold text-white shadow-sm transition-all duration-200 hover:bg-[#1d4c72] hover:shadow-[0_4px_16px_rgba(21,59,91,0.3)] active:scale-98"
            >
              View booking <ChevronRight size={13} className="transition-transform group-hover:translate-x-0.5" />
            </Link>
            {isCancellable && (
              <button
                onClick={() => onCancel(booking.id)}
                data-testid={`button-cancel-${booking.id}`}
                className="rounded-xl border border-[#f1ceca] px-3 text-xs font-bold text-[#b2534e] transition-colors hover:bg-[#fdf1f0]"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      </article>
    </BorderGlow>
  );
}

export function QRCard({ bookingId }: { bookingId: string }) {
  return <div data-testid="mock-qr" className="rounded-2xl border border-[#dfe7eb] bg-[#fbfcfc] p-4 text-center"><div className="mx-auto grid w-[126px] grid-cols-8 gap-1 rounded-lg border-4 border-[#153b5b] bg-white p-2">{Array.from({ length: 64 }, (_, i) => <span key={i} className={`aspect-square rounded-[1px] ${[0,1,2,5,7,8,10,12,14,15,16,18,21,23,24,25,28,30,31,33,35,36,37,40,42,43,45,47,48,50,51,53,54,57,58,60,62,63].includes(i) ? 'bg-[#153b5b]' : 'bg-transparent'}`} />)}</div><p className="mt-3 text-[10px] font-bold uppercase tracking-[.15em] text-[#80909a]">Demo access pass</p><p className="mt-1 font-mono text-xs font-bold text-[#345064]">{bookingId}</p><p className="mt-2 text-[10px] text-[#9aa6ac]">QR validation is mocked for this preview.</p></div>;
}

export function EmptyState({ icon: Icon = Compass, title, detail, action }: { icon?: typeof Compass; title: string; detail: string; action?: ReactNode }) {
  return <div className="rounded-2xl border border-dashed border-[#ccdce1] bg-[#f7faf9] px-6 py-16 text-center"><span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-[#e4f0ef] text-[#4b8b87]"><Icon size={22} /></span><h3 className="mt-4 font-display text-lg font-bold text-[#29485c]">{title}</h3><p className="mx-auto mt-1 max-w-sm text-sm leading-6 text-[#7f8e96]">{detail}</p>{action && <div className="mt-5">{action}</div>}</div>;
}

export function FilterButton({ children, active, onClick }: { children: ReactNode; active?: boolean; onClick?: () => void }) {
  return <button onClick={onClick} data-testid="button-filter" className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-bold transition-colors ${active ? 'border-[#98bcc3] bg-[#e6f2f1] text-[#286a70]' : 'border-[#dfe7eb] bg-white text-[#71818b] hover:bg-[#f2f7f7]'}`}><SlidersHorizontal size={14} />{children}</button>;
}

export const uiIcons = { ArrowRight, Bell, Building2, CalendarDays, Car, Clock3, CreditCard, History, MapPin, Navigation, Search, ShieldCheck, Sparkles, Star, UserRound, Zap };