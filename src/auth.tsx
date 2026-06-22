import React from "react";
import { AuthContext } from "./context/AuthContext";
import { AuthUser } from "./types";
import http from "./services/http";

const LS_USER_KEY = "mcdoodle.user";

// NOTE: the real credential is now an HttpOnly session cookie that the browser
// sends automatically and that the server validates. The value we keep in
// localStorage is only a non-sensitive "hint" so we can render the correct UI
// immediately and let the (synchronous) route guards work. The server is always
// the source of truth and re-validates via GET /api/me below.
function getStoredUser() {
  // No localStorage during SSR; hydrate the hint on the client.
  if (typeof window === "undefined") return null;
  const user = localStorage.getItem(LS_USER_KEY);
  if (user) {
    return JSON.parse(user);
  }
  return user;
}

function setStoredUser(user: string | null) {
  if (typeof window === "undefined") return;
  if (user) {
    localStorage.setItem(LS_USER_KEY, user);
  } else {
    localStorage.removeItem(LS_USER_KEY);
  }
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [authReady, setAuthReady] = React.useState(false);
  const [user, setUser] = React.useState<AuthUser | null>(getStoredUser());
  const isAuthenticated = !!user;

  // Render immediately from the stored hint, then revalidate the session against
  // the server in the background. Only an explicit 401 clears the session; a
  // transient network error should not log the user out.
  React.useEffect(() => {
    setAuthReady(true);
    let cancelled = false;
    http
      .get("/me")
      .then(({ data }) => {
        if (cancelled) return;
        setStoredUser(JSON.stringify(data));
        setUser(data);
        dispatchUserChange(data);
      })
      .catch((err) => {
        if (cancelled) return;
        if (err?.response?.status === 401) {
          setStoredUser(null);
          setUser(null);
          dispatchUserChange(null);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const dispatchUserChange = (val: AuthUser | null) => {
    if (typeof window === "undefined") return;
    const userEvent = new CustomEvent("mcdoodleUserUpdated", {
      detail: JSON.stringify(val),
    });
    window.dispatchEvent(userEvent);
  };

  const updateUser = (val: AuthUser) => {
    setStoredUser(JSON.stringify(val));
    setUser(val);
    dispatchUserChange(val);
  };

  const login = React.useCallback((val: AuthUser) => {
    setStoredUser(JSON.stringify(val));
    setUser(val);
    dispatchUserChange(val);
  }, []);

  const logout = React.useCallback(() => {
    // Clear the server-side session and cookie (fire-and-forget).
    http.post("/logout").catch(() => {
      /* ignore network errors on logout */
    });
    setStoredUser(null);
    setUser(null);
    dispatchUserChange(null);
  }, []);

  const exposed = {
    isAuthenticated,
    user,
    login,
    logout,
    updateUser,
  };

  // Always render children — the auth hint is read synchronously on the client
  // and revalidated against the server; SSR renders with a null user.
  void authReady;
  return (
    <AuthContext.Provider value={exposed}>{children}</AuthContext.Provider>
  );
};

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
