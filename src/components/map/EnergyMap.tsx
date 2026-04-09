import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { House, GridLine, Transformer } from '@/types/energy';
import { useNavigate } from 'react-router-dom';

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

const getLineColor = (status: string) => {
  switch (status) {
    case 'fault': return '#EF4444';
    case 'warning': return '#EAB308';
    default: return '#0FA958';
  }
};

export const EnergyMap = ({
  houses,
  gridLines = [],
  transformers = [],
  selectedHouse,
  onHouseSelect,
  height = "500px",
}: EnergyMapProps) => {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<L.LayerGroup | null>(null);
  const linesRef = useRef<L.LayerGroup | null>(null);
  const navigate = useNavigate();

  // Initialize map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const mapCenter: L.LatLngExpression = [-1.6771, 29.2385]; // Goma, DRC
    
    mapRef.current = L.map(containerRef.current, {
      center: mapCenter,
      zoom: 14,
      zoomControl: true,
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(mapRef.current);

    markersRef.current = L.layerGroup().addTo(mapRef.current);
    linesRef.current = L.layerGroup().addTo(mapRef.current);

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Update grid lines
  useEffect(() => {
    if (!linesRef.current || !mapRef.current) return;

    linesRef.current.clearLayers();

    gridLines.forEach((line) => {
      const polyline = L.polyline(line.coordinates as L.LatLngExpression[], {
        color: getLineColor(line.status),
        weight: 4,
        opacity: 0.8,
        dashArray: line.faultDetected ? '10, 10' : undefined,
      });

      polyline.bindPopup(`
        <div style="padding: 8px; min-width: 180px;">
          <h4 style="font-weight: 600; font-size: 14px; margin-bottom: 8px;">${line.name}</h4>
          <div style="font-size: 12px; line-height: 1.5;">
            <p>Voltage: ${line.voltage.toFixed(1)} kV</p>
            <p>Current: ${line.current.toFixed(1)} A</p>
            <p>Power: ${(line.power / 1000).toFixed(1)} kW</p>
            <p>Load: ${line.loadPercentage}%</p>
            ${line.faultDetected ? '<p style="color: #EF4444; font-weight: 500;">⚠️ Fault Detected</p>' : ''}
          </div>
        </div>
      `);

      linesRef.current?.addLayer(polyline);
    });
  }, [gridLines]);

  // Update markers (houses and transformers)
  useEffect(() => {
    if (!markersRef.current || !mapRef.current) return;

    markersRef.current.clearLayers();

    // Add transformers
    transformers.forEach((transformer) => {
      const marker = L.marker([transformer.latitude, transformer.longitude], {
        icon: createTransformerIcon(),
      });

      marker.bindPopup(`
        <div style="padding: 8px; min-width: 180px;">
          <h4 style="font-weight: 600; font-size: 14px; margin-bottom: 8px;">${transformer.name}</h4>
          <div style="font-size: 12px; line-height: 1.5;">
            <p>Capacity: ${(transformer.capacity / 1000).toFixed(0)} kW</p>
            <p>Load: ${(transformer.currentLoad / 1000).toFixed(0)} kW (${Math.round(transformer.currentLoad / transformer.capacity * 100)}%)</p>
            <p>Temperature: ${transformer.temperature}°C</p>
          </div>
        </div>
      `);

      markersRef.current?.addLayer(marker);
    });

    // Add houses
    houses.forEach((house) => {
      const marker = L.marker([house.latitude, house.longitude], {
        icon: createHouseIcon(house.status),
      });

      const statusColor = house.status === 'online' ? '#0FA958' : house.status === 'warning' ? '#EAB308' : '#EF4444';

      marker.bindPopup(`
        <div style="padding: 8px; min-width: 160px;">
          <h4 style="font-weight: 600; font-size: 14px; margin-bottom: 8px;">${house.name}</h4>
          <div style="font-size: 12px; line-height: 1.5;">
            <p style="color: ${statusColor}; font-weight: 500;">Status: ${house.status}</p>
            <p>Voltage: ${house.voltage.toFixed(1)} V</p>
            <p>Power: ${house.power.toFixed(0)} W</p>
          </div>
        </div>
      `);

      marker.on('click', () => {
        if (onHouseSelect) {
          onHouseSelect(house);
        } else {
          navigate(`/houses/${house.id}`);
        }
      });

      markersRef.current?.addLayer(marker);
    });
  }, [houses, transformers, onHouseSelect, navigate]);

  // Center on selected house
  useEffect(() => {
    if (!mapRef.current || !selectedHouse) return;
    mapRef.current.setView([selectedHouse.latitude, selectedHouse.longitude], mapRef.current.getZoom());
  }, [selectedHouse]);

  return (
    <div className="rounded-xl overflow-hidden border border-border" style={{ isolation: 'isolate' }}>
      <div 
        ref={containerRef} 
        style={{ height, width: '100%' }} 
      />
    </div>
  );
};
