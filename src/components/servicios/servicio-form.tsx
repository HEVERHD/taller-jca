"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { format } from "date-fns";
import { servicioSchema, type ServicioFormValues, type ServicioInput } from "@/types";
import { createServicio, updateServicio } from "@/actions/servicios";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ChevronLeft, ChevronRight } from "lucide-react";

function toDisplayCOP(raw: string | number | null | undefined): string {
  if (raw == null || raw === "") return "";
  const digits = String(raw).replace(/\D/g, "");
  if (!digits) return "";
  return Number(digits).toLocaleString("es-CO");
}

type VehiculoOption = {
  id: string;
  placa: string;
  marca: string;
  modelo: string;
  cliente: { nombre: string };
};

interface ServicioFormProps {
  vehiculos: VehiculoOption[];
  defaultValues?: Partial<ServicioInput>;
  id?: string;
  defaultVehiculoId?: string;
}

const ESTADOS = [
  { value: "PENDIENTE", label: "Pendiente" },
  { value: "EN_PROCESO", label: "En Proceso" },
  { value: "TERMINADO", label: "Terminado" },
] as const;

const STEPS = ["Vehículo", "Costos", "Diagnóstico"] as const;

// Fields to validate per step before advancing
const STEP_FIELDS: Record<number, (keyof ServicioInput)[]> = {
  1: ["vehiculoId", "fecha", "estado"],
  2: ["mecanicoAsignado"],
};

export function ServicioForm({ vehiculos, defaultValues, id, defaultVehiculoId }: ServicioFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [serverErrors, setServerErrors] = useState<Record<string, string[]>>({});
  const [step, setStep] = useState(1);

  const {
    register,
    handleSubmit,
    control,
    trigger,
    formState: { errors },
  } = useForm<ServicioFormValues, unknown, ServicioInput>({
    resolver: zodResolver(servicioSchema) as never,
    defaultValues: defaultValues ?? {
      fecha: new Date(),
      diagnostico: "",
      trabajoRealizado: "",
      mecanicoAsignado: "",
      estado: "PENDIENTE",
      vehiculoId: defaultVehiculoId ?? "",
    },
  });

  async function handleNext() {
    const fields = STEP_FIELDS[step];
    const valid = fields ? await trigger(fields) : true;
    if (valid) setStep((s) => s + 1);
  }

  function onSubmit(data: ServicioInput) {
    startTransition(async () => {
      const result = id
        ? await updateServicio(id, data)
        : await createServicio(data);

      if (result?.error) {
        setServerErrors(result.error as Record<string, string[]>);
        toast.error("Por favor corrige los errores del formulario");
      } else {
        toast.success(id ? "Servicio actualizado" : "Orden de servicio creada");
        router.refresh();
      }
    });
  }

  const fieldError = (field: keyof ServicioInput) =>
    errors[field]?.message ?? serverErrors[field]?.[0];

  const todayStr = format(new Date(), "yyyy-MM-dd");

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 max-w-xl">

      {/* ── Indicador de pasos ────────────────────────────────────────── */}
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

      {/* ── Paso 1: Vehículo y Fecha ──────────────────────────────────── */}
      {step === 1 && (
        <>
          <div className="space-y-1.5">
            <Label htmlFor="vehiculoId">Vehículo *</Label>
            <select
              id="vehiculoId"
              {...register("vehiculoId")}
              className="w-full rounded-md border border-zinc-700 px-3 py-2 text-sm bg-zinc-800 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="">Seleccionar vehículo...</option>
              {vehiculos.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.placa} — {v.marca} {v.modelo} ({v.cliente.nombre})
                </option>
              ))}
            </select>
            {fieldError("vehiculoId") && (
              <p className="text-xs text-red-500">{fieldError("vehiculoId")}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="fecha">Fecha de Ingreso *</Label>
              <Input
                id="fecha"
                type="date"
                defaultValue={defaultValues?.fecha
                  ? format(new Date(defaultValues.fecha), "yyyy-MM-dd")
                  : todayStr}
                {...register("fecha")}
              />
              {fieldError("fecha") && (
                <p className="text-xs text-red-500">{fieldError("fecha")}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="estado">Estado *</Label>
              <select
                id="estado"
                {...register("estado")}
                className="w-full rounded-md border border-zinc-700 px-3 py-2 text-sm bg-zinc-800 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                {ESTADOS.map((e) => (
                  <option key={e.value} value={e.value}>
                    {e.label}
                  </option>
                ))}
              </select>
              {fieldError("estado") && (
                <p className="text-xs text-red-500">{fieldError("estado")}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <Button type="button" onClick={handleNext} className="bg-orange-500 hover:bg-orange-600 text-white gap-1">
              Siguiente <ChevronRight className="w-4 h-4" />
            </Button>
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

      {/* ── Paso 2: Costos y Mecánico ─────────────────────────────────── */}
      {step === 2 && (
        <>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="costoTotal">Costo del Arreglo</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-xs font-semibold select-none pointer-events-none">COP</span>
                <Controller
                  name="costoTotal"
                  control={control}
                  render={({ field }) => (
                    <Input
                      id="costoTotal"
                      type="text"
                      inputMode="numeric"
                      placeholder="0"
                      className="pl-11"
                      value={toDisplayCOP(field.value as string | number | null)}
                      onChange={(e) => {
                        const digits = e.target.value.replace(/\D/g, "");
                        field.onChange(digits === "" ? "" : digits);
                      }}
                      onBlur={field.onBlur}
                    />
                  )}
                />
              </div>
              {fieldError("costoTotal") && (
                <p className="text-xs text-red-500">{fieldError("costoTotal")}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="anticipo">Anticipo</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-xs font-semibold select-none pointer-events-none">COP</span>
                <Controller
                  name="anticipo"
                  control={control}
                  render={({ field }) => (
                    <Input
                      id="anticipo"
                      type="text"
                      inputMode="numeric"
                      placeholder="0"
                      className="pl-11"
                      value={toDisplayCOP(field.value as string | number | null)}
                      onChange={(e) => {
                        const digits = e.target.value.replace(/\D/g, "");
                        field.onChange(digits === "" ? "" : digits);
                      }}
                      onBlur={field.onBlur}
                    />
                  )}
                />
              </div>
              {fieldError("anticipo") && (
                <p className="text-xs text-red-500">{fieldError("anticipo")}</p>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="mecanicoAsignado">Mecánico Asignado *</Label>
            <Input
              id="mecanicoAsignado"
              placeholder="Nombre del mecánico"
              {...register("mecanicoAsignado")}
            />
            {fieldError("mecanicoAsignado") && (
              <p className="text-xs text-red-500">{fieldError("mecanicoAsignado")}</p>
            )}
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="inline-flex h-9 items-center justify-center rounded-lg border border-zinc-700 bg-zinc-800 px-3 text-sm font-medium text-zinc-300 hover:bg-zinc-700 transition-colors gap-1"
            >
              <ChevronLeft className="w-4 h-4" /> Anterior
            </button>
            <Button type="button" onClick={handleNext} className="bg-orange-500 hover:bg-orange-600 text-white gap-1">
              Siguiente <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </>
      )}

      {/* ── Paso 3: Diagnóstico ───────────────────────────────────────── */}
      {step === 3 && (
        <>
          <div className="space-y-1.5">
            <Label htmlFor="diagnostico">Diagnóstico *</Label>
            <Textarea
              id="diagnostico"
              placeholder="Describe el problema o diagnóstico inicial..."
              rows={4}
              {...register("diagnostico")}
            />
            {fieldError("diagnostico") && (
              <p className="text-xs text-red-500">{fieldError("diagnostico")}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="trabajoRealizado">Trabajo Realizado (opcional)</Label>
            <Textarea
              id="trabajoRealizado"
              placeholder="Detalla el trabajo realizado..."
              rows={3}
              {...register("trabajoRealizado")}
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="inline-flex h-9 items-center justify-center rounded-lg border border-zinc-700 bg-zinc-800 px-3 text-sm font-medium text-zinc-300 hover:bg-zinc-700 transition-colors gap-1"
            >
              <ChevronLeft className="w-4 h-4" /> Anterior
            </button>
            <Button
              type="submit"
              disabled={isPending}
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              {isPending
                ? "Guardando..."
                : id
                ? "Actualizar Servicio"
                : "Crear Orden de Servicio"}
            </Button>
          </div>
        </>
      )}
    </form>
  );
}
