import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { AeroOpsProvider } from "./context/AeroOpsContext";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AeroOpsProvider>
      <App />
    </AeroOpsProvider>
  </StrictMode>
);
