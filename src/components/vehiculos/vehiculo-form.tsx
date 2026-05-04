"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { vehiculoSchema, type VehiculoFormValues, type VehiculoInput } from "@/types";
import { createVehiculo, updateVehiculo } from "@/actions/vehiculos";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

type ClienteOption = { id: string; nombre: string; telefono: string };

interface VehiculoFormProps {
  clientes: ClienteOption[];
  defaultValues?: Partial<VehiculoInput>;
  id?: string;
  defaultClienteId?: string;
}

export function VehiculoForm({ clientes, defaultValues, id, defaultClienteId }: VehiculoFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [serverErrors, setServerErrors] = useState<Record<string, string[]>>({});

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<VehiculoFormValues, unknown, VehiculoInput>({
    resolver: zodResolver(vehiculoSchema) as never,
    defaultValues: defaultValues ?? {
      placa: "",
      marca: "",
      modelo: "",
      kilometraje: 0,
      clienteId: defaultClienteId ?? "",
    },
  });

  function onSubmit(data: VehiculoInput) {
    startTransition(async () => {
      const result = id
        ? await updateVehiculo(id, data)
        : await createVehiculo(data);

      if (result?.error) {
        setServerErrors(result.error as Record<string, string[]>);
        toast.error("Por favor corrige los errores del formulario");
      } else {
        toast.success(id ? "Vehículo actualizado" : "Vehículo registrado");
        router.refresh();
      }
    });
  }

  const fieldError = (field: keyof VehiculoInput) =>
    errors[field]?.message ?? serverErrors[field]?.[0];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 max-w-lg">
      <div className="space-y-1.5">
        <Label htmlFor="clienteId">Cliente *</Label>
        <select
          id="clienteId"
          {...register("clienteId")}
          className="w-full rounded-md border border-zinc-700 px-3 py-2 text-sm bg-zinc-800 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
        >
          <option value="">Seleccionar cliente...</option>
          {clientes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nombre} — {c.telefono}
            </option>
          ))}
        </select>
        {fieldError("clienteId") && (
          <p className="text-xs text-red-500">{fieldError("clienteId")}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="placa">Placa *</Label>
        <Input
          id="placa"
          placeholder="Ej: ABC123"
          className="uppercase"
          {...register("placa")}
        />
        {fieldError("placa") && (
          <p className="text-xs text-red-500">{fieldError("placa")}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="marca">Marca *</Label>
          <Input id="marca" placeholder="Ej: Toyota" {...register("marca")} />
          {fieldError("marca") && (
            <p className="text-xs text-red-500">{fieldError("marca")}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="modelo">Modelo *</Label>
          <Input id="modelo" placeholder="Ej: Corolla 2020" {...register("modelo")} />
          {fieldError("modelo") && (
            <p className="text-xs text-red-500">{fieldError("modelo")}</p>
          )}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="kilometraje">Kilometraje *</Label>
        <Input
          id="kilometraje"
          type="number"
          min={0}
          placeholder="Ej: 45000"
          {...register("kilometraje")}
        />
        {fieldError("kilometraje") && (
          <p className="text-xs text-red-500">{fieldError("kilometraje")}</p>
        )}
      </div>

      <div className="flex items-center gap-3 pt-2">
        <Button
          type="submit"
          disabled={isPending}
          className="bg-orange-500 hover:bg-orange-600 text-white"
        >
          {isPending ? "Guardando..." : id ? "Actualizar Vehículo" : "Registrar Vehículo"}
        </Button>
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex h-8 items-center justify-center rounded-lg border border-zinc-700 bg-zinc-800 px-3 text-sm font-medium text-zinc-300 hover:bg-zinc-700 transition-colors"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
