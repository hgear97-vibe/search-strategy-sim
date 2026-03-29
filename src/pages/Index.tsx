import { GameProvider, useGame } from '@/game/GameContext';
import TopBar from '@/components/TopBar';
import LoginScreen from '@/screens/LoginScreen';
import ProfileScreen from '@/screens/ProfileScreen';
import BriefScreen from '@/screens/BriefScreen';
import ExperimentScreen from '@/screens/ExperimentScreen';
import ResultsScreen from '@/screens/ResultsScreen';
import ScoreScreen from '@/screens/ScoreScreen';
import FiredScreen from '@/screens/FiredScreen';
import HistoryScreen from '@/screens/HistoryScreen';

function GameRouter() {
  const { state } = useGame();

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
