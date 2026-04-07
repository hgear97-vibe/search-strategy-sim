import { useGame } from '@/game/GameContext';
import { SEARCH_TYPES, Strategy, SearchType, Allocation, calculateScores, emptyStrategy } from '@/game/engine';
import { CheckCircle2, AlertTriangle, Info, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import TrafficSlider from '@/components/TrafficSlider';

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

  const isValid = (total: number) => total === 100 || total === 99;
  const allValid = SEARCH_TYPES.every(st => isValid(totals[st.key]));

  const prevExperiments = state.experiments;
  const lastExp = prevExperiments.length > 0 ? prevExperiments[prevExperiments.length - 1] : null;

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

  const DeltaIcon = ({ current, previous }: { current: number; previous: number }) => {
    if (current > previous) return <TrendingUp className="w-4 h-4 text-success inline" />;
    if (current < previous) return <TrendingDown className="w-4 h-4 text-destructive inline" />;
    return <Minus className="w-4 h-4 text-muted-foreground inline" />;
  };

  return (
    <div className="min-h-screen bg-background p-8 pt-20">
      <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {isFinal ? 'Final Strategy' : `Experiment ${state.currentExperiment} of 3`}
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Allocate traffic across modes for each search type. Each row must total 100%.
            </p>
          </div>

          {/* Past experiment scores */}
          {prevExperiments.length > 0 && (
            <div className="flex gap-3">
              {prevExperiments.map((exp, i) => (
                <div key={i} className="stat-card text-center text-sm px-4 py-3">
                  <p className="text-muted-foreground text-xs mb-1">Exp {i + 1}</p>
                  <p>US: <span className="font-semibold text-google-blue">{exp.userSatisfaction}</span>
                    {i > 0 && <> <DeltaIcon current={exp.userSatisfaction} previous={prevExperiments[i-1].userSatisfaction} /></>}
                  </p>
                  <p>AR: <span className="font-semibold text-google-green">{exp.adRevenue}</span>
                    {i > 0 && <> <DeltaIcon current={exp.adRevenue} previous={prevExperiments[i-1].adRevenue} /></>}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sticky warning banner */}
        <div className="flex items-center gap-3 bg-warning/10 border border-warning/30 rounded-lg px-4 py-3">
          <div className="p-1.5 rounded-full bg-warning/20">
            <AlertTriangle className="w-4 h-4 text-warning" />
          </div>
          <p className="text-sm text-warning">
            If your experiment causes a drastic drop in User Satisfaction or Ad Revenue below 40, the board will fire you immediately.
          </p>
        </div>

        <div className="space-y-3">
          {SEARCH_TYPES.map(st => {
            const total = totals[st.key];
            const valid = isValid(total);
            return (
              <div
                key={st.key}
                className={`stat-card flex items-center gap-6 ${
                  valid ? 'border-success/50' : total > 0 ? 'border-destructive/50' : ''
                }`}
              >
                <div className="w-44 flex-shrink-0">
                  <p className="font-semibold text-foreground">{st.label}</p>
                  <p className="text-xs text-muted-foreground">{st.description}</p>
                  <p className="text-xs text-muted-foreground/60 mt-1 italic">{st.examples}</p>
                </div>
                <div className="flex-1 flex justify-center gap-8">
                  <TrafficSlider label="Blue Links" value={strategy[st.key].blueLinks} onChange={v => setAlloc(st.key, 'blueLinks', v)} accentColor="hsl(var(--primary))" />
                  <TrafficSlider label="AI Overview" value={strategy[st.key].aiOverview} onChange={v => setAlloc(st.key, 'aiOverview', v)} accentColor="hsl(var(--google-purple))" />
                  <TrafficSlider label="AI Mode" value={strategy[st.key].aiMode} onChange={v => setAlloc(st.key, 'aiMode', v)} accentColor="hsl(var(--google-green))" />
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
