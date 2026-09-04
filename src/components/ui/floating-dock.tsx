import React, { useRef, useState, useEffect, type ReactNode } from 'react';
import {
  AnimatePresence,
  MotionValue,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useReducedMotion,
} from 'motion/react';
import { ChevronUp, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface FloatingDockItem {
  title: string;
  icon: ReactNode;
  href: string;
  isActive?: boolean;
  onClick?: () => void;
  badge?: ReactNode;
}

export interface FloatingDockProps {
  items: FloatingDockItem[];
  className?: string;
  desktopClassName?: string;
  mobileClassName?: string;
  renderLink?: (item: FloatingDockItem, children: ReactNode, className: string) => ReactNode;
  size?: 'default' | 'compact';
  tooltipSide?: 'top' | 'bottom';
  dockId?: string;
  desktopOnly?: boolean;
}

export function FloatingDock({
  items,
  className,
  desktopClassName,
  mobileClassName,
  renderLink,
  size = 'default',
  tooltipSide = 'top',
  dockId = 'default',
  desktopOnly = false,
}: FloatingDockProps) {
  return (
    <nav aria-label="Quick navigation" className={cn('pointer-events-none', className)}>
      <FloatingDockDesktop
        items={items}
        className={desktopClassName}
        renderLink={renderLink}
        size={size}
        tooltipSide={tooltipSide}
        dockId={dockId}
      />
      {!desktopOnly && (
        <FloatingDockMobile items={items} className={mobileClassName} renderLink={renderLink} />
      )}
    </nav>
  );
}

export interface DockSectionProps {
  items: FloatingDockItem[];
  className?: string;
  renderLink?: (item: FloatingDockItem, children: ReactNode, className: string) => ReactNode;
  size?: 'default' | 'compact';
  tooltipSide?: 'top' | 'bottom';
  dockId?: string;
}

export function FloatingDockDesktop({
  items,
  className,
  renderLink,
  size = 'default',
  tooltipSide = 'top',
  dockId = 'default',
}: DockSectionProps) {
  const mouseX = useMotionValue(Infinity);
  const mouseY = useMotionValue(Infinity);
  const [containerHovered, setContainerHovered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const isCompact = size === 'compact';

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    mouseX.set(e.pageX);
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      containerRef.current.style.setProperty('--mouse-x', `${x}px`);
      containerRef.current.style.setProperty('--mouse-y', `${y}px`);
    }
  };

  const handleMouseLeave = () => {
    mouseX.set(Infinity);
    mouseY.set(Infinity);
    setContainerHovered(false);
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setContainerHovered(true)}
      onMouseLeave={handleMouseLeave}
      className={cn(
        'pointer-events-auto relative hidden items-center rounded-full p-[1.5px] md:flex',
        isCompact ? 'h-12 gap-1.5' : 'h-16 gap-2.5',
        'bg-gradient-to-r from-[#dfd6c5]/80 via-[#ebdcc6] to-[#dfd6c5]/80 shadow-[0_14px_38px_rgba(25,45,40,0.22)] border border-[#d8cdbc]/70',
        className
      )}
    >
      {/* Warm beige translucent body */}
      <div
        className={cn(
          'relative flex h-full w-full items-center rounded-full bg-[#f6f1e7]/95 border border-[#e8dfd0] backdrop-blur-xl transition-colors',
          isCompact ? 'gap-1.5 px-2.5' : 'gap-2 px-3.5'
        )}
      >
        {/* Soft pointer-following glow */}
        {containerHovered && (
          <motion.div
            className="pointer-events-none absolute inset-0 -z-0 rounded-full opacity-70"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              background: `radial-gradient(130px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(225, 175, 85, 0.2), transparent 70%)`,
            }}
          />
        )}

        {items.map((item) => (
          <IconContainer
            key={item.title}
            mouseX={mouseX}
            item={item}
            renderLink={renderLink}
            size={size}
            tooltipSide={tooltipSide}
            dockId={dockId}
          />
        ))}
      </div>
    </div>
  );
}

function IconContainer({
  mouseX,
  item,
  renderLink,
  size = 'default',
  tooltipSide = 'top',
  dockId = 'default',
}: {
  mouseX: MotionValue<number>;
  item: FloatingDockItem;
  renderLink?: (item: FloatingDockItem, children: ReactNode, className: string) => ReactNode;
  size?: 'default' | 'compact';
  tooltipSide?: 'top' | 'bottom';
  dockId?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);
  const prefersReduced = useReducedMotion();

  const isCompact = size === 'compact';
  const distanceRange = isCompact ? [-110, 0, 110] : [-140, 0, 140];

  const distance = useTransform(mouseX, (val) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return val - bounds.x - bounds.width / 2;
  });

  // Aceternity spring magnification math
  const minDim = isCompact ? 34 : 42;
  const maxDim = isCompact ? 48 : 60;
  const minIconDim = isCompact ? 17 : 20;
  const maxIconDim = isCompact ? 24 : 28;

  const widthTransform = useTransform(distance, distanceRange, prefersReduced ? [minDim, minDim, minDim] : [minDim, maxDim, minDim]);
  const heightTransform = useTransform(distance, distanceRange, prefersReduced ? [minDim, minDim, minDim] : [minDim, maxDim, minDim]);

  const widthTransformIcon = useTransform(distance, distanceRange, prefersReduced ? [minIconDim, minIconDim, minIconDim] : [minIconDim, maxIconDim, minIconDim]);
  const heightTransformIcon = useTransform(distance, distanceRange, prefersReduced ? [minIconDim, minIconDim, minIconDim] : [minIconDim, maxIconDim, minIconDim]);

  const width = useSpring(widthTransform, { mass: 0.1, stiffness: 160, damping: 14 });
  const height = useSpring(heightTransform, { mass: 0.1, stiffness: 160, damping: 14 });

  const widthIcon = useSpring(widthTransformIcon, { mass: 0.1, stiffness: 160, damping: 14 });
  const heightIcon = useSpring(heightTransformIcon, { mass: 0.1, stiffness: 160, damping: 14 });

  const isTooltipBottom = tooltipSide === 'bottom';

  const content = (
    <motion.div
      ref={ref}
      style={{ width, height }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
      tabIndex={0}
      role="button"
      aria-label={item.title}
      className={cn(
        'relative flex aspect-square cursor-pointer items-center justify-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#286b70]',
        item.isActive
          ? 'bg-gradient-to-tr from-[#205256] to-[#2d6f73] text-[#fffcf5] ring-2 ring-[#dfa236]/70 shadow-[0_3px_12px_rgba(32,82,86,0.32)]'
          : 'bg-[#ebe3d4]/70 text-[#3a5866] hover:bg-[#e0d3bf] hover:text-[#18393e] hover:shadow-xs'
      )}
    >
      {/* Tooltip */}
      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0, y: isTooltipBottom ? -6 : 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: isTooltipBottom ? -4 : 4, scale: 0.95 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className={cn(
              'pointer-events-none absolute z-50 whitespace-nowrap rounded-lg border border-white/20 bg-[#163545]/95 px-2.5 py-1 text-[11px] font-bold text-white shadow-xl backdrop-blur-md',
              isTooltipBottom ? '-bottom-10 left-1/2 -translate-x-1/2' : '-top-10 left-1/2 -translate-x-1/2'
            )}
          >
            {item.title}
            <div
              className={cn(
                'absolute left-1/2 -translate-x-1/2 border-4 border-transparent',
                isTooltipBottom ? '-top-1 border-b-[#163545]' : '-bottom-1 border-t-[#163545]'
              )}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active dot indicator */}
      {item.isActive && (
        <motion.span
          layoutId={`active-dock-indicator-${dockId}`}
          className="absolute -bottom-1.5 h-1.5 w-1.5 rounded-full bg-[#dfa236] shadow-[0_0_8px_#dfa236]"
          transition={{ type: 'spring', stiffness: 350, damping: 25 }}
        />
      )}

      {/* Optional item badge */}
      {item.badge && (
        <span className="absolute -right-0.5 -top-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#e85a50] text-[9px] font-extrabold text-white">
          {item.badge}
        </span>
      )}

      {/* Magnified icon */}
      <motion.div
        style={{ width: widthIcon, height: heightIcon }}
        className="flex items-center justify-center"
      >
        {item.icon}
      </motion.div>
    </motion.div>
  );

  if (renderLink) {
    return renderLink(item, content, 'focus-visible:outline-none');
  }

  return (
    <a
      href={item.href}
      onClick={item.onClick}
      className="focus-visible:outline-none"
      aria-label={item.title}
      aria-current={item.isActive ? 'page' : undefined}
    >
      {content}
    </a>
  );
}

export function FloatingDockMobile({ items, className, renderLink }: DockSectionProps) {
  const [open, setOpen] = useState(false);
  const dockRef = useRef<HTMLDivElement>(null);

  // Close mobile dock on outside click
  useEffect(() => {
    const handleDown = (event: MouseEvent | TouchEvent) => {
      if (dockRef.current && !dockRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener('mousedown', handleDown);
      document.addEventListener('touchstart', handleDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleDown);
      document.removeEventListener('touchstart', handleDown);
    };
  }, [open]);

  // Find currently active item for collapsed preview
  const activeItem = items.find((it) => it.isActive) || items[0];

  return (
    <div
      ref={dockRef}
      className={cn('pointer-events-auto relative block md:hidden', className)}
    >
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 12 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="absolute bottom-full mb-3 right-0 flex flex-col gap-2 rounded-2xl border border-[#ded5c5] bg-[#f7f2e8]/95 p-2 shadow-2xl backdrop-blur-xl"
          >
            {items.map((item, idx) => {
              const buttonContent = (
                <div
                  className={cn(
                    'flex items-center gap-3 rounded-xl px-3 py-2 text-xs font-bold transition-colors min-h-[44px]',
                    item.isActive
                      ? 'bg-[#205256] text-[#fffcf5] shadow-xs'
                      : 'text-[#3a5866] hover:bg-[#ece4d6] hover:text-[#18393e]'
                  )}
                >
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center">
                    {item.icon}
                  </div>
                  <span className="whitespace-nowrap">{item.title}</span>
                  {item.isActive && (
                    <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[#dfa236] shadow-[0_0_6px_#dfa236]" />
                  )}
                </div>
              );

              return (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  onClick={() => setOpen(false)}
                >
                  {renderLink ? (
                    renderLink(item, buttonContent, 'block')
                  ) : (
                    <a
                      href={item.href}
                      onClick={item.onClick}
                      aria-label={item.title}
                      aria-current={item.isActive ? 'page' : undefined}
                      className="block"
                    >
                      {buttonContent}
                    </a>
                  )}
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main trigger capsule button on mobile */}
      <div className="flex items-center gap-1 rounded-full border border-[#ded5c5] bg-[#f7f2e8]/95 p-1.5 shadow-[0_10px_28px_rgba(25,45,40,0.22)] backdrop-blur-xl">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          aria-label={open ? 'Close quick navigation' : 'Open quick navigation'}
          className="flex h-11 items-center gap-2 rounded-full px-3 text-[#29485c] transition-transform active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#286b70]"
        >
          <div className="flex h-6 w-6 items-center justify-center text-[#205256]">
            {activeItem ? activeItem.icon : <ChevronUp size={18} />}
          </div>
          <span className="text-xs font-bold tracking-tight text-[#29485c]">
            {open ? 'Close' : activeItem?.title || 'Menu'}
          </span>
          <div className="grid h-6 w-6 place-items-center rounded-full bg-[#ebe2d3] text-[#3a5866]">
            {open ? <X size={14} /> : <ChevronUp size={14} className="rotate-0 transition-transform" />}
          </div>
        </button>
      </div>
    </div>
  );
}
