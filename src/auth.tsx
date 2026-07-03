import React from "react";
import { AuthContext } from "./context/AuthContext";
import { AuthUser } from "./types";
import http from "./services/http";

// NOTE: the real credential is an HttpOnly session cookie the browser sends
// automatically and the server validates. The authoritative user is resolved
// server-side in the root loader and seeded here, so guards and the header
// render the correct auth state on the very first paint (server and client).
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

  const updateUser = (val: AuthUser) => {
    setUser(val);
  };

  const login = React.useCallback((val: AuthUser) => {
    setUser(val);
  }, []);

  const logout = React.useCallback(() => {
    // Clear the server-side session and cookie (fire-and-forget).
    http.post("/logout").catch(() => {
      /* ignore network errors on logout */
    });
    setUser(null);
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


