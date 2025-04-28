import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import { useState } from "react";

import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns/format";
import { es } from "date-fns/locale/es"; // Import the Spanish locale
import { CalendarIcon } from "lucide-react";

import { getUserAccounts } from "../../api/get-user-accounts";

import { getCategories } from "../../api/get-categories";
import { getPayees } from "../../api/get-payees";
import { useCreateTransaction } from "../../api/use-create-transaction";
import { MyCombobox } from "@/components/ui/combobox";

export const insertTransactionSchema = z.object({
  date: z.coerce.date(),
  categoryId: z.union([z.coerce.number(), z.string()]),
  payeeId: z.union([z.coerce.number(), z.string()]),
  accountId: z.string().min(1, { message: "Ingrese una cuenta" }), // Add validation
  amount: z.coerce.number().refine((val) => !isNaN(val), {
    message: "Debe ingresar un monto válido",
  }),
  description: z.string(),
});

export type InsertTransaction = z.infer<typeof insertTransactionSchema>;

const CreateTransactionSheet = () => {
  const { data: accounts } = getUserAccounts();
  const { data: categories } = getCategories();
  const { data: payees } = getPayees();

  const [isOpen, setIsOpen] = useState(false);
  const mutation = useCreateTransaction();

  const form = useForm<z.infer<typeof insertTransactionSchema>>({
    resolver: zodResolver(insertTransactionSchema),
    defaultValues: {
      date: new Date(),
      categoryId: undefined,
      payeeId: undefined,
      accountId: undefined,
      amount: undefined,
      description: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof insertTransactionSchema>) => {
    console.log(data);

    mutation.mutate(data);
    form.reset();
    setIsOpen(false);
  };

  const handleCancel = () => {
    form.reset();
    setIsOpen(false);
  };

  const accountsMap = accounts?.map((account) => ({
    value: account.id,
    label: account.name,
  }));

  const categoriesMap = categories?.map((category) => ({
    value: category.id.toString(),
    label: category.name,
  }));

  const payeesMap = payees?.map((payee) => ({
    value: payee.id.toString(),
    label: payee.name,
  }));

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button>Agregar</Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Nueva Transaccion</SheetTitle>
          <SheetDescription>Agrega una nueva transaccion</SheetDescription>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="grid space-y-6 mt-4"
            >
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Fecha</FormLabel>{" "}
                    {/* Changed label to Spanish */}
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              // Pass the Spanish locale to format
                              format(field.value, "PPP", { locale: es })
                            ) : (
                              <span>Selecciona una fecha</span> // Changed placeholder to Spanish
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date("1900-01-01")}
                          initialFocus
                          locale={es} // Pass locale to Calendar component as well
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoria</FormLabel>
                    <FormControl>
                      <MyCombobox
                        options={categoriesMap ?? []}
                        placeholder="Seleccciona una categoria"
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="payeeId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Beneficiario</FormLabel>
                    <FormControl>
                      <MyCombobox
                        options={payeesMap ?? []}
                        placeholder="Seleccciona una categoria"
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Monto</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="1.00"
                        {...field}
                        value={field.value ?? ""}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notas</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Notas"
                        {...field}
                        value={field.value ?? ""}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="accountId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cuenta</FormLabel>
                    <FormControl>
                      <MyCombobox
                        options={accountsMap ?? []}
                        placeholder="Seleccciona una categoria"
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end mt-6 space-x-4">
                <Button
                  type="button"
                  onClick={handleCancel}
                  variant={"destructive"}
                  disabled={mutation.isPending}
                >
                  Cancelar
                </Button>

                <Button type="submit">Agregar</Button>
              </div>
            </form>
          </Form>
        </SheetHeader>
      </SheetContent>
    </Sheet>
  );
};

export default CreateTransactionSheet;
