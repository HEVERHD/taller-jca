"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { vehiculoSchema, type VehiculoInput } from "@/types";

export async function createVehiculo(data: VehiculoInput) {
  const parsed = vehiculoSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  await prisma.vehiculo.create({ data: parsed.data });

  revalidatePath("/vehiculos");
  revalidatePath(`/clientes/${parsed.data.clienteId}`);
  redirect("/vehiculos");
}

export async function updateVehiculo(id: string, data: VehiculoInput) {
  const parsed = vehiculoSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  await prisma.vehiculo.update({ where: { id }, data: parsed.data });

  revalidatePath("/vehiculos");
  revalidatePath(`/vehiculos/${id}`);
  redirect(`/vehiculos/${id}`);
}

export async function deleteVehiculo(id: string) {
  await prisma.vehiculo.delete({ where: { id } });
  revalidatePath("/vehiculos");
  redirect("/vehiculos");
}
