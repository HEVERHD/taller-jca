"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { clienteSchema, vehiculoSchema, type ClienteInput } from "@/types";

export async function createCliente(data: ClienteInput) {
  const parsed = clienteSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const { nombre, telefono, email } = parsed.data;
  await prisma.cliente.create({
    data: { nombre, telefono, email: email ?? null },
  });

  revalidatePath("/clientes");
  redirect("/clientes");
}

export async function updateCliente(id: string, data: ClienteInput) {
  const parsed = clienteSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const { nombre, telefono, email } = parsed.data;
  await prisma.cliente.update({
    where: { id },
    data: { nombre, telefono, email: email ?? null },
  });

  revalidatePath("/clientes");
  revalidatePath(`/clientes/${id}`);
  redirect(`/clientes/${id}`);
}

export async function deleteCliente(id: string) {
  await prisma.cliente.delete({ where: { id } });
  revalidatePath("/clientes");
  redirect("/clientes");
}

export async function createClienteConVehiculo(
  clienteData: ClienteInput,
  vehiculoData: { placa: string; marca: string; modelo: string; kilometraje: string | number }
) {
  const parsedCliente = clienteSchema.safeParse(clienteData);
  if (!parsedCliente.success) {
    return { error: parsedCliente.error.flatten().fieldErrors };
  }

  const vehiculoNuevoSchema = vehiculoSchema.omit({ clienteId: true });
  const parsedVehiculo = vehiculoNuevoSchema.safeParse(vehiculoData);
  if (!parsedVehiculo.success) {
    return { vehiculoError: parsedVehiculo.error.flatten().fieldErrors };
  }

  const cliente = await prisma.cliente.create({
    data: {
      nombre: parsedCliente.data.nombre,
      telefono: parsedCliente.data.telefono,
      email: parsedCliente.data.email ?? null,
    },
  });

  await prisma.vehiculo.create({
    data: { ...parsedVehiculo.data, clienteId: cliente.id },
  });

  revalidatePath("/clientes");
  revalidatePath("/vehiculos");
  redirect(`/clientes/${cliente.id}`);
}
