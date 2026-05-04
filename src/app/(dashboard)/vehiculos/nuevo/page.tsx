import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { VehiculoForm } from "@/components/vehiculos/vehiculo-form";
import { ArrowLeft } from "lucide-react";

export default async function NuevoVehiculoPage({
  searchParams,
}: {
  searchParams: Promise<{ clienteId?: string }>;
}) {
  const { clienteId } = await searchParams;

  const clientes = await prisma.cliente.findMany({
    select: { id: true, nombre: true, telefono: true },
    orderBy: { nombre: "asc" },
  });

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/vehiculos"
          className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Nuevo Vehículo</h1>
          <p className="text-sm text-zinc-500">Registra los datos del vehículo</p>
        </div>
      </div>
      <div className="bg-card rounded-xl border shadow-sm p-6">
        <VehiculoForm clientes={clientes} defaultClienteId={clienteId} />
      </div>
    </div>
  );
}
