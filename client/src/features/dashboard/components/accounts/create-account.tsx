import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useCreateAccounts } from "../../api/use-create-account";
import { insertAccountSchema, type InsertAccountType } from "@/types/index";

interface Props {
  setIsOpen: (isOpen: boolean) => void;
}

export function CreateAccount({ setIsOpen }: Props) {
  const mutation = useCreateAccounts();

  const form = useForm<InsertAccountType>({
    resolver: standardSchemaResolver(insertAccountSchema),
    defaultValues: {
      name: "",
      balance: "",
      institutionName: "",
    },
  });

  const onSubmit = async (values: InsertAccountType) => {
    const { name, typeName, balance, institutionName } = values;

    const data = {
      name,
      typeName,
      balance,
      institutionName,
    };

    mutation.mutate(data);
    setIsOpen(false);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="grid gap-4 py-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre</FormLabel>
                <FormControl>
                  <Input placeholder="Nombre" {...field} />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="typeName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo</FormLabel>
                <FormControl>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecciona un tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="efectivo">Efectivo</SelectItem>
                      <SelectItem value="debito">Debito</SelectItem>
                      <SelectItem value="credito">Credito</SelectItem>
                      <SelectItem value="inversion">Inversion</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="balance"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Saldo</FormLabel>
                <FormControl>
                  <Input placeholder="Saldo" {...field} type="number" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="institutionName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre Institucion</FormLabel>
                <FormControl>
                  <Input
                    placeholder="HSBC / Santander / Banorte"
                    {...field}
                    value={field.value ?? ""}
                  />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />

          <Button variant="destructive" onClick={() => setIsOpen(false)}>
            Cancelar
          </Button>
          <Button type="submit">Crear</Button>
        </div>
      </form>
    </Form>
  );
}
