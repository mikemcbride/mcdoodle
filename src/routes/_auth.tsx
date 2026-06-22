import { Outlet, createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_auth")({
  beforeLoad: () => {
    // Auth gating runs on the client; SSR renders and the client re-checks.
    if (typeof window === "undefined") return;
    if (window.localStorage.getItem("mcdoodle.user") === null) {
      throw redirect({
        to: "/login",
        search: {
          returnUrl: window.location.pathname,
        },
      });
    }
  },
  component: Outlet,
});
