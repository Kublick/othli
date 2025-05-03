import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { getTransactionHistoryById } from "../../api/get-transactionHistory-id";
import { Button } from "@/components/ui/button";
import { UserCircle } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale/es";

interface Props {
  id: string;
}
const TransactionHistoryButton = ({ id }: Props) => {
  const { data, isLoading } = getTransactionHistoryById(id);

  if (isLoading) return <div>Obteniendo el historial</div>;

  if (!data) return <div>No hay historial</div>;
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="secondary">Historial</Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Historial de cambios</SheetTitle>
          <SheetDescription></SheetDescription>
          {data?.map((t) => {
            const eventDate = new Date(t.timestamp!);

            switch (t.action) {
              case "created":
                t.action = "Transaccion creada";
                break;
              case "updated":
                console.log(t.details.field);
                if (t.details.field === "payeeId") {
                  t.action = `Se actualizo beneficiario de ${t.details.oldValueName} a ${t.details.newValueName}`;
                }

                if (t.details.field === "categoryId") {
                  t.action = `Se actualizo categoria de ${t.details.oldValueName} a ${t.details.newValueName}`;
                }

                break;
            }

            return (
              <div key={t.id} className=" py-2">
                <div className="flex gap-2 items-center">
                  <UserCircle size={24} className="text-primary" />

                  <p className="text-sm">
                    {format(eventDate, "PPP", { locale: es })}{" "}
                    <span>
                      (
                      {formatDistanceToNow(eventDate, {
                        addSuffix: true,
                        locale: es,
                      })}
                      )
                    </span>
                  </p>
                </div>
                <p className="ml-8 font-semibold text-muted-foreground ">
                  {t.action}
                </p>
              </div>
            );
          })}
        </SheetHeader>
      </SheetContent>
    </Sheet>
  );
};

export default TransactionHistoryButton;
