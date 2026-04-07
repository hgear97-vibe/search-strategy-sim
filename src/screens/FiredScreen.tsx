import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, RotateCcw } from 'lucide-react';
import { useGame } from '@/game/GameContext';
import { useAuth } from '@/game/AuthContext';
import { emptyStrategy } from '@/game/engine';

export default function FiredScreen() {
  const { state, dispatch } = useGame();
  const { saveScore } = useAuth();
  const username = state.profile?.username || 'CEO';
  const scoreSaved = useRef(false);

  // Save fired score to Supabase on mount (once)
  useEffect(() => {
    if (!scoreSaved.current) {
      scoreSaved.current = true;
      const us = state.finalResult?.us ?? 0;
      const ar = state.finalResult?.ar ?? 0;

      saveScore(us, ar, 0, "You're Fired", true)
        .catch(err => console.error('Failed to save fired score:', err));

      dispatch({
        type: 'ADD_SCORE',
        record: {
          composite: 0,
          us,
          ar,
          rating: "You're Fired",
          timestamp: new Date(),
        },
      });
    }
  }, []);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-8">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-lg w-full text-center space-y-8"
      >
        <div className="space-y-2">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="inline-block bg-destructive/10 border-2 border-destructive rounded-2xl p-8"
          >
            <h1 className="text-6xl font-black text-destructive">You're Fired.</h1>
          </motion.div>
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-muted-foreground text-lg leading-relaxed"
        >
          The board has lost confidence in your strategy, {username}. Google's stock is in freefall — reset and come back stronger.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.3 }}
          className="mx-auto w-fit rounded-xl border border-border bg-card px-5 py-4"
        >
          <div className="flex items-center gap-3">
            <motion.div animate={{ rotate: [-6, 6, -6] }} transition={{ duration: 0.8, repeat: Infinity, ease: 'easeInOut' }}>
              <AlertTriangle className="h-5 w-5 text-warning" />
            </motion.div>
            <p className="text-sm text-muted-foreground">Regroup and run a cleaner strategy next round.</p>
            <motion.div animate={{ x: [0, 4, 0] }} transition={{ duration: 1.1, repeat: Infinity }}>
              <RotateCcw className="h-5 w-5 text-primary" />
            </motion.div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
        >
          <p className="text-sm text-muted-foreground mb-6">Score recorded as <span className="font-bold text-destructive">0</span></p>
          <button
            onClick={() => {
              dispatch({ type: 'RESET_GAME' });
              dispatch({ type: 'SET_STRATEGY', strategy: emptyStrategy() });
              dispatch({ type: 'SET_SCREEN', screen: 'experiment' });
            }}
            className="game-button-primary"
          >
            Play Again
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
}
