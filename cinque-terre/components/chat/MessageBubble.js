// Lane A · Chat — a single message bubble.
// `sender` is "customer" or "captain". The viewer is always the customer here,
// so customer messages sit on the right ("mine"), captain on the left.

function fmtTime(ts) {
  if (!ts) return "";
  try {
    return new Date(ts).toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

export default function MessageBubble({ sender, text, ts }) {
  const mine = sender === "customer";
  return (
    <div className={"krin-bubble " + (mine ? "krin-bubble--mine" : "krin-bubble--theirs")}>
      {!mine ? <p className="krin-bubble__who">Captain</p> : null}
      <p className="krin-bubble__text">{text}</p>
      <span className="krin-bubble__time">{fmtTime(ts)}</span>
    </div>
  );
}
