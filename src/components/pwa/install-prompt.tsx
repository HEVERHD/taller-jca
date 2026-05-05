"use client";

import { useState, useEffect } from "react";
import { X, Smartphone, Share } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

declare global {
  interface Window {
    __pwaPrompt?: BeforeInstallPromptEvent | null;
  }
}

// Dismissal expira en 3 días para que vuelva a aparecer
const DISMISSED_KEY = "pwa-install-dismissed-until";

function isDismissed() {
  const until = localStorage.getItem(DISMISSED_KEY);
  if (!until) return false;
  return Date.now() < Number(until);
}

function dismiss3Days() {
  localStorage.setItem(
    DISMISSED_KEY,
    String(Date.now() + 3 * 24 * 60 * 60 * 1000)
  );
}

export function InstallPrompt() {
  const [prompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [show, setShow] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Ya instalada como PWA → no mostrar
    if (window.matchMedia("(display-mode: standalone)").matches) return;
    if (isDismissed()) return;

    const ios =
      /iPad|iPhone|iPod/.test(navigator.userAgent) &&
      !(window as unknown as { MSStream: unknown }).MSStream;
    setIsIOS(ios);

    if (ios) {
      setTimeout(() => setShow(true), 2000);
      return;
    }

    // ① El evento ya ocurrió antes de que React montara → está en window
    if (window.__pwaPrompt) {
      setPrompt(window.__pwaPrompt);
      setTimeout(() => setShow(true), 1000);
      return;
    }

    // ② El evento llega después → escuchamos el custom event
    const onReady = () => {
      if (window.__pwaPrompt) {
        setPrompt(window.__pwaPrompt);
        setTimeout(() => setShow(true), 1000);
      }
    };
    window.addEventListener("pwa-prompt-ready", onReady);
    return () => window.removeEventListener("pwa-prompt-ready", onReady);
  }, []);

  const handleInstall = async () => {
    if (!prompt) return;
    await prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === "accepted") {
      setShow(false);
      window.__pwaPrompt = null;
    }
    setPrompt(null);
  };

  const handleDismiss = () => {
    setShow(false);
    dismiss3Days();
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-6 md:w-80 animate-in slide-in-from-bottom-4 duration-300">
      <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-4 shadow-2xl">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center shrink-0 shadow-lg shadow-orange-500/30">
            <Smartphone className="w-5 h-5 text-white" />
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white">Instalar app</p>

            {isIOS ? (
              <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                En Safari toca{" "}
                <Share className="w-3 h-3 inline mx-0.5 text-zinc-300" /> y
                luego{" "}
                <strong className="text-zinc-200">"Agregar a inicio"</strong>{" "}
                para acceso rápido.
              </p>
            ) : (
              <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed">
                Agrega Taller JCA a tu pantalla de inicio para acceso directo
                sin abrir el navegador.
              </p>
            )}

            {!isIOS && (
              <div className="flex gap-2 mt-3">
                <button
                  onClick={handleInstall}
                  className="flex-1 h-8 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold transition-colors"
                >
                  Instalar
                </button>
                <button
                  onClick={handleDismiss}
                  className="flex-1 h-8 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium transition-colors"
                >
                  Ahora no
                </button>
              </div>
            )}
            {isIOS && (
              <button
                onClick={handleDismiss}
                className="mt-3 w-full h-8 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium transition-colors"
              >
                Entendido
              </button>
            )}
          </div>

          <button
            onClick={handleDismiss}
            className="text-zinc-500 hover:text-zinc-300 transition-colors shrink-0 -mt-0.5"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
