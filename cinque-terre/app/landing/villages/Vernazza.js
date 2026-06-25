// Vernazza — one Cinque Terre village for the Skyline scene. Rendered INSIDE the
// shared <svg>/<defs> (gradients #hillGrad/#rockGrad/#mtnGreen, #cypress, #bush)
// provided by Skyline.js. Keep the outer <g transform="translate(X,0)"> position.
export default function Vernazza() {
  return (
    <>
          {/* ===================== VERNAZZA ===================== */}
          <g transform="translate(330,0)">
            {/* hills + the dramatic cliff headland the tower sits on */}
            <path d="M-30,260 Q20,212 82,216 Q124,221 150,260 Z" fill="url(#hillGrad)" />
            <path d="M148,260 Q172,200 196,124 Q214,128 230,168 Q246,210 258,260 Z" fill="url(#rockGrad)" />
            <use href="#bush" transform="translate(40,214)" />
            <use href="#cypress" transform="translate(20,216) scale(0.9)" />

            {/* ICONIC: round Doria/Belforte tower crowning the cliff over the harbor */}
            <rect x="196" y="92" width="26" height="74" fill="#9a9486" />
            <rect x="196" y="92" width="13" height="74" fill="#aaa498" />
            <rect x="222" y="92" width="4" height="74" fill="#000000" opacity="0.18" />
            <path d="M194,94 a15,9 0 0 1 30,0 Z" fill="#aaa498" />
            {/* crenellations on top */}
            <rect x="194" y="86" width="6" height="9" fill="#76705f" />
            <rect x="204" y="86" width="6" height="9" fill="#76705f" />
            <rect x="214" y="86" width="6" height="9" fill="#76705f" />
            {/* tower windows */}
            <rect x="206" y="112" width="5" height="8" fill="var(--win)" />
            <rect x="206" y="132" width="5" height="8" fill="var(--win)" />

            {/* ===== NAME PENNANT crowning the round tower ===== */}
            {/* thin flagpole rising from the tower top */}
            <rect x="208.4" y="64" width="1.6" height="24" fill="#5a5246" />
            <circle cx="209.2" cy="64" r="1.5" fill="#ecc15a" />
            {/* triangular azure pennant with Vernazza arms: gold crescent + three gold bars */}
            <path d="M210,66 L231,70 L210,74 Z" fill="#1c5fa8" />
            <path d="M210,66 L231,70 L210,74 Z" fill="none" stroke="#13447c" strokeWidth="0.6" />
            {/* gold crescent (capo) */}
            <path d="M213,68.2 a1.5,1.5 0 1 0 1.6,1.1 a1.15,1.15 0 1 1 -1.6,-1.1 Z" fill="#ecc15a" />
            {/* three gold bars (fasce) */}
            <rect x="212.4" y="70.4" width="13" height="0.7" fill="#ecc15a" />
            <rect x="212" y="71.5" width="11.4" height="0.7" fill="#ecc15a" />
            <rect x="211.6" y="72.6" width="9.6" height="0.7" fill="#ecc15a" />
            {/* VERNAZZA name in tiny paper-cut capitals under the pennant */}
            <text x="209" y="82" textAnchor="middle" fontFamily="Georgia, serif" fontSize="5.2" fontWeight="700" letterSpacing="0.4" fill="#13447c">VERNAZZA</text>

            {/* small octagonal bell tower — Santa Margherita, on the left */}
            <rect x="30" y="172" width="14" height="88" fill="#d9c59b" />
            <rect x="30" y="186" width="14" height="3" fill="#b7a079" />
            <rect x="35" y="178" width="4" height="6" fill="#2b3a40" />
            <path d="M28,172 a9,9 0 0 1 18,0 Z" fill="#7e8e88" />
            <rect x="36" y="150" width="2" height="9" fill="#7e8e88" />

            {/* ===== AMPHITHEATER of pastel houses wrapping the harbor ===== */}
            {/* left arm of the half-circle — tall, rising toward the bell tower */}
            <rect x="44" y="206" width="16" height="54" fill="#e89a4e" />
            <rect x="44" y="203" width="16" height="4" fill="#a9482f" />
            <rect x="60" y="196" width="16" height="64" fill="#dd6f7e" />
            <rect x="60" y="193" width="16" height="4" fill="#8c3b2a" />
            <rect x="76" y="208" width="15" height="52" fill="#f0c95a" />
            <rect x="76" y="205" width="15" height="4" fill="#a9482f" />
            <rect x="92" y="214" width="15" height="46" fill="#e8744a" />
            <rect x="92" y="211" width="15" height="4" fill="#8c3b2a" />
            {/* center-front — lowest houses, fronting the harbor square */}
            <rect x="108" y="222" width="15" height="38" fill="#f2b06a" />
            <rect x="108" y="219" width="15" height="4" fill="#a9482f" />
            <rect x="123" y="220" width="15" height="40" fill="#ef9d8a" />
            <rect x="123" y="217" width="15" height="4" fill="#8c3b2a" />
            {/* right arm rising toward the cliff/tower */}
            <rect x="138" y="212" width="15" height="48" fill="#f0c54e" />
            <rect x="138" y="209" width="15" height="4" fill="#a9482f" />
            <rect x="153" y="204" width="16" height="56" fill="#e8895e" />
            <rect x="153" y="201" width="16" height="4" fill="#8c3b2a" />
            <rect x="169" y="210" width="15" height="50" fill="#e0808e" />
            <rect x="169" y="207" width="15" height="4" fill="#8c3b2a" />

            {/* right-edge depth shadows */}
            <rect x="56" y="196" width="4" height="64" fill="#000000" opacity="0.12" />
            <rect x="87" y="208" width="4" height="52" fill="#000000" opacity="0.12" />
            <rect x="134" y="220" width="4" height="40" fill="#000000" opacity="0.12" />
            <rect x="165" y="204" width="4" height="56" fill="#000000" opacity="0.12" />

            {/* windows scattered across the amphitheater */}
            <rect x="50" y="214" width="3" height="4" fill="var(--win)" />
            <rect x="66" y="206" width="3" height="4" fill="var(--win)" />
            <rect x="66" y="222" width="3" height="4" fill="var(--win)" />
            <rect x="82" y="218" width="3" height="4" fill="var(--win)" />
            <rect x="98" y="224" width="3" height="4" fill="var(--win)" />
            <rect x="114" y="230" width="3" height="4" fill="var(--win)" />
            <rect x="129" y="228" width="3" height="4" fill="var(--win)" />
            <rect x="144" y="222" width="3" height="4" fill="var(--win)" />
            <rect x="159" y="214" width="3" height="4" fill="var(--win)" />
            <rect x="159" y="228" width="3" height="4" fill="var(--win)" />
            <rect x="175" y="220" width="3" height="4" fill="var(--win)" />

            {/* doors opening onto the harbor square */}
            <rect x="113" y="248" width="6" height="12" fill="#3a2418" />
            <rect x="128" y="248" width="6" height="12" fill="#3a2418" />
            <rect x="48" y="248" width="5" height="12" fill="#3a2418" />

            {/* a couple of low houses tucked at the foot, near the water */}
            <rect x="12" y="240" width="15" height="20" fill="#e0907e" />
            <rect x="12" y="237" width="15" height="3.2" fill="#8c3b2a" />
            <rect x="17" y="245" width="3" height="4" fill="var(--win)" />
            <rect x="184" y="238" width="15" height="22" fill="#cf7a52" />
            <rect x="184" y="235" width="15" height="3.2" fill="#8c3b2a" />
            <rect x="189" y="244" width="3" height="4" fill="var(--win)" />

            {/* green veil */}
            <rect x="-30" y="222" width="286" height="38" fill="url(#mtnGreen)" />
          </g>
    </>
  );
}
