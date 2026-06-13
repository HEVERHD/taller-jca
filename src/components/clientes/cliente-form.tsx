"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { clienteSchema, vehiculoSchema, type ClienteInput } from "@/types";
import { createCliente, createClienteConVehiculo, updateCliente } from "@/actions/clientes";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Car, X, ChevronLeft, ChevronRight } from "lucide-react";

// Subschema para vehículo sin clienteId
const vehiculoNuevoSchema = vehiculoSchema.omit({ clienteId: true });
type VehiculoNuevoValues = z.input<typeof vehiculoNuevoSchema>;
type VehiculoNuevoInput  = z.output<typeof vehiculoNuevoSchema>;

interface ClienteFormProps {
  defaultValues?: Partial<ClienteInput>;
  id?: string;
}

const STEPS = ["Datos", "Vehículo"] as const;

export function ClienteForm({ defaultValues, id }: ClienteFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [serverErrors, setServerErrors]     = useState<Record<string, string[]>>({});
  const [serverVehiculoErrors, setServerVehiculoErrors] = useState<Record<string, string[]>>({});
  const [agregarVehiculo, setAgregarVehiculo] = useState(false);
  // Edit mode has only 1 step; create mode has 2
  const [step, setStep] = useState(1);

  const clienteForm = useForm<ClienteInput>({
    resolver: zodResolver(clienteSchema),
    defaultValues: defaultValues ?? { nombre: "", telefono: "", email: "" },
  });

  const vehiculoForm = useForm<VehiculoNuevoValues, unknown, VehiculoNuevoInput>({
    resolver: zodResolver(vehiculoNuevoSchema) as never,
    defaultValues: { placa: "", marca: "", modelo: "", kilometraje: 0 },
  });

  async function handleNext() {
    const valid = await clienteForm.trigger(["nombre", "telefono", "email"]);
    if (valid) setStep(2);
  }

  function onSubmit(clienteData: ClienteInput) {
    startTransition(async () => {
      // ── Edición: sin vehículo ──────────────────────────────────────────────
      if (id) {
        const result = await updateCliente(id, clienteData);
        if (result?.error) {
          setServerErrors(result.error as Record<string, string[]>);
          toast.error("Corrige los errores del formulario");
        } else {
          toast.success("Cliente actualizado");
          router.refresh();
        }
        return;
      }

      // ── Crear sin vehículo ─────────────────────────────────────────────────
      if (!agregarVehiculo) {
        const result = await createCliente(clienteData);
        if (result?.error) {
          setServerErrors(result.error as Record<string, string[]>);
          toast.error("Corrige los errores del formulario");
        }
        return;
      }

      // ── Crear con vehículo ─────────────────────────────────────────────────
      const vehiculoValido = await vehiculoForm.trigger();
      if (!vehiculoValido) {
        toast.error("Revisa los datos del vehículo");
        return;
      }

      const rawVehiculo = vehiculoForm.getValues();
      const parsedVehiculo = vehiculoNuevoSchema.safeParse(rawVehiculo);
      if (!parsedVehiculo.success) {
        toast.error("Revisa los datos del vehículo");
        return;
      }

      const result = await createClienteConVehiculo(clienteData, parsedVehiculo.data);
      if (result?.error) {
        setServerErrors(result.error as Record<string, string[]>);
        toast.error("Corrige los errores del formulario");
        return;
      }
      if (result?.vehiculoError) {
        setServerVehiculoErrors(result.vehiculoError as Record<string, string[]>);
        toast.error("Revisa los datos del vehículo");
      }
    });
  }

  const clienteFieldError = (field: keyof ClienteInput) =>
    clienteForm.formState.errors[field]?.message ?? serverErrors[field]?.[0];

  const vehiculoFieldError = (field: keyof VehiculoNuevoInput) =>
    (vehiculoForm.formState.errors[field] as { message?: string } | undefined)?.message ??
    serverVehiculoErrors[field]?.[0];

  return (
    <form onSubmit={clienteForm.handleSubmit(onSubmit)} className="space-y-5 max-w-lg">

      {/* ── Indicador de pasos (solo al crear) ───────────────────────── */}
      {!id && (
        <div className="flex items-center gap-1">
          {STEPS.map((label, i) => {
            const s = i + 1;
            const isActive = s === step;
            const isDone   = s < step;
            return (
              <div key={s} className="flex items-center gap-1">
                <div className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold shrink-0 transition-colors ${
                  isActive ? "bg-orange-500 text-white" :
                  isDone   ? "bg-orange-500/25 text-orange-400" :
                             "bg-zinc-800 border border-zinc-700 text-zinc-500"
                }`}>
                  {s}
                </div>
                <span className={`text-xs font-medium ${isActive ? "text-zinc-200" : "text-zinc-500"}`}>
                  {label}
                </span>
                {s < STEPS.length && (
                  <div className={`w-6 h-px mx-1 ${isDone ? "bg-orange-500/40" : "bg-zinc-700"}`} />
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── Paso 1: Datos del cliente ─────────────────────────────────── */}
      {step === 1 && (
        <>
          <div className="space-y-1.5">
            <Label htmlFor="nombre">Nombre completo *</Label>
            <Input id="nombre" placeholder="Ej: Carlos Rodríguez" {...clienteForm.register("nombre")} />
            {clienteFieldError("nombre") && (
              <p className="text-xs text-red-500">{clienteFieldError("nombre")}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="telefono">Teléfono *</Label>
            <Input id="telefono" placeholder="Ej: 3001234567" {...clienteForm.register("telefono")} />
            {clienteFieldError("telefono") && (
              <p className="text-xs text-red-500">{clienteFieldError("telefono")}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email">Email (opcional)</Label>
            <Input id="email" type="email" placeholder="cliente@email.com" {...clienteForm.register("email")} />
            {clienteFieldError("email") && (
              <p className="text-xs text-red-500">{clienteFieldError("email")}</p>
            )}
          </div>

          <div className="flex items-center gap-3 pt-2">
            {id ? (
              <Button type="submit" disabled={isPending} className="bg-orange-500 hover:bg-orange-600 text-white">
                {isPending ? "Guardando..." : "Actualizar Cliente"}
              </Button>
            ) : (
              <Button type="button" onClick={handleNext} className="bg-orange-500 hover:bg-orange-600 text-white gap-1">
                Siguiente <ChevronRight className="w-4 h-4" />
              </Button>
            )}
            <button
              type="button"
              onClick={() => router.back()}
              className="inline-flex h-9 items-center justify-center rounded-lg border border-zinc-700 bg-zinc-800 px-3 text-sm font-medium text-zinc-300 hover:bg-zinc-700 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </>
      )}

      {/* ── Paso 2: Vehículo (solo al crear) ─────────────────────────── */}
      {step === 2 && !id && (
        <>
          {!agregarVehiculo ? (
            <div className="space-y-4 py-2">
              <p className="text-sm text-zinc-400">¿Deseas registrar el vehículo del cliente ahora?</p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setAgregarVehiculo(true)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-orange-800/40 bg-orange-950/20 text-sm font-medium text-orange-400 hover:bg-orange-900/30 transition-colors"
                >
                  <Car className="w-4 h-4" />
                  Sí, agregar vehículo
                </button>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-orange-800/40 bg-orange-950/20 p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Car className="w-4 h-4 text-orange-500" />
                  <p className="text-sm font-semibold text-zinc-200">Datos del vehículo</p>
                </div>
                <button
                  type="button"
                  onClick={() => { setAgregarVehiculo(false); vehiculoForm.reset(); }}
                  className="p-1 rounded-md hover:bg-orange-900/30 text-zinc-400 hover:text-zinc-200 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="placa">Placa *</Label>
                <Input
                  id="placa"
                  placeholder="Ej: ABC123"
                  className="uppercase"
                  {...vehiculoForm.register("placa")}
                />
                {vehiculoFieldError("placa") && (
                  <p className="text-xs text-red-500">{vehiculoFieldError("placa")}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="marca">Marca *</Label>
                  <Input id="marca" placeholder="Ej: Toyota" {...vehiculoForm.register("marca")} />
                  {vehiculoFieldError("marca") && (
                    <p className="text-xs text-red-500">{vehiculoFieldError("marca")}</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="modelo">Modelo *</Label>
                  <Input id="modelo" placeholder="Ej: Corolla 2020" {...vehiculoForm.register("modelo")} />
                  {vehiculoFieldError("modelo") && (
                    <p className="text-xs text-red-500">{vehiculoFieldError("modelo")}</p>
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
                  {...vehiculoForm.register("kilometraje")}
                />
                {vehiculoFieldError("kilometraje") && (
                  <p className="text-xs text-red-500">{vehiculoFieldError("kilometraje")}</p>
                )}
              </div>
            </div>
          )}

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="inline-flex h-9 items-center justify-center rounded-lg border border-zinc-700 bg-zinc-800 px-3 text-sm font-medium text-zinc-300 hover:bg-zinc-700 transition-colors gap-1"
            >
              <ChevronLeft className="w-4 h-4" /> Anterior
            </button>
            <Button type="submit" disabled={isPending} className="bg-orange-500 hover:bg-orange-600 text-white">
              {isPending
                ? "Guardando..."
                : agregarVehiculo
                  ? "Crear Cliente y Vehículo"
                  : "Crear Cliente"}
            </Button>
          </div>
        </>
      )}
    </form>
  );
}
