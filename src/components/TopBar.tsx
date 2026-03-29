import { useGame } from '@/game/GameContext';

const AVATARS = [
  { id: 'lion', label: 'Lion', emoji: '🦁' },
  { id: 'horse', label: 'Horse', emoji: '🐴' },
  { id: 'turtle', label: 'Turtle', emoji: '🐢' },
  { id: 'shark', label: 'Shark', emoji: '🦈' },
  { id: 'eagle', label: 'Eagle', emoji: '🦅' },
];

export default function TopBar() {
  const { state, dispatch } = useGame();
  if (!state.profile) return null;

  const avatar = AVATARS.find(a => a.id === state.profile!.avatar);

  return (
    <div className="fixed top-0 right-0 z-50 p-4 flex items-center gap-3">
      <button
        onClick={() => {
          dispatch({ type: 'SET_RETURN_SCREEN', screen: state.screen });
          dispatch({ type: 'SET_SCREEN', screen: 'history' });
        }}
        className="flex items-center gap-2 bg-card border border-border rounded-full px-4 py-2 hover:border-primary/40 transition-colors cursor-pointer"
      >
        <span className="text-xl">{avatar?.emoji}</span>
        <span className="text-sm font-medium text-foreground">{state.profile.username}</span>
      </button>
    </div>
  );
}
