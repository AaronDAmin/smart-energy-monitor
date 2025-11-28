import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon: ReactNode;
  trend?: number;
  variant?: 'default' | 'primary' | 'warning' | 'danger';
  className?: string;
}

export const StatCard = ({
  title,
  value,
  unit,
  icon,
  trend,
  variant = 'default',
  className,
}: StatCardProps) => {
  const variantStyles = {
    default: 'border-border',
    primary: 'border-primary/30 glow-green-sm',
    warning: 'border-warning/30',
    danger: 'border-destructive/30',
  };

  return (
    <div
      className={cn(
        "card-gradient rounded-xl border p-5 transition-all duration-300 hover:scale-[1.02]",
        variantStyles[variant],
        className
      )}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={cn(
          "p-2.5 rounded-lg",
          variant === 'primary' && "bg-primary/20 text-primary",
          variant === 'warning' && "bg-warning/20 text-warning",
          variant === 'danger' && "bg-destructive/20 text-destructive",
          variant === 'default' && "bg-secondary text-muted-foreground"
        )}>
          {icon}
        </div>
        {trend !== undefined && (
          <div className={cn(
            "flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full",
            trend >= 0 ? "bg-primary/20 text-primary" : "bg-destructive/20 text-destructive"
          )}>
            {trend >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <div className="space-y-1">
        <p className="metric-label">{title}</p>
        <div className="flex items-baseline gap-1">
          <span className="metric-value text-foreground">{value}</span>
          {unit && <span className="text-sm text-muted-foreground">{unit}</span>}
        </div>
      </div>
    </div>
  );
};
