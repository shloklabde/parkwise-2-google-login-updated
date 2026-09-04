"use client";
import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

type Direction = "TOP" | "LEFT" | "BOTTOM" | "RIGHT";

export function HoverBorderGradient({
  children,
  containerClassName,
  className,
  as: Tag = "button",
  duration = 1,
  clockwise = true,
  innerClassName,
  ...props
}: React.PropsWithChildren<
  {
    as?: React.ElementType;
    containerClassName?: string;
    className?: string;
    duration?: number;
    clockwise?: boolean;
    innerClassName?: string;
  } & React.HTMLAttributes<HTMLElement>
>) {
  const [hovered, setHovered] = useState<boolean>(false);
  const [direction, setDirection] = useState<Direction>("TOP");

  const rotateDirection = (currentDirection: Direction): Direction => {
    const directions: Direction[] = ["TOP", "LEFT", "BOTTOM", "RIGHT"];
    const currentIndex = directions.indexOf(currentDirection);
    const nextIndex = clockwise
      ? (currentIndex - 1 + directions.length) % directions.length
      : (currentIndex + 1) % directions.length;
    return directions[nextIndex];
  };

  // Parkwise brand gradient matching: #82c4be (teal/mint), #f4c26f (warm gold/amber), #153b5b (deep navy)
  const movingMap: Record<Direction, string> = {
    TOP: "radial-gradient(30% 70% at 50% 0%, rgba(130, 196, 190, 1) 0%, rgba(130, 196, 190, 0) 100%)",
    LEFT: "radial-gradient(20% 60% at 0% 50%, rgba(244, 194, 111, 1) 0%, rgba(244, 194, 111, 0) 100%)",
    BOTTOM:
      "radial-gradient(30% 70% at 50% 100%, rgba(130, 196, 190, 1) 0%, rgba(130, 196, 190, 0) 100%)",
    RIGHT:
      "radial-gradient(20% 60% at 100% 50%, rgba(244, 194, 111, 1) 0%, rgba(244, 194, 111, 0) 100%)",
  };

  const highlight =
    "radial-gradient(75% 180% at 50% 50%, rgba(130, 196, 190, 1) 0%, rgba(244, 194, 111, 0) 100%)";

  useEffect(() => {
    if (!hovered) {
      const interval = setInterval(() => {
        setDirection((prevState) => rotateDirection(prevState));
      }, duration * 1000);
      return () => clearInterval(interval);
    }
  }, [hovered, duration]);

  return (
    <Tag
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={cn(
        "relative flex rounded-full border border-white/20 content-center bg-[#153b5b]/30 hover:border-white/40 transition duration-500 items-center justify-center overflow-visible p-[2px] w-fit cursor-pointer",
        containerClassName
      )}
      {...props}
    >
      <motion.div
        className={cn(
          "flex-none inset-0 overflow-hidden absolute pointer-events-none rounded-[inherit] z-0"
        )}
        style={{
          filter: "blur(2px)",
          position: "absolute",
          width: "100%",
          height: "100%",
        }}
        initial={{ background: movingMap[direction] }}
        animate={{
          background: hovered
            ? [movingMap[direction], highlight]
            : movingMap[direction],
        }}
        transition={{ ease: "linear", duration: duration ?? 1 }}
      />
      <div
        className={cn(
          "bg-[#153b5b] absolute z-[1] flex-none inset-[2px] rounded-[inherit] pointer-events-none",
          innerClassName
        )}
      />
      <div
        className={cn(
          "relative z-10 w-auto text-white px-5 py-2.5 rounded-[inherit] transition-colors",
          className
        )}
      >
        {children}
      </div>
    </Tag>
  );
}
