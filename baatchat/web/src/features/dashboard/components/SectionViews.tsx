// The non-chat sections of the web-app shell. "Turer" renders real reservation data
// (role-filtered by the Worker); the rest are calm "coming soon" / empty states — never
// dead ends, never invented data.
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Compass,
  LogOut,
  Mail,
  MessageSquare,
  Phone,
  Plus,
  Ship,
  Trash2,
  User,
  UserPlus,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { useT, useLocale, formatDate, type TranslationKey } from "@/i18n";
import { useAuthStore } from "@/features/auth/store";
import {
  useMyProfile,
  useMyReservations,
  useUpdateProfile,
  useUpdateReservationStatus,
  type MyReservation,
} from "../api/threads";
import {
  useAddBlogPost,
  useDeleteBlogPost,
  useSiteSettings,
  useUpdateSiteSettings,
  type Departure,
  type SiteSettings,
  type ThemeBackground,
} from "../api/site";
import { InviteDialog } from "./InviteDialog";
import { shortcutsForRole, type SectionKey } from "../sections";

/** Shared inset-list container: one rounded card, hairline dividers between rows. */
const GROUP_CLASS =
  "overflow-hidden rounded-card border border-hairline bg-surface shadow-soft divide-y divide-hairline";

/** Shared frame: a scrollable column with a title, matching the chat shell's tone. */
function SectionFrame({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex min-w-0 flex-1 flex-col">
      <div className="px-6 pb-3 pt-6">
        <h1 className="text-2xl font-bold tracking-tight text-ink">{title}</h1>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-6">{children}</div>
    </section>
  );
}

/** Calm empty / coming-soon state — presented as a soft, centered widget card. No dead end. */
function ComingSoon({ icon: Icon, title, hint }: { icon: LucideIcon; title: string; hint: string }) {
  return (
    <div className="flex h-full items-center justify-center px-2">
      <div className="flex max-w-sm flex-col items-center rounded-card border border-hairline bg-surface px-8 py-10 text-center shadow-soft">
        <span className="mb-4 flex size-16 items-center justify-center rounded-input bg-gold/15 text-gold">
          <Icon className="size-7" />
        </span>
        <p className="text-base font-semibold text-ink">{title}</p>
        <p className="mt-2 text-sm leading-relaxed text-ink-muted">{hint}</p>
      </div>
    </div>
  );
}

const STATUS_KEY: Record<string, TranslationKey> = {
  requested: "trips.status.requested",
  booked: "trips.status.booked",
  completed: "trips.status.completed",
  cancelled: "trips.status.cancelled",
};

function TripRow({
  trip,
  contactLabel,
  isSkipper,
}: {
  trip: MyReservation;
  contactLabel: string;
  isSkipper: boolean;
}) {
  const t = useT();
  const locale = useLocale();
  const [inviteOpen, setInviteOpen] = useState(false);
  const updateStatus = useUpdateReservationStatus();
  // Invite is a customer action (rallying the travel party); skippers don't see it.
  const canInvite = !isSkipper && trip.status !== "cancelled";
  const isRequest = trip.status === "requested";
  const statusText = STATUS_KEY[trip.status] ? t(STATUS_KEY[trip.status]) : trip.status;
  return (
    <li
      className={`flex items-center justify-between gap-4 rounded-card border border-hairline bg-surface px-5 py-4 shadow-soft ${
        isRequest ? "ring-1 ring-inset ring-gold/30" : ""
      }`}
    >
      <div className="min-w-0">
        <div className="flex items-baseline gap-2">
          <span className="font-mono text-sm font-semibold text-ink">{trip.code}</span>
          <span className="text-xs text-ink-muted">{formatDate(trip.tripDate ?? "", locale)}</span>
        </div>
        <div className="mt-0.5 truncate text-sm text-ink-muted">
          <span className="text-ink-muted">{contactLabel}: </span>
          {trip.contactName ?? "—"}
          {trip.guests != null && (
            <span className="text-ink-muted"> · {t("trips.guests", { count: trip.guests })}</span>
          )}
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {/* Skipper acts on a new request here — no longer a dead end. */}
        {isSkipper && isRequest && (
          <>
            <button
              type="button"
              onClick={() => updateStatus.mutate({ code: trip.code, status: "booked" })}
              disabled={updateStatus.isPending}
              className="btn-ink px-4 text-xs disabled:opacity-40"
            >
              {t("trips.confirm")}
            </button>
            <button
              type="button"
              onClick={() => updateStatus.mutate({ code: trip.code, status: "cancelled" })}
              disabled={updateStatus.isPending}
              className="inline-flex min-h-[44px] items-center rounded-pill border border-hairline px-4 text-xs font-semibold text-ink-muted transition-colors hover:bg-surface hover:text-ink active:scale-[0.98] disabled:opacity-40"
            >
              {t("trips.decline")}
            </button>
          </>
        )}
        {canInvite && (
          <button
            type="button"
            onClick={() => setInviteOpen(true)}
            className="flex min-h-[44px] items-center gap-1.5 rounded-pill border border-hairline px-3.5 text-xs font-semibold text-ink-muted transition-colors hover:bg-surface hover:text-ink active:scale-[0.98]"
          >
            <UserPlus className="size-3.5" />
            <span className="hidden sm:inline">{t("trips.invite")}</span>
          </button>
        )}
        <span
          className={`inline-flex items-center gap-1.5 rounded-pill px-3 py-1 text-xs font-medium ${
            isRequest
              ? "bg-gold/10 text-ink ring-1 ring-inset ring-gold/30"
              : "bg-surface text-ink-muted ring-1 ring-inset ring-hairline"
          }`}
        >
          {isRequest && <span className="size-1.5 rounded-full bg-gold" />}
          {statusText}
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
  const t = useT();
  const role = useAuthStore((s) => s.user?.role);
  const isSkipper = role === "skipper";
  const { data, isLoading, isError } = useMyReservations();
  const title = isSkipper ? t("trips.titleSkipper") : t("trips.title");
  const contactLabel = isSkipper ? t("trips.contactLabel.skipper") : t("trips.contactLabel.customer");

  return (
    <SectionFrame title={title}>
      {isLoading ? (
        <p className="px-1 py-8 text-sm text-ink-muted">{t("common.loading")}</p>
      ) : isError ? (
        <p className="px-1 py-8 text-sm text-destructive">{t("trips.loadError")}</p>
      ) : !data || data.length === 0 ? (
        <ComingSoon
          icon={Compass}
          title={t("trips.emptyTitle")}
          hint={isSkipper ? t("trips.emptyHintSkipper") : t("trips.emptyHintCustomer")}
        />
      ) : (
        <ul className="space-y-3">
          {data.map((trip) => (
            <TripRow key={trip.code} trip={trip} contactLabel={contactLabel} isSkipper={isSkipper} />
          ))}
        </ul>
      )}
    </SectionFrame>
  );
}

/** First name only, for a warm greeting. Falls back to the email handle, then a soft default. */
function firstNameOf(name?: string | null, email?: string | null, fallback = ""): string {
  const n = name?.trim().split(/\s+/)[0];
  if (n) return n;
  const handle = email?.split("@")[0];
  if (handle) return handle;
  return fallback;
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

/** The public landing site — where a customer can browse and book another departure. */
const LANDING_URL = "https://monterosso-cinque-terre.kgl-56a.workers.dev/";

/** The customer home is a large, elderly-friendly 2×2 grid of FOUR distinct destinations —
 *  reading order, most important first. No two tiles point to the same place, and no
 *  "coming soon" dead ends: Chat (message the skipper), My trip, Book another trip (the
 *  landing site), My profile. */
const CUSTOMER_TILES: {
  id: string;
  key?: SectionKey;
  href?: string;
  icon: LucideIcon;
  labelKey: TranslationKey;
  hintKey: TranslationKey;
}[] = [
  { id: "chat", key: "chat", icon: MessageSquare, labelKey: "home.tile.chat.label", hintKey: "home.tile.chat.hint" },
  { id: "trips", key: "trips", icon: Compass, labelKey: "home.tile.trips.label", hintKey: "home.tile.trips.hint" },
  { id: "book", href: LANDING_URL, icon: Ship, labelKey: "home.tile.book.label", hintKey: "home.tile.book.hint" },
  { id: "profile", key: "profile", icon: User, labelKey: "home.tile.profile.label", hintKey: "home.tile.profile.hint" },
];

/** "Hjem": a calm overview shown on sign-in for both roles — a warm greeting, the next
 *  trip (if any), and discreet shortcuts into the role's sections. Minimal, on-theme. */
function HomeSection({ onNavigate }: { onNavigate: (key: SectionKey) => void }) {
  const t = useT();
  const locale = useLocale();
  const user = useAuthStore((s) => s.user);
  const role = user?.role;
  const isSkipper = role === "skipper";
  const { data, isLoading } = useMyReservations();
  const next = nextTripOf(data);
  const shortcuts = shortcutsForRole(role);
  const contactLabel = isSkipper ? t("trips.contactLabel.skipper") : t("trips.contactLabel.customer");

  return (
    <section className="flex min-w-0 flex-1 flex-col overflow-y-auto">
      <div className="mx-auto w-full max-w-2xl px-5 py-10 md:px-6 md:py-14">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">
          {t("home.welcome")}
        </p>
        <h1 className="mt-2 text-3xl font-bold leading-tight tracking-tight text-ink md:text-4xl">
          {t("home.greeting", { name: firstNameOf(user?.name, user?.email, t("home.friend")) })}
        </h1>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-ink-muted">
          {isSkipper ? t("home.subtitle.skipper") : t("home.subtitle.customer")}
        </p>

        {/* Next-trip hero widget */}
        <div className="mt-8">
          <h2 className="px-1 text-xs font-semibold uppercase tracking-wider text-ink-muted">
            {isSkipper ? t("home.nextTrip.skipper") : t("home.nextTrip.customer")}
          </h2>
          {isLoading ? (
            <div className="mt-3 rounded-card border border-hairline bg-surface px-6 py-7 text-sm text-ink-muted shadow-soft">
              {t("common.loading")}
            </div>
          ) : next ? (
            <button
              type="button"
              onClick={() => onNavigate("trips")}
              className="mt-3 flex w-full items-center justify-between gap-4 rounded-card border border-hairline bg-surface px-6 py-7 text-left shadow-soft transition-[transform,background-color] hover:bg-page active:scale-[0.99]"
            >
              <div className="min-w-0">
                <div className="flex items-baseline gap-2">
                  <span className="font-mono text-base font-semibold text-ink">{next.code}</span>
                  <span className="text-xs text-ink-muted">{formatDate(next.tripDate ?? "", locale)}</span>
                </div>
                <div className="mt-1.5 truncate text-sm text-ink-muted">
                  <span className="text-ink-muted">{contactLabel}: </span>
                  {next.contactName ?? "—"}
                  {next.guests != null && (
                    <span className="text-ink-muted"> · {t("trips.guests", { count: next.guests })}</span>
                  )}
                </div>
              </div>
              <span className="flex size-11 shrink-0 items-center justify-center rounded-input bg-gold/15 text-gold">
                <Compass className="size-5" />
              </span>
            </button>
          ) : (
            <div className="mt-3 rounded-card border border-hairline bg-surface px-6 py-7 text-sm leading-relaxed text-ink-muted shadow-soft">
              {isSkipper ? t("home.nextTrip.emptySkipper") : t("home.nextTrip.emptyCustomer")}
            </div>
          )}
        </div>

        {/* Shortcuts. Skippers keep their compact section grid; customers get a large,
            elderly-friendly 2×2 of real destinations (no "coming soon" dead ends). */}
        <div className="mt-8">
          <h2 className="px-1 text-xs font-semibold uppercase tracking-wider text-ink-muted">
            {t("home.shortcuts")}
          </h2>
          {isSkipper ? (
            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {shortcuts.map(({ key, icon: Icon, labelKey }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => onNavigate(key)}
                  className="flex flex-col gap-3 rounded-card border border-hairline bg-surface p-4 text-left text-sm font-medium text-ink shadow-soft transition-[transform,background-color] hover:bg-page active:scale-[0.98]"
                >
                  <span className="flex size-9 items-center justify-center rounded-input bg-gold/15 text-gold">
                    <Icon className="size-4" />
                  </span>
                  <span className="truncate">{t(labelKey)}</span>
                </button>
              ))}
            </div>
          ) : (
            <div className="mt-3 grid grid-cols-2 gap-3">
              {CUSTOMER_TILES.map(({ id, key, href, icon: Icon, labelKey, hintKey }) => {
                const tileClass =
                  "flex min-h-[96px] flex-col justify-center gap-2 rounded-card border border-hairline bg-surface p-5 text-left shadow-soft transition-[transform,background-color] hover:bg-page active:scale-[0.98]";
                const inner = (
                  <>
                    <span className="flex size-12 items-center justify-center rounded-input bg-gold/15 text-gold">
                      <Icon className="size-6" />
                    </span>
                    <span className="text-base font-semibold leading-snug text-ink">{t(labelKey)}</span>
                    <span className="text-sm leading-relaxed text-ink-muted">{t(hintKey)}</span>
                  </>
                );
                return href ? (
                  <a key={id} href={href} target="_blank" rel="noopener noreferrer" className={tileClass}>
                    {inner}
                  </a>
                ) : (
                  <button key={id} type="button" onClick={() => key && onNavigate(key)} className={tileClass}>
                    {inner}
                  </button>
                );
              })}
            </div>
          )}
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
    <label className="flex items-center gap-3 px-4 py-3.5 transition-colors focus-within:bg-page">
      <Icon className="size-4 shrink-0 text-gold" />
      <span className="w-28 shrink-0 text-sm text-ink-muted">{label}</span>
      <input
        type={type}
        inputMode={inputMode}
        autoComplete={autoComplete}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="min-w-0 flex-1 bg-transparent text-right text-sm text-ink placeholder:text-ink-muted focus:outline-none"
      />
    </label>
  );
}

/** "Profil": the logged-in user's own contact details — name, email, phone/WhatsApp —
 *  editable and saved to their account. Logout lives here too. Reached via the avatar
 *  at the bottom of the rail. Same component for customer and skipper; the Worker reads
 *  and writes the right tables by role. */
function ProfileSection() {
  const t = useT();
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
    <SectionFrame title={t("profile.title")}>
      {isLoading ? (
        <p className="px-1 py-8 text-sm text-ink-muted">{t("common.loading")}</p>
      ) : isError ? (
        <p className="px-1 py-8 text-sm text-destructive">{t("profile.loadError")}</p>
      ) : (
        <div className="mx-auto w-full max-w-md">
          <p className="text-sm leading-relaxed text-ink-muted">{t("profile.intro")}</p>

          <div className={`mt-8 ${GROUP_CLASS}`}>
            <ProfileField
              icon={User}
              label={t("profile.field.name")}
              autoComplete="name"
              placeholder={t("profile.field.namePlaceholder")}
              value={name}
              onChange={(v) => {
                setName(v);
                setSaved(false);
              }}
            />
            <ProfileField
              icon={Mail}
              label={t("profile.field.email")}
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder={t("profile.field.emailPlaceholder")}
              value={email}
              onChange={(v) => {
                setEmail(v);
                setSaved(false);
              }}
            />
            <ProfileField
              icon={Phone}
              label={t("profile.field.phone")}
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder={t("profile.field.phonePlaceholder")}
              value={phone}
              onChange={(v) => {
                setPhone(v);
                setSaved(false);
              }}
            />
          </div>

          {save.isError && (
            <p className="mt-4 text-sm text-destructive">{(save.error as Error).message}</p>
          )}
          {saved && !save.isPending && (
            <p className="mt-4 text-sm text-ink">{t("common.saved")}</p>
          )}

          <button
            type="button"
            onClick={onSave}
            disabled={save.isPending}
            className="btn-ink mt-6 w-full"
          >
            {save.isPending ? t("common.saving") : t("common.save")}
          </button>

          <button
            type="button"
            onClick={onLogout}
            className="mt-8 flex w-full items-center justify-center gap-2 rounded-pill border border-hairline px-5 py-3 text-sm text-ink-muted transition-colors hover:bg-surface hover:text-ink active:scale-[0.98]"
          >
            <LogOut className="size-4" />
            {t("profile.logout")}
          </button>
        </div>
      )}
    </SectionFrame>
  );
}

// --- "Min side": the skipper's landing-page control panel -------------------

/** A grouped inset-list card with an uppercase heading, matching the iOS Settings look. */
function SettingsGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-8 first:mt-6">
      <h2 className="px-1 text-xs font-semibold uppercase tracking-wider text-ink-muted">{title}</h2>
      <div className={`mt-3 ${GROUP_CLASS}`}>{children}</div>
    </div>
  );
}

/** A single labelled row holding an arbitrary control (input/select/etc.), right-aligned. */
function SettingRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex items-center gap-3 px-4 py-3.5 transition-colors focus-within:bg-page">
      <span className="w-32 shrink-0 text-sm text-ink-muted">{label}</span>
      <div className="flex min-w-0 flex-1 items-center justify-end gap-2">{children}</div>
    </label>
  );
}

const FIELD_CLASS =
  "min-w-0 flex-1 bg-transparent text-right text-sm text-ink placeholder:text-ink-muted focus:outline-none";

const BACKGROUNDS: { key: ThemeBackground; labelKey: TranslationKey }[] = [
  { key: "bay", labelKey: "site.background.bay" },
  { key: "deepblue", labelKey: "site.background.deepblue" },
  { key: "villages", labelKey: "site.background.villages" },
  { key: "scene", labelKey: "site.background.scene" },
];

const BACKGROUND_SWATCH: Record<ThemeBackground, string> = {
  bay: "linear-gradient(135deg,#2a7d8c,#0f2740)",
  deepblue: "linear-gradient(135deg,#0f2740,#07182a)",
  villages: "linear-gradient(135deg,#c46b3f,#7a3b2a)",
  scene: "linear-gradient(135deg,#5f7a43,#2a3b1f)",
};

const ACCENT_PRESETS = ["#ead27e", "#c46b3f", "#5f7a43", "#2a7d8c", "#b04a3a"];

/** "Min side": the editor where a skipper shapes their public landing. Grouped inset cards
 *  (Tilbud · Pris & gjester · Tider · Utseende · Blogg). Persists via siteApi (mock → localStorage
 *  in the demo). Save-on-explicit-button, mirroring the profile section. */
function SiteSection() {
  const t = useT();
  const { data, isLoading, isError } = useSiteSettings();
  const save = useUpdateSiteSettings();
  const addPost = useAddBlogPost();
  const deletePost = useDeleteBlogPost();

  const [listingTitle, setListingTitle] = useState("");
  const [tagline, setTagline] = useState("");
  const [pricePerGuest, setPricePerGuest] = useState(0);
  const [maxGuests, setMaxGuests] = useState(0);
  const [departures, setDepartures] = useState<Departure[]>([]);
  const [background, setBackground] = useState<ThemeBackground>("deepblue");
  const [accent, setAccent] = useState("#ead27e");
  const [saved, setSaved] = useState(false);

  const [newTitle, setNewTitle] = useState("");
  const [newBody, setNewBody] = useState("");

  // Prime the editor once the settings load.
  useEffect(() => {
    if (data) {
      setListingTitle(data.listingTitle);
      setTagline(data.tagline);
      setPricePerGuest(data.pricePerGuest);
      setMaxGuests(data.maxGuests);
      setDepartures(data.departures);
      setBackground(data.theme.background);
      setAccent(data.theme.accent);
    }
  }, [data]);

  const dirtied = () => setSaved(false);

  const onSave = () => {
    setSaved(false);
    save.mutate(
      {
        listingTitle: listingTitle.trim(),
        tagline: tagline.trim(),
        pricePerGuest,
        maxGuests,
        departures,
        theme: { background, accent },
      },
      { onSuccess: () => setSaved(true) }
    );
  };

  const setDeparture = (i: number, patch: Partial<Departure>) => {
    setDepartures((d) => d.map((dep, idx) => (idx === i ? { ...dep, ...patch } : dep)));
    dirtied();
  };

  const addDeparture = () => {
    setDepartures((d) => [...d, { key: `dep${Date.now()}`, label: t("site.departure.new"), time: "12:00" }]);
    dirtied();
  };

  const removeDeparture = (i: number) => {
    setDepartures((d) => d.filter((_, idx) => idx !== i));
    dirtied();
  };

  const onAddPost = () => {
    if (!newTitle.trim()) return;
    addPost.mutate(
      { title: newTitle.trim(), body: newBody.trim(), published: false },
      {
        onSuccess: () => {
          setNewTitle("");
          setNewBody("");
        },
      }
    );
  };

  return (
    <SectionFrame title={t("site.title")}>
      {isLoading ? (
        <p className="px-1 py-8 text-sm text-ink-muted">{t("common.loading")}</p>
      ) : isError || !data ? (
        <p className="px-1 py-8 text-sm text-destructive">{t("site.loadError")}</p>
      ) : (
        <div className="mx-auto w-full max-w-md pb-4">
          <p className="text-sm leading-relaxed text-ink-muted">{t("site.intro")}</p>

          {/* Tilbud */}
          <SettingsGroup title={t("site.group.offer")}>
            <SettingRow label={t("site.field.title")}>
              <input
                className={FIELD_CLASS}
                placeholder={t("site.field.titlePlaceholder")}
                value={listingTitle}
                onChange={(e) => {
                  setListingTitle(e.target.value);
                  dirtied();
                }}
              />
            </SettingRow>
            <SettingRow label={t("site.field.subtitle")}>
              <input
                className={FIELD_CLASS}
                placeholder={t("site.field.subtitlePlaceholder")}
                value={tagline}
                onChange={(e) => {
                  setTagline(e.target.value);
                  dirtied();
                }}
              />
            </SettingRow>
          </SettingsGroup>

          {/* Pris & gjester */}
          <SettingsGroup title={t("site.group.pricing")}>
            <SettingRow label={t("site.field.pricePerGuest")}>
              <input
                type="number"
                inputMode="numeric"
                min={0}
                className={FIELD_CLASS}
                value={pricePerGuest}
                onChange={(e) => {
                  setPricePerGuest(Number(e.target.value));
                  dirtied();
                }}
              />
              <span className="shrink-0 text-sm text-ink-muted">€</span>
            </SettingRow>
            <SettingRow label={t("site.field.maxGuests")}>
              <input
                type="number"
                inputMode="numeric"
                min={1}
                className={FIELD_CLASS}
                value={maxGuests}
                onChange={(e) => {
                  setMaxGuests(Number(e.target.value));
                  dirtied();
                }}
              />
            </SettingRow>
          </SettingsGroup>

          {/* Tider */}
          <SettingsGroup title={t("site.group.times")}>
            {departures.map((dep, i) => (
              <div key={dep.key} className="flex items-center gap-2 px-4 py-3">
                <input
                  className="min-w-0 flex-1 bg-transparent text-sm text-ink placeholder:text-ink-muted focus:outline-none"
                  placeholder={t("site.departure.namePlaceholder")}
                  value={dep.label}
                  onChange={(e) => setDeparture(i, { label: e.target.value })}
                />
                <input
                  type="time"
                  className="shrink-0 bg-transparent text-sm text-ink [color-scheme:light] focus:outline-none"
                  value={dep.time}
                  onChange={(e) => setDeparture(i, { time: e.target.value })}
                />
                <button
                  type="button"
                  onClick={() => removeDeparture(i)}
                  aria-label={t("site.departure.remove")}
                  className="flex size-11 shrink-0 items-center justify-center rounded-pill text-ink-muted transition-colors hover:bg-surface hover:text-destructive"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addDeparture}
              className="flex min-h-[44px] w-full items-center gap-2 px-4 py-3 text-sm text-gold transition-colors hover:bg-page"
            >
              <Plus className="size-4" />
              {t("site.departure.add")}
            </button>
          </SettingsGroup>

          {/* Utseende */}
          <SettingsGroup title={t("site.group.appearance")}>
            <div className="px-4 py-4">
              <p className="text-sm text-ink-muted">{t("site.appearance.background")}</p>
              <div className="mt-3 grid grid-cols-2 gap-2">
                {BACKGROUNDS.map((bg) => (
                  <button
                    key={bg.key}
                    type="button"
                    onClick={() => {
                      setBackground(bg.key);
                      dirtied();
                    }}
                    className={`flex items-center gap-2.5 rounded-input border p-2 text-left text-sm transition-colors ${
                      background === bg.key
                        ? "border-transparent bg-surface text-gold ring-1 ring-inset ring-gold/30"
                        : "border-hairline text-ink-muted hover:bg-surface"
                    }`}
                  >
                    <span
                      className="size-7 shrink-0 rounded-lg shadow-[inset_0_0_0_1px_rgba(0,0,0,0.08)]"
                      style={{ background: BACKGROUND_SWATCH[bg.key] }}
                    />
                    <span className="truncate">{t(bg.labelKey)}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="px-4 py-4">
              <p className="text-sm text-ink-muted">{t("site.appearance.color")}</p>
              <div className="mt-3 flex items-center gap-2.5">
                {ACCENT_PRESETS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => {
                      setAccent(c);
                      dirtied();
                    }}
                    aria-label={t("site.color.pick", { color: c })}
                    className="flex size-11 items-center justify-center rounded-full transition-transform active:scale-90"
                  >
                    <span
                      className={`size-8 rounded-full ${
                        accent.toLowerCase() === c.toLowerCase()
                          ? "ring-2 ring-ink ring-offset-2 ring-offset-page"
                          : ""
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  </button>
                ))}
                <label className="ml-1 flex size-11 cursor-pointer items-center justify-center rounded-full border border-hairline text-ink-muted hover:bg-surface">
                  <input
                    type="color"
                    value={accent}
                    onChange={(e) => {
                      setAccent(e.target.value);
                      dirtied();
                    }}
                    className="size-0 opacity-0"
                  />
                  <Plus className="size-4" />
                </label>
              </div>
            </div>
          </SettingsGroup>

          {save.isError && (
            <p className="mt-4 text-sm text-destructive">{(save.error as Error).message}</p>
          )}
          {saved && !save.isPending && <p className="mt-4 text-sm text-ink">{t("common.saved")}</p>}

          <button
            type="button"
            onClick={onSave}
            disabled={save.isPending}
            className="btn-ink mt-6 w-full"
          >
            {save.isPending ? t("common.saving") : t("common.save")}
          </button>

          {/* Blogg */}
          <SettingsGroup title={t("site.group.blog")}>
            {data.blogPosts.length === 0 ? (
              <p className="px-4 py-4 text-sm text-ink-muted">{t("site.blog.empty")}</p>
            ) : (
              data.blogPosts.map((post) => (
                <div key={post.id} className="flex items-start gap-3 px-4 py-3.5">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-ink">{post.title}</p>
                    {post.body && (
                      <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-ink-muted">
                        {post.body}
                      </p>
                    )}
                  </div>
                  <PublishToggle post={post} />
                  <button
                    type="button"
                    onClick={() => deletePost.mutate(post.id)}
                    aria-label={t("site.blog.delete")}
                    className="flex size-11 shrink-0 items-center justify-center rounded-pill text-ink-muted transition-colors hover:bg-surface hover:text-destructive"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              ))
            )}
          </SettingsGroup>

          <div className="mt-3">
            <div className={GROUP_CLASS}>
              <div className="px-4 py-3">
                <input
                  className="w-full bg-transparent text-sm text-ink placeholder:text-ink-muted focus:outline-none"
                  placeholder={t("site.blog.newTitlePlaceholder")}
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                />
              </div>
              <div className="px-4 py-3">
                <textarea
                  rows={3}
                  className="w-full resize-none bg-transparent text-sm leading-relaxed text-ink placeholder:text-ink-muted focus:outline-none"
                  placeholder={t("site.blog.newBodyPlaceholder")}
                  value={newBody}
                  onChange={(e) => setNewBody(e.target.value)}
                />
              </div>
            </div>
            <button
              type="button"
              onClick={onAddPost}
              disabled={!newTitle.trim() || addPost.isPending}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-pill border border-hairline px-5 py-3 text-sm font-semibold text-ink-muted transition-colors hover:bg-surface hover:text-ink active:scale-[0.98] disabled:opacity-50"
            >
              <Plus className="size-4" />
              {addPost.isPending ? t("site.blog.adding") : t("site.blog.addPost")}
            </button>
          </div>
        </div>
      )}
    </SectionFrame>
  );
}

/** Publish toggle for a blog post. Persists by re-saving the full posts array through the
 *  settings update so a real backend can mirror it without a dedicated endpoint. */
function PublishToggle({ post }: { post: SiteSettings["blogPosts"][number] }) {
  const t = useT();
  const { data } = useSiteSettings();
  const save = useUpdateSiteSettings();
  const toggle = () => {
    const blogPosts = (data?.blogPosts ?? []).map((p) =>
      p.id === post.id ? { ...p, published: !p.published } : p
    );
    save.mutate({ blogPosts });
  };
  return (
    <button
      type="button"
      onClick={toggle}
      className={`inline-flex min-h-[44px] shrink-0 items-center gap-1.5 rounded-pill px-3 text-xs font-medium transition-colors ${
        post.published
          ? "bg-gold/10 text-ink ring-1 ring-inset ring-gold/30"
          : "bg-surface text-ink-muted ring-1 ring-inset ring-hairline hover:text-ink"
      }`}
    >
      {post.published && <span className="size-1.5 rounded-full bg-gold" />}
      {post.published ? t("site.blog.published") : t("site.blog.hidden")}
    </button>
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
    case "site":
      return <SiteSection />;
    default:
      return null;
  }
}
