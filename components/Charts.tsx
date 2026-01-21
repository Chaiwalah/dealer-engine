
import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Cell, ComposedChart, Line, ReferenceLine } from 'recharts';
import { ChartDataPoint } from '../types';

interface ChartProps {
  data: ChartDataPoint[];
  type?: 'cvd' | 'oi';
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-terminal-card border border-terminal-border p-2 rounded shadow-xl text-xs">
        <p className="text-terminal-muted mb-1">{label}</p>
        {payload.map((entry: any, idx: number) => (
           <p key={idx} className="font-mono flex items-center gap-2" style={{color: entry.color}}>
              <span className="capitalize">{entry.name}:</span>
              <span>
                {entry.name === 'funding' 
                  ? `${entry.value.toFixed(4)}%`
                  : new Intl.NumberFormat('en-US', { notation: "compact", compactDisplay: "short" }).format(entry.value)}
              </span>
           </p>
        ))}
      </div>
    );
  }
  return null;
};

export const MainChart: React.FC<ChartProps> = ({ data, type = 'cvd' }) => {
  const isCVD = type === 'cvd';
  const color = isCVD ? '#F0B90B' : '#3B82F6';
  const dataKey = isCVD ? 'cvd' : 'oi';
  const showPrice = !isCVD; // Show price overlay for OI to see divergence

  return (
    <div className="w-full h-full min-h-[250px]">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data}>
          <defs>
            <linearGradient id={`color${type}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
              <stop offset="95%" stopColor={color} stopOpacity={0}/>
            </linearGradient>
          </defs>
          <XAxis 
            dataKey="time" 
            stroke="#474D57" 
            tick={{fontSize: 10, fill: '#848E9C'}} 
            tickLine={false}
            minTickGap={30}
          />
          <YAxis 
            yAxisId="left"
            stroke="#474D57" 
            tick={{fontSize: 10, fill: '#848E9C'}} 
            tickLine={false}
            tickFormatter={(value) => 
              new Intl.NumberFormat('en-US', { notation: "compact", compactDisplay: "short" }).format(value)
            }
            domain={['auto', 'auto']}
          />
          {showPrice && (
            <YAxis 
               yAxisId="right"
               orientation="right"
               stroke="#848E9C"
               tick={{fontSize: 10, fill: '#848E9C'}}
               tickLine={false}
               domain={['auto', 'auto']}
               hide={false}
               width={40}
            />
          )}
          
          <Tooltip content={<CustomTooltip />} />
          
          <Area 
            yAxisId="left"
            type="monotone" 
            dataKey={dataKey} 
            stroke={color} 
            strokeWidth={2}
            fillOpacity={1} 
            fill={`url(#color${type})`} 
            animationDuration={500}
            name={type}
          />

          {showPrice && (
            <Line 
               yAxisId="right"
               type="monotone"
               dataKey="price"
               stroke="#EAECEF"
               strokeWidth={1}
               dot={false}
               alpha={0.5}
               name="Price"
            />
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

export const DeltaBarChart: React.FC<{data: ChartDataPoint[]}> = ({ data }) => {
  return (
    <div className="w-full h-full min-h-[150px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
           <XAxis 
            dataKey="time" 
            hide
          />
          <Tooltip content={<CustomTooltip />} cursor={{fill: '#2A2F37'}} />
          <Bar dataKey="cvd" radius={[2, 2, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={(entry.cvd || 0) > 0 ? '#0ECB81' : '#F6465D'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export const FundingRateChart: React.FC<{data: ChartDataPoint[]}> = ({ data }) => {
  return (
    <div className="w-full h-full min-h-[120px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
           <XAxis dataKey="time" hide />
           <Tooltip content={<CustomTooltip />} cursor={{fill: '#2A2F37'}} />
           <Bar dataKey="funding" name="funding" radius={[2, 2, 0, 0]}>
             {data.map((entry, index) => (
               <Cell key={`cell-${index}`} fill={(entry.funding || 0) > 0 ? '#F0B90B' : '#F6465D'} />
             ))}
           </Bar>
           <ReferenceLine y={0} stroke="#474D57" strokeDasharray="3 3" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
