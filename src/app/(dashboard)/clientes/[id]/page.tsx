import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Edit, Plus, Car, Phone, Mail, Wrench } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import type { EstadoServicio } from "@/generated/prisma/enums";

const estadoConfig: Record<EstadoServicio, { label: string; className: string }> = {
  PENDIENTE: { label: "Pendiente", className: "bg-amber-950/60 text-amber-400 border border-amber-800/40" },
  EN_PROCESO: { label: "En Proceso", className: "bg-blue-950/60 text-blue-400 border border-blue-800/40" },
  TERMINADO: { label: "Terminado", className: "bg-emerald-950/60 text-emerald-400 border border-emerald-800/40" },
};

export default async function ClienteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const cliente = await prisma.cliente.findUnique({
    where: { id },
    include: {
      vehiculos: {
        include: {
          servicios: {
            orderBy: { createdAt: "desc" },
            take: 3,
          },
          _count: { select: { servicios: true } },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!cliente) notFound();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/clientes"
            className="p-2 rounded-lg hover:bg-zinc-800 text-zinc-500 hover:text-zinc-100 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-zinc-100">{cliente.nombre}</h1>
            <p className="text-sm text-zinc-500">
              Cliente desde {format(cliente.createdAt, "MMMM yyyy", { locale: es })}
            </p>
          </div>
        </div>
        <Link
          href={`/clientes/${id}/editar`}
          className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
        >
          <Edit className="w-4 h-4 mr-2" />
          Editar
        </Link>
      </div>

      {/* Contact info */}
      <Card className="shadow-sm">
        <CardContent className="p-5">
          <div className="flex flex-wrap gap-6">
            <div className="flex items-center gap-2 text-zinc-400">
              <Phone className="w-4 h-4 text-zinc-400" />
              <span>{cliente.telefono}</span>
            </div>
            {cliente.email && (
              <div className="flex items-center gap-2 text-zinc-400">
                <Mail className="w-4 h-4 text-zinc-400" />
                <span>{cliente.email}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-zinc-400">
              <Car className="w-4 h-4 text-zinc-400" />
              <span>{cliente.vehiculos.length} vehículo{cliente.vehiculos.length !== 1 ? "s" : ""}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Vehicles */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-zinc-100">Vehículos</h2>
          <Link
            href={`/vehiculos/nuevo?clienteId=${id}`}
            className={cn(buttonVariants({ size: "sm" }), "bg-orange-500 hover:bg-orange-600 text-white border-0")}
          >
            <Plus className="w-4 h-4 mr-2" />
            Agregar Vehículo
          </Link>
        </div>

        {cliente.vehiculos.length === 0 ? (
          <Card className="shadow-sm">
            <CardContent className="py-10 text-center text-zinc-400">
              <Car className="w-8 h-8 mx-auto mb-2 text-zinc-300" />
              <p>No hay vehículos registrados</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {cliente.vehiculos.map((v) => (
              <Card key={v.id} className="shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">
                      {v.marca} {v.modelo}
                      <span className="ml-2 text-sm font-normal font-mono text-zinc-300 bg-zinc-800 px-2 py-0.5 rounded border border-zinc-700">
                        {v.placa}
                      </span>
                    </CardTitle>
                    <Link
                      href={`/vehiculos/${v.id}`}
                      className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
                    >
                      <Wrench className="w-4 h-4 mr-1" />
                      Ver
                    </Link>
                  </div>
                  <p className="text-xs text-zinc-500">
                    {v.kilometraje.toLocaleString()} km · {v._count.servicios} servicio{v._count.servicios !== 1 ? "s" : ""}
                  </p>
                </CardHeader>
                {v.servicios.length > 0 && (
                  <CardContent className="pt-0">
                    <div className="space-y-2">
                      {v.servicios.map((s) => (
                        <Link
                          key={s.id}
                          href={`/servicios/${s.id}`}
                          className="flex items-center justify-between text-sm p-2 rounded-lg hover:bg-zinc-800/60 transition-colors"
                        >
                          <span className="text-zinc-400 truncate mr-2">{s.diagnostico}</span>
                          <Badge className={`shrink-0 ${estadoConfig[s.estado].className}`}>
                            {estadoConfig[s.estado].label}
                          </Badge>
                        </Link>
                      ))}
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
