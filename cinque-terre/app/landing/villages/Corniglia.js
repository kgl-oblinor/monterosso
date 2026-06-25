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
            {/* tall, steep cliff peak rising to the summit — base eased into soft
                curves at both flanks so it meets the sea gently, not vertically */}
            <path d="M-50,260 Q-12,250 28,244 Q70,182 110,46 Q150,18 190,48 Q232,184 274,244 Q314,250 312,260 Z" fill="url(#hillGrad)" />
            {/* terraced-vineyard lines (fasce) sweeping down both flanks — exaggerated */}
            <path d="M22,232 Q150,196 278,234" stroke="var(--terrace2)" strokeWidth="3.4" fill="none" opacity="0.95" />
            <path d="M14,216 Q150,176 286,218" stroke="var(--terrace)" strokeWidth="3.2" fill="none" opacity="0.95" />
            <path d="M26,198 Q150,154 272,200" stroke="var(--terrace2)" strokeWidth="3" fill="none" opacity="0.9" />
            <path d="M38,180 Q150,134 258,182" stroke="var(--terrace)" strokeWidth="2.8" fill="none" opacity="0.9" />
            <path d="M52,160 Q150,114 244,162" stroke="var(--terrace2)" strokeWidth="2.6" fill="none" opacity="0.85" />
            <path d="M66,140 Q150,98 230,142" stroke="var(--terrace)" strokeWidth="2.4" fill="none" opacity="0.85" />
            <path d="M82,120 Q150,86 214,122" stroke="var(--terrace2)" strokeWidth="2.2" fill="none" opacity="0.8" />
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
                so the houses are grounded on the ridge, not floating on the peak */}
            <path d="M88,98 Q150,90 208,98 L208,96 Q150,86 88,96 Z" fill="url(#rockGrad)" />
            <path d="M90,96 Q150,88 206,96 L206,94 Q150,85 90,94 Z" fill="url(#hillGrad)" opacity="0.85" />

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
