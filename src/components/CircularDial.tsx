import { useState, useRef, useCallback } from 'react';

const DIAL_VALUES = [0, 33, 67, 100];
const RADIUS = 38;
const CENTER = 50;
const KNOB_RADIUS = 8;

// Map values to angles: 0% at top (-90°), going clockwise
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

function snapToNearest(angleDeg: number): number {
  // Normalize to -180..180
  let a = angleDeg;
  let minDist = Infinity;
  let bestIdx = 0;
  for (let i = 0; i < VALUE_ANGLES.length; i++) {
    let diff = Math.abs(a - VALUE_ANGLES[i].angle);
    if (diff > 180) diff = 360 - diff;
    if (diff < minDist) {
      minDist = diff;
      bestIdx = i;
    }
  }
  return DIAL_VALUES[bestIdx];
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
  const activeIndex = DIAL_VALUES.indexOf(value);
  const knobAngle = activeIndex >= 0 ? VALUE_ANGLES[activeIndex].angle : -90;
  const knobPos = getXY(knobAngle);

  const getArcPath = () => {
    if (activeIndex <= 0) return '';
    const startAngle = -90;
    const endAngle = VALUE_ANGLES[activeIndex].angle;
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
    const snapped = snapToNearest(angle);
    onChange(snapped);
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
    // Also snap on initial click
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const angle = angleFromMouse(cx, cy, e.clientX, e.clientY);
    const snapped = snapToNearest(angle);
    onChange(snapped);
  }, [handlePointerMove, handlePointerUp, onChange]);

  // Click on tick marks
  const handleTickClick = (idx: number) => {
    onChange(DIAL_VALUES[idx]);
  };

  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-xs text-muted-foreground">{label}</span>
      <div className="relative w-[110px] h-[110px] select-none">
        <svg ref={svgRef} viewBox="0 0 100 100" className="w-full h-full" style={{ touchAction: 'none' }}>
          {/* Track circle */}
          <circle cx={CENTER} cy={CENTER} r={RADIUS} fill="none" stroke="hsl(var(--muted))" strokeWidth="2.5" />

          {/* Active arc */}
          {activeIndex > 0 && (
            <path d={getArcPath()} fill="none" stroke={accentColor} strokeWidth="3.5" strokeLinecap="round" />
          )}

          {/* Tick marks */}
          {VALUE_ANGLES.map((va, i) => {
            const pos = getXY(va.angle);
            const isActive = i <= activeIndex && activeIndex >= 0;
            return (
              <g key={i}>
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={3}
                  fill={isActive ? accentColor : 'hsl(var(--muted-foreground) / 0.3)'}
                  className="cursor-pointer"
                  onClick={() => handleTickClick(i)}
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
            onPointerDown={handlePointerDown}
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
