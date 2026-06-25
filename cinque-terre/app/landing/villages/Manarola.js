// Manarola — one Cinque Terre village for the Skyline scene. Rendered INSIDE the
// shared <svg>/<defs> (gradients #hillGrad/#rockGrad/#mtnGreen, #cypress, #bush)
// provided by Skyline.js. Keep the outer <g transform="translate(X,0)"> position.
export default function Manarola() {
  return (
    <>
          {/* ===================== MANAROLA ===================== */}
          {/* Iconic: colorful houses STACKED UP the steep cliff over a tiny harbour.
              Amplified: a tall vertical wall of tightly packed, varied-height
              pink/yellow/coral/orange houses climbing the rock; deep-blue cove with
              boats below; San Lorenzo church with rose window crowns the ridge. */}
          <g transform="translate(880,0)">
            {/* steep cliff the town climbs */}
            <path d="M20,260 L20,150 Q60,96 130,108 Q190,120 210,210 L214,260 Z" fill="url(#rockGrad)" />
            <path d="M150,260 Q190,150 236,180 Q252,190 252,260 Z" fill="#4f5a55" />

            {/* deep-blue cove + harbour at the foot of the cliff */}
            <rect x="20" y="248" width="236" height="12" fill="#1f4f6b" />
            <rect x="20" y="252" width="236" height="8" fill="#173f57" />
            <path d="M28,260 Q70,242 116,246 L128,260 Z" fill="#2a5e7d" />
            {/* little boats in the harbour */}
            <ellipse cx="48" cy="255" rx="8" ry="2.4" fill="#d8443a" />
            <rect x="47" y="249" width="1.5" height="6" fill="#7a2f20" />
            <ellipse cx="70" cy="257" rx="8" ry="2.4" fill="#ecc15a" />
            <rect x="69" y="251" width="1.5" height="6" fill="#8c6a22" />
            <ellipse cx="92" cy="255" rx="7" ry="2.2" fill="#e9e4d6" />
            <ellipse cx="112" cy="257" rx="7" ry="2.2" fill="#e3793a" />

            {/* ===== STACKED CLIFF HOUSES — the hero: a vertical column rising ===== */}
            {/* bottom row at the water */}
            <rect x="40" y="226" width="18" height="24" fill="#dd7a86" />
            <rect x="40" y="223" width="18" height="4" fill="#a9482f" />
            <rect x="40" y="226" width="18" height="24" fill="#dd7a86" />
            <rect x="54" y="226" width="4" height="24" fill="#000000" opacity="0.12" />
            <rect x="46" y="233" width="3.5" height="5" fill="var(--win)" />
            <rect x="58" y="220" width="18" height="30" fill="#ecc15a" />
            <rect x="58" y="217" width="18" height="4" fill="#a9482f" />
            <rect x="72" y="220" width="4" height="30" fill="#000000" opacity="0.12" />
            <rect x="63" y="227" width="3.5" height="5" fill="var(--win)" />
            <rect x="63" y="238" width="3.5" height="5" fill="var(--win)" />
            <rect x="76" y="224" width="17" height="26" fill="#e58a6e" />
            <rect x="76" y="221" width="17" height="4" fill="#8c3b2a" />
            <rect x="89" y="224" width="4" height="26" fill="#000000" opacity="0.12" />
            <rect x="81" y="231" width="3.5" height="5" fill="var(--win)" />

            {/* second row, stepped higher */}
            <rect x="50" y="196" width="18" height="32" fill="#e89a4e" />
            <rect x="50" y="193" width="18" height="4" fill="#a9482f" />
            <rect x="64" y="196" width="4" height="32" fill="#000000" opacity="0.12" />
            <rect x="55" y="204" width="3.5" height="5" fill="var(--win)" />
            <rect x="55" y="216" width="3.5" height="5" fill="var(--win)" />
            <rect x="68" y="188" width="19" height="40" fill="#d8443a" />
            <rect x="68" y="185" width="19" height="4" fill="#8c3b2a" />
            <rect x="83" y="188" width="4" height="40" fill="#000000" opacity="0.12" />
            <rect x="73" y="196" width="3.5" height="5" fill="var(--win)" />
            <rect x="73" y="208" width="3.5" height="5" fill="var(--win)" />
            <rect x="73" y="220" width="5" height="8" fill="#3a2418" />
            <rect x="87" y="194" width="18" height="34" fill="#ecc164" />
            <rect x="87" y="191" width="18" height="4" fill="#a9482f" />
            <rect x="101" y="194" width="4" height="34" fill="#000000" opacity="0.12" />
            <rect x="92" y="202" width="3.5" height="5" fill="var(--win)" />
            <rect x="92" y="214" width="3.5" height="5" fill="var(--win)" />

            {/* third row, higher still — pinks + coral */}
            <rect x="60" y="166" width="18" height="32" fill="#dd7a86" />
            <rect x="60" y="163" width="18" height="4" fill="#a9482f" />
            <rect x="74" y="166" width="4" height="32" fill="#000000" opacity="0.12" />
            <rect x="65" y="174" width="3.5" height="5" fill="var(--win)" />
            <rect x="65" y="186" width="3.5" height="5" fill="var(--win)" />
            <rect x="78" y="160" width="19" height="38" fill="#e3793a" />
            <rect x="78" y="157" width="19" height="4" fill="#8c3b2a" />
            <rect x="93" y="160" width="4" height="38" fill="#000000" opacity="0.12" />
            <rect x="83" y="168" width="3.5" height="5" fill="var(--win)" />
            <rect x="83" y="180" width="3.5" height="5" fill="var(--win)" />
            <rect x="97" y="170" width="17" height="28" fill="#e3a35c" />
            <rect x="97" y="167" width="17" height="4" fill="#a9482f" />
            <rect x="110" y="170" width="4" height="28" fill="#000000" opacity="0.12" />
            <rect x="102" y="178" width="3.5" height="5" fill="var(--win)" />

            {/* top cluster near the ridge */}
            <rect x="100" y="138" width="18" height="34" fill="#e58a6e" />
            <rect x="100" y="135" width="18" height="4" fill="#8c3b2a" />
            <rect x="114" y="138" width="4" height="34" fill="#000000" opacity="0.12" />
            <rect x="105" y="146" width="3.5" height="5" fill="var(--win)" />
            <rect x="105" y="158" width="3.5" height="5" fill="var(--win)" />
            <rect x="118" y="148" width="16" height="24" fill="#ecc15a" />
            <rect x="118" y="145" width="16" height="4" fill="#a9482f" />
            <rect x="130" y="148" width="4" height="24" fill="#000000" opacity="0.12" />
            <rect x="123" y="156" width="3.5" height="5" fill="var(--win)" />

            {/* right flank houses tumbling down toward the sea */}
            <rect x="134" y="186" width="17" height="44" fill="#d98a86" />
            <rect x="134" y="183" width="17" height="4" fill="#8c3b2a" />
            <rect x="147" y="186" width="4" height="44" fill="#000000" opacity="0.12" />
            <rect x="139" y="194" width="3.5" height="5" fill="var(--win)" />
            <rect x="139" y="206" width="3.5" height="5" fill="var(--win)" />
            <rect x="151" y="200" width="17" height="34" fill="#e8b06a" />
            <rect x="151" y="197" width="17" height="4" fill="#a9482f" />
            <rect x="164" y="200" width="4" height="34" fill="#000000" opacity="0.12" />
            <rect x="156" y="208" width="3.5" height="5" fill="var(--win)" />
            <rect x="156" y="220" width="3.5" height="5" fill="var(--win)" />
            <rect x="168" y="214" width="16" height="26" fill="#cf7a52" />
            <rect x="168" y="211" width="16" height="3.2" fill="#8c3b2a" />
            <rect x="180" y="214" width="4" height="26" fill="#000000" opacity="0.12" />
            <rect x="173" y="222" width="3.5" height="5" fill="var(--win)" />
            <rect x="184" y="224" width="14" height="20" fill="#e3a35c" />
            <rect x="184" y="221" width="14" height="3.2" fill="#a9482f" />
            <rect x="188" y="231" width="3.5" height="5" fill="var(--win)" />

            {/* Church San Lorenzo with rose window — crowns the ridge */}
            <rect x="118" y="100" width="34" height="50" fill="#ded0ad" />
            <path d="M116,100 L135,76 L154,100 Z" fill="#9c4128" />
            <rect x="124" y="108" width="22" height="6" fill="#1f4f6b" opacity="0.25" />
            <circle cx="135" cy="120" r="8.5" fill="#b3a47e" />
            <circle cx="135" cy="120" r="4" fill="#5f5a44" />
            <rect x="134" y="112" width="2" height="17" fill="#5f5a44" />
            <rect x="127" y="119" width="16" height="2" fill="#5f5a44" />
            <rect x="156" y="116" width="13" height="34" fill="#cfc3a0" />
            <rect x="156" y="124" width="13" height="3" fill="#4f5a55" />
            <rect x="156" y="134" width="13" height="3" fill="#4f5a55" />

            <rect x="20" y="232" width="236" height="28" fill="url(#mtnGreen)" />
            <path d="M28,260 L120,260 Q80,253 32,256 Z" fill="#e6d4a4" />
          </g>
    </>
  );
}
