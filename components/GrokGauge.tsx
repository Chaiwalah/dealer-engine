
import React from 'react';

interface GrokGaugeProps {
  score: number;
}

const GrokGauge: React.FC<GrokGaugeProps> = ({ score }) => {
  // Normalize score 0-100 to angle -90 to 90
  const angle = (score / 100) * 180 - 90;
  
  // REI Colors
  let color = '#F0B90B'; // Neutral/Yellow
  if (score >= 70) color = '#0ECB81'; // Momentum Bull (Green)
  else if (score < 40) color = '#F6465D'; // Decay/Bear (Red)

  return (
    <div className="relative w-full h-32 flex flex-col items-center justify-center">
      <svg viewBox="0 0 200 120" className="w-48 h-28">
        {/* Background Arc */}
        <path
          d="M 20 100 A 80 80 0 0 1 180 100"
          fill="none"
          stroke="#2A2F37"
          strokeWidth="20"
          strokeLinecap="round"
        />
        
        {/* Value Arc */}
        <path
          d="M 20 100 A 80 80 0 0 1 180 100"
          fill="none"
          stroke={color}
          strokeWidth="20"
          strokeLinecap="round"
          strokeDasharray="251.2"
          strokeDashoffset={251.2 - (251.2 * score / 100)} 
          className="transition-all duration-1000 ease-out"
        />

        {/* Needle */}
        <g transform={`rotate(${angle} 100 100)`} className="transition-transform duration-700 ease-out origin-[100px_100px]">
          <path d="M 95 100 L 100 20 L 105 100 Z" fill="#EAECEF" />
          <circle cx="100" cy="100" r="8" fill="#EAECEF" />
        </g>

        {/* Zone Markers (Optional visuals for 40 and 70) */}
        <line x1="68" y1="36" x2="72" y2="40" stroke="#000" strokeWidth="1" /> {/* ~40 mark approx */}
      </svg>
      
      <div className="absolute bottom-0 text-center">
        <div className="text-3xl font-bold font-mono" style={{ color }}>{score.toFixed(1)}</div>
        <div className="text-[10px] text-terminal-muted uppercase tracking-wider">REI SCORE</div>
      </div>
    </div>
  );
};

export default GrokGauge;
