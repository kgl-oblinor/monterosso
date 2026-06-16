import Landing from "./landing/Landing";
import "./landing/landing.css";

// The home page now serves the v2 landing experience (in app/landing/), which
// has the full booking flow incl. the calendar/share step. Render on each
// request so deploys show immediately.
export const dynamic = "force-dynamic";

export default function Home() {
  return <Landing />;
}
