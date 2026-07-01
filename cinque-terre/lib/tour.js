// Den ene turen som tilbys. Pris per billett i hele dollar.
export const tour = {
  name: "Monterosso · Cinque Terre — sea tour",
  tagline: "The Cinque Terre, seen from the water.",
  description: "Three unhurried hours on the Ligurian blue — hidden coves, swims in clear water, an aperitivo at golden hour, and a skipper who is yours alone.",
  priceUsd: 100,
  unit: "per guest",
  durationHours: 3,
  maxGuests: 8,
  // The three daily departures. priceMultiplier scales priceUsd per guest;
  // start/end (HHMMSS) feed the add-to-calendar event for that slot.
  // Windows are non-overlapping so the receipt's "next departure" guess always
  // lands on exactly one real slot (Europe/Rome time).
  slots: {
    sunrise: { label: "Sunrise", window: "07:00–09:00", start: "070000", end: "090000", priceMultiplier: 1.5 },
    sunshine: { label: "Sunshine", window: "10:00–14:00", start: "100000", end: "140000", priceMultiplier: 1 },
    sunset: { label: "Sunset", window: "17:00–20:00", start: "170000", end: "200000", priceMultiplier: 1 },
  },
  phone: "+47 93 00 86 00",
  // inbox used by the "Email" send option
  email: "kgl@oblinor.no",
};

// The one meeting point, shown consistently everywhere (receipt, confirmation,
// customer service). The customer always departs from here.
export const MEETING_POINT = "Molo dei Pescatori, Monterosso";

// The skipper's display name. Empty = neutral ("the captain") for now;
// Kristian fills in the real name later via admin.
export const SKIPPER_NAME = "";

// WhatsApp is the primary booking channel (wa.me/<number>). Digits only, no "+".
// TEST: Kristians italienske nummer (så han kan teste booking→kontakt på seg selv).
// TODO: bytt til Andreas ekte WhatsApp-nummer før ekte lansering.
export const WHATSAPP_NUMBER = "393447058636";
