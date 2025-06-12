// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// import { Button } from "@/components/ui/button";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
// import ThemeToggle from "@/components/ui/theme-toggle";
import { AppSidebar } from "@/features/dashboard/components/app-sidebar";
import { authClient } from "@/lib/auth-client";
import { useAuthStore } from "@/store/store";
import {
  createFileRoute,
  linkOptions,
  Outlet,
  redirect,
} from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard")({
  beforeLoad: async () => {
    const session = await authClient.getSession();

    if (session.data === null) {
      throw redirect({ to: "/auth/login" });
    }
    return {
      success: true,
    };
  },
  loader: () => ({
    crumb: "Dashboard",
  }),
  component: RouteComponent,
});

const options = [
  linkOptions({
    to: "/dashboard/home/overview",
    label: "Principal",
  }),
  linkOptions({
    to: "/dashboard/finances/budgets",
    label: "Finanzas",
  }),
  linkOptions({
    to: "/dashboard/setup/accounts",
    label: "Ajustes",
  }),
];

function RouteComponent() {
  const { user, logout } = useAuthStore();

  return (
    <div>
      <SidebarProvider>
        <AppSidebar />
        <SidebarTrigger />
        <Outlet />
      </SidebarProvider>
    </div>
  );
}
