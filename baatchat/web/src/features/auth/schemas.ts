import { z } from "zod";

import type { TFunction } from "@/i18n";

// Small, focused form schemas. Validation here is for UX; the backend is the source of
// truth. Messages are localized: each schema is a FACTORY that takes the active `t` so the
// zod messages render in the signed-in user's language. Build them inside the component.

const makeEmailSchema = (t: TFunction) =>
  z
    .string()
    .min(1, t("auth.validation.emailRequired"))
    .email(t("auth.validation.emailInvalid"));

// Reservation code, e.g. "MT-210625-2" (prefix-DDMMYY-guests). Loose validation — the
// backend is the source of truth; we just require a non-trivial code.
const makeReservationCodeSchema = (t: TFunction) =>
  z
    .string()
    .min(1, t("auth.validation.reservationRequired"))
    .regex(/^[A-Za-z]{2,}-\d{6}-\d+$/, t("auth.validation.reservationInvalid"));

// Phone / WhatsApp. Loose: a leading + and 6–20 digits (spaces/dashes/parens allowed).
const makePhoneSchema = (t: TFunction) =>
  z
    .string()
    .min(1, t("auth.validation.phoneRequired"))
    .regex(/^[+\d][\d\s().-]{5,19}$/, t("auth.validation.phoneInvalid"));

const makePasswordSchema = (t: TFunction) => z.string().min(8, t("auth.validation.passwordMin"));

export const makeLoginSchema = (t: TFunction) =>
  z.object({
    email: makeEmailSchema(t),
    password: z.string().min(1, t("auth.validation.passwordRequired")),
  });
export type LoginForm = z.infer<ReturnType<typeof makeLoginSchema>>;

// Passwordless entry — the main way in. ONE field that accepts either an email OR a
// phone/WhatsApp number. We sniff which one it is; the backend is the source of truth.
const looksLikeEmail = (v: string) => v.includes("@");
export const makePasswordlessSchema = (t: TFunction) =>
  z.object({
    contact: z
      .string()
      .min(1, t("auth.validation.contactRequired"))
      .refine(
        (v) =>
          looksLikeEmail(v)
            ? makeEmailSchema(t).safeParse(v).success
            : makePhoneSchema(t).safeParse(v).success,
        t("auth.validation.contactInvalid")
      ),
  });
export type PasswordlessForm = z.infer<ReturnType<typeof makePasswordlessSchema>>;

/** Split the single contact field into an {email} or {phone} payload for the API. */
export function toPasswordlessInput(contact: string): { email?: string; phone?: string } {
  const v = contact.trim();
  return looksLikeEmail(v) ? { email: v } : { phone: v };
}

// Onboarding step 1 — identify the account. Three frictionless ways in: a customer can
// use their email, their phone/WhatsApp, OR their reservation code; a skipper uses their
// on-file email. The right field is validated based on the chosen identifier mode.
export const makeClaimStartSchema = (t: TFunction) =>
  z
    .object({
      mode: z.enum(["email", "phone", "reservation"], {
        required_error: t("auth.validation.methodRequired"),
      }),
      email: z.string().optional(),
      phone: z.string().optional(),
      reservationCode: z.string().optional(),
    })
    .superRefine((val, ctx) => {
      if (val.mode === "email") {
        const r = makeEmailSchema(t).safeParse(val.email);
        if (!r.success)
          ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["email"], message: r.error.issues[0].message });
      } else if (val.mode === "phone") {
        const r = makePhoneSchema(t).safeParse(val.phone);
        if (!r.success)
          ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["phone"], message: r.error.issues[0].message });
      } else if (val.mode === "reservation") {
        const r = makeReservationCodeSchema(t).safeParse(val.reservationCode);
        if (!r.success)
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["reservationCode"],
            message: r.error.issues[0].message,
          });
      }
    });
export type ClaimStartForm = z.infer<ReturnType<typeof makeClaimStartSchema>>;

// Claim step 2 / password reset — enter the code and set a password.
export const makeCodePasswordSchema = (t: TFunction) =>
  z.object({
    code: z
      .string()
      .length(6, t("auth.validation.codeLength"))
      .regex(/^\d{6}$/, t("auth.validation.codeDigits")),
    password: makePasswordSchema(t),
  });
export type CodePasswordForm = z.infer<ReturnType<typeof makeCodePasswordSchema>>;

// Forgot-password step 1 — identify by email (works for both roles).
export const makeForgotPasswordSchema = (t: TFunction) => z.object({ email: makeEmailSchema(t) });
export type ForgotPasswordForm = z.infer<ReturnType<typeof makeForgotPasswordSchema>>;

// Admin recovery step 2 — just the 6-digit code (no password; admins have no per-user one).
export const makeCodeSchema = (t: TFunction) =>
  z.object({
    code: z
      .string()
      .length(6, t("auth.validation.codeLength"))
      .regex(/^\d{6}$/, t("auth.validation.codeDigits")),
  });
export type CodeForm = z.infer<ReturnType<typeof makeCodeSchema>>;
