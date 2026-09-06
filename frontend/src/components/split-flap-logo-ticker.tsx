"use client";

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import {
  animate,
  motion,
  useMotionValue,
  useTransform,
} from "motion/react";
import { flushSync } from "react-dom";

interface Service {
  name: string;
  bg: string;
  fg: string;
}

const SERVICES: Service[] = [
  { name: "NETFLIX", bg: "#E50914", fg: "#0a0a0a" },
  { name: "SPOTIFY", bg: "#1ED760", fg: "#0a0a0a" },
  { name: "YOUTUBE PREMIUM", bg: "#FF0033", fg: "#fff" },
  { name: "CHATGPT PLUS", bg: "#10A37F", fg: "#fff" },
  { name: "CURSOR", bg: "#6C5CE7", fg: "#fff" },
];

const CYCLE_MS = 2200;
const FLIP_MS = 600;

const CARD_W = 280;
const CARD_H = 180;
const HALF_H = CARD_H / 2;

const EASE: [number, number, number, number] = [
  0.45,
  0,
  0.2,
  1,
];

const PERSPECTIVE_ORIGIN = "35% 50%";

const FACE_EDGE_SHADOW =
  "inset 2px 0 5px -2px rgba(255,255,255,0.22), inset -3px 0 8px -4px rgba(0,0,0,0.5)";

/* =========================================================
   FULL 180px CANVAS
========================================================= */

function LogoCanvas({
  service,
  top,
}: {
  service: Service;
  top: number;
}) {
  return (
    <div
      className="absolute left-0 right-0"
      style={{
        width: "100%",
        height: CARD_H,
        top,
        color: service.fg,
      }}
    >
      <span
        className="
          absolute
          left-0
          right-0
          top-1/2
          -translate-y-1/2
          text-center
          text-lg
          font-extrabold
          tracking-wide
        "
        style={{
          lineHeight: 1,
          whiteSpace: "nowrap",
        }}
      >
        {service.name}
      </span>
    </div>
  );
}

/* =========================================================
   STATIC HALF
========================================================= */

function StaticWindow({
  service,
  half,
}: {
  service: Service;
  half: "top" | "bottom";
}) {
  const isTop = half === "top";
  const isBottom = half === "bottom";

  const style: CSSProperties = {
    position: "absolute",
    left: 0,
    right: 0,
    height: HALF_H,
    overflow: "hidden",

    background: service.bg,
    boxShadow: FACE_EDGE_SHADOW,

    /*
      OUTER CORNERS ONLY

      TOP HALF:
      top corners rounded
      hinge edge square

      BOTTOM HALF:
      bottom corners rounded
      hinge edge square
    */
    borderTopLeftRadius: isTop ? 12 : 0,
    borderTopRightRadius: isTop ? 12 : 0,

    borderBottomLeftRadius: isBottom ? 12 : 0,
    borderBottomRightRadius: isBottom ? 12 : 0,
  };

  if (isTop) {
    style.top = 0;
  } else {
    style.bottom = 0;
  }

  return (
    <div style={style}>
      <LogoCanvas
        service={service}
        top={isTop ? 0 : -HALF_H}
      />
    </div>
  );
}

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function SplitFlapLogoTicker() {
  const rotateX = useMotionValue(0);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const current = SERVICES[currentIndex];

  const next =
    SERVICES[(currentIndex + 1) % SERVICES.length];

  const currentIndexRef = useRef(0);

  /* =======================================================
     DYNAMIC SHADOW DURING FLIP
  ======================================================= */

  const boxShadow = useTransform(
    rotateX,
    (latest) => {
      const progress = Math.min(
        1,
        Math.abs(latest) / 180,
      );

      const lift = Math.sin(progress * Math.PI);

      const blurPx = 10 + lift * 24;
      const spreadPx = 1 + lift * 5;
      const alpha = 0.25 + lift * 0.35;
      const yPx = 4 + lift * 10;

      return `0 ${yPx}px ${blurPx}px ${spreadPx}px rgba(0,0,0,${alpha.toFixed(
        2,
      )})`;
    },
  );

  /* =======================================================
     AUTO FLIP
  ======================================================= */

  useEffect(() => {
    const reducedMotion = window
      .matchMedia("(prefers-reduced-motion: reduce)")
      .matches;

    if (reducedMotion || paused) {
      return;
    }

    let cancelled = false;

    let timeoutId: ReturnType<typeof setTimeout>;

    const runCycle = () => {
      timeoutId = setTimeout(
        async () => {
          if (cancelled) return;

          /*
            FLAP MOVES DOWN
          */
          await animate(
            rotateX,
            -180,
            {
              duration: FLIP_MS / 1000,
              ease: EASE,
            },
          );

          if (cancelled) return;

          /*
            After -180deg:

            STATIC TOP
              = NEXT TOP

            FLAP BACK
              = NEXT BOTTOM

            Together:
              COMPLETE NEXT LOGO
          */

          const newIndex =
            (currentIndexRef.current + 1) %
            SERVICES.length;

          currentIndexRef.current =
            newIndex;

          /*
            Commit new state BEFORE resetting
            physical flap to 0deg.

            This prevents:
            old logo + new logo
            flashing for one frame.
          */

          flushSync(() => {
            setCurrentIndex(newIndex);
          });

          /*
            Now:
              current = old next
              next    = following logo

            Reset flap immediately.
          */

          rotateX.jump(0);

          if (!cancelled) {
            runCycle();
          }
        },
        CYCLE_MS - FLIP_MS,
      );
    };

    rotateX.jump(0);

    runCycle();

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [paused, rotateX]);

  return (
    <div
      className="
        flex
        w-full
        items-center
        justify-center
        py-14
      "
      style={{
        background: "transparent",
      }}
    >
      {/* ===================================================
          OUTER FRAME
      =================================================== */}

      <div
        className="rounded-2xl p-3"
        style={{
          background: "#18181b",
          border:
            "1px solid rgba(255,255,255,0.08)",

          perspective: 1600,
          perspectiveOrigin:
            PERSPECTIVE_ORIGIN,
        }}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {/* =================================================
            MAIN CARD
        ================================================= */}

        <motion.div
          className="
            relative
            rounded-xl
          "
          style={{
            width: CARD_W,
            height: CARD_H,

            perspective: 1400,
            perspectiveOrigin:
              PERSPECTIVE_ORIGIN,

            /*
              Small permanent 3D angle
            */
            transform:
              "rotateY(-3deg)",

            transformStyle:
              "preserve-3d",

            boxShadow,
          }}
        >
          {/* =================================================
              1. STATIC TOP

              NEXT
              Canvas top = 0

              Shows NEXT TOP HALF
          ================================================= */}

          <StaticWindow
            service={next}
            half="top"
          />

          {/* =================================================
              2. STATIC BOTTOM

              CURRENT
              Canvas top = -HALF_H

              Shows CURRENT BOTTOM HALF
          ================================================= */}

          <StaticWindow
            service={current}
            half="bottom"
          />

          {/* =================================================
              HINGE
          ================================================= */}

          <div
            className="
              pointer-events-none
              absolute
              inset-x-0
              z-40
            "
            style={{
              top: HALF_H - 1,
              height: 2,

              background:
                "rgba(0,0,0,0.5)",

              borderRadius: 0,

              transform:
                "translateZ(3px)",
            }}
          />

          {/* =================================================
              PHYSICAL FLAP
          ================================================= */}

          <motion.div
            className="
              absolute
              inset-x-0
              top-0
              z-30
            "
            style={{
              height: HALF_H,

              transformStyle:
                "preserve-3d",

              transformOrigin:
                "center bottom",

              rotateX,
            }}
          >
            {/* =================================================
                3. FRONT FACE

                CURRENT TOP

                top = 0

                Top corners:
                  rounded

                Bottom / hinge:
                  square
            ================================================= */}

            <div
              className="
                absolute
                inset-0
                overflow-hidden
              "
              style={{
                background:
                  current.bg,

                boxShadow:
                  FACE_EDGE_SHADOW,

                borderTopLeftRadius: 12,
                borderTopRightRadius: 12,

                /*
                  IMPORTANT:
                  HINGE EDGE MUST BE SQUARE
                */
                borderBottomLeftRadius: 0,
                borderBottomRightRadius: 0,

                backfaceVisibility:
                  "hidden",

                WebkitBackfaceVisibility:
                  "hidden",
              }}
            >
              <LogoCanvas
                service={current}
                top={0}
              />
            </div>

            {/* =================================================
                4. BACK FACE

                NEXT BOTTOM

                top = -HALF_H

                Local top:
                  rounded

                Local bottom:
                  square

                After rotateX(180deg):

                  Local TOP
                  becomes
                  PHYSICAL BOTTOM

                  Local BOTTOM
                  becomes
                  HINGE
            ================================================= */}

            <div
              className="
                absolute
                inset-0
                overflow-hidden
              "
              style={{
                background:
                  next.bg,

                boxShadow:
                  FACE_EDGE_SHADOW,

                transform:
                  "rotateX(180deg)",

                transformStyle:
                  "preserve-3d",

                /*
                  Keep the hinge edge square.
                */
                borderTopLeftRadius: 12,
                borderTopRightRadius: 12,

                borderBottomLeftRadius: 0,
                borderBottomRightRadius: 0,

                backfaceVisibility:
                  "hidden",

                WebkitBackfaceVisibility:
                  "hidden",
              }}
            >
              <LogoCanvas
                service={next}
                top={-HALF_H}
              />
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
