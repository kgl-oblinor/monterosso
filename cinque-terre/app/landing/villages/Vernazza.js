// Vernazza — one Cinque Terre village for the Skyline scene. Rendered INSIDE the
// shared <svg>/<defs> (gradients #hillGrad/#rockGrad/#mtnGreen, #cypress, #bush)
// provided by Skyline.js. Keep the outer <g transform="translate(X,0)"> position.
export default function Vernazza() {
  return (
    <>
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
            <rect x="-30" y="222" width="275" height="38" fill="url(#mtnGreen)" />
            <path d="M94,260 L135,260 Q116,254 98,257 Z" fill="#ead9b0" />
          </g>
    </>
  );
}
