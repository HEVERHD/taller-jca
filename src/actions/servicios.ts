"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { servicioSchema, type ServicioInput } from "@/types";
import type { EstadoServicio } from "@/generated/prisma/enums";
import { sendPushToAll } from "@/actions/push";

// ─── helpers ────────────────────────────────────────────────────────────────

const formatCOP = (v: number) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(v);

const estadoLabel: Record<EstadoServicio, string> = {
  PENDIENTE:  "Pendiente",
  EN_PROCESO: "En proceso",
  TERMINADO:  "Terminado",
};

// ─── actions ────────────────────────────────────────────────────────────────

export async function createServicio(data: ServicioInput) {
  const parsed = servicioSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const [servicio, vehiculo] = await Promise.all([
    prisma.servicio.create({ data: parsed.data }),
    prisma.vehiculo.findUnique({ where: { id: parsed.data.vehiculoId } }),
  ]);

  revalidatePath("/servicios");

  if (vehiculo) {
    await sendPushToAll({
      title: "Nuevo servicio creado",
      body: `${vehiculo.marca} ${vehiculo.modelo} · ${vehiculo.placa}`,
      url: `/servicios/${servicio.id}`,
    });
  }

  redirect("/servicios");
}

export async function updateServicio(id: string, data: ServicioInput) {
  const parsed = servicioSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  await prisma.servicio.update({ where: { id }, data: parsed.data });

  revalidatePath("/servicios");
  revalidatePath(`/servicios/${id}`);
  redirect(`/servicios/${id}`);
}

export async function cambiarEstado(id: string, estado: EstadoServicio) {
  const servicio = await prisma.servicio.update({
    where: { id },
    data: { estado },
    include: { vehiculo: true },
  });

  revalidatePath("/servicios");
  revalidatePath(`/servicios/${id}`);

  // Notificar solo en los estados relevantes
  if (estado === "EN_PROCESO" || estado === "TERMINADO") {
    const emoji  = estado === "TERMINADO" ? "✅" : "🔧";
    const title  = `${emoji} Servicio ${estadoLabel[estado].toLowerCase()}`;
    const body   = `${servicio.vehiculo.marca} ${servicio.vehiculo.modelo} · ${servicio.vehiculo.placa}`;

    await sendPushToAll({ title, body, url: `/servicios/${id}` });
  }
}

export async function registrarPago(id: string, anticipo: number) {
  const servicio = await prisma.servicio.update({
    where: { id },
    data: { anticipo },
    include: { vehiculo: true },
  });

  revalidatePath("/servicios");
  revalidatePath(`/servicios/${id}`);

  const costo = servicio.costoTotal ?? 0;
  const pagado = anticipo >= costo && costo > 0;

  await sendPushToAll({
    title: pagado ? "💰 Pago completo recibido" : "💵 Anticipo registrado",
    body: `${servicio.vehiculo.marca} ${servicio.vehiculo.modelo} · ${formatCOP(anticipo)}${
      pagado ? " — saldo en cero" : ` de ${formatCOP(costo)}`
    }`,
    url: `/servicios/${id}`,
  });
}

export async function deleteServicio(id: string) {
  await prisma.servicio.delete({ where: { id } });
  revalidatePath("/servicios");
  redirect("/servicios");
}
