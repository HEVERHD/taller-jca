import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ClienteForm } from "@/components/clientes/cliente-form";
import { ArrowLeft } from "lucide-react";

export default async function EditarClientePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const cliente = await prisma.cliente.findUnique({ where: { id } });
  if (!cliente) notFound();

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href={`/clientes/${id}`}
          className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Editar Cliente</h1>
          <p className="text-sm text-zinc-500">{cliente.nombre}</p>
        </div>
      </div>
      <div className="bg-card rounded-xl border shadow-sm p-6">
        <ClienteForm
          id={id}
          defaultValues={{
            nombre: cliente.nombre,
            telefono: cliente.telefono,
            email: cliente.email ?? "",
          }}
        />
      </div>
    </div>
  );
}
