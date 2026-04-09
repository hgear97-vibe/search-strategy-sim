import { useRef } from 'react';
import { useGame } from '@/game/GameContext';
import { getHeadlines, SEARCH_TYPES } from '@/game/engine';
import { TrendingUp, TrendingDown, Minus, ChevronLeft, ChevronRight } from 'lucide-react';
import ScoreGauge from '@/components/ScoreGauge';
// Import all headline image files
import imgH1 from '@/assets/headlines/H1.png';   // WSJ: Ad revenue plunges, AI cannibalizing queries
import imgH2 from '@/assets/headlines/H2.png';   // Alphabet stock plunges 8%
import imgH3 from '@/assets/headlines/H3.png';   // CFO warns: ad model unprecedented pressure
import imgH4 from '@/assets/headlines/H4.png';   // CFO confirms: advertiser flight, CTR collapse
import imgH5 from '@/assets/headlines/H5.png';   // Perplexity AI user growth explodes
import imgH6 from '@/assets/headlines/H6.png';   // Gen Z abandons Google for ChatGPT/Claude
import imgH7 from '@/assets/headlines/H7.png';   // Google search stuck in 2015, Reddit thread
import imgH8 from '@/assets/headlines/H8.png';   // Google strikes balance, AI-enhanced search
import imgH9 from '@/assets/headlines/H9.png';   // Analysts praise Google, stock all-time high
import imgH10 from '@/assets/headlines/H10.png'; // AI overview wins users, advertisers happy
import imgH11 from '@/assets/headlines/H11.png'; // OpenAI launches ChatGPT ads platform
import imgH12 from '@/assets/headlines/H12.png'; // Perplexity ad-free model, 50M subscribers
import imgH13 from '@/assets/headlines/H13.png'; // Google retains search dominance
import imgH14 from '@/assets/headlines/H14.png'; // SEO industry crisis, organic traffic -40%
import imgH15 from '@/assets/headlines/H15.png'; // Local businesses report drop in foot traffic

// Map headline IDs → correct image based on content match
const HEADLINE_IMAGES: Record<string, string> = {
  H1:  imgH1,   // "Google Ad Revenue Plunges..." (WSJ) → ad revenue plunges image
  H2:  imgH2,   // "Alphabet Stock Drops 12%..." (Bloomberg) → stock plunges image
  H3:  imgH4,   // "Advertisers Flee Google..." (AdAge) → advertiser flight image
  H4:  imgH7,   // "Google Search Users Revolt..." (The Verge) → Reddit stuck in 2015
  H5:  imgH6,   // "User Satisfaction All-Time Low..." (TechCrunch) → Gen Z abandons Google
  H6:  imgH5,   // "Perplexity CEO: Handing Us Market..." (CNBC) → Perplexity growth explodes
  H7:  imgH11,  // "ChatGPT Search Surges 40%..." (Reuters) → OpenAI ChatGPT ads platform
  H8:  imgH3,   // "Google Walks AI Tightrope..." (NYT) → CFO warns, ad model pressure
  H9:  imgH14,  // "Analysts Warn: Years to Monetize..." (FT) → SEO crisis, traffic drops
  H10: imgH8,   // "Bold AI Bet Pays Off..." (TechCrunch) → Google strikes balance
  H11: imgH9,   // "Wall Street Applauds..." (WSJ) → analysts praise, stock all-time high
  H12: imgH10,  // "AI and Ads Can Coexist..." (Bloomberg) → AI overview wins + advertisers happy
  H13: imgH9,   // "Pichai's Masterclass..." (Forbes) → analysts praise, stock high
  H14: imgH10,  // "AI Overview Wins Users..." (Wired) → AI overview wins users
  H15: imgH13,  // "Google Maintains Dominance..." (The Information) → Google retains dominance
  H16: imgH13,  // "OpenAI Struggles to Compete..." (Ars Technica) → competitors struggle
};

export default function ResultsScreen() {
  const { state, dispatch } = useGame();
  const lastExp = state.experiments[state.experiments.length - 1];
  const newsScrollRef = useRef<HTMLDivElement>(null);
  if (!lastExp) return null;

  const { userSatisfaction: us, adRevenue: ar } = lastExp;
  const headlines = getHeadlines(us, ar);
  const expNum = state.experiments.length;
  const boardAlert = us < 40 || ar < 40;
  const prevExperiments = state.experiments;

  const handleNext = () => {
    dispatch({ type: 'SET_STRATEGY', strategy: { ...lastExp.strategy } });
    dispatch({ type: 'SET_SCREEN', screen: 'experiment' });
  };

  const handleSubmit = () => {
    dispatch({ type: 'SET_STRATEGY', strategy: { ...lastExp.strategy } });
    dispatch({ type: 'SET_SCREEN', screen: 'final' });
  };

  const scrollNews = (direction: 'left' | 'right') => {
    newsScrollRef.current?.scrollBy({
      left: direction === 'left' ? -420 : 420,
      behavior: 'smooth',
    });
  };

  const revealedTypes: string[] = [];
  if (expNum >= 2) revealedTypes.push('informational', 'transactional');
  if (expNum >= 3) revealedTypes.push('navigational', 'local');

  const DeltaIcon = ({ current, previous }: { current: number; previous: number }) => {
    if (current > previous) return <TrendingUp className="w-4 h-4 text-success inline" />;
    if (current < previous) return <TrendingDown className="w-4 h-4 text-destructive inline" />;
    return <Minus className="w-4 h-4 text-muted-foreground inline" />;
  };

  return (
    <div className="min-h-screen bg-background p-8 pt-20">
      <div className="max-w-5xl mx-auto space-y-8 animate-fade-in">
        <div className="flex justify-between items-start">
          <h1 className="text-3xl font-bold text-foreground">
            Experiment {expNum} Results
          </h1>

          {prevExperiments.length > 1 && (
            <div className="flex gap-3">
              {prevExperiments.slice(0, -1).map((exp, i) => (
                <div key={i} className="stat-card text-center text-sm px-4 py-3">
                  <p className="text-muted-foreground text-xs mb-1">Exp {i + 1}</p>
                  <p>US: <span className="font-semibold text-google-blue">{exp.userSatisfaction}</span></p>
                  <p>AR: <span className="font-semibold text-google-green">{exp.adRevenue}</span></p>
                </div>
              ))}
            </div>
          )}
        </div>

        {boardAlert && (
          <div className="bg-destructive/10 border border-destructive/50 rounded-lg p-4 text-center">
            <p className="text-destructive font-bold text-lg">🚨 BOARD ALERT</p>
            <p className="text-destructive/80 text-sm">
              The board demands immediate action. You must submit your final strategy now.
            </p>
          </div>
        )}

        <div className="flex justify-center gap-16">
          <div className="flex flex-col items-center">
            <ScoreGauge label="User Satisfaction" value={us} color="hsl(var(--google-blue))" />
            {prevExperiments.length > 1 && (
              <span className="text-muted-foreground text-sm mt-2">
                vs Exp {expNum - 1}: <DeltaIcon current={us} previous={prevExperiments[expNum - 2].userSatisfaction} />
              </span>
            )}
          </div>
          <div className="flex flex-col items-center">
            <ScoreGauge label="Ad Revenue" value={ar} color="hsl(var(--google-green))" />
            {prevExperiments.length > 1 && (
              <span className="text-muted-foreground text-sm mt-2">
                vs Exp {expNum - 1}: <DeltaIcon current={ar} previous={prevExperiments[expNum - 2].adRevenue} />
              </span>
            )}
          </div>
        </div>

        {headlines.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">News Feed</h3>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => scrollNews('left')}
                  className="h-8 w-8 rounded-full border border-border bg-card text-foreground hover-scale flex items-center justify-center"
                  aria-label="Scroll news left"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => scrollNews('right')}
                  className="h-8 w-8 rounded-full border border-border bg-card text-foreground hover-scale flex items-center justify-center"
                  aria-label="Scroll news right"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div
              ref={newsScrollRef}
              className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory scroll-smooth"
            >
              {headlines.map((h, i) => (
                <article key={i} className="stat-card min-w-[360px] max-w-[360px] flex-shrink-0 snap-start flex flex-col gap-3">
                  <div className="flex items-start gap-3">
                    <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded font-mono">{h.source}</span>
                    <p className="text-foreground text-sm">{h.headline}</p>
                  </div>
                  <img
                    src={HEADLINE_IMAGES[h.id] || H1}
                    alt={h.headline}
                    loading="lazy"
                    className="w-full h-44 rounded-md border border-border object-cover"
                  />
                </article>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Search Type Insights</h3>
          {expNum === 1 ? (
            <div className="stat-card">
              <p className="text-muted-foreground text-sm italic">Insufficient data — aggregate metrics only.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {SEARCH_TYPES.map(st => {
                if (st.key === 'research') {
                  return (
                    <div key={st.key} className="stat-card">
                      <p className="text-sm font-semibold text-foreground">{st.label}</p>
                      <p className="text-xs text-muted-foreground italic mt-1">Data inconclusive. Market still evolving.</p>
                    </div>
                  );
                }
                if (!revealedTypes.includes(st.key)) {
                  return (
                    <div key={st.key} className="stat-card">
                      <p className="text-sm font-semibold text-foreground">{st.label}</p>
                      <p className="text-xs text-muted-foreground italic mt-1">Data not yet available.</p>
                    </div>
                  );
                }
                const alloc = lastExp.strategy[st.key];
                const table = { navigational: { bl: [75,90], ao: [55,60], am: [40,15] }, informational: { bl: [45,70], ao: [90,50], am: [85,20] }, transactional: { bl: [60,95], ao: [65,60], am: [70,15] }, local: { bl: [55,85], ao: [80,60], am: [70,20] } } as any;
                const t = table[st.key];
                if (!t) return null;
                const typeUS = (alloc.blueLinks / 100) * t.bl[0] + (alloc.aiOverview / 100) * t.ao[0] + (alloc.aiMode / 100) * t.am[0];
                const typeAR = (alloc.blueLinks / 100) * t.bl[1] + (alloc.aiOverview / 100) * t.ao[1] + (alloc.aiMode / 100) * t.am[1];
                return (
                  <div key={st.key} className="stat-card">
                    <p className="text-sm font-semibold text-foreground mb-2">{st.label}</p>
                    <div className="space-y-2">
                      <div>
                        <div className="flex justify-between text-xs mb-0.5">
                          <span className="text-muted-foreground">User Satisfaction</span>
                          <span className="font-mono text-google-blue">{Math.round(typeUS)}</span>
                        </div>
                        <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-google-blue rounded-full transition-all" style={{ width: `${typeUS}%` }} />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-xs mb-0.5">
                          <span className="text-muted-foreground">Ad Revenue</span>
                          <span className="font-mono text-google-green">{Math.round(typeAR)}</span>
                        </div>
                        <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-google-green rounded-full transition-all" style={{ width: `${typeAR}%` }} />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex justify-center gap-4 pt-4">
          {!boardAlert && state.currentExperiment <= 3 && (
            <button onClick={handleNext} className="game-button-primary">Next Experiment</button>
          )}
          {boardAlert ? (
            <button onClick={handleSubmit} className="game-button bg-destructive text-destructive-foreground hover:brightness-110">
              Submit Final Strategy
            </button>
          ) : (
            <button onClick={handleSubmit} className="game-button-secondary">Submit Final Strategy</button>
          )}
        </div>
      </div>
    </div>
  );
}
