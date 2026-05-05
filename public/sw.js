// Service Worker — Taller JCA

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(clients.claim()));

// ── Fetch handler (requerido por Chrome para PWA installability) ──────────
self.addEventListener("fetch", (event) => {
  // Solo interceptamos navegación same-origin; el resto pasa directo
  if (
    event.request.mode === "navigate" ||
    event.request.destination === "document"
  ) {
    event.respondWith(
      fetch(event.request).catch(() =>
        caches.match(event.request).then((r) => r ?? Response.error())
      )
    );
  }
  // Para assets y API: red directa, sin bloquear
});

// ── Push notification ─────────────────────────────────────────────────────
self.addEventListener("push", (event) => {
  const data = event.data?.json() ?? {};
  event.waitUntil(
    self.registration.showNotification(data.title ?? "Taller JCA", {
      body: data.body ?? "",
      icon: "/favicon1.png",
      badge: "/favicon1.png",
      data: { url: data.url ?? "/dashboard" },
      vibrate: [200, 100, 200],
    })
  );
});

// ── Clic en notificación → abrir / enfocar la app ─────────────────────────
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url ?? "/dashboard";
  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((list) => {
        for (const client of list) {
          if (client.url.includes(url) && "focus" in client)
            return client.focus();
        }
        return clients.openWindow(url);
      })
  );
});
