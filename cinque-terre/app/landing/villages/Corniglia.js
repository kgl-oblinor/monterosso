// Corniglia — one Cinque Terre village for the Skyline scene. Rendered INSIDE the
// shared <svg>/<defs> (gradients #hillGrad/#rockGrad/#mtnGreen, #cypress, #bush)
// provided by Skyline.js. Keep the outer <g transform="translate(X,0)"> position.
export default function Corniglia() {
  return (
    <>
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
            <rect x="-25" y="222" width="330" height="38" fill="url(#mtnGreen)" />
          </g>
    </>
  );
}
