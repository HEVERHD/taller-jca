import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center bg-zinc-50">
      <p className="text-6xl font-black text-zinc-200">404</p>
      <h1 className="text-xl font-semibold text-zinc-900">Página no encontrada</h1>
      <p className="text-sm text-zinc-500">El recurso que buscas no existe.</p>
      <Link
        href="/dashboard"
        className={cn(buttonVariants(), "bg-orange-500 hover:bg-orange-600 text-white border-0")}
      >
        Volver al Dashboard
      </Link>
    </div>
  );
}
