"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Moon, Sun } from "lucide-react";

interface AnimatedThemeTogglerProps {
  dark: boolean;
  onToggle: () => void;
  className?: string;
}

export function AnimatedThemeToggler({
  dark,
  onToggle,
  className = "",
}: AnimatedThemeTogglerProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);

  // View Transition API — expanding circle clip-path reveal
  const handleClick = () => {
    if (!buttonRef.current) {
      onToggle();
      return;
    }

    if (
      !("startViewTransition" in document) ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      onToggle();
      return;
    }

    const rect = buttonRef.current.getBoundingClientRect();
    // Start the circle from the bottom-center of the button
    const x = rect.left + rect.width / 2;
    const y = rect.bottom;

    // Maximum radius to cover the whole viewport from that origin
    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );

    const transition = (
      document as Document & {
        startViewTransition?: (cb: () => void) => { ready: Promise<void> };
      }
    ).startViewTransition?.(() => {
      onToggle();
    });

    transition?.ready.then(() => {
      document.documentElement.animate(
        {
          clipPath: [
            `circle(0px at ${x}px ${y}px)`,
            `circle(${endRadius}px at ${x}px ${y}px)`,
          ],
        },
        {
          duration: 500,
          easing: "cubic-bezier(0.22, 1, 0.36, 1)",
          fill: "forwards",
          pseudoElement: "::view-transition-new(root)",
        }
      );
    });
  };

  return (
    <button
      ref={buttonRef}
      aria-label="Toggle theme"
      onClick={handleClick}
      className={[
        "relative grid size-9 place-items-center overflow-hidden rounded-lg border-2 transition-colors duration-300",
        dark
          ? "border-slate-700 bg-slate-900 hover:border-emerald-300"
          : "border-slate-300 bg-white hover:border-violet-400",
        className,
      ].join(" ")}
    >
      {/* Ripple bg on click */}
      <AnimatePresence initial={false} mode="wait">
        <motion.span
          key={dark ? "dark-bg" : "light-bg"}
          initial={{ scale: 0, borderRadius: "50%", opacity: 0.6 }}
          animate={{ scale: 2.5, borderRadius: "0%", opacity: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="absolute inset-0"
          style={{
            background: dark ? "#34d399" : "#a78bfa",
            pointerEvents: "none",
          }}
        />
      </AnimatePresence>

      {/* Icon swap with rotate + scale */}
      <AnimatePresence initial={false} mode="wait">
        {dark ? (
          <motion.span
            key="sun"
            initial={{ rotate: -90, scale: 0.4, opacity: 0 }}
            animate={{ rotate: 0, scale: 1, opacity: 1 }}
            exit={{ rotate: 90, scale: 0.4, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="absolute"
          >
            <Sun size={17} className="text-amber-300" />
          </motion.span>
        ) : (
          <motion.span
            key="moon"
            initial={{ rotate: 90, scale: 0.4, opacity: 0 }}
            animate={{ rotate: 0, scale: 1, opacity: 1 }}
            exit={{ rotate: -90, scale: 0.4, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="absolute"
          >
            <Moon size={17} className="text-violet-500" />
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}
