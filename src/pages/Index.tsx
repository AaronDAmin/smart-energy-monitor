import { useEffect, useState } from 'react';
import { useEnergyStore } from '@/store/energyStore';
import { Sidebar } from '@/components/layout/Sidebar';
import { StatCard } from '@/components/dashboard/StatCard';
import { PowerChart } from '@/components/dashboard/PowerChart';
import { AlertsList } from '@/components/dashboard/AlertsList';
import { HouseStatusGrid } from '@/components/dashboard/HouseStatusGrid';
import { Zap, Home, AlertTriangle, Gauge, Map } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';

const Dashboard = () => {
  const { 
    houses, 
    alerts, 
    consumptionData, 
    systemStats, 
    lastUpdated,
    fetchAllData
  } = useEnergyStore();

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  const unacknowledgedAlerts = alerts.filter(a => !a.acknowledged);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="ml-64 min-h-screen">
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
              <p className="text-sm text-muted-foreground">
                Real-time energy monitoring for Goma City
                {lastUpdated && (
                  <span className="ml-2">
                    • Updated {formatDistanceToNow(new Date(lastUpdated), { addSuffix: true })}
                  </span>
                )}
              </p>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link to="/map">
                <Map className="w-4 h-4 mr-2" />
                View Full Map
              </Link>
            </Button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total Power"
              value={systemStats ? (systemStats.totalPower / 1000).toFixed(1) : '0'}
              unit="kW"
              icon={<Zap className="w-5 h-5" />}
              variant="primary"
              trend={2.5}
            />
            <StatCard
              title="Average Voltage"
              value={systemStats?.averageVoltage?.toFixed(1) || '0'}
              unit="V"
              icon={<Gauge className="w-5 h-5" />}
              variant="default"
            />
            <StatCard
              title="Online Houses"
              value={`${systemStats?.onlineHouses || 0}/${systemStats?.totalHouses || 0}`}
              icon={<Home className="w-5 h-5" />}
              variant="default"
            />
            <StatCard
              title="Active Alerts"
              value={unacknowledgedAlerts.length}
              icon={<AlertTriangle className="w-5 h-5" />}
              variant={unacknowledgedAlerts.length > 0 ? 'danger' : 'default'}
            />
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Power Chart */}
            <div className="lg:col-span-2">
              <PowerChart data={consumptionData} />
            </div>

            {/* Alerts Panel */}
            <div className="bg-card rounded-xl border border-border p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-foreground">Recent Alerts</h3>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/alerts">View All</Link>
                </Button>
              </div>
              <AlertsList alerts={unacknowledgedAlerts} maxItems={4} showActions={false} />
            </div>
          </div>

          {/* House Status Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-card rounded-xl border border-border p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-foreground">House Status Overview</h3>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/houses">View All</Link>
                </Button>
              </div>
              <div className="mb-4">
                <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-energy-green" />
                    <span>Online</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-energy-yellow" />
                    <span>Warning</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-energy-red" />
                    <span>Offline</span>
                  </div>
                </div>
              </div>
              <HouseStatusGrid houses={houses} />
              <div className="mt-4 pt-4 border-t border-border">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Grid Efficiency</span>
                  <span className="font-mono text-primary font-medium">
                    {systemStats?.gridEfficiency?.toFixed(1) || '0'}%
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-card rounded-xl border border-border p-5">
              <h3 className="text-lg font-semibold text-foreground mb-4">System Summary</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                  <span className="text-muted-foreground">Total Houses</span>
                  <span className="font-mono font-semibold">{houses.length}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                  <span className="text-muted-foreground">Online</span>
                  <span className="font-mono font-semibold text-energy-green">
                    {houses.filter(h => h.status === 'online').length}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                  <span className="text-muted-foreground">Warnings</span>
                  <span className="font-mono font-semibold text-energy-yellow">
                    {houses.filter(h => h.status === 'warning').length}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                  <span className="text-muted-foreground">Offline</span>
                  <span className="font-mono font-semibold text-energy-red">
                    {houses.filter(h => h.status === 'offline').length}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-primary/10 border border-primary/20">
                  <span className="text-muted-foreground">Active Alerts</span>
                  <span className="font-mono font-semibold text-primary">
                    {unacknowledgedAlerts.length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
