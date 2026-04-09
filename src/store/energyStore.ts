import { create } from 'zustand';
import { House, GridLine, Transformer, Alert, ConsumptionData, SystemStats, Settings } from '@/types/energy';
import * as api from '@/services/api';

interface EnergyState {
  // Data
  houses: House[];
  gridLines: GridLine[];
  transformers: Transformer[];
  alerts: Alert[];
  consumptionData: ConsumptionData[];
  systemStats: SystemStats | null;
  selectedHouse: House | null;
  
  // UI State
  isLoading: boolean;
  isBackendConnected: boolean;
  lastUpdated: string | null;
  
  // Settings
  settings: Settings;
  
  // Actions
  fetchAllData: () => Promise<void>;
  fetchHouses: () => Promise<void>;
  fetchAlerts: () => Promise<void>;
  fetchSystemStats: () => Promise<void>;
  selectHouse: (house: House | null) => void;
  acknowledgeAlert: (alertId: string) => Promise<void>;
  updateSettings: (settings: Partial<Settings>) => void;
  checkBackendConnection: () => Promise<boolean>;
}

const defaultSettings: Settings = {
  apiUrl: 'https://energy.wappnet.cc/api',
  refreshInterval: 30000,
  alertThreshold: {
    voltageMin: 200,
    voltageMax: 250,
    currentMax: 15,
    powerMax: 3000,
  },
};

export const useEnergyStore = create<EnergyState>((set, get) => ({
  houses: [],
  gridLines: [],
  transformers: [],
  alerts: [],
  consumptionData: [],
  systemStats: null,
  selectedHouse: null,
  isLoading: false,
  isBackendConnected: false,
  lastUpdated: null,
  settings: defaultSettings,

  checkBackendConnection: async () => {
    const isConnected = await api.checkBackendHealth();
    set({ isBackendConnected: isConnected });
    return isConnected;
  },

  fetchAllData: async () => {
    set({ isLoading: true });
    
    try {
      const [houses, gridLines, transformers, alerts, consumptionData, systemStats] = await Promise.all([
        api.fetchHouses(),
        api.fetchGridLines(),
        api.fetchTransformers(),
        api.fetchAlerts(),
        api.fetchConsumptionData(),
        api.fetchSystemStats(),
      ]);
      
      set({
        houses,
        gridLines,
        transformers,
        alerts,
        consumptionData,
        systemStats,
        isBackendConnected: api.getBackendStatus(),
        lastUpdated: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  fetchHouses: async () => {
    const houses = await api.fetchHouses();
    set({ houses, lastUpdated: new Date().toISOString() });
  },

  fetchAlerts: async () => {
    const alerts = await api.fetchAlerts();
    set({ alerts });
  },

  fetchSystemStats: async () => {
    const systemStats = await api.fetchSystemStats();
    set({ systemStats });
  },

  selectHouse: (house) => {
    set({ selectedHouse: house });
  },

  acknowledgeAlert: async (alertId) => {
    await api.acknowledgeAlert(alertId);
    const alerts = get().alerts.map(alert =>
      alert.id === alertId ? { ...alert, acknowledged: true } : alert
    );
    set({ alerts });
  },

  updateSettings: (newSettings) => {
    const settings = { ...get().settings, ...newSettings };
    if (newSettings.apiUrl) {
      api.setApiUrl(newSettings.apiUrl);
    }
    set({ settings });
  },
}));
