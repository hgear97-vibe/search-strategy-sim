// Scoring lookup table
// [US, AR] per mode per search type
export const SCORE_TABLE = {
  navigational:  { weight: 0.15, blueLinks: [75, 90], aiOverview: [55, 60], aiMode: [40, 15] },
  informational: { weight: 0.30, blueLinks: [45, 70], aiOverview: [90, 50], aiMode: [85, 20] },
  research:      { weight: 0.20, blueLinks: [50, 80], aiOverview: [70, 55], aiMode: [90, 25] },
  transactional: { weight: 0.20, blueLinks: [60, 95], aiOverview: [65, 60], aiMode: [70, 15] },
  local:         { weight: 0.15, blueLinks: [55, 85], aiOverview: [80, 60], aiMode: [70, 20] },
} as const;

export type SearchType = keyof typeof SCORE_TABLE;

export const SEARCH_TYPES: { key: SearchType; label: string; description: string; examples: string }[] = [
  { key: 'navigational', label: 'Navigational', description: 'User knows where they want to go', examples: '"facebook login", "gmail", "youtube"' },
  { key: 'informational', label: 'Informational', description: 'User wants to learn something', examples: '"how does photosynthesis work", "what is GDP"' },
  { key: 'research', label: 'Research', description: 'Deep exploration of a topic', examples: '"best laptops 2025", "python vs rust comparison"' },
  { key: 'transactional', label: 'Transactional', description: 'User wants to buy or do something', examples: '"buy iPhone 16", "book flight to Tokyo"' },
  { key: 'local', label: 'Local', description: 'Location-based queries', examples: '"restaurants near me", "gas station open now"' },
];

export interface Allocation {
  blueLinks: number;
  aiOverview: number;
  aiMode: number;
}

export type Strategy = Record<SearchType, Allocation>;

export interface ExperimentResult {
  userSatisfaction: number;
  adRevenue: number;
  strategy: Strategy;
}

export function calculateScores(strategy: Strategy): { userSatisfaction: number; adRevenue: number } {
  let us = 0, ar = 0;
  for (const [type, alloc] of Object.entries(strategy) as [SearchType, Allocation][]) {
    const t = SCORE_TABLE[type];
    const usScore = (alloc.blueLinks / 100) * t.blueLinks[0] + (alloc.aiOverview / 100) * t.aiOverview[0] + (alloc.aiMode / 100) * t.aiMode[0];
    const arScore = (alloc.blueLinks / 100) * t.blueLinks[1] + (alloc.aiOverview / 100) * t.aiOverview[1] + (alloc.aiMode / 100) * t.aiMode[1];
    us += usScore * t.weight;
    ar += arScore * t.weight;
  }
  return { userSatisfaction: Math.round(us), adRevenue: Math.round(ar) };
}

export function getCompositeScore(us: number, ar: number): number {
  return Math.round((us + ar) / 2);
}

export function getRating(score: number): { label: string; color: string } {
  if (score >= 85) return { label: 'Strategic Mastermind', color: 'text-success' };
  if (score >= 70) return { label: 'Solid CEO', color: 'text-primary' };
  if (score >= 55) return { label: 'Under Pressure', color: 'text-warning' };
  return { label: 'On Thin Ice', color: 'text-destructive' };
}

export function isFired(us: number, ar: number): boolean {
  return us < 40 || ar < 40;
}

// Headline engine
interface Headline {
  headline: string;
  source: string;
  trigger: (us: number, ar: number) => boolean;
}

export const HEADLINES: Headline[] = [
  { headline: "Google Ad Revenue Plunges as AI Search Cannibalizes Click-Through Rates", source: "WSJ", trigger: (_, ar) => ar < 40 },
  { headline: "Alphabet Stock Drops 12% After Disastrous Search Revenue Report", source: "Bloomberg", trigger: (_, ar) => ar < 35 },
  { headline: "Advertisers Flee Google as AI Mode Eliminates Sponsored Results", source: "AdAge", trigger: (_, ar) => ar < 45 },
  { headline: "Google Search Users Revolt: 'Just Give Us the Links Back'", source: "The Verge", trigger: (us, _) => us < 40 },
  { headline: "User Satisfaction Hits All-Time Low as Google Doubles Down on AI", source: "TechCrunch", trigger: (us, _) => us < 45 },
  { headline: "Perplexity CEO: 'Google is Handing Us the Market on a Silver Platter'", source: "CNBC", trigger: (us, _) => us < 50 },
  { headline: "ChatGPT Search Usage Surges 40% as Google Users Seek Alternatives", source: "Reuters", trigger: (us, ar) => us < 55 && ar < 55 },
  { headline: "Google Walks AI Tightrope: Revenue Stable but User Trust Eroding", source: "NYT", trigger: (us, ar) => ar > 60 && us < 55 },
  { headline: "Analysts Warn: Google's AI Transition Could Take Years to Monetize", source: "Financial Times", trigger: (_, ar) => ar < 60 && ar >= 40 },
  { headline: "Google's Bold AI Bet Pays Off: User Satisfaction Surges", source: "TechCrunch", trigger: (us, _) => us > 75 },
  { headline: "Wall Street Applauds Google's Balanced AI Search Strategy", source: "WSJ", trigger: (us, ar) => us > 65 && ar > 65 },
  { headline: "Google Proves AI and Ads Can Coexist, Revenue Holds Steady", source: "Bloomberg", trigger: (us, ar) => ar > 70 && us > 55 },
  { headline: "Pichai's Masterclass: Google Search Revenue Hits New Highs Amid AI Shift", source: "Forbes", trigger: (us, ar) => ar > 80 && us > 60 },
  { headline: "Google's AI Overview Wins Users Without Losing Advertisers", source: "Wired", trigger: (us, ar) => us > 70 && ar > 60 },
  { headline: "Search Wars 2025: Google Maintains Dominance with Hybrid Approach", source: "The Information", trigger: (us, ar) => us > 60 && ar > 60 },
  { headline: "OpenAI Struggles to Compete as Google Nails AI Search Integration", source: "Ars Technica", trigger: (us, ar) => us > 75 && ar > 70 },
];

export function getHeadlines(us: number, ar: number): Headline[] {
  return HEADLINES.filter(h => h.trigger(us, ar)).slice(0, 3);
}

export function emptyStrategy(): Strategy {
  return {
    navigational: { blueLinks: 0, aiOverview: 0, aiMode: 0 },
    informational: { blueLinks: 0, aiOverview: 0, aiMode: 0 },
    research: { blueLinks: 0, aiOverview: 0, aiMode: 0 },
    transactional: { blueLinks: 0, aiOverview: 0, aiMode: 0 },
    local: { blueLinks: 0, aiOverview: 0, aiMode: 0 },
  };
}
