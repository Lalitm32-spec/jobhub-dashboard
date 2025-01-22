import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { LineChart, Line, ResponsiveContainer } from 'recharts';

interface MetricsCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  sparklineData?: { value: number }[];
  gradient?: boolean;
}

const sampleSparklineData = Array.from({ length: 10 }, () => ({
  value: Math.floor(Math.random() * 100),
}));

export const MetricsCard = ({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  sparklineData = sampleSparklineData,
  gradient = false 
}: MetricsCardProps) => {
  return (
    <Card className={`p-6 animate-fade-in overflow-hidden relative ${
      gradient ? 'bg-gradient-to-br from-indigo-600 to-indigo-900 text-white' : ''
    }`}>
      <div className="flex items-start justify-between">
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            {Icon && (
              <div className={`rounded-lg ${gradient ? 'bg-white/10' : 'bg-primary/10'} p-2`}>
                <Icon className={`h-5 w-5 ${gradient ? 'text-white' : 'text-primary'}`} />
              </div>
            )}
            <p className={`text-sm font-medium ${gradient ? 'text-white/80' : 'text-gray-600'}`}>
              {title}
            </p>
          </div>
          <h3 className={`text-2xl font-bold ${gradient ? 'text-white' : 'text-gray-900'}`}>
            {value}
          </h3>
          {trend && (
            <p className={`text-sm flex items-center space-x-1 ${
              trend.isPositive ? 
                (gradient ? 'text-white/90' : 'text-green-600') : 
                (gradient ? 'text-white/90' : 'text-red-600')
            }`}>
              {trend.isPositive ? "↑" : "↓"} {trend.value}
            </p>
          )}
        </div>
        <div className="h-16 w-24">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={sparklineData}>
              <Line
                type="monotone"
                dataKey="value"
                stroke={gradient ? "#fff" : "#4F46E5"}
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Card>
  );
};