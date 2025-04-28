import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import ThemeToggle from "@/components/ui/theme-toggle";
import { authClient } from "@/lib/auth-client";
import { useAuthStore } from "@/store/store";
import {
  createFileRoute,
  Link,
  linkOptions,
  Outlet,
  redirect,
  useMatches,
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
  const matches = useMatches();
  const currentPath = matches[matches.length - 1]?.pathname || "/";

  return (
    <div>
      <div className="flex items-center justify-between container mx-auto sm:mt-6 mt-2">
        <div>
          {options.map((option) => {
            return (
              <Link
                key={option.to}
                {...option}
                activeProps={{ className: `font-bold` }}
                className="p-2"
              >
                <Button
                  variant={"ghost"}
                  className={
                    currentPath === option.to
                      ? "bg-primary text-primary-foreground"
                      : ""
                  }
                >
                  {option.label}
                </Button>
              </Link>
            );
          })}
        </div>
        <div className="flex items-center gap-6">
          <ThemeToggle />
          <Avatar>
            <AvatarImage src={user?.image} />
            <AvatarFallback>{user?.name?.split(" ")[0][0]}</AvatarFallback>
          </Avatar>
          <Button onClick={logout} variant={"ghost"}>
            Salir
          </Button>
        </div>
      </div>
      <Outlet />
    </div>
  );
}
