import { useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { useEnergyStore } from '@/store/energyStore';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { 
  Server, 
  RefreshCw, 
  AlertTriangle,
  Save,
  RotateCcw,
  Wifi,
  WifiOff
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const SettingsPage = () => {
  const { settings, updateSettings, checkBackendConnection, isBackendConnected } = useEnergyStore();
  const [localSettings, setLocalSettings] = useState(settings);
  const [isChecking, setIsChecking] = useState(false);

  const handleSave = () => {
    updateSettings(localSettings);
    toast({
      title: "Settings saved",
      description: "Your configuration has been updated successfully.",
    });
  };

  const handleReset = () => {
    setLocalSettings(settings);
    toast({
      title: "Settings reset",
      description: "Changes have been discarded.",
    });
  };

  const handleCheckConnection = async () => {
    setIsChecking(true);
    const isConnected = await checkBackendConnection();
    setIsChecking(false);
    
    toast({
      title: isConnected ? "Connection successful" : "Connection failed",
      description: isConnected 
        ? "Backend server is reachable." 
        : "Using mock data as fallback.",
      variant: isConnected ? "default" : "destructive",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="ml-64 min-h-screen">
        <div className="p-6 space-y-6 max-w-4xl">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold text-foreground">Settings</h1>
            <p className="text-sm text-muted-foreground">
              Configure your energy monitoring system
            </p>
          </div>

          {/* Connection Status */}
          <div className={cn(
            "p-4 rounded-xl border flex items-center justify-between",
            isBackendConnected 
              ? "border-energy-green/30 bg-energy-green/5" 
              : "border-energy-yellow/30 bg-energy-yellow/5"
          )}>
            <div className="flex items-center gap-3">
              {isBackendConnected ? (
                <Wifi className="w-5 h-5 text-energy-green" />
              ) : (
                <WifiOff className="w-5 h-5 text-energy-yellow" />
              )}
              <div>
                <p className="font-medium text-foreground">
                  {isBackendConnected ? 'Backend Connected' : 'Using Mock Data'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {isBackendConnected 
                    ? 'Real-time data from server' 
                    : 'Backend unavailable - displaying sample data'}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={handleCheckConnection}
              disabled={isChecking}
            >
              <RefreshCw className={cn("w-4 h-4 mr-2", isChecking && "animate-spin")} />
              Test Connection
            </Button>
          </div>

          {/* API Configuration */}
          <div className="bg-card rounded-xl border border-border p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-primary/20 text-primary">
                <Server className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">API Configuration</h3>
                <p className="text-sm text-muted-foreground">Configure backend server connection</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="apiUrl">Backend API URL</Label>
                <Input
                  id="apiUrl"
                  value={localSettings.apiUrl}
                  onChange={(e) => setLocalSettings({ ...localSettings, apiUrl: e.target.value })}
                  placeholder="http://localhost:3000/api"
                  className="bg-secondary border-border font-mono"
                />
                <p className="text-xs text-muted-foreground">
                  The base URL for your energy monitoring backend API
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="refreshInterval">Refresh Interval (ms)</Label>
                <Input
                  id="refreshInterval"
                  type="number"
                  value={localSettings.refreshInterval}
                  onChange={(e) => setLocalSettings({ 
                    ...localSettings, 
                    refreshInterval: parseInt(e.target.value) || 30000 
                  })}
                  min={5000}
                  max={300000}
                  className="bg-secondary border-border font-mono"
                />
                <p className="text-xs text-muted-foreground">
                  How often to fetch new data (minimum 5000ms)
                </p>
              </div>
            </div>
          </div>

          {/* Alert Thresholds */}
          <div className="bg-card rounded-xl border border-border p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-warning/20 text-warning">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Alert Thresholds</h3>
                <p className="text-sm text-muted-foreground">Configure alert trigger values</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="voltageMin">Minimum Voltage (V)</Label>
                <Input
                  id="voltageMin"
                  type="number"
                  value={localSettings.alertThreshold.voltageMin}
                  onChange={(e) => setLocalSettings({
                    ...localSettings,
                    alertThreshold: {
                      ...localSettings.alertThreshold,
                      voltageMin: parseInt(e.target.value) || 200,
                    },
                  })}
                  className="bg-secondary border-border font-mono"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="voltageMax">Maximum Voltage (V)</Label>
                <Input
                  id="voltageMax"
                  type="number"
                  value={localSettings.alertThreshold.voltageMax}
                  onChange={(e) => setLocalSettings({
                    ...localSettings,
                    alertThreshold: {
                      ...localSettings.alertThreshold,
                      voltageMax: parseInt(e.target.value) || 250,
                    },
                  })}
                  className="bg-secondary border-border font-mono"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="currentMax">Maximum Current (A)</Label>
                <Input
                  id="currentMax"
                  type="number"
                  value={localSettings.alertThreshold.currentMax}
                  onChange={(e) => setLocalSettings({
                    ...localSettings,
                    alertThreshold: {
                      ...localSettings.alertThreshold,
                      currentMax: parseInt(e.target.value) || 15,
                    },
                  })}
                  className="bg-secondary border-border font-mono"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="powerMax">Maximum Power (W)</Label>
                <Input
                  id="powerMax"
                  type="number"
                  value={localSettings.alertThreshold.powerMax}
                  onChange={(e) => setLocalSettings({
                    ...localSettings,
                    alertThreshold: {
                      ...localSettings.alertThreshold,
                      powerMax: parseInt(e.target.value) || 3000,
                    },
                  })}
                  className="bg-secondary border-border font-mono"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 justify-end">
            <Button variant="outline" onClick={handleReset}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset Changes
            </Button>
            <Button onClick={handleSave}>
              <Save className="w-4 h-4 mr-2" />
              Save Settings
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SettingsPage;
