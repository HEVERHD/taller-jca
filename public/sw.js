// Service Worker — Taller JCA

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(clients.claim()));

// Push notification recibida
self.addEventListener("push", (event) => {
  const data = event.data?.json() ?? {};
  event.waitUntil(
    self.registration.showNotification(data.title ?? "Taller JCA", {
      body: data.body ?? "",
      icon: "/logo2.png",
      badge: "/logo2.png",
      data: { url: data.url ?? "/dashboard" },
      vibrate: [200, 100, 200],
    })
  );
});

// Clic en la notificación → abrir/enfocar la app
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url ?? "/dashboard";
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((list) => {
      for (const client of list) {
        if (client.url.includes(url) && "focus" in client) return client.focus();
      }
      return clients.openWindow(url);
    })
  );
});
