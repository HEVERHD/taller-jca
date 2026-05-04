import { prisma } from "@/lib/prisma";
import { VehiculoTable } from "@/components/vehiculos/vehiculo-table";

export default async function VehiculosPage() {
  const vehiculos = await prisma.vehiculo.findMany({
    include: {
      cliente: { select: { id: true, nombre: true } },
      _count: { select: { servicios: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-100">Vehículos</h1>
        <p className="text-sm text-zinc-500 mt-1">
          {vehiculos.length} vehículo{vehiculos.length !== 1 ? "s" : ""} registrado{vehiculos.length !== 1 ? "s" : ""}
        </p>
      </div>
      <VehiculoTable vehiculos={vehiculos} />
    </div>
  );
}
