import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Map, 
  Home, 
  Zap, 
  Bell, 
  Settings,
  Activity
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEnergyStore } from '@/store/energyStore';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/map', icon: Map, label: 'City Map' },
  { to: '/houses', icon: Home, label: 'Houses' },
  { to: '/grid', icon: Zap, label: 'Grid Lines' },
  { to: '/alerts', icon: Bell, label: 'Alerts' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export const Sidebar = () => {
  const { systemStats, isBackendConnected } = useEnergyStore();
  const unacknowledgedAlerts = systemStats?.activeAlerts || 0;

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-sidebar border-r border-sidebar-border flex flex-col z-50">
      {/* Logo */}
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center glow-green-sm">
            <Zap className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="font-semibold text-foreground">EnergyGrid</h1>
            <p className="text-xs text-muted-foreground">Smart Monitoring</p>
          </div>
        </div>
      </div>

      {/* Connection Status */}
      <div className="px-4 py-3 mx-4 mt-4 rounded-lg bg-secondary/50">
        <div className="flex items-center gap-2">
          <div className={cn(
            "w-2 h-2 rounded-full",
            isBackendConnected ? "bg-energy-green animate-pulse" : "bg-energy-yellow"
          )} />
          <span className="text-xs text-muted-foreground">
            {isBackendConnected ? 'Backend Connected' : 'Using Mock Data'}
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                "sidebar-item",
                isActive && "sidebar-item-active bg-primary/10"
              )
            }
          >
            <Icon className="w-5 h-5" />
            <span className="flex-1">{label}</span>
            {label === 'Alerts' && unacknowledgedAlerts > 0 && (
              <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-destructive text-destructive-foreground">
                {unacknowledgedAlerts}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* System Status */}
      <div className="p-4 border-t border-sidebar-border">
        <div className="p-3 rounded-lg bg-secondary/30">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-4 h-4 text-primary" />
            <span className="text-xs font-medium text-foreground">System Status</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-muted-foreground">Houses</span>
              <p className="font-mono text-foreground">
                {systemStats?.onlineHouses || 0}/{systemStats?.totalHouses || 0}
              </p>
            </div>
            <div>
              <span className="text-muted-foreground">Efficiency</span>
              <p className="font-mono text-primary">
                {systemStats?.gridEfficiency?.toFixed(1) || '0'}%
              </p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
