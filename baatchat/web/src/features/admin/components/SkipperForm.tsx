import { useMemo, useState } from "react";
import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { useCreateSkipper, useUpdateSkipper } from "../api/hooks";
import type { ServiceType, Skipper, SkipperInput } from "../api/types";

const SERVICE_OPTIONS: { value: ServiceType; label: string }[] = [
  { value: "charter", label: "Charter" },
  { value: "taxi", label: "Taxibåt" },
  { value: "freight", label: "Frakt" },
];

/** Editable shape of the form (prices are kr as text; slots one per line). */
interface FormState {
  name: string;
  email: string;
  phone: string;
  address: string;
  location: string;
  country: string;
  boatName: string;
  serviceType: ServiceType;
  slots: string; // newline-separated departure times
  basePrice: string; // major units (kr), as typed
  currency: string;
  paymentRef: string;
}

function toFormState(s?: Skipper): FormState {
  // The worker returns slots already as a string[]; just join for the textarea.
  const slots = Array.isArray(s?.slots) ? s!.slots.join("\n") : "";
  return {
    name: s?.name ?? "",
    email: s?.email ?? "",
    phone: s?.phone ?? "",
    address: s?.address ?? "",
    location: s?.location ?? "",
    country: s?.country ?? "Italia",
    boatName: s?.boat_name ?? "",
    serviceType: s?.service_type ?? "charter",
    slots,
    basePrice: s?.base_price != null ? String(s.base_price / 100) : "",
    currency: s?.currency ?? "EUR",
    paymentRef: s?.payment_ref ?? "",
  };
}

/** Build the API body (snake_case, price in cents, slots as JSON array). */
function toInput(f: FormState): SkipperInput {
  const slots = f.slots
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
  const priceRaw = f.basePrice.trim();
  const price = Number(priceRaw.replace(",", "."));
  return {
    name: f.name.trim(),
    email: f.email.trim(),
    phone: f.phone.trim(),
    address: f.address.trim(),
    location: f.location.trim(),
    country: f.country.trim(),
    boat_name: f.boatName.trim(),
    service_type: f.serviceType,
    slots: JSON.stringify(slots),
    // Empty field → null (server keeps the existing/default price), never 0.
    base_price: priceRaw !== "" && Number.isFinite(price) ? Math.round(price * 100) : null,
    currency: f.currency.trim() || "EUR",
    payment_ref: f.paymentRef.trim(),
  };
}

/** Add a new skipper, or edit an existing one. Submits to POST/PUT /admin/skippers.
 *  Calm, single-column form — same dark teal panel as the rest of the admin area. */
export function SkipperForm({
  skipper,
  onDone,
  onCancel,
}: {
  skipper?: Skipper;
  onDone: () => void;
  onCancel: () => void;
}) {
  const editing = skipper != null;
  const [form, setForm] = useState<FormState>(() => toFormState(skipper));

  const create = useCreateSkipper();
  const update = useUpdateSkipper();
  const saving = create.isPending || update.isPending;
  const error = create.error ?? update.error;

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const canSave = useMemo(
    () => form.name.trim() !== "" && (form.email.trim() !== "" || form.phone.trim() !== ""),
    [form.name, form.email, form.phone]
  );

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSave || saving) return;
    const input = toInput(form);
    try {
      if (editing) {
        await update.mutateAsync({ id: skipper.id, input });
      } else {
        await create.mutateAsync(input);
      }
      onDone();
    } catch {
      /* error surfaces via the banner below */
    }
  };

  return (
    <form onSubmit={submit} className="max-w-2xl space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-ink">
          {editing ? "Rediger skipper" : "Legg til skipper"}
        </h2>
        <p className="mt-1 text-sm text-ink-muted">
          Fyll inn oppføringen. Telefonen brukes til WhatsApp. Du trenger e-post eller telefon.
        </p>
      </div>

      {error && (
        <div className="rounded-input border border-red-600/20 bg-red-500/10 px-4 py-3 text-sm text-red-700">
          {error.message}
        </div>
      )}

      <Section title="Kontakt">
        <Field label="Navn" required>
          <TextInput
            value={form.name}
            onChange={(v) => set("name", v)}
            placeholder="Andrea"
            autoFocus
          />
        </Field>
        <Grid>
          <Field label="E-post">
            <TextInput
              type="email"
              value={form.email}
              onChange={(v) => set("email", v)}
              placeholder="andrea@eksempel.it"
            />
          </Field>
          <Field label="Telefon (WhatsApp)">
            <TextInput
              type="tel"
              value={form.phone}
              onChange={(v) => set("phone", v)}
              placeholder="+39 333 123 4567"
            />
          </Field>
        </Grid>
        <Field label="Gateadresse">
          <TextInput
            value={form.address}
            onChange={(v) => set("address", v)}
            placeholder="Molo dei Pescatori 1"
          />
        </Field>
        <Grid>
          <Field label="Sted">
            <TextInput
              value={form.location}
              onChange={(v) => set("location", v)}
              placeholder="Monterosso"
            />
          </Field>
          <Field label="Land">
            <TextInput
              value={form.country}
              onChange={(v) => set("country", v)}
              placeholder="Italia"
            />
          </Field>
        </Grid>
      </Section>

      <Section title="Tjeneste">
        <Grid>
          <Field label="Båtnavn">
            <TextInput
              value={form.boatName}
              onChange={(v) => set("boatName", v)}
              placeholder="Paolona"
            />
          </Field>
          <Field label="Tjenestetype">
            <Segmented
              value={form.serviceType}
              onChange={(v) => set("serviceType", v)}
              options={SERVICE_OPTIONS}
            />
          </Field>
        </Grid>
        <Field label="Avgangstider" hint="Én tid per linje, f.eks. 10:00">
          <textarea
            value={form.slots}
            onChange={(e) => set("slots", e.target.value)}
            rows={4}
            placeholder={"10:00\n14:00\n17:30"}
            className="w-full resize-none rounded-input border border-hairline bg-white px-3 py-2 text-sm text-ink placeholder:text-ink-muted focus:border-gold/50 focus:outline-none"
          />
        </Field>
      </Section>

      <Section title="Pris og betaling">
        <Grid>
          <Field label="Grunnpris" hint="I hele kroner/euro">
            <TextInput
              type="text"
              inputMode="decimal"
              value={form.basePrice}
              onChange={(v) => set("basePrice", v)}
              placeholder="150"
            />
          </Field>
          <Field label="Valuta">
            <TextInput
              value={form.currency}
              onChange={(v) => set("currency", v.toUpperCase())}
              placeholder="EUR"
            />
          </Field>
        </Grid>
        <Field label="Betalingsreferanse (Stripe)" hint="Kan stå tom inntil videre">
          <TextInput
            value={form.paymentRef}
            onChange={(v) => set("paymentRef", v)}
            placeholder="acct_… / price_…"
          />
        </Field>
      </Section>

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={!canSave || saving}
          className="btn-ink gap-2 text-sm"
        >
          {saving && <Loader2 className="size-4 animate-spin" />}
          {editing ? "Lagre endringer" : "Legg til skipper"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex h-11 items-center rounded-pill border border-hairline px-5 text-sm font-medium text-ink transition-colors hover:bg-black/[0.04]"
        >
          Avbryt
        </button>
      </div>
    </form>
  );
}

// --- small presentational helpers (scoped to this form) ---------------------

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-ink-muted">{title}</h3>
      {children}
    </section>
  );
}

function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-4 sm:grid-cols-2">{children}</div>;
}

function Field({
  label,
  hint,
  required,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-ink">
        {label}
        {required && <span className="ml-1 text-gold">*</span>}
      </span>
      {children}
      {hint && <span className="mt-1 block text-xs text-ink-muted">{hint}</span>}
    </label>
  );
}

function TextInput({
  value,
  onChange,
  ...rest
}: {
  value: string;
  onChange: (v: string) => void;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange">) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-10 w-full rounded-input border border-hairline bg-white px-3 text-sm text-ink placeholder:text-ink-muted focus:border-gold/50 focus:outline-none"
      {...rest}
    />
  );
}

function Segmented<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
}) {
  return (
    <div className="flex h-10 rounded-input border border-hairline bg-surface p-0.5">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          aria-pressed={value === o.value}
          className={cn(
            "flex-1 rounded-[10px] text-sm font-medium transition-colors",
            value === o.value
              ? "bg-white text-gold ring-1 ring-inset ring-gold/30"
              : "text-ink-muted hover:text-ink"
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
