"use client";

// Lane C · Admin / captain inbox — single thread (read + reply).
//
// Shows one reservation's conversation and lets the captain reply.
// Initial messages are passed in from the server page (which reads them
// straight from Lane D's `messages` table). Replies POST to Lane A's
// /api/messages and are appended optimistically.
//
// Expected message shape (Lane D `messages`: code, sender, text, ts):
//   { id, code, sender: "customer" | "captain", text, ts }
//
// Reply contract (Lane A POST /api/messages):
//   body: { code, sender: "captain", text }
//   -> 200 { ok: true, message?: {...} }
// The admin key is forwarded so the API can authorise captain sends.
//
// NOTE (Lane G): inside the dashboard shell this is the right-hand pane.

import { useState, useRef, useEffect } from "react";

function fmt(ts) {
  if (!ts) return "";
  try {
    return new Date(ts).toLocaleString("nb-NO", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return ts;
  }
}

export default function ThreadView({ code, name, contact, initialMessages = [], adminKey = "" }) {
  const [messages, setMessages] = useState(initialMessages);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [err, setErr] = useState("");
  const bodyRef = useRef(null);

  useEffect(() => {
    const el = bodyRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  async function send(e) {
    e.preventDefault();
    const body = text.trim();
    if (!body || sending) return;
    setSending(true);
    setErr("");

    // optimistic
    const optimistic = { id: `tmp-${Date.now()}`, code, sender: "captain", text: body, ts: new Date().toISOString() };
    setMessages((m) => [...m, optimistic]);
    setText("");

    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(adminKey ? { "x-admin-key": adminKey } : {}),
        },
        body: JSON.stringify({ code, sender: "captain", text: body }),
      });
      if (!res.ok) throw new Error("send failed");
      const data = await res.json().catch(() => ({}));
      if (data?.message) {
        setMessages((m) => m.map((x) => (x.id === optimistic.id ? data.message : x)));
      }
    } catch {
      setErr("Kunne ikke sende. Prøv igjen.");
      setMessages((m) => m.filter((x) => x.id !== optimistic.id));
      setText(body);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="cx-thread-view">
      <div className="cx-tv-head">
        <div>
          <h1>{name || "Gjest"}</h1>
          <div className="cx-tv-meta">
            {code}
            {contact ? ` · ${contact}` : ""}
          </div>
        </div>
        <a href="/admin/inbox" className="cx-back">Innboks</a>
      </div>

      <div className="cx-tv-body" ref={bodyRef}>
        {messages.length === 0 ? (
          <p className="cx-empty">Ingen meldinger ennå.</p>
        ) : (
          messages.map((m) => (
            <div key={m.id} className={"cx-msg" + (m.sender === "captain" ? " cx-msg--me" : "")}>
              {m.text}
              <span className="cx-msg__meta">
                {m.sender === "captain" ? "Skipper" : name || "Gjest"} · {fmt(m.ts)}
              </span>
            </div>
          ))
        )}
      </div>

      <form className="cx-reply" onSubmit={send}>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) send(e);
          }}
          placeholder="Skriv et svar…"
          rows={1}
        />
        <button type="submit" disabled={sending || !text.trim()}>
          {sending ? "Sender…" : "Send"}
        </button>
        {err ? <span className="cx-reply-err">{err}</span> : null}
      </form>
    </div>
  );
}
