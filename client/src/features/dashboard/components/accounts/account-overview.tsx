import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getUserAccounts } from "@/features/dashboard/api/get-user-accounts";
import { formatCurrency } from "@/lib/utils";
import { ChevronDown, ChevronRight, Loader2 } from "lucide-react";
import { useState } from "react";

const AccountOverview = () => {
  const { data, isLoading } = getUserAccounts();

  

  const [expandedSections, setExpandedSections] = useState({
    cash: true,
    investment: true,
    credit: true,
  });

  const toggleSection = (section: "cash" | "investment" | "credit") => {
    setExpandedSections({
      ...expandedSections,
      [section]: !expandedSections[section],
    });
  };

  console.log("🚀 ~ AccountOverview ~ data:", data);

  if (isLoading)
    return (
      <div className="grid gap-4">
        <Card>
          <CardHeader className="text-center text-muted-foreground">
            <h2 className="font-medium">Resumen de Cuentas</h2>

            <Separator />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 justify-center">
              <Loader2 className="animate-spin h-6 w-6" />
              Cargando tus cuentas
            </div>
          </CardContent>
        </Card>
      </div>
    );

  const debito = data?.filter(
    (a) => a.typeName === "debito" || a.typeName === "efectivo"
  );
  const debitoTotal = debito?.reduce((acc, a) => acc + Number(a.balance), 0);

  const investments = data?.filter((a) => a.typeName === "inversion");
  const investmentTotal = investments?.reduce(
    (acc, a) => acc + Number(a.balance),
    0
  );

  const credito = data?.filter((a) => a.typeName === "credito");
  const creditoTotal = credito?.reduce((acc, a) => acc + Number(a.balance), 0);

  const netWorth = data?.reduce((acc, a) => acc + Number(a.balance), 0);

  return (
    <div className="grid gap-4">
      <Card>
        <CardHeader>
          <h2 className="font-semibold text-muted-foreground">
            Resumen de Cuentas
          </h2>
          <Separator />
        </CardHeader>
        <CardContent>
          <div className="border-b">
            <div
              className="p-3 flex items-center justify-between hover:bg-accent/20 cursor-pointer"
              onClick={() => toggleSection("cash")}
            >
              <div className="flex items-center">
                {expandedSections.cash ? (
                  <ChevronDown className="w-5 h-5 text-gray-500 mr-2" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-gray-500 mr-2" />
                )}
                <span className="font-medium">Debito ({debito?.length})</span>
              </div>
              <span className="font-medium font-mono">
                {formatCurrency(Number(debitoTotal))}
              </span>
            </div>
            {expandedSections.cash && (
              <div>
                {debito?.map((a) => (
                  <div key={a.name}>
                    <div className="pl-10 pr-3 py-2 border-t flex items-center justify-between hover:bg-accent/10 text-sm">
                      <span className="text-teal-600 font-medium">
                        {a.name}
                      </span>
                      <span className="font-mono">
                        {" "}
                        {formatCurrency(Number(a.balance))}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="border-b">
            <div
              className="p-3 flex items-center justify-between hover:bg-accent/20 cursor-pointer"
              onClick={() => toggleSection("credit")}
            >
              <div className="flex items-center">
                {expandedSections.cash ? (
                  <ChevronDown className="w-5 h-5 text-gray-500 mr-2" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-gray-500 mr-2" />
                )}
                <span className="font-medium">Credito ({credito?.length})</span>
              </div>
              <span className="font-medium font-mono">
                {formatCurrency(Number(creditoTotal))}
              </span>
            </div>
            {expandedSections.credit && (
              <div>
                {credito?.map((a) => (
                  <div key={a.name}>
                    <div className="pl-10 pr-3 py-2 border-t flex items-center justify-between hover:bg-accent/10 text-sm">
                      <span className="text-teal-600 font-medium">
                        {a.name}
                      </span>
                      <span className="font-mono">
                        {formatCurrency(Number(a.balance))}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="border-b">
            <div
              className="p-3 flex items-center justify-between hover:bg-accent/20 cursor-pointer"
              onClick={() => toggleSection("investment")}
            >
              <div className="flex items-center">
                {expandedSections.investment ? (
                  <ChevronDown className="w-5 h-5 text-gray-500 mr-2" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-gray-500 mr-2" />
                )}
                <span className="font-medium">
                  Inversiones ({investments?.length})
                </span>
              </div>
              <span className="font-medium font-mono">
                {formatCurrency(Number(investmentTotal))}
              </span>
            </div>
            {expandedSections.investment && (
              <div>
                {investments?.map((a) => (
                  <div key={a.name}>
                    <div className="pl-10 pr-3 py-2 border-t flex items-center justify-between hover:bg-accent/10 text-sm">
                      <span className="text-teal-600 font-medium">
                        {a.name}
                      </span>
                      <span className="font-mono">
                        {formatCurrency(Number(a.balance))}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-4 flex items-center justify-between">
            <span className="font-medium">Total patrimonio estimado</span>
            <span className="font-medium">
              {formatCurrency(Number(netWorth))}
            </span>
          </div>
        </CardContent>
      </Card>

      <div>Summary</div>
    </div>
  );
};

export default AccountOverview;
