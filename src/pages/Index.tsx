import { useEffect } from 'react';
import { GameProvider, useGame } from '@/game/GameContext';
import { useAuth } from '@/game/AuthContext';
import TopBar from '@/components/TopBar';
import LoginScreen from '@/screens/LoginScreen';
import ProfileScreen from '@/screens/ProfileScreen';
import BriefScreen from '@/screens/BriefScreen';
import ExperimentScreen from '@/screens/ExperimentScreen';
import ResultsScreen from '@/screens/ResultsScreen';
import ScoreScreen from '@/screens/ScoreScreen';
import FiredScreen from '@/screens/FiredScreen';
import HistoryScreen from '@/screens/HistoryScreen';

function AuthSync() {
  const { user, profile, loading } = useAuth();
  const { state, dispatch } = useGame();

  useEffect(() => {
    if (loading) return;

    if (user && profile && state.screen === 'login') {
      // User is authenticated and has a profile — sync it to game state and go to brief
      dispatch({ type: 'SET_PROFILE', profile: { username: profile.username, avatar: profile.avatar } });
      dispatch({ type: 'SET_SCREEN', screen: 'brief' });
    } else if (user && !profile && state.screen === 'login') {
      // User is authenticated but has no profile — go to profile setup
      dispatch({ type: 'SET_SCREEN', screen: 'profile' });
    } else if (!user && state.screen !== 'login') {
      // User signed out — go back to login
      dispatch({ type: 'SET_SCREEN', screen: 'login' });
    }
  }, [user, profile, loading]);

  return null;
}

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4 animate-fade-in">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}

function GameRouter() {
  const { state } = useGame();
  const { loading } = useAuth();

  if (loading) return <LoadingScreen />;

  const screens: Record<string, JSX.Element> = {
    login: <LoginScreen />,
    profile: <ProfileScreen />,
    brief: <BriefScreen />,
    experiment: <ExperimentScreen />,
    results: <ResultsScreen />,
    final: <ExperimentScreen isFinal />,
    score: <ScoreScreen />,
    fired: <FiredScreen />,
    history: <HistoryScreen />,
  };

  return (
    <div className="min-w-[1024px]">
      <TopBar />
      <AuthSync />
      {screens[state.screen] || <LoginScreen />}
    </div>
  );
}

export default function Index() {
  return (
    <GameProvider>
      <GameRouter />
    </GameProvider>
  );
}
