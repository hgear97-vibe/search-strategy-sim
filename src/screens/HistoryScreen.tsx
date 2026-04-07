import { useEffect, useState } from 'react';
import { useGame } from '@/game/GameContext';
import { useAuth, ScoreRecord } from '@/game/AuthContext';
import { Trophy } from 'lucide-react';

export default function HistoryScreen() {
  const { state, dispatch } = useGame();
  const { loadScores } = useAuth();
  const [history, setHistory] = useState<ScoreRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadScores()
      .then(scores => {
        setHistory(scores);
        setLoading(false);
      })
      .catch(() => {
        // Fallback to local game state if Supabase fails
        setHistory(state.scoreHistory.map((r, i) => ({
          id: String(i),
          composite: r.composite,
          us: r.us,
          ar: r.ar,
          rating: r.rating,
          fired: false,
          timestamp: r.timestamp,
        })));
        setLoading(false);
      });
  }, []);

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

        {loading ? (
          <div className="stat-card text-center py-12">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-muted-foreground">Loading scores...</p>
          </div>
        ) : history.length === 0 ? (
          <div className="stat-card text-center py-12">
            <p className="text-muted-foreground">No games played yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {history.map((r) => (
              <div
                key={r.id}
                className={`stat-card flex items-center justify-between ${
                  r.composite === best && !r.fired ? 'border-warning/50' : ''
                } ${r.fired ? 'border-destructive/30' : ''}`}
              >
                <div className="flex items-center gap-4">
                  {r.composite === best && !r.fired && <Trophy className="w-5 h-5 text-warning" />}
                  <div>
                    <p className="text-foreground font-semibold">
                      {r.fired ? (
                        <span className="text-destructive">Fired — 0</span>
                      ) : (
                        <>{r.composite} — <span className="text-sm">{r.rating}</span></>
                      )}
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
