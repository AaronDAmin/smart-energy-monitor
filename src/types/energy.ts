export type HouseStatus = 'online' | 'offline' | 'warning';

export interface House {
  id: number;
  name: string;
  status: HouseStatus;
  voltage: number;
  current: number;
  power: number;
  lastUpdate: string;
  alerts: Alert[];
  latitude: number;
  longitude: number;
}

export interface Alert {
  id: string;
  houseId: number;
  houseName: string;
  type: 'voltage' | 'current' | 'power' | 'fault' | 'offline';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: string;
  acknowledged: boolean;
}

export interface GridLine {
  lineId: number;
  name: string;
  voltage: number;
  current: number;
  power: number;
  faultDetected: boolean;
  status: 'normal' | 'warning' | 'fault';
  loadPercentage: number;
  coordinates: [number, number][];
}

export interface Transformer {
  id: number;
  name: string;
  capacity: number;
  currentLoad: number;
  status: 'normal' | 'warning' | 'overload';
  temperature: number;
  latitude: number;
  longitude: number;
}

export interface SystemStats {
  totalPower: number;
  averageVoltage: number;
  totalHouses: number;
  onlineHouses: number;
  activeAlerts: number;
  gridEfficiency: number;
}

export interface ConsumptionData {
  timestamp: string;
  power: number;
  voltage: number;
}

export interface Settings {
  apiUrl: string;
  refreshInterval: number;
  alertThreshold: {
    voltageMin: number;
    voltageMax: number;
    currentMax: number;
    powerMax: number;
  };
}
