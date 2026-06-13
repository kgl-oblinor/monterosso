// The five villages of the Cinque Terre, drawn as stylised cliff-village
// silhouettes on the horizon (west → east): Monterosso · Vernazza ·
// Corniglia · Manarola · Riomaggiore — each with a recognisable landmark,
// plus cartoon detail: shaded house sides, doors, cypress trees & bushes.
export default function Skyline() {
  return (
    <div className="skyline" aria-hidden="true">
      <svg viewBox="0 0 1440 416">
        <defs>
          <linearGradient id="mtnGreen" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="var(--veg-green)" stopOpacity="0" />
            <stop offset="1" stopColor="var(--veg-green)" stopOpacity="0.42" />
          </linearGradient>
          <linearGradient id="hillGrad" x1="0.2" y1="0" x2="0.7" y2="1">
            <stop offset="0" stopColor="var(--hill-top)" />
            <stop offset="1" stopColor="var(--hill-bot)" />
          </linearGradient>
          <linearGradient id="rockGrad" x1="0.2" y1="0" x2="0.8" y2="1">
            <stop offset="0" stopColor="var(--rock-top)" />
            <stop offset="1" stopColor="var(--rock-bot)" />
          </linearGradient>
          <g id="cypress">
            <rect x="-1.3" y="-6" width="2.6" height="8" fill="#6a5436" />
            <path d="M0,-34 Q5,-20 4.2,-5 Q0,0 -4.2,-5 Q-5,-20 0,-34 Z" fill="var(--cypress)" />
            <path d="M0,-32 Q2.6,-19 1.4,-6 L0,-5 Z" fill="var(--cypress-hi)" />
          </g>
          <g id="bush">
            <ellipse cx="0" cy="0" rx="9" ry="6.5" fill="var(--bush)" />
            <ellipse cx="-2.5" cy="-1.6" rx="4.5" ry="3.4" fill="var(--bush-hi)" />
          </g>
        </defs>

        <g transform="translate(0,416) scale(1,1.6) translate(0,-260)">
          {/* ===================== MONTEROSSO ===================== */}
          <g transform="translate(20,0)">
            <path d="M-20,260 Q40,202 120,208 Q200,214 280,260 Z" fill="url(#hillGrad)" />
            <path d="M150,260 Q200,234 256,240 L256,260 Z" fill="url(#rockGrad)" />
            <path d="M-20,260 L150,260 L150,255 Q60,250 -20,256 Z" fill="#e7d9b0" />
            <use href="#bush" transform="translate(60,214) scale(1.1)" />
            <use href="#bush" transform="translate(96,210)" />
            <use href="#cypress" transform="translate(30,212)" />
            <rect x="6" y="228" width="20" height="32" fill="#e3a35c" />
            <rect x="6" y="225" width="20" height="4" fill="#a9482f" />
            <rect x="27" y="220" width="18" height="40" fill="#dd6f5a" />
            <rect x="27" y="217" width="18" height="4" fill="#8c3b2a" />
            <rect x="46" y="230" width="20" height="30" fill="#ecc164" />
            <rect x="46" y="227" width="20" height="4" fill="#a9482f" />
            <rect x="156" y="232" width="18" height="28" fill="#e58a6e" />
            <rect x="174" y="236" width="16" height="24" fill="#e3a35c" />
            <rect x="40" y="220" width="5" height="40" fill="#000000" opacity="0.12" />
            <rect x="61" y="230" width="5" height="30" fill="#000000" opacity="0.12" />
            <rect x="13" y="234" width="3" height="4" fill="var(--win)" />
            <rect x="33" y="226" width="3" height="4" fill="var(--win)" />
            <rect x="33" y="236" width="3" height="4" fill="var(--win)" />
            <rect x="51" y="234" width="3" height="4" fill="var(--win)" />
            <rect x="34" y="250" width="5" height="10" fill="#3a2418" />
            <rect x="50" y="216" width="3" height="6" fill="#9c5a44" />
            {/* Aurora round watchtower */}
            <rect x="90" y="196" width="16" height="48" fill="#cdbb97" />
            <rect x="88" y="190" width="20" height="8" fill="#b9a47e" />
            <rect x="89" y="186" width="4" height="5" fill="#b9a47e" />
            <rect x="96" y="186" width="4" height="5" fill="#b9a47e" />
            <rect x="103" y="186" width="4" height="5" fill="#b9a47e" />
            <rect x="96" y="206" width="4" height="6" fill="var(--win)" />
            <rect x="104" y="196" width="2" height="48" fill="#000000" opacity="0.12" />
            {/* Striped bell tower — San Giovanni Battista */}
            <rect x="126" y="152" width="18" height="92" fill="#f1e7d2" />
            <rect x="126" y="162" width="18" height="7" fill="#27483c" />
            <rect x="126" y="178" width="18" height="7" fill="#27483c" />
            <rect x="126" y="194" width="18" height="7" fill="#27483c" />
            <rect x="126" y="210" width="18" height="7" fill="#27483c" />
            <rect x="126" y="226" width="18" height="7" fill="#27483c" />
            <rect x="131" y="156" width="8" height="9" fill="#2b3a40" />
            <path d="M124,152 L135,134 L146,152 Z" fill="#9c4128" />
            {/* a few more houses */}
            <rect x="-14" y="238" width="15" height="22" fill="#e0a060" />
            <rect x="-14" y="235" width="15" height="3.4" fill="#a9482f" />
            <rect x="-8" y="244" width="3" height="4" fill="var(--win)" />
            <rect x="68" y="232" width="17" height="28" fill="#d98a6e" />
            <rect x="68" y="229" width="17" height="3.4" fill="#8c3b2a" />
            <rect x="74" y="240" width="3" height="4" fill="var(--win)" />
            <rect x="196" y="242" width="16" height="18" fill="#ecc97a" />
            <rect x="196" y="239" width="16" height="3.2" fill="#a9482f" />
            <rect x="201" y="247" width="3" height="4" fill="var(--win)" />
            <rect x="-25" y="222" width="315" height="38" fill="url(#mtnGreen)" />
            <path d="M-20,259 L150,259 Q60,252 -20,256 Z" fill="#ead9b0" />
          </g>

          {/* ===================== VERNAZZA ===================== */}
          <g transform="translate(330,0)">
            <path d="M-30,260 Q20,212 82,216 Q120,219 140,260 Z" fill="url(#hillGrad)" />
            <path d="M118,260 Q176,148 210,150 Q236,153 252,260 Z" fill="url(#rockGrad)" />
            <path d="M92,260 L120,260 L112,248 L101,248 Z" fill="#16323b" />
            <use href="#bush" transform="translate(40,214)" />
            <use href="#cypress" transform="translate(20,216) scale(0.9)" />
            <rect x="44" y="206" width="16" height="54" fill="#e89a4e" />
            <rect x="44" y="203" width="16" height="4" fill="#a9482f" />
            <rect x="60" y="198" width="16" height="62" fill="#dd7a86" />
            <rect x="60" y="195" width="16" height="4" fill="#8c3b2a" />
            <rect x="76" y="210" width="15" height="50" fill="#ecc15a" />
            <rect x="76" y="207" width="15" height="4" fill="#a9482f" />
            <rect x="120" y="214" width="16" height="46" fill="#e3793a" />
            <rect x="136" y="220" width="14" height="40" fill="#d98a86" />
            <rect x="56" y="198" width="4" height="62" fill="#000000" opacity="0.12" />
            <rect x="87" y="210" width="4" height="50" fill="#000000" opacity="0.12" />
            <rect x="50" y="214" width="3" height="4" fill="var(--win)" />
            <rect x="66" y="208" width="3" height="4" fill="var(--win)" />
            <rect x="66" y="222" width="3" height="4" fill="var(--win)" />
            <rect x="82" y="220" width="3" height="4" fill="var(--win)" />
            <rect x="65" y="248" width="6" height="12" fill="#3a2418" />
            <rect x="48" y="248" width="5" height="12" fill="#3a2418" />
            {/* Octagonal bell tower — Santa Margherita */}
            <rect x="30" y="172" width="14" height="88" fill="#d9c59b" />
            <rect x="30" y="186" width="14" height="3" fill="#b7a079" />
            <rect x="35" y="178" width="4" height="6" fill="#2b3a40" />
            <path d="M28,172 a9,9 0 0 1 18,0 Z" fill="#7e8e88" />
            <rect x="36" y="150" width="2" height="9" fill="#7e8e88" />
            {/* Belforte round tower */}
            <rect x="184" y="120" width="20" height="46" fill="#8a8478" />
            <rect x="181" y="114" width="26" height="7" fill="#76705f" />
            <rect x="182" y="109" width="5" height="6" fill="#76705f" />
            <rect x="191" y="109" width="5" height="6" fill="#76705f" />
            <rect x="200" y="109" width="5" height="6" fill="#76705f" />
            <rect x="191" y="132" width="5" height="7" fill="var(--win)" />
            {/* a few more houses */}
            <rect x="12" y="240" width="15" height="20" fill="#e0907e" />
            <rect x="12" y="237" width="15" height="3.2" fill="#8c3b2a" />
            <rect x="17" y="245" width="3" height="4" fill="var(--win)" />
            <rect x="96" y="236" width="16" height="24" fill="#e8b06a" />
            <rect x="96" y="233" width="16" height="3.2" fill="#a9482f" />
            <rect x="102" y="243" width="3" height="4" fill="var(--win)" />
            <rect x="154" y="240" width="15" height="20" fill="#cf7a52" />
            <rect x="154" y="237" width="15" height="3.2" fill="#8c3b2a" />
            <rect x="159" y="245" width="3" height="4" fill="var(--win)" />
            <rect x="-35" y="222" width="300" height="38" fill="url(#mtnGreen)" />
            <path d="M94,260 L135,260 Q116,254 98,257 Z" fill="#ead9b0" />
          </g>

          {/* ===================== CORNIGLIA (hilltop) ===================== */}
          <g transform="translate(600,0)">
            <path d="M-40,260 Q60,70 150,80 Q236,90 300,260 Z" fill="url(#hillGrad)" />
            <path d="M20,210 Q150,150 268,212" stroke="var(--terrace)" strokeWidth="3" fill="none" />
            <path d="M10,228 Q150,176 278,230" stroke="var(--terrace2)" strokeWidth="3" fill="none" />
            <path d="M40,192 Q150,138 244,196" stroke="var(--terrace)" strokeWidth="2.5" fill="none" />
            <path d="M-40,260 L300,260 L300,236 Q130,228 -40,240 Z" fill="url(#rockGrad)" />
            <use href="#cypress" transform="translate(55,208) scale(1.05)" />
            <use href="#cypress" transform="translate(232,210)" />
            <use href="#cypress" transform="translate(205,196) scale(0.85)" />
            <use href="#bush" transform="translate(90,222)" />
            <use href="#bush" transform="translate(210,224) scale(1.1)" />
            <rect x="116" y="112" width="16" height="34" fill="#e89a4e" />
            <rect x="116" y="109" width="16" height="4" fill="#a9482f" />
            <rect x="132" y="104" width="16" height="42" fill="#dd6f5a" />
            <rect x="132" y="101" width="16" height="4" fill="#8c3b2a" />
            <rect x="148" y="116" width="15" height="30" fill="#ecc164" />
            <rect x="148" y="113" width="15" height="4" fill="#a9482f" />
            <rect x="100" y="120" width="16" height="26" fill="#e3a35c" />
            <rect x="163" y="120" width="15" height="26" fill="#d98a86" />
            <rect x="128" y="104" width="4" height="42" fill="#000000" opacity="0.12" />
            <rect x="122" y="120" width="3" height="4" fill="var(--win)" />
            <rect x="138" y="112" width="3" height="4" fill="var(--win)" />
            <rect x="138" y="126" width="3" height="4" fill="var(--win)" />
            <rect x="137" y="136" width="5" height="10" fill="#3a2418" />
            {/* church San Pietro */}
            <rect x="150" y="86" width="11" height="20" fill="#ded0ad" />
            <rect x="150" y="92" width="11" height="3" fill="#9c8f6b" />
            <path d="M149,86 L155.5,76 L162,86 Z" fill="#9c4128" />
            {/* a few more houses cascading the hilltop */}
            <rect x="86" y="124" width="14" height="22" fill="#e8b06a" />
            <rect x="86" y="121" width="14" height="3.2" fill="#a9482f" />
            <rect x="91" y="130" width="3" height="4" fill="var(--win)" />
            <rect x="180" y="120" width="14" height="26" fill="#d98a6e" />
            <rect x="180" y="117" width="14" height="3.2" fill="#8c3b2a" />
            <rect x="185" y="127" width="3" height="4" fill="var(--win)" />
            <rect x="-45" y="222" width="355" height="38" fill="url(#mtnGreen)" />
          </g>

          {/* ===================== MANAROLA ===================== */}
          <g transform="translate(880,0)">
            <path d="M24,260 L24,224 Q40,196 96,200 Q140,206 160,260 Z" fill="url(#rockGrad)" />
            <path d="M64,260 Q150,206 232,224 Q252,229 252,260 Z" fill="#4f5a55" />
            <path d="M36,260 Q58,244 88,250 L96,260 Z" fill="#5b635c" />
            <path d="M50,260 L96,260 L86,246 L58,246 Z" fill="#143038" />
            <ellipse cx="64" cy="256" rx="6" ry="2" fill="#d8443a" />
            <ellipse cx="78" cy="258" rx="6" ry="2" fill="#e9e4d6" />
            <rect x="92" y="206" width="17" height="40" fill="#d8443a" />
            <rect x="92" y="203" width="17" height="4" fill="#8c3b2a" />
            <rect x="108" y="196" width="17" height="44" fill="#e89a4e" />
            <rect x="108" y="193" width="17" height="4" fill="#a9482f" />
            <rect x="124" y="188" width="17" height="44" fill="#ecc15a" />
            <rect x="124" y="185" width="17" height="4" fill="#a9482f" />
            <rect x="140" y="196" width="16" height="34" fill="#dd7a86" />
            <rect x="156" y="204" width="16" height="26" fill="#e3793a" />
            <rect x="104" y="196" width="4" height="44" fill="#000000" opacity="0.12" />
            <rect x="120" y="188" width="4" height="44" fill="#000000" opacity="0.12" />
            <rect x="98" y="214" width="3" height="4" fill="var(--win)" />
            <rect x="114" y="206" width="3" height="4" fill="var(--win)" />
            <rect x="114" y="220" width="3" height="4" fill="var(--win)" />
            <rect x="130" y="198" width="3" height="4" fill="var(--win)" />
            <rect x="130" y="212" width="3" height="4" fill="var(--win)" />
            <rect x="113" y="228" width="5" height="12" fill="#3a2418" />
            <rect x="129" y="220" width="5" height="12" fill="#3a2418" />
            {/* Church San Lorenzo with rose window */}
            <rect x="58" y="150" width="32" height="56" fill="#ded0ad" />
            <path d="M56,150 L74,128 L92,150 Z" fill="#9c4128" />
            <circle cx="74" cy="168" r="8" fill="#b3a47e" />
            <circle cx="74" cy="168" r="4" fill="#5f5a44" />
            <rect x="73" y="160" width="2" height="16" fill="#5f5a44" />
            <rect x="66" y="167" width="16" height="2" fill="#5f5a44" />
            <rect x="44" y="166" width="12" height="40" fill="#cfc3a0" />
            <rect x="44" y="174" width="12" height="3" fill="#4f5a55" />
            <rect x="44" y="184" width="12" height="3" fill="#4f5a55" />
            {/* a few more houses */}
            <rect x="28" y="226" width="15" height="34" fill="#e0907e" />
            <rect x="28" y="223" width="15" height="3.4" fill="#8c3b2a" />
            <rect x="34" y="234" width="3" height="4" fill="var(--win)" />
            <rect x="174" y="206" width="16" height="30" fill="#e8b06a" />
            <rect x="174" y="203" width="16" height="3.4" fill="#a9482f" />
            <rect x="180" y="214" width="3" height="4" fill="var(--win)" />
            <rect x="190" y="220" width="14" height="22" fill="#cf7a52" />
            <rect x="190" y="217" width="14" height="3.2" fill="#8c3b2a" />
            <rect x="195" y="227" width="3" height="4" fill="var(--win)" />
            <rect x="30" y="222" width="230" height="38" fill="url(#mtnGreen)" />
            <path d="M48,260 L96,260 Q74,255 52,257 Z" fill="#e6d4a4" />
          </g>

          {/* ===================== RIOMAGGIORE ===================== */}
          <g transform="translate(1150,0)">
            <path d="M-10,260 Q34,150 74,152 L74,260 Z" fill="url(#rockGrad)" />
            <path d="M210,260 Q256,150 292,162 L292,260 Z" fill="url(#rockGrad)" />
            <path d="M-10,260 Q34,150 50,152 Q40,200 26,260 Z" fill="#565a52" />
            <path d="M40,160 Q56,150 74,154 Q60,168 44,166 Z" fill="url(#hillGrad)" />
            <path d="M236,168 Q262,156 292,164 Q268,178 244,176 Z" fill="url(#hillGrad)" />
            <use href="#bush" transform="translate(58,158) scale(0.8)" />
            <use href="#cypress" transform="translate(262,168) scale(0.8)" />
            <rect x="84" y="206" width="18" height="54" fill="#d8443a" />
            <rect x="84" y="203" width="18" height="4" fill="#8c3b2a" />
            <rect x="102" y="192" width="18" height="68" fill="#e89a4e" />
            <rect x="102" y="189" width="18" height="4" fill="#a9482f" />
            <rect x="120" y="180" width="18" height="80" fill="#ecc15a" />
            <rect x="120" y="177" width="18" height="4" fill="#a9482f" />
            <rect x="138" y="190" width="18" height="70" fill="#dd7a86" />
            <rect x="138" y="187" width="18" height="4" fill="#8c3b2a" />
            <rect x="156" y="200" width="18" height="60" fill="#e3793a" />
            <rect x="156" y="197" width="18" height="4" fill="#a9482f" />
            <rect x="174" y="210" width="18" height="50" fill="#d98a86" />
            <rect x="174" y="207" width="18" height="4" fill="#8c3b2a" />
            <rect x="192" y="218" width="16" height="42" fill="#e3a35c" />
            <rect x="116" y="180" width="4" height="80" fill="#000000" opacity="0.12" />
            <rect x="134" y="190" width="4" height="70" fill="#000000" opacity="0.12" />
            <rect x="152" y="200" width="4" height="60" fill="#000000" opacity="0.12" />
            <rect x="90" y="214" width="3" height="4" fill="var(--win)" />
            <rect x="90" y="228" width="3" height="4" fill="var(--win)" />
            <rect x="108" y="200" width="3" height="4" fill="var(--win)" />
            <rect x="108" y="216" width="3" height="4" fill="var(--win)" />
            <rect x="108" y="232" width="3" height="4" fill="var(--win)" />
            <rect x="126" y="190" width="3" height="4" fill="var(--win)" />
            <rect x="126" y="206" width="3" height="4" fill="var(--win)" />
            <rect x="126" y="222" width="3" height="4" fill="var(--win)" />
            <rect x="144" y="200" width="3" height="4" fill="var(--win)" />
            <rect x="162" y="210" width="3" height="4" fill="var(--win)" />
            <rect x="125" y="246" width="6" height="14" fill="#3a2418" />
            <rect x="107" y="246" width="5" height="14" fill="#3a2418" />
            <ellipse cx="120" cy="256" rx="11" ry="3" fill="#d8443a" />
            <ellipse cx="150" cy="258" rx="10" ry="3" fill="#e9e4d6" />
            {/* rocky outcrop so the watchtower stands on the cliff,
                not in mid-air — the cliff curves away under its left side */}
            <path d="M216,260 L222,186 Q243,168 264,186 L270,260 Z" fill="url(#rockGrad)" />
            {/* castle watchtower */}
            <rect x="232" y="150" width="22" height="34" fill="#8a8478" />
            <rect x="230" y="144" width="26" height="7" fill="#76705f" />
            <rect x="231" y="139" width="5" height="6" fill="#76705f" />
            <rect x="240" y="139" width="5" height="6" fill="#76705f" />
            <rect x="249" y="139" width="5" height="6" fill="#76705f" />
            <rect x="239" y="160" width="6" height="8" fill="var(--win)" />
            {/* a few more houses */}
            <rect x="66" y="224" width="15" height="36" fill="#e8b06a" />
            <rect x="66" y="221" width="15" height="3.6" fill="#a9482f" />
            <rect x="72" y="232" width="3" height="4" fill="var(--win)" />
            <rect x="150" y="244" width="14" height="16" fill="#d98a6e" />
            <rect x="150" y="241" width="14" height="3.2" fill="#8c3b2a" />
            <rect x="155" y="249" width="3" height="4" fill="var(--win)" />
            <rect x="210" y="232" width="14" height="28" fill="#ecc97a" />
            <rect x="210" y="229" width="14" height="3.4" fill="#a9482f" />
            <rect x="215" y="239" width="3" height="4" fill="var(--win)" />
            <rect x="-15" y="222" width="315" height="38" fill="url(#mtnGreen)" />
            <path d="M92,260 L178,260 Q138,254 100,257 Z" fill="#ead9b0" />
          </g>
        </g>
      </svg>
    </div>
  );
}
