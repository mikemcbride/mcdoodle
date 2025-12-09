import { Outlet, createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_auth")({
  beforeLoad: () => {
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
