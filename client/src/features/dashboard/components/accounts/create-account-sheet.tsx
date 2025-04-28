import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useState } from "react";
import { CreateAccount } from "./create-account";

const CreateAccountSheet = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button>Agregar</Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Nueva Cuenta</SheetTitle>
          <SheetDescription>Crea una cuentas</SheetDescription>

          <CreateAccount setIsOpen={setIsOpen} />
        </SheetHeader>
      </SheetContent>
    </Sheet>
  );
};

export default CreateAccountSheet;
