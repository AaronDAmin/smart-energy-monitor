import { useEffect } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { EnergyMap } from '@/components/map/EnergyMap';
import { useEnergyStore } from '@/store/energyStore';
import { cn } from '@/lib/utils';
import { Zap, AlertTriangle, Thermometer } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

const GridPage = () => {
  const { houses, gridLines, transformers, fetchAllData } = useEnergyStore();

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  const lineStatusCounts = {
    normal: gridLines.filter(l => l.status === 'normal').length,
    warning: gridLines.filter(l => l.status === 'warning').length,
    fault: gridLines.filter(l => l.status === 'fault').length,
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="ml-64 min-h-screen">
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Grid Monitoring</h1>
              <p className="text-sm text-muted-foreground">
                Monitor grid lines, transformers, and load distribution
              </p>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-energy-green" />
                <span className="text-muted-foreground">{lineStatusCounts.normal} Normal</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-energy-yellow" />
                <span className="text-muted-foreground">{lineStatusCounts.warning} Warning</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-energy-red" />
                <span className="text-muted-foreground">{lineStatusCounts.fault} Fault</span>
              </div>
            </div>
          </div>

          {/* Grid Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Map */}
            <div className="lg:col-span-2">
              <EnergyMap
                houses={houses}
                gridLines={gridLines}
                transformers={transformers}
                height="500px"
              />
            </div>

            {/* Grid Lines Panel */}
            <div className="space-y-4">
              <div className="bg-card rounded-xl border border-border p-5">
                <h3 className="text-lg font-semibold text-foreground mb-4">Grid Lines</h3>
                <div className="space-y-4">
                  {gridLines.map((line) => (
                    <div
                      key={line.lineId}
                      className={cn(
                        "p-4 rounded-lg border-l-4",
                        line.status === 'normal' && "border-l-energy-green bg-energy-green/5",
                        line.status === 'warning' && "border-l-energy-yellow bg-energy-yellow/5",
                        line.status === 'fault' && "border-l-energy-red bg-energy-red/5"
                      )}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-foreground text-sm">{line.name}</h4>
                        {line.faultDetected && (
                          <AlertTriangle className="w-4 h-4 text-destructive" />
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                        <div>
                          <span className="text-muted-foreground">Voltage</span>
                          <p className="font-mono">{line.voltage.toFixed(1)} kV</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Current</span>
                          <p className="font-mono">{line.current.toFixed(1)} A</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Power</span>
                          <p className="font-mono">{(line.power / 1000).toFixed(1)} kW</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Load</span>
                          <p className="font-mono">{line.loadPercentage}%</p>
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-muted-foreground">Load</span>
                          <span className={cn(
                            "font-mono",
                            line.loadPercentage > 80 && "text-energy-red",
                            line.loadPercentage > 60 && line.loadPercentage <= 80 && "text-energy-yellow",
                            line.loadPercentage <= 60 && "text-energy-green"
                          )}>
                            {line.loadPercentage}%
                          </span>
                        </div>
                        <Progress 
                          value={line.loadPercentage} 
                          className={cn(
                            "h-2",
                            line.loadPercentage > 80 && "[&>div]:bg-energy-red",
                            line.loadPercentage > 60 && line.loadPercentage <= 80 && "[&>div]:bg-energy-yellow",
                            line.loadPercentage <= 60 && "[&>div]:bg-energy-green"
                          )}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Transformers */}
          <div className="bg-card rounded-xl border border-border p-5">
            <h3 className="text-lg font-semibold text-foreground mb-4">Transformers</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {transformers.map((transformer) => {
                const loadPercentage = Math.round((transformer.currentLoad / transformer.capacity) * 100);
                
                return (
                  <div
                    key={transformer.id}
                    className={cn(
                      "p-5 rounded-xl border",
                      transformer.status === 'normal' && "border-energy-green/30 bg-energy-green/5",
                      transformer.status === 'warning' && "border-energy-yellow/30 bg-energy-yellow/5",
                      transformer.status === 'overload' && "border-energy-red/30 bg-energy-red/5"
                    )}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="font-semibold text-foreground">{transformer.name}</h4>
                        <span className={cn(
                          "text-xs font-medium uppercase px-2 py-0.5 rounded-full mt-1 inline-block",
                          transformer.status === 'normal' && "bg-energy-green/20 text-energy-green",
                          transformer.status === 'warning' && "bg-energy-yellow/20 text-energy-yellow",
                          transformer.status === 'overload' && "bg-energy-red/20 text-energy-red"
                        )}>
                          {transformer.status}
                        </span>
                      </div>
                      <div className={cn(
                        "p-2 rounded-lg",
                        transformer.status === 'normal' && "bg-energy-green/20 text-energy-green",
                        transformer.status === 'warning' && "bg-energy-yellow/20 text-energy-yellow",
                        transformer.status === 'overload' && "bg-energy-red/20 text-energy-red"
                      )}>
                        <Zap className="w-5 h-5" />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between text-sm mb-2">
                          <span className="text-muted-foreground">Load Capacity</span>
                          <span className="font-mono">{loadPercentage}%</span>
                        </div>
                        <Progress 
                          value={loadPercentage}
                          className={cn(
                            "h-3",
                            loadPercentage > 90 && "[&>div]:bg-energy-red",
                            loadPercentage > 70 && loadPercentage <= 90 && "[&>div]:bg-energy-yellow",
                            loadPercentage <= 70 && "[&>div]:bg-energy-green"
                          )}
                        />
                        <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
                          <span>{(transformer.currentLoad / 1000).toFixed(1)} kW</span>
                          <span>{(transformer.capacity / 1000).toFixed(0)} kW max</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 p-3 rounded-lg bg-secondary/30">
                        <Thermometer className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Temperature</span>
                        <span className={cn(
                          "font-mono text-sm ml-auto",
                          transformer.temperature > 60 && "text-energy-red",
                          transformer.temperature > 50 && transformer.temperature <= 60 && "text-energy-yellow",
                          transformer.temperature <= 50 && "text-foreground"
                        )}>
                          {transformer.temperature}°C
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default GridPage;
