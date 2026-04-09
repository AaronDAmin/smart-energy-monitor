import { useState, useEffect } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { EnergyMap } from '@/components/map/EnergyMap';
import { useEnergyStore } from '@/store/energyStore';
import { House } from '@/types/energy';
import { cn } from '@/lib/utils';
import { X, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';

const MapPage = () => {
  const { houses, gridLines, transformers, fetchAllData } = useEnergyStore();
  const [selectedHouse, setSelectedHouse] = useState<House | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  const statusCounts = {
    online: houses.filter(h => h.status === 'online').length,
    warning: houses.filter(h => h.status === 'warning').length,
    offline: houses.filter(h => h.status === 'offline').length,
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="lg:ml-64 pt-14 lg:pt-0 min-h-screen">
        <div className="p-4 sm:p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">City Map</h1>
              <p className="text-sm text-muted-foreground">
                Interactive map of Goma's smart energy grid
              </p>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-energy-green" />
                <span className="text-muted-foreground">{statusCounts.online} Online</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-energy-yellow" />
                <span className="text-muted-foreground">{statusCounts.warning} Warning</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-energy-red" />
                <span className="text-muted-foreground">{statusCounts.offline} Offline</span>
              </div>
            </div>
          </div>

          {/* Map Container */}
          <div className="relative">
            <EnergyMap
              houses={houses}
              gridLines={gridLines}
              transformers={transformers}
              selectedHouse={selectedHouse}
              onHouseSelect={setSelectedHouse}
              height="calc(100vh - 180px)"
            />

            {/* Selected House Panel */}
            {selectedHouse && (
              <div className="absolute top-4 right-4 w-80 bg-card rounded-xl border border-border p-5 slide-in shadow-lg">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-foreground">{selectedHouse.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <div className={cn(
                        "status-indicator",
                        selectedHouse.status === 'online' && "status-online",
                        selectedHouse.status === 'warning' && "status-warning",
                        selectedHouse.status === 'offline' && "status-offline"
                      )} />
                      <span className="text-sm text-muted-foreground capitalize">
                        {selectedHouse.status}
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setSelectedHouse(null)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-3 rounded-lg bg-secondary/50">
                      <p className="text-xs text-muted-foreground mb-1">Voltage</p>
                      <p className="font-mono text-sm font-medium">
                        {selectedHouse.voltage.toFixed(1)}V
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-secondary/50">
                      <p className="text-xs text-muted-foreground mb-1">Current</p>
                      <p className="font-mono text-sm font-medium">
                        {selectedHouse.current.toFixed(1)}A
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-secondary/50">
                      <p className="text-xs text-muted-foreground mb-1">Power</p>
                      <p className="font-mono text-sm font-medium">
                        {selectedHouse.power.toFixed(0)}W
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    <span>
                      Last updated {formatDistanceToNow(new Date(selectedHouse.lastUpdate), { addSuffix: true })}
                    </span>
                  </div>

                  {selectedHouse.alerts.length > 0 && (
                    <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30">
                      <p className="text-xs font-medium text-destructive">
                        {selectedHouse.alerts.length} active alert(s)
                      </p>
                    </div>
                  )}

                  <Button
                    className="w-full"
                    onClick={() => navigate(`/houses/${selectedHouse.id}`)}
                  >
                    View Details
                  </Button>
                </div>
              </div>
            )}

            {/* Legend */}
            <div className="absolute bottom-4 left-4 bg-card rounded-lg border border-border p-4 shadow-lg">
              <h4 className="text-xs font-medium text-foreground mb-2">Legend</h4>
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-energy-green" />
                  <span className="text-muted-foreground">House (Online)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-energy-yellow" />
                  <span className="text-muted-foreground">House (Warning)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-energy-red" />
                  <span className="text-muted-foreground">House (Offline)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-energy-blue" />
                  <span className="text-muted-foreground">Transformer</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-0.5 bg-energy-green" />
                  <span className="text-muted-foreground">Grid Line</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default MapPage;
