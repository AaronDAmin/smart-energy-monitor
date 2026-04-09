import { useState, useMemo, useEffect } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { useEnergyStore } from '@/store/energyStore';
import { AlertsList } from '@/components/dashboard/AlertsList';
import { cn } from '@/lib/utils';
import { Search, Bell, BellOff, CheckCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

type SeverityFilter = 'all' | 'critical' | 'high' | 'medium' | 'low';
type StatusFilter = 'all' | 'active' | 'acknowledged';

const AlertsPage = () => {
  const { alerts, acknowledgeAlert, fetchAllData } = useEnergyStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState<SeverityFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  const filteredAlerts = useMemo(() => {
    return alerts.filter(alert => {
      const matchesSearch = 
        alert.houseName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        alert.message.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSeverity = severityFilter === 'all' || alert.severity === severityFilter;
      const matchesStatus = 
        statusFilter === 'all' ||
        (statusFilter === 'active' && !alert.acknowledged) ||
        (statusFilter === 'acknowledged' && alert.acknowledged);
      return matchesSearch && matchesSeverity && matchesStatus;
    });
  }, [alerts, searchQuery, severityFilter, statusFilter]);

  const severityCounts = {
    all: alerts.length,
    critical: alerts.filter(a => a.severity === 'critical').length,
    high: alerts.filter(a => a.severity === 'high').length,
    medium: alerts.filter(a => a.severity === 'medium').length,
    low: alerts.filter(a => a.severity === 'low').length,
  };

  const unacknowledgedCount = alerts.filter(a => !a.acknowledged).length;

  const acknowledgeAll = async () => {
    const unacknowledged = alerts.filter(a => !a.acknowledged);
    for (const alert of unacknowledged) {
      await acknowledgeAlert(alert.id);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="lg:ml-64 pt-14 lg:pt-0 min-h-screen">
        <div className="p-4 sm:p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Alerts Center</h1>
              <p className="text-sm text-muted-foreground">
                {unacknowledgedCount} unacknowledged alerts
              </p>
            </div>
            {unacknowledgedCount > 0 && (
              <Button variant="outline" onClick={acknowledgeAll}>
                <CheckCircle className="w-4 h-4 mr-2" />
                Acknowledge All
              </Button>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {(['all', 'critical', 'high', 'medium', 'low'] as SeverityFilter[]).map((severity) => (
              <button
                key={severity}
                onClick={() => setSeverityFilter(severity)}
                className={cn(
                  "p-4 rounded-xl border transition-all duration-200",
                  severityFilter === severity
                    ? "border-primary bg-primary/10"
                    : "border-border bg-card hover:border-primary/50",
                )}
              >
                <p className="text-xs text-muted-foreground uppercase mb-1">
                  {severity}
                </p>
                <p className={cn(
                  "text-2xl font-bold font-mono",
                  severity === 'critical' && "text-destructive",
                  severity === 'high' && "text-destructive/80",
                  severity === 'medium' && "text-warning",
                  severity === 'low' && "text-muted-foreground",
                  severity === 'all' && "text-foreground"
                )}>
                  {severityCounts[severity]}
                </p>
              </button>
            ))}
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search alerts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-secondary border-border"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={statusFilter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('all')}
              >
                All
              </Button>
              <Button
                variant={statusFilter === 'active' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('active')}
                className={statusFilter === 'active' ? "bg-destructive hover:bg-destructive/90" : ""}
              >
                <Bell className="w-4 h-4 mr-1" />
                Active
              </Button>
              <Button
                variant={statusFilter === 'acknowledged' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('acknowledged')}
              >
                <BellOff className="w-4 h-4 mr-1" />
                Acknowledged
              </Button>
            </div>
          </div>

          {/* Alerts List */}
          <div className="bg-card rounded-xl border border-border p-5">
            <AlertsList alerts={filteredAlerts} showActions={true} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default AlertsPage;
