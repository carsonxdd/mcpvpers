import news from '@/data/news.json';
import CloudTitle from '@/components/CloudTitle';

const tagColors: Record<string, string> = {
  Event: 'bg-xp/10 text-xp',
  'Plugin Update': 'bg-enchant/10 text-enchant',
  'Rule Change': 'bg-redstone/10 text-redstone',
  'Map Expansion': 'bg-gold/10 text-gold',
};

export default function NewsPage() {
  const sorted = [...news].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div>
      <section className="max-w-3xl mx-auto px-4 py-16">
        <div className="text-center">
          <CloudTitle><h1 className="font-pixel text-gold text-2xl sm:text-3xl mb-8 glow-gold">News & Changelog</h1></CloudTitle>
        </div>

        <div className="space-y-5">
          {sorted.map((entry) => (
            <article key={entry.id} className="mc-panel p-6">
              <div className="flex items-start justify-between gap-4 mb-3">
                <h2 className="font-pixel t-text text-xs">{entry.title}</h2>
                <time className="t-text-muted text-xs font-pixel shrink-0">
                  {new Date(entry.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </time>
              </div>

              <p className="t-text-dim text-sm leading-relaxed mb-3">{entry.body}</p>

              <div className="flex gap-2">
                {entry.tags.map((tag) => (
                  <span key={tag}
                    className={`px-2 py-0.5 text-[10px] font-pixel rounded ${tagColors[tag] || 't-surface t-text-muted'}`}>
                    {tag}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>

        {sorted.length === 0 && (
          <div className="text-center py-12">
            <p className="t-text-muted font-pixel text-xs">No news yet. Check back soon!</p>
          </div>
        )}
      </section>
    </div>
  );
}
