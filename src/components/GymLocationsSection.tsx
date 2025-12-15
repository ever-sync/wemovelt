import { MapPin } from "lucide-react";
import { useState } from "react";

const locations = [
  {
    id: 1,
    name: "Zona Sul",
    address: "Parque Ibirapuera",
    coords: { lat: -23.5874, lng: -46.6576 },
  },
  {
    id: 2,
    name: "Zona Leste",
    address: "Parque do Carmo",
    coords: { lat: -23.5825, lng: -46.4739 },
  },
];

const GymLocationsSection = () => {
  const [selectedLocation, setSelectedLocation] = useState<number | null>(null);

  return (
    <section className="animate-slide-up" style={{ animationDelay: "0.3s" }}>
      <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
        <span className="text-primary">●</span> LOCALIZAÇÕES DAS ACADEMIAS
      </h2>

      <div className="bg-card rounded-2xl overflow-hidden">
        {/* Map placeholder - interactive visual */}
        <div className="relative h-48 bg-secondary overflow-hidden">
          {/* Simulated map background */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 to-green-900/20">
            <svg className="w-full h-full opacity-30" viewBox="0 0 400 200">
              {/* Grid lines */}
              {[...Array(10)].map((_, i) => (
                <line
                  key={`h-${i}`}
                  x1="0"
                  y1={i * 20}
                  x2="400"
                  y2={i * 20}
                  stroke="currentColor"
                  strokeWidth="0.5"
                  className="text-muted-foreground"
                />
              ))}
              {[...Array(20)].map((_, i) => (
                <line
                  key={`v-${i}`}
                  x1={i * 20}
                  y1="0"
                  x2={i * 20}
                  y2="200"
                  stroke="currentColor"
                  strokeWidth="0.5"
                  className="text-muted-foreground"
                />
              ))}
              {/* Roads */}
              <path
                d="M0 100 Q 100 80, 200 100 T 400 90"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                className="text-muted-foreground/50"
              />
              <path
                d="M200 0 Q 180 100, 200 200"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-muted-foreground/40"
              />
            </svg>
          </div>

          {/* Map pins */}
          <div
            className={`absolute top-1/3 left-1/4 cursor-pointer transition-transform ${
              selectedLocation === 1 ? "scale-125" : "hover:scale-110"
            }`}
            onClick={() => setSelectedLocation(1)}
          >
            <div className="relative">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow-lg ${
                selectedLocation === 1 ? "wemovelt-gradient" : "bg-primary"
              }`}>
                <MapPin size={18} className="text-foreground" />
              </div>
              {selectedLocation === 1 && (
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-primary rounded-full animate-ping" />
              )}
            </div>
          </div>

          <div
            className={`absolute top-1/2 right-1/4 cursor-pointer transition-transform ${
              selectedLocation === 2 ? "scale-125" : "hover:scale-110"
            }`}
            onClick={() => setSelectedLocation(2)}
          >
            <div className="relative">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow-lg ${
                selectedLocation === 2 ? "wemovelt-gradient" : "bg-primary"
              }`}>
                <MapPin size={18} className="text-foreground" />
              </div>
              {selectedLocation === 2 && (
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-primary rounded-full animate-ping" />
              )}
            </div>
          </div>

          {/* Legend */}
          <div className="absolute bottom-2 left-2 bg-background/80 backdrop-blur-sm rounded-lg px-2 py-1 text-xs">
            São Paulo, SP
          </div>
        </div>

        {/* Location cards */}
        <div className="p-4 space-y-2">
          {locations.map((location) => (
            <button
              key={location.id}
              onClick={() => setSelectedLocation(location.id)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                selectedLocation === location.id
                  ? "bg-primary/20 border border-primary"
                  : "bg-secondary hover:bg-secondary/80"
              }`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                selectedLocation === location.id ? "wemovelt-gradient" : "bg-primary/20"
              }`}>
                <MapPin size={18} className={selectedLocation === location.id ? "text-foreground" : "text-primary"} />
              </div>
              <div className="text-left">
                <h4 className="font-bold text-sm">{location.name}</h4>
                <p className="text-xs text-muted-foreground">{location.address}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default GymLocationsSection;
