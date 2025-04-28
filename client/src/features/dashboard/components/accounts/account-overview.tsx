import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const data = {
  accounts: {
    cash: [
      {
        name: "Taylor's Checking",
        balance: 27845.16,
      },
      {
        name: "Alonso Checking",
        balance: 30000,
      },
    ],
    credit: [
      {
        name: "Taylor's Visa Card",
        balance: -842.75,
      },
      {
        name: "Morgan's Discover Card",
        balance: -1295.6,
      },
    ],
  },
  summary: {
    totalCash: 27845.16,
    totalInvestment: 38750.23,
    totalCredit: -2138.35,
    estimatedNetWorth: 64457.04,
  },
};

const AccountOverview = () => {
  return (
    <div className="grid gap-4">
      <Card>
        <CardHeader className="text-center text-muted-foreground">
          Resumen de cuentas
          <Separator />
        </CardHeader>
        <CardContent>
          <div className="">
            {data.accounts.cash.map((a) => (
              <div key={a.name} className="flex justify-between text-sm">
                <p>{a.name}</p>
                <p>{a.balance}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div>Summary</div>
    </div>
  );
};

export default AccountOverview;
