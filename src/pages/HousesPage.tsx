import { useState, useMemo, useEffect } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { useEnergyStore } from '@/store/energyStore';
import { cn } from '@/lib/utils';
import { Search, AlertTriangle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

type FilterStatus = 'all' | 'online' | 'warning' | 'offline';

const HousesPage = () => {
  const { houses, fetchAllData } = useEnergyStore();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all');

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  const filteredHouses = useMemo(() => {
    return houses.filter(house => {
      const matchesSearch = house.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || house.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [houses, searchQuery, statusFilter]);

  const statusCounts = {
    all: houses.length,
    online: houses.filter(h => h.status === 'online').length,
    warning: houses.filter(h => h.status === 'warning').length,
    offline: houses.filter(h => h.status === 'offline').length,
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="ml-64 min-h-screen">
        <div className="p-6 space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold text-foreground">Houses</h1>
            <p className="text-sm text-muted-foreground">
              Monitor and manage all connected houses
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search houses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-secondary border-border"
              />
            </div>
            <div className="flex gap-2">
              {(['all', 'online', 'warning', 'offline'] as FilterStatus[]).map((status) => (
                <Button
                  key={status}
                  variant={statusFilter === status ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter(status)}
                  className={cn(
                    statusFilter === status && status === 'online' && "bg-energy-green hover:bg-energy-green/90",
                    statusFilter === status && status === 'warning' && "bg-energy-yellow hover:bg-energy-yellow/90 text-warning-foreground",
                    statusFilter === status && status === 'offline' && "bg-energy-red hover:bg-energy-red/90"
                  )}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)} ({statusCounts[status]})
                </Button>
              ))}
            </div>
          </div>

          {/* Houses Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredHouses.map((house) => (
              <button
                key={house.id}
                onClick={() => navigate(`/houses/${house.id}`)}
                className="bg-card rounded-xl border border-border p-4 text-left transition-all duration-200 hover:scale-[1.02] hover:border-primary/50"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-foreground">{house.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <div className={cn(
                        "status-indicator",
                        house.status === 'online' && "status-online",
                        house.status === 'warning' && "status-warning",
                        house.status === 'offline' && "status-offline"
                      )} />
                      <span className="text-xs text-muted-foreground capitalize">{house.status}</span>
                    </div>
                  </div>
                  {house.alerts.length > 0 && (
                    <div className="p-1.5 rounded-md bg-destructive/20">
                      <AlertTriangle className="w-4 h-4 text-destructive" />
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-2 mb-3">
                  <div className="p-2 rounded-md bg-secondary/50">
                    <p className="text-[10px] text-muted-foreground">Voltage</p>
                    <p className="font-mono text-xs font-medium">{house.voltage.toFixed(0)}V</p>
                  </div>
                  <div className="p-2 rounded-md bg-secondary/50">
                    <p className="text-[10px] text-muted-foreground">Current</p>
                    <p className="font-mono text-xs font-medium">{house.current.toFixed(1)}A</p>
                  </div>
                  <div className="p-2 rounded-md bg-secondary/50">
                    <p className="text-[10px] text-muted-foreground">Power</p>
                    <p className="font-mono text-xs font-medium">{house.power.toFixed(0)}W</p>
                  </div>
                </div>

                <p className="text-[10px] text-muted-foreground">
                  Updated {formatDistanceToNow(new Date(house.lastUpdate), { addSuffix: true })}
                </p>
              </button>
            ))}
          </div>

          {filteredHouses.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No houses found matching your criteria</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default HousesPage;
