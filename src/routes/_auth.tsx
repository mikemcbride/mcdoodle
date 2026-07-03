import { Outlet, createFileRoute, useLocation, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "../auth";

export const Route = createFileRoute("/_auth")({
  component: AuthGuard,
});

// Route guard driven by the server-resolved session (the root loader reads the
// HttpOnly cookie during SSR), not a spoofable localStorage flag. Anonymous
// visitors get no protected markup in the SSR payload — just a client-side
// redirect to /login with a returnUrl.
function AuthGuard() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate({
        to: "/login",
        search: { returnUrl: location.pathname },
        replace: true,
      });
    }
  }, [isAuthenticated, navigate, location.pathname]);

  if (!isAuthenticated) return null;
  return <Outlet />;
}
