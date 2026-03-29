import { useState, useRef, useCallback } from 'react';

const DIAL_VALUES = [0, 33, 67, 100];
const RADIUS = 38;
const CENTER = 50;
const KNOB_RADIUS = 8;

// 0 at top (-90°), 33 at right (0°), 67 at bottom (90°), 100 at left (180°)
const VALUE_ANGLES = [
  { value: 0, angle: -90 },
  { value: 33, angle: 0 },
  { value: 67, angle: 90 },
  { value: 100, angle: 180 },
];

function getXY(angleDeg: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: CENTER + RADIUS * Math.cos(rad), y: CENTER + RADIUS * Math.sin(rad) };
}

function angleFromMouse(cx: number, cy: number, mx: number, my: number): number {
  return Math.atan2(my - cy, mx - cx) * (180 / Math.PI);
}

function valueFromAngle(angleDeg: number): number {
  // Map angle to value linearly: -90° = 0, 180° = 100
  // Normalize angle to 0..270 range (where -90 becomes 0, 180 becomes 270)
  let normalized = angleDeg + 90;
  if (normalized < -45) normalized += 360;
  
  // Clamp to 0..270 range
  if (normalized < 0) normalized = 0;
  if (normalized > 270) normalized = 270;
  
  // Map to 0..100
  const raw = (normalized / 270) * 100;
  
  // Snap to nearest DIAL_VALUE
  let bestVal = DIAL_VALUES[0];
  let bestDist = Infinity;
  for (const v of DIAL_VALUES) {
    const dist = Math.abs(raw - v);
    if (dist < bestDist) {
      bestDist = dist;
      bestVal = v;
    }
  }
  return bestVal;
}

function angleForValue(value: number): number {
  const entry = VALUE_ANGLES.find(v => v.value === value);
  return entry ? entry.angle : -90;
}

interface CircularDialProps {
  label: string;
  value: number;
  onChange: (v: number) => void;
  accentColor?: string;
}

export default function CircularDial({ label, value, onChange, accentColor = 'hsl(var(--primary))' }: CircularDialProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [dragging, setDragging] = useState(false);
  const knobAngle = angleForValue(value);
  const knobPos = getXY(knobAngle);

  const getArcPath = () => {
    if (value <= 0) return '';
    const startAngle = -90;
    const endAngle = angleForValue(value);
    const sweep = endAngle - startAngle;
    const largeArc = sweep > 180 ? 1 : 0;
    const start = getXY(startAngle);
    const end = getXY(endAngle);
    return `M ${start.x} ${start.y} A ${RADIUS} ${RADIUS} 0 ${largeArc} 1 ${end.x} ${end.y}`;
  };

  const handlePointerMove = useCallback((e: PointerEvent) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const angle = angleFromMouse(cx, cy, e.clientX, e.clientY);
    onChange(valueFromAngle(angle));
  }, [onChange]);

  const handlePointerUp = useCallback(() => {
    setDragging(false);
    window.removeEventListener('pointermove', handlePointerMove);
    window.removeEventListener('pointerup', handlePointerUp);
  }, [handlePointerMove]);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    setDragging(true);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const angle = angleFromMouse(cx, cy, e.clientX, e.clientY);
    onChange(valueFromAngle(angle));
  }, [handlePointerMove, handlePointerUp, onChange]);

  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-xs text-muted-foreground">{label}</span>
      <div className="relative w-[110px] h-[110px] select-none cursor-pointer" onPointerDown={handlePointerDown as any}>
        <svg ref={svgRef} viewBox="0 0 100 100" className="w-full h-full" style={{ touchAction: 'none' }}>
          {/* Track circle */}
          <circle cx={CENTER} cy={CENTER} r={RADIUS} fill="none" stroke="hsl(var(--muted))" strokeWidth="2.5" />

          {/* Active arc */}
          {value > 0 && (
            <path d={getArcPath()} fill="none" stroke={accentColor} strokeWidth="3.5" strokeLinecap="round" />
          )}

          {/* Tick marks with labels */}
          {VALUE_ANGLES.map((va, i) => {
            const pos = getXY(va.angle);
            const isActive = va.value <= value;
            return (
              <g key={i}>
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={2.5}
                  fill={isActive ? accentColor : 'hsl(var(--muted-foreground) / 0.3)'}
                />
                <text
                  x={pos.x + (Math.cos((va.angle * Math.PI) / 180) * 12)}
                  y={pos.y + (Math.sin((va.angle * Math.PI) / 180) * 12) + 1}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="fill-muted-foreground/50 text-[7px] pointer-events-none"
                >
                  {va.value}
                </text>
              </g>
            );
          })}

          {/* Draggable knob */}
          <circle
            cx={knobPos.x}
            cy={knobPos.y}
            r={KNOB_RADIUS}
            fill={accentColor}
            stroke="hsl(var(--background))"
            strokeWidth="2"
            className={`cursor-grab ${dragging ? 'cursor-grabbing' : ''}`}
            style={{ filter: dragging ? `drop-shadow(0 0 6px ${accentColor})` : 'none' }}
          />

          {/* Center value */}
          <text x={CENTER} y={CENTER + 1} textAnchor="middle" dominantBaseline="middle" className="fill-foreground font-bold text-[16px] pointer-events-none">
            {value}%
          </text>
        </svg>
      </div>
    </div>
  );
}
