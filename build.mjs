#!/usr/bin/env node
/**
 * build.mjs — genera posts.json y feed.xml a partir de los .md de /posts.
 * Sin dependencias. Ejecuta:  node build.mjs
 *
 * Cada post (posts/*.md) debe empezar con un frontmatter:
 *   ---
 *   title: "Título del post"
 *   date: 2026-06-15
 *   tags: [IA, Datos]
 *   excerpt: "Frase de gancho."
 *   updated: 2026-06-20   # opcional; si falta, se usa la fecha del último commit
 *   ---
 *   ...cuerpo en Markdown...
 */
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { execSync } from 'node:child_process';
import path from 'node:path';

// ---- Configura aquí tu sitio ----
const SITE = {
  url: 'https://runando.github.io',
  title: 'Fernando Vivas — Blog',
  description: 'IA en lo público, IoT y LoRaWAN, datos, arquitectura de software y más.',
  author: 'Fernando Vivas'
};

const POSTS_DIR = 'posts';

function parseFrontmatter(raw) {
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  const meta = {};
  let body = raw;
  if (m) {
    body = raw.slice(m[0].length);
    for (const line of m[1].split(/\r?\n/)) {
      const idx = line.indexOf(':');
      if (idx === -1) continue;
      const key = line.slice(0, idx).trim();
      let val = line.slice(idx + 1).trim();
      if (key === 'tags') {
        val = val.replace(/^\[|\]$/g, '');
        meta.tags = val.split(',').map(s => s.trim().replace(/^["']|["']$/g, '')).filter(Boolean);
      } else {
        meta[key] = val.replace(/^["']|["']$/g, '');
      }
    }
  }
  return { meta, body };
}

function gitLastModified(file) {
  try {
    const iso = execSync(`git log -1 --format=%cI -- "${file}"`, { stdio: ['ignore', 'pipe', 'ignore'] })
      .toString().trim();
    return iso ? iso.slice(0, 10) : null;
  } catch { return null; }
}

function firstParagraph(body) {
  const txt = body.replace(/^#.*$/gm, '').replace(/[#>*_`-]/g, '').trim();
  const p = txt.split(/\n\s*\n/).map(s => s.trim()).find(Boolean) || '';
  return p.length > 160 ? p.slice(0, 157).trimEnd() + '…' : p;
}

function rfc822(dateStr) {
  return new Date(dateStr + 'T09:00:00Z').toUTCString();
}

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// ---- Leer posts ----
const files = readdirSync(POSTS_DIR).filter(f => f.endsWith('.md'));
const posts = [];

for (const f of files) {
  const full = path.join(POSTS_DIR, f);
  const raw = readFileSync(full, 'utf8');
  const { meta, body } = parseFrontmatter(raw);
  if (String(meta.draft || '').toLowerCase() === 'true') continue; // borradores: no se publican
  const slug = f.replace(/\.md$/, '');
  const date = meta.date || gitLastModified(full) || new Date().toISOString().slice(0, 10);
  const updated = meta.updated || gitLastModified(full) || date;
  posts.push({
    slug,
    title: meta.title || slug,
    date,
    updated,
    tags: meta.tags || [],
    excerpt: meta.excerpt || firstParagraph(body),
    file: `${POSTS_DIR}/${f}`
  });
}

posts.sort((a, b) => (b.date || '').localeCompare(a.date || ''));

// ---- posts.json ----
writeFileSync('posts.json', JSON.stringify(posts, null, 2) + '\n');

// ---- feed.xml (RSS 2.0) ----
const lastBuild = new Date().toUTCString();
const items = posts.map(p => {
  const link = `${SITE.url}/#/post/${encodeURIComponent(p.slug)}`;
  return `    <item>
      <title>${esc(p.title)}</title>
      <link>${link}</link>
      <guid isPermaLink="false">${link}</guid>
      <pubDate>${rfc822(p.date)}</pubDate>
      ${p.tags.map(t => `<category>${esc(t)}</category>`).join('\n      ')}
      <description>${esc(p.excerpt)}</description>
    </item>`;
}).join('\n');

const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${esc(SITE.title)}</title>
    <link>${SITE.url}/</link>
    <atom:link href="${SITE.url}/feed.xml" rel="self" type="application/rss+xml" />
    <description>${esc(SITE.description)}</description>
    <language>es</language>
    <lastBuildDate>${lastBuild}</lastBuildDate>
${items}
  </channel>
</rss>
`;
writeFileSync('feed.xml', rss);

console.log(`OK · ${posts.length} posts → posts.json + feed.xml`);
