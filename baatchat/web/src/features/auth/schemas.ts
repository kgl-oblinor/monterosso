import { z } from "zod";

// Small, focused form schemas. Validation here is for UX; the backend is the source of
// truth. Copy is Norwegian to match the branded UI.

export const emailSchema = z
  .string()
  .min(1, "E-post er påkrevd")
  .email("Oppgi en gyldig e-postadresse");

export const orgNumberSchema = z
  .string()
  .min(1, "Organisasjonsnummer er påkrevd")
  .regex(/^\d{9}$/, "Organisasjonsnummer er 9 sifre");

export const passwordSchema = z.string().min(8, "Minst 8 tegn");

export const loginForm = z.object({
  email: emailSchema,
  password: z.string().min(1, "Passord er påkrevd"),
});
export type LoginForm = z.infer<typeof loginForm>;

// Claim step 1 — identify the existing Oblinor account. Investors by email, loaners by
// org number. The right field is validated based on the chosen role.
export const claimStartForm = z
  .object({
    role: z.enum(["investor", "loaner"], { required_error: "Velg en rolle" }),
    email: z.string().optional(),
    orgNumber: z.string().optional(),
  })
  .superRefine((val, ctx) => {
    if (val.role === "investor") {
      const r = emailSchema.safeParse(val.email);
      if (!r.success)
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["email"], message: r.error.issues[0].message });
    } else if (val.role === "loaner") {
      const r = orgNumberSchema.safeParse(val.orgNumber);
      if (!r.success)
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["orgNumber"], message: r.error.issues[0].message });
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
