import React from 'react';

export default function GlowWave({ height = 40, className = "" }) {
  return (
    <div className={`relative w-full overflow-hidden ${className}`} style={{ height: `${height}px` }}>
      <svg
        viewBox="0 0 500 60"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full preserve-3d"
      >
        <defs>
          <linearGradient id="neonWaveGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.2" />
            <stop offset="35%" stopColor="#3b82f6" stopOpacity="0.8" />
            <stop offset="65%" stopColor="#06b6d4" stopOpacity="1" />
            <stop offset="85%" stopColor="#6366f1" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.1" />
          </linearGradient>
          <filter id="neonGlowFilter" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Ambient background blur line */}
        <path
          d="M0,35 Q40,15 90,38 T180,25 T270,42 T360,18 T450,30 T500,28"
          stroke="url(#neonWaveGrad)"
          strokeWidth="3.5"
          filter="url(#neonGlowFilter)"
          strokeLinecap="round"
        />

        {/* Sharp foreground line */}
        <path
          d="M0,35 Q40,15 90,38 T180,25 T270,42 T360,18 T450,30 T500,28"
          stroke="url(#neonWaveGrad)"
          strokeWidth="2"
          strokeLinecap="round"
        />

        {/* Node dots along the wave */}
        <circle cx="90" cy="38" r="3" fill="#38bdf8" filter="url(#neonGlowFilter)" />
        <circle cx="180" cy="25" r="3.5" fill="#67e8f9" filter="url(#neonGlowFilter)" />
        <circle cx="270" cy="42" r="3" fill="#818cf8" filter="url(#neonGlowFilter)" />
        <circle cx="360" cy="18" r="4" fill="#38bdf8" filter="url(#neonGlowFilter)" />
        <circle cx="450" cy="30" r="3" fill="#67e8f9" filter="url(#neonGlowFilter)" />
      </svg>
    </div>
  );
}
