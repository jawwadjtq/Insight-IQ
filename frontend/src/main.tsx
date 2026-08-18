import React from "react";
import ReactDOM from "react-dom/client";

import App from "./App";

import "./index.css";

import { ThemeProvider } from "./context/ThemeContext";
import { AppSettingsProvider } from "./context/AppSettingsContext";
import { LanguageProvider } from "./context/LanguageContext";

ReactDOM.createRoot(
  document.getElementById("root")!
).render(
  <React.StrictMode>

    <ThemeProvider>

      <AppSettingsProvider>

        <LanguageProvider>

          <App />

        </LanguageProvider>

      </AppSettingsProvider>

    </ThemeProvider>

  </React.StrictMode>
);