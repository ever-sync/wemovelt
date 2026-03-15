import { Capacitor } from "@capacitor/core";
import { AppLauncher } from "@capacitor/app-launcher";
import { Browser } from "@capacitor/browser";
import { Share } from "@capacitor/share";

export const NATIVE_AUTH_REDIRECT_URL = "br.academias.wemovelt://auth/callback";

export const isNativeApp = () => Capacitor.isNativePlatform();

export const getAuthRedirectUrl = () => {
  if (isNativeApp()) {
    return NATIVE_AUTH_REDIRECT_URL;
  }

  return `${window.location.origin}/auth/callback`;
};

export const openExternalUrl = async (url: string) => {
  if (isNativeApp()) {
    await Browser.open({ url });
    return;
  }

  window.open(url, "_blank", "noopener,noreferrer");
};

export const openWhatsApp = async (message?: string) => {
  const encodedMessage = message ? encodeURIComponent(message) : "";
  const nativeUrl = `whatsapp://send?phone=5511952130972${encodedMessage ? `&text=${encodedMessage}` : ""}`;
  const fallbackUrl = `https://wa.me/5511952130972${encodedMessage ? `?text=${encodedMessage}` : ""}`;

  if (isNativeApp()) {
    const { value } = await AppLauncher.canOpenUrl({ url: nativeUrl });

    if (value) {
      await AppLauncher.openUrl({ url: nativeUrl });
      return;
    }
  }

  await openExternalUrl(fallbackUrl);
};

interface DirectionsOptions {
  app: "google" | "waze";
  address?: string | null;
  lat?: number | null;
  lng?: number | null;
}

export const openDirections = async ({ app, address, lat, lng }: DirectionsOptions) => {
  const hasCoordinates = typeof lat === "number" && typeof lng === "number";
  const destination = hasCoordinates ? `${lat},${lng}` : encodeURIComponent(address ?? "");

  const nativeUrl =
    app === "google"
      ? hasCoordinates
        ? `comgooglemaps://?daddr=${destination}&directionsmode=driving`
        : `comgooglemaps://?daddr=${destination}`
      : hasCoordinates
        ? `waze://?ll=${destination}&navigate=yes`
        : `waze://?q=${destination}&navigate=yes`;

  const fallbackUrl =
    app === "google"
      ? `https://www.google.com/maps/dir/?api=1&destination=${destination}`
      : hasCoordinates
        ? `https://waze.com/ul?ll=${destination}&navigate=yes`
        : `https://waze.com/ul?q=${destination}&navigate=yes`;

  if (isNativeApp()) {
    const { value } = await AppLauncher.canOpenUrl({ url: nativeUrl });

    if (value) {
      await AppLauncher.openUrl({ url: nativeUrl });
      return;
    }
  }

  await openExternalUrl(fallbackUrl);
};

interface ShareContent {
  title: string;
  text: string;
  url?: string;
}

export const shareContent = async ({ title, text, url }: ShareContent) => {
  if (isNativeApp()) {
    await Share.share({ title, text, url });
    return "shared";
  }

  if (navigator.share) {
    await navigator.share({ title, text, url });
    return "shared";
  }

  if (url && navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(url);
    return "copied";
  }

  return "unsupported";
};
