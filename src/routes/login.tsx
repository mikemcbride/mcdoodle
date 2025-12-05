import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useAuth } from "../auth";
import LoginForm from "../components/LoginForm.tsx";
import { AuthUser } from "../types";
import { z } from "zod";

// Define search params schema for login page
const loginSearchSchema = z.object({
  returnUrl: z.string().optional(),
});

export const Route = createFileRoute("/login")({
  validateSearch: (search) => loginSearchSchema.parse(search),
  component: Login,
});

function Login() {
  const { login, logout } = useAuth();
  const navigate = useNavigate();
  let { returnUrl } = Route.useSearch();
  if (!returnUrl) {
    returnUrl = "/";
  }

  function handleLogin(val: AuthUser | null) {
    if (val === null) {
      logout();
      navigate({ to: "/login" });
    } else {
      login(val);
      navigate({ to: returnUrl });
    }
  }

  return <LoginForm onLogin={handleLogin} />;
}
