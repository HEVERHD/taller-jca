"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { servicioSchema, type ServicioInput } from "@/types";
import type { EstadoServicio } from "@/generated/prisma/enums";

export async function createServicio(data: ServicioInput) {
  const parsed = servicioSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  await prisma.servicio.create({ data: parsed.data });

  revalidatePath("/servicios");
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
  await prisma.servicio.update({ where: { id }, data: { estado } });
  revalidatePath("/servicios");
  revalidatePath(`/servicios/${id}`);
}

export async function registrarPago(id: string, anticipo: number) {
  await prisma.servicio.update({ where: { id }, data: { anticipo } });
  revalidatePath("/servicios");
  revalidatePath(`/servicios/${id}`);
}

export async function deleteServicio(id: string) {
  await prisma.servicio.delete({ where: { id } });
  revalidatePath("/servicios");
  redirect("/servicios");
}
