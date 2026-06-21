"use client";

// Light signup — the only barrier is one contact: an email OR a phone number.
// No code, no password. Enter one, you're in.
import { useState } from "react";
import "../auth.css";

export default function Join() {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
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
        body: JSON.stringify({ email: email.trim(), phone: phone.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        setErr(data.error || "Something went wrong. Please try again.");
        setBusy(false);
        return;
      }
      setDone(true);
    } catch {
      setErr("Couldn't reach us just now. Please try again.");
      setBusy(false);
    }
  }

  if (done) {
    return (
      <main className="auth">
        <div className="auth-card">
          <p className="auth-eyebrow">Monterosso · Cinque Terre</p>
          <h1>You're in</h1>
          <p className="auth-lede">
            The skipper can now reach you, and you can message him about your day
            on the water.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="auth">
      <form className="auth-card" onSubmit={submit}>
        <p className="auth-eyebrow">Monterosso · Cinque Terre</p>
        <h1>Stay close to the skipper</h1>
        <p className="auth-lede">
          Leave just one way to reach you — an email or a phone number. That's
          all it takes to message the skipper directly.
        </p>

        <div className="auth-field">
          <label htmlFor="email">Email</label>
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
          <label htmlFor="phone">…or phone</label>
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

        <button className="auth-cta" type="submit" disabled={busy}>
          {busy ? "One moment…" : "Continue"}
        </button>

        <p className="auth-err">{err}</p>

        <p className="auth-note">
          No password, no code. We only use this so the skipper can reach you
          about your day on the water.
        </p>
      </form>
    </main>
  );
}
