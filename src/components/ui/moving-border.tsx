"use client";
import React, { useRef, useState, useEffect } from "react";
import {
  motion,
  AnimatePresence,
  useAnimationFrame,
  useMotionTemplate,
  useMotionValue,
  useTransform,
} from "motion/react";
import { cn } from "@/lib/utils";

function parseRadius(radiusStr?: string | number): number {
  if (typeof radiusStr === "number") return radiusStr;
  if (!radiusStr) return 14;
  if (typeof radiusStr === "string") {
    if (radiusStr.endsWith("rem")) return parseFloat(radiusStr) * 16;
    if (radiusStr.endsWith("px")) return parseFloat(radiusStr);
    const parsed = parseFloat(radiusStr);
    return isNaN(parsed) ? 14 : parsed;
  }
  return 14;
}

function getPointOnRoundedRect(
  w: number,
  h: number,
  r: number,
  progress: number,
): { x: number; y: number } {
  if (w <= 0 || h <= 0) return { x: 0, y: 0 };
  const radius = Math.max(0, Math.min(r, w / 2, h / 2));
  const straightW = Math.max(0, w - 2 * radius);
  const straightH = Math.max(0, h - 2 * radius);
  const arcLen = (Math.PI / 2) * radius;
  const total = 2 * straightW + 2 * straightH + 4 * arcLen;
  if (total <= 0) return { x: 0, y: 0 };

  let dist = (((progress % 1) + 1) % 1) * total;

  // 1. Top straight: from (radius, 0) to (w - radius, 0)
  if (dist <= straightW) {
    return { x: radius + dist, y: 0 };
  }
  dist -= straightW;

  // 2. Top-right corner: center at (w - radius, radius), angle from -PI/2 to 0
  if (dist <= arcLen) {
    const angle = -Math.PI / 2 + (dist / arcLen) * (Math.PI / 2);
    return {
      x: w - radius + radius * Math.cos(angle),
      y: radius + radius * Math.sin(angle),
    };
  }
  dist -= arcLen;

  // 3. Right straight: from (w, radius) to (w, h - radius)
  if (dist <= straightH) {
    return { x: w, y: radius + dist };
  }
  dist -= straightH;

  // 4. Bottom-right corner: center at (w - radius, h - radius), angle from 0 to PI/2
  if (dist <= arcLen) {
    const angle = 0 + (dist / arcLen) * (Math.PI / 2);
    return {
      x: w - radius + radius * Math.cos(angle),
      y: h - radius + radius * Math.sin(angle),
    };
  }
  dist -= arcLen;

  // 5. Bottom straight: from (w - radius, h) to (radius, h)
  if (dist <= straightW) {
    return { x: w - radius - dist, y: h };
  }
  dist -= straightW;

  // 6. Bottom-left corner: center at (radius, h - radius), angle from PI/2 to PI
  if (dist <= arcLen) {
    const angle = Math.PI / 2 + (dist / arcLen) * (Math.PI / 2);
    return {
      x: radius + radius * Math.cos(angle),
      y: h - radius + radius * Math.sin(angle),
    };
  }
  dist -= arcLen;

  // 7. Left straight: from (0, h - radius) to (0, radius)
  if (dist <= straightH) {
    return { x: 0, y: h - radius - dist };
  }
  dist -= straightH;

  // 8. Top-left corner: center at (radius, radius), angle from PI to 3*PI/2
  const angle = Math.PI + (dist / arcLen) * (Math.PI / 2);
  return {
    x: radius + radius * Math.cos(angle),
    y: radius + radius * Math.sin(angle),
  };
}

export function Button({
  borderRadius = "1.75rem",
  children,
  as: Component = "button",
  containerClassName,
  borderClassName,
  duration = 2400,
  rx,
  ry,
  className,
  wrapperClassName,
  floatingDockEffect = true,
  tooltip,
  ...otherProps
}: {
  borderRadius?: string;
  children: React.ReactNode;
  as?: any;
  containerClassName?: string;
  borderClassName?: string;
  duration?: number;
  rx?: string | number;
  ry?: string | number;
  className?: string;
  wrapperClassName?: string;
  floatingDockEffect?: boolean;
  tooltip?: React.ReactNode;
  [key: string]: any;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const MotionComponent = Component === "button" ? motion.button : motion.create(Component);

  return (
    <div className={cn("relative inline-flex items-center justify-center", wrapperClassName)}>
      {/* Floating dock style tooltip pop-up */}
      <AnimatePresence>
        {floatingDockEffect && isHovered && tooltip && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 420, damping: 20 }}
            className="pointer-events-none absolute -top-12 left-1/2 -translate-x-1/2 z-50 whitespace-nowrap rounded-xl border border-[#f4c26f]/30 bg-[#0d263c]/95 px-3 py-1.5 text-xs font-bold text-white shadow-[0_12px_28px_rgba(0,0,0,0.4)] backdrop-blur-md flex items-center gap-1.5 select-none"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-[#f4c26f] shadow-[0_0_8px_#f4c26f] animate-pulse" />
            <span>{tooltip}</span>
            <div className="absolute left-1/2 -bottom-1 -translate-x-1/2 border-4 border-transparent border-t-[#0d263c]" />
          </motion.div>
        )}
      </AnimatePresence>

      <MotionComponent
        whileHover={
          floatingDockEffect
            ? {
                y: -6,
                scale: 1.06,
                transition: { type: "spring", stiffness: 400, damping: 16 },
              }
            : undefined
        }
        whileTap={
          floatingDockEffect
            ? {
                y: -2,
                scale: 0.97,
                transition: { type: "spring", stiffness: 450, damping: 18 },
              }
            : undefined
        }
        onMouseEnter={(e: any) => {
          setIsHovered(true);
          otherProps.onMouseEnter?.(e);
        }}
        onMouseLeave={(e: any) => {
          setIsHovered(false);
          otherProps.onMouseLeave?.(e);
        }}
        onFocus={(e: any) => {
          setIsHovered(true);
          otherProps.onFocus?.(e);
        }}
        onBlur={(e: any) => {
          setIsHovered(false);
          otherProps.onBlur?.(e);
        }}
        className={cn(
          "relative h-14 w-auto overflow-visible bg-transparent p-[2px] text-base font-semibold group cursor-pointer inline-flex transition-shadow duration-300",
          floatingDockEffect && isHovered
            ? "shadow-[0_18px_36px_-6px_rgba(21,59,91,0.55),0_0_28px_rgba(244,194,111,0.55),0_0_12px_rgba(255,213,79,0.7)]"
            : "",
          containerClassName,
        )}
        style={{
          borderRadius: borderRadius,
        }}
        {...otherProps}
      >
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ borderRadius: borderRadius }}
        >
          <MovingBorder duration={duration} rx={rx ?? borderRadius} ry={ry ?? borderRadius}>
            <div
              className={cn(
                "h-28 w-28 rounded-full bg-[radial-gradient(circle_at_center,#fffde7_0%,#ffd54f_25%,#f4c26f_50%,#e5ad4c_70%,transparent_90%)] opacity-100",
                borderClassName,
              )}
            />
          </MovingBorder>
        </div>

        <div
          className={cn(
            "relative z-10 flex h-full w-full items-center justify-center border border-white/10 bg-[#153b5b] px-6 py-2.5 text-sm text-white antialiased transition-colors group-hover:bg-[#1a466c]",
            className,
          )}
          style={{
            borderRadius: `calc(${borderRadius} - 2px)`,
          }}
        >
          {children}
        </div>
      </MotionComponent>
    </div>
  );
}

export const MovingBorder = ({
  children,
  duration = 2400,
  rx,
  ry,
  ...otherProps
}: {
  children: React.ReactNode;
  duration?: number;
  rx?: string | number;
  ry?: string | number;
  [key: string]: any;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 160, height: 48 });
  const progress = useMotionValue<number>(0);
  const radius = rx ? parseRadius(rx) : 14;

  useEffect(() => {
    if (!containerRef.current) return;
    const updateSize = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        if (width > 0 && height > 0) {
          setDimensions({ width, height });
        }
      }
    };
    updateSize();
    const ro = new ResizeObserver(updateSize);
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  useAnimationFrame((time) => {
    progress.set((time / duration) % 1);
  });

  const x = useTransform(progress, (p) => {
    return getPointOnRoundedRect(dimensions.width, dimensions.height, radius, p).x;
  });

  const y = useTransform(progress, (p) => {
    return getPointOnRoundedRect(dimensions.width, dimensions.height, radius, p).y;
  });

  const transform = useMotionTemplate`translateX(${x}px) translateY(${y}px) translateX(-50%) translateY(-50%)`;

  return (
    <div ref={containerRef} className="absolute inset-0 h-full w-full pointer-events-none">
      <motion.div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          display: "inline-block",
          transform,
          zIndex: 0,
        }}
      >
        {children}
      </motion.div>
    </div>
  );
};
