import { notFound } from "next/navigation";

// /map was an INTERNAL planning canvas (the "flow map"). Its content is stale —
// wrong prices and a flow that no longer matches the live booking wizard — and it
// was never meant for customers. To keep it off the public surface we 404 the route
// (and mark it noindex). The planning notes live outside the shipped app now.
export const metadata = {
  title: "Not found",
  robots: { index: false, follow: false },
};

export default function FlowMap() {
  notFound();
}
