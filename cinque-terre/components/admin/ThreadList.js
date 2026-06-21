// Lane C · Admin / captain inbox — thread list (presentational).
//
// Renders the captain's inbox: one row per reservation code, showing the
// customer name/contact, the last message preview, time, and an unread
// badge. Pure/presentational — the page (app/admin/inbox/page.js) loads
// the data and passes `threads` in.
//
// Expected thread shape (one per reservation code), assembled from
// Lane D's `messages` table (code, sender, text, ts) + booking/contact:
//   {
//     code: "MT-210625-2",     // reservation code (MT-DDMMYY-guests)
//     name: "Anna",            // customer name (may be null)
//     contact: "+47 …",        // phone / email (may be null)
//     last: "See you at …",    // last message text
//     ts: "2026-06-21T…Z",     // last message ISO time
//     unread: 2                // messages from customer not yet read
//   }
//
// NOTE (Lane G): when the dashboard shell lands in components/dashboard/,
// this list becomes the right-hand pane next to the left sidebar.

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

export default function ThreadList({ threads = [] }) {
  if (!threads.length) {
    return <p className="cx-empty">Ingen samtaler ennå.</p>;
  }
  return (
    <div className="cx-list">
      {threads.map((t) => (
        <a key={t.code} href={`/admin/${encodeURIComponent(t.code)}`} className="cx-thread">
          <div className="cx-thread__main">
            <div className="cx-thread__top">
              <span className="cx-thread__name">{t.name || "Gjest"}</span>
              <span className="cx-thread__code">{t.code}</span>
            </div>
            {t.contact ? <div className="cx-thread__contact">{t.contact}</div> : null}
            <div className="cx-thread__last">{t.last || "—"}</div>
          </div>
          <div className="cx-thread__side">
            <span className="cx-thread__time">{fmt(t.ts)}</span>
            {t.unread > 0 ? <span className="cx-badge">{t.unread}</span> : null}
          </div>
        </a>
      ))}
    </div>
  );
}
