"use client";

import { useEffect, useRef } from "react";

// A minimalist caricature of Vernazza's Santa Margherita d'Antiochia bell
// tower, with a real, live clock (hour + minute + sweeping second hand).
// Clicking it opens the village's story popup.
export default function ClockTower({ onOpen }) {
  const hourRef = useRef(null);
  const minRef = useRef(null);
  const secRef = useRef(null);

  useEffect(() => {
    const cx = 50;
    const cy = 138;
    let raf;
    const tick = () => {
      const now = new Date();
      const ms = now.getMilliseconds();
      const s = now.getSeconds() + ms / 1000; // fractional → smooth sweep
      const m = now.getMinutes() + s / 60;
      const h = (now.getHours() % 12) + m / 60;
      hourRef.current?.setAttribute("transform", `rotate(${h * 30} ${cx} ${cy})`);
      minRef.current?.setAttribute("transform", `rotate(${m * 6} ${cx} ${cy})`);
      secRef.current?.setAttribute("transform", `rotate(${s * 6} ${cx} ${cy})`);
      raf = requestAnimationFrame(tick);
    };
    tick();
    return () => cancelAnimationFrame(raf);
  }, []);

  // 12 minimalist hour ticks around the dial.
  // Round coordinates so SSR and client render identical strings (no hydration mismatch).
  const rnd = (n) => Math.round(n * 100) / 100;
  const ticks = [];
  for (let i = 0; i < 12; i++) {
    const a = (i * 30 * Math.PI) / 180;
    const r1 = 25;
    const r2 = i % 3 === 0 ? 20.5 : 22.5; // longer at 12/3/6/9
    ticks.push(
      <line
        key={i}
        x1={rnd(50 + Math.sin(a) * r1)}
        y1={rnd(138 - Math.cos(a) * r1)}
        x2={rnd(50 + Math.sin(a) * r2)}
        y2={rnd(138 - Math.cos(a) * r2)}
        stroke="#2b2b2b"
        strokeWidth={i % 3 === 0 ? 1.4 : 0.8}
        strokeLinecap="round"
      />
    );
  }

  return (
    <button
      className="clocktower"
      onClick={onOpen}
      aria-label="Vernazza clock tower — read about the village"
    >
      <svg viewBox="0 0 100 230" className="ct-svg">
        {/* ogival dome */}
        <path
          d="M24 60 Q24 20 50 11 Q76 20 76 60 Z"
          fill="#b07d4e"
          stroke="#7e5634"
          strokeWidth="1"
        />
        {/* dome scallops + finial */}
        <path d="M30 50 Q50 40 70 50" fill="none" stroke="#8a6038" strokeWidth="0.8" opacity="0.6" />
        <path d="M33 40 Q50 31 67 40" fill="none" stroke="#8a6038" strokeWidth="0.8" opacity="0.6" />
        <circle cx="50" cy="9" r="2.4" fill="#caa86e" stroke="#7e5634" strokeWidth="0.6" />

        {/* cornice under the dome */}
        <rect x="22" y="60" width="56" height="7" rx="1.5" fill="#cdb992" stroke="#a08a63" strokeWidth="0.7" />

        {/* tower body (warm faded stone) */}
        <rect x="27" y="67" width="46" height="160" fill="#cbb791" stroke="#a8946b" strokeWidth="0.8" />
        {/* a couple of soft vertical shading bands */}
        <rect x="27" y="67" width="7" height="160" fill="#000" opacity="0.05" />
        <rect x="66" y="67" width="7" height="160" fill="#000" opacity="0.07" />

        {/* belfry arch with a bell */}
        <path d="M40 96 Q40 80 50 80 Q60 80 60 96 L60 100 L40 100 Z" fill="#2a2018" opacity="0.85" />
        <path d="M46 88 Q46 85 50 85 Q54 85 54 88 L55 96 L45 96 Z" fill="#9c8552" stroke="#6f5b32" strokeWidth="0.5" />

        {/* clock dial */}
        <circle cx="50" cy="138" r="27" fill="#efe3c7" stroke="#2b2b2b" strokeWidth="1.6" />
        <circle cx="50" cy="138" r="27" fill="none" stroke="#caa86e" strokeWidth="0.6" opacity="0.7" />
        {ticks}

        {/* hands */}
        <line
          ref={hourRef}
          x1="50"
          y1="138"
          x2="50"
          y2="123"
          stroke="#2b2b2b"
          strokeWidth="2.4"
          strokeLinecap="round"
        />
        <line
          ref={minRef}
          x1="50"
          y1="138"
          x2="50"
          y2="116"
          stroke="#2b2b2b"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        <line
          ref={secRef}
          x1="50"
          y1="142"
          x2="50"
          y2="115"
          stroke="#2b2b2b"
          strokeWidth="0.9"
          strokeLinecap="round"
        />
        <circle cx="50" cy="138" r="1.8" fill="#2b2b2b" />
      </svg>
    </button>
  );
}
