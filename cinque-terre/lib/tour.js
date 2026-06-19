// Den ene turen som tilbys. Pris per billett i hele dollar.
export const tour = {
  name: "Monterosso · Cinque Terre — sea tour",
  tagline: "The Cinque Terre, seen from the water.",
  description: "Three unhurried hours on the Ligurian blue — hidden coves, swims in clear water, an aperitivo at golden hour, and a skipper who's yours alone.",
  priceUsd: 100,
  unit: "per guest",
  durationHours: 3,
  maxGuests: 8,
  // The two daily departures. priceMultiplier scales priceUsd per guest;
  // start/end (HHMMSS) feed the add-to-calendar event for that slot.
  slots: {
    sunrise: { label: "Sunrise", window: "07:00–09:00", start: "070000", end: "090000", priceMultiplier: 1.5 },
    sunshine: { label: "Sunshine", window: "09:00–18:00", start: "090000", end: "180000", priceMultiplier: 1 },
    sunset: { label: "Sunset", window: "14:00–20:00", start: "140000", end: "200000", priceMultiplier: 1 },
  },
  phone: "+47 93 00 86 00",
  // inbox used by the "Email" send option
  email: "kgl@oblinor.no",
};
