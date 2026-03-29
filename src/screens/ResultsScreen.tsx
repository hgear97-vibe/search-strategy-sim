import { useGame } from '@/game/GameContext';
import { getHeadlines, SEARCH_TYPES } from '@/game/engine';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import ScoreGauge from '@/components/ScoreGauge';
import H1 from '@/assets/headlines/H1.png';

export default function ResultsScreen() {
  const { state, dispatch } = useGame();
  const lastExp = state.experiments[state.experiments.length - 1];
  if (!lastExp) return null;

  const { userSatisfaction: us, adRevenue: ar } = lastExp;
  const headlines = getHeadlines(us, ar);
  const expNum = state.experiments.length;
  const boardAlert = us < 40 || ar < 40;
  const prevExperiments = state.experiments;

  const handleNext = () => {
    dispatch({ type: 'SET_STRATEGY', strategy: { ...lastExp.strategy } });
    dispatch({ type: 'SET_SCREEN', screen: 'experiment' });
  };

  const handleSubmit = () => {
    dispatch({ type: 'SET_STRATEGY', strategy: { ...lastExp.strategy } });
    dispatch({ type: 'SET_SCREEN', screen: 'final' });
  };

  const revealedTypes: string[] = [];
  if (expNum >= 2) revealedTypes.push('informational', 'transactional');
  if (expNum >= 3) revealedTypes.push('navigational', 'local');

  const DeltaIcon = ({ current, previous }: { current: number; previous: number }) => {
    if (current > previous) return <TrendingUp className="w-4 h-4 text-success inline" />;
    if (current < previous) return <TrendingDown className="w-4 h-4 text-destructive inline" />;
    return <Minus className="w-4 h-4 text-muted-foreground inline" />;
  };

  return (
    <div className="min-h-screen bg-background p-8 pt-20">
      <div className="max-w-5xl mx-auto space-y-8 animate-fade-in">
        <div className="flex justify-between items-start">
          <h1 className="text-3xl font-bold text-foreground">
            Experiment {expNum} Results
          </h1>

          {prevExperiments.length > 1 && (
            <div className="flex gap-3">
              {prevExperiments.slice(0, -1).map((exp, i) => (
                <div key={i} className="stat-card text-center text-sm px-4 py-3">
                  <p className="text-muted-foreground text-xs mb-1">Exp {i + 1}</p>
                  <p>US: <span className="font-semibold text-google-blue">{exp.userSatisfaction}</span></p>
                  <p>AR: <span className="font-semibold text-google-green">{exp.adRevenue}</span></p>
                </div>
              ))}
            </div>
          )}
        </div>

        {boardAlert && (
          <div className="bg-destructive/10 border border-destructive/50 rounded-lg p-4 text-center">
            <p className="text-destructive font-bold text-lg">🚨 BOARD ALERT</p>
            <p className="text-destructive/80 text-sm">
              The board demands immediate action. You must submit your final strategy now.
            </p>
          </div>
        )}

        <div className="flex justify-center gap-16">
          <div className="flex flex-col items-center">
            <ScoreGauge label="User Satisfaction" value={us} color="hsl(var(--google-blue))" />
            {prevExperiments.length > 1 && (
              <span className="text-muted-foreground text-sm mt-2">
                vs Exp {expNum - 1}: <DeltaIcon current={us} previous={prevExperiments[expNum - 2].userSatisfaction} />
              </span>
            )}
          </div>
          <div className="flex flex-col items-center">
            <ScoreGauge label="Ad Revenue" value={ar} color="hsl(var(--google-green))" />
            {prevExperiments.length > 1 && (
              <span className="text-muted-foreground text-sm mt-2">
                vs Exp {expNum - 1}: <DeltaIcon current={ar} previous={prevExperiments[expNum - 2].adRevenue} />
              </span>
            )}
          </div>
        </div>

        {headlines.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">News Feed</h3>
            {headlines.map((h, i) => (
              <div key={i} className="stat-card flex flex-col gap-3">
                <div className="flex items-start gap-3">
                  <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded font-mono">{h.source}</span>
                  <p className="text-foreground text-sm">{h.headline}</p>
                </div>
                <img
                  src={H1}
                  alt={h.headline}
                  loading="lazy"
                  className="w-full max-w-2xl h-auto rounded-md border border-border object-cover"
                />
              </div>
            ))}
          </div>
        )}

        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Search Type Insights</h3>
          {expNum === 1 ? (
            <div className="stat-card">
              <p className="text-muted-foreground text-sm italic">Insufficient data — aggregate metrics only.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {SEARCH_TYPES.map(st => {
                if (st.key === 'research') {
                  return (
                    <div key={st.key} className="stat-card">
                      <p className="text-sm font-semibold text-foreground">{st.label}</p>
                      <p className="text-xs text-muted-foreground italic mt-1">Data inconclusive. Market still evolving.</p>
                    </div>
                  );
                }
                if (!revealedTypes.includes(st.key)) {
                  return (
                    <div key={st.key} className="stat-card">
                      <p className="text-sm font-semibold text-foreground">{st.label}</p>
                      <p className="text-xs text-muted-foreground italic mt-1">Data not yet available.</p>
                    </div>
                  );
                }
                const alloc = lastExp.strategy[st.key];
                const table = { navigational: { bl: [75,90], ao: [55,60], am: [40,15] }, informational: { bl: [45,70], ao: [90,50], am: [85,20] }, transactional: { bl: [60,95], ao: [65,60], am: [70,15] }, local: { bl: [55,85], ao: [80,60], am: [70,20] } } as any;
                const t = table[st.key];
                if (!t) return null;
                const typeUS = (alloc.blueLinks/100)*t.bl[0] + (alloc.aiOverview/100)*t.ao[0] + (alloc.aiMode/100)*t.am[0];
                const typeAR = (alloc.blueLinks/100)*t.bl[1] + (alloc.aiOverview/100)*t.ao[1] + (alloc.aiMode/100)*t.am[1];
                return (
                  <div key={st.key} className="stat-card">
                    <p className="text-sm font-semibold text-foreground mb-2">{st.label}</p>
                    <div className="space-y-2">
                      <div>
                        <div className="flex justify-between text-xs mb-0.5">
                          <span className="text-muted-foreground">User Satisfaction</span>
                          <span className="font-mono text-google-blue">{Math.round(typeUS)}</span>
                        </div>
                        <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-google-blue rounded-full transition-all" style={{ width: `${typeUS}%` }} />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-xs mb-0.5">
                          <span className="text-muted-foreground">Ad Revenue</span>
                          <span className="font-mono text-google-green">{Math.round(typeAR)}</span>
                        </div>
                        <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-google-green rounded-full transition-all" style={{ width: `${typeAR}%` }} />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex justify-center gap-4 pt-4">
          {!boardAlert && state.currentExperiment <= 3 && (
            <button onClick={handleNext} className="game-button-primary">Next Experiment</button>
          )}
          {boardAlert ? (
            <button onClick={handleSubmit} className="game-button bg-destructive text-destructive-foreground hover:brightness-110">
              Submit Final Strategy
            </button>
          ) : (
            <button onClick={handleSubmit} className="game-button-secondary">Submit Final Strategy</button>
          )}
        </div>
      </div>
    </div>
  );
}
