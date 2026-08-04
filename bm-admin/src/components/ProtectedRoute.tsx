import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import {
  clearAdminSession,
  getAdminToken,
  getCurrentAdmin,
} from "../services/adminAuthApi";

type AuthStatus = "checking" | "authenticated" | "unauthenticated";

export default function ProtectedRoute() {
  const location = useLocation();
  const [status, setStatus] = useState<AuthStatus>("checking");

  useEffect(() => {
    let isMounted = true;

    async function verifyAdminSession() {
      const token = getAdminToken();

      if (!token) {
        if (isMounted) setStatus("unauthenticated");
        return;
      }

      try {
        await getCurrentAdmin(token);

        if (isMounted) {
          setStatus("authenticated");
        }
      } catch {
        clearAdminSession();

        if (isMounted) {
          setStatus("unauthenticated");
        }
      }
    }

    verifyAdminSession();

    return () => {
      isMounted = false;
    };
  }, [location.pathname]);

  if (status === "checking") {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          background: "linear-gradient(135deg, #f5f7f2, #dfead9)",
          color: "#06357A",
          fontWeight: 800,
        }}
      >
        Checking admin session...
      </div>
    );
  }

  if (status === "unauthenticated") {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}