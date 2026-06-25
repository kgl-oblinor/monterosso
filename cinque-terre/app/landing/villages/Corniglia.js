// Corniglia — one Cinque Terre village for the Skyline scene. Rendered INSIDE the
// shared <svg>/<defs> (gradients #hillGrad/#rockGrad/#mtnGreen, #cypress, #bush)
// provided by Skyline.js. Keep the outer <g transform="translate(X,0)"> position.
//
// CARICATURE: the ONLY hilltop village (~100 m, no harbour), perched on a high,
// steep cliff and wrapped in terraced vineyards (fasce). Exaggerated: a tall,
// steep peak; the house cluster clipped right onto the summit; bold green
// terrace lines sweeping down both flanks. Reads as "the village in the clouds".
export default function Corniglia() {
  return (
    <>
          {/* ===================== CORNIGLIA (hilltop) ===================== */}
          <g transform="translate(600,0)">
            {/* soft cliff/beach foot UNDER the scene — a rocky shelf that eases
                the hill into the real sea below (no blue water of our own; this
                just rounds off the base so the cliff doesn't plunge abruptly).
                Drawn first so it sits beneath hill, rock band and houses. */}
            <path d="M-44,260 Q-10,251 32,253 Q90,257 150,255 Q216,257 270,253 Q300,251 304,260 Z"
                  fill="url(#rockGrad)" opacity="0.55" />
            <path d="M-28,260 Q40,252 110,256 Q180,259 248,255 Q288,252 296,260 Z"
                  fill="url(#hillGrad)" opacity="0.45" />
            {/* organic, ASYMMETRIC cliff headland — the summit sits LEFT of centre,
                the right flank drops in two stages (a broad shoulder/ledge at ~x=205)
                while the left flank falls steeper and straighter. Top ridge is uneven
                (a lower bump near x=92 before the true crown) so it reads as a real
                Cinque Terre odde, not a symmetric tent. Slightly lower than before. */}
            <path d="M-50,260 Q-14,250 26,245
                     Q58,214 84,150 Q100,124 118,96
                     Q132,72 138,60 Q150,56 162,66
                     Q176,92 188,120 Q198,150 206,164
                     Q236,172 252,206 Q288,248 312,260 Z" fill="url(#hillGrad)" />
            {/* terraced-vineyard lines (fasce) following the new uneven form — the
                crest of each line is pulled LEFT (toward the off-centre summit) and
                the flanks land at different heights, so they hug the asymmetry */}
            <path d="M22,234 Q120,200 250,222 Q284,228 300,238" stroke="var(--terrace2)" strokeWidth="3.4" fill="none" opacity="0.95" />
            <path d="M16,218 Q118,180 232,204 Q268,212 288,222" stroke="var(--terrace)" strokeWidth="3.2" fill="none" opacity="0.95" />
            <path d="M26,200 Q116,158 214,186 Q246,194 268,204" stroke="var(--terrace2)" strokeWidth="3" fill="none" opacity="0.9" />
            <path d="M38,182 Q114,140 198,168 Q224,177 246,186" stroke="var(--terrace)" strokeWidth="2.8" fill="none" opacity="0.9" />
            <path d="M52,162 Q112,122 184,150 Q206,159 226,168" stroke="var(--terrace2)" strokeWidth="2.6" fill="none" opacity="0.85" />
            <path d="M66,142 Q110,108 170,132 Q190,140 208,150" stroke="var(--terrace)" strokeWidth="2.4" fill="none" opacity="0.85" />
            <path d="M82,122 Q112,98 156,114 Q174,121 190,130" stroke="var(--terrace2)" strokeWidth="2.2" fill="none" opacity="0.8" />
            {/* bare rock band along the base of the cliff — soft curved top edge,
                rounded ends so it eases into the foot instead of cutting straight */}
            <path d="M-46,260 Q126,256 308,260 L308,238 Q220,230 150,234 Q60,232 -46,242 Z" fill="url(#rockGrad)" />
            {/* cypress + bushes terracing the slope */}
            <use href="#cypress" transform="translate(50,216) scale(1.1)" />
            <use href="#cypress" transform="translate(240,216) scale(1.05)" />
            <use href="#cypress" transform="translate(210,198) scale(0.85)" />
            <use href="#cypress" transform="translate(78,200) scale(0.8)" />
            <use href="#bush" transform="translate(92,228)" />
            <use href="#bush" transform="translate(214,230) scale(1.15)" />
            <use href="#bush" transform="translate(60,236) scale(0.9)" />

            {/* summit foundation ledge — a solid rock shelf the cluster sits ON,
                grounding the houses on the off-centre ridge (not floating). Its top
                edge tilts (lower on the right) to match the uneven crown. */}
            <path d="M82,100 Q140,90 202,100 L202,98 Q140,85 82,98 Z" fill="url(#rockGrad)" />
            <path d="M84,98 Q140,88 200,98 L200,96 Q140,84 84,96 Z" fill="url(#hillGrad)" opacity="0.85" />

            {/* ===== house cluster perched ON THE SUMMIT (warm pastels) ===== */}
            <rect x="116" y="60" width="16" height="36" fill="#e89a4e" />
            <rect x="116" y="57" width="16" height="4" fill="#a9482f" />
            <rect x="132" y="50" width="16" height="46" fill="#dd6f5a" />
            <rect x="132" y="47" width="16" height="4" fill="#8c3b2a" />
            <rect x="148" y="64" width="15" height="32" fill="#ecc164" />
            <rect x="148" y="61" width="15" height="4" fill="#a9482f" />
            <rect x="100" y="70" width="16" height="26" fill="#e3a35c" />
            <rect x="100" y="67" width="16" height="4" fill="#a9482f" />
            <rect x="163" y="70" width="15" height="26" fill="#d98a86" />
            <rect x="163" y="67" width="15" height="4" fill="#8c3b2a" />
            {/* right-edge shadow on the tall house for depth */}
            <rect x="128" y="50" width="4" height="46" fill="#000000" opacity="0.12" />
            {/* windows + door on the cluster */}
            <rect x="122" y="68" width="3" height="4" fill="var(--win)" />
            <rect x="122" y="80" width="3" height="4" fill="var(--win)" />
            <rect x="138" y="58" width="3" height="4" fill="var(--win)" />
            <rect x="138" y="72" width="3" height="4" fill="var(--win)" />
            <rect x="138" y="86" width="3" height="4" fill="var(--win)" />
            <rect x="153" y="72" width="3" height="4" fill="var(--win)" />
            <rect x="137" y="86" width="5" height="10" fill="#3a2418" />

            {/* church San Pietro — bell tower crowning the summit */}
            <rect x="150" y="30" width="11" height="22" fill="#ded0ad" />
            <rect x="150" y="38" width="11" height="3" fill="#9c8f6b" />
            <rect x="153" y="34" width="3" height="4" fill="var(--win)" />
            <path d="M149,30 L155.5,19 L162,30 Z" fill="#9c4128" />

            {/* ===== name pennant — thin pole on the San Pietro bell tower,
                tiny triangular flag in oker/terracotta + gold with a faint
                antler hint (Gens Cornelia, the deer). Small & elegant. ===== */}
            {/* thin pole rising from the tower roof peak — lowered a touch so the
                flag tip and the name below stay fully inside the scene's top edge */}
            <rect x="155" y="10" width="1" height="16" fill="#7a5a3a" />
            <circle cx="155.5" cy="10" r="1" fill="#ecc15a" />
            {/* triangular pennant (terracotta/oker) flying right from the pole */}
            <path d="M156,11.5 L170,15 L156,18.5 Z" fill="#e3a35c" />
            {/* gold band along the hoist + a thin gold tip line */}
            <path d="M156,11.5 L158.5,12.1 L158.5,17.9 L156,18.5 Z" fill="#ecc15a" />
            {/* faint gold antler hint on the pennant field */}
            <path d="M161.5,15.2 L162.6,13.6 M162.6,13.6 L161.9,13.2 M162.6,13.6 L163.6,13.4
                     M163.8,15.4 L165,13.9 M165,13.9 L164.4,13.4 M165,13.9 L166,13.7"
                  stroke="#ecc15a" strokeWidth="0.4" fill="none" opacity="0.85" strokeLinecap="round" />
            {/* CORNIGLIA in tiny caps under the pennant, paper-cut legible */}
            <text x="155.5" y="23" fontSize="4" fontWeight="700" letterSpacing="0.3"
                  textAnchor="middle" fill="#8c3b2a"
                  fontFamily="ui-sans-serif, system-ui, sans-serif">CORNIGLIA</text>

            {/* a few more houses cascading just below the crown */}
            <rect x="86" y="80" width="14" height="22" fill="#e8b06a" />
            <rect x="86" y="77" width="14" height="3.2" fill="#a9482f" />
            <rect x="91" y="86" width="3" height="4" fill="var(--win)" />
            <rect x="180" y="76" width="14" height="26" fill="#d98a6e" />
            <rect x="180" y="73" width="14" height="3.2" fill="#8c3b2a" />
            <rect x="185" y="83" width="3" height="4" fill="var(--win)" />
            <rect x="73" y="92" width="13" height="18" fill="#e3793a" />
            <rect x="73" y="89" width="13" height="3.2" fill="#8c3b2a" />
            <rect x="78" y="98" width="3" height="4" fill="var(--win)" />
            <rect x="194" y="90" width="13" height="20" fill="#ecc15a" />
            <rect x="194" y="87" width="13" height="3.2" fill="#a9482f" />
            <rect x="199" y="97" width="3" height="4" fill="var(--win)" />

            {/* green veil + ground to seat the village in the scene */}
            <rect x="-25" y="222" width="330" height="38" fill="url(#mtnGreen)" />
          </g>
    </>
  );
}
