import React from "react";
import { AuthContext } from "./context/AuthContext";
import { AuthUser } from "./types";

const LS_USER_KEY = "mcdoodle.user";

function getStoredUser() {
  const user = localStorage.getItem(LS_USER_KEY);
  if (user) {
    return JSON.parse(user);
  }
  return user;
}

function setStoredUser(user: string | null) {
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

  // check for user in localStorage when the app loads
  React.useEffect(() => {
    setUser(getStoredUser());
    setAuthReady(true);
  }, []);

  const updateUser = (val: AuthUser) => {
    setStoredUser(JSON.stringify(val));
    setUser(val);
    dispatchUserChange(val);
  };

  const dispatchUserChange = (val: AuthUser | null) => {
    const userEvent = new CustomEvent("mcdoodleUserUpdated", {
      detail: JSON.stringify(val),
    });
    window.dispatchEvent(userEvent);
  };

  const login = React.useCallback((val: AuthUser) => {
    setStoredUser(JSON.stringify(val));
    setUser(val);
    dispatchUserChange(val);
  }, []);

  const logout = React.useCallback(() => {
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

  // Don't render children until we've checked localStorage for a user
  if (authReady) {
    return (
      <AuthContext.Provider value={exposed}>{children}</AuthContext.Provider>
    );
  } else {
    return null;
  }
};

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
