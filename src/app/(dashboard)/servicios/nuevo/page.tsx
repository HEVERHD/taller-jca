import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ServicioForm } from "@/components/servicios/servicio-form";
import { ArrowLeft } from "lucide-react";

export default async function NuevoServicioPage({
  searchParams,
}: {
  searchParams: Promise<{ vehiculoId?: string }>;
}) {
  const { vehiculoId } = await searchParams;

  const vehiculos = await prisma.vehiculo.findMany({
    include: { cliente: { select: { nombre: true } } },
    orderBy: { placa: "asc" },
  });

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/servicios"
          className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Nueva Orden de Servicio</h1>
          <p className="text-sm text-zinc-500">Registra los detalles del servicio</p>
        </div>
      </div>
      <div className="bg-card rounded-xl border shadow-sm p-6">
        <ServicioForm vehiculos={vehiculos} defaultVehiculoId={vehiculoId} />
      </div>
    </div>
  );
}
