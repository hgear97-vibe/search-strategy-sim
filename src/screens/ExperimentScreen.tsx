import { useGame } from '@/game/GameContext';
import { SEARCH_TYPES, Strategy, SearchType, Allocation, calculateScores, emptyStrategy } from '@/game/engine';
import { CheckCircle2, AlertTriangle } from 'lucide-react';

const SNAP_VALUES = [0, 33, 50, 67, 100];

function snapToNearest(val: number): number {
  return SNAP_VALUES.reduce((prev, curr) =>
    Math.abs(curr - val) < Math.abs(prev - val) ? curr : prev
  );
}

interface DialProps {
  label: string;
  value: number;
  onChange: (v: number) => void;
}

function Dial({ label, value, onChange }: DialProps) {
  return (
    <div className="flex-1 space-y-1">
      <div className="flex justify-between items-center">
        <span className="text-xs text-muted-foreground">{label}</span>
        <span className="text-xs font-mono font-semibold text-foreground">{value}%</span>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        step={1}
        value={value}
        onChange={e => onChange(snapToNearest(Number(e.target.value)))}
        className="w-full h-1.5 bg-muted rounded-full appearance-none cursor-pointer accent-primary
          [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4
          [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer"
      />
    </div>
  );
}

interface Props {
  isFinal?: boolean;
}

export default function ExperimentScreen({ isFinal }: Props) {
  const { state, dispatch } = useGame();
  const strategy = state.currentStrategy;

  const setAlloc = (type: SearchType, field: keyof Allocation, value: number) => {
    const updated: Strategy = {
      ...strategy,
      [type]: { ...strategy[type], [field]: value },
    };
    dispatch({ type: 'SET_STRATEGY', strategy: updated });
  };

  const totals = Object.fromEntries(
    SEARCH_TYPES.map(st => [
      st.key,
      strategy[st.key].blueLinks + strategy[st.key].aiOverview + strategy[st.key].aiMode,
    ])
  ) as Record<SearchType, number>;

  const allValid = SEARCH_TYPES.every(st => totals[st.key] === 100);

  const handleRun = () => {
    const scores = calculateScores(strategy);
    dispatch({ type: 'ADD_EXPERIMENT', result: { ...scores, strategy: { ...strategy } } });
    dispatch({ type: 'SET_STRATEGY', strategy: { ...strategy } });
    dispatch({ type: 'SET_SCREEN', screen: 'results' });
  };

  const handleSubmitFinal = () => {
    if (!allValid) return;
    const scores = calculateScores(strategy);
    dispatch({ type: 'SET_FINAL_RESULT', us: scores.userSatisfaction, ar: scores.adRevenue });
    dispatch({
      type: 'ADD_SCORE',
      record: {
        composite: Math.round((scores.userSatisfaction + scores.adRevenue) / 2),
        us: scores.userSatisfaction,
        ar: scores.adRevenue,
        rating: scores.userSatisfaction < 40 || scores.adRevenue < 40 ? 'Fired' :
          Math.round((scores.userSatisfaction + scores.adRevenue) / 2) >= 85 ? 'Strategic Mastermind' :
          Math.round((scores.userSatisfaction + scores.adRevenue) / 2) >= 70 ? 'Solid CEO' :
          Math.round((scores.userSatisfaction + scores.adRevenue) / 2) >= 55 ? 'Under Pressure' : 'On Thin Ice',
        timestamp: new Date(),
      },
    });
    dispatch({
      type: 'SET_SCREEN',
      screen: scores.userSatisfaction < 40 || scores.adRevenue < 40 ? 'fired' : 'score',
    });
  };

  return (
    <div className="min-h-screen bg-background p-8 pt-20">
      <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {isFinal ? 'Final Strategy' : `Experiment ${state.currentExperiment} of 3`}
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Allocate traffic across modes for each search type. Each row must total 100%.
            </p>
          </div>
          {state.experiments.length > 0 && !isFinal && (
            <div className="stat-card text-right text-sm space-y-1">
              <p className="text-muted-foreground text-xs">Last Experiment</p>
              <p>US: <span className="font-semibold text-google-blue">{state.experiments[state.experiments.length - 1].userSatisfaction}</span></p>
              <p>AR: <span className="font-semibold text-google-green">{state.experiments[state.experiments.length - 1].adRevenue}</span></p>
            </div>
          )}
        </div>

        <div className="space-y-3">
          {SEARCH_TYPES.map(st => {
            const total = totals[st.key];
            const valid = total === 100;
            return (
              <div
                key={st.key}
                className={`stat-card flex items-start gap-6 ${
                  valid ? 'border-success/50' : total > 0 ? 'border-destructive/50' : ''
                }`}
              >
                <div className="w-48 flex-shrink-0">
                  <p className="font-semibold text-foreground">{st.label}</p>
                  <p className="text-xs text-muted-foreground">{st.description}</p>
                  <p className="text-xs text-muted-foreground/60 mt-1 italic">{st.examples}</p>
                </div>
                <div className="flex-1 flex gap-6">
                  <Dial label="Blue Links" value={strategy[st.key].blueLinks} onChange={v => setAlloc(st.key, 'blueLinks', v)} />
                  <Dial label="AI Overview" value={strategy[st.key].aiOverview} onChange={v => setAlloc(st.key, 'aiOverview', v)} />
                  <Dial label="AI Mode" value={strategy[st.key].aiMode} onChange={v => setAlloc(st.key, 'aiMode', v)} />
                </div>
                <div className="w-24 flex-shrink-0 flex items-center gap-2 justify-end">
                  {valid ? (
                    <CheckCircle2 className="w-5 h-5 text-success" />
                  ) : total > 0 ? (
                    <AlertTriangle className="w-5 h-5 text-destructive" />
                  ) : null}
                  <span className={`text-sm font-mono font-semibold ${valid ? 'text-success' : total > 100 ? 'text-destructive' : 'text-muted-foreground'}`}>
                    {total}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex justify-center gap-4 pt-4">
          {!isFinal && (
            <button
              onClick={handleRun}
              disabled={!allValid}
              className={`game-button-primary ${!allValid ? 'opacity-40 cursor-not-allowed' : ''}`}
            >
              Run Experiment
            </button>
          )}
          <button
            onClick={handleSubmitFinal}
            disabled={!allValid}
            className={`game-button ${isFinal ? 'game-button-primary' : 'game-button-secondary'} ${!allValid ? 'opacity-40 cursor-not-allowed' : ''}`}
          >
            Submit Final Strategy
            {!isFinal && <span className="text-xs text-muted-foreground ml-2">(skip remaining)</span>}
          </button>
        </div>
      </div>
    </div>
  );
}
