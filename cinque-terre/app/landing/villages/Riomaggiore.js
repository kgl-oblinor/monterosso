// Riomaggiore — one Cinque Terre village for the Skyline scene. Rendered INSIDE the
// shared <svg>/<defs> (gradients #hillGrad/#rockGrad/#mtnGreen, #cypress, #bush)
// provided by Skyline.js. Keep the outer <g transform="translate(X,0)"> position.
export default function Riomaggiore() {
  return (
    <>
          {/* ===================== RIOMAGGIORE ===================== */}
          {/* CARICATURE: tall narrow tower-houses CASCADE down a steep gorge into a
              tiny harbor. The RED tower-house is tallest and stands out as the eye-catch.
              Overdriven peach / coral / saffron / pink / ochre. */}
          <g transform="translate(1150,0)">
            {/* ---- the gorge: two rocky flanks curving down to a narrow notch ---- */}
            <path d="M-10,260 Q22,154 70,150 Q88,162 92,200 Q94,232 90,260 Z" fill="url(#rockGrad)" />
            <path d="M214,260 Q230,202 232,166 Q252,150 292,162 Q294,206 292,260 Z" fill="url(#rockGrad)" />
            <path d="M-10,260 Q22,158 46,150 Q40,204 24,260 Z" fill="#565a52" />
            <path d="M36,158 Q54,148 72,152 Q58,168 42,166 Z" fill="url(#hillGrad)" />
            <path d="M236,168 Q262,156 292,164 Q268,178 244,176 Z" fill="url(#hillGrad)" />
            <use href="#bush" transform="translate(54,156) scale(0.85)" />
            <use href="#cypress" transform="translate(262,168) scale(0.85)" />

            {/* ---- cliff terrace the cascade sits on: a stepped rock shelf under the
                 stacked houses so each row rests on ground, not mid-air ---- */}
            <path d="M52,260 Q56,210 76,196 Q100,180 116,170 Q150,182 178,206 Q198,224 206,260 Z" fill="url(#rockGrad)" />
            <path d="M64,260 Q70,222 92,208 Q120,192 140,210 Q166,230 176,260 Z" fill="#5e6258" opacity="0.55" />

            {/* ============ CASCADE — left flank tumbling down the gorge ============ */}
            {/* high & tall up the flank, getting lower toward the central notch */}
            <rect x="58" y="196" width="16" height="64" fill="#e58a6e" />
            <rect x="58" y="193" width="16" height="4" fill="#a9482f" />
            <rect x="72" y="200" width="2.5" height="64" fill="#000000" opacity="0.12" />
            <rect x="74" y="184" width="17" height="76" fill="#ecc164" />
            <rect x="74" y="181" width="17" height="4" fill="#a9482f" />
            <rect x="88" y="188" width="2.5" height="76" fill="#000000" opacity="0.12" />
            <rect x="91" y="200" width="16" height="60" fill="#dd7a86" />
            <rect x="91" y="197" width="16" height="4" fill="#8c3b2a" />
            <rect x="104.5" y="204" width="2.5" height="60" fill="#000000" opacity="0.12" />

            {/* ============ THE RED TOWER-HOUSE — tallest, the eye-catch ============ */}
            <rect x="107" y="160" width="20" height="100" fill="#d8443a" />
            <rect x="107" y="156" width="20" height="5" fill="#8c3b2a" />
            <rect x="124.5" y="161" width="2.5" height="99" fill="#000000" opacity="0.16" />

            {/* ============ CASCADE — right flank tumbling down the gorge ============ */}
            <rect x="127" y="190" width="17" height="70" fill="#e3793a" />
            <rect x="127" y="187" width="17" height="4" fill="#a9482f" />
            <rect x="141.5" y="194" width="2.5" height="70" fill="#000000" opacity="0.12" />
            <rect x="144" y="202" width="16" height="58" fill="#e89a4e" />
            <rect x="144" y="199" width="16" height="4" fill="#a9482f" />
            <rect x="157.5" y="206" width="2.5" height="58" fill="#000000" opacity="0.12" />
            <rect x="160" y="212" width="15" height="48" fill="#d98a86" />
            <rect x="160" y="209" width="15" height="4" fill="#8c3b2a" />
            <rect x="172.5" y="216" width="2.5" height="48" fill="#000000" opacity="0.12" />
            <rect x="175" y="222" width="14" height="38" fill="#e3a35c" />
            <rect x="175" y="219" width="14" height="3.6" fill="#a9482f" />
            <rect x="187" y="225" width="2" height="35" fill="#000000" opacity="0.12" />
            <rect x="189" y="230" width="13" height="30" fill="#e8b06a" />
            <rect x="189" y="227" width="13" height="3.4" fill="#a9482f" />

            {/* windows scattered up the tall stacked facades */}
            <rect x="63" y="206" width="3" height="4" fill="var(--win)" />
            <rect x="63" y="222" width="3" height="4" fill="var(--win)" />
            <rect x="80" y="194" width="3" height="4" fill="var(--win)" />
            <rect x="80" y="210" width="3" height="4" fill="var(--win)" />
            <rect x="80" y="226" width="3" height="4" fill="var(--win)" />
            <rect x="97" y="210" width="3" height="4" fill="var(--win)" />
            <rect x="97" y="226" width="3" height="4" fill="var(--win)" />
            {/* red tower windows — a vertical run, marking it as the landmark */}
            <rect x="114" y="172" width="4" height="5" fill="var(--win)" />
            <rect x="114" y="188" width="4" height="5" fill="var(--win)" />
            <rect x="114" y="204" width="4" height="5" fill="var(--win)" />
            <rect x="114" y="220" width="4" height="5" fill="var(--win)" />
            <rect x="132" y="200" width="3" height="4" fill="var(--win)" />
            <rect x="132" y="216" width="3" height="4" fill="var(--win)" />
            <rect x="149" y="212" width="3" height="4" fill="var(--win)" />
            <rect x="149" y="228" width="3" height="4" fill="var(--win)" />
            <rect x="165" y="222" width="3" height="4" fill="var(--win)" />
            <rect x="180" y="232" width="3" height="4" fill="var(--win)" />

            {/* doors at the foot of the gorge, opening toward the harbor */}
            <rect x="113" y="246" width="6" height="14" fill="#3a2418" />
            <rect x="131" y="248" width="5" height="12" fill="#3a2418" />
            <rect x="95" y="248" width="5" height="12" fill="#3a2418" />

            {/* rocky outcrop so the watchtower stands on the cliff, not mid-air */}
            <path d="M214,260 Q220,224 224,190 Q243,168 262,188 Q268,224 272,260 Z" fill="url(#rockGrad)" />
            {/* castle watchtower on the cliff (kept) */}
            <rect x="232" y="150" width="22" height="34" fill="#8a8478" />
            <rect x="230" y="144" width="26" height="7" fill="#76705f" />
            <rect x="231" y="139" width="5" height="6" fill="#76705f" />
            <rect x="240" y="139" width="5" height="6" fill="#76705f" />
            <rect x="249" y="139" width="5" height="6" fill="#76705f" />
            <rect x="239" y="160" width="6" height="8" fill="var(--win)" />
            {/* a couple of houses climbing toward the tower */}
            <rect x="208" y="232" width="14" height="28" fill="#ecc97a" />
            <rect x="208" y="229" width="14" height="3.4" fill="#a9482f" />
            <rect x="213" y="239" width="3" height="4" fill="var(--win)" />

            {/* green vegetation veil hugging the village base, lifting away from the
                central harbor notch so the waterline (y=260) stays open sea there */}
            <path d="M-14,222 L300,222 L300,260 L168,260 Q156,250 130,250 Q104,250 92,260 L-14,260 Z" fill="url(#mtnGreen)" />

            {/* ============ NAME PENNANT — a tiny triangular flag on a thin pole atop
                 the RED tower-house (the eye-catch). Riomaggiore's coat of arms:
                 green mountains rising from a blue sea, with a radiant gold sun.
                 RIOMAGGIORE in tiny caps under the pennant. ============ */}
            {/* thin pole rising from the red tower roof */}
            <rect x="116.4" y="138" width="1.2" height="22" fill="#5b4636" />
            <circle cx="117" cy="138" r="1.4" fill="#ecc164" />
            {/* triangular pennant: blue sea band at base, green peaks, gold sun */}
            <path d="M117,140 L141,144.5 L117,149 Z" fill="#2f7fb0" />
            <path d="M117,145.6 L141,147 L141,144.5 L117,140 Z" fill="#3f9e4d" />
            <path d="M119,144.4 L123,146.3 L127,144.6 L131,146.1 L135,144.8 L117,144 Z" fill="#2f8a3e" opacity="0.9" />
            <circle cx="125" cy="143" r="2" fill="#ecc164" />
            <path d="M125,140.4 L125.5,142.4 M127.6,141 L126.6,142.6 M129,143 L126.9,143.4 M127.6,145 L126.6,143.7 M122.4,141 L123.4,142.6 M120.8,143 L122.9,143.4 M122.4,145 L123.4,143.7" stroke="#ecc164" strokeWidth="0.5" strokeLinecap="round" />
            {/* RIOMAGGIORE in bittesmå versaler under the pennant */}
            <text x="117" y="156.4" fontSize="4" fontFamily="Arial, sans-serif" fontWeight="700" letterSpacing="0.1" textAnchor="middle" fill="#2f4150">RIOMAGGIORE</text>
          </g>
    </>
  );
}
