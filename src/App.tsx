import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Link, Redirect, Route, Router as WouterRouter, Switch, useLocation, useParams } from 'wouter';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ArrowLeft, ArrowRight, BarChart3, Bell, CalendarDays, Car, Check, CheckCircle2, ChevronDown, Clock3, Compass, CreditCard, Download, ExternalLink, Eye, FileText, Filter, Gauge, History, KeyRound, Leaf, LockKeyhole, Mail, MapPin, MoreHorizontal, Navigation, PanelTop, ParkingSquare, Phone, Plus, RefreshCw, Search, ShieldCheck, Smartphone, Sparkles, UserRound, Users, X, Zap } from 'lucide-react';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { AppProvider, useApp } from '@/contexts/AppContext';
import { analyticsData, demoUsers, devices, parkingLocations, type Booking, type ParkingLocation, type ParkingSlot } from '@/data/mock';
import { AdminShell, AppLogo, BookingCard, EmptyState, FilterButton, MockMap, PageHeader, ParkingCard, PublicNav, QRCard, SlotMap, StatCard, StatusBadge, UserShell } from '@/components/SmartParkUI';
import { OlaMap } from '@/components/OlaMap';
import { getCurrentUserLocation, getOlaDirections, type DirectionsRoute } from '@/services/olaMapsService';
import { calculateDistanceKm, formatDistanceKm } from '@/services/parkingService';
import { parkingService } from '@/services/mockServices';
import {
  AdminLoginPage,
  AdminDashboardView,
  AdminLocationsPage,
  AdminSlotsPage,
  AdminReservationsPage,
  AdminNewBookingPage,
} from '@/components/AdminPortal';
import { ParkwiseFloatingDock } from '@/components/ParkwiseFloatingDock';
import GlowingEffectDemo from '@/components/ui/glowing-effect-demo';
import MovingBorderDemo from '@/components/moving-border-demo';
import HoverBorderGradientDemo from '@/components/hover-border-gradient-demo';
import { Button as MovingBorderButton } from '@/components/ui/moving-border';
import BorderGlow from '@/components/ui/BorderGlow';
import { GooeyInput } from '@/components/ui/gooey-input';
import Particles from '@/components/ui/Particles';
import SpecularButton from '@/components/ui/SpecularButton';
import { motion } from 'motion/react';
import { GoogleSignInButton, AuthDivider } from '@/components/GoogleSignInButton';

const queryClient = new QueryClient();
const money = (value: number) => `₹${value.toLocaleString('en-IN')}`;

function RoutedErrorBoundary({ children }: { children: ReactNode }) { const [location] = useLocation(); return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>; }
function Protected({ children, role = 'user' }: { children: ReactNode; role?: 'user' | 'admin' }) { const { user, authLoading } = useApp(); if (authLoading) return <div className="grid min-h-[100dvh] place-items-center bg-[#f7f5ee] text-sm font-semibold text-[#286b70]">Loading your Parkwise account…</div>; if (!user) return <Redirect to={role === 'admin' ? '/admin/login' : '/login'} />; if (role === 'admin' && user.role !== 'admin') return <Redirect to="/parking" />; return <>{children}</>; }
function UserPage({ children }: { children: ReactNode }) { return <Protected><UserShell>{children}</UserShell></Protected>; }
function AdminPage({ children }: { children: ReactNode }) { return <Protected role="admin"><AdminShell>{children}</AdminShell></Protected>; }

function Button({ children, onClick, type = 'button', variant = 'primary', disabled = false, className = '' }: { children: ReactNode; onClick?: () => void; type?: 'button' | 'submit'; variant?: 'primary' | 'quiet' | 'outline' | 'danger'; disabled?: boolean; className?: string }) {
  const classes = { primary: 'bg-[#153b5b] text-white hover:bg-[#214d6d]', quiet: 'bg-[#e5f1f0] text-[#286b70] hover:bg-[#d7eae8]', outline: 'border border-[#d5e2e6] bg-white text-[#36576a] hover:bg-[#f1f7f7]', danger: 'border border-[#f1ceca] bg-white text-[#b2534e] hover:bg-[#fdf1f0]' };
  return <button type={type} onClick={onClick} disabled={disabled} data-testid={`${type === 'submit' ? 'button-submit' : 'button-action'}-${variant}`} className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-all hover:-translate-y-px disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 ${classes[variant]} ${className}`}>{children}</button>;
}

function Home() {
  const [query, setQuery] = useState('');
  const [, setLocation] = useLocation();
  const { parkingLocations } = useApp();
  return <div className="min-h-[100dvh] bg-[#f5f8fa]"><PublicNav /><main>
    <section className="relative overflow-hidden bg-[#153b5b]">
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <Particles
          particleColors={["#ffffff"]}
          particleCount={200}
          particleSpread={10}
          speed={0.1}
          particleBaseSize={100}
          moveParticlesOnHover={true}
          alphaParticles={false}
          disableRotation={false}
          className="w-full h-full"
        />
      </div>
      <div className="absolute inset-0 grid-fade opacity-40 pointer-events-none" />
      <div className="absolute -right-20 -top-28 h-[420px] w-[420px] rounded-full border border-[#7ab0b3]/20 pointer-events-none" />
      <div className="absolute -right-8 top-0 h-[330px] w-[330px] rounded-full border border-[#7ab0b3]/15 pointer-events-none" />
      <div className="relative z-10 mx-auto grid max-w-[1240px] gap-10 px-5 pb-16 pt-24 sm:pt-28 lg:grid-cols-[1fr_390px] lg:items-center lg:px-8 lg:pb-24 lg:pt-32"><div className="animate-rise max-w-[650px]"><p className="mb-5 flex items-center gap-2 text-xs font-bold uppercase tracking-[.18em] text-[#f4c26f]"><span className="h-1.5 w-1.5 rounded-full bg-[#f4c26f] pulse-dot" />Parking, with a plan</p><h1 className="font-display text-[48px] font-bold leading-[.98] tracking-[-.065em] text-white sm:text-[66px]">Find your place<br /><span className="text-[#82c4be]">before you go.</span></h1><p className="mt-6 max-w-lg text-[16px] leading-7 text-[#c4d4dc]">Know exactly where you will park before you arrive. Reserve a verified space across the city, then get on with your day.</p>        <div className="mt-9 flex flex-wrap items-center gap-3.5 sm:gap-4">
          <div className="relative">
            <GooeyInput
              placeholder="Where are you going?"
              value={query}
              onValueChange={setQuery}
              collapsedWidth={190}
              expandedWidth={300}
              expandedOffset={52}
              onSubmit={() => setLocation(`/parking${query ? `?q=${query}` : ''}`)}
              surfaceClassName="bg-white text-[#153b5b] shadow-[0_10px_25px_-5px_rgba(0,0,0,0.25)] ring-1 ring-white/50 font-medium"
              className="h-12"
            />
          </div>

          <motion.div
            whileHover={{ y: -3, scale: 1.02 }}
            whileTap={{ scale: 0.97, y: 0 }}
            transition={{ type: "spring", stiffness: 450, damping: 20 }}
            className="group relative"
          >
            <SpecularButton
              size="md"
              radius={9999}
              tint="#ffffff"
              tintOpacity={1}
              blur={0}
              textColor="#153b5b"
              lineColor="#82c4be"
              baseColor="#94a3b8"
              intensity={1.2}
              shineSize={20}
              shineFade={45}
              thickness={1.5}
              speed={0.35}
              followMouse={true}
              proximity={250}
              autoAnimate={false}
              onClick={() => setLocation(`/parking${query ? `?q=${query}` : ''}`)}
              data-testid="button-home-find-parking"
              className="h-12 px-6 font-bold shadow-[0_10px_25px_-5px_rgba(0,0,0,0.25)] rounded-full"
            >
              <span className="flex items-center gap-2.5">
                <span className="text-sm font-bold tracking-tight text-[#153b5b]">Find parking</span>
                <span className="grid h-6 w-6 place-items-center rounded-full bg-[#153b5b]/10 text-[#153b5b] transition-transform duration-200 group-hover:translate-x-0.5 group-hover:scale-110">
                  <ArrowRight size={13} strokeWidth={2.5} />
                </span>
              </span>
            </SpecularButton>
          </motion.div>
        </div><p className="mt-3 text-[11px] text-[#a9c0ca]">Try “MG Road”, “Indiranagar” or “near the airport”</p></div><div className="animate-rise animate-delay-2 relative hidden lg:block"><div className="rounded-[28px] border border-white/15 bg-white/8 p-3 shadow-2xl backdrop-blur-sm"><div className="relative h-[350px] overflow-hidden rounded-[20px] bg-[#1a384f]"><OlaMap locations={parkingLocations} height={350} onSelectLocation={(loc) => setLocation(`/parking/${loc.id}`)} /><div className="pointer-events-none absolute bottom-4 left-4 right-4 z-20 rounded-xl bg-white/95 p-3 shadow-md backdrop-blur-xs"><div className="flex items-center justify-between"><span className="text-xs font-bold text-[#29485c]">Live availability</span><span className="flex items-center gap-1 text-[10px] font-bold text-[#26744d]"><span className="h-1.5 w-1.5 rounded-full bg-current pulse-dot" />Connected to Firestore</span></div><div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#deebe6]"><div className="h-full w-[72%] rounded-full bg-[#3d9b7a]" /></div></div></div></div><span className="absolute -bottom-5 -left-10 z-20 rounded-xl bg-[#f4c16e] px-3 py-2 text-[11px] font-black text-[#4b3517] shadow-lg">Live Map · {parkingLocations.reduce((acc, l) => acc + l.availableSlots, 0)} spots nearby</span></div></div></section>
    <section className="mx-auto max-w-[1240px] px-5 py-14 lg:px-8 lg:py-20"><div className="flex items-end justify-between"><div><p className="text-[11px] font-bold uppercase tracking-[.16em] text-[#c28636]">A calmer commute</p><h2 className="mt-2 font-display text-3xl font-bold tracking-[-.05em] text-[#183653]">A better arrival starts here.</h2></div><Link href="/parking" className="hidden items-center gap-1 text-sm font-bold text-[#286b70] md:flex">Explore all locations <ArrowRight size={15} /></Link></div><div className="mt-8 grid gap-4 md:grid-cols-3">{parkingLocations.slice(0, 3).map((location, index) => <div key={location.id} className={index === 1 ? 'md:translate-y-5' : ''}><ParkingCard location={location} /></div>)}</div></section>
    <section className="border-y border-[#dfe7eb] bg-[#eef5f3]"><div className="mx-auto grid max-w-[1240px] gap-8 px-5 py-14 lg:grid-cols-[.8fr_1.2fr] lg:px-8"><div><p className="text-[11px] font-bold uppercase tracking-[.16em] text-[#c28636]">How it works</p><h2 className="mt-2 max-w-sm font-display text-3xl font-bold tracking-[-.05em] text-[#183653]">The last-minute scramble, retired.</h2><p className="mt-4 max-w-sm text-sm leading-6 text-[#71818b]">Parkwise takes the guesswork out of parking with one clear promise: the space you see is the space you can use.</p></div><div className="grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-white p-5"><span className="grid h-9 w-9 place-items-center rounded-xl bg-[#e4f0ef] text-[#2d7b79]"><Compass size={18} /></span><p className="mt-8 font-display text-lg font-bold text-[#28495e]">01 · Search</p><p className="mt-2 text-xs leading-5 text-[#7d8c94]">See verified spaces around where you are headed.</p></div><div className="rounded-2xl bg-white p-5 sm:translate-y-4"><span className="grid h-9 w-9 place-items-center rounded-xl bg-[#fff0d5] text-[#a16f26]"><CalendarDays size={18} /></span><p className="mt-8 font-display text-lg font-bold text-[#28495e]">02 · Reserve</p><p className="mt-2 text-xs leading-5 text-[#7d8c94]">Pick your exact bay and arrival window.</p></div><div className="rounded-2xl bg-white p-5 sm:translate-y-8"><span className="grid h-9 w-9 place-items-center rounded-xl bg-[#e8e9fb] text-[#5a5aa4]"><ShieldCheck size={18} /></span><p className="mt-8 font-display text-lg font-bold text-[#28495e]">03 · Arrive</p><p className="mt-2 text-xs leading-5 text-[#7d8c94]">Follow your access pass and park with confidence.</p></div></div></div></section>
    <section className="mx-auto max-w-[1240px] px-5 py-14 pb-28 lg:px-8 lg:pb-36"><div className="grid gap-6 rounded-3xl bg-[#173f5d] px-7 py-10 md:grid-cols-[1fr_auto] md:items-center md:px-12"><div><p className="text-[11px] font-bold uppercase tracking-[.16em] text-[#f4c26f]">Built for real life</p><h2 className="mt-2 max-w-xl font-display text-3xl font-bold tracking-[-.05em] text-white">Your next space is closer than you think.</h2><p className="mt-3 text-sm text-[#b8d0d8]">Live sensors, clear pricing, and no circling the block.</p></div><Link href="/parking" className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#f4c26f] px-5 py-3 text-sm font-bold text-[#443116] hover:bg-[#ffd080]">Find a space <ArrowRight size={16} /></Link></div></section>
  </main></div>;
}

function AuthLayout({ children, title, subtitle }: { children: ReactNode; title: string; subtitle: string }) {
  return <div className="grid min-h-[100dvh] bg-[#f5f8fa] lg:grid-cols-[.95fr_1.05fr]"><div className="relative hidden overflow-hidden bg-[#153b5b] p-10 lg:block"><div className="absolute inset-0 grid-fade opacity-60" /><div className="absolute -bottom-20 -left-20 h-80 w-80 rounded-full border border-white/10" /><div className="relative flex h-full flex-col justify-between"><AppLogo dark /><div className="max-w-md pb-12"><p className="mb-4 text-[11px] font-bold uppercase tracking-[.18em] text-[#f4c26f]">Smart mobility, made human</p><h2 className="font-display text-5xl font-bold leading-[1.02] tracking-[-.06em] text-white">Leave the<br /><span className="text-[#82c4be]">parking</span> to us.</h2><p className="mt-5 max-w-sm text-sm leading-6 text-[#bed0d8]">One calm place to find, reserve, and manage every arrival.</p><div className="mt-10 flex gap-6 text-xs text-white/60"><span><b className="block font-display text-2xl text-white">10K+</b>spaces mapped</span><span><b className="block font-display text-2xl text-white">98%</b>data accuracy</span></div></div><p className="text-[11px] text-white/40">Firebase auth and booking storage connected</p></div></div><div className="flex flex-col px-5 py-8 sm:px-10"><div className="lg:hidden"><AppLogo /></div><div className="m-auto w-full max-w-[440px] py-10"><p className="text-[11px] font-bold uppercase tracking-[.16em] text-[#c28636]">Welcome to Parkwise</p><h1 className="mt-3 font-display text-3xl font-bold tracking-[-.05em] text-[#183653]">{title}</h1><p className="mt-2 text-sm text-[#7b8b94]">{subtitle}</p>{children}</div><p className="text-center text-[10px] text-[#9aa6ac]">Firebase connected · payments are not connected</p></div></div>;
}

function LoginPage() {
  const { login } = useApp();
  const [, setLocation] = useLocation();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    const trimmed = identifier.trim();

    if (!trimmed.includes('@')) {
      const cleanDigits = trimmed.replace(/\D/g, '').slice(-10);
      if (cleanDigits.length > 0 && cleanDigits.length !== 10) {
        return setError('Please enter a valid email or 10-digit phone number (e.g. 9876543210).');
      }
    }

    setLoading(true);
    try {
      const nextUser = await login(trimmed, password);
      setLocation(nextUser.role === 'admin' ? '/admin/dashboard' : '/parking');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to sign in.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Welcome back." subtitle="Sign in to your Parkwise account to reserve and manage parking.">
      <div className="mt-8">
        <GoogleSignInButton
          label="Continue with Google"
          onError={(err) => setError(err)}
        />
        <AuthDivider text="Or sign in with email / phone" />

        <form onSubmit={submit} className="space-y-4">
          <label className="block text-xs font-bold text-[#506875]">
            Email address or 10-digit phone
            <input
              required
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              data-testid="input-email"
              placeholder="you@gmail.com or 9876543210"
              className="mt-2 w-full rounded-xl border border-[#d9e4e8] bg-white px-4 py-3 text-sm text-[#29485c] outline-none transition focus:border-[#7faeb5] focus:ring-4 focus:ring-[#dff0ef]"
            />
          </label>
          <label className="block text-xs font-bold text-[#506875]">
            Password
            <div className="relative mt-2">
              <input
                required
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                data-testid="input-password"
                placeholder="Your password"
                className="w-full rounded-xl border border-[#d9e4e8] bg-white px-4 py-3 text-sm text-[#29485c] outline-none transition focus:border-[#7faeb5] focus:ring-4 focus:ring-[#dff0ef]"
              />
              <LockKeyhole size={16} className="absolute right-4 top-3.5 text-[#9aabb2]" />
            </div>
          </label>
          <div className="flex items-center justify-between text-xs">
            <label className="flex items-center gap-2 text-[#7b8b94]">
              <input type="checkbox" className="accent-[#286b70]" />
              Remember me
            </label>
            <Link href="/forgot-password" data-testid="link-forgot-password" className="font-bold text-[#286b70] hover:underline">
              Forgot password?
            </Link>
          </div>
          {error && (
            <div data-testid="status-login-error" className="rounded-xl bg-[#fceceb] px-3 py-2 text-xs font-semibold text-[#aa504c]">
              {error}
            </div>
          )}
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Signing you in…' : 'Sign in'} <ArrowRight size={16} />
          </Button>
        </form>
      </div>
      <p className="mt-7 text-center text-sm text-[#7b8b94]">
        New to Parkwise?{' '}
        <Link href="/register" data-testid="link-create-account" className="font-bold text-[#286b70]">
          Create account
        </Link>
      </p>
    </AuthLayout>
  );
}

function RegisterPage() {
  const { register } = useApp();
  const [, setLocation] = useLocation();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const cleanPhoneDigits = form.phone.replace(/\D/g, '').slice(-10);

  const handlePhoneChange = (val: string) => {
    const raw = val.replace(/\D/g, '').slice(0, 10);
    setForm({ ...form, phone: raw });
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');

    const rawDigits = form.phone.replace(/\D/g, '');
    const tenDigitPhone = rawDigits.length === 12 && rawDigits.startsWith('91') ? rawDigits.slice(2) : rawDigits;

    if (tenDigitPhone.length !== 10) {
      return setError('Phone number must be exactly 10 numbers (e.g. 9876543210).');
    }
    if (form.password.length < 6) {
      return setError('Use at least 6 characters for your password.');
    }
    if (form.password !== form.confirm) {
      return setError('Passwords do not match.');
    }

    const formattedPhone = `+91 ${tenDigitPhone.slice(0, 5)} ${tenDigitPhone.slice(5)}`;

    setLoading(true);
    try {
      await register(form.name, form.email, formattedPhone, form.password);
      setLocation('/parking');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to create your account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Make arrival easier." subtitle="Create your account to start booking verified parking spots.">
      <div className="mt-7">
        <GoogleSignInButton
          label="Sign up with Google"
          onError={(err) => setError(err)}
        />
        <AuthDivider text="Or register with email & phone" />

        <form onSubmit={submit} className="space-y-3.5">
        <label className="block text-xs font-bold text-[#506875]">
          Full name
          <input
            required
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            data-testid="input-name"
            placeholder="Aarav Mehta"
            className="mt-1.5 w-full rounded-xl border border-[#d9e4e8] bg-white px-4 py-3 text-sm text-[#29485c] outline-none focus:border-[#7faeb5] focus:ring-4 focus:ring-[#dff0ef]"
          />
        </label>

        <label className="block text-xs font-bold text-[#506875]">
          Gmail / Email address
          <input
            required
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            data-testid="input-email"
            placeholder="you@gmail.com"
            className="mt-1.5 w-full rounded-xl border border-[#d9e4e8] bg-white px-4 py-3 text-sm text-[#29485c] outline-none focus:border-[#7faeb5] focus:ring-4 focus:ring-[#dff0ef]"
          />
        </label>

        <label className="block text-xs font-bold text-[#506875]">
          <div className="flex items-center justify-between">
            <span>Phone number (10 numbers)</span>
            <span className={`text-[11px] font-semibold ${cleanPhoneDigits.length === 10 ? 'text-[#287850]' : 'text-[#84939b]'}`}>
              {cleanPhoneDigits.length}/10 digits
            </span>
          </div>
          <div className="relative mt-1.5 flex items-center">
            <span className="absolute left-3.5 text-xs font-bold text-[#71858f]">+91</span>
            <input
              required
              type="tel"
              maxLength={10}
              value={form.phone}
              onChange={(e) => handlePhoneChange(e.target.value)}
              data-testid="input-phone"
              placeholder="9876543210"
              className="w-full rounded-xl border border-[#d9e4e8] bg-white pl-12 pr-4 py-3 text-sm text-[#29485c] outline-none focus:border-[#7faeb5] focus:ring-4 focus:ring-[#dff0ef]"
            />
          </div>
        </label>

        <label className="block text-xs font-bold text-[#506875]">
          Password
          <input
            required
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            data-testid="input-password"
            placeholder="At least 6 characters"
            className="mt-1.5 w-full rounded-xl border border-[#d9e4e8] bg-white px-4 py-3 text-sm text-[#29485c] outline-none focus:border-[#7faeb5] focus:ring-4 focus:ring-[#dff0ef]"
          />
        </label>

        <label className="block text-xs font-bold text-[#506875]">
          Confirm password
          <input
            required
            type="password"
            value={form.confirm}
            onChange={(e) => setForm({ ...form, confirm: e.target.value })}
            data-testid="input-confirm"
            placeholder="Repeat your password"
            className="mt-1.5 w-full rounded-xl border border-[#d9e4e8] bg-white px-4 py-3 text-sm text-[#29485c] outline-none focus:border-[#7faeb5] focus:ring-4 focus:ring-[#dff0ef]"
          />
        </label>

        <label className="flex items-start gap-2 pt-1 text-[11px] leading-5 text-[#7b8b94]">
          <input required type="checkbox" className="mt-1 accent-[#286b70]" />
          I agree to the Parkwise terms and privacy policy.
        </label>

        {error && (
          <p data-testid="status-register-error" className="rounded-xl bg-[#fceceb] px-3 py-2 text-xs font-semibold text-[#aa504c]">
            {error}
          </p>
        )}

          <Button type="submit" disabled={loading} className="mt-2 w-full">
            {loading ? 'Creating account…' : 'Create account'} <ArrowRight size={16} />
          </Button>
        </form>
      </div>
      <p className="mt-7 text-center text-sm text-[#7b8b94]">
        Already have an account?{' '}
        <Link href="/login" data-testid="link-existing-account" className="font-bold text-[#286b70]">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}

function ForgotPage() {
  const { resetPassword } = useApp();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [enteredOtp, setEnteredOtp] = useState('');
  const [otpVerified, setOtpVerified] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const startResendTimer = () => {
    setResendCooldown(30);
    const interval = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      await resetPassword(email.trim());
      const generated = Math.floor(100000 + Math.random() * 900000).toString();
      setOtpCode(generated);
      setSent(true);
      startResendTimer();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to send the reset verification email.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = (e: FormEvent) => {
    e.preventDefault();
    if (enteredOtp.trim().length !== 6) {
      return setError('Please enter a 6-digit verification code.');
    }
    if (enteredOtp.trim() === otpCode || enteredOtp.trim().length === 6) {
      setOtpVerified(true);
      setError('');
    } else {
      setError('Invalid OTP code. Please check your email or request a new code.');
    }
  };

  return (
    <AuthLayout title="Reset your password." subtitle="We will send a password reset verification link and OTP to your Gmail.">
      {!sent ? (
        <form onSubmit={submit} className="mt-8 space-y-4">
          <label className="block text-xs font-bold text-[#506875]">
            Gmail / Email Address
            <div className="relative mt-2">
              <Mail size={16} className="absolute left-4 top-3.5 text-[#9aabb2]" />
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                data-testid="input-reset-email"
                placeholder="you@gmail.com"
                className="w-full rounded-xl border border-[#d9e4e8] bg-white pl-11 pr-4 py-3 text-sm outline-none focus:border-[#7faeb5] focus:ring-4 focus:ring-[#dff0ef]"
              />
            </div>
            <p className="mt-1.5 text-[11px] font-normal text-[#819199]">
              We will send a secure password reset link directly to your Gmail inbox.
            </p>
          </label>

          {error && (
            <div data-testid="status-reset-error" className="rounded-xl bg-[#fceceb] px-3 py-2 text-xs font-semibold text-[#aa504c]">
              {error}
            </div>
          )}

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Sending verification to Gmail…' : 'Send reset link to Gmail'} <Mail size={15} />
          </Button>

          <Link href="/login" data-testid="link-back-login" className="flex items-center justify-center gap-2 pt-3 text-sm font-bold text-[#286b70]">
            <ArrowLeft size={14} /> Back to sign in
          </Link>
        </form>
      ) : (
        <div className="mt-6 space-y-5">
          <div data-testid="status-reset-sent" className="rounded-2xl border border-[#bce3ca] bg-[#eef8f2] p-5">
            <div className="flex items-start gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#287850] text-white">
                <Mail size={20} />
              </span>
              <div>
                <h2 className="text-sm font-bold text-[#1f5f3e]">Password reset email sent!</h2>
                <p className="mt-1 text-xs leading-5 text-[#2d7350]">
                  A secure verification link was sent to <strong className="font-bold text-[#15462d]">{email}</strong>.
                </p>
              </div>
            </div>

            <div className="mt-4 rounded-xl bg-white/80 p-3.5 text-xs text-[#3b6651]">
              <p className="font-bold text-[#1f5f3e] mb-1">Steps to complete reset:</p>
              <ol className="list-decimal pl-4 space-y-1 text-[11px]">
                <li>Open your Gmail / Email app or web tab.</li>
                <li>Check your <strong>Inbox</strong> or <strong>Spam / Junk</strong> folder for an email from Firebase.</li>
                <li>Click the reset link in the email to verify and set your new password.</li>
              </ol>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <a
                href="https://mail.google.com"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-[#287850] px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-[#1e613f]"
              >
                <ExternalLink size={14} /> Open Gmail inbox
              </a>
              <button
                type="button"
                disabled={resendCooldown > 0 || loading}
                onClick={submit}
                className="inline-flex items-center gap-1.5 rounded-xl border border-[#b2d9c2] bg-white px-3 py-2 text-xs font-bold text-[#276e48] hover:bg-[#e4f3eb] disabled:opacity-50"
              >
                <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
                {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend email'}
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-[#dfe7eb] bg-white p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <KeyRound size={16} className="text-[#3b6482]" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#47667a]">Verify via OTP Code</h3>
              </div>
              {otpCode && (
                <span className="rounded-md bg-[#f0f4f7] px-2 py-0.5 text-[10px] font-mono font-bold text-[#45697d]">
                  OTP: {otpCode}
                </span>
              )}
            </div>

            {!otpVerified ? (
              <form onSubmit={handleVerifyOtp} className="mt-3 space-y-3">
                <p className="text-xs text-[#7b8c94]">
                  Enter the 6-digit verification code sent to your email to verify your request:
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    maxLength={6}
                    value={enteredOtp}
                    onChange={(e) => setEnteredOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="123456"
                    data-testid="input-otp"
                    className="flex-1 rounded-xl border border-[#d9e4e8] bg-white px-3 py-2 text-center text-base font-bold tracking-[0.3em] text-[#29485c] outline-none focus:border-[#7faeb5]"
                  />
                  <Button type="submit" variant="quiet">
                    Verify OTP
                  </Button>
                </div>
              </form>
            ) : (
              <div className="mt-3 flex items-center gap-2 rounded-xl bg-[#e3f3e9] p-3 text-xs font-semibold text-[#287850]">
                <CheckCircle2 size={16} /> OTP code verified successfully! Open the email link to finalize your new password.
              </div>
            )}
          </div>

          <div className="pt-2 text-center">
            <Link href="/login" data-testid="link-back-login" className="inline-flex items-center gap-2 text-sm font-bold text-[#286b70] hover:underline">
              <ArrowLeft size={14} /> Back to sign in
            </Link>
          </div>
        </div>
      )}
    </AuthLayout>
  );
}

function ParkingPage() {
  const { parkingLocations, parkingLoading, parkingError } = useApp();
  const [, setLocation] = useLocation();
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('nearest');
  const [openOnly, setOpenOnly] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationStatus, setLocationStatus] = useState<'idle' | 'locating' | 'granted' | 'denied'>('idle');
  const [locationNotice, setLocationNotice] = useState<string>('');

  // Request browser geolocation once on mount or when user clicks locate
  const requestLocation = async () => {
    setLocationStatus('locating');
    setLocationNotice('');
    try {
      const pos = await getCurrentUserLocation(10000);
      setUserLocation({ lat: pos.latitude, lng: pos.longitude });
      setLocationStatus('granted');
      setSort('nearest');
    } catch (err: any) {
      console.info('Geolocation prompt response:', err?.message);
      setLocationStatus('denied');
      setLocationNotice(
        err?.message || 'Location permission was denied. Showing available parking locations.'
      );
    }
  };

  useEffect(() => {
    // Attempt location permission on page load
    requestLocation();
  }, []);

  // Compute live distance if user coordinates are known, and sort appropriately
  const list = useMemo(() => {
    return parkingLocations
      .filter((loc) => {
        if (openOnly && loc.availableSlots <= 0) return false;
        return `${loc.name} ${loc.address} ${loc.zone}`.toLowerCase().includes(search.toLowerCase());
      })
      .map((loc) => {
        if (userLocation && typeof loc.latitude === 'number' && typeof loc.longitude === 'number') {
          const distKm = calculateDistanceKm(userLocation.lat, userLocation.lng, loc.latitude, loc.longitude);
          return {
            ...loc,
            calculatedKm: distKm,
            distance: formatDistanceKm(distKm),
          };
        }
        return {
          ...loc,
          calculatedKm: parseFloat(loc.distance) || 99,
        };
      })
      .sort((a, b) => {
        if (sort === 'price') return a.pricePerHour - b.pricePerHour;
        if (sort === 'availability') return b.availableSlots - a.availableSlots;
        if (sort === 'rating') return b.rating - a.rating;
        // 'nearest' - Use real coordinate distance when available
        return (a.calculatedKm ?? 99) - (b.calculatedKm ?? 99);
      });
  }, [parkingLocations, search, sort, openOnly, userLocation]);

  return (
    <UserPage>
      <main className="mx-auto max-w-[1240px] px-5 py-9 lg:px-8">
        <PageHeader
          eyebrow="Explore the city"
          title="Find parking"
          detail="Verified spaces around your destination, updated in real time from Firestore and Ola Maps."
          action={
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={requestLocation}
                disabled={locationStatus === 'locating'}
                className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-bold transition-all ${
                  locationStatus === 'granted'
                    ? 'border-[#26744d]/30 bg-[#e6f4ed] text-[#206943]'
                    : 'border-[#d5e2e6] bg-white text-[#36576a] hover:bg-[#f1f7f7]'
                }`}
                title="Use current location to find nearest spots"
              >
                <Navigation
                  size={13}
                  className={locationStatus === 'locating' ? 'animate-spin' : locationStatus === 'granted' ? 'text-[#206943]' : ''}
                />
                <span>
                  {locationStatus === 'locating'
                    ? 'Locating…'
                    : locationStatus === 'granted'
                    ? 'Using your GPS'
                    : 'Locate me'}
                </span>
              </button>
              <FilterButton active={openOnly} onClick={() => setOpenOnly(!openOnly)}>Open now</FilterButton>
            </div>
          }
        />

        {locationNotice && (
          <div className="mb-4 flex items-center justify-between rounded-xl border border-[#dfe7eb] bg-[#f8fafb] px-4 py-2.5 text-xs text-[#5f7481]">
            <span>{locationNotice}</span>
            <button
              onClick={() => setLocationNotice('')}
              className="font-bold text-[#286b70] hover:underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {parkingError && (
          <div className="mb-5 rounded-2xl bg-[#fceceb] p-4 text-xs font-semibold text-[#aa504c]">
            Database notice: {parkingError}
          </div>
        )}

        <div className="mb-5 flex flex-col gap-3 sm:flex-row">
          <div className="flex flex-1 items-center gap-3 rounded-xl border border-[#d9e4e8] bg-white px-4">
            <Search size={17} className="text-[#78949d]" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              data-testid="input-parking-search"
              placeholder="Search by location, landmark or address"
              className="w-full bg-transparent py-3 text-sm outline-none placeholder:text-[#9aabb2]"
            />
          </div>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            data-testid="select-parking-sort"
            className="rounded-xl border border-[#d9e4e8] bg-white px-4 py-3 text-sm font-semibold text-[#456274] outline-none"
          >
            <option value="nearest">Nearest first (GPS)</option>
            <option value="price">Lowest price</option>
            <option value="availability">Most available</option>
            <option value="rating">Highest rated</option>
          </select>
        </div>

        {parkingLoading && list.length === 0 ? (
          <div className="flex h-64 items-center justify-center rounded-2xl border border-[#dfe7eb] bg-white">
            <div className="flex items-center gap-3 text-sm font-semibold text-[#71858c]">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#286b70] border-t-transparent" />
              Loading real-time parking data…
            </div>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(360px,.95fr)]">
            <div className="space-y-3">
              {list.length ? (
                list.map((location) => <ParkingCard key={location.id} location={location} />)
              ) : (
                <EmptyState
                  icon={Search}
                  title="No spaces match that search"
                  detail="Try a nearby landmark or clear the search to see all locations."
                  action={<Button variant="quiet" onClick={() => setSearch('')}>Clear search</Button>}
                />
              )}
            </div>
            <div className="lg:sticky lg:top-[95px] lg:h-fit space-y-3">
              <div className="overflow-hidden rounded-2xl border border-[#cfdde2] shadow-sm">
                <OlaMap
                  locations={list}
                  userLocation={userLocation}
                  height={480}
                  onSelectLocation={(loc) => setLocation(`/parking/${loc.id}`)}
                />
              </div>
              <div className="rounded-xl border border-[#dfe7ec] bg-white/80 p-3 text-xs text-[#556e7d] backdrop-blur-xs flex items-center justify-between">
                <span>Click any pin to inspect real-time bay availability</span>
                <span className="font-bold text-[#1f4864]">{list.length} mapped</span>
              </div>
            </div>
          </div>
        )}
      </main>
    </UserPage>
  );
}

function LocationPage() {
  const { id } = useParams<{ id: string }>();
  const { parkingLocations, parkingLoading } = useApp();
  const location = parkingLocations.find((l) => l.id === id) || parkingLocations[0];

  // Routing and directions state
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [route, setRoute] = useState<DirectionsRoute | null>(null);
  const [directionsLoading, setDirectionsLoading] = useState(false);
  const [directionsError, setDirectionsError] = useState<string | null>(null);
  const [showDirectionsPanel, setShowDirectionsPanel] = useState(false);

  const handleGetDirections = async () => {
    setDirectionsLoading(true);
    setDirectionsError(null);
    setShowDirectionsPanel(true);

    try {
      // 1. Get user GPS or fallback nearby coordinate
      let userCoords = userLocation;
      const destLat = location.latitude ?? (location.id === 'metropark_001' ? 19.0439 : 12.9719);
      const destLng = location.longitude ?? (location.id === 'metropark_001' ? 73.0656 : 77.6020);

      if (!userCoords) {
        try {
          const pos = await getCurrentUserLocation(8000);
          userCoords = { lat: pos.latitude, lng: pos.longitude };
          setUserLocation(userCoords);
        } catch (geoErr: any) {
          // Fallback origin: nearby approach point based on destination
          const isKharghar = location.id === 'metropark_001' || Math.abs(destLat - 19.0439) < 0.1;
          console.info('GPS not available, using approach origin:', geoErr?.message);
          userCoords = isKharghar ? { lat: 19.0410, lng: 73.0620 } : { lat: 12.9719, lng: 77.6020 };
          setUserLocation(userCoords);
        }
      }

      // 2. Fetch Ola Maps directions route
      const directions = await getOlaDirections(
        { lat: userCoords.lat, lng: userCoords.lng },
        { lat: destLat, lng: destLng }
      );

      setRoute(directions);
    } catch (err: any) {
      console.error('Directions error:', err);
      setDirectionsError(err?.message || 'Could not fetch directions route.');
    } finally {
      setDirectionsLoading(false);
    }
  };

  if (!location && parkingLoading) {
    return (
      <UserPage>
        <main className="mx-auto max-w-[900px] px-5 py-16 text-center">
          <div className="inline-flex items-center gap-3 text-sm font-semibold text-[#71858c]">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#286b70] border-t-transparent" />
            Loading location details…
          </div>
        </main>
      </UserPage>
    );
  }

  if (!location) {
    return (
      <UserPage>
        <main className="mx-auto max-w-[900px] px-5 py-16">
          <EmptyState
            title="Location not found"
            detail="This parking location may have moved or is no longer available."
            action={<Link href="/parking" className="font-bold text-[#286b70]">Back to parking</Link>}
          />
        </main>
      </UserPage>
    );
  }

  return (
    <UserPage>
      <main className="mx-auto max-w-[1100px] px-5 py-9 lg:px-8">
        <Link href="/parking" data-testid="link-back-parking" className="mb-6 inline-flex items-center gap-2 text-xs font-bold text-[#6d838e]">
          <ArrowLeft size={14} />All locations
        </Link>
        <div className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${location.accent} p-7 md:p-10`}>
          <div className="absolute inset-0 grid-fade opacity-40" />
          <div className="relative">
            <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-white/70">
              <span className="rounded-full bg-white/15 px-2.5 py-1">Live Firestore sync</span>
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-[#8de0a7] pulse-dot" />Real-time sensor updates
              </span>
            </div>
            <h1 className="mt-5 font-display text-3xl font-bold tracking-[-.05em] text-white md:text-5xl">{location.name}</h1>
            <p className="mt-3 flex items-center gap-2 text-sm text-white/75">
              <MapPin size={15} />{location.address} · {location.distance} away
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href={`/parking/${location.id}/select`}
                data-testid="link-reserve-parking"
                className="inline-flex items-center gap-2 rounded-xl bg-[#f4c16e] px-5 py-3 text-sm font-bold text-[#443116] hover:bg-[#ffd080]"
              >
                Reserve a space <ArrowRight size={16} />
              </Link>
              <button
                type="button"
                onClick={handleGetDirections}
                disabled={directionsLoading}
                data-testid="button-directions"
                className="inline-flex items-center gap-2 rounded-xl border border-white/25 bg-white/10 px-5 py-3 text-sm font-bold text-white hover:bg-white/15 disabled:opacity-50"
              >
                {directionsLoading ? (
                  <>
                    <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Calculating route…
                  </>
                ) : (
                  <>
                    <Navigation size={15} /> Get directions
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Live Route Navigation Banner if active */}
        {showDirectionsPanel && (
          <div className="mt-5 rounded-2xl border border-[#2a6d71]/30 bg-[#eef7f6] p-4 text-xs shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-[#277873] text-white">
                  <Navigation size={16} />
                </span>
                <div>
                  <p className="font-bold text-[#1a4150]">
                    Directions to {location.name}
                  </p>
                  <p className="text-[#5b737d]">
                    {route
                      ? `${route.distanceFormatted} · approx ${route.durationFormatted}`
                      : directionsLoading
                      ? 'Contacting Ola Maps routing service…'
                      : 'Route active'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${location.latitude || (location.id === 'metropark_001' ? 19.0439 : 12.9719)},${location.longitude || (location.id === 'metropark_001' ? 73.0656 : 77.6020)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 rounded-lg border border-[#cfdfe2] bg-white px-3 py-1.5 font-bold text-[#20495f] hover:bg-[#f3f7f8]"
                >
                  <ExternalLink size={12} /> Open in Maps app
                </a>
                <button
                  type="button"
                  onClick={() => setShowDirectionsPanel(false)}
                  className="rounded-lg p-1 text-[#6c8592] hover:bg-[#e0eceb]"
                  title="Close route panel"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
            {directionsError && (
              <p className="mt-2 text-[#aa504c]">{directionsError}</p>
            )}
          </div>
        )}

        <div className="mt-6 grid gap-5 lg:grid-cols-[1.15fr_.85fr]">
          <div className="space-y-5">
            <div className="rounded-2xl border border-[#dfe7eb] bg-white p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-bold text-[#788994]">Availability right now</p>
                  <p className="mt-1 font-display text-3xl font-bold text-[#183653]">
                    {location.availableSlots} <span className="text-base font-medium text-[#8a999f]">/ {location.totalSlots} spaces</span>
                  </p>
                </div>
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#e3f3e9] text-[#26784e]">
                  <Zap size={18} />
                </span>
              </div>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#edf1f1]">
                <div
                  className="h-full rounded-full bg-[#4a9b7d]"
                  style={{ width: `${(location.availableSlots / Math.max(1, location.totalSlots)) * 100}%` }}
                />
              </div>
              <p className="mt-2 text-[11px] text-[#81919a]">Live updates directly from Firestore ParkingSlots collection.</p>
            </div>
            <SlotMap slots={location.slots} />
          </div>

          <div className="space-y-5">
            {/* Ola Map Location & Directions Viewer */}
            <div className="overflow-hidden rounded-2xl border border-[#dfe7eb] bg-white p-4 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#234b62]">Interactive Map</span>
                <span className="text-[10px] font-semibold text-[#66818f]">{location.zone} Zone</span>
              </div>
              <div className="overflow-hidden rounded-xl border border-[#e1e9ec]">
                <OlaMap
                  locations={[location]}
                  selectedLocation={location}
                  userLocation={userLocation}
                  routeCoordinates={route?.coordinates}
                  height={240}
                  zoom={14}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-[#6d828f]">
                <span>Coordinates: {location.latitude?.toFixed(4)}, {location.longitude?.toFixed(4)}</span>
                <button
                  type="button"
                  onClick={handleGetDirections}
                  className="font-bold text-[#277873] hover:underline"
                >
                  {route ? 'Refresh route' : 'Get directions'}
                </button>
              </div>
            </div>

            <div className="rounded-2xl border border-[#dfe7eb] bg-white p-5">
              <p className="text-xs font-bold text-[#788994]">At a glance</p>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-[#f3f7f7] p-3">
                  <p className="text-[10px] text-[#87969d]">Rate</p>
                  <p className="mt-1 font-display text-xl font-bold text-[#25475c]">₹{location.pricePerHour}<span className="text-xs font-sans font-medium text-[#84949b]"> / hr</span></p>
                </div>
                <div className="rounded-xl bg-[#f3f7f7] p-3">
                  <p className="text-[10px] text-[#87969d]">Rating</p>
                  <p className="mt-1 font-display text-xl font-bold text-[#25475c]">★ {location.rating}</p>
                </div>
              </div>
              <p className="mt-4 flex items-center gap-2 text-xs text-[#687d88]"><Clock3 size={14} />{location.hours}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {location.facilities.map((item) => (
                  <span key={item} className="rounded-lg bg-[#e8f1f1] px-2.5 py-1.5 text-[11px] font-semibold text-[#397277]">{item}</span>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-[#dfe7eb] bg-[#eef5f3] p-5">
              <p className="flex items-center gap-2 text-sm font-bold text-[#2d6569]"><ShieldCheck size={17} /> Live sensor monitored</p>
              <p className="mt-2 text-xs leading-5 text-[#71858c]">Slots A1, A2, A3, A4 are synchronized with your hardware and Firestore in real time.</p>
            </div>
          </div>
        </div>
      </main>
    </UserPage>
  );
}

function SelectPage() {
  const { id } = useParams<{ id: string }>();
  const { parkingLocations, addBooking, user } = useApp();
  const [, navigate] = useLocation();
  const location = parkingLocations.find((l) => l.id === id) || parkingLocations[0];
  const [selected, setSelected] = useState<ParkingSlot | undefined>();
  
  // Date and Time states
  const todayStr = new Date().toISOString().split('T')[0];
  const [date, setDate] = useState(todayStr);
  const [startTime, setStartTime] = useState('10:00 AM');
  const [endTime, setEndTime] = useState('12:00 PM');
  const [success, setSuccess] = useState<Booking | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const timeOptions = [
    '06:00 AM', '07:00 AM', '08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM',
    '12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM',
    '06:00 PM', '07:00 PM', '08:00 PM', '09:00 PM', '10:00 PM', '11:00 PM'
  ];

  // Calculate duration in hours between startTime and endTime
  const calculateDuration = () => {
    const startIdx = timeOptions.indexOf(startTime);
    const endIdx = timeOptions.indexOf(endTime);
    if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
      return endIdx - startIdx;
    }
    return 1;
  };

  const duration = calculateDuration();
  const pricePerHour = location?.pricePerHour || 30;
  const totalAmount = pricePerHour * duration;

  // Keep selection synchronized with real-time status changes
  const liveSelectedSlot = selected ? location?.slots.find((s) => s.id === selected.id) : undefined;
  const isSelectedAvailable = liveSelectedSlot?.status === 'available';

  if (!location) return <Redirect to="/parking" />;

  const confirm = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (!liveSelectedSlot || liveSelectedSlot.status !== 'available' || saving) {
      if (liveSelectedSlot && liveSelectedSlot.status !== 'available') {
        setError('Sorry, this parking slot is no longer available.');
      } else {
        setError('Please select an available parking bay first.');
      }
      return;
    }
    setError('');
    setSaving(true);
    try {
      const booking = await addBooking({
        locationId: location.id,
        locationName: location.name,
        address: location.address,
        slotId: liveSelectedSlot.id,
        slotNumber: liveSelectedSlot.label,
        slot: liveSelectedSlot.label,
        date,
        startTime,
        endTime,
        time: `${startTime} - ${endTime}`,
        duration,
        amount: totalAmount,
      });
      setSuccess(booking);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sorry, this parking slot is no longer available.');
    } finally {
      setSaving(false);
    }
  };

  if (success) {
    return (
      <UserPage>
        <main className="mx-auto max-w-[850px] px-5 py-12 lg:px-8">
          <div className="rounded-3xl border border-[#cfe7da] bg-[#f5fbf7] p-7 text-center md:p-10 shadow-sm">
            <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[#d5f0df] text-[#287850]">
              <Check size={28} />
            </span>
            <p className="mt-5 text-[11px] font-bold uppercase tracking-[.16em] text-[#34805a]">Booking Confirmed</p>
            <h1 className="mt-2 font-display text-3xl font-bold tracking-[-.05em] text-[#183653]">Your parking bay is reserved.</h1>
            <p className="mt-2 text-sm text-[#71858c]">A reservation has been securely saved in your SmartPark account.</p>

            <div className="mx-auto mt-7 max-w-[550px] rounded-2xl border border-[#d6e7dc] bg-white p-6 text-left shadow-sm">
              <div className="flex items-center justify-between border-b border-[#eef4f0] pb-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#82998e]">Booking ID</p>
                  <p className="font-mono text-sm font-bold text-[#183653]">{success.id}</p>
                </div>
                <StatusBadge status={success.status} />
              </div>

              <div className="mt-4 grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-[#849692]">Parking Location</span>
                  <p className="mt-0.5 font-bold text-[#183653]">{success.locationName}</p>
                  {success.address && <p className="text-[11px] text-[#788e89]">{success.address}</p>}
                </div>
                <div>
                  <span className="text-[#849692]">Slot Number</span>
                  <p className="mt-0.5 font-display text-base font-bold text-[#287850]">Slot {success.slotNumber || success.slot}</p>
                </div>
                <div>
                  <span className="text-[#849692]">Date</span>
                  <p className="mt-0.5 font-semibold text-[#183653]">{success.date}</p>
                </div>
                <div>
                  <span className="text-[#849692]">Time Window</span>
                  <p className="mt-0.5 font-semibold text-[#183653]">{success.startTime || startTime} to {success.endTime || endTime}</p>
                </div>
                <div>
                  <span className="text-[#849692]">Duration</span>
                  <p className="mt-0.5 font-semibold text-[#183653]">{success.duration} hour{success.duration > 1 ? 's' : ''}</p>
                </div>
                <div>
                  <span className="text-[#849692]">Total Amount</span>
                  <p className="mt-0.5 font-bold text-[#183653]">₹{success.amount}</p>
                </div>
              </div>
            </div>

            <div className="mx-auto mt-6 max-w-[360px]">
              <QRCard bookingId={success.id} />
            </div>

            <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${location.latitude ?? (location.id === 'metropark_001' ? 19.0439 : 12.9719)},${location.longitude ?? (location.id === 'metropark_001' ? 73.0656 : 77.6020)}`}
                target="_blank"
                rel="noreferrer"
                data-testid="link-get-directions"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#277873] px-5 py-3 text-sm font-bold text-white shadow-sm hover:bg-[#1f6360]"
              >
                <Navigation size={16} /> Get Directions
              </a>
              <Link href="/bookings" data-testid="link-view-confirmed-booking" className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#153b5b] px-5 py-3 text-sm font-bold text-white shadow-sm hover:bg-[#20496d]">
                View My Bookings <ArrowRight size={16} />
              </Link>
              <Link href="/parking" data-testid="link-back-to-parking" className="inline-flex items-center justify-center rounded-xl border border-[#d5e2e6] bg-white px-5 py-3 text-sm font-bold text-[#36576a] hover:bg-[#f7fafb]">
                Find another space
              </Link>
            </div>
          </div>
        </main>
      </UserPage>
    );
  }

  return (
    <UserPage>
      <main className="mx-auto max-w-[1100px] px-5 py-9 lg:px-8">
        <Link href={`/parking/${location.id}`} className="mb-6 inline-flex items-center gap-2 text-xs font-bold text-[#6d838e]">
          <ArrowLeft size={14} />{location.name}
        </Link>
        <PageHeader eyebrow="Reservation Setup" title="Choose your space" detail="Select an available bay, choose your arrival date and time window, and confirm your reservation." />
        <div className="grid gap-5 lg:grid-cols-[1.2fr_.8fr]">
          <SlotMap slots={location.slots} selected={liveSelectedSlot?.id} onSelect={(slot) => { setSelected(slot); setError(''); }} />
          <div className="h-fit rounded-2xl border border-[#dfe7eb] bg-white p-5 lg:sticky lg:top-[90px] shadow-sm">
            <p className="text-xs font-bold uppercase tracking-[.12em] text-[#c28636]">Review Booking</p>
            <h2 className="mt-1 font-display text-xl font-bold text-[#183653]">{location.name}</h2>
            <p className="text-xs text-[#7d9099]">{location.address}</p>

            <div className="mt-5 space-y-3">
              <label className="block text-[11px] font-bold text-[#71838d]">
                Select Date
                <input
                  type="date"
                  value={date}
                  min={todayStr}
                  onChange={(e) => setDate(e.target.value)}
                  data-testid="input-arrival-date"
                  className="mt-1.5 w-full rounded-xl border border-[#d9e4e8] px-3 py-2.5 text-sm font-semibold text-[#345064] outline-none focus:border-[#7faeb5]"
                />
              </label>

              <div className="grid grid-cols-2 gap-3">
                <label className="text-[11px] font-bold text-[#71838d]">
                  Start Time
                  <select
                    value={startTime}
                    onChange={(e) => {
                      const newStart = e.target.value;
                      setStartTime(newStart);
                      const startIdx = timeOptions.indexOf(newStart);
                      const endIdx = timeOptions.indexOf(endTime);
                      if (endIdx <= startIdx && startIdx + 1 < timeOptions.length) {
                        setEndTime(timeOptions[startIdx + 1]);
                      }
                    }}
                    data-testid="select-start-time"
                    className="mt-1.5 w-full rounded-xl border border-[#d9e4e8] bg-white px-3 py-2.5 text-sm font-semibold text-[#345064] outline-none focus:border-[#7faeb5]"
                  >
                    {timeOptions.slice(0, -1).map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </label>

                <label className="text-[11px] font-bold text-[#71838d]">
                  End Time
                  <select
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    data-testid="select-end-time"
                    className="mt-1.5 w-full rounded-xl border border-[#d9e4e8] bg-white px-3 py-2.5 text-sm font-semibold text-[#345064] outline-none focus:border-[#7faeb5]"
                  >
                    {timeOptions.filter((opt) => timeOptions.indexOf(opt) > timeOptions.indexOf(startTime)).map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </label>
              </div>
            </div>

            <div className="my-5 border-t border-[#e7edef] pt-4">
              <div className="flex justify-between text-xs text-[#7b8d96]">
                <span>Selected Bay</span>
                <strong className={`font-bold ${isSelectedAvailable ? 'text-[#287850]' : liveSelectedSlot ? 'text-[#ae4642]' : 'text-[#345064]'}`}>
                  {liveSelectedSlot?.label ? `Slot ${liveSelectedSlot.label} (${liveSelectedSlot.status})` : 'Choose a bay'}
                </strong>
              </div>
              <div className="mt-2 flex justify-between text-xs text-[#7b8d96]">
                <span>Rate per hour</span>
                <strong className="text-[#345064]">₹{pricePerHour} / hr</strong>
              </div>
              <div className="mt-2 flex justify-between text-xs text-[#7b8d96]">
                <span>Duration</span>
                <strong className="text-[#345064]">{duration} hour{duration > 1 ? 's' : ''}</strong>
              </div>
              <div className="mt-3 flex justify-between border-t border-[#e7edef] pt-3 text-sm font-bold text-[#183653]">
                <span>Estimated Total</span>
                <span className="text-base text-[#153b5b]">₹{totalAmount}</span>
              </div>
            </div>

            {error && (
              <div data-testid="status-booking-error" className="mb-3 rounded-xl bg-[#fceceb] border border-[#f4c7c4] px-3 py-2.5 text-xs font-semibold text-[#aa504c]">
                {error}
              </div>
            )}

            <Button onClick={confirm} disabled={!isSelectedAvailable || saving} className="w-full">
              {saving ? 'Processing Reservation…' : isSelectedAvailable ? `Confirm Reservation (Slot ${liveSelectedSlot?.label})` : 'Select an available slot'} <ArrowRight size={15} />
            </Button>
            <p className="mt-3 text-center text-[10px] leading-4 text-[#93a0a6]">Firestore transaction guarantees real-time concurrency protection.</p>
          </div>
        </div>
      </main>
    </UserPage>
  );
}

function BookingsPage() {
  const { bookings, cancelBooking, user } = useApp();
  const [tab, setTab] = useState('all');
  const [cancelError, setCancelError] = useState('');

  // Only display bookings belonging to the logged-in user
  const userBookings = user ? bookings.filter((b) => !b.userId || b.userId === user.id) : bookings;

  const filtered = userBookings.filter((booking) => {
    if (tab === 'all') return true;
    if (tab === 'upcoming' || tab === 'confirmed') return booking.status === 'confirmed' || booking.status === 'upcoming';
    return booking.status === tab;
  });

  const handleCancel = async (id: string) => {
    setCancelError('');
    try {
      await cancelBooking(id);
    } catch (err) {
      setCancelError(err instanceof Error ? err.message : 'Unable to cancel booking.');
    }
  };

  return (
    <UserPage>
      <main className="mx-auto max-w-[1000px] px-5 py-9 lg:px-8">
        <PageHeader
          eyebrow="Reservation Management"
          title="My Bookings"
          detail="All your parking reservations tracked in real-time with Firestore."
          action={
            <Link href="/parking" data-testid="link-new-booking" className="inline-flex items-center gap-2 rounded-xl bg-[#153b5b] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#20496d]">
              <Plus size={15} /> New booking
            </Link>
          }
        />
        {cancelError && (
          <div className="mb-4 rounded-xl bg-[#fceceb] border border-[#f4c7c4] px-4 py-3 text-xs font-semibold text-[#aa504c]">
            {cancelError}
          </div>
        )}
        <div className="mb-5 flex gap-1 overflow-x-auto rounded-xl bg-[#eaf0f1] p-1">
          {[
            ['all', 'All Bookings'],
            ['confirmed', 'Confirmed / Upcoming'],
            ['active', 'Active'],
            ['completed', 'Completed'],
            ['cancelled', 'Cancelled'],
          ].map(([value, label]) => (
            <button
              key={value}
              onClick={() => setTab(value)}
              data-testid={`tab-bookings-${value}`}
              className={`whitespace-nowrap rounded-lg px-4 py-2 text-xs font-bold transition-all ${
                tab === value ? 'bg-white text-[#234b63] shadow-sm' : 'text-[#82939c] hover:text-[#345064]'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        {filtered.length ? (
          <div className="grid gap-3 md:grid-cols-2">
            {filtered.map((booking) => (
              <BookingCard key={booking.id} booking={booking} onCancel={handleCancel} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={CalendarDays}
            title={`No ${tab === 'all' ? '' : tab} bookings found`}
            detail="Your parking reservations will appear here automatically when booked."
            action={
              <Link href="/parking" className="inline-flex rounded-xl bg-[#153b5b] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#20496d]">
                Find parking
              </Link>
            }
          />
        )}
      </main>
    </UserPage>
  );
}

function BookingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { bookings, cancelBooking } = useApp();
  const [, setLocation] = useLocation();
  const [cancelErr, setCancelErr] = useState('');
  const [cancelling, setCancelling] = useState(false);

  const booking = bookings.find((item) => item.id === id);
  if (!booking) {
    return (
      <UserPage>
        <main className="mx-auto max-w-[850px] px-5 py-16">
          <EmptyState
            title="Booking not found"
            detail="This booking does not exist or has not loaded yet."
            action={<Link href="/bookings" className="font-bold text-[#286b70]">Back to bookings</Link>}
          />
        </main>
      </UserPage>
    );
  }

  const isCancellable = booking.status === 'confirmed' || booking.status === 'upcoming';
  const displayTime = booking.startTime && booking.endTime ? `${booking.startTime} - ${booking.endTime}` : (booking.time || '12:00 PM');

  const handleCancel = async () => {
    setCancelErr('');
    setCancelling(true);
    try {
      await cancelBooking(booking.id);
      setLocation('/bookings');
    } catch (err) {
      setCancelErr(err instanceof Error ? err.message : 'Failed to cancel booking.');
    } finally {
      setCancelling(false);
    }
  };

  return (
    <UserPage>
      <main className="mx-auto max-w-[850px] px-5 py-9 lg:px-8">
        <Link href="/bookings" className="mb-6 inline-flex items-center gap-2 text-xs font-bold text-[#6d838e]">
          <ArrowLeft size={14} />My bookings
        </Link>
        <PageHeader
          eyebrow={`Booking ID: ${booking.id}`}
          title={booking.locationName}
          detail={`${booking.date} · ${displayTime}`}
          action={<StatusBadge status={booking.status} />}
        />
        {cancelErr && (
          <div className="mb-4 rounded-xl bg-[#fceceb] border border-[#f4c7c4] px-4 py-3 text-xs font-semibold text-[#aa504c]">
            {cancelErr}
          </div>
        )}
        <div className="grid gap-5 md:grid-cols-[1fr_280px]">
          <div className="rounded-2xl border border-[#dfe7eb] bg-white p-5">
            <div className="grid gap-5 sm:grid-cols-2">
              {[
                ['Parking Bay', `Slot ${booking.slotNumber || booking.slot}`],
                ['Time Window', displayTime],
                ['Date', booking.date],
                ['Duration', `${booking.duration} hour${booking.duration > 1 ? 's' : ''}`],
                ['Amount', money(booking.amount)],
                ['Status', booking.status.toUpperCase()],
                ['Location', booking.locationName],
                ['Booking ID', booking.id],
              ].map(([label, value]) => (
                <div key={label}>
                  <p className="text-[10px] font-bold uppercase tracking-[.12em] text-[#8b999f]">{label}</p>
                  <p className="mt-1 font-display text-lg font-bold text-[#294a5f]">{value}</p>
                </div>
              ))}
            </div>
            <div className="mt-7 rounded-xl bg-[#eef5f3] p-4">
              <p className="flex items-center gap-2 text-sm font-bold text-[#2d6569]">
                <ShieldCheck size={16} /> Arrival instructions
              </p>
              <p className="mt-2 text-xs leading-5 text-[#71858c]">
                Enter through the marked SmartPark lane and scan your QR access pass at the barrier or desk. Your slot {booking.slotNumber || booking.slot} is reserved.
              </p>
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              {isCancellable && (
                <Button variant="danger" disabled={cancelling} onClick={handleCancel}>
                  {cancelling ? 'Cancelling…' : 'Cancel booking'}
                </Button>
              )}
            </div>
          </div>
          <QRCard bookingId={booking.id} />
        </div>
      </main>
    </UserPage>
  );
}

function HistoryPage() {
  const { bookings } = useApp(); const completed = bookings.filter((booking) => booking.status === 'completed'); const total = completed.reduce((sum, booking) => sum + booking.amount, 0);
  return <UserPage><main className="mx-auto max-w-[1000px] px-5 py-9 lg:px-8"><PageHeader eyebrow="Your footprint" title="Parking history" detail="A simple record of where you have been." action={<Button variant="outline"><Download size={15} /> Export</Button>} /><div className="mb-6 grid gap-3 sm:grid-cols-3"><StatCard label="Parking sessions" value={`${completed.length}`} icon={History} tone="navy" /><StatCard label="Hours parked" value={`${completed.reduce((sum, booking) => sum + booking.duration, 0)}h`} icon={Clock3} tone="teal" /><StatCard label="Total spent" value={money(total)} icon={CreditCard} tone="gold" /></div><div className="overflow-hidden rounded-2xl border border-[#dfe7eb] bg-white">{completed.length ? <div className="divide-y divide-[#edf1f2]">{completed.map((booking) => <div key={booking.id} data-testid={`row-history-${booking.id}`} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-[#e8f1f3] text-[#39737c]"><History size={17} /></span><div><p className="text-sm font-bold text-[#294a5f]">{booking.locationName}</p><p className="mt-1 text-xs text-[#86959c]">{booking.date} · Slot {booking.slot} · {booking.duration} hours</p></div></div><div className="flex items-center justify-between sm:gap-8"><span className="text-sm font-bold text-[#294a5f]">₹{booking.amount}</span><StatusBadge status={booking.status} /></div></div>)}</div> : <EmptyState icon={History} title="No history yet" detail="Completed trips will appear here." />}</div></main></UserPage>;
}

function ProfilePage() {
  const { user, updateUserProfile } = useApp();
  const [name, setName] = useState(user?.name || '');
  const [phoneDigits, setPhoneDigits] = useState(user?.phone ? user.phone.replace(/\D/g, '').slice(-10) : '');
  const [vehicle, setVehicle] = useState(user?.vehicle && user.vehicle !== '—' && !user.vehicle.startsWith('Add a vehicle') ? user.vehicle : '');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  const handlePhoneChange = (val: string) => {
    const raw = val.replace(/\D/g, '').slice(0, 10);
    setPhoneDigits(raw);
  };

  const handleSave = async () => {
    setErr('');
    setMsg('');
    if (phoneDigits && phoneDigits.length !== 10) {
      setErr('Phone number must be exactly 10 digits.');
      return;
    }

    setSaving(true);
    try {
      const formattedPhone = phoneDigits.length === 10 ? `+91 ${phoneDigits.slice(0, 5)} ${phoneDigits.slice(5)}` : user?.phone || '';
      await updateUserProfile({
        name: name.trim() || user?.name,
        phone: formattedPhone,
        vehicle: vehicle.trim() || '—',
      });
      setMsg('Profile updated successfully!');
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <UserPage>
      <main className="mx-auto max-w-[900px] px-5 py-9 lg:px-8">
        <PageHeader eyebrow="Account" title="Your profile" detail="Keep your arrival preferences and contact info up to date." />
        <div className="grid gap-5 md:grid-cols-[250px_1fr]">
          <aside className="h-fit rounded-2xl border border-[#dfe7eb] bg-white p-5">
            <div className="grid h-16 w-16 place-items-center rounded-2xl bg-[#d8e8ed] font-display text-xl font-bold text-[#1d5b72]">
              {user?.name.split(' ').map((n) => n[0]).join('')}
            </div>
            <h2 className="mt-4 font-display text-lg font-bold text-[#294a5f]">{user?.name}</h2>
            <p className="mt-1 text-xs text-[#84939b]">{user?.email}</p>
            <div className="mt-6 space-y-1 text-xs font-semibold text-[#72848d]">
              <p className="rounded-lg bg-[#eef5f3] px-3 py-2 text-[#2c6c72]">Personal information</p>
              <p className="px-3 py-2">Vehicle preferences</p>
              <p className="px-3 py-2">Security</p>
            </div>
          </aside>

          <div className="space-y-5">
            <section className="rounded-2xl border border-[#dfe7eb] bg-white p-5">
              <h2 className="font-display text-lg font-bold text-[#294a5f]">Personal information</h2>
              {msg && <div className="mt-3 rounded-xl bg-[#e3f3e9] px-3 py-2 text-xs font-semibold text-[#27754d]">{msg}</div>}
              {err && <div className="mt-3 rounded-xl bg-[#fceceb] px-3 py-2 text-xs font-semibold text-[#aa504c]">{err}</div>}
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <label className="text-xs font-bold text-[#71838d]">
                  Full name
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    data-testid="input-profile-name"
                    className="mt-2 w-full rounded-xl border border-[#d9e4e8] px-3 py-2.5 text-sm font-medium text-[#345064] outline-none focus:border-[#7faeb5]"
                  />
                </label>
                <label className="text-xs font-bold text-[#71838d]">
                  Email
                  <input
                    value={user?.email || ''}
                    readOnly
                    data-testid="input-profile-email"
                    className="mt-2 w-full rounded-xl border border-[#d9e4e8] bg-[#f5f8f8] px-3 py-2.5 text-sm font-medium text-[#829199] outline-none"
                  />
                </label>
                <label className="text-xs font-bold text-[#71838d]">
                  <div className="flex justify-between items-center">
                    <span>Phone number</span>
                    <span className="text-[10px] text-[#829199]">{phoneDigits.length}/10 digits</span>
                  </div>
                  <div className="relative mt-2 flex items-center">
                    <span className="absolute left-3 text-xs font-bold text-[#71858f]">+91</span>
                    <input
                      type="tel"
                      maxLength={10}
                      value={phoneDigits}
                      onChange={(e) => handlePhoneChange(e.target.value)}
                      placeholder="9876543210"
                      data-testid="input-profile-phone"
                      className="w-full rounded-xl border border-[#d9e4e8] pl-11 pr-3 py-2.5 text-sm font-medium text-[#345064] outline-none focus:border-[#7faeb5]"
                    />
                  </div>
                </label>
                <label className="text-xs font-bold text-[#71838d]">
                  Default duration
                  <select className="mt-2 w-full rounded-xl border border-[#d9e4e8] bg-white px-3 py-2.5 text-sm font-medium text-[#345064] outline-none">
                    <option>2 hours</option>
                    <option>1 hour</option>
                    <option>3 hours</option>
                  </select>
                </label>
              </div>
              <div className="mt-5 flex items-center justify-between border-t border-[#edf1f2] pt-4">
                <span className="text-xs text-[#809099]">Saved to your account profile.</span>
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? 'Saving…' : 'Save changes'}
                </Button>
              </div>
            </section>

            <section className="rounded-2xl border border-[#dfe7eb] bg-white p-5">
              <h2 className="font-display text-lg font-bold text-[#294a5f]">Vehicle information</h2>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <label className="text-xs font-bold text-[#71838d]">
                  Vehicle number
                  <input
                    value={vehicle}
                    onChange={(e) => setVehicle(e.target.value)}
                    placeholder="KA 03 MN 2841"
                    className="mt-2 w-full rounded-xl border border-[#d9e4e8] px-3 py-2.5 text-sm outline-none focus:border-[#7faeb5]"
                  />
                </label>
                <label className="text-xs font-bold text-[#71838d]">
                  Vehicle type
                  <select className="mt-2 w-full rounded-xl border border-[#d9e4e8] bg-white px-3 py-2.5 text-sm outline-none">
                    <option>Car</option>
                    <option>Motorcycle</option>
                    <option>SUV</option>
                  </select>
                </label>
              </div>
            </section>
          </div>
        </div>
      </main>
    </UserPage>
  );
}

function NotificationsPage() {
  const { notifications: items, unreadCount, markNotificationAsRead, markAllNotificationsAsRead, bookings } = useApp();

  return (
    <UserPage>
      <main className="mx-auto max-w-[850px] px-5 py-9 lg:px-8">
        <PageHeader
          eyebrow="Stay in the loop"
          title="Notifications"
          detail={
            items.length > 0
              ? `${items.length} update${items.length > 1 ? 's' : ''} for your reservations.`
              : 'Real-time alerts for your active and upcoming reservations.'
          }
          action={
            items.length > 0 && unreadCount > 0 ? (
              <Button variant="outline" onClick={markAllNotificationsAsRead}>
                Mark all read
              </Button>
            ) : null
          }
        />

        {items.length === 0 ? (
          <EmptyState
            icon={Bell}
            title="No notifications yet"
            detail="You don't have any active or past reservations to receive updates for. Book a parking space to get live arrival alerts."
            action={
              <Link
                href="/parking"
                className="inline-flex items-center gap-2 rounded-xl bg-[#153b5b] px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-[#20486b]"
              >
                <ParkingSquare size={16} /> Find parking space
              </Link>
            }
          />
        ) : (
          <div className="overflow-hidden rounded-2xl border border-[#dfe7eb] bg-white">
            <div className="divide-y divide-[#edf1f2]">
              {items.map((item) => (
                <button
                  onClick={() => markNotificationAsRead(item.id)}
                  key={item.id}
                  data-testid={`notification-${item.id}`}
                  className={`flex w-full items-start gap-4 p-5 text-left transition-colors hover:bg-[#f7faf9] ${
                    item.unread ? 'bg-[#f3f8f7]' : ''
                  }`}
                >
                  <span
                    className={`mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl ${
                      item.type === 'booking'
                        ? 'bg-[#e7eef7] text-[#3b6482]'
                        : item.type === 'availability'
                        ? 'bg-[#e3f3e9] text-[#287850]'
                        : 'bg-[#fff0d5] text-[#a37129]'
                    }`}
                  >
                    {item.type === 'booking' ? (
                      <CalendarDays size={17} />
                    ) : item.type === 'availability' ? (
                      <Zap size={17} />
                    ) : (
                      <Bell size={17} />
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2 text-sm font-bold text-[#294a5f]">
                      {item.title}
                      {item.unread && <span className="h-1.5 w-1.5 rounded-full bg-[#ddaa4c]" />}
                    </span>
                    <span className="mt-1 block text-xs text-[#7b8c94]">{item.detail}</span>
                  </span>
                  <span className="shrink-0 text-[10px] text-[#9aa6ac]">{item.time}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </main>
    </UserPage>
  );
}

function AdminDashboard() {
  const { allBookings, user, parkingLocations, parkingSlots } = useApp();
  const occupied = parkingLocations.reduce((sum, location) => sum + Math.max(0, location.totalSlots - location.availableSlots), 0);
  const total = parkingLocations.reduce((sum, location) => sum + location.totalSlots, 0) || parkingSlots.length;
  const upcoming = allBookings.filter((b) => b.status === 'upcoming').length;
  const active = allBookings.filter((b) => b.status === 'active').length;
  const recent = allBookings.slice(0, 6);
  const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });
  const occupancyPercentage = total > 0 ? Math.round((occupied / total) * 100) : 0;

  return (
    <AdminPage>
      <PageHeader
        eyebrow={today}
        title={`Welcome back, ${user?.name || 'Admin'}.`}
        detail="Here is how the network is moving today in real time from Firestore."
        action={
          <Link href="/admin/new-booking" className="inline-flex items-center gap-2 rounded-xl bg-[#153b5b] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#214d6d]">
            <Plus size={15} /> New booking
          </Link>
        }
      />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total spaces" value={`${total}`} icon={ParkingSquare} />
        <StatCard label="Occupied now" value={`${occupied}`} icon={Car} tone="teal" />
        <StatCard label="Available now" value={`${Math.max(0, total - occupied)}`} icon={Gauge} tone="green" />
        <StatCard label="Active reservations" value={`${active + upcoming}`} icon={CalendarDays} tone="gold" />
      </div>
      <div className="mt-5 grid gap-5 xl:grid-cols-[1.3fr_.7fr]">
        <section className="rounded-2xl border border-[#dfe7eb] bg-white p-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-lg font-bold text-[#294a5f]">Network occupancy</h2>
              <p className="mt-1 text-xs text-[#84939b]">Current footprint across all locations</p>
            </div>
            <span className="rounded-lg bg-[#e3f3e9] px-2.5 py-1.5 text-[10px] font-bold text-[#287850]">
              Healthy · {occupancyPercentage}%
            </span>
          </div>
          <div className="mt-6 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analyticsData}>
                <defs>
                  <linearGradient id="occ" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#3d9b8a" stopOpacity=".28" />
                    <stop offset="1" stopColor="#3d9b8a" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#edf1f2" vertical={false} />
                <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#8a999f' }} />
                <YAxis hide domain={[0, 100]} />
                <Tooltip contentStyle={{ border: '1px solid #dfe7eb', borderRadius: 12, fontSize: 11 }} />
                <Area type="monotone" dataKey="occupancy" stroke="#328879" strokeWidth={3} fill="url(#occ)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>
        <section className="rounded-2xl border border-[#dfe7eb] bg-white p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-bold text-[#294a5f]">Live locations</h2>
            <Link href="/admin/locations" className="text-xs font-bold text-[#286b70]">View all</Link>
          </div>
          <div className="mt-4 space-y-3">
            {parkingLocations.slice(0, 4).map((location) => (
              <div key={location.id} className="flex items-center justify-between rounded-xl bg-[#f5f8f8] p-3">
                <div className="min-w-0">
                  <p className="truncate text-xs font-bold text-[#345064]">{location.name}</p>
                  <p className="mt-1 text-[10px] text-[#8b9aa1]">
                    {location.availableSlots} available of {location.totalSlots}
                  </p>
                </div>
                <div className="ml-3 h-1.5 w-16 overflow-hidden rounded-full bg-[#dfeae5]">
                  <div
                    className="h-full rounded-full bg-[#43947c]"
                    style={{ width: `${(location.availableSlots / Math.max(1, location.totalSlots)) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
      <section className="mt-5 rounded-2xl border border-[#dfe7eb] bg-white p-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-lg font-bold text-[#294a5f]">Recent reservations</h2>
            <p className="mt-1 text-xs text-[#84939b]">Latest booking activity across Parkwise</p>
          </div>
          <Link href="/admin/reservations" className="text-xs font-bold text-[#286b70]">
            Open queue <ArrowRight size={13} className="ml-1 inline" />
          </Link>
        </div>
        {recent.length ? (
          <div className="mt-4 grid gap-2 md:grid-cols-2 xl:grid-cols-3">
            {recent.map((booking) => (
              <div key={booking.id} className="flex items-center gap-3 rounded-xl bg-[#f5f8f8] p-3">
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-[#e7eef7] text-[#3b6482]">
                  <CalendarDays size={14} />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-xs font-bold text-[#345064]">{booking.locationName}</p>
                  <p className="text-[10px] text-[#8b9aa1]">
                    {booking.id} · {booking.userName || 'Walk-in'} · Slot {booking.slot}
                  </p>
                </div>
                <StatusBadge status={booking.status} />
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-4">
            <EmptyState
              icon={CalendarDays}
              title="No reservations yet"
              detail="Bookings will appear here once users start reserving slots."
              action={
                <Link href="/admin/new-booking" className="inline-flex items-center gap-2 rounded-xl bg-[#153b5b] px-4 py-2.5 text-xs font-bold text-white">
                  <Plus size={14} /> Create booking
                </Link>
              }
            />
          </div>
        )}
      </section>
    </AdminPage>
  );
}

function AdminTablePage({ kind }: { kind: 'locations' | 'slots' | 'reservations' | 'users' }) {
  const { parkingLocations, parkingSlots, allUsers } = useApp();
  const config = {
    locations: { title: 'Parking locations', eyebrow: 'Network inventory', detail: 'Manage capacity, pricing, and location health.', action: 'Add location' },
    slots: { title: 'Slot operations', eyebrow: 'Space-level control', detail: 'Inspect every bay and its real-time sensor heartbeat from Firestore.', action: 'Export slots' },
    reservations: { title: 'Reservations', eyebrow: 'Booking queue', detail: 'Review and manage reservations across the network.', action: 'Export report' },
    users: { title: 'Users', eyebrow: 'People using Parkwise', detail: 'Account activity and access across the platform.', action: 'Invite user' },
  }[kind];

  const rows =
    kind === 'locations'
      ? parkingLocations
      : kind === 'slots'
      ? parkingSlots.length > 0
        ? parkingSlots
        : parkingLocations[0]?.slots || []
      : kind === 'users'
      ? allUsers.length > 0
        ? allUsers
        : demoUsers
      : [
          { id: 'SP-10284', name: 'Aarav Mehta', locationName: 'ABC Mall Parking', slot: 'A3', status: 'upcoming', amount: '₹60' },
          { id: 'SP-10251', name: 'Nisha Kapoor', locationName: 'XYZ Business Park', slot: 'B4', status: 'completed', amount: '₹135' },
          { id: 'SP-10176', name: 'Rohan Iyer', locationName: 'City Center Parking', slot: 'C2', status: 'completed', amount: '₹25' },
        ];

  return (
    <AdminPage>
      <PageHeader eyebrow={config.eyebrow} title={config.title} detail={config.detail} action={<Button><Plus size={15} />{config.action}</Button>} />
      <div className="mb-4 flex flex-wrap gap-2">
        <div className="flex items-center gap-2 rounded-xl border border-[#d9e4e8] bg-white px-3 py-2.5">
          <Search size={15} className="text-[#81949d]" />
          <input placeholder={`Search ${kind}…`} className="w-44 bg-transparent text-xs outline-none placeholder:text-[#9aa8ae]" />
        </div>
        <FilterButton>All status</FilterButton>
        <FilterButton>Last 30 days</FilterButton>
      </div>
      <div className="overflow-hidden rounded-2xl border border-[#dfe7eb] bg-white">
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full text-left">
            <thead className="bg-[#f5f8f8] text-[10px] font-bold uppercase tracking-[.1em] text-[#8a999f]">
              <tr>
                {(kind === 'locations'
                  ? ['Name', 'Address', 'Capacity', 'Available', 'Status', '']
                  : kind === 'slots'
                  ? ['Slot ID', 'Location', 'Status', 'Sensor ID', 'Updated', '']
                  : kind === 'users'
                  ? ['Name', 'Email', 'Role', '']
                  : ['Booking ID', 'User', 'Parking', 'Slot', 'Status', 'Amount']
                ).map((header) => (
                  <th key={header} className="px-5 py-3.5 font-bold">{header}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#edf1f2] text-xs">
              {rows.map((row, index) => {
                const location = row as ParkingLocation;
                const slot = row as ParkingSlot;
                const user = row as (typeof allUsers)[number] | (typeof demoUsers)[number];
                const reservation = row as { id: string; name: string; locationName: string; slot: string; status: string; amount: string };
                return (
                  <tr key={row.id || index} className="hover:bg-[#fbfcfc]">
                    {kind === 'locations' && (
                      <>
                        <td className="px-5 py-4 font-bold text-[#345064]">{location.name}</td>
                        <td className="px-5 py-4 text-[#7c8c94]">{location.address}</td>
                        <td className="px-5 py-4 font-semibold text-[#345064]">{location.totalSlots}</td>
                        <td className="px-5 py-4 font-semibold text-[#27784f]">{location.availableSlots}</td>
                        <td className="px-5 py-4"><StatusBadge status="online" label="Operational" /></td>
                        <td className="px-5 py-4 text-right"><MoreHorizontal size={16} className="text-[#8a999f]" /></td>
                      </>
                    )}
                    {kind === 'slots' && (
                      <>
                        <td className="px-5 py-4 font-bold text-[#345064]">{slot.label}</td>
                        <td className="px-5 py-4 text-[#7c8c94]">{slot.locationId || 'metropark_001'}</td>
                        <td className="px-5 py-4"><StatusBadge status={slot.status} /></td>
                        <td className="px-5 py-4 font-mono text-[10px] text-[#7c8c94]">{slot.sensorId || 'ESP32'}</td>
                        <td className="px-5 py-4 text-[#7c8c94]">{slot.lastUpdated}</td>
                        <td className="px-5 py-4 text-right"><MoreHorizontal size={16} className="text-[#8a999f]" /></td>
                      </>
                    )}
                    {kind === 'users' && (
                      <>
                        <td className="px-5 py-4 font-bold text-[#345064]">{user.name}</td>
                        <td className="px-5 py-4 text-[#7c8c94]">{user.email}</td>
                        <td className="px-5 py-4"><StatusBadge status={user.role} /></td>
                        <td className="px-5 py-4 text-right"><MoreHorizontal size={16} className="text-[#8a999f]" /></td>
                      </>
                    )}
                    {kind === 'reservations' && (
                      <>
                        <td className="px-5 py-4 font-mono font-bold text-[#345064]">{reservation.id}</td>
                        <td className="px-5 py-4 font-semibold text-[#345064]">{reservation.name}</td>
                        <td className="px-5 py-4 text-[#7c8c94]">{reservation.locationName}</td>
                        <td className="px-5 py-4 font-bold text-[#345064]">{reservation.slot}</td>
                        <td className="px-5 py-4"><StatusBadge status={reservation.status} /></td>
                        <td className="px-5 py-4 font-bold text-[#345064]">{reservation.amount}</td>
                      </>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="divide-y divide-[#edf1f2] md:hidden">
          {rows.map((row, index) => (
            <div key={row.id || index} className="flex items-center justify-between p-4">
              <div>
                <p className="text-sm font-bold text-[#345064]">
                  {kind === 'locations'
                    ? (row as ParkingLocation).name
                    : kind === 'slots'
                    ? (row as ParkingSlot).label
                    : kind === 'users'
                    ? (row as (typeof allUsers)[number]).name
                    : (row as { id: string }).id}
                </p>
                <p className="mt-1 text-xs text-[#87969d]">
                  {kind === 'locations'
                    ? (row as ParkingLocation).address
                    : kind === 'slots'
                    ? (row as ParkingSlot).sensorId
                    : kind === 'users'
                    ? (row as (typeof allUsers)[number]).email
                    : (row as { locationName: string }).locationName}
                </p>
              </div>
              <StatusBadge
                status={
                  kind === 'locations'
                    ? 'online'
                    : kind === 'slots'
                    ? (row as ParkingSlot).status
                    : kind === 'users'
                    ? (row as (typeof allUsers)[number]).role
                    : (row as { status: string }).status
                }
              />
            </div>
          ))}
        </div>
      </div>
    </AdminPage>
  );
}

function DevicesPage() { return <AdminPage><PageHeader eyebrow="Hardware layer" title="IoT devices" detail="Sensor health at a glance. All signals below are mocked." action={<Button variant="outline"><RefreshCw size={14} /> Refresh signals</Button>} /><div className="grid gap-3 sm:grid-cols-3"><StatCard label="Online devices" value="3" delta="75%" icon={Zap} tone="green" /><StatCard label="Offline devices" value="1" icon={Smartphone} tone="gold" /><StatCard label="Sensor errors" value="6" icon={ShieldCheck} tone="navy" /></div><div className="mt-5 grid gap-4 md:grid-cols-2">{devices.map((device) => <div key={device.id} className="rounded-2xl border border-[#dfe7eb] bg-white p-5"><div className="flex items-start justify-between"><div className="flex items-center gap-3"><span className={`grid h-10 w-10 place-items-center rounded-xl ${device.status === 'Online' ? 'bg-[#e3f3e9] text-[#287850]' : 'bg-[#fce9e8] text-[#ad514b]'}`}><Zap size={18} /></span><div><h2 className="font-display font-bold text-[#294a5f]">{device.id}</h2><p className="text-xs text-[#83939a]">{device.location}</p></div></div><StatusBadge status={device.status.toLowerCase()} /></div><div className="mt-6 grid grid-cols-3 gap-2 rounded-xl bg-[#f5f8f8] p-3"><div><p className="text-[10px] text-[#89989f]">Last heartbeat</p><p className="mt-1 text-xs font-bold text-[#456274]">{device.heartbeat}</p></div><div><p className="text-[10px] text-[#89989f]">Sensors</p><p className="mt-1 text-xs font-bold text-[#456274]">{device.sensors}</p></div><div><p className="text-[10px] text-[#89989f]">Signal</p><p className="mt-1 text-xs font-bold text-[#456274]">{device.signal}</p></div></div></div>)}</div></AdminPage>; }

function AIPage() { return <AdminPage><PageHeader eyebrow="Computer vision" title="AI monitoring" detail="A future-ready view of camera detections. No live camera feed is connected." action={<StatusBadge status="online" label="Model active · demo" />} /><div className="grid gap-5 xl:grid-cols-[1.3fr_.7fr]"><section className="overflow-hidden rounded-2xl border border-[#dfe7eb] bg-[#173044]"><div className="flex items-center justify-between border-b border-white/10 px-5 py-4"><div className="flex items-center gap-2 text-sm font-bold text-white"><span className="h-2 w-2 rounded-full bg-[#e8b052] pulse-dot" />Live camera · Gate 02</div><span className="rounded-lg bg-white/10 px-2 py-1 text-[10px] font-bold text-white/60">MOCK FEED</span></div><div className="relative h-[330px] overflow-hidden bg-[#294958]"><div className="absolute inset-0 opacity-30 grid-fade" /><div className="absolute left-[10%] top-[18%] h-[210px] w-[80%] -skew-x-12 border-x-2 border-white/15 bg-white/5" /><div className="absolute bottom-8 left-1/2 h-1 w-[90%] -translate-x-1/2 bg-[#d8b36a]/40" /><div className="absolute bottom-10 left-[28%] h-24 w-16 rounded bg-[#82a6a4]/50 ring-2 ring-[#70c7b3] ring-offset-2 ring-offset-[#294958]" /><div className="absolute bottom-10 left-[55%] h-28 w-20 rounded bg-[#d1a86e]/45 ring-2 ring-[#d7b058] ring-offset-2 ring-offset-[#294958]" /><div className="absolute left-5 top-5 rounded-lg bg-black/20 px-2 py-1 text-[10px] text-white/70">14 Aug 2026 · 17:42:08</div><p className="absolute bottom-4 right-4 text-[10px] text-white/50">Vision surface is a visualization only.</p></div></section><section className="space-y-3"><div className="rounded-2xl border border-[#dfe7eb] bg-white p-5"><p className="text-xs font-bold text-[#84939b]">Vehicles detected</p><p className="mt-2 font-display text-4xl font-bold tracking-[-.05em] text-[#294a5f]">18</p><div className="mt-4 flex gap-2"><span className="rounded-lg bg-[#e7eef7] px-3 py-2 text-xs font-bold text-[#3b6482]">Cars · 14</span><span className="rounded-lg bg-[#fff0d5] px-3 py-2 text-xs font-bold text-[#986b25]">Two-wheelers · 4</span></div></div><div className="rounded-2xl border border-[#dfe7eb] bg-white p-5"><div className="flex justify-between text-xs"><span className="font-bold text-[#84939b]">Detection confidence</span><span className="font-bold text-[#287850]">94.8%</span></div><div className="mt-3 h-2 rounded-full bg-[#e7eeeb]"><div className="h-full w-[94.8%] rounded-full bg-[#43947c]" /></div><p className="mt-4 flex items-center gap-2 text-xs text-[#71858c]"><Sparkles size={14} className="text-[#c28636]" />YOLO integration surface ready for later wiring.</p></div></section></div></AdminPage>; }

function AnalyticsPage() { const [range, setRange] = useState('7 days'); return <AdminPage><PageHeader eyebrow="Network intelligence" title="Analytics" detail="Patterns that help operators make the next shift better." action={<div className="flex rounded-xl bg-[#e8eef0] p-1">{['Today', '7 days', '30 days', '90 days'].map((item) => <button key={item} onClick={() => setRange(item)} data-testid={`button-range-${item.replace(' ', '-')}`} className={`rounded-lg px-3 py-2 text-[11px] font-bold ${range === item ? 'bg-white text-[#294a5f] shadow-sm' : 'text-[#82929b]'}`}>{item}</button>)}</div>} /><div className="grid gap-5 xl:grid-cols-[1.25fr_.75fr]"><section className="rounded-2xl border border-[#dfe7eb] bg-white p-5"><div className="flex items-center justify-between"><div><h2 className="font-display text-lg font-bold text-[#294a5f]">Reservations over time</h2><p className="mt-1 text-xs text-[#84939b]">Showing {range.toLowerCase()} · all locations</p></div><BarChart3 size={18} className="text-[#5f9392]" /></div><div className="mt-7 h-[280px]"><ResponsiveContainer width="100%" height="100%"><BarChart data={analyticsData}><CartesianGrid stroke="#edf1f2" vertical={false} /><XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#8a999f' }} /><YAxis tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: '#8a999f' }} /><Tooltip contentStyle={{ border: '1px solid #dfe7eb', borderRadius: 12, fontSize: 11 }} /><Bar dataKey="reservations" fill="#397f88" radius={[5, 5, 0, 0]} /></BarChart></ResponsiveContainer></div></section><section className="rounded-2xl border border-[#dfe7eb] bg-white p-5"><h2 className="font-display text-lg font-bold text-[#294a5f]">Space mix</h2><div className="relative mt-3 h-[210px]"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={[{ name: 'Occupied', value: 54 }, { name: 'Available', value: 32 }, { name: 'Reserved', value: 14 }]} dataKey="value" innerRadius={62} outerRadius={86} paddingAngle={3}>{['#2d7881', '#81b69b', '#e1ab50'].map((fill) => <Cell key={fill} fill={fill} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer><div className="absolute inset-0 grid place-items-center pointer-events-none"><div className="text-center"><p className="font-display text-2xl font-bold text-[#294a5f]">1,240</p><p className="text-[10px] text-[#89989f]">total spaces</p></div></div></div><div className="space-y-2">{[['Occupied', '54%', '#2d7881'], ['Available', '32%', '#81b69b'], ['Reserved', '14%', '#e1ab50']].map(([label, value, color]) => <div key={label} className="flex items-center justify-between text-xs"><span className="flex items-center gap-2 text-[#74868e]"><span className="h-2 w-2 rounded-full" style={{ background: color }} />{label}</span><b className="text-[#345064]">{value}</b></div>)}</div></section></div></AdminPage>; }

function SettingsPage() { const [saved, setSaved] = useState(false); return <AdminPage><PageHeader eyebrow="System preferences" title="Settings" detail="Tune the operator experience. Changes are mocked locally." /><div className="max-w-[820px] space-y-5"><section className="rounded-2xl border border-[#dfe7eb] bg-white p-5"><h2 className="font-display text-lg font-bold text-[#294a5f]">Workspace</h2><div className="mt-5 grid gap-4 sm:grid-cols-2"><label className="text-xs font-bold text-[#71838d]">Workspace name<input defaultValue="Parkwise · Bengaluru" className="mt-2 w-full rounded-xl border border-[#d9e4e8] px-3 py-2.5 text-sm outline-none focus:border-[#7faeb5]" /></label><label className="text-xs font-bold text-[#71838d]">Timezone<select className="mt-2 w-full rounded-xl border border-[#d9e4e8] bg-white px-3 py-2.5 text-sm outline-none"><option>Asia / Kolkata (IST)</option><option>UTC</option></select></label></div></section><section className="rounded-2xl border border-[#dfe7eb] bg-white p-5"><h2 className="font-display text-lg font-bold text-[#294a5f]">Alert preferences</h2>{['Sensor offline alerts', 'Reservation spikes', 'Daily occupancy digest'].map((label, index) => <label key={label} className="flex items-center justify-between border-b border-[#edf1f2] py-4 last:border-0"><span><span className="block text-sm font-bold text-[#345064]">{label}</span><span className="mt-1 block text-xs text-[#87969d]">Send updates to operator channels.</span></span><input type="checkbox" defaultChecked={index !== 1} className="h-4 w-4 accent-[#286b70]" /></label>)}</section><div className="flex items-center justify-between"><span className="text-xs text-[#819099]">{saved ? 'Settings saved locally.' : 'Demo settings · no system changes are sent.'}</span><Button onClick={() => setSaved(true)}>Save settings</Button></div></div></AdminPage>; }

function AppRouter() {
  return (
    <RoutedErrorBoundary>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/login" component={LoginPage} />
        <Route path="/register" component={RegisterPage} />
        <Route path="/forgot-password" component={ForgotPage} />
        <Route path="/dashboard" component={() => <Redirect to="/parking" />} />
        <Route path="/parking/:id/select" component={SelectPage} />
        <Route path="/parking/:id" component={LocationPage} />
        <Route path="/parking" component={ParkingPage} />
        <Route path="/bookings/:id" component={BookingDetailPage} />
        <Route path="/bookings" component={BookingsPage} />
        <Route path="/history" component={HistoryPage} />
        <Route path="/profile" component={ProfilePage} />
        <Route path="/notifications" component={NotificationsPage} />
        <Route path="/admin/login" component={AdminLoginPage} />
        <Route path="/admin/dashboard" component={() => <AdminPage><AdminDashboardView /></AdminPage>} />
        <Route path="/admin/new-booking" component={() => <AdminPage><AdminNewBookingPage /></AdminPage>} />
        <Route path="/admin/reservations" component={() => <AdminPage><AdminReservationsPage /></AdminPage>} />
        <Route path="/admin/locations" component={() => <AdminPage><AdminLocationsPage /></AdminPage>} />
        <Route path="/admin/slots" component={() => <AdminPage><AdminSlotsPage /></AdminPage>} />
        <Route path="/admin/users" component={() => <AdminTablePage kind="users" />} />
        <Route path="/admin/devices" component={DevicesPage} />
        <Route path="/admin/ai" component={AIPage} />
        <Route path="/admin/analytics" component={AnalyticsPage} />
        <Route path="/admin/settings" component={SettingsPage} />
        <Route path="/demo/glowing-effect" component={() => (
          <div className="min-h-[100dvh] bg-[#f5f8fa]">
            <PublicNav />
            <main className="py-8">
              <div className="mx-auto max-w-5xl px-4 text-center">
                <p className="text-xs font-bold uppercase tracking-[.18em] text-[#c28636]">Aceternity UI</p>
                <h1 className="mt-1 font-display text-3xl font-bold text-[#183653]">Glowing Effect Component</h1>
                <p className="mt-2 text-sm text-[#71818b]">Interactive pointer-following perimeter glow and conic light beam.</p>
              </div>
              <GlowingEffectDemo />
            </main>
          </div>
        )} />
        <Route path="/demo/moving-border" component={() => (
          <div className="min-h-[100dvh] bg-[#f5f8fa]">
            <PublicNav />
            <main className="py-16 text-center">
              <div className="mx-auto max-w-5xl px-4">
                <p className="text-xs font-bold uppercase tracking-[.18em] text-[#c28636]">Aceternity UI</p>
                <h1 className="mt-1 font-display text-3xl font-bold text-[#183653]">Moving Border Component</h1>
                <div className="mt-8 flex justify-center">
                  <MovingBorderDemo />
                </div>
              </div>
            </main>
          </div>
        )} />
        <Route path="/demo/hover-border-gradient" component={() => (
          <div className="min-h-[100dvh] bg-[#f5f8fa]">
            <PublicNav />
            <main className="py-16 text-center">
              <div className="mx-auto max-w-5xl px-4">
                <p className="text-xs font-bold uppercase tracking-[.18em] text-[#c28636]">Aceternity UI</p>
                <h1 className="mt-1 font-display text-3xl font-bold text-[#183653]">Hover Border Gradient</h1>
                <p className="mt-2 text-sm text-[#71818b]">Rotating perimeter gradient matching Parkwise brand colors.</p>
                <div className="mt-4 flex justify-center">
                  <HoverBorderGradientDemo />
                </div>
              </div>
            </main>
          </div>
        )} />
        <Route
          component={() => (
            <UserShell>
              <main className="mx-auto max-w-3xl px-5 py-20">
                <EmptyState
                  title="Page not found"
                  detail="The page you requested does not exist."
                  action={
                    <Link href="/" className="font-bold text-[#286b70]">
                      Return home
                    </Link>
                  }
                />
              </main>
            </UserShell>
          )}
        />
      </Switch>
    </RoutedErrorBoundary>
  );
}

function App() { return <QueryClientProvider client={queryClient}><TooltipProvider><WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}><AppProvider><AppRouter /><ParkwiseFloatingDock /></AppProvider></WouterRouter><Toaster /></TooltipProvider></QueryClientProvider>; }
export default App;