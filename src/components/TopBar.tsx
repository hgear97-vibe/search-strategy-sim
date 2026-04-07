import { useState } from 'react';
import { useGame } from '@/game/GameContext';
import { useAuth } from '@/game/AuthContext';
import { Menu, X, Gamepad2, Trophy, LogOut } from 'lucide-react';
import { emptyStrategy } from '@/game/engine';
import { getAvatarImage } from '@/game/avatars';

export default function TopBar() {
  const { state, dispatch } = useGame();
  const { signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  if (!state.profile) return null;

  const avatarImg = getAvatarImage(state.profile.avatar);

  const handleSignOut = async () => {
    setMenuOpen(false);
    await signOut();
    dispatch({ type: 'RESET_GAME' });
    dispatch({ type: 'SET_SCREEN', screen: 'login' });
  };

  return (
    <>
      <div className="fixed top-0 right-0 z-50 p-4 flex items-center gap-3">
        <div className="flex items-center gap-2 bg-card border border-border rounded-full px-3 py-1.5">
          {avatarImg && <img src={avatarImg} alt="avatar" className="w-7 h-7 rounded-full object-cover" />}
          <span className="text-sm font-medium text-foreground">{state.profile.username}</span>
        </div>
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="p-2 bg-card border border-border rounded-lg hover:border-primary/40 transition-colors"
        >
          {menuOpen ? <X className="w-5 h-5 text-foreground" /> : <Menu className="w-5 h-5 text-foreground" />}
        </button>
      </div>

      {menuOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
          <div className="fixed top-16 right-4 z-50 bg-card border border-border rounded-lg shadow-lg w-52 overflow-hidden animate-fade-in">
            <button
              onClick={() => {
                setMenuOpen(false);
                dispatch({ type: 'RESET_GAME' });
                dispatch({ type: 'SET_STRATEGY', strategy: emptyStrategy() });
                dispatch({ type: 'SET_SCREEN', screen: 'brief' });
              }}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-foreground hover:bg-accent transition-colors"
            >
              <Gamepad2 className="w-4 h-4 text-primary" />
              Play Game
            </button>
            <div className="border-t border-border" />
            <button
              onClick={() => {
                setMenuOpen(false);
                dispatch({ type: 'SET_RETURN_SCREEN', screen: state.screen });
                dispatch({ type: 'SET_SCREEN', screen: 'history' });
              }}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-foreground hover:bg-accent transition-colors"
            >
              <Trophy className="w-4 h-4 text-warning" />
              Past Scores
            </button>
            <div className="border-t border-border" />
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-foreground hover:bg-accent transition-colors"
            >
              <LogOut className="w-4 h-4 text-muted-foreground" />
              Sign Out
            </button>
          </div>
        </>
      )}
    </>
  );
}
