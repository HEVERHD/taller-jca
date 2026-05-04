"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cambiarEstado } from "@/actions/servicios";
import type { EstadoServicio } from "@/generated/prisma/enums";
import { cn } from "@/lib/utils";
import { Clock, Wrench, CheckCircle2 } from "lucide-react";

interface StatusChangerProps {
  servicioId: string;
  estadoActual: EstadoServicio;
}

const ESTADOS: {
  value: EstadoServicio;
  label: string;
  icon: React.ElementType;
  activeClass: string;
}[] = [
  {
    value: "PENDIENTE",
    label: "Pendiente",
    icon: Clock,
    activeClass: "bg-yellow-100 text-yellow-700 border-yellow-300",
  },
  {
    value: "EN_PROCESO",
    label: "En Proceso",
    icon: Wrench,
    activeClass: "bg-blue-100 text-blue-700 border-blue-300",
  },
  {
    value: "TERMINADO",
    label: "Terminado",
    icon: CheckCircle2,
    activeClass: "bg-green-100 text-green-700 border-green-300",
  },
];

export function StatusChanger({ servicioId, estadoActual }: StatusChangerProps) {
  const [isPending, startTransition] = useTransition();

  function handleChange(estado: EstadoServicio) {
    if (estado === estadoActual) return;
    startTransition(async () => {
      await cambiarEstado(servicioId, estado);
      toast.success(`Estado actualizado a "${ESTADOS.find((e) => e.value === estado)?.label}"`);
    });
  }

  return (
    <div className="flex flex-wrap gap-2">
      {ESTADOS.map(({ value, label, icon: Icon, activeClass }) => {
        const isActive = estadoActual === value;
        return (
          <Button
            key={value}
            variant="outline"
            size="sm"
            disabled={isPending || isActive}
            onClick={() => handleChange(value)}
            className={cn(
              "gap-2 transition-colors",
              isActive
                ? activeClass + " font-semibold cursor-default"
                : "hover:bg-zinc-50"
            )}
          >
            <Icon className="w-4 h-4" />
            {label}
            {isActive && " ✓"}
          </Button>
        );
      })}
    </div>
  );
}
