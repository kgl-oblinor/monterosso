"use client";

// Lane B — light signup. Optional email + SMS/WhatsApp number → a code is
// sent → we hand off to /verify. No password, ever.
import { useState } from "react";
import { useRouter } from "next/navigation";
import "../auth.css";

export default function Join() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState(false); // false = SMS, true = WhatsApp
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function submit(e) {
    e.preventDefault();
    setErr("");
    if (!email.trim() && !phone.trim()) {
      setErr("Add an email or a phone number — either one is enough.");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "request-code",
          email: email.trim(),
          phone: phone.trim(),
          whatsapp,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        setErr(data.error || "Something went wrong. Please try again.");
        setBusy(false);
        return;
      }
      // Carry the contact + channel to the verify screen.
      const params = new URLSearchParams({ to: data.to, channel: data.channel });
      router.push(`/verify?${params.toString()}`);
    } catch {
      setErr("Couldn't reach us just now. Please try again.");
      setBusy(false);
    }
  }

  return (
    <main className="auth">
      <form className="auth-card" onSubmit={submit}>
        <p className="auth-eyebrow">Monterosso · Cinque Terre</p>
        <h1>Stay close to the skipper</h1>
        <p className="auth-lede">
          Leave a way to reach you and we'll send a short code to confirm it.
          One step, then you can chat with the skipper directly.
        </p>

        <div className="auth-field">
          <label htmlFor="email">Email (optional)</label>
          <input
            id="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="auth-field">
          <label htmlFor="phone">Phone (optional)</label>
          <input
            id="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="+39 333 123 4567"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>

        <div className="auth-chan" role="group" aria-label="Where to send the code">
          <button
            type="button"
            className={!whatsapp ? "is-sel" : ""}
            onClick={() => setWhatsapp(false)}
          >
            SMS
          </button>
          <button
            type="button"
            className={whatsapp ? "is-sel" : ""}
            onClick={() => setWhatsapp(true)}
          >
            WhatsApp
          </button>
        </div>

        <button className="auth-cta" type="submit" disabled={busy}>
          {busy ? "Sending…" : "Continue"}
        </button>

        <p className="auth-err">{err}</p>

        <p className="auth-note">
          No password to remember. We only use this to confirm it's you and to
          let the skipper reach you about your day on the water.
        </p>
      </form>
    </main>
  );
}
