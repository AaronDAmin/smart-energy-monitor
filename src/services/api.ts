import axios from 'axios';
import { 
  House, 
  GridLine, 
  Transformer, 
  Alert, 
  ConsumptionData,
  SystemStats 
} from '@/types/energy';
import { 
  mockData, 
  generateMockHouses, 
  generateMockConsumptionData,
  generateMockSystemStats,
  generateMockAlerts 
} from '@/data/mockData';

const DEFAULT_API_URL = 'http://localhost:3000/api';
const TIMEOUT = 2000;

let apiUrl = DEFAULT_API_URL;
let isBackendAvailable = false;

export const setApiUrl = (url: string) => {
  apiUrl = url;
};

export const getApiUrl = () => apiUrl;

export const checkBackendHealth = async (): Promise<boolean> => {
  try {
    const response = await axios.get(`${apiUrl}/health`, { timeout: TIMEOUT });
    isBackendAvailable = response.status === 200;
    return isBackendAvailable;
  } catch (error) {
    console.warn('Backend unavailable - switching to mock data');
    isBackendAvailable = false;
    return false;
  }
};

async function fetchWithFallback<T>(
  endpoint: string, 
  mockFallback: () => T
): Promise<T> {
  if (!isBackendAvailable) {
    // Check health first if not available
    await checkBackendHealth();
  }

  if (isBackendAvailable) {
    try {
      const response = await axios.get(`${apiUrl}/${endpoint}`, { timeout: TIMEOUT });
      return response.data;
    } catch (error) {
      console.warn(`Failed to fetch ${endpoint} - using mock data`);
      isBackendAvailable = false;
      return mockFallback();
    }
  }

  return mockFallback();
}

export const fetchHouses = async (): Promise<House[]> => {
  return fetchWithFallback('houses', generateMockHouses);
};

export const fetchHouseById = async (id: number): Promise<House | null> => {
  return fetchWithFallback(`houses/${id}`, () => {
    const houses = generateMockHouses();
    return houses.find(h => h.id === id) || null;
  });
};

export const fetchGridLines = async (): Promise<GridLine[]> => {
  return fetchWithFallback('grid-lines', () => mockData.gridLines);
};

export const fetchTransformers = async (): Promise<Transformer[]> => {
  return fetchWithFallback('transformers', () => mockData.transformers);
};

export const fetchAlerts = async (): Promise<Alert[]> => {
  return fetchWithFallback('alerts', generateMockAlerts);
};

export const fetchConsumptionData = async (hours: number = 24): Promise<ConsumptionData[]> => {
  return fetchWithFallback(`consumption?hours=${hours}`, () => generateMockConsumptionData(hours));
};

export const fetchSystemStats = async (): Promise<SystemStats> => {
  return fetchWithFallback('stats', () => {
    const houses = generateMockHouses();
    return generateMockSystemStats(houses);
  });
};

export const acknowledgeAlert = async (alertId: string): Promise<boolean> => {
  if (isBackendAvailable) {
    try {
      await axios.post(`${apiUrl}/alerts/${alertId}/acknowledge`, {}, { timeout: TIMEOUT });
      return true;
    } catch (error) {
      console.warn('Failed to acknowledge alert on backend');
    }
  }
  return true;
};

export const getBackendStatus = () => isBackendAvailable;
