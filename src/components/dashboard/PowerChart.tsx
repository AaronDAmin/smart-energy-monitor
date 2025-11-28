import { useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { ConsumptionData } from '@/types/energy';
import { format } from 'date-fns';

interface PowerChartProps {
  data: ConsumptionData[];
  title?: string;
}

export const PowerChart = ({ data, title = "Power Consumption" }: PowerChartProps) => {
  const chartData = useMemo(() => {
    return data.map(item => ({
      time: format(new Date(item.timestamp), 'HH:mm'),
      power: Math.round(item.power / 1000),
      voltage: item.voltage,
    }));
  }, [data]);

  return (
    <div className="card-gradient rounded-xl border border-border p-5">
      <h3 className="text-lg font-semibold text-foreground mb-4">{title}</h3>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="powerGradient" x1="0" y1="0" x2="0" y2="1">
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
              axisLine={false}
            />
            <YAxis 
              stroke="hsl(220, 10%, 55%)"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value}kW`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(220, 18%, 12%)',
                border: '1px solid hsl(220, 15%, 20%)',
                borderRadius: '8px',
                color: 'hsl(0, 0%, 95%)',
              }}
              labelStyle={{ color: 'hsl(220, 10%, 55%)' }}
              formatter={(value: number) => [`${value} kW`, 'Power']}
            />
            <Area
              type="monotone"
              dataKey="power"
              stroke="hsl(152, 90%, 36%)"
              strokeWidth={2}
              fill="url(#powerGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
