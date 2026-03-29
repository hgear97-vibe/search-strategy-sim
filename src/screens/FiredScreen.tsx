import { motion } from 'framer-motion';
import { useGame } from '@/game/GameContext';
import { emptyStrategy } from '@/game/engine';

export default function FiredScreen() {
  const { state, dispatch } = useGame();
  const username = state.profile?.username || 'CEO';

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
          The board has lost confidence in your strategy, {username}. Google's stock is in freefall. Better luck next time.
        </motion.p>

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
            Try Again
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
}
