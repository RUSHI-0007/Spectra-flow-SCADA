// ============================================================================
// Industrial Bottle Vector Graphic Component
// Realistic 2D SCADA representation for Clear (500ml) & Amber (1000ml) bottles
// Includes contoured glass shoulders, screw cap ridges, liquid meniscus,
// realistic printed label, and distinct defect representations (missing cap,
// underfilled, deformed shape, jam alert).
// ============================================================================

import React from 'react';
import { Bottle } from '../../types/scada';
import { AlertCircle, AlertTriangle } from 'lucide-react';

interface BottleGraphicProps {
  bottle: Bottle;
  className?: string;
}

export const BottleGraphic: React.FC<BottleGraphicProps> = ({ bottle, className = '' }) => {
  const isCatA = bottle.category === 'CATEGORY_A';
  const isDeformed = bottle.defect === 'DEFORMED';
  const isMissingCap = !bottle.hasCap || bottle.defect === 'MISSING_CAP';
  const isUnderfilled = bottle.defect === 'UNDERFILLED' || bottle.fillLevelPercent < 70;
  const isDefect = bottle.defect !== 'NONE';

  // Sizing: Category B (1000ml) is wider and taller than Category A (500ml)
  const width = isCatA ? 30 : 34;
  const height = isCatA ? 58 : 64;

  // Fill percentage normalized
  const fillPct = Math.max(10, Math.min(100, bottle.fillLevelPercent));
  
  // Calculate liquid Y in viewBox coordinates (total body height ~44 units, base at Y=66)
  // Fill height from bottom Y=66 up to Y=24 (nominal 92% is at Y=27, 40% underfilled is at Y=49)
  const liquidTopY = 66 - ((fillPct / 100) * 40);

  // Unique ID for SVG gradient/clipPath isolation
  const clipId = `bottle-clip-${bottle.id}`;
  const glassGradId = `glass-grad-${bottle.id}`;
  const liquidGradId = `liquid-grad-${bottle.id}`;

  return (
    <div className={`relative flex flex-col items-center select-none ${className}`}>
      {/* 1. Status Overlays: JAMMED or DEFECT Badge */}
      {bottle.isJammed && (
        <div className="absolute -top-6 z-30 bg-[#C62828] text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-sm flex items-center gap-0.5 animate-pulse whitespace-nowrap">
          <AlertTriangle className="w-2.5 h-2.5" />
          <span>JAMMED</span>
        </div>
      )}

      {isDefect && !bottle.isJammed && (
        <div className="absolute -top-5 z-30 bg-[#C62828] text-white text-[8px] font-bold px-1 py-0.2 rounded shadow-xs flex items-center gap-0.5 whitespace-nowrap">
          <AlertCircle className="w-2 h-2" />
          <span>
            {bottle.defect === 'MISSING_CAP' ? 'NO CAP' :
             bottle.defect === 'UNDERFILLED' ? 'LOW FILL' :
             bottle.defect === 'DEFORMED' ? 'DENTED' : 'DEFECT'}
          </span>
        </div>
      )}

      {/* 2. SVG Bottle Graphic */}
      <svg
        width={width}
        height={height}
        viewBox="0 0 36 72"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="filter drop-shadow-xs overflow-visible"
      >
        <defs>
          {/* Glass Gradient */}
          <linearGradient id={glassGradId} x1="0%" y1="0%" x2="100%" y2="0%">
            {isCatA ? (
              // Category A: Flint Clear Glass (crisp neutral/olive tint with glass highlights)
              <>
                <stop offset="0%" stopColor="#DFE5DC" stopOpacity="0.8" />
                <stop offset="25%" stopColor="#FFFFFF" stopOpacity="0.95" />
                <stop offset="65%" stopColor="#F2F5F0" stopOpacity="0.75" />
                <stop offset="100%" stopColor="#CBD5C7" stopOpacity="0.85" />
              </>
            ) : (
              // Category B: Amber Glass (rich warm golden-amber)
              <>
                <stop offset="0%" stopColor="#8F5110" stopOpacity="0.9" />
                <stop offset="22%" stopColor="#F5A738" stopOpacity="0.95" />
                <stop offset="60%" stopColor="#B7791F" stopOpacity="0.85" />
                <stop offset="100%" stopColor="#78420A" stopOpacity="0.95" />
              </>
            )}
          </linearGradient>

          {/* Liquid Gradient */}
          <linearGradient id={liquidGradId} x1="0%" y1="0%" x2="100%" y2="0%">
            {isCatA ? (
              <>
                <stop offset="0%" stopColor="#D5DFD1" />
                <stop offset="35%" stopColor="#EAF0E7" />
                <stop offset="100%" stopColor="#C4D1C0" />
              </>
            ) : (
              <>
                <stop offset="0%" stopColor="#6E3A04" />
                <stop offset="30%" stopColor="#C97F19" />
                <stop offset="100%" stopColor="#5C3003" />
              </>
            )}
          </linearGradient>

          {/* Bottle Interior Clip Path (Inside of glass walls) */}
          <clipPath id={clipId}>
            {isDeformed ? (
              // Deformed silhouette: dented right shoulder & waist
              <path d="
                M 14 12
                L 22 12
                L 22 22
                C 22 25, 27 27, 26 33
                C 25 38, 28 44, 27 50
                L 28 65
                Q 28 67, 25 67
                L 11 67
                Q 8 67, 8 65
                L 8 32
                C 8 26, 14 24, 14 22
                Z
              " />
            ) : isCatA ? (
              // Category A: 500ml Slender Silhouette
              <path d="
                M 14.5 12
                L 21.5 12
                L 21.5 22
                C 21.5 26, 28 27.5, 28 33
                L 28 65.5
                Q 28 67.5, 25.5 67.5
                L 10.5 67.5
                Q 8 67.5, 8 65.5
                L 8 33
                C 8 27.5, 14.5 26, 14.5 22
                Z
              " />
            ) : (
              // Category B: 1000ml Broader Silhouette
              <path d="
                M 14 11
                L 22 11
                L 22 21
                C 22 25, 30 26.5, 30 32
                L 30 66
                Q 30 68, 27 68
                L 9 68
                Q 6 68, 6 66
                L 6 32
                C 6 26.5, 14 25, 14 21
                Z
              " />
            )}
          </clipPath>
        </defs>

        {/* --- SHADOW AT BASE --- */}
        <ellipse cx="18" cy="69" rx={isCatA ? "11" : "13"} ry="2" fill="rgba(0,0,0,0.18)" />

        {/* --- MAIN BOTTLE BODY (Glass Backing) --- */}
        <path
          d={
            isDeformed
              ? "M 14 12 L 22 12 L 22 22 C 22 25, 27 27, 26 33 C 25 38, 28 44, 27 50 L 28 65 Q 28 67, 25 67 L 11 67 Q 8 67, 8 65 L 8 32 C 8 26, 14 24, 14 22 Z"
              : isCatA
              ? "M 14.5 12 L 21.5 12 L 21.5 22 C 21.5 26, 28 27.5, 28 33 L 28 65.5 Q 28 67.5, 25.5 67.5 L 10.5 67.5 Q 8 67.5, 8 65.5 L 8 33 C 8 27.5, 14.5 26, 14.5 22 Z"
              : "M 14 11 L 22 11 L 22 21 C 22 25, 30 26.5, 30 32 L 30 66 Q 30 68, 27 68 L 9 68 Q 6 68, 6 66 L 6 32 C 6 26.5, 14 25, 14 21 Z"
          }
          fill={`url(#${glassGradId})`}
          stroke={isCatA ? "#536046" : "#78420A"}
          strokeWidth="1.2"
          strokeLinejoin="round"
        />

        {/* --- LIQUID FILL (Clipped to interior) --- */}
        <g clipPath={`url(#${clipId})`}>
          {/* Liquid Mass */}
          <rect
            x="0"
            y={liquidTopY}
            width="36"
            height={72 - liquidTopY}
            fill={`url(#${liquidGradId})`}
          />
          
          {/* Liquid Top Meniscus (Curved Surface) */}
          <ellipse
            cx="18"
            cy={liquidTopY}
            rx={isCatA ? "10" : "12"}
            ry="1.8"
            fill={isCatA ? "#EDF3EB" : "#E29828"}
            stroke={isCatA ? "#6B7A5A" : "#8A4C07"}
            strokeWidth="0.8"
          />

          {/* Underfilled indicator line when defective */}
          {isUnderfilled && (
            <line
              x1="6"
              y1="28"
              x2="30"
              y2="28"
              stroke="#C62828"
              strokeWidth="0.8"
              strokeDasharray="2 1.5"
            />
          )}
        </g>

        {/* --- GLASS SPECULAR HIGHLIGHTS (Realistic Reflection Streak) --- */}
        <path
          d={
            isCatA
              ? "M 16 14 L 16 22 Q 16 28, 10.5 32 L 10.5 64"
              : "M 15.5 13 L 15.5 21 Q 15.5 27, 8.5 31 L 8.5 65"
          }
          stroke="rgba(255, 255, 255, 0.75)"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d={
            isCatA
              ? "M 25.5 35 L 25.5 63"
              : "M 27.5 34 L 27.5 64"
          }
          stroke="rgba(255, 255, 255, 0.28)"
          strokeWidth="1"
          strokeLinecap="round"
        />

        {/* --- PRINTED BOTTLE LABEL --- */}
        <g>
          {/* Label Card Base */}
          <rect
            x={isCatA ? "10" : "8"}
            y={isCatA ? "36" : "34"}
            width={isCatA ? "16" : "20"}
            height={isCatA ? "18" : "20"}
            rx="1.5"
            fill="#FFFFFF"
            stroke={isCatA ? "#6B7A5A" : "#B7791F"}
            strokeWidth="0.9"
            className="filter drop-shadow-xs"
          />

          {/* Top Brand Stripe */}
          <rect
            x={isCatA ? "10" : "8"}
            y={isCatA ? "36" : "34"}
            width={isCatA ? "16" : "20"}
            height="5"
            rx="1"
            fill={isCatA ? "#6B7A5A" : "#B7791F"}
          />

          {/* Category Badge Text ("A" or "B") */}
          <text
            x="18"
            y={isCatA ? "40" : "38"}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="4"
            fontWeight="900"
            fill="#FFFFFF"
            fontFamily="system-ui, -apple-system, sans-serif"
          >
            {isCatA ? 'A • 500' : 'B • 1000'}
          </text>

          {/* Volume Specification */}
          <text
            x="18"
            y={isCatA ? "46" : "45"}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={isCatA ? "4.5" : "5"}
            fontWeight="800"
            fill="#1F2933"
            fontFamily="system-ui, -apple-system, sans-serif"
          >
            {isCatA ? '500ml' : '1.0L'}
          </text>

          {/* Subtext: Glass type */}
          <text
            x="18"
            y={isCatA ? "50.5" : "50"}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="2.5"
            fontWeight="600"
            fill="#52606D"
            fontFamily="system-ui, -apple-system, sans-serif"
          >
            {isCatA ? 'CLEAR PET' : 'AMBER GL'}
          </text>

          {/* Technical Micro Barcode Lines */}
          <line x1={isCatA ? "12" : "10"} y1={isCatA ? "52.5" : "52"} x2={isCatA ? "13" : "11"} y2={isCatA ? "52.5" : "52"} stroke="#52606D" strokeWidth="0.8" />
          <line x1={isCatA ? "14.5" : "12.5"} y1={isCatA ? "52.5" : "52"} x2={isCatA ? "17" : "16"} y2={isCatA ? "52.5" : "52"} stroke="#52606D" strokeWidth="0.8" />
          <line x1={isCatA ? "18.5" : "18"} y1={isCatA ? "52.5" : "52"} x2={isCatA ? "20" : "20"} y2={isCatA ? "52.5" : "52"} stroke="#52606D" strokeWidth="0.8" />
          <line x1={isCatA ? "21.5" : "22"} y1={isCatA ? "52.5" : "52"} x2={isCatA ? "24" : "25"} y2={isCatA ? "52.5" : "52"} stroke="#52606D" strokeWidth="0.8" />
        </g>

        {/* --- SCREW CAP OR MISSING CAP APERTURE --- */}
        {isMissingCap ? (
          // DEFECT: Open bottle mouth with threaded lip and red warning halo
          <g>
            {/* Open aperture rim */}
            <ellipse cx="18" cy="12" rx="4.5" ry="1.5" fill="#3B4651" stroke="#C62828" strokeWidth="1.2" />
            <ellipse cx="18" cy="12" rx="2.5" ry="0.8" fill="#1F2933" />
            {/* Thread ridges on glass neck */}
            <line x1="13.5" y1="15" x2="22.5" y2="15" stroke="#9AA5B1" strokeWidth="0.8" />
            <line x1="13.5" y1="18" x2="22.5" y2="18" stroke="#9AA5B1" strokeWidth="0.8" />
            {/* Warning indicator ring */}
            <ellipse cx="18" cy="12" rx="6" ry="2.5" fill="none" stroke="#C62828" strokeWidth="1" strokeDasharray="2 1.5" className="animate-pulse" />
          </g>
        ) : (
          // NOMINAL: Industrial Screw Cap with Gripping Ribs
          <g>
            {/* Cap Base / Tamper Evident Ring */}
            <rect
              x="13.5"
              y="11"
              width="9"
              height="2"
              rx="0.5"
              fill={isCatA ? "#4A563E" : "#78420A"}
              stroke={isCatA ? "#3D4733" : "#5A3107"}
              strokeWidth="0.6"
            />
            {/* Main Cap Body */}
            <rect
              x="13"
              y="4.5"
              width="10"
              height="7"
              rx="1.2"
              fill={isCatA ? "#6B7A5A" : "#B7791F"}
              stroke={isCatA ? "#536046" : "#8A5812"}
              strokeWidth="0.8"
            />
            {/* Cap Vertical Grip Ridges */}
            <line x1="15" y1="5.5" x2="15" y2="10.5" stroke="rgba(255,255,255,0.4)" strokeWidth="0.7" />
            <line x1="17" y1="5.5" x2="17" y2="10.5" stroke="rgba(255,255,255,0.4)" strokeWidth="0.7" />
            <line x1="19" y1="5.5" x2="19" y2="10.5" stroke="rgba(255,255,255,0.4)" strokeWidth="0.7" />
            <line x1="21" y1="5.5" x2="21" y2="10.5" stroke="rgba(255,255,255,0.4)" strokeWidth="0.7" />
            {/* Cap Top Highlight */}
            <line x1="14" y1="5.2" x2="22" y2="5.2" stroke="rgba(255,255,255,0.6)" strokeWidth="0.7" strokeLinecap="round" />
          </g>
        )}

        {/* --- DEFORMED DENT CALLOUT MARKER --- */}
        {isDeformed && (
          <path
            d="M 28 42 L 34 38"
            stroke="#C62828"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
        )}
      </svg>
    </div>
  );
};
