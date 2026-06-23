// The non-chat sections of the web-app shell. "Turer" renders real reservation data
// (role-filtered by the Worker); the rest are calm "coming soon" / empty states — never
// dead ends, never invented data.
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Compass, Globe, LogOut, Mail, Phone, Receipt, Ship, User, UserPlus, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { useAuthStore } from "@/features/auth/store";
import {
  formatTripDate,
  useMyProfile,
  useMyReservations,
  useUpdateProfile,
  type MyReservation,
} from "../api/threads";
import { InviteDialog } from "./InviteDialog";
import { shortcutsForRole, type SectionKey } from "../sections";

/** Shared frame: a scrollable column with a title, matching the chat shell's tone. */
function SectionFrame({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex min-w-0 flex-1 flex-col">
      <div className="px-6 pb-3 pt-5">
        <h1 className="text-xl font-bold">{title}</h1>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-6">{children}</div>
    </section>
  );
}

/** Calm empty / coming-soon state — an icon, a line, and a quiet hint. No dead end. */
function ComingSoon({ icon: Icon, title, hint }: { icon: LucideIcon; title: string; hint: string }) {
  return (
    <div className="flex h-full flex-col items-center justify-center px-6 text-center">
      <span className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-white/[0.04] text-[#ead27e]">
        <Icon className="size-7" />
      </span>
      <p className="text-sm font-medium text-white/70">{title}</p>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-white/40">{hint}</p>
    </div>
  );
}

const STATUS_LABEL: Record<string, string> = {
  booked: "Bekreftet",
  completed: "Fullført",
  cancelled: "Avlyst",
};

function statusLabel(status: string): string {
  return STATUS_LABEL[status] ?? status;
}

function TripRow({ trip, contactLabel }: { trip: MyReservation; contactLabel: string }) {
  const [inviteOpen, setInviteOpen] = useState(false);
  const canInvite = trip.status !== "cancelled";
  return (
    <li className="flex items-center justify-between gap-4 rounded-xl border border-white/5 bg-white/[0.03] px-4 py-3">
      <div className="min-w-0">
        <div className="flex items-baseline gap-2">
          <span className="font-mono text-sm font-semibold text-white">{trip.code}</span>
          <span className="text-xs text-white/40">{formatTripDate(trip.tripDate)}</span>
        </div>
        <div className="mt-0.5 truncate text-sm text-white/55">
          <span className="text-white/40">{contactLabel}: </span>
          {trip.contactName ?? "—"}
          {trip.guests != null && <span className="text-white/40"> · {trip.guests} gjester</span>}
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {canInvite && (
          <button
            type="button"
            onClick={() => setInviteOpen(true)}
            className="flex items-center gap-1.5 border border-white/10 px-3 py-1.5 text-xs font-medium text-white/65 transition-colors hover:border-[#ead27e]/40 hover:text-[#ead27e]"
          >
            <UserPlus className="size-3.5" />
            <span className="hidden sm:inline">Inviter reisefølget</span>
          </button>
        )}
        <span className="rounded-full bg-white/[0.06] px-3 py-1 text-xs font-medium text-white/70">
          {statusLabel(trip.status)}
        </span>
      </div>
      {inviteOpen && (
        <InviteDialog reservationCode={trip.code} onClose={() => setInviteOpen(false)} />
      )}
    </li>
  );
}

/** "Turer": the user's reservations. Customers see skipper/boat; skippers see the
 *  customer aboard. Same component — the Worker decides the data by role. */
function TripsSection() {
  const role = useAuthStore((s) => s.user?.role);
  const isSkipper = role === "skipper";
  const { data, isLoading, isError } = useMyReservations();
  const title = isSkipper ? "Mine avganger" : "Turer";
  const contactLabel = isSkipper ? "Gjest" : "Skipper";

  return (
    <SectionFrame title={title}>
      {isLoading ? (
        <p className="px-1 py-8 text-sm text-white/40">Laster …</p>
      ) : isError ? (
        <p className="px-1 py-8 text-sm text-red-300">Kunne ikke laste turene.</p>
      ) : !data || data.length === 0 ? (
        <ComingSoon
          icon={Compass}
          title="Ingen turer ennå"
          hint={
            isSkipper
              ? "Når noen bestiller en av avgangene dine, dukker den opp her – med hvem som er ombord."
              : "Når en reservasjon kobles til kontoen din, ser du den her – med skipper, dato og status."
          }
        />
      ) : (
        <ul className="space-y-2">
          {data.map((trip) => (
            <TripRow key={trip.code} trip={trip} contactLabel={contactLabel} />
          ))}
        </ul>
      )}
    </SectionFrame>
  );
}

/** First name only, for a warm greeting. Falls back to the email handle, then a soft default. */
function firstNameOf(name?: string | null, email?: string | null): string {
  const n = name?.trim().split(/\s+/)[0];
  if (n) return n;
  const handle = email?.split("@")[0];
  if (handle) return handle;
  return "venn";
}

/** The soonest upcoming, non-cancelled reservation — the "next trip" on the home screen. */
function nextTripOf(trips: MyReservation[] | undefined): MyReservation | null {
  if (!trips?.length) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const upcoming = trips
    .filter((t) => t.status !== "cancelled" && t.tripDate)
    .filter((t) => new Date(t.tripDate as string).getTime() >= today.getTime())
    .sort((a, b) => (a.tripDate as string).localeCompare(b.tripDate as string));
  return upcoming[0] ?? null;
}

/** "Hjem": a calm overview shown on sign-in for both roles — a warm greeting, the next
 *  trip (if any), and discreet shortcuts into the role's sections. Minimal, on-theme. */
function HomeSection({ onNavigate }: { onNavigate: (key: SectionKey) => void }) {
  const user = useAuthStore((s) => s.user);
  const role = user?.role;
  const isSkipper = role === "skipper";
  const { data, isLoading } = useMyReservations();
  const next = nextTripOf(data);
  const shortcuts = shortcutsForRole(role);
  const contactLabel = isSkipper ? "Gjest" : "Skipper";

  return (
    <section className="flex min-w-0 flex-1 flex-col overflow-y-auto">
      <div className="mx-auto w-full max-w-2xl px-6 py-12 md:py-16">
        <p className="font-serif text-sm uppercase tracking-[0.2em] text-[#ead27e]/80">
          Velkommen ombord
        </p>
        <h1 className="mt-3 text-3xl font-bold leading-tight md:text-4xl">
          God dag, {firstNameOf(user?.name, user?.email)}.
        </h1>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-white/55">
          {isSkipper
            ? "Rolig oversikt over avgangene og samtalene dine. Sjøen venter."
            : "Et stille øyeblikk før turen. Her finner du det viktigste samlet."}
        </p>

        {/* Next trip */}
        <div className="mt-10">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-white/40">
            {isSkipper ? "Neste avgang" : "Neste tur"}
          </h2>
          {isLoading ? (
            <p className="mt-3 text-sm text-white/40">Laster …</p>
          ) : next ? (
            <button
              type="button"
              onClick={() => onNavigate("trips")}
              className="mt-3 flex w-full items-center justify-between gap-4 border border-white/10 bg-white/[0.03] px-5 py-4 text-left transition-colors hover:border-[#ead27e]/30 hover:bg-white/[0.05]"
            >
              <div className="min-w-0">
                <div className="flex items-baseline gap-2">
                  <span className="font-mono text-sm font-semibold text-white">{next.code}</span>
                  <span className="text-xs text-white/45">{formatTripDate(next.tripDate)}</span>
                </div>
                <div className="mt-1 truncate text-sm text-white/55">
                  <span className="text-white/40">{contactLabel}: </span>
                  {next.contactName ?? "—"}
                  {next.guests != null && (
                    <span className="text-white/40"> · {next.guests} gjester</span>
                  )}
                </div>
              </div>
              <span className="shrink-0 text-[#ead27e]">
                <Compass className="size-5" />
              </span>
            </button>
          ) : (
            <p className="mt-3 max-w-md text-sm leading-relaxed text-white/40">
              {isSkipper
                ? "Ingen kommende avganger ennå. Når noen bestiller, dukker den opp her."
                : "Ingen kommende turer ennå. Når en reservasjon kobles til kontoen din, ser du den her."}
            </p>
          )}
        </div>

        {/* Discreet shortcuts */}
        <div className="mt-10">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-white/40">
            Snarveier
          </h2>
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {shortcuts.map(({ key, icon: Icon, label }) => (
              <button
                key={key}
                type="button"
                onClick={() => onNavigate(key)}
                className="flex items-center gap-3 border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-left text-sm text-white/65 transition-colors hover:border-white/15 hover:bg-white/[0.05] hover:text-white"
              >
                <Icon className="size-4 shrink-0 text-[#ead27e]/70" />
                <span className="truncate">{label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/** A single labelled, icon-prefixed field in the profile form. Sharp edges, calm tone. */
function ProfileField({
  icon: Icon,
  label,
  type = "text",
  inputMode,
  autoComplete,
  placeholder,
  value,
  onChange,
}: {
  icon: LucideIcon;
  label: string;
  type?: string;
  inputMode?: "text" | "email" | "tel";
  autoComplete?: string;
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase tracking-wider text-white/40">{label}</span>
      <div className="mt-2 flex items-center gap-3 border border-white/10 bg-white/[0.03] px-4 py-3 transition-colors focus-within:border-[#ead27e]/40">
        <Icon className="size-4 shrink-0 text-[#ead27e]/70" />
        <input
          type={type}
          inputMode={inputMode}
          autoComplete={autoComplete}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="min-w-0 flex-1 bg-transparent text-sm text-white placeholder:text-white/30 focus:outline-none"
        />
      </div>
    </label>
  );
}

/** "Profil": the logged-in user's own contact details — name, email, phone/WhatsApp —
 *  editable and saved to their account. Logout lives here too. Reached via the avatar
 *  at the bottom of the rail. Same component for customer and skipper; the Worker reads
 *  and writes the right tables by role. */
function ProfileSection() {
  const navigate = useNavigate();
  const logout = useAuthStore((s) => s.logout);
  const updateUser = useAuthStore((s) => s.updateUser);
  const { data, isLoading, isError } = useMyProfile();
  const save = useUpdateProfile();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [saved, setSaved] = useState(false);

  // Prime the fields once the server profile loads.
  useEffect(() => {
    if (data) {
      setName(data.name ?? "");
      setEmail(data.email ?? "");
      setPhone(data.phone ?? "");
    }
  }, [data]);

  const onLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const onSave = () => {
    setSaved(false);
    save.mutate(
      { name: name.trim(), email: email.trim(), phone: phone.trim() },
      {
        onSuccess: (profile) => {
          updateUser({ name: profile.name, email: profile.email });
          setSaved(true);
        },
      }
    );
  };

  return (
    <SectionFrame title="Profil">
      {isLoading ? (
        <p className="px-1 py-8 text-sm text-white/40">Laster …</p>
      ) : isError ? (
        <p className="px-1 py-8 text-sm text-red-300">Kunne ikke laste profilen.</p>
      ) : (
        <div className="mx-auto w-full max-w-md">
          <p className="text-sm leading-relaxed text-white/55">
            Detaljene dine. Legg til eller endre, og lagre — så når skipperen deg lett.
          </p>

          <div className="mt-8 space-y-5">
            <ProfileField
              icon={User}
              label="Navn"
              autoComplete="name"
              placeholder="Navnet ditt"
              value={name}
              onChange={(v) => {
                setName(v);
                setSaved(false);
              }}
            />
            <ProfileField
              icon={Mail}
              label="E-post"
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="navn@eksempel.no"
              value={email}
              onChange={(v) => {
                setEmail(v);
                setSaved(false);
              }}
            />
            <ProfileField
              icon={Phone}
              label="Telefon / WhatsApp"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="+47 …"
              value={phone}
              onChange={(v) => {
                setPhone(v);
                setSaved(false);
              }}
            />
          </div>

          {save.isError && (
            <p className="mt-4 text-sm text-red-300">{(save.error as Error).message}</p>
          )}
          {saved && !save.isPending && (
            <p className="mt-4 text-sm text-[#ead27e]">Lagret.</p>
          )}

          <button
            type="button"
            onClick={onSave}
            disabled={save.isPending}
            className="mt-6 w-full border border-[#ead27e]/40 bg-[#ead27e]/15 px-5 py-3 text-sm font-semibold text-[#ead27e] transition-colors hover:bg-[#ead27e]/25 disabled:opacity-50"
          >
            {save.isPending ? "Lagrer …" : "Lagre endringer"}
          </button>

          <button
            type="button"
            onClick={onLogout}
            className="mt-8 flex w-full items-center justify-center gap-2 border border-white/10 px-5 py-3 text-sm text-white/55 transition-colors hover:border-white/20 hover:text-white"
          >
            <LogOut className="size-4" />
            Logg ut
          </button>
        </div>
      )}
    </SectionFrame>
  );
}

/** Renders the active non-chat section. Chat is handled by DashboardLayout itself. */
export function SectionView({
  section,
  onNavigate,
}: {
  section: SectionKey;
  onNavigate: (key: SectionKey) => void;
}) {
  switch (section) {
    case "home":
      return <HomeSection onNavigate={onNavigate} />;
    case "profile":
      return <ProfileSection />;
    case "trips":
      return <TripsSection />;
    case "receipts":
      return (
        <SectionFrame title="Kvitteringer">
          <ComingSoon
            icon={Receipt}
            title="Kvitteringer kommer snart"
            hint="Her samles kvitteringene for turene dine, så du har dem trygt på ett sted."
          />
        </SectionFrame>
      );
    case "otherTrips":
      return (
        <SectionFrame title="Andre reiser">
          <ComingSoon
            icon={Ship}
            title="Andre reiser kommer snart"
            hint="Flere båtopplevelser langs kysten dukker opp her etter hvert som de blir tilgjengelige."
          />
        </SectionFrame>
      );
    case "otherCountries":
      return (
        <SectionFrame title="Andre land">
          <ComingSoon
            icon={Globe}
            title="Andre land kommer snart"
            hint="Etter hvert som plattformen vokser, finner du turer i flere land her."
          />
        </SectionFrame>
      );
    case "customers":
      return (
        <SectionFrame title="Kunder">
          <ComingSoon
            icon={Users}
            title="Kundeoversikt kommer snart"
            hint="En samlet oversikt over kundene dine på tvers av avganger kommer hit. I mellomtiden ser du dem under «Mine avganger» og i chatten."
          />
        </SectionFrame>
      );
    default:
      return null;
  }
}
