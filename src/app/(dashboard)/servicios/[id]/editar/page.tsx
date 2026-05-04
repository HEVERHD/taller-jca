import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ServicioForm } from "@/components/servicios/servicio-form";
import { ArrowLeft } from "lucide-react";

export default async function EditarServicioPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [servicio, vehiculos] = await Promise.all([
    prisma.servicio.findUnique({ where: { id } }),
    prisma.vehiculo.findMany({
      include: { cliente: { select: { nombre: true } } },
      orderBy: { placa: "asc" },
    }),
  ]);

  if (!servicio) notFound();

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href={`/servicios/${id}`}
          className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Editar Servicio</h1>
          <p className="text-sm text-zinc-500">{servicio.diagnostico.slice(0, 50)}...</p>
        </div>
      </div>
      <div className="bg-card rounded-xl border shadow-sm p-6">
        <ServicioForm
          vehiculos={vehiculos}
          id={id}
          defaultValues={{
            fecha: servicio.fecha,
            diagnostico: servicio.diagnostico,
            trabajoRealizado: servicio.trabajoRealizado ?? "",
            mecanicoAsignado: servicio.mecanicoAsignado,
            estado: servicio.estado,
            vehiculoId: servicio.vehiculoId,
            costoTotal: servicio.costoTotal ?? undefined,
            anticipo: servicio.anticipo ?? undefined,
          }}
        />
      </div>
    </div>
  );
}
