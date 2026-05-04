import { ClienteForm } from "@/components/clientes/cliente-form";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NuevoClientePage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/clientes"
          className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Nuevo Cliente</h1>
          <p className="text-sm text-zinc-500">Ingresa los datos del cliente</p>
        </div>
      </div>
      <div className="bg-card rounded-xl border shadow-sm p-6">
        <ClienteForm />
      </div>
    </div>
  );
}
