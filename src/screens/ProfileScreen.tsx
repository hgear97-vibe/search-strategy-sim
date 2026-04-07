import { useState } from 'react';
import { useGame } from '@/game/GameContext';
import { useAuth } from '@/game/AuthContext';
import { AVATARS } from '@/game/avatars';

export default function ProfileScreen() {
  const { dispatch } = useGame();
  const { createProfile } = useAuth();
  const [username, setUsername] = useState('');
  const [avatar, setAvatar] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canContinue = username.trim().length > 0 && avatar && !saving;

  const handleContinue = async () => {
    if (!canContinue) return;
    try {
      setSaving(true);
      setError(null);
      await createProfile(username.trim(), avatar);
      dispatch({ type: 'SET_PROFILE', profile: { username: username.trim(), avatar } });
      dispatch({ type: 'SET_SCREEN', screen: 'brief' });
    } catch (err: any) {
      setError(err.message || 'Failed to save profile. Please try again.');
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md space-y-8 animate-fade-in">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-foreground">Create Your Profile</h2>
          <p className="text-muted-foreground mt-2">Choose your CEO persona</p>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">Username</label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="Enter your CEO name"
              className="w-full bg-card border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              maxLength={20}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-3">Choose Avatar</label>
            <div className="flex gap-4 justify-center">
              {AVATARS.map(a => (
                <button
                  key={a.id}
                  onClick={() => setAvatar(a.id)}
                  className={`w-40 h-40 rounded-full flex items-center justify-center overflow-hidden bg-card border-2 transition-all cursor-pointer ${
                    avatar === a.id
                      ? 'border-primary shadow-[0_0_15px_hsl(var(--primary)/0.3)] scale-110'
                      : 'border-border hover:border-muted-foreground'
                  }`}
                  title={a.label}
                >
                  <img src={a.image} alt={a.label} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {error && (
            <p className="text-destructive text-sm text-center">{error}</p>
          )}

          <button
            onClick={handleContinue}
            disabled={!canContinue}
            className={`w-full game-button-primary ${!canContinue ? 'opacity-40 cursor-not-allowed' : ''}`}
          >
            {saving ? 'Saving...' : 'Continue'}
          </button>
        </div>
      </div>
    </div>
  );
}
