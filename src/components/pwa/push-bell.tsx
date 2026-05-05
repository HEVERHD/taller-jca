"use client";

import { useState, useEffect } from "react";
import { Bell, BellOff, BellRing } from "lucide-react";
import { subscribeToPush, unsubscribeFromPush } from "@/actions/push";

function urlBase64ToUint8Array(base64: string) {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(b64);
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
}

export function PushBell({ className }: { className?: string }) {
  const [status, setStatus] = useState<"loading" | "unsupported" | "denied" | "off" | "on">("loading");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!("Notification" in window) || !("serviceWorker" in navigator)) {
      setStatus("unsupported");
      return;
    }
    if (Notification.permission === "denied") {
      setStatus("denied");
      return;
    }
    navigator.serviceWorker.ready.then((reg) =>
      reg.pushManager.getSubscription().then((sub) =>
        setStatus(sub ? "on" : "off")
      )
    );
  }, []);

  const handleToggle = async () => {
    if (busy || status === "unsupported" || status === "denied") return;
    setBusy(true);
    try {
      const reg = await navigator.serviceWorker.ready;

      if (status === "on") {
        const sub = await reg.pushManager.getSubscription();
        if (sub) {
          await sub.unsubscribe();
          await unsubscribeFromPush(sub.endpoint);
        }
        setStatus("off");
        return;
      }

      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setStatus(permission === "denied" ? "denied" : "off");
        return;
      }

      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
        ),
      });

      const json = sub.toJSON() as {
        endpoint: string;
        keys: { p256dh: string; auth: string };
      };
      await subscribeToPush(json);
      setStatus("on");
    } finally {
      setBusy(false);
    }
  };

  if (status === "unsupported" || status === "loading") return null;

  return (
    <button
      onClick={handleToggle}
      disabled={busy || status === "denied"}
      title={
        status === "on"
          ? "Desactivar notificaciones"
          : status === "denied"
          ? "Notificaciones bloqueadas en el navegador"
          : "Activar notificaciones"
      }
      className={className}
    >
      {status === "on" ? (
        <BellRing className="w-5 h-5 text-orange-400" />
      ) : status === "denied" ? (
        <BellOff className="w-5 h-5 text-zinc-600" />
      ) : (
        <Bell className="w-5 h-5 text-zinc-400" />
      )}
    </button>
  );
}
