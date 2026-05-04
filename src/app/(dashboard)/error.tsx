"use client";

import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-96 gap-4 text-center">
      <div className="w-14 h-14 bg-red-950/60 rounded-full flex items-center justify-center border border-red-800/40">
        <AlertCircle className="w-7 h-7 text-red-400" />
      </div>
      <div>
        <h2 className="text-lg font-semibold text-zinc-100">Algo salió mal</h2>
        <p className="text-sm text-zinc-500 mt-1 max-w-md">
          {error.message || "Ocurrió un error inesperado. Por favor intenta de nuevo."}
        </p>
      </div>
      <Button onClick={reset} className="bg-red-600 hover:bg-red-700 text-white">
        Intentar de nuevo
      </Button>
    </div>
  );
}
