import { useState, useRef, useCallback } from 'react';

const SNAP_VALUES = [0, 33, 67, 100];
const TRACK_WIDTH = 120;
const TRACK_PADDING = 12;
const USABLE_WIDTH = TRACK_WIDTH - TRACK_PADDING * 2;

function getXForValue(value: number): number {
  const idx = SNAP_VALUES.indexOf(value);
  if (idx >= 0) return TRACK_PADDING + (idx / (SNAP_VALUES.length - 1)) * USABLE_WIDTH;
  return TRACK_PADDING + (value / 100) * USABLE_WIDTH;
}

function snapToNearest(x: number): number {
  const pct = Math.max(0, Math.min(1, (x - TRACK_PADDING) / USABLE_WIDTH));
  const idx = Math.round(pct * (SNAP_VALUES.length - 1));
  return SNAP_VALUES[Math.max(0, Math.min(SNAP_VALUES.length - 1, idx))];
}

interface LinearSliderProps {
  label: string;
  value: number;
  onChange: (v: number) => void;
  accentColor?: string;
}

export default function CircularDial({ label, value, onChange, accentColor = 'hsl(var(--primary))' }: LinearSliderProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);

  const getValueFromPointer = useCallback((clientX: number) => {
    if (!trackRef.current) return value;
    const rect = trackRef.current.getBoundingClientRect();
    const relX = ((clientX - rect.left) / rect.width) * TRACK_WIDTH;
    return snapToNearest(relX);
  }, [value]);

  const handlePointerMove = useCallback((e: PointerEvent) => {
    onChange(getValueFromPointer(e.clientX));
  }, [onChange, getValueFromPointer]);

  const handlePointerUp = useCallback(() => {
    setDragging(false);
    window.removeEventListener('pointermove', handlePointerMove);
    window.removeEventListener('pointerup', handlePointerUp);
  }, [handlePointerMove]);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    setDragging(true);
    onChange(getValueFromPointer(e.clientX));
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  }, [handlePointerMove, handlePointerUp, onChange, getValueFromPointer]);

  const thumbX = getXForValue(value);

  return (
    <div className="flex flex-col items-center gap-1.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <div
        ref={trackRef}
        className="relative select-none cursor-pointer"
        style={{ width: TRACK_WIDTH, height: 40, touchAction: 'none' }}
        onPointerDown={handlePointerDown}
      >
        {/* Track background line */}
        <div
          className="absolute top-1/2 -translate-y-1/2 rounded-full"
          style={{
            left: TRACK_PADDING,
            right: TRACK_PADDING,
            height: 3,
            backgroundColor: 'hsl(var(--muted))',
          }}
        />

        {/* Active fill line */}
        {value > 0 && (
          <div
            className="absolute top-1/2 -translate-y-1/2 rounded-full transition-all duration-100"
            style={{
              left: TRACK_PADDING,
              width: thumbX - TRACK_PADDING,
              height: 3,
              backgroundColor: accentColor,
            }}
          />
        )}

        {/* Snap-point dots */}
        {SNAP_VALUES.map((sv, i) => {
          const dotX = getXForValue(sv);
          const isActive = sv <= value;
          return (
            <div
              key={i}
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 rounded-full transition-colors duration-100"
              style={{
                left: dotX,
                width: 8,
                height: 8,
                backgroundColor: isActive ? accentColor : 'hsl(var(--muted-foreground) / 0.3)',
              }}
            />
          );
        })}

        {/* Thumb / knob */}
        <div
          className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 rounded-full border-2 transition-all duration-100 ${dragging ? 'scale-110' : ''}`}
          style={{
            left: thumbX,
            width: 18,
            height: 18,
            backgroundColor: accentColor,
            borderColor: 'hsl(var(--background))',
            boxShadow: dragging ? `0 0 8px ${accentColor}` : '0 1px 3px rgba(0,0,0,0.2)',
          }}
        />

        {/* Value labels below dots */}
        {SNAP_VALUES.map((sv, i) => {
          const dotX = getXForValue(sv);
          return (
            <span
              key={`label-${i}`}
              className="absolute text-[9px] text-muted-foreground/50 pointer-events-none"
              style={{
                left: dotX,
                top: 32,
                transform: 'translateX(-50%)',
              }}
            >
              {sv}
            </span>
          );
        })}
      </div>
      <span className="text-sm font-bold" style={{ color: accentColor }}>{value}%</span>
    </div>
  );
}
