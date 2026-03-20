/// <reference lib="webworker" />

import { clientsClaim } from "workbox-core";
import { cleanupOutdatedCaches, createHandlerBoundToURL, precacheAndRoute } from "workbox-precaching";
import { registerRoute } from "workbox-routing";
import { CacheFirst, StaleWhileRevalidate } from "workbox-strategies";
import { CacheableResponsePlugin } from "workbox-cacheable-response";
import { ExpirationPlugin } from "workbox-expiration";
import { getPushRoute } from "./lib/push";

type NotificationPayload = {
  id?: string;
  notification_id?: string;
  title?: string;
  message?: string;
  type?: string;
  data?: Record<string, unknown> | null;
  url?: string;
  route?: string;
};

declare global {
  interface ServiceWorkerGlobalScope {
    __WB_MANIFEST: Array<{ url: string; revision: string | null }>;
  }
}

clientsClaim();
cleanupOutdatedCaches();
precacheAndRoute(self.__WB_MANIFEST);

registerRoute(({ request }) => request.mode === "navigate", createHandlerBoundToURL("/index.html"));

registerRoute(
  ({ url }) => /^https:\/\/[a-z]\.basemaps\.cartocdn\.com\/.*$/i.test(url.href),
  new CacheFirst({
    cacheName: "leaflet-tiles",
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({
        maxEntries: 96,
        maxAgeSeconds: 60 * 60 * 24 * 7,
      }),
    ],
  }),
);

registerRoute(
  ({ url }) => /^https:\/\/.*\.supabase\.co\/storage\/v1\/object\/public\/.*$/i.test(url.href),
  new StaleWhileRevalidate({
    cacheName: "supabase-storage-public",
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({
        maxEntries: 160,
        maxAgeSeconds: 60 * 60 * 24 * 30,
      }),
    ],
  }),
);

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") {
    void self.skipWaiting();
  }
});

self.addEventListener("push", (event) => {
  const fallbackPayload: NotificationPayload = {
    title: "WEMOVELT",
    message: "Voce tem uma nova notificacao.",
    type: "general",
    data: null,
  };

  let parsedPayload: NotificationPayload = fallbackPayload;

  if (event.data) {
    try {
      const rawPayload = event.data.json() as NotificationPayload & { notification?: NotificationPayload };
      parsedPayload = rawPayload.notification ?? rawPayload;
    } catch {
      const rawText = event.data.text();

      if (rawText) {
        parsedPayload = {
          ...fallbackPayload,
          message: rawText,
        };
      }
    }
  }

  const title = parsedPayload.title ?? fallbackPayload.title;
  const message = parsedPayload.message ?? fallbackPayload.message;
  const type = parsedPayload.type ?? fallbackPayload.type;
  const data = parsedPayload.data ?? null;
  const route = parsedPayload.route ?? parsedPayload.url ?? getPushRoute(type, data);
  const notificationData = {
    ...(data ?? {}),
    route,
    notificationId: parsedPayload.id ?? parsedPayload.notification_id ?? null,
    type,
  };

  event.waitUntil(
    self.registration.showNotification(title, {
      body: message,
      icon: new URL("/icon-192.png", self.location.origin).toString(),
      badge: new URL("/icon-192.png", self.location.origin).toString(),
      tag: parsedPayload.id ?? parsedPayload.notification_id ?? type,
      renotify: true,
      vibrate: [120, 60, 120],
      data: notificationData,
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  if (event.action === "dismiss") {
    return;
  }

  const notification = event.notification as Notification & {
    data?: {
      route?: string;
      url?: string;
    };
  };

  const targetRoute = notification.data?.route ?? notification.data?.url ?? "/home";

  event.waitUntil(
    (async () => {
      const windowClients = await clients.matchAll({
        type: "window",
        includeUncontrolled: true,
      });

      const targetUrl = new URL(targetRoute, self.location.origin).href;

      for (const windowClient of windowClients) {
        const clientUrl = new URL(windowClient.url);

        if (clientUrl.origin === self.location.origin && clientUrl.href === targetUrl) {
          await windowClient.focus();
          return;
        }
      }

      await self.clients.openWindow(targetUrl);
    })(),
  );
});
