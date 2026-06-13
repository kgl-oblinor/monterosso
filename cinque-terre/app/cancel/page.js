export const metadata = { title: "Payment cancelled · Monterosso · Cinque Terre" };

export default function Cancel() {
  return (
    <div className="result">
      <h1>No worries.</h1>
      <p>Your payment was cancelled and nothing was charged.</p>
      <p>The blue is still waiting whenever you're ready.</p>
      <a className="cta" href="/#book">
        Try again
      </a>
    </div>
  );
}
