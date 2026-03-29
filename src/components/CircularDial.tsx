import { useState } from 'react';

const DIAL_VALUES = [0, 33, 67, 100];
const RADIUS = 38;
const CENTER = 50;
const DOT_RADIUS = 6;

// Positions at 12, 3, 6, 9 o'clock for 0%, 33%, 67%, 100%
const POSITIONS = [
  { angle: -90, label: '0%' },   // top
  { angle: 0, label: '33%' },    // right
  { angle: 90, label: '67%' },   // bottom
  { angle: 180, label: '100%' }, // left
];

function getXY(angleDeg: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: CENTER + RADIUS * Math.cos(rad), y: CENTER + RADIUS * Math.sin(rad) };
}

interface CircularDialProps {
  label: string;
  value: number;
  onChange: (v: number) => void;
  accentColor?: string;
}

export default function CircularDial({ label, value, onChange, accentColor = 'hsl(var(--primary))' }: CircularDialProps) {
  const [hovered, setHovered] = useState<number | null>(null);
  const activeIndex = DIAL_VALUES.indexOf(value);

  // Draw arc from first selected point to active point
  const getArcPath = () => {
    if (activeIndex <= 0) return '';
    const startAngle = -90;
    const endAngle = POSITIONS[activeIndex].angle;
    const sweep = endAngle - startAngle;
    const largeArc = sweep > 180 ? 1 : 0;
    const start = getXY(startAngle);
    const end = getXY(endAngle);
    return `M ${start.x} ${start.y} A ${RADIUS} ${RADIUS} 0 ${largeArc} 1 ${end.x} ${end.y}`;
  };

  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-xs text-muted-foreground">{label}</span>
      <div className="relative w-[100px] h-[100px]">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          {/* Track circle */}
          <circle cx={CENTER} cy={CENTER} r={RADIUS} fill="none" stroke="hsl(var(--muted))" strokeWidth="2.5" />
          
          {/* Active arc */}
          {activeIndex > 0 && (
            <path d={getArcPath()} fill="none" stroke={accentColor} strokeWidth="3" strokeLinecap="round" />
          )}

          {/* Dots */}
          {POSITIONS.map((pos, i) => {
            const { x, y } = getXY(pos.angle);
            const isActive = i <= activeIndex && activeIndex >= 0;
            const isHover = hovered === i;
            return (
              <g key={i}>
                <circle
                  cx={x}
                  cy={y}
                  r={isHover ? DOT_RADIUS + 1.5 : DOT_RADIUS}
                  fill={isActive ? accentColor : 'hsl(var(--card))'}
                  stroke={isActive ? accentColor : 'hsl(var(--muted-foreground) / 0.4)'}
                  strokeWidth="1.5"
                  className="cursor-pointer transition-all"
                  onClick={() => onChange(DIAL_VALUES[i])}
                  onMouseEnter={() => setHovered(i)}
                  onMouseLeave={() => setHovered(null)}
                />
                {isHover && (
                  <text x={x} y={y - DOT_RADIUS - 5} textAnchor="middle" className="fill-muted-foreground text-[8px]">
                    {pos.label}
                  </text>
                )}
              </g>
            );
          })}

          {/* Center value */}
          <text x={CENTER} y={CENTER + 1} textAnchor="middle" dominantBaseline="middle" className="fill-foreground font-bold text-[16px]">
            {value}%
          </text>
        </svg>
      </div>
    </div>
  );
}
