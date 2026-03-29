import { useGame } from '@/game/GameContext';
import { Trophy } from 'lucide-react';

export default function HistoryScreen() {
  const { state, dispatch } = useGame();
  const history = state.scoreHistory;
  const best = history.length > 0 ? Math.max(...history.map(h => h.composite)) : -1;

  return (
    <div className="min-h-screen bg-background p-8 pt-20">
      <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-foreground">Score History</h1>
          <button
            onClick={() => dispatch({ type: 'SET_SCREEN', screen: state.returnScreen || 'brief' })}
            className="game-button-secondary text-sm"
          >
            ← Back
          </button>
        </div>

        {history.length === 0 ? (
          <div className="stat-card text-center py-12">
            <p className="text-muted-foreground">No games played yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {history.map((r, i) => (
              <div
                key={i}
                className={`stat-card flex items-center justify-between ${
                  r.composite === best ? 'border-warning/50' : ''
                }`}
              >
                <div className="flex items-center gap-4">
                  {r.composite === best && <Trophy className="w-5 h-5 text-warning" />}
                  <div>
                    <p className="text-foreground font-semibold">
                      {r.composite} — <span className="text-sm">{r.rating}</span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      US: {r.us} | AR: {r.ar}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground font-mono">
                  {r.timestamp.toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
