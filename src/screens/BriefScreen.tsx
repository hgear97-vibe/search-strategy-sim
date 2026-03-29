import { useGame } from '@/game/GameContext';
import { emptyStrategy } from '@/game/engine';

export default function BriefScreen() {
  const { dispatch } = useGame();

  const stats = [
    { title: 'Google Search Ad Revenue', value: '$198B/year', sub: '77% of Alphabet total revenue' },
    { title: 'Competitive Threat', value: 'Critical', sub: 'Perplexity, ChatGPT, Claude growing 30%+ MoM' },
    { title: 'Pew Research Finding', value: '47% decline', sub: 'Users 47% less likely to click links with AI summaries' },
  ];

  const modes = [
    { name: 'Blue Links', desc: 'Traditional 10 blue links + ads', color: 'text-primary' },
    { name: 'AI Overview', desc: 'AI summary with links below', color: 'text-google-blue' },
    { name: 'AI Mode', desc: 'Full Gemini chat, no links', color: 'text-google-green' },
  ];

  return (
    <div className="min-h-screen bg-background p-8 pt-20">
      <div className="max-w-5xl mx-auto space-y-8 animate-fade-in">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-foreground">CEO Morning Brief</h1>
          <p className="text-muted-foreground mt-2">Good morning, Sundar. Here's what you need to know.</p>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {stats.map((s, i) => (
            <div key={i} className="stat-card">
              <p className="text-sm text-muted-foreground mb-1">{s.title}</p>
              <p className="text-2xl font-bold text-foreground">{s.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{s.sub}</p>
            </div>
          ))}
        </div>

        <div className="stat-card">
          <p className="text-sm text-muted-foreground mb-3">Three Search Modes</p>
          <div className="grid grid-cols-3 gap-4">
            {modes.map(m => (
              <div key={m.name} className="bg-background rounded-lg p-4 border border-border">
                <p className={`font-semibold ${m.color}`}>{m.name}</p>
                <p className="text-sm text-muted-foreground mt-1">{m.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="stat-card border-primary/30 bg-primary/5">
          <p className="text-sm text-primary font-semibold mb-1">🎯 Your Mission</p>
          <p className="text-foreground">
            Allocate search traffic across modes. Balance <span className="font-semibold text-google-blue">User Satisfaction</span> and{' '}
            <span className="font-semibold text-google-green">Ad Revenue</span>. You have <span className="font-bold">3 experiments</span>.
          </p>
        </div>

        <div className="text-center">
          <button
            onClick={() => {
              dispatch({ type: 'SET_STRATEGY', strategy: emptyStrategy() });
              dispatch({ type: 'SET_SCREEN', screen: 'experiment' });
            }}
            className="game-button-primary text-lg px-12 py-4"
          >
            Begin
          </button>
        </div>
      </div>
    </div>
  );
}
