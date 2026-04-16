import React from 'react';

export const Logo = ({ size = "w-8 h-8" }) => {
  return (
    <div className={`relative ${size}`}>
      {/* Outer Shield */}
      <svg 
        viewBox="0 0 100 120" 
        className="w-full h-full drop-shadow-lg"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Shield Background */}
        <defs>
          <linearGradient id="shieldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00D4FF" />
            <stop offset="50%" stopColor="#10FF59" />
            <stop offset="100%" stopColor="#00D4FF" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge> 
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        {/* Main Shield Shape */}
        <path 
          d="M50 10 L85 25 L85 65 Q85 85 50 110 Q15 85 15 65 L15 25 Z"
          fill="url(#shieldGradient)"
          stroke="#0A0E14"
          strokeWidth="2"
          filter="url(#glow)"
        />
        
        {/* Inner Shield */}
        <path 
          d="M50 20 L75 32 L75 62 Q75 78 50 95 Q25 78 25 62 L25 32 Z"
          fill="#0A0E14"
          stroke="#10FF59"
          strokeWidth="1"
        />
        
        {/* PF Letters */}
        <text 
          x="50" 
          y="55" 
          fontFamily="monospace" 
          fontSize="24" 
          fontWeight="bold"
          fill="#10FF59"
          textAnchor="middle"
          className="terminal-text"
        >
          PF
        </text>
        
        {/* Binary Code Decoration */}
        <text 
          x="50" 
          y="75" 
          fontFamily="monospace" 
          fontSize="8" 
          fill="#00D4FF"
          textAnchor="middle"
          opacity="0.7"
        >
          01001110
        </text>
        
        {/* Lock Icon */}
        <path 
          d="M42 82 L42 78 Q42 75 45 75 L55 75 Q58 75 58 78 L58 82 L58 86 Q58 89 55 89 L45 89 Q42 89 42 86 Z"
          fill="none"
          stroke="#FF1744"
          strokeWidth="1.5"
        />
        <circle 
          cx="50" 
          cy="83" 
          r="2" 
          fill="#FF1744"
        />
      </svg>
      
      {/* Animated Pulse Ring */}
      <div className="absolute inset-0 rounded-full border-2 border-emerald-green opacity-30 animate-ping"></div>
    </div>
  );
};
