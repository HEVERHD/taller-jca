import { prisma } from "@/lib/prisma";
import { ClienteTable } from "@/components/clientes/cliente-table";

export default async function ClientesPage() {
  const clientes = await prisma.cliente.findMany({
    include: { _count: { select: { vehiculos: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-100">Clientes</h1>
        <p className="text-sm text-zinc-500 mt-1">
          {clientes.length} cliente{clientes.length !== 1 ? "s" : ""} registrado{clientes.length !== 1 ? "s" : ""}
        </p>
      </div>
      <ClienteTable clientes={clientes} />
    </div>
  );
}
