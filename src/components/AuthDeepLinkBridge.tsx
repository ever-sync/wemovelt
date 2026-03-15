import { useEffect } from "react";
import { App as CapacitorApp } from "@capacitor/app";
import { useNavigate } from "react-router-dom";
import { isNativeApp } from "@/lib/native";

const AUTH_CALLBACK_PATH = "/auth/callback";

const isAuthCallbackUrl = (rawUrl: string) => {
  try {
    const url = new URL(rawUrl);
    return `${url.host}${url.pathname}` === "auth/callback" || url.pathname === AUTH_CALLBACK_PATH;
  } catch {
    return false;
  }
};

const AuthDeepLinkBridge = () => {
  const navigate = useNavigate();

  useEffect(() => {
    if (!isNativeApp()) {
      return;
    }

    const routeIncomingUrl = (rawUrl?: string) => {
      if (!rawUrl || !isAuthCallbackUrl(rawUrl)) {
        return;
      }

      navigate(`${AUTH_CALLBACK_PATH}?incoming=${encodeURIComponent(rawUrl)}`, { replace: true });
    };

    void CapacitorApp.getLaunchUrl().then(({ url }) => routeIncomingUrl(url));

    const listener = CapacitorApp.addListener("appUrlOpen", ({ url }) => {
      routeIncomingUrl(url);
    });

    return () => {
      void listener.then((handle) => handle.remove());
    };
  }, [navigate]);

  return null;
};

export default AuthDeepLinkBridge;
