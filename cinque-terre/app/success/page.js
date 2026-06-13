export const metadata = { title: "Booking confirmed · Monterosso · Cinque Terre" };

export default function Success() {
  return (
    <div className="result">
      <h1>You're aboard. 🌊</h1>
      <p>
        Your payment went through. Stripe has emailed you a receipt with the
        details of your day on the Ligurian blue.
      </p>
      <p>We'll be in touch shortly to confirm the meeting point in Monterosso.</p>
      <a className="cta" href="/">
        Back to the tour
      </a>
    </div>
  );
}
