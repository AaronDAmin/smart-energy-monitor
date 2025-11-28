import { House, GridLine, Transformer, Alert, ConsumptionData, SystemStats } from '@/types/energy';

// Goma, DRC coordinates
const GOMA_CENTER = { lat: -1.6771, lng: 29.2385 };
const SPREAD = 0.05;

const generateHousePosition = (index: number) => {
  const angle = (index / 100) * Math.PI * 2 * 3;
  const radius = (index / 100) * SPREAD;
  return {
    latitude: GOMA_CENTER.lat + Math.sin(angle) * radius + (Math.random() - 0.5) * 0.02,
    longitude: GOMA_CENTER.lng + Math.cos(angle) * radius + (Math.random() - 0.5) * 0.02,
  };
};

const generateStatus = (): 'online' | 'offline' | 'warning' => {
  const rand = Math.random();
  if (rand > 0.95) return 'offline';
  if (rand > 0.85) return 'warning';
  return 'online';
};

const generateAlerts = (houseId: number, houseName: string): Alert[] => {
  const alerts: Alert[] = [];
  if (Math.random() > 0.9) {
    alerts.push({
      id: `alert-${houseId}-${Date.now()}`,
      houseId,
      houseName,
      type: Math.random() > 0.5 ? 'voltage' : 'power',
      severity: Math.random() > 0.7 ? 'high' : 'medium',
      message: `Abnormal ${Math.random() > 0.5 ? 'voltage' : 'power'} detected`,
      timestamp: new Date(Date.now() - Math.random() * 3600000).toISOString(),
      acknowledged: Math.random() > 0.5,
    });
  }
  return alerts;
};

export const generateMockHouses = (): House[] => {
  return Array.from({ length: 100 }, (_, i) => {
    const id = i + 1;
    const name = `House ${String(id).padStart(2, '0')}`;
    const status = generateStatus();
    const position = generateHousePosition(i);
    
    return {
      id,
      name,
      status,
      voltage: status === 'offline' ? 0 : 210 + Math.random() * 30,
      current: status === 'offline' ? 0 : 3 + Math.random() * 7,
      power: status === 'offline' ? 0 : 800 + Math.random() * 1500,
      lastUpdate: new Date(Date.now() - Math.random() * 60000).toISOString(),
      alerts: generateAlerts(id, name),
      ...position,
    };
  });
};

export const generateMockGridLines = (): GridLine[] => {
  const lines: GridLine[] = [
    {
      lineId: 1,
      name: 'Main Distribution Line A',
      voltage: 15.2,
      current: 120.4,
      power: 18000,
      faultDetected: false,
      status: 'normal',
      loadPercentage: 65,
      coordinates: [
        [GOMA_CENTER.lat, GOMA_CENTER.lng],
        [GOMA_CENTER.lat + 0.02, GOMA_CENTER.lng + 0.03],
        [GOMA_CENTER.lat + 0.04, GOMA_CENTER.lng + 0.02],
      ],
    },
    {
      lineId: 2,
      name: 'Main Distribution Line B',
      voltage: 14.8,
      current: 135.2,
      power: 20000,
      faultDetected: false,
      status: 'warning',
      loadPercentage: 82,
      coordinates: [
        [GOMA_CENTER.lat, GOMA_CENTER.lng],
        [GOMA_CENTER.lat - 0.02, GOMA_CENTER.lng + 0.025],
        [GOMA_CENTER.lat - 0.035, GOMA_CENTER.lng + 0.04],
      ],
    },
    {
      lineId: 3,
      name: 'Secondary Line C',
      voltage: 15.0,
      current: 85.6,
      power: 12800,
      faultDetected: true,
      status: 'fault',
      loadPercentage: 45,
      coordinates: [
        [GOMA_CENTER.lat + 0.02, GOMA_CENTER.lng + 0.03],
        [GOMA_CENTER.lat + 0.03, GOMA_CENTER.lng + 0.05],
      ],
    },
    {
      lineId: 4,
      name: 'Secondary Line D',
      voltage: 15.1,
      current: 92.3,
      power: 13950,
      faultDetected: false,
      status: 'normal',
      loadPercentage: 58,
      coordinates: [
        [GOMA_CENTER.lat - 0.02, GOMA_CENTER.lng + 0.025],
        [GOMA_CENTER.lat - 0.04, GOMA_CENTER.lng + 0.01],
      ],
    },
  ];
  return lines;
};

export const generateMockTransformers = (): Transformer[] => {
  return [
    {
      id: 1,
      name: 'Main Transformer T1',
      capacity: 50000,
      currentLoad: 32500,
      status: 'normal',
      temperature: 45,
      latitude: GOMA_CENTER.lat,
      longitude: GOMA_CENTER.lng,
    },
    {
      id: 2,
      name: 'Distribution Transformer T2',
      capacity: 25000,
      currentLoad: 21000,
      status: 'warning',
      temperature: 62,
      latitude: GOMA_CENTER.lat + 0.02,
      longitude: GOMA_CENTER.lng + 0.03,
    },
    {
      id: 3,
      name: 'Distribution Transformer T3',
      capacity: 25000,
      currentLoad: 15000,
      status: 'normal',
      temperature: 38,
      latitude: GOMA_CENTER.lat - 0.02,
      longitude: GOMA_CENTER.lng + 0.025,
    },
  ];
};

export const generateMockAlerts = (): Alert[] => {
  const alerts: Alert[] = [
    {
      id: 'alert-1',
      houseId: 15,
      houseName: 'House 15',
      type: 'voltage',
      severity: 'high',
      message: 'Voltage drop detected below threshold (195V)',
      timestamp: new Date(Date.now() - 300000).toISOString(),
      acknowledged: false,
    },
    {
      id: 'alert-2',
      houseId: 42,
      houseName: 'House 42',
      type: 'power',
      severity: 'medium',
      message: 'Unusual power consumption spike detected',
      timestamp: new Date(Date.now() - 600000).toISOString(),
      acknowledged: false,
    },
    {
      id: 'alert-3',
      houseId: 78,
      houseName: 'House 78',
      type: 'offline',
      severity: 'critical',
      message: 'Connection lost - house offline',
      timestamp: new Date(Date.now() - 120000).toISOString(),
      acknowledged: false,
    },
    {
      id: 'alert-4',
      houseId: 33,
      houseName: 'House 33',
      type: 'current',
      severity: 'low',
      message: 'Current fluctuation detected',
      timestamp: new Date(Date.now() - 900000).toISOString(),
      acknowledged: true,
    },
    {
      id: 'alert-5',
      houseId: 0,
      houseName: 'Grid Line C',
      type: 'fault',
      severity: 'critical',
      message: 'Fault detected on Secondary Line C',
      timestamp: new Date(Date.now() - 180000).toISOString(),
      acknowledged: false,
    },
  ];
  return alerts;
};

export const generateMockConsumptionData = (hours: number = 24): ConsumptionData[] => {
  const data: ConsumptionData[] = [];
  const now = Date.now();
  
  for (let i = hours; i >= 0; i--) {
    const timestamp = new Date(now - i * 3600000).toISOString();
    const hour = new Date(timestamp).getHours();
    const basePower = hour >= 6 && hour <= 22 ? 85000 : 45000;
    const variation = Math.sin((hour / 24) * Math.PI * 2) * 15000;
    
    data.push({
      timestamp,
      power: basePower + variation + (Math.random() - 0.5) * 5000,
      voltage: 220 + (Math.random() - 0.5) * 10,
    });
  }
  
  return data;
};

export const generateMockSystemStats = (houses: House[]): SystemStats => {
  const onlineHouses = houses.filter(h => h.status !== 'offline');
  const totalPower = onlineHouses.reduce((sum, h) => sum + h.power, 0);
  const avgVoltage = onlineHouses.length > 0 
    ? onlineHouses.reduce((sum, h) => sum + h.voltage, 0) / onlineHouses.length 
    : 0;
  const activeAlerts = houses.reduce((sum, h) => sum + h.alerts.filter(a => !a.acknowledged).length, 0);
  
  return {
    totalPower: Math.round(totalPower),
    averageVoltage: Math.round(avgVoltage * 10) / 10,
    totalHouses: houses.length,
    onlineHouses: onlineHouses.length,
    activeAlerts: activeAlerts + 3,
    gridEfficiency: 94.5 + Math.random() * 3,
  };
};

export const mockData = {
  houses: generateMockHouses(),
  gridLines: generateMockGridLines(),
  transformers: generateMockTransformers(),
  alerts: generateMockAlerts(),
  consumptionData: generateMockConsumptionData(),
};
