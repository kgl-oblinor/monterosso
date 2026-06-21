// Resolve a Norwegian matrikkel (kommune + gnr/bnr) into a street address using
// Kartverket's free, no-auth Geonorge address API. Ported from the reference
// backend (oblinor-chat-backend/src/address/{kartverket,resolve}.ts), trimmed to
// Kartverket-only — we only need the street address string, not PlacePoint's
// zip/city/coords enrichment.
//
// Docs: https://ws.geonorge.no/adresser/v1/#/default/get_sok

const BASE = "https://ws.geonorge.no/adresser/v1/sok";

interface KvAddress {
  adressetekst: string | null; // "Horpenveien 12"
  kommunenummer: string | null; // current 4-digit code
  kommunenavn: string | null;
}

const FILTER = "adresser.adressetekst,adresser.kommunenummer,adresser.kommunenavn";

// Known pre-2024 → current kommune code renames that appear in Oblinor data.
const STALE_CODE_MAP: Record<string, string> = {
  "3005": "3301", // Drammen
  "3006": "3303", // Kongsberg
  "3024": "3201", // Bærum
  "3049": "3312", // Lier
  "3807": "4003", // Skien
};

// First two digits of a kommune code are the fylke — lets us tell a real leading
// kommune code apart from a 4-digit gnr.
const FYLKE = new Set([
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 15, 16, 17, 18, 19, 20, 30, 31, 32,
  33, 34, 38, 39, 40, 42, 46, 50, 54, 55, 56,
]);

const isKommuneCode = (n: number) =>
  Number.isInteger(n) && n >= 101 && n <= 5699 && FYLKE.has(Math.floor(n / 100));
const normCode = (n: number) => String(n).padStart(4, "0");
const is4DigitCode = (s: string) => /^\d{4}$/.test(s);

interface ParsedMatrikkel {
  kommune: string | null; // 4-digit code embedded in gr_br, if any
  gnr: number;
  bnr: number;
}

function parseMatrikkel(grBr: string | null): ParsedMatrikkel | null {
  if (!grBr) return null;
  const raw = String(grBr).trim();

  // Only a leading "NNNN-" (4-digit code + dash) is a kommune prefix. Pure
  // matrikkels use '/' between parts ("233/120/2" is gnr/bnr/seksjon).
  let kommune: string | null = null;
  let rest = raw;
  const pre = raw.match(/^(\d{4})-(.+)$/);
  if (pre && isKommuneCode(parseInt(pre[1], 10))) {
    kommune = normCode(parseInt(pre[1], 10));
    rest = pre[2];
  }

  const tokens = rest
    .split(/[/\-]/)
    .map((t) => parseInt(t.trim(), 10))
    .filter((n) => Number.isFinite(n));
  if (tokens.length < 2) return null;
  const [gnr, bnr] = tokens;
  if (!Number.isFinite(gnr) || !Number.isFinite(bnr)) return null;
  return { kommune, gnr, bnr };
}

async function searchByCadastre(opts: {
  kommunenummer?: string;
  gnr: number;
  bnr: number;
}): Promise<KvAddress[]> {
  const params: Record<string, string> = {
    gardsnummer: String(opts.gnr),
    bruksnummer: String(opts.bnr),
    treffPerSide: "20",
    filtrer: FILTER,
  };
  if (opts.kommunenummer) params.kommunenummer = opts.kommunenummer;
  const res = await fetch(`${BASE}?${new URLSearchParams(params)}`);
  if (!res.ok) {
    throw new Error(`kartverket ${res.status}: ${(await res.text()).slice(0, 150)}`);
  }
  const data = (await res.json()) as { adresser?: KvAddress[] };
  return Array.isArray(data.adresser) ? data.adresser : [];
}

// Oblinor stores the kommune as "0301 Oslo" (code + name), but sometimes as a bare
// code or bare name. Split into whichever parts are present so both can hint.
function parseKommuneField(county: string | null): { code: string | null; name: string | null } {
  const raw = (county ?? "").trim();
  if (!raw) return { code: null, name: null };
  const lead = raw.match(/^(\d{4})\b\s*(.*)$/);
  if (lead) {
    const n = parseInt(lead[1], 10);
    const code = isKommuneCode(n) ? normCode(n) : lead[1];
    return { code: STALE_CODE_MAP[code] ?? code, name: lead[2].trim() || null };
  }
  if (is4DigitCode(raw)) return { code: STALE_CODE_MAP[raw] ?? raw, name: null };
  return { code: null, name: raw };
}

function normName(s: string): string {
  return s.toLowerCase().replace(/\s*kommune$/, "").trim();
}

// Disambiguate when a nationwide gnr/bnr search hits multiple kommuner.
function pickKommune(
  rows: KvAddress[],
  hints: { codes: string[]; name: string | null }
): KvAddress | null {
  if (!rows.length) return null;
  for (const code of hints.codes) {
    const byCode = rows.find((r) => r.kommunenummer === code);
    if (byCode) return byCode;
  }
  const hasNameHint = Boolean(hints.name && !is4DigitCode(hints.name));
  if (hasNameHint) {
    const n = normName(hints.name as string);
    const byName = rows.find((r) => r.kommunenavn && normName(r.kommunenavn) === n);
    if (byName) return byName;
  }
  // The hint code/name didn't match a row — common because Oblinor carries the old
  // 2020-2023 Viken kommune codes while Kartverket uses the 2024 codes. If the
  // gnr/bnr nevertheless resolves to exactly ONE kommune nationwide, that's the
  // property; only a genuinely ambiguous gnr/bnr (several kommuner) stays unresolved.
  const distinct = new Set(rows.map((r) => r.kommunenummer).filter(Boolean));
  if (distinct.size === 1) return rows[0];
  return null;
}

// Returns the resolved street address, or null if it can't be determined.
export async function resolveAddress(
  grBr: string | null,
  county: string | null
): Promise<string | null> {
  const m = parseMatrikkel(grBr);
  if (!m) return null;

  const { code: countyCode, name: countyName } = parseKommuneField(county);

  const candidateCodes: string[] = [];
  if (m.kommune) candidateCodes.push(STALE_CODE_MAP[m.kommune] ?? m.kommune);
  if (countyCode && !candidateCodes.includes(countyCode)) candidateCodes.push(countyCode);

  // 1. Scoped lookups by candidate code, then 2. nationwide fallback.
  let rows: KvAddress[] = [];
  for (const code of candidateCodes) {
    rows = await searchByCadastre({ kommunenummer: code, gnr: m.gnr, bnr: m.bnr });
    if (rows.length) break;
  }
  if (!rows.length) rows = await searchByCadastre({ gnr: m.gnr, bnr: m.bnr });

  const kv = pickKommune(rows, { codes: candidateCodes, name: countyName });
  return kv?.adressetekst ?? null;
}
