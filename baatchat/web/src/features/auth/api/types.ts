// Auth API contracts — match the backend's account-onboarding flow:
//   register/start  (email OR reservationCode) → sends a code to the on-file email
//   register/complete (identifier + code + password) → creates the account, returns a JWT
//   login (email + password) → returns a JWT
// name/role come from the booking data, not the form.

export type UserRole = "skipper" | "customer" | "admin";

export interface AuthUser {
  id?: number;
  email: string;
  name?: string | null;
  role?: UserRole;
}

export interface LoginInput {
  email: string;
  password: string;
}

/** Passwordless entry — one identifier (email OR phone) is enough. The main way in. */
export interface PasswordlessInput {
  email?: string;
  phone?: string;
}

/** Identifier for the onboarding flow: by email, by phone/WhatsApp, or by reservation
 *  code (customers). One of them is enough — no friction. */
export interface RegisterStartInput {
  email?: string;
  phone?: string;
  reservationCode?: string;
}

export interface RegisterCompleteInput extends RegisterStartInput {
  code: string;
  password: string;
}

export type AccountStatus = "pending" | "active" | "suspended";

export interface AuthResult {
  token: string;
  user: AuthUser;
  /** Approval status (customers/skippers). Undefined for admins. */
  status?: AccountStatus;
}

export interface MeResult {
  user: AuthUser;
  status: AccountStatus;
  emailVerified: boolean;
}

/** A read-only look at an invite, for the /join landing. */
export interface InvitePreview {
  reservationCode: string;
  tripDate: string | null;
  invitedEmail: string | null;
  invitedPhone: string | null;
  used: boolean;
}

/** Joining via an invite: passwordless entry + group membership. */
export interface JoinInput {
  invite: string;
  email?: string;
  phone?: string;
}

export interface JoinResult extends AuthResult {
  reservationCode: string;
}

export interface StartResult {
  /** Masked on-file email the code was sent to, or null (generic — no account match). */
  sentTo: string | null;
}
