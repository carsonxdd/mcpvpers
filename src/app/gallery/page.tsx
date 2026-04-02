'use client';

import { useState } from 'react';
import CloudTitle from '@/components/CloudTitle';
import CloudTextTiny from '@/components/CloudTextTiny';

const tags = ['All', 'Builds', 'Landscapes', 'Events', 'Funny Moments'] as const;

const galleryItems = [
  { id: 1, src: '', alt: 'Epic Castle Build', tag: 'Builds' },
  { id: 2, src: '', alt: 'Sunset over the Mesa', tag: 'Landscapes' },
  { id: 3, src: '', alt: 'Community Event', tag: 'Events' },
  { id: 4, src: '', alt: 'Creeper Surprise', tag: 'Funny Moments' },
  { id: 5, src: '', alt: 'Underground Base', tag: 'Builds' },
  { id: 6, src: '', alt: 'Cherry Grove', tag: 'Landscapes' },
];

export default function GalleryPage() {
  const [activeTag, setActiveTag] = useState<string>('All');
  const [lightboxItem, setLightboxItem] = useState<number | null>(null);

  const filtered = activeTag === 'All' ? galleryItems : galleryItems.filter((item) => item.tag === activeTag);

  return (
    <div>
      <section className="max-w-5xl mx-auto px-4 py-16">
        <div className="text-center"><CloudTitle size="large"><h1 className="font-pixel text-gold text-2xl sm:text-3xl mb-4 glow-gold">Gallery</h1></CloudTitle></div>
        <CloudTextTiny className="text-center mb-8">
          <p className="t-text-dim">
            Screenshots from the server. Want to submit yours? Share in our Discord!
          </p>
        </CloudTextTiny>

        <div className="flex flex-wrap justify-center gap-1.5 mb-8">
          {tags.map((tag) => (
            <button key={tag} onClick={() => setActiveTag(tag)}
              className={`mc-pill ${activeTag === tag ? 'mc-pill-active' : ''}`}>
              {tag}
            </button>
          ))}
        </div>

        <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
          {filtered.map((item) => (
            <div key={item.id}
              className="mc-panel overflow-hidden cursor-pointer transition-all break-inside-avoid gradient-border"
              onClick={() => setLightboxItem(item.id)}>
              <div className="t-surface flex items-center justify-center"
                style={{ height: `${150 + (item.id % 3) * 60}px` }}>
                <span className="font-pixel t-text-muted-50 text-[10px]">{item.alt}</span>
              </div>
              <div className="p-3">
                <p className="t-text-dim text-xs">{item.alt}</p>
                <span className="text-[10px] text-enchant">{item.tag}</span>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12">
            <p className="t-text-muted font-pixel text-xs">No screenshots in this category yet.</p>
          </div>
        )}
      </section>

      {lightboxItem !== null && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setLightboxItem(null)}>
          <div className="mc-panel p-4 max-w-3xl w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-3">
              <span className="font-pixel text-gold text-xs">
                {galleryItems.find((i) => i.id === lightboxItem)?.alt}
              </span>
              <button onClick={() => setLightboxItem(null)}
                className="t-text-muted hover:t-text cursor-pointer text-sm">✕</button>
            </div>
            <div className="t-surface flex items-center justify-center rounded-md" style={{ height: '400px' }}>
              <span className="font-pixel t-text-muted-50 text-xs">Screenshot placeholder</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
