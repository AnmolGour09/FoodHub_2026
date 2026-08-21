import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { DashboardProvider } from "./context/DashboardContext";
import { SocketProvider } from "./context/SocketContext";


ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
  <AuthProvider>
    <DashboardProvider>
      <SocketProvider>
        <App />
      </SocketProvider>
    </DashboardProvider>
  </AuthProvider>
</BrowserRouter>
);