import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

interface UserProfile {
  id: string;
  email: string;
  username: string;
  avatar: string;
}

interface AuthState {
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
}

interface AuthContextValue extends AuthState {
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  createProfile: (username: string, avatar: string) => Promise<void>;
  saveScore: (us: number, ar: number, composite: number, rating: string, fired: boolean) => Promise<void>;
  loadScores: () => Promise<ScoreRecord[]>;
}

export interface ScoreRecord {
  id: string;
  composite: number;
  us: number;
  ar: number;
  rating: string;
  fired: boolean;
  timestamp: Date;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    session: null,
    user: null,
    profile: null,
    loading: true,
  });

  // Listen for auth changes
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setState(prev => ({ ...prev, session, user: session?.user ?? null }));
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setState(prev => ({ ...prev, loading: false }));
      }
    });

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setState(prev => ({ ...prev, session, user: session?.user ?? null }));
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setState(prev => ({ ...prev, profile: null, loading: false }));
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function fetchProfile(userId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (data && !error) {
      setState(prev => ({
        ...prev,
        profile: {
          id: data.id,
          email: data.email,
          username: data.username,
          avatar: data.avatar,
        },
        loading: false,
      }));
    } else {
      // No profile yet — user needs to create one
      setState(prev => ({ ...prev, profile: null, loading: false }));
    }
  }

  async function signInWithGoogle() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    });
    if (error) {
      console.error('Sign-in error:', error.message);
      throw error;
    }
  }

  async function signOut() {
    await supabase.auth.signOut();
    setState({ session: null, user: null, profile: null, loading: false });
  }

  async function createProfile(username: string, avatar: string) {
    if (!state.user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('profiles')
      .insert({
        id: state.user.id,
        email: state.user.email,
        username,
        avatar,
      })
      .select()
      .single();

    if (error) {
      // Profile might already exist (e.g., user re-registering) — try update
      const { data: updated, error: updateError } = await supabase
        .from('profiles')
        .update({ username, avatar })
        .eq('id', state.user.id)
        .select()
        .single();

      if (updateError) throw updateError;
      setState(prev => ({
        ...prev,
        profile: {
          id: updated.id,
          email: updated.email,
          username: updated.username,
          avatar: updated.avatar,
        },
      }));
    } else {
      setState(prev => ({
        ...prev,
        profile: {
          id: data.id,
          email: data.email,
          username: data.username,
          avatar: data.avatar,
        },
      }));
    }
  }

  async function saveScore(us: number, ar: number, composite: number, rating: string, fired: boolean) {
    if (!state.user) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('scores')
      .insert({
        user_id: state.user.id,
        user_satisfaction: us,
        ad_revenue: ar,
        composite_score: composite,
        rating,
        fired,
      });

    if (error) {
      console.error('Error saving score:', error.message);
      throw error;
    }
  }

  async function loadScores(): Promise<ScoreRecord[]> {
    if (!state.user) return [];

    const { data, error } = await supabase
      .from('scores')
      .select('*')
      .eq('user_id', state.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading scores:', error.message);
      return [];
    }

    return (data || []).map(row => ({
      id: row.id,
      composite: Number(row.composite_score),
      us: Number(row.user_satisfaction),
      ar: Number(row.ad_revenue),
      rating: row.rating,
      fired: row.fired,
      timestamp: new Date(row.created_at),
    }));
  }

  return (
    <AuthContext.Provider value={{ ...state, signInWithGoogle, signOut, createProfile, saveScore, loadScores }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
