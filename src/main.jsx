import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./Globals.css";
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext";
import { PermissionProvider } from "./context/PermissionContext";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import { queryClient } from "./lib/queryClient";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <PermissionProvider>
          <App />
          <Toaster position="bottom-right" reverseOrder={false} />
        </PermissionProvider>
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>
);
