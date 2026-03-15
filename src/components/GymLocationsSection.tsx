import { lazy, Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Loader2, LocateFixed, MapPin, Navigation } from "lucide-react";
import { Button } from "./ui/button";
import { useGyms } from "@/hooks/useGyms";
import { useGeolocation } from "@/hooks/useGeolocation";
import { openDirections } from "@/lib/native";

const LeafletMapDisplay = lazy(() => import("./LeafletMapDisplay"));

const GymLocationsSection = () => {
  const { gyms, isLoading, getGymsWithDistance } = useGyms();
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [shouldRenderMap, setShouldRenderMap] = useState(false);
  const sectionRef = useRef<HTMLElement | null>(null);
  const { status: geoStatus, position: userPosition, requestLocation } = useGeolocation();

  const gymsWithDistance = userPosition
    ? getGymsWithDistance(userPosition)
    : gyms.map((gym) => ({ ...gym, distance: null as number | null }));

  const nearestGymId = gymsWithDistance[0]?.id ?? null;

  useEffect(() => {
    if (userPosition && nearestGymId) {
      setSelectedLocation(nearestGymId);
    }
  }, [nearestGymId, userPosition]);

  useEffect(() => {
    if (shouldRenderMap) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setShouldRenderMap(true);
          observer.disconnect();
        }
      },
      { rootMargin: "240px 0px" },
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, [shouldRenderMap]);

  const selectedGym = selectedLocation ? gyms.find((gym) => gym.id === selectedLocation) : null;

  const nearestGymInfo = useMemo(() => {
    return gymsWithDistance.find((gym) => gym.id === selectedLocation) ?? null;
  }, [gymsWithDistance, selectedLocation]);

  const openGoogleMaps = (address: string) => {
    void openDirections({ app: "google", address });
  };

  const openWaze = (address: string) => {
    void openDirections({ app: "waze", address });
  };

  if (isLoading) {
    return (
      <section className="animate-slide-up" style={{ animationDelay: "0.3s" }}>
        <div className="mb-3">
          <p className="app-kicker">Mapa</p>
          <h2 className="app-section-title mt-1">Academias proximas</h2>
        </div>
        <div className="app-panel flex items-center justify-center rounded-[1.8rem] p-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </section>
    );
  }

  if (gyms.length === 0) {
    return (
      <section className="animate-slide-up" style={{ animationDelay: "0.3s" }}>
        <div className="mb-3">
          <p className="app-kicker">Mapa</p>
          <h2 className="app-section-title mt-1">Academias proximas</h2>
        </div>
        <div className="app-panel rounded-[1.8rem] p-6 text-center">
          <MapPin className="mx-auto mb-3 h-12 w-12 text-muted-foreground" />
          <p className="text-muted-foreground">Nenhuma academia cadastrada ainda.</p>
        </div>
      </section>
    );
  }

  return (
    <section ref={sectionRef} className="animate-slide-up" style={{ animationDelay: "0.3s" }}>
      <div className="mb-3">
        <p className="app-kicker">Mapa</p>
        <h2 className="app-section-title mt-1">Academias proximas</h2>
      </div>

      <div className="app-panel overflow-hidden rounded-[1.8rem]" style={{ contentVisibility: "auto", containIntrinsicSize: "620px" }}>
        <div className="relative h-52 overflow-hidden bg-secondary">
          {shouldRenderMap ? (
            <Suspense
              fallback={
                <div className="flex h-full items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              }
            >
              <LeafletMapDisplay
                gyms={gyms}
                selectedId={selectedLocation}
                onMarkerClick={setSelectedLocation}
                userPosition={userPosition}
              />
            </Suspense>
          ) : (
            <div className="flex h-full items-center justify-center bg-[radial-gradient(circle_at_top,rgba(255,102,0,0.14),transparent_58%),linear-gradient(180deg,#111,#090909)]">
              <div className="text-center">
                <MapPin className="mx-auto mb-3 h-8 w-8 text-primary" />
                <p className="text-sm text-muted-foreground">Mapa sob demanda para reduzir o carregamento inicial.</p>
              </div>
            </div>
          )}

          <button
            onClick={requestLocation}
            disabled={geoStatus === "requesting"}
            className="absolute right-3 top-3 z-[1000] flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-[#141414]/88 shadow-lg backdrop-blur-xl transition-colors hover:border-primary/30 hover:bg-black/80 disabled:opacity-60"
            title="Minha localizacao"
          >
            {geoStatus === "requesting" ? (
              <Loader2 size={18} className="animate-spin text-primary" />
            ) : (
              <LocateFixed
                size={18}
                className={geoStatus === "success" ? "text-primary" : "text-muted-foreground"}
              />
            )}
          </button>
        </div>

        <div className="space-y-2 p-4">
          {gymsWithDistance.map((gym, index) => {
            const isNearest = userPosition && index === 0;
            const isSelected = selectedLocation === gym.id;
            const distanceText =
              gym.distance !== null ? (gym.distance >= 1000 ? `${(gym.distance / 1000).toFixed(1)} km` : `${gym.distance} m`) : null;

            return (
              <button
                key={gym.id}
                onClick={() => setSelectedLocation(gym.id)}
                className={`flex w-full items-center gap-3 rounded-[1.25rem] p-3 text-left transition-all ${
                  isSelected ? "border border-primary/40 bg-primary/12" : "app-panel-soft hover:bg-white/[0.05]"
                }`}
              >
                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${
                    isSelected ? "orange-glow wemovelt-gradient" : "bg-white/[0.05]"
                  }`}
                >
                  <MapPin size={18} className={isSelected ? "text-primary-foreground" : "text-primary"} />
                </div>

                <div className="min-w-0 flex-1">
                  <h4 className="truncate text-sm font-bold">{gym.name}</h4>
                  <p className="truncate text-xs text-muted-foreground">{gym.address || "Endereco nao informado"}</p>
                  {isNearest && <span className="text-xs font-semibold text-primary">Mais proxima</span>}
                </div>

                {distanceText && (
                  <span className={`text-xs font-bold ${isNearest ? "text-primary" : "text-muted-foreground"}`}>
                    {distanceText}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {selectedGym?.address && (
          <div className="flex gap-2 border-t border-white/6 p-4">
            <Button onClick={() => openGoogleMaps(selectedGym.address!)} className="flex-1">
              <Navigation size={18} />
              Google Maps
            </Button>
            <Button onClick={() => openWaze(selectedGym.address!)} variant="secondary" className="flex-1">
              <Navigation size={18} />
              Waze
            </Button>
          </div>
        )}

        {nearestGymInfo && !selectedGym?.address && (
          <div className="border-t border-white/6 px-4 py-3 text-xs text-muted-foreground">
            Raio estimado: {nearestGymInfo.distance !== null ? `${nearestGymInfo.distance} m` : "sem distancia"}
          </div>
        )}
      </div>
    </section>
  );
};

export default GymLocationsSection;
