import type { APIRoute, GetStaticPaths } from 'astro';
import { getCollection } from 'astro:content';

export const getStaticPaths: GetStaticPaths = async () => {
  const posts = await getCollection('blog');
  return posts.map((post) => ({
    params: { id: post.id },
    props: { post },
  }));
};

export const GET: APIRoute = async ({ props }) => {
  const { post } = props as any;

  const title = post.data.title;
  const date = post.data.date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const tag = (post.data.tags?.[0] || 'Blog').toUpperCase();

  // Wrap title text for SVG
  function wrapText(text: string, maxCharsPerLine: number): string[] {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    words.forEach((word: string) => {
      if ((currentLine + ' ' + word).trim().length <= maxCharsPerLine) {
        currentLine = (currentLine + ' ' + word).trim();
      } else {
        if (currentLine) lines.push(currentLine);
        currentLine = word;
      }
    });
    if (currentLine) lines.push(currentLine);
    return lines.slice(0, 3);
  }

  const titleLines = wrapText(title, 30);

  const svg = `<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0a0a0a;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#161616;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#7B2FBE;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#D4AF37;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect x="0" y="0" width="1200" height="6" fill="url(#accent)"/>
  <rect x="80" y="80" width="${tag.length * 14 + 40}" height="36" rx="18" fill="rgba(123,47,190,0.3)" stroke="#7B2FBE" stroke-width="1"/>
  <text x="${80 + (tag.length * 14 + 40) / 2}" y="104" text-anchor="middle" font-family="Inter, system-ui, sans-serif" font-size="14" font-weight="600" fill="#9B4FDE" letter-spacing="2">${tag}</text>
  ${titleLines.map((line: string, i: number) => `<text x="80" y="${180 + i * 64}" font-family="Inter, system-ui, sans-serif" font-size="52" font-weight="800" fill="#D4AF37">${line}</text>`).join('\n  ')}
  <text x="80" y="${180 + titleLines.length * 64 + 40}" font-family="Inter, system-ui, sans-serif" font-size="18" fill="#808080">${date}</text>
  <line x1="80" y1="520" x2="1120" y2="520" stroke="#2A2A2A" stroke-width="1"/>
  <text x="80" y="560" font-family="Inter, system-ui, sans-serif" font-size="22" font-weight="700" fill="#FAFAFA">LIAM</text>
  <text x="158" y="560" font-family="Inter, system-ui, sans-serif" font-size="22" font-weight="700" fill="#D4AF37">EYRES</text>
  <text x="80" y="586" font-family="Inter, system-ui, sans-serif" font-size="14" fill="#808080">liameyres.co.uk</text>
  <rect x="0" y="624" width="1200" height="6" fill="url(#accent)"/>
</svg>`;

  return new Response(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
};
