import React from 'react';

interface MetricCardProps {
  label: string;
  value: string | number;
  subValue?: string;
  trend?: 'up' | 'down' | 'neutral';
  color?: string; // override text color
}

const MetricCard: React.FC<MetricCardProps> = ({ label, value, subValue, trend, color }) => {
  let valueColor = 'text-terminal-text';
  if (trend === 'up') valueColor = 'text-terminal-green';
  if (trend === 'down') valueColor = 'text-terminal-red';
  if (color) valueColor = color;

  return (
    <div className="bg-terminal-card border border-terminal-border p-4 rounded-lg flex flex-col justify-between hover:border-terminal-muted/50 transition-colors">
      <div className="text-xs text-terminal-muted font-medium uppercase tracking-wider mb-2">
        {label}
      </div>
      <div className="flex items-end justify-between">
        <div className={`text-2xl font-mono font-bold ${valueColor}`}>
          {value}
        </div>
        {subValue && (
          <div className="text-xs text-terminal-muted font-mono mb-1">
            {subValue}
          </div>
        )}
      </div>
    </div>
  );
};

export default MetricCard;