"use client";
import React, { useState } from "react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useMotionValueEvent,
} from "motion/react";
import { cn } from "@/lib/utils";

export interface FloatingNavItem {
  name: string;
  link: string;
  icon?: React.ReactNode;
  dataTestId?: string;
}

export const FloatingNav = ({
  navItems,
  className,
  activeLink,
  onNavigate,
  actionButton,
  brandLogo,
  isFixed = false,
  alwaysVisible = false,
}: {
  navItems: FloatingNavItem[];
  className?: string;
  activeLink?: string;
  onNavigate?: (link: string) => void;
  actionButton?: React.ReactNode;
  brandLogo?: React.ReactNode;
  isFixed?: boolean;
  alwaysVisible?: boolean;
}) => {
  const { scrollY } = useScroll();
  const [visible, setVisible] = useState(true);

  useMotionValueEvent(scrollY, "change", (current) => {
    if (!isFixed || alwaysVisible) {
      setVisible(true);
      return;
    }
    if (typeof current === "number") {
      const prev = scrollY.getPrevious() ?? 0;
      const direction = current - prev;

      if (current < 50) {
        setVisible(true);
      } else {
        if (direction < -2) {
          setVisible(true);
        } else if (direction > 4) {
          setVisible(false);
        }
      }
    }
  });

  const content = (
    <div className="flex items-center justify-center gap-1 rounded-full border border-white/15 bg-[#153b5b] p-1.5 shadow-[0_8px_24px_rgba(21,59,91,0.28),0_0_14px_rgba(244,194,111,0.12)] backdrop-blur-xl transition-all duration-300">
      {brandLogo && (
        <>
          <div className="flex items-center pl-1.5 pr-1">{brandLogo}</div>
          <div className="h-4 w-px bg-white/20 mr-1" />
        </>
      )}

      {/* Nav items container */}
      <div className="flex items-center gap-1">
        {navItems.map((navItem, idx: number) => {
          const isActive = activeLink
            ? activeLink === navItem.link
            : false;

          return (
            <a
              key={`nav-${idx}-${navItem.name}`}
              href={navItem.link}
              data-testid={navItem.dataTestId ?? `link-nav-${navItem.name.replace(/\s+/g, "-")}`}
              onClick={(e) => {
                if (onNavigate) {
                  e.preventDefault();
                  onNavigate(navItem.link);
                }
              }}
              className={cn(
                "relative flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs sm:text-sm font-semibold transition-all duration-200 select-none",
                isActive
                  ? "bg-white/15 text-[#f4c26f] shadow-inner font-bold"
                  : "text-[#c4d4dc] hover:bg-white/10 hover:text-white"
              )}
            >
              {navItem.icon && (
                <span className={cn("flex items-center justify-center", isActive ? "text-[#f4c26f]" : "opacity-80")}>
                  {navItem.icon}
                </span>
              )}
              <span className="whitespace-nowrap">{navItem.name}</span>
              {isActive && (
                <motion.span
                  layoutId="activeFloatingIndicator"
                  className="absolute inset-0 -z-10 rounded-full border border-[#f4c26f]/40 bg-white/10 shadow-[0_0_12px_rgba(244,194,111,0.25)]"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.45 }}
                />
              )}
            </a>
          );
        })}
      </div>

      {/* Optional action button if supplied */}
      {actionButton && (
        <>
          <div className="h-4 w-px bg-white/20 mx-1" />
          {actionButton}
        </>
      )}
    </div>
  );

  if (!isFixed) {
    return (
      <div className={cn("relative flex items-center justify-center", className)}>
        {content}
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{
          opacity: 0,
          y: -80,
        }}
        animate={{
          y: visible ? 0 : -100,
          opacity: visible ? 1 : 0,
        }}
        exit={{
          y: -100,
          opacity: 0,
        }}
        transition={{
          duration: 0.25,
          ease: "easeOut",
        }}
        className={cn(
          "fixed top-4 md:top-6 inset-x-0 mx-auto z-[5000] flex max-w-fit items-center justify-center px-3 pointer-events-auto",
          className
        )}
      >
        {content}
      </motion.div>
    </AnimatePresence>
  );
};

