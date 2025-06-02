import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";

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
import { useEffect, useState } from "react";
import { ChevronRight } from "lucide-react";

import { useGetCategory } from "../../api/get-category";
import { useUpdateCategory } from "../../api/use-update-category";
import {
  updateCategorySchema,
  type UpdateCategorySchemaType,
} from "@/types/index";

interface Props {
  id: string;
}

const CategoryUpdateSheet = ({ id }: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const mutation = useUpdateCategory();

  const { data } = useGetCategory(id, isOpen);

  const form = useForm<UpdateCategorySchemaType>({
    resolver: standardSchemaResolver(updateCategorySchema),
    defaultValues: {
      name: "",
      description: "",
      excludeFromBudget: false,
      excludeFromTotals: false,
      isIncome: false,
    },
  });

  useEffect(() => {
    if (data) {
      form.reset({
        id,
        name: data.name ?? "",
        description: data.description ?? "",
        excludeFromBudget: data.excludeFromBudget ?? false,
        excludeFromTotals: data.excludeFromTotals ?? false, //
        isIncome: data.isIncome ?? false,
      });
    }
  }, [data, form, id]);

  const onSubmit = async (data: UpdateCategorySchemaType) => {
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
        <Button size="icon" variant="ghost">
          <ChevronRight />
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Editar Categoria</SheetTitle>
          <SheetDescription>Actualiza la categoria</SheetDescription>

          <Form {...form}>
            <form
              id="category-form" // Add form ID here
              onSubmit={form.handleSubmit(onSubmit)}
              className="grid space-y-6 mt-4 p-2"
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

              <Card>
                <CardContent className="grid space-y-4">
                  <p>Acciones</p>
                  <Separator className="border-1" />

                  <Button variant={"warning"} className="w-full ">
                    Archivar
                  </Button>
                  <Button variant={"destructive"} className="w-full">
                    Eliminar
                  </Button>
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

                <Button type="submit">Actualizar</Button>
              </div>
            </form>
          </Form>
        </SheetHeader>
      </SheetContent>
    </Sheet>
  );
};

export default CategoryUpdateSheet;
