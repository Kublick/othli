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
// import { insertCategorySchema } from "@/server/db/schema";
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
import { Separator } from "@radix-ui/react-separator";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { useState } from "react";
import { useCreateCategory } from "../../api/use-create-category";

export const insertCategorySchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  excludeFromBudget: z.boolean(),
  excludeFromTotals: z.boolean(),
  isIncome: z.boolean(),
});

export type InsertCategory = z.infer<typeof insertCategorySchema>;

const CategorySheet = () => {
  const [isOpen, setIsOpen] = useState(false);
  const mutation = useCreateCategory();

  const form = useForm<z.infer<typeof insertCategorySchema>>({
    resolver: zodResolver(insertCategorySchema),
    defaultValues: {
      name: "",
      description: "",
      excludeFromBudget: false,
      excludeFromTotals: false,
      isIncome: false,
    },
  });

  const onSubmit = async (data: z.infer<typeof insertCategorySchema>) => {
    mutation.mutate(data);
    form.reset();
    setIsOpen(false);
  };

  const handleCancel = () => {
    form.reset();
    setIsOpen(false);
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button>Agregar</Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Nueva Categoria</SheetTitle>
          <SheetDescription>Crea nuevas categorias</SheetDescription>

          <Form {...form}>
            <form
              id="category-form" // Add form ID here
              onSubmit={form.handleSubmit(onSubmit)}
              className="grid space-y-6 mt-4"
            >
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre</FormLabel>
                    <FormControl>
                      <Input placeholder="Nombra la categoria" {...field} />
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
                    <FormLabel>Descripcion</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Descripcion"
                        {...field}
                        value={field.value ?? ""}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Card>
                <CardContent className="grird space-y-6">
                  <p>Propiedades</p>
                  <Separator className="border-1" />
                  <FormField
                    control={form.control}
                    name="isIncome"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                        <div className="space-y-0.5">
                          <FormLabel>¿Es ingreso?</FormLabel>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="excludeFromBudget"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                        <div className="space-y-0.5">
                          <FormLabel>Excluir del presupuesto</FormLabel>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="excludeFromTotals"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                        <div className="space-y-0.5">
                          <FormLabel>Excluir del total</FormLabel>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
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

export default CategorySheet;
