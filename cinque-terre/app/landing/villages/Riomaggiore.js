// Riomaggiore — one Cinque Terre village for the Skyline scene. Rendered INSIDE the
// shared <svg>/<defs> (gradients #hillGrad/#rockGrad/#mtnGreen, #cypress, #bush)
// provided by Skyline.js. Keep the outer <g transform="translate(X,0)"> position.
export default function Riomaggiore() {
  return (
    <>
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
            <rect x="-14" y="222" width="314" height="38" fill="url(#mtnGreen)" />
            <path d="M92,260 L178,260 Q138,254 100,257 Z" fill="#ead9b0" />
          </g>
    </>
  );
}
