import { useRef, useCallback } from 'react';

const SNAP_POINTS = [0, 33, 67, 100];

function nearestSnap(pct: number): number {
  let closest = SNAP_POINTS[0];
  let minDist = Math.abs(pct - closest);
  for (const sp of SNAP_POINTS) {
    const d = Math.abs(pct - sp);
    if (d < minDist) { closest = sp; minDist = d; }
  }
  return closest;
}

interface TrafficSliderProps {
  label: string;
  value: number;
  onChange: (v: number) => void;
  accentColor?: string;
}

export default function TrafficSlider({ label, value, onChange, accentColor = 'hsl(var(--primary))' }: TrafficSliderProps) {
  const trackRef = useRef<HTMLDivElement>(null);

  const pctFromEvent = (clientX: number) => {
    if (!trackRef.current) return 0;
    const rect = trackRef.current.getBoundingClientRect();
    const raw = ((clientX - rect.left) / rect.width) * 100;
    return Math.max(0, Math.min(100, raw));
  };

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    const snap = nearestSnap(pctFromEvent(e.clientX));
    onChange(snap);

    const onMove = (ev: PointerEvent) => onChange(nearestSnap(pctFromEvent(ev.clientX)));
    const onUp = () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  }, [onChange]);

  const fillPct = value;

  return (
    <div className="flex flex-col items-center gap-1.5 w-28">
      <span className="text-xs text-muted-foreground font-medium">{label}</span>
      <div
        ref={trackRef}
        className="relative w-full h-8 flex items-center cursor-pointer select-none"
        style={{ touchAction: 'none' }}
        onPointerDown={handlePointerDown}
      >
        {/* Track bg */}
        <div className="absolute left-0 right-0 h-1.5 rounded-full bg-muted" />
        {/* Fill */}
        <div
          className="absolute left-0 h-1.5 rounded-full transition-[width] duration-100"
          style={{ width: `${fillPct}%`, backgroundColor: accentColor }}
        />
        {/* Snap dots */}
        {SNAP_POINTS.map(sp => (
          <div
            key={sp}
            className="absolute w-2.5 h-2.5 rounded-full border-2 transition-colors duration-100"
            style={{
              left: `calc(${sp}% - 5px)`,
              backgroundColor: sp <= value ? accentColor : 'hsl(var(--muted))',
              borderColor: sp <= value ? accentColor : 'hsl(var(--muted-foreground) / 0.3)',
            }}
          />
        ))}
        {/* Thumb */}
        <div
          className="absolute w-5 h-5 rounded-full border-2 border-background shadow-lg transition-[left] duration-100"
          style={{
            left: `calc(${fillPct}% - 10px)`,
            backgroundColor: accentColor,
          }}
        />
      </div>
      <span className="text-xs font-mono font-semibold text-foreground">{value}%</span>
    </div>
  );
}
