// Monterosso — one Cinque Terre village for the Skyline scene. Rendered INSIDE the
// shared <svg>/<defs> (gradients #hillGrad/#rockGrad/#mtnGreen, #cypress, #bush)
// provided by Skyline.js. Keep the outer <g transform="translate(X,0)"> position.
export default function Monterosso() {
  return (
    <>
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
            <rect x="-25" y="222" width="305" height="38" fill="url(#mtnGreen)" />
            <path d="M-20,259 L150,259 Q60,252 -20,256 Z" fill="#ead9b0" />
          </g>
    </>
  );
}
