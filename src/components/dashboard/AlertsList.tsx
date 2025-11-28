import { Alert } from '@/types/energy';
import { cn } from '@/lib/utils';
import { AlertTriangle, Zap, Power, Wifi, WifiOff } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import { useEnergyStore } from '@/store/energyStore';

interface AlertsListProps {
  alerts: Alert[];
  maxItems?: number;
  showActions?: boolean;
}

const alertIcons = {
  voltage: Zap,
  current: Zap,
  power: Power,
  fault: AlertTriangle,
  offline: WifiOff,
};

const severityStyles = {
  low: 'border-l-muted-foreground bg-muted/30',
  medium: 'border-l-warning bg-warning/10',
  high: 'border-l-destructive bg-destructive/10',
  critical: 'border-l-destructive bg-destructive/20 animate-pulse',
};

export const AlertsList = ({ alerts, maxItems, showActions = true }: AlertsListProps) => {
  const { acknowledgeAlert } = useEnergyStore();
  const displayAlerts = maxItems ? alerts.slice(0, maxItems) : alerts;

  if (displayAlerts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
        <Wifi className="w-12 h-12 mb-2 opacity-30" />
        <p className="text-sm">No active alerts</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {displayAlerts.map((alert) => {
        const Icon = alertIcons[alert.type] || AlertTriangle;
        
        return (
          <div
            key={alert.id}
            className={cn(
              "p-4 rounded-lg border-l-4 transition-all duration-200",
              severityStyles[alert.severity],
              alert.acknowledged && "opacity-60"
            )}
          >
            <div className="flex items-start gap-3">
              <div className={cn(
                "p-2 rounded-lg",
                alert.severity === 'critical' || alert.severity === 'high'
                  ? "bg-destructive/20 text-destructive"
                  : alert.severity === 'medium'
                  ? "bg-warning/20 text-warning"
                  : "bg-muted text-muted-foreground"
              )}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-sm text-foreground">
                    {alert.houseName}
                  </span>
                  <span className={cn(
                    "px-2 py-0.5 text-xs rounded-full font-medium uppercase",
                    alert.severity === 'critical' && "bg-destructive text-destructive-foreground",
                    alert.severity === 'high' && "bg-destructive/80 text-destructive-foreground",
                    alert.severity === 'medium' && "bg-warning text-warning-foreground",
                    alert.severity === 'low' && "bg-muted text-muted-foreground"
                  )}>
                    {alert.severity}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mb-2">{alert.message}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(alert.timestamp), { addSuffix: true })}
                  </span>
                  {showActions && !alert.acknowledged && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() => acknowledgeAlert(alert.id)}
                    >
                      Acknowledge
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
