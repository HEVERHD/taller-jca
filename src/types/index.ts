import { z } from "zod";

// ─── Cliente ──────────────────────────────────────────────────────────────────

export const clienteSchema = z.object({
  nombre: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  telefono: z.string().min(7, "El teléfono debe tener al menos 7 dígitos"),
  email: z
    .string()
    .email("Email inválido")
    .optional()
    .or(z.literal("").transform(() => undefined)),
});

export type ClienteInput = z.output<typeof clienteSchema>;

// ─── Vehículo ─────────────────────────────────────────────────────────────────

export const vehiculoSchema = z.object({
  placa: z
    .string()
    .min(5, "La placa debe tener al menos 5 caracteres")
    .transform((v) => v.toUpperCase()),
  marca: z.string().min(2, "La marca es requerida"),
  modelo: z.string().min(1, "El modelo es requerido"),
  kilometraje: z.coerce
    .number()
    .int("Debe ser un número entero")
    .nonnegative("El kilometraje no puede ser negativo"),
  clienteId: z.string().min(1, "Debes seleccionar un cliente"),
});

// Zod v4 coerce changes input type to unknown — export both for RHF
export type VehiculoFormValues = z.input<typeof vehiculoSchema>;
export type VehiculoInput = z.output<typeof vehiculoSchema>;

// ─── Servicio ─────────────────────────────────────────────────────────────────

const optionalMoney = z.preprocess(
  (v) => (v === "" || v === null || v === undefined ? undefined : Number(v)),
  z.number().nonnegative("No puede ser negativo").optional()
);

export const servicioSchema = z.object({
  fecha: z.coerce.date(),
  diagnostico: z
    .string()
    .min(5, "El diagnóstico debe tener al menos 5 caracteres"),
  trabajoRealizado: z.string().optional(),
  mecanicoAsignado: z.string().min(2, "El nombre del mecánico es requerido"),
  estado: z.enum(["PENDIENTE", "EN_PROCESO", "TERMINADO"]),
  vehiculoId: z.string().min(1, "Debes seleccionar un vehículo"),
  costoTotal: optionalMoney,
  anticipo: optionalMoney,
});

export type ServicioFormValues = z.input<typeof servicioSchema>;
export type ServicioInput = z.output<typeof servicioSchema>;
