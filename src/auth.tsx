import React from "react";
import { AuthContext } from "./context/AuthContext";
import { AuthUser } from "./types";
import http from "./services/http";

const LS_USER_KEY = "mcdoodle.user";

// NOTE: the real credential is an HttpOnly session cookie the browser sends
// automatically and the server validates. The value we keep in localStorage is
// only a non-sensitive "hint" so the (synchronous) client route guards work.
// The authoritative user is resolved server-side in the root loader.
function setStoredUser(user: string | null) {
  if (typeof window === "undefined") return;
  if (user) {
    localStorage.setItem(LS_USER_KEY, user);
  } else {
    localStorage.removeItem(LS_USER_KEY);
  }
}

export const AuthProvider = ({
  children,
  initialUser = null,
}: {
  children: React.ReactNode;
  // Resolved on the server from the session cookie (see root route loader) so
  // the first render — server and client — reflects the real auth state.
  initialUser?: AuthUser | null;
}) => {
  const [user, setUser] = React.useState<AuthUser | null>(initialUser);
  const isAuthenticated = !!user;

  // Keep the localStorage hint in sync with the server-resolved user (used only
  // by the synchronous client route guards).
  React.useEffect(() => {
    setStoredUser(initialUser ? JSON.stringify(initialUser) : null);
  }, [initialUser]);

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
