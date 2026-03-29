import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useGame } from '@/game/GameContext';
import { getCompositeScore, getRating, emptyStrategy } from '@/game/engine';
import { getAvatarImage } from '@/game/avatars';
import ScoreGauge from '@/components/ScoreGauge';

export default function ScoreScreen() {
  const { state, dispatch } = useGame();
  const [showComposite, setShowComposite] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowComposite(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  const { finalResult, profile } = state;
  if (!finalResult) return null;

  const composite = getCompositeScore(finalResult.us, finalResult.ar);
  const rating = getRating(composite);
  const avatarImg = getAvatarImage(profile?.avatar || '');

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-8">
      <div className="max-w-2xl w-full space-y-10 text-center animate-fade-in">
        <div className="flex justify-center gap-16">
          <ScoreGauge label="User Satisfaction" value={finalResult.us} color="hsl(var(--google-blue))" />
          <ScoreGauge label="Ad Revenue" value={finalResult.ar} color="hsl(var(--google-green))" />
        </div>

        {showComposite && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="space-y-4"
          >
            <p className="text-muted-foreground text-sm uppercase tracking-wider">Composite Score</p>
            <p className="text-7xl font-bold text-foreground">{composite}</p>
            <p className={`text-2xl font-semibold ${rating.color}`}>{rating.label}</p>

            <motion.div
              className="relative mx-auto mt-2 h-24 w-24"
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <motion.div
                className="absolute inset-0 rounded-full bg-primary/20"
                animate={{ scale: [1, 1.35, 1], opacity: [0.55, 0.2, 0.55] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
              />
              <motion.div
                className="absolute inset-2 rounded-full bg-success/20"
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.15, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              />
              <div className="absolute inset-0 flex items-center justify-center text-4xl">🎉</div>
            </motion.div>

            <p className="text-sm text-muted-foreground">Great finish — you made it to the end.</p>

            <div className="flex items-center justify-center gap-3 pt-2">
              {avatarImg ? (
                <img src={avatarImg} alt={profile?.avatar} className="w-16 h-16 rounded-full object-cover border-2 border-primary" />
              ) : (
                <span className="text-3xl">👤</span>
              )}
              <span className="text-lg text-foreground">{profile?.username}</span>
            </div>
          </motion.div>
        )}

        <div className="flex justify-center gap-4">
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
          <button
            onClick={() => {
              dispatch({ type: 'SET_RETURN_SCREEN', screen: 'score' });
              dispatch({ type: 'SET_SCREEN', screen: 'history' });
            }}
            className="game-button-secondary"
          >
            View Scores
          </button>
        </div>
      </div>
    </div>
  );
}
