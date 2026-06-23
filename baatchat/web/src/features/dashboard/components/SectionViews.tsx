// The non-chat sections of the web-app shell. "Turer" renders real reservation data
// (role-filtered by the Worker); the rest are calm "coming soon" / empty states — never
// dead ends, never invented data.
import { Compass, Globe, Receipt, Ship, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { useAuthStore } from "@/features/auth/store";
import { formatTripDate, useMyReservations, type MyReservation } from "../api/threads";
import type { SectionKey } from "../sections";

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
      <span className="shrink-0 rounded-full bg-white/[0.06] px-3 py-1 text-xs font-medium text-white/70">
        {statusLabel(trip.status)}
      </span>
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

/** Renders the active non-chat section. Chat is handled by DashboardLayout itself. */
export function SectionView({ section }: { section: SectionKey }) {
  switch (section) {
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
