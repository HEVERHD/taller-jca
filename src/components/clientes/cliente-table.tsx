"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Plus, Search, Eye, Car } from "lucide-react";
import { deleteCliente } from "@/actions/clientes";
import { cn } from "@/lib/utils";

type ClienteWithCount = {
  id: string;
  nombre: string;
  telefono: string;
  email: string | null;
  createdAt: Date;
  _count: { vehiculos: number };
};

interface ClienteTableProps {
  clientes: ClienteWithCount[];
}

export function ClienteTable({ clientes }: ClienteTableProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [isPending, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filtered = clientes.filter(
    (c) =>
      c.nombre.toLowerCase().includes(query.toLowerCase()) ||
      c.telefono.includes(query) ||
      c.email?.toLowerCase().includes(query.toLowerCase())
  );

  function handleDelete(id: string, nombre: string) {
    if (!confirm(`¿Eliminar al cliente "${nombre}"? Se eliminarán también sus vehículos y servicios.`)) return;
    setDeletingId(id);
    startTransition(async () => {
      await deleteCliente(id);
      toast.success("Cliente eliminado");
      router.refresh();
      setDeletingId(null);
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <Input
            placeholder="Buscar por nombre, teléfono o email..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Link
          href="/clientes/nuevo"
          className={cn(buttonVariants(), "bg-orange-500 hover:bg-orange-600 text-white border-0")}
        >
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Cliente
        </Link>
      </div>

      {/* Mobile card list */}
      <div className="sm:hidden space-y-2">
        {filtered.length === 0 ? (
          <div className="bg-card rounded-xl border border-border p-8 text-center text-sm text-muted-foreground">
            {query ? "No se encontraron clientes" : "Aún no hay clientes registrados"}
          </div>
        ) : (
          filtered.map((c) => (
            <div key={c.id} className="bg-card rounded-xl border border-border p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center shrink-0 text-sm font-bold text-foreground">
                {c.nombre.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="font-semibold text-foreground text-sm truncate">{c.nombre}</p>
                  <Badge variant="secondary" className="gap-1 text-xs shrink-0">
                    <Car className="w-3 h-3" />
                    {c._count.vehiculos}
                  </Badge>
                </div>
                <p className="text-xs text-zinc-500">{c.telefono}</p>
                {c.email && <p className="text-xs text-zinc-400 truncate">{c.email}</p>}
              </div>
              <div className="flex items-center gap-0.5 shrink-0">
                <Link href={`/clientes/${c.id}`} className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "h-9 w-9")}>
                  <Eye className="w-4 h-4" />
                </Link>
                <Link href={`/clientes/${c.id}/editar`} className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "h-9 w-9")}>
                  <Edit className="w-4 h-4" />
                </Link>
                <Button variant="ghost" size="icon" className="h-9 w-9 text-red-500 hover:text-red-700 hover:bg-red-50"
                  onClick={() => handleDelete(c.id, c.nombre)} disabled={isPending && deletingId === c.id}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop table */}
      <div className="hidden sm:block rounded-lg border border-border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted hover:bg-muted">
              <TableHead className="font-semibold text-zinc-400">Nombre</TableHead>
              <TableHead className="font-semibold text-zinc-400">Teléfono</TableHead>
              <TableHead className="font-semibold text-zinc-400">Email</TableHead>
              <TableHead className="font-semibold text-zinc-400">Vehículos</TableHead>
              <TableHead className="w-32 text-right font-semibold text-zinc-400">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-10 text-zinc-400">
                  {query ? "No se encontraron clientes" : "Aún no hay clientes registrados"}
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((c) => (
                <TableRow key={c.id} className="hover:bg-muted/50">
                  <TableCell className="font-medium text-foreground">{c.nombre}</TableCell>
                  <TableCell className="text-zinc-600">{c.telefono}</TableCell>
                  <TableCell className="text-zinc-500">{c.email ?? "—"}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="gap-1">
                      <Car className="w-3 h-3" />
                      {c._count.vehiculos}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Link href={`/clientes/${c.id}`} className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "h-8 w-8")}>
                        <Eye className="w-4 h-4" />
                      </Link>
                      <Link href={`/clientes/${c.id}/editar`} className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "h-8 w-8")}>
                        <Edit className="w-4 h-4" />
                      </Link>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleDelete(c.id, c.nombre)} disabled={isPending && deletingId === c.id}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <p className="text-xs text-zinc-400">
        {filtered.length} cliente{filtered.length !== 1 ? "s" : ""} encontrado{filtered.length !== 1 ? "s" : ""}
      </p>
    </div>
  );
}
