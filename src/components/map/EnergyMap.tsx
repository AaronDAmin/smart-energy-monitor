import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { House, GridLine, Transformer } from '@/types/energy';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

// Fix for default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface EnergyMapProps {
  houses: House[];
  gridLines?: GridLine[];
  transformers?: Transformer[];
  selectedHouse?: House | null;
  onHouseSelect?: (house: House) => void;
  height?: string;
}

const createHouseIcon = (status: string) => {
  const color = status === 'online' ? '#0FA958' : status === 'warning' ? '#EAB308' : '#EF4444';
  const size = status === 'offline' ? 12 : 10;
  
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        width: ${size}px;
        height: ${size}px;
        background-color: ${color};
        border-radius: 50%;
        border: 2px solid rgba(255,255,255,0.5);
        box-shadow: 0 0 10px ${color}80;
      "></div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
};

const createTransformerIcon = () => {
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        width: 20px;
        height: 20px;
        background-color: #3B82F6;
        border-radius: 4px;
        border: 2px solid rgba(255,255,255,0.7);
        box-shadow: 0 0 15px #3B82F680;
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="white" stroke="white" stroke-width="2">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
        </svg>
      </div>
    `,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
};

const MapUpdater = ({ center }: { center: [number, number] }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
};

export const EnergyMap = ({
  houses,
  gridLines = [],
  transformers = [],
  selectedHouse,
  onHouseSelect,
  height = "500px",
}: EnergyMapProps) => {
  const navigate = useNavigate();
  const mapCenter: [number, number] = [-1.6771, 29.2385]; // Goma, DRC

  const getLineColor = (status: string) => {
    switch (status) {
      case 'fault': return '#EF4444';
      case 'warning': return '#EAB308';
      default: return '#0FA958';
    }
  };

  return (
    <div className="rounded-xl overflow-hidden border border-border" style={{ height }}>
      <MapContainer
        center={mapCenter}
        zoom={14}
        style={{ height: '100%', width: '100%' }}
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        {selectedHouse && (
          <MapUpdater center={[selectedHouse.latitude, selectedHouse.longitude]} />
        )}

        {/* Grid Lines */}
        {gridLines.map((line) => (
          <Polyline
            key={line.lineId}
            positions={line.coordinates as [number, number][]}
            pathOptions={{
              color: getLineColor(line.status),
              weight: 4,
              opacity: 0.8,
              dashArray: line.faultDetected ? '10, 10' : undefined,
            }}
          >
            <Popup>
              <div className="p-2 min-w-[180px]">
                <h4 className="font-semibold text-sm mb-2">{line.name}</h4>
                <div className="space-y-1 text-xs">
                  <p>Voltage: {line.voltage.toFixed(1)} kV</p>
                  <p>Current: {line.current.toFixed(1)} A</p>
                  <p>Power: {(line.power / 1000).toFixed(1)} kW</p>
                  <p>Load: {line.loadPercentage}%</p>
                  {line.faultDetected && (
                    <p className="text-red-500 font-medium">⚠️ Fault Detected</p>
                  )}
                </div>
              </div>
            </Popup>
          </Polyline>
        ))}

        {/* Transformers */}
        {transformers.map((transformer) => (
          <Marker
            key={transformer.id}
            position={[transformer.latitude, transformer.longitude]}
            icon={createTransformerIcon()}
          >
            <Popup>
              <div className="p-2 min-w-[180px]">
                <h4 className="font-semibold text-sm mb-2">{transformer.name}</h4>
                <div className="space-y-1 text-xs">
                  <p>Capacity: {(transformer.capacity / 1000).toFixed(0)} kW</p>
                  <p>Load: {(transformer.currentLoad / 1000).toFixed(0)} kW ({Math.round(transformer.currentLoad / transformer.capacity * 100)}%)</p>
                  <p>Temperature: {transformer.temperature}°C</p>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Houses */}
        {houses.map((house) => (
          <Marker
            key={house.id}
            position={[house.latitude, house.longitude]}
            icon={createHouseIcon(house.status)}
            eventHandlers={{
              click: () => {
                if (onHouseSelect) {
                  onHouseSelect(house);
                } else {
                  navigate(`/houses/${house.id}`);
                }
              },
            }}
          >
            <Popup>
              <div className="p-2 min-w-[160px]">
                <h4 className="font-semibold text-sm mb-2">{house.name}</h4>
                <div className="space-y-1 text-xs">
                  <p className={cn(
                    "font-medium",
                    house.status === 'online' && "text-green-500",
                    house.status === 'warning' && "text-yellow-500",
                    house.status === 'offline' && "text-red-500"
                  )}>
                    Status: {house.status}
                  </p>
                  <p>Voltage: {house.voltage.toFixed(1)} V</p>
                  <p>Power: {house.power.toFixed(0)} W</p>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};
