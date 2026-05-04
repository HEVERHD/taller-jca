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
import { Edit, Trash2, Plus, Search, Eye, Wrench } from "lucide-react";
import { deleteVehiculo } from "@/actions/vehiculos";
import { cn } from "@/lib/utils";

type VehiculoRow = {
  id: string;
  placa: string;
  marca: string;
  modelo: string;
  kilometraje: number;
  cliente: { id: string; nombre: string };
  _count: { servicios: number };
};

interface VehiculoTableProps {
  vehiculos: VehiculoRow[];
}

export function VehiculoTable({ vehiculos }: VehiculoTableProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [isPending, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filtered = vehiculos.filter(
    (v) =>
      v.placa.toLowerCase().includes(query.toLowerCase()) ||
      v.marca.toLowerCase().includes(query.toLowerCase()) ||
      v.modelo.toLowerCase().includes(query.toLowerCase()) ||
      v.cliente.nombre.toLowerCase().includes(query.toLowerCase())
  );

  function handleDelete(id: string, placa: string) {
    if (!confirm(`¿Eliminar el vehículo "${placa}"? Se eliminarán también sus servicios.`)) return;
    setDeletingId(id);
    startTransition(async () => {
      await deleteVehiculo(id);
      toast.success("Vehículo eliminado");
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
            placeholder="Buscar por placa, marca, modelo..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Link
          href="/vehiculos/nuevo"
          className={cn(buttonVariants(), "bg-orange-500 hover:bg-orange-600 text-white border-0")}
        >
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Vehículo
        </Link>
      </div>

      {/* Mobile card list */}
      <div className="sm:hidden space-y-2">
        {filtered.length === 0 ? (
          <div className="bg-card rounded-xl border border-border p-8 text-center text-sm text-muted-foreground">
            {query ? "No se encontraron vehículos" : "Aún no hay vehículos registrados"}
          </div>
        ) : (
          filtered.map((v) => (
            <div key={v.id} className="bg-card rounded-xl border border-border p-4 flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono font-bold text-zinc-900 bg-zinc-100 px-2 py-0.5 rounded text-xs">
                    {v.placa}
                  </span>
                  <Badge variant="secondary" className="gap-1 text-xs">
                    <Wrench className="w-3 h-3" />
                    {v._count.servicios}
                  </Badge>
                </div>
                <p className="font-semibold text-foreground text-sm truncate">{v.marca} {v.modelo}</p>
                <p className="text-xs text-zinc-500 mt-0.5">{v.cliente.nombre} · {v.kilometraje.toLocaleString()} km</p>
              </div>
              <div className="flex items-center gap-0.5 shrink-0">
                <Link href={`/vehiculos/${v.id}`} className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "h-9 w-9")}>
                  <Eye className="w-4 h-4" />
                </Link>
                <Link href={`/vehiculos/${v.id}/editar`} className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "h-9 w-9")}>
                  <Edit className="w-4 h-4" />
                </Link>
                <Button variant="ghost" size="icon" className="h-9 w-9 text-red-500 hover:text-red-700 hover:bg-red-50"
                  onClick={() => handleDelete(v.id, v.placa)} disabled={isPending && deletingId === v.id}>
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
              <TableHead className="font-semibold text-zinc-400">Placa</TableHead>
              <TableHead className="font-semibold text-zinc-400">Vehículo</TableHead>
              <TableHead className="font-semibold text-zinc-400">Cliente</TableHead>
              <TableHead className="font-semibold text-zinc-400">Kilometraje</TableHead>
              <TableHead className="font-semibold text-zinc-400">Servicios</TableHead>
              <TableHead className="w-32 text-right font-semibold text-zinc-400">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10 text-zinc-400">
                  {query ? "No se encontraron vehículos" : "Aún no hay vehículos registrados"}
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((v) => (
                <TableRow key={v.id} className="hover:bg-muted/50">
                  <TableCell>
                    <span className="font-mono font-semibold text-zinc-900 bg-zinc-100 px-2 py-0.5 rounded text-sm">
                      {v.placa}
                    </span>
                  </TableCell>
                  <TableCell className="font-medium text-foreground">
                    {v.marca} {v.modelo}
                  </TableCell>
                  <TableCell>
                    <Link href={`/clientes/${v.cliente.id}`} className="text-zinc-600 hover:text-zinc-900 hover:underline">
                      {v.cliente.nombre}
                    </Link>
                  </TableCell>
                  <TableCell className="text-zinc-600">{v.kilometraje.toLocaleString()} km</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="gap-1">
                      <Wrench className="w-3 h-3" />
                      {v._count.servicios}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Link href={`/vehiculos/${v.id}`} className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "h-8 w-8")}>
                        <Eye className="w-4 h-4" />
                      </Link>
                      <Link href={`/vehiculos/${v.id}/editar`} className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "h-8 w-8")}>
                        <Edit className="w-4 h-4" />
                      </Link>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleDelete(v.id, v.placa)} disabled={isPending && deletingId === v.id}>
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
        {filtered.length} vehículo{filtered.length !== 1 ? "s" : ""} encontrado{filtered.length !== 1 ? "s" : ""}
      </p>
    </div>
  );
}
