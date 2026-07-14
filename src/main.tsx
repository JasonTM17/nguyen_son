import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./app";
import "./styles/base.css";
import "./styles/layout.css";
import "./styles/components.css";
import "./styles/studio-scene.css";
import "./styles/content-sections.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
