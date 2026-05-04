import { prisma } from "@/lib/prisma";
import { ServicioTable } from "@/components/servicios/servicio-table";

export default async function ServiciosPage() {
  const servicios = await prisma.servicio.findMany({
    include: {
      vehiculo: {
        include: { cliente: { select: { nombre: true } } },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-100">Servicios</h1>
        <p className="text-sm text-zinc-500 mt-1">
          {servicios.length} orden{servicios.length !== 1 ? "es" : ""} de servicio
        </p>
      </div>
      <ServicioTable servicios={servicios} />
    </div>
  );
}
