import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Sidebar } from '@/components/layout/Sidebar';
import { useEnergyStore } from '@/store/energyStore';
import { StatCard } from '@/components/dashboard/StatCard';
import { AlertsList } from '@/components/dashboard/AlertsList';
import { cn } from '@/lib/utils';
import { 
  ArrowLeft, 
  Zap, 
  Activity, 
  Gauge, 
  Clock,
  MapPin,
  Power
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import { format } from 'date-fns';

const HouseDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { houses, consumptionData, fetchAllData } = useEnergyStore();
  
  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  const house = houses.find(h => h.id === Number(id));

  // Generate mock historical data for this house
  const houseConsumptionData = consumptionData.map(item => ({
    time: format(new Date(item.timestamp), 'HH:mm'),
    power: (item.power / 100) * (0.8 + Math.random() * 0.4),
    voltage: item.voltage + (Math.random() - 0.5) * 5,
  }));

  if (!house) {
    return (
      <div className="min-h-screen bg-background">
        <Sidebar />
        <main className="ml-64 min-h-screen flex items-center justify-center">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">House not found</p>
            <Button onClick={() => navigate('/houses')}>Back to Houses</Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="ml-64 min-h-screen">
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/houses')}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-foreground">{house.name}</h1>
                <div className={cn(
                  "status-indicator",
                  house.status === 'online' && "status-online",
                  house.status === 'warning' && "status-warning",
                  house.status === 'offline' && "status-offline"
                )} />
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                <MapPin className="w-3 h-3" />
                <span>{house.latitude.toFixed(4)}, {house.longitude.toFixed(4)}</span>
              </div>
            </div>
            <div className={cn(
              "px-4 py-2 rounded-lg font-medium text-sm",
              house.status === 'online' && "bg-energy-green/20 text-energy-green",
              house.status === 'warning' && "bg-energy-yellow/20 text-energy-yellow",
              house.status === 'offline' && "bg-energy-red/20 text-energy-red"
            )}>
              {house.status.toUpperCase()}
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Voltage"
              value={house.voltage.toFixed(1)}
              unit="V"
              icon={<Zap className="w-5 h-5" />}
              variant={house.voltage < 200 || house.voltage > 250 ? 'warning' : 'default'}
            />
            <StatCard
              title="Current"
              value={house.current.toFixed(2)}
              unit="A"
              icon={<Activity className="w-5 h-5" />}
              variant="default"
            />
            <StatCard
              title="Power"
              value={house.power.toFixed(0)}
              unit="W"
              icon={<Power className="w-5 h-5" />}
              variant="primary"
            />
            <StatCard
              title="Power Factor"
              value={(house.power / (house.voltage * house.current)).toFixed(2)}
              icon={<Gauge className="w-5 h-5" />}
              variant="default"
            />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Power Consumption Chart */}
            <div className="bg-card rounded-xl border border-border p-5">
              <h3 className="text-lg font-semibold text-foreground mb-4">Power Consumption (24h)</h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={houseConsumptionData}>
                    <defs>
                      <linearGradient id="housePowerGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(152, 90%, 36%)" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="hsl(152, 90%, 36%)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 20%)" />
                    <XAxis 
                      dataKey="time" 
                      stroke="hsl(220, 10%, 55%)"
                      fontSize={12}
                      tickLine={false}
                    />
                    <YAxis 
                      stroke="hsl(220, 10%, 55%)"
                      fontSize={12}
                      tickLine={false}
                      tickFormatter={(value) => `${value.toFixed(0)}W`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(220, 18%, 12%)',
                        border: '1px solid hsl(220, 15%, 20%)',
                        borderRadius: '8px',
                      }}
                      formatter={(value: number) => [`${value.toFixed(0)} W`, 'Power']}
                    />
                    <Area
                      type="monotone"
                      dataKey="power"
                      stroke="hsl(152, 90%, 36%)"
                      strokeWidth={2}
                      fill="url(#housePowerGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Voltage Chart */}
            <div className="bg-card rounded-xl border border-border p-5">
              <h3 className="text-lg font-semibold text-foreground mb-4">Voltage Stability (24h)</h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={houseConsumptionData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 20%)" />
                    <XAxis 
                      dataKey="time" 
                      stroke="hsl(220, 10%, 55%)"
                      fontSize={12}
                      tickLine={false}
                    />
                    <YAxis 
                      stroke="hsl(220, 10%, 55%)"
                      fontSize={12}
                      tickLine={false}
                      domain={[200, 250]}
                      tickFormatter={(value) => `${value}V`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(220, 18%, 12%)',
                        border: '1px solid hsl(220, 15%, 20%)',
                        borderRadius: '8px',
                      }}
                      formatter={(value: number) => [`${value.toFixed(1)} V`, 'Voltage']}
                    />
                    <Line
                      type="monotone"
                      dataKey="voltage"
                      stroke="hsl(210, 100%, 50%)"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Alerts and Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Alerts for this house */}
            <div className="bg-card rounded-xl border border-border p-5">
              <h3 className="text-lg font-semibold text-foreground mb-4">
                Alerts & Notifications
              </h3>
              {house.alerts.length > 0 ? (
                <AlertsList alerts={house.alerts} />
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No active alerts for this house</p>
                </div>
              )}
            </div>

            {/* Historical Logs */}
            <div className="bg-card rounded-xl border border-border p-5">
              <h3 className="text-lg font-semibold text-foreground mb-4">Recent Activity</h3>
              <div className="space-y-3">
                {[
                  { time: '2 min ago', event: 'Power reading updated', value: `${house.power.toFixed(0)}W` },
                  { time: '5 min ago', event: 'Voltage reading updated', value: `${house.voltage.toFixed(1)}V` },
                  { time: '1 hour ago', event: 'System health check', value: 'Passed' },
                  { time: '3 hours ago', event: 'Peak power recorded', value: `${(house.power * 1.2).toFixed(0)}W` },
                ].map((log, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between py-3 border-b border-border last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-foreground">{log.event}</p>
                        <p className="text-xs text-muted-foreground">{log.time}</p>
                      </div>
                    </div>
                    <span className="font-mono text-sm text-primary">{log.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default HouseDetailsPage;
