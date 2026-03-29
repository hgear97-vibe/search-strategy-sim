import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { Strategy, ExperimentResult, emptyStrategy } from './engine';

export type Screen = 'login' | 'profile' | 'brief' | 'experiment' | 'results' | 'final' | 'score' | 'fired' | 'history';

export interface PlayerProfile {
  username: string;
  avatar: string;
}

export interface ScoreRecord {
  composite: number;
  us: number;
  ar: number;
  rating: string;
  timestamp: Date;
}

interface GameState {
  screen: Screen;
  profile: PlayerProfile | null;
  currentExperiment: number; // 1-3
  experiments: ExperimentResult[];
  currentStrategy: Strategy;
  finalResult: { us: number; ar: number } | null;
  scoreHistory: ScoreRecord[];
  returnScreen: Screen | null;
}

type Action =
  | { type: 'SET_SCREEN'; screen: Screen }
  | { type: 'SET_PROFILE'; profile: PlayerProfile }
  | { type: 'SET_STRATEGY'; strategy: Strategy }
  | { type: 'ADD_EXPERIMENT'; result: ExperimentResult }
  | { type: 'SET_FINAL_RESULT'; us: number; ar: number }
  | { type: 'ADD_SCORE'; record: ScoreRecord }
  | { type: 'RESET_GAME' }
  | { type: 'SET_RETURN_SCREEN'; screen: Screen };

const initialState: GameState = {
  screen: 'login',
  profile: null,
  currentExperiment: 1,
  experiments: [],
  currentStrategy: emptyStrategy(),
  finalResult: null,
  scoreHistory: [],
  returnScreen: null,
};

function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'SET_SCREEN': return { ...state, screen: action.screen };
    case 'SET_PROFILE': return { ...state, profile: action.profile };
    case 'SET_STRATEGY': return { ...state, currentStrategy: action.strategy };
    case 'ADD_EXPERIMENT':
      return {
        ...state,
        experiments: [...state.experiments, action.result],
        currentExperiment: state.currentExperiment + 1,
      };
    case 'SET_FINAL_RESULT': return { ...state, finalResult: { us: action.us, ar: action.ar } };
    case 'ADD_SCORE': return { ...state, scoreHistory: [...state.scoreHistory, action.record] };
    case 'RESET_GAME':
      return {
        ...state,
        currentExperiment: 1,
        experiments: [],
        currentStrategy: emptyStrategy(),
        finalResult: null,
      };
    case 'SET_RETURN_SCREEN': return { ...state, returnScreen: action.screen };
    default: return state;
  }
}

const GameContext = createContext<{ state: GameState; dispatch: React.Dispatch<Action> } | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  return <GameContext.Provider value={{ state, dispatch }}>{children}</GameContext.Provider>;
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within GameProvider');
  return ctx;
}
