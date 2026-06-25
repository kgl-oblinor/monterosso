import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { App } from "./app/App";
import { applyPreviewSession } from "./app/preview";
import "./index.css";

// Flow-overview board: inject a mock session if ?preview=<role> (mock builds only).
applyPreviewSession();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
