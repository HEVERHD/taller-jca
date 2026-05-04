"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Edit, Trash2, Plus, Search, Eye, User, Wrench, Calendar, DollarSign, ChevronRight } from "lucide-react";
import { StatusBadge } from "./status-badge";
import { deleteServicio } from "@/actions/servicios";
import type { EstadoServicio } from "@/generated/prisma/enums";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn, formatCOP } from "@/lib/utils";

type ServicioRow = {
  id: string;
  fecha: Date;
  diagnostico: string;
  mecanicoAsignado: string;
  estado: EstadoServicio;
  costoTotal: number | null;
  anticipo: number | null;
  vehiculo: {
    placa: string;
    marca: string;
    modelo: string;
    cliente: { nombre: string };
  };
};

interface ServicioTableProps {
  servicios: ServicioRow[];
  estadoActivo?: string;
}

const FILTROS = [
  { value: "", label: "Todos" },
  { value: "PENDIENTE", label: "Pendientes" },
  { value: "EN_PROCESO", label: "En Proceso" },
  { value: "TERMINADO", label: "Terminados" },
] as const;

export function ServicioTable({ servicios, estadoActivo = "" }: ServicioTableProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [filtroLocal, setFiltroLocal] = useState(estadoActivo);
  const [isPending, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filtered = servicios.filter((s) => {
    const matchQuery =
      !query ||
      s.diagnostico.toLowerCase().includes(query.toLowerCase()) ||
      s.vehiculo.placa.toLowerCase().includes(query.toLowerCase()) ||
      s.vehiculo.cliente.nombre.toLowerCase().includes(query.toLowerCase()) ||
      s.mecanicoAsignado.toLowerCase().includes(query.toLowerCase());
    const matchEstado = !filtroLocal || s.estado === filtroLocal;
    return matchQuery && matchEstado;
  });

  function handleDelete(id: string) {
    if (!confirm("¿Eliminar esta orden de servicio?")) return;
    setDeletingId(id);
    startTransition(async () => {
      await deleteServicio(id);
      toast.success("Servicio eliminado");
      router.refresh();
      setDeletingId(null);
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <Input
            placeholder="Buscar por placa, cliente, mecánico..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Link
          href="/servicios/nuevo"
          className={cn(buttonVariants(), "bg-orange-500 hover:bg-orange-600 text-white border-0 w-full sm:w-auto")}
        >
          <Plus className="w-4 h-4 mr-2" />
          Crear nuevo servicio
        </Link>
      </div>

      {/* Filtros */}
      <div className="flex gap-1 border-b border-zinc-800 overflow-x-auto">
        {FILTROS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFiltroLocal(f.value)}
            className={cn(
              "px-3 py-2 text-sm font-medium border-b-2 transition-colors -mb-px whitespace-nowrap",
              filtroLocal === f.value
                ? "border-orange-500 text-orange-500"
                : "border-transparent text-zinc-500 hover:text-zinc-300"
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* ── Vista móvil: tarjetas ───────────────────────────────── */}
      <div className="sm:hidden space-y-3">
        {filtered.length === 0 ? (
          <div className="bg-card rounded-xl border border-border p-8 text-center text-sm text-muted-foreground">
            {query ? "No se encontraron servicios" : "No hay servicios con este filtro"}
          </div>
        ) : (
          filtered.map((s) => (
            <div key={s.id} className="relative bg-card rounded-xl border border-border overflow-hidden hover:border-orange-500/40 hover:shadow-md transition-all group cursor-pointer">

              {/* Full-card link — cubre toda la card excepto los botones */}
              <Link href={`/servicios/${s.id}`} className="absolute inset-0 z-0" aria-label="Ver detalle del servicio" />

              {/* Cabecera */}
              <div className="relative z-10 flex items-center justify-between px-4 pt-4 pb-3">
                <div className="flex items-center gap-2 flex-wrap pointer-events-none">
                  <span className="font-mono font-bold text-foreground bg-muted px-2 py-0.5 rounded-md text-xs border border-border">
                    {s.vehiculo.placa}
                  </span>
                  <StatusBadge estado={s.estado} />
                </div>
                <div className="flex items-center gap-0.5 shrink-0">
                  <Link href={`/servicios/${s.id}/editar`} className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "relative z-10 h-8 w-8 text-zinc-400 hover:text-zinc-100")}>
                    <Edit className="w-4 h-4" />
                  </Link>
                  <Button variant="ghost" size="icon" className="relative z-10 h-8 w-8 text-red-500 hover:text-red-400 hover:bg-red-950/40"
                    onClick={(e) => { e.preventDefault(); handleDelete(s.id); }} disabled={isPending && deletingId === s.id}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Vehículo + flecha */}
              <div className="px-4 pb-1 pointer-events-none flex items-center justify-between">
                <p className="text-base font-bold text-foreground">
                  {s.vehiculo.marca} {s.vehiculo.modelo}
                </p>
                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-orange-400 transition-colors shrink-0" />
              </div>

              {/* Diagnóstico */}
              <div className="px-4 pb-3 pointer-events-none">
                <p className="text-sm text-zinc-400 line-clamp-2">{s.diagnostico}</p>
              </div>

              {/* Info grid */}
              <div className="bg-muted/50 border-t border-border px-4 py-3 grid grid-cols-2 gap-y-2 gap-x-3 pointer-events-none">
                <div className="flex items-center gap-1.5">
                  <User className="w-3 h-3 text-zinc-600 shrink-0" />
                  <span className="text-xs text-zinc-400 truncate">{s.vehiculo.cliente.nombre}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Wrench className="w-3 h-3 text-zinc-600 shrink-0" />
                  <span className="text-xs text-zinc-400 truncate">{s.mecanicoAsignado}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3 h-3 text-zinc-600 shrink-0" />
                  <span className="text-xs text-zinc-400">
                    {format(s.fecha, "d MMM yyyy", { locale: es })}
                  </span>
                </div>
                {s.costoTotal != null && (
                  <div className="flex items-center gap-1.5">
                    <DollarSign className="w-3 h-3 text-orange-600 shrink-0" />
                    <span className="text-xs text-orange-400 font-medium">
                      {formatCOP(s.costoTotal)}
                    </span>
                  </div>
                )}
              </div>

              {/* Barra de anticipo */}
              {s.costoTotal != null && s.anticipo != null && s.anticipo > 0 && (
                <div className="px-4 py-2 border-t border-border flex items-center justify-between pointer-events-none">
                  <span className="text-xs text-zinc-500">
                    Anticipo: <span className="text-cyan-400 font-medium">{formatCOP(s.anticipo)}</span>
                  </span>
                  <span className="text-xs text-zinc-500">
                    Saldo: <span className="text-zinc-300 font-medium">{formatCOP(s.costoTotal - s.anticipo)}</span>
                  </span>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* ── Vista desktop: tabla ────────────────────────────────── */}
      <div className="hidden sm:block rounded-lg border border-border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted hover:bg-muted border-border">
              <TableHead className="font-semibold text-zinc-400">Vehículo</TableHead>
              <TableHead className="font-semibold text-zinc-400">Cliente</TableHead>
              <TableHead className="font-semibold text-zinc-400">Diagnóstico</TableHead>
              <TableHead className="font-semibold text-zinc-400">Mecánico</TableHead>
              <TableHead className="font-semibold text-zinc-400">Ingreso</TableHead>
              <TableHead className="font-semibold text-zinc-400">Costo</TableHead>
              <TableHead className="font-semibold text-zinc-400">Estado</TableHead>
              <TableHead className="w-28 text-right font-semibold text-zinc-400">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-10 text-zinc-500">
                  {query ? "No se encontraron servicios" : "No hay servicios con este filtro"}
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((s) => (
                <TableRow key={s.id} className="hover:bg-muted/50 border-border">
                  <TableCell>
                    <span className="font-mono text-sm font-semibold text-foreground">{s.vehiculo.placa}</span>
                    <p className="text-xs text-muted-foreground">{s.vehiculo.marca} {s.vehiculo.modelo}</p>
                  </TableCell>
                  <TableCell className="text-zinc-400">{s.vehiculo.cliente.nombre}</TableCell>
                  <TableCell className="max-w-xs">
                    <p className="text-sm text-foreground/80 line-clamp-2">{s.diagnostico}</p>
                  </TableCell>
                  <TableCell className="text-zinc-400">{s.mecanicoAsignado}</TableCell>
                  <TableCell className="text-zinc-500 text-sm whitespace-nowrap">
                    {format(s.fecha, "d MMM yy", { locale: es })}
                  </TableCell>
                  <TableCell className="text-sm">
                    {s.costoTotal != null
                      ? <span className="text-orange-400 font-medium">{formatCOP(s.costoTotal)}</span>
                      : <span className="text-zinc-600">—</span>}
                  </TableCell>
                  <TableCell><StatusBadge estado={s.estado} /></TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Link href={`/servicios/${s.id}`} className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "h-8 w-8 text-zinc-400 hover:text-zinc-100")}>
                        <Eye className="w-4 h-4" />
                      </Link>
                      <Link href={`/servicios/${s.id}/editar`} className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "h-8 w-8 text-zinc-400 hover:text-zinc-100")}>
                        <Edit className="w-4 h-4" />
                      </Link>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-400 hover:bg-red-950/40"
                        onClick={() => handleDelete(s.id)} disabled={isPending && deletingId === s.id}>
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

      <p className="text-xs text-zinc-600">
        {filtered.length} servicio{filtered.length !== 1 ? "s" : ""} encontrado{filtered.length !== 1 ? "s" : ""}
      </p>
    </div>
  );
}
