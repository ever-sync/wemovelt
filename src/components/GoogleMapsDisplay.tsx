import { APIProvider, Map, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';
import { useMemo } from 'react';

interface Gym {
  id: string;
  name: string;
  lat: number | null;
  lng: number | null;
}

interface GoogleMapsDisplayProps {
  gyms: Gym[];
  selectedId: string | null;
  onMarkerClick: (id: string) => void;
}

const GoogleMapsDisplay = ({ gyms, selectedId, onMarkerClick }: GoogleMapsDisplayProps) => {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  // Calculate center based on gyms with valid coordinates
  const center = useMemo(() => {
    const validGyms = gyms.filter(g => g.lat !== null && g.lng !== null);
    if (validGyms.length === 0) {
      return { lat: -23.55052, lng: -46.633308 }; // São Paulo default
    }

    const avgLat = validGyms.reduce((sum, g) => sum + g.lat!, 0) / validGyms.length;
    const avgLng = validGyms.reduce((sum, g) => sum + g.lng!, 0) / validGyms.length;
    return { lat: avgLat, lng: avgLng };
  }, [gyms]);

  // Calculate appropriate zoom level based on gym spread
  const zoom = useMemo(() => {
    const validGyms = gyms.filter(g => g.lat !== null && g.lng !== null);
    if (validGyms.length <= 1) return 14;
    
    // Calculate the spread of coordinates
    const lats = validGyms.map(g => g.lat!);
    const lngs = validGyms.map(g => g.lng!);
    const latSpread = Math.max(...lats) - Math.min(...lats);
    const lngSpread = Math.max(...lngs) - Math.min(...lngs);
    const maxSpread = Math.max(latSpread, lngSpread);
    
    // Adjust zoom based on spread
    if (maxSpread > 0.1) return 11;
    if (maxSpread > 0.05) return 12;
    if (maxSpread > 0.02) return 13;
    return 14;
  }, [gyms]);

  if (!apiKey) {
    return null;
  }

  return (
    <APIProvider apiKey={apiKey}>
      <Map
        style={{ width: '100%', height: '100%' }}
        defaultCenter={center}
        defaultZoom={zoom}
        gestureHandling="cooperative"
        disableDefaultUI={true}
        mapId="gym-locations-map"
        colorScheme="DARK"
      >
        {gyms.map(gym => {
          if (gym.lat === null || gym.lng === null) return null;
          
          const isSelected = selectedId === gym.id;
          
          return (
            <AdvancedMarker
              key={gym.id}
              position={{ lat: gym.lat, lng: gym.lng }}
              onClick={() => onMarkerClick(gym.id)}
              title={gym.name}
            >
              <Pin
                background={isSelected ? "#f97316" : "#ea580c"}
                borderColor={isSelected ? "#fff" : "#c2410c"}
                glyphColor="#fff"
                scale={isSelected ? 1.2 : 1}
              />
            </AdvancedMarker>
          );
        })}
      </Map>
    </APIProvider>
  );
};

export default GoogleMapsDisplay;
