"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CheckCircle2, CreditCard, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { registrarPago } from "@/actions/servicios";
import { formatCOP } from "@/lib/utils";

interface PagoRapidoProps {
  servicioId: string;
  costoTotal: number;
  anticipo: number | null;
}

function formatInput(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (!digits) return "";
  return Number(digits).toLocaleString("es-CO");
}

export function PagoRapido({ servicioId, costoTotal, anticipo }: PagoRapidoProps) {
  const router = useRouter();
  const saldo = costoTotal - (anticipo ?? 0);
  const [isPending, startTransition] = useTransition();
  const [montoRaw, setMontoRaw] = useState("");
  const [showInput, setShowInput] = useState(false);

  // Ya pagado completamente
  if (saldo <= 0) {
    return (
      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border">
        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
        <span className="text-sm font-semibold text-emerald-500">Servicio pagado completo</span>
      </div>
    );
  }

  function handlePagoCompleto() {
    startTransition(async () => {
      await registrarPago(servicioId, costoTotal);
      toast.success("¡Pago completo registrado!");
      router.refresh();
    });
  }

  function handlePagoParcial() {
    const monto = Number(montoRaw);
    if (!monto || monto <= 0) {
      toast.error("Ingresa un monto válido");
      return;
    }
    const nuevoAnticipo = Math.min((anticipo ?? 0) + monto, costoTotal);
    startTransition(async () => {
      await registrarPago(servicioId, nuevoAnticipo);
      toast.success(`Pago de ${formatCOP(monto)} registrado`);
      setMontoRaw("");
      setShowInput(false);
      router.refresh();
    });
  }

  return (
    <div className="mt-3 pt-3 border-t border-border space-y-2.5">
      <p className="text-xs text-muted-foreground">
        Saldo pendiente:{" "}
        <span className="font-semibold text-foreground">{formatCOP(saldo)}</span>
      </p>

      {!showInput ? (
        <div className="flex gap-2 flex-wrap">
          <Button
            size="sm"
            onClick={handlePagoCompleto}
            disabled={isPending}
            className="bg-emerald-600 hover:bg-emerald-700 text-white h-8 text-xs"
          >
            <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
            Pago completo
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowInput(true)}
            disabled={isPending}
            className="h-8 text-xs"
          >
            <CreditCard className="w-3.5 h-3.5 mr-1.5" />
            Pago parcial
          </Button>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <div className="relative flex-1 min-w-0">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs font-semibold pointer-events-none select-none">
              COP
            </span>
            <Input
              type="text"
              inputMode="numeric"
              placeholder="0"
              autoFocus
              value={formatInput(montoRaw)}
              onChange={(e) => setMontoRaw(e.target.value.replace(/\D/g, ""))}
              onKeyDown={(e) => e.key === "Enter" && handlePagoParcial()}
              className="pl-11 h-8 text-sm"
            />
          </div>
          <Button
            size="sm"
            onClick={handlePagoParcial}
            disabled={isPending}
            className="bg-orange-500 hover:bg-orange-600 text-white h-8 text-xs shrink-0"
          >
            Registrar
          </Button>
          <button
            onClick={() => { setShowInput(false); setMontoRaw(""); }}
            className="p-1.5 rounded-md hover:bg-muted text-muted-foreground transition-colors shrink-0"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
