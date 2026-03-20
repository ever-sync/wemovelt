import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { isNativeApp } from "@/lib/native";
import { base64UrlToUint8Array } from "@/lib/push";
import { deletePushSubscriptionByEndpoint } from "@/lib/pushSubscriptions";

type PushPermission = NotificationPermission | "unsupported";

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY as string | undefined;

const getDeviceLabel = () => {
  if (typeof navigator === "undefined") {
    return "Desktop";
  }

  const userAgent = navigator.userAgent;

  if (/iPad|iPhone|iPod/i.test(userAgent)) {
    return "iPhone/iPad";
  }

  if (/Android/i.test(userAgent)) {
    return "Android";
  }

  if (/Windows/i.test(userAgent)) {
    return "Windows";
  }

  if (/Mac/i.test(userAgent)) {
    return "Mac";
  }

  return "Desktop";
};

const toMessage = (error: unknown) => {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  return "Nao foi possivel atualizar as notificacoes neste dispositivo.";
};

const getSupportStatus = () =>
  !isNativeApp() &&
  import.meta.env.PROD &&
  typeof window !== "undefined" &&
  window.isSecureContext &&
  "serviceWorker" in navigator &&
  "PushManager" in window &&
  "Notification" in window;

const savePushSubscription = async (userId: string, subscription: PushSubscription) => {
  const subscriptionJson = subscription.toJSON();

  if (!subscriptionJson.endpoint || !subscriptionJson.keys?.p256dh || !subscriptionJson.keys?.auth) {
    throw new Error("Subscription invalida.");
  }

  const { error } = await supabase.from("push_subscriptions").upsert(
    {
      user_id: userId,
      endpoint: subscriptionJson.endpoint,
      p256dh: subscriptionJson.keys.p256dh,
      auth: subscriptionJson.keys.auth,
      device_label: getDeviceLabel(),
      user_agent: navigator.userAgent,
      expiration_time: subscription.expirationTime ? new Date(subscription.expirationTime).toISOString() : null,
      last_seen_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    { onConflict: "endpoint" },
  );

  if (error) {
    throw error;
  }
};

export const usePushNotifications = () => {
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const [isSupported, setIsSupported] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);
  const [permission, setPermission] = useState<PushPermission>("unsupported");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const syncPushState = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const supported = getSupportStatus();
        if (cancelled) return;

        setIsSupported(supported);

        if (!supported) {
          setPermission("unsupported");
          setIsEnabled(false);
          return;
        }

        const currentPermission = Notification.permission;
        if (cancelled) return;

        setPermission(currentPermission);

        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();

        if (cancelled) return;

        if (!userId) {
          if (subscription) {
            await subscription.unsubscribe();
          }

          setIsEnabled(false);
          return;
        }

        if (currentPermission !== "granted") {
          if (subscription) {
            await subscription.unsubscribe();
            await deletePushSubscription(subscription.endpoint, userId);
          }

          setIsEnabled(false);
          return;
        }

        if (subscription) {
          await savePushSubscription(userId, subscription);
          setIsEnabled(true);
          return;
        }

        setIsEnabled(false);
      } catch (syncError) {
        if (!cancelled) {
          setError(toMessage(syncError));
          setIsEnabled(false);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void syncPushState();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  const enablePushNotifications = async () => {
    if (!user) {
      throw new Error("Faca login para ativar notificacoes push.");
    }

    const currentUserId = user.id;

    const supported = getSupportStatus();

    if (!supported) {
      throw new Error("Push nao esta disponivel neste dispositivo.");
    }

    if (!VAPID_PUBLIC_KEY) {
      throw new Error("Chave publica de push nao configurada.");
    }

    setIsLoading(true);
    setError(null);

    try {
      let currentPermission = Notification.permission;

      if (currentPermission === "default") {
        currentPermission = await Notification.requestPermission();
      }

      setPermission(currentPermission);

      if (currentPermission !== "granted") {
        throw new Error("Permissao de notificacao negada.");
      }

      const registration = await navigator.serviceWorker.ready;
      let subscription = await registration.pushManager.getSubscription();

      if (!subscription) {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: base64UrlToUint8Array(VAPID_PUBLIC_KEY),
        });
      }

      await savePushSubscription(currentUserId, subscription);

      setIsEnabled(true);
      return subscription;
    } catch (enableError) {
      setIsEnabled(false);
      setError(toMessage(enableError));
      throw enableError;
    } finally {
      setIsLoading(false);
    }
  };

  const disablePushNotifications = async () => {
    if (!user) {
      throw new Error("Faca login para desativar notificacoes push.");
    }

    const currentUserId = user.id;

    setIsLoading(true);
    setError(null);

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      const endpoint = subscription?.endpoint;

      if (subscription) {
        await subscription.unsubscribe();
      }

      if (endpoint) {
        await deletePushSubscriptionByEndpoint(endpoint, currentUserId);
      }

      setIsEnabled(false);
    } catch (disableError) {
      setError(toMessage(disableError));
      throw disableError;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isSupported,
    isEnabled,
    isLoading,
    permission,
    error,
    enablePushNotifications,
    disablePushNotifications,
  };
};

