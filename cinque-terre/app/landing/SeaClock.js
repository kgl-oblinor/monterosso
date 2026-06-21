"use client";

/* ============================================================
   SeaClock — a Rolex-inspired analog dial, top-left, always on.
   Shows Europe/Rome time with a smooth-sweep second hand (the
   Rolex signature) plus two small readouts: AIR + SEA temp,
   pulled live from Open-Meteo (free, no key, CORS-ok).
   Reduce Motion → no sweep, a quiet once-a-second tick instead.
   ============================================================ */

import { useEffect, useRef, useState } from "react";
import "./SeaClock.css";

const TZ = "Europe/Rome";
const AIR_URL =
  "https://api.open-meteo.com/v1/forecast?latitude=44.146&longitude=9.654&current=temperature_2m";
const SEA_URL =
  "https://marine-api.open-meteo.com/v1/marine?latitude=44.146&longitude=9.654&current=sea_surface_temperature";
const REFRESH_MS = 15 * 60 * 1000; // every ~15 min

// Current hour/minute/second.millis in Europe/Rome, regardless of the
// visitor's own timezone. We read the wall-clock parts in Rome and add
// the sub-second fraction from the local clock for a smooth sweep.
function romeNow() {
  const now = new Date();
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: TZ,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(now);
  const get = (t) => Number(parts.find((p) => p.type === t)?.value ?? 0);
  return {
    h: get("hour") % 12,
    m: get("minute"),
    s: get("second"),
    ms: now.getMilliseconds(),
  };
}

export default function SeaClock() {
  const [tick, setTick] = useState(() => romeNow());
  const [air, setAir] = useState(null);
  const [sea, setSea] = useState(null);
  const reduced = useRef(false);

  // --- time loop: smooth sweep (rAF) or a quiet 1s tick (reduce-motion)
  useEffect(() => {
    reduced.current =
      typeof matchMedia === "function" &&
      matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduced.current) {
      setTick(romeNow());
      const id = setInterval(() => setTick(romeNow()), 1000);
      return () => clearInterval(id);
    }
    let raf;
    const loop = () => {
      setTick(romeNow());
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  // --- live temperatures, refreshed every ~15 min
  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        const r = await fetch(AIR_URL);
        const j = await r.json();
        const t = j?.current?.temperature_2m;
        if (alive && typeof t === "number") setAir(Math.round(t));
      } catch {}
      try {
        const r = await fetch(SEA_URL);
        const j = await r.json();
        const t = j?.current?.sea_surface_temperature;
        if (alive && typeof t === "number") setSea(Math.round(t));
      } catch {}
    };
    load();
    const id = setInterval(load, REFRESH_MS);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, []);

  // hand angles (degrees). Seconds sweep continuously unless reduced.
  const secFrac = reduced.current ? tick.s : tick.s + tick.ms / 1000;
  const secAng = secFrac * 6; // 360/60
  const minAng = (tick.m + secFrac / 60) * 6;
  const hourAng = (tick.h + tick.m / 60) * 30; // 360/12

  const airTxt = air === null ? "—°" : `${air}°`;
  const seaTxt = sea === null ? "—°" : `${sea}°`;

  return (
    <div className="sea-clock" aria-hidden="true">
      <svg className="sc-dial" viewBox="0 0 200 200">
        <defs>
          <radialGradient id="sc-face" cx="42%" cy="38%" r="72%">
            <stop offset="0%" stopColor="#fdfaf0" />
            <stop offset="62%" stopColor="#f3ead2" />
            <stop offset="100%" stopColor="#e7dcc0" />
          </radialGradient>
          <linearGradient id="sc-bezel" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#f3e3a6" />
            <stop offset="38%" stopColor="#ead27e" />
            <stop offset="70%" stopColor="#c9a85a" />
            <stop offset="100%" stopColor="#a98a44" />
          </linearGradient>
          <linearGradient id="sc-hand" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f6e9b6" />
            <stop offset="100%" stopColor="#c9a85a" />
          </linearGradient>
        </defs>

        {/* bezel + face */}
        <circle cx="100" cy="100" r="98" fill="url(#sc-bezel)" />
        <circle cx="100" cy="100" r="91" fill="#0a1f33" opacity="0.18" />
        <circle cx="100" cy="100" r="89" fill="url(#sc-face)" />
        <circle
          cx="100"
          cy="100"
          r="89"
          fill="none"
          stroke="#0a1f33"
          strokeOpacity="0.12"
          strokeWidth="1"
        />

        {/* minute ticks (60) + gold hour indices (12) */}
        {Array.from({ length: 60 }).map((_, i) => {
          const major = i % 5 === 0;
          return (
            <line
              key={i}
              x1="100"
              y1={major ? 18 : 20}
              x2="100"
              y2={major ? 27 : 23.5}
              stroke={major ? "#b8973f" : "#0a1f33"}
              strokeOpacity={major ? 1 : 0.32}
              strokeWidth={major ? 2.4 : 1}
              strokeLinecap="round"
              transform={`rotate(${i * 6} 100 100)`}
            />
          );
        })}

        {/* applied gold hour markers (12) */}
        {Array.from({ length: 12 }).map((_, i) => (
          <circle
            key={i}
            cx="100"
            cy="36"
            r="2.6"
            fill="#b8973f"
            stroke="#7c6224"
            strokeWidth="0.5"
            transform={`rotate(${i * 30} 100 100)`}
          />
        ))}

        {/* maker mark in ink */}
        <text className="sc-mark" x="100" y="62" textAnchor="middle">
          MONTEROSSO
        </text>
        <text className="sc-sub" x="100" y="72" textAnchor="middle">
          MAR LIGURE
        </text>

        {/* temperature readouts — two quiet sub-dials */}
        <g className="sc-readout">
          <text className="sc-rd-lbl" x="72" y="128" textAnchor="middle">
            AIR
          </text>
          <text className="sc-rd-val" x="72" y="142" textAnchor="middle">
            {airTxt}
          </text>
          <text className="sc-rd-lbl" x="128" y="128" textAnchor="middle">
            SEA
          </text>
          <text className="sc-rd-val" x="128" y="142" textAnchor="middle">
            {seaTxt}
          </text>
        </g>

        {/* hour hand */}
        <g transform={`rotate(${hourAng} 100 100)`}>
          <rect
            x="97.4"
            y="52"
            width="5.2"
            height="54"
            rx="2.6"
            fill="url(#sc-hand)"
            stroke="#8c6e2e"
            strokeWidth="0.5"
          />
        </g>
        {/* minute hand */}
        <g transform={`rotate(${minAng} 100 100)`}>
          <rect
            x="98.4"
            y="30"
            width="3.2"
            height="76"
            rx="1.6"
            fill="url(#sc-hand)"
            stroke="#8c6e2e"
            strokeWidth="0.5"
          />
        </g>
        {/* second hand — slim, sweeping, with counterweight */}
        <g transform={`rotate(${secAng} 100 100)`}>
          <line
            x1="100"
            y1="116"
            x2="100"
            y2="24"
            stroke="#a8743f"
            strokeWidth="1.3"
            strokeLinecap="round"
          />
          <circle cx="100" cy="116" r="3.4" fill="#a8743f" />
        </g>

        {/* centre cap */}
        <circle cx="100" cy="100" r="4.6" fill="#b8973f" />
        <circle cx="100" cy="100" r="1.8" fill="#0a1f33" />
      </svg>
    </div>
  );
}
