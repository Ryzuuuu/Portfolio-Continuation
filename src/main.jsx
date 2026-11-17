import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./styles.css";
import "./styles/figures.css";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Sakuga's drawn toggle carries a 0.5 MB sprite sheet, so it loads once the page is idle;
// the theme switch shows the plain sun/moon button until then.
function loadToggle() {
  const script = document.createElement("script");
  script.src = "/sakuga-vfx/toggle.js";
  document.head.append(script);
}
if ("requestIdleCallback" in window) requestIdleCallback(loadToggle, { timeout: 4000 });
else setTimeout(loadToggle, 2500);
