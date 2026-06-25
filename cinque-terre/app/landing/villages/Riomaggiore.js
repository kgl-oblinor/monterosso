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
            {/* ---- the gorge: two rocky flanks plunging to a narrow notch ---- */}
            <path d="M-10,260 Q26,150 70,150 L92,260 Z" fill="url(#rockGrad)" />
            <path d="M214,260 Q256,150 292,162 L292,260 Z" fill="url(#rockGrad)" />
            <path d="M-10,260 Q26,150 46,150 Q38,200 24,260 Z" fill="#565a52" />
            <path d="M36,158 Q54,148 72,152 Q58,168 42,166 Z" fill="url(#hillGrad)" />
            <path d="M236,168 Q262,156 292,164 Q268,178 244,176 Z" fill="url(#hillGrad)" />
            <use href="#bush" transform="translate(54,156) scale(0.85)" />
            <use href="#cypress" transform="translate(262,168) scale(0.85)" />

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

            {/* ============ tiny harbor at the bottom — boats hinted ============ */}
            <ellipse cx="118" cy="255" rx="13" ry="3.2" fill="#d8443a" />
            <ellipse cx="118" cy="254" rx="9" ry="2" fill="#b83729" />
            <ellipse cx="146" cy="258" rx="11" ry="3" fill="#e9e4d6" />
            <ellipse cx="146" cy="257" rx="7" ry="1.8" fill="#cfc9ba" />
            <ellipse cx="100" cy="259" rx="8" ry="2.4" fill="#3f6f86" />

            {/* rocky outcrop so the watchtower stands on the cliff, not mid-air */}
            <path d="M216,260 L222,186 Q243,168 264,186 L270,260 Z" fill="url(#rockGrad)" />
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

            <rect x="-14" y="222" width="314" height="38" fill="url(#mtnGreen)" />
            <path d="M96,260 L172,260 Q134,254 102,257 Z" fill="#ead9b0" />
          </g>
    </>
  );
}
