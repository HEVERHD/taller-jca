import { Badge } from "@/components/ui/badge";
import type { EstadoServicio } from "@/generated/prisma/enums";

const config: Record<EstadoServicio, { label: string; className: string }> = {
  PENDIENTE: { label: "Pendiente", className: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border-yellow-200" },
  EN_PROCESO: { label: "En Proceso", className: "bg-blue-100 text-blue-800 hover:bg-blue-100 border-blue-200" },
  TERMINADO: { label: "Terminado", className: "bg-green-100 text-green-800 hover:bg-green-100 border-green-200" },
};

export function StatusBadge({ estado }: { estado: EstadoServicio }) {
  const { label, className } = config[estado];
  return (
    <Badge variant="outline" className={className}>
      {label}
    </Badge>
  );
}
