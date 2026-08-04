import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { AppPreferencesProvider } from "./context/AppPreferencesContext";
import "./styles/theme.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AppPreferencesProvider>
        <App />
      </AppPreferencesProvider>
    </BrowserRouter>
  </React.StrictMode>
);