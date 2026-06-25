// Manarola — one Cinque Terre village for the Skyline scene. Rendered INSIDE the
// shared <svg>/<defs> (gradients #hillGrad/#rockGrad/#mtnGreen, #cypress, #bush)
// provided by Skyline.js. Keep the outer <g transform="translate(X,0)"> position.
export default function Manarola() {
  return (
    <>
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
            <rect x="25" y="222" width="231" height="38" fill="url(#mtnGreen)" />
            <path d="M48,260 L96,260 Q74,255 52,257 Z" fill="#e6d4a4" />
          </g>
    </>
  );
}
