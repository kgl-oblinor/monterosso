"use client";

// Lane B — verify the code sent to the guest's email or SMS/WhatsApp.
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import "../auth.css";

export default function Verify() {
  const router = useRouter();
  const params = useSearchParams();
  const to = params.get("to") || "";
  const channel = params.get("channel") || "email";

  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const where =
    channel === "whatsapp"
      ? "on WhatsApp"
      : channel === "sms"
      ? "by text"
      : "by email";

  async function submit(e) {
    e.preventDefault();
    setErr("");
    setBusy(true);
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "verify-code", to, code: code.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        setErr(data.error || "That code didn't match. Try again.");
        setBusy(false);
        return;
      }
      // Verified. Lane A owns the chat — hand off there.
      router.push("/chat");
    } catch {
      setErr("Couldn't reach us just now. Please try again.");
      setBusy(false);
    }
  }

  return (
    <main className="auth">
      <form className="auth-card" onSubmit={submit}>
        <p className="auth-eyebrow">Monterosso · Cinque Terre</p>
        <h1>Enter your code</h1>
        <p className="auth-lede">
          We sent a 6-digit code{" "}
          <span className="auth-sent">{where}</span>
          {to ? (
            <>
              {" "}
              to <span className="auth-sent">{to}</span>
            </>
          ) : null}
          . Type it in below.
        </p>

        <div className="auth-field auth-field--code">
          <label htmlFor="code">Your code</label>
          <input
            id="code"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            placeholder="······"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
          />
        </div>

        <button
          className="auth-cta"
          type="submit"
          disabled={busy || code.length < 6}
        >
          {busy ? "Checking…" : "Continue"}
        </button>

        <p className="auth-err">{err}</p>

        <a className="auth-quiet" href="/join">
          Use a different contact
        </a>
      </form>
    </main>
  );
}
