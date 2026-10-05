import news from '@/data/news.json';
import CloudTitle from '@/components/CloudTitle';
import GazetteFeed from '@/components/GazetteFeed';
import { Paragraph, paragraphs, readMinutes } from '@/components/news/NewsBody';

type Entry = (typeof news)[number];

// chip = tag pill, accent = card's left edge, bar = featured post's top stripe.
const tagStyles: Record<string, { chip: string; accent: string; bar: string }> = {
  Event: { chip: 'bg-xp/10 text-xp', accent: 'border-l-xp', bar: 'bg-xp' },
  'Plugin Update': { chip: 'bg-enchant/10 text-enchant', accent: 'border-l-enchant', bar: 'bg-enchant' },
  'Rule Change': { chip: 'bg-redstone/10 text-redstone', accent: 'border-l-redstone', bar: 'bg-redstone' },
  'Map Expansion': { chip: 'bg-gold/10 text-gold', accent: 'border-l-gold', bar: 'bg-gold' },
  'Site Update': { chip: 'bg-diamond/10 text-diamond', accent: 'border-l-diamond', bar: 'bg-diamond' },
  'Version Update': { chip: 'bg-grass/10 text-grass', accent: 'border-l-grass', bar: 'bg-grass' },
};
const fallbackStyle = { chip: 't-surface t-text-muted', accent: 't-border', bar: 'bg-oak' };
const styleFor = (tag: string | undefined) => (tag && tagStyles[tag]) || fallbackStyle;

// Dates in news.json are calendar days, so format in UTC — local-time parsing
// would show the day before on the Pi.
const fmt = (date: string, opts: Intl.DateTimeFormatOptions) =>
  new Date(date).toLocaleDateString('en-US', { timeZone: 'UTC', ...opts });

// Posts longer than this show their first paragraphs and fold the rest.
const FOLD_WORDS = 160;
const FOLD_KEEP = 2;

function Tags({ tags }: { tags: string[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => (
        <span key={tag} className={`px-2 py-0.5 text-[10px] font-pixel rounded ${styleFor(tag).chip}`}>
          {tag}
        </span>
      ))}
    </div>
  );
}

function Meta({ entry }: { entry: Entry }) {
  return (
    <span className="t-text-muted text-xs">
      {fmt(entry.date, { month: 'short', day: 'numeric', year: 'numeric' })} · {readMinutes(entry.body)} min read
    </span>
  );
}

function Body({ entry, fold }: { entry: Entry; fold: boolean }) {
  const paras = paragraphs(entry.body);
  const folds = fold && paras.length > FOLD_KEEP + 1 && entry.body.split(/\s+/).length > FOLD_WORDS;
  const shown = folds ? paras.slice(0, FOLD_KEEP) : paras;
  const hidden = folds ? paras.slice(FOLD_KEEP) : [];

  return (
    <div className="space-y-3">
      {shown.map((p, i) => (
        <Paragraph key={i} text={p} lede={i === 0} />
      ))}
      {hidden.length > 0 && (
        <details className="group">
          <summary className="list-none cursor-pointer inline-flex items-center gap-2 font-pixel text-[10px] text-gold hover:underline focus-visible:underline active:opacity-70 [&::-webkit-details-marker]:hidden">
            <span className="transition-transform group-open:rotate-90">▶</span>
            <span className="group-open:hidden">Keep reading ({hidden.length} more)</span>
            <span className="hidden group-open:inline">Show less</span>
          </summary>
          <div className="space-y-3 mt-3">
            {hidden.map((p, i) => (
              <Paragraph key={i} text={p} />
            ))}
          </div>
        </details>
      )}
    </div>
  );
}

function Featured({ entry }: { entry: Entry }) {
  return (
    <article className="mc-panel overflow-hidden mb-12">
      <div className="flex h-1.5">
        {entry.tags.map((tag) => (
          <div key={tag} className={`flex-1 ${styleFor(tag).bar}`} />
        ))}
      </div>
      <div className="p-6 sm:p-8">
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <span className="px-2 py-1 font-pixel text-[10px] rounded bg-gold text-black">Latest</span>
          <Meta entry={entry} />
        </div>
        <h2 className="font-pixel t-text text-sm sm:text-base leading-relaxed mb-5">{entry.title}</h2>
        <div className="mb-5">
          <Body entry={entry} fold={false} />
        </div>
        <Tags tags={entry.tags} />
      </div>
    </article>
  );
}

function TimelineItem({ entry }: { entry: Entry }) {
  return (
    <li className="relative grid grid-cols-[3.5rem_1fr] max-md:grid-cols-[3rem_1fr] gap-4 max-md:gap-3">
      <div className="inventory-slot relative z-10 h-14 max-md:h-12 flex flex-col items-center justify-center">
        <span className="font-pixel text-[8px] t-text-muted uppercase">{fmt(entry.date, { month: 'short' })}</span>
        <span className="font-pixel text-sm t-text mt-1">{fmt(entry.date, { day: 'numeric' })}</span>
      </div>
      <article className={`mc-panel border-l-4 ${styleFor(entry.tags[0]).accent} p-5 max-md:p-4 min-w-0`}>
        <h3 className="font-pixel t-text text-xs leading-relaxed mb-1">{entry.title}</h3>
        <div className="mb-4">
          <Meta entry={entry} />
        </div>
        <div className="mb-4">
          <Body entry={entry} fold />
        </div>
        <Tags tags={entry.tags} />
      </article>
    </li>
  );
}

export default function NewsPage() {
  const sorted = [...news].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const [latest, ...rest] = sorted;

  const months: { label: string; entries: Entry[] }[] = [];
  for (const entry of rest) {
    const label = fmt(entry.date, { month: 'long', year: 'numeric' });
    const group = months[months.length - 1];
    if (group?.label === label) group.entries.push(entry);
    else months.push({ label, entries: [entry] });
  }

  return (
    <div>
      <section className="max-w-3xl mx-auto px-4 py-16">
        <div className="text-center">
          <CloudTitle><h1 className="font-pixel text-gold text-2xl sm:text-3xl mb-8 glow-gold">News & Changelog</h1></CloudTitle>
        </div>

        <GazetteFeed />

        {latest && <Featured entry={latest} />}

        {months.map((month) => (
          <div key={month.label} className="mb-10">
            <div className="flex items-center gap-3 mb-5">
              <div className="grass-divider flex-1" />
              <h2 className="font-pixel text-[10px] t-text-muted uppercase">{month.label}</h2>
              <div className="grass-divider flex-1" />
            </div>
            <ol className="relative space-y-5 before:absolute before:left-7 max-md:before:left-6 before:top-0 before:bottom-0 before:w-px before:bg-[var(--c-border)]">
              {month.entries.map((entry) => (
                <TimelineItem key={entry.id} entry={entry} />
              ))}
            </ol>
          </div>
        ))}

        {sorted.length === 0 && (
          <div className="text-center py-12">
            <p className="t-text-muted font-pixel text-xs">No news yet. Check back soon!</p>
          </div>
        )}
      </section>
    </div>
  );
}
