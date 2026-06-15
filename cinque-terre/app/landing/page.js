import Landing from "./Landing";
import "./landing.css";

// New landing page (work-in-progress copy of the home page). Lives at /landing
// so the original home page (app/page.js) is never affected.
// Render on each request so a deploy's content shows immediately, instead of
// being served from the long-lived (1-year) full-route SSG cache.
export const dynamic = "force-dynamic";

export default function LandingPage() {
  return <Landing />;
}
