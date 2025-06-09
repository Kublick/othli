import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

const LoadingComponent = () => {
  return (
    <div className="flex h-[50vh] items-center justify-center">
      <Card>
        <CardHeader>Cargando presupuesto...</CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <p>Estamos buscando los datos de tu presupuesto...</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoadingComponent;
