'use client';

import { useActionState } from 'react';
import { createNewsPost, updateNewsPost, deleteNewsPost } from '@/lib/actions/news';
import type { ActionState } from '@/lib/actions/tenant';

export type NewsItem = {
  id: string;
  title: string;
  body: string;
  tags: string[];
  publishedAt: string;
};

const inputClass =
  't-surface t-text mt-2 w-full rounded border border-white/10 px-3 py-2 text-sm';

function PostCard({ slug, post }: { slug: string; post: NewsItem }) {
  const [updateState, updateAction, updating] = useActionState<ActionState, FormData>(updateNewsPost, null);
  const [, deleteAction, deleting] = useActionState<ActionState, FormData>(deleteNewsPost, null);

  return (
    <div className="mc-panel p-6">
      <p className="t-text-muted font-pixel text-[10px]">{post.publishedAt}</p>
      <form action={updateAction} className="mt-3 space-y-4">
        <input type="hidden" name="slug" value={slug} />
        <input type="hidden" name="id" value={post.id} />
        <input name="title" required maxLength={120} defaultValue={post.title} className={inputClass} aria-label="Post title" />
        <textarea name="body" required maxLength={8000} rows={5} defaultValue={post.body} className={inputClass} aria-label="Post body" />
        <input name="tags" maxLength={200} defaultValue={post.tags.join(', ')} placeholder="Tags, comma-separated" className={inputClass} aria-label="Post tags" />
        {updateState?.error && <p className="text-redstone text-xs">{updateState.error}</p>}
        <div className="flex gap-2">
          <button type="submit" disabled={updating} className="mc-pill cursor-pointer px-4 py-2 font-pixel text-[10px] disabled:opacity-50">
            {updating ? 'Saving…' : 'Save'}
          </button>
        </div>
      </form>
      <form
        action={deleteAction}
        className="mt-3 text-right"
        onSubmit={(e) => {
          if (!window.confirm('Delete this post?')) e.preventDefault();
        }}
      >
        <input type="hidden" name="slug" value={slug} />
        <input type="hidden" name="id" value={post.id} />
        <button type="submit" disabled={deleting} className="mc-pill cursor-pointer px-3 py-1.5 font-pixel text-[10px] text-redstone disabled:opacity-50">
          Delete
        </button>
      </form>
    </div>
  );
}

export default function NewsEditor({ slug, posts }: { slug: string; posts: NewsItem[] }) {
  const [createState, createAction, creating] = useActionState<ActionState, FormData>(createNewsPost, null);

  return (
    <div className="space-y-4">
      <div className="mc-panel p-6">
        <h2 className="font-pixel t-text text-xs">New post</h2>
        <form action={createAction} className="mt-4 space-y-4">
          <input type="hidden" name="slug" value={slug} />
          <input name="title" required maxLength={120} placeholder="Post title" className={inputClass} aria-label="New post title" />
          <textarea
            name="body"
            required
            maxLength={8000}
            rows={5}
            placeholder="What's new? Separate paragraphs with a blank line."
            className={inputClass}
            aria-label="New post body"
          />
          <input name="tags" maxLength={200} placeholder="Tags, comma-separated (optional)" className={inputClass} aria-label="New post tags" />
          {createState?.error && <p className="text-redstone text-xs">{createState.error}</p>}
          <button type="submit" disabled={creating} className="mc-pill cursor-pointer px-4 py-2 font-pixel text-[10px] disabled:opacity-50">
            {creating ? 'Publishing…' : 'Publish'}
          </button>
        </form>
      </div>

      {posts.map((post) => (
        <PostCard key={post.id} slug={slug} post={post} />
      ))}

      {posts.length === 0 && (
        <p className="t-text-muted py-4 text-center font-pixel text-xs">No posts yet.</p>
      )}
    </div>
  );
}
