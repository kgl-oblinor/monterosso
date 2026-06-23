import { z } from "zod";

// Small, focused form schemas. Validation here is for UX; the backend is the source of
// truth. Copy is Norwegian to match the branded UI.

export const emailSchema = z
  .string()
  .min(1, "E-post er påkrevd")
  .email("Oppgi en gyldig e-postadresse");

// Reservation code, e.g. "MT-210625-2" (prefix-DDMMYY-guests). Loose validation — the
// backend is the source of truth; we just require a non-trivial code.
export const reservationCodeSchema = z
  .string()
  .min(1, "Reservasjonskode er påkrevd")
  .regex(/^[A-Za-z]{2,}-\d{6}-\d+$/, "Ugyldig reservasjonskode (f.eks. MT-210625-2)");

// Phone / WhatsApp. Loose: a leading + and 6–20 digits (spaces/dashes/parens allowed).
export const phoneSchema = z
  .string()
  .min(1, "Telefonnummer er påkrevd")
  .regex(/^[+\d][\d\s().-]{5,19}$/, "Oppgi et gyldig telefonnummer");

export const passwordSchema = z.string().min(8, "Minst 8 tegn");

export const loginForm = z.object({
  email: emailSchema,
  password: z.string().min(1, "Passord er påkrevd"),
});
export type LoginForm = z.infer<typeof loginForm>;

// Onboarding step 1 — identify the account. Three frictionless ways in: a customer can
// use their email, their phone/WhatsApp, OR their reservation code; a skipper uses their
// on-file email. The right field is validated based on the chosen identifier mode.
export const claimStartForm = z
  .object({
    mode: z.enum(["email", "phone", "reservation"], { required_error: "Velg en metode" }),
    email: z.string().optional(),
    phone: z.string().optional(),
    reservationCode: z.string().optional(),
  })
  .superRefine((val, ctx) => {
    if (val.mode === "email") {
      const r = emailSchema.safeParse(val.email);
      if (!r.success)
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["email"], message: r.error.issues[0].message });
    } else if (val.mode === "phone") {
      const r = phoneSchema.safeParse(val.phone);
      if (!r.success)
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["phone"], message: r.error.issues[0].message });
    } else if (val.mode === "reservation") {
      const r = reservationCodeSchema.safeParse(val.reservationCode);
      if (!r.success)
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["reservationCode"], message: r.error.issues[0].message });
    }
  });
export type ClaimStartForm = z.infer<typeof claimStartForm>;

// Claim step 2 / password reset — enter the code and set a password.
export const codePasswordForm = z.object({
  code: z.string().length(6, "Oppgi den 6-sifrede koden").regex(/^\d{6}$/, "Koden er 6 sifre"),
  password: passwordSchema,
});
export type CodePasswordForm = z.infer<typeof codePasswordForm>;

// Forgot-password step 1 — identify by email (works for both roles).
export const forgotPasswordForm = z.object({ email: emailSchema });
export type ForgotPasswordForm = z.infer<typeof forgotPasswordForm>;

// Admin recovery step 2 — just the 6-digit code (no password; admins have no per-user one).
export const codeForm = z.object({
  code: z.string().length(6, "Oppgi den 6-sifrede koden").regex(/^\d{6}$/, "Koden er 6 sifre"),
});
export type CodeForm = z.infer<typeof codeForm>;
