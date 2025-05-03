import AccountOverview from "@/features/dashboard/components/accounts/account-overview";
import { DatePickerRange } from "@/features/dashboard/components/accounts/date-picker-range";
import SpendingBreakdown from "@/features/dashboard/overview/components/spending-breakdown";
import { useAuthStore } from "@/store/store";
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard/home/overview")({
  component: RouteComponent,
});

function RouteComponent() {
  const { user } = useAuthStore();

  if (!user) {
    throw redirect({ to: "/auth/login" });
  }

  return (
    <div className="container mx-auto">
      <h1 className="sm:text-2xl lg:text-3xl sm:mb-4 font-bold">
        Bienvenido {user.name} !
      </h1>
      <DatePickerRange />
      <div className="grid grid-cols-6 gap-4 my-4 w-full bg-">
        <div className="bg-yellow-50 md:col-span-2">
          <AccountOverview />
        </div>
        <div className="md:col-span-3 ">
          <SpendingBreakdown />
        </div>
        <div className="bg-purple-50">Reminders / Utils</div>
      </div>
    </div>
  );
}
