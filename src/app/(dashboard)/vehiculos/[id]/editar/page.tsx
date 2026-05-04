import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { VehiculoForm } from "@/components/vehiculos/vehiculo-form";
import { ArrowLeft } from "lucide-react";

export default async function EditarVehiculoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [vehiculo, clientes] = await Promise.all([
    prisma.vehiculo.findUnique({ where: { id } }),
    prisma.cliente.findMany({
      select: { id: true, nombre: true, telefono: true },
      orderBy: { nombre: "asc" },
    }),
  ]);

  if (!vehiculo) notFound();

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href={`/vehiculos/${id}`}
          className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Editar Vehículo</h1>
          <p className="text-sm text-zinc-500">
            {vehiculo.marca} {vehiculo.modelo} — {vehiculo.placa}
          </p>
        </div>
      </div>
      <div className="bg-card rounded-xl border shadow-sm p-6">
        <VehiculoForm
          clientes={clientes}
          id={id}
          defaultValues={{
            placa: vehiculo.placa,
            marca: vehiculo.marca,
            modelo: vehiculo.modelo,
            kilometraje: vehiculo.kilometraje,
            clienteId: vehiculo.clienteId,
          }}
        />
      </div>
    </div>
  );
}
