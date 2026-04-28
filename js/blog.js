/* ============================================================
   ODU ACTIVE — BLOG.JS
   Powers blog.html (listing) and post.html (single post)
   Built by Nesture
   ============================================================ */

'use strict';

// ── SHARED: LOAD POSTS ────────────────────────────────────
async function loadPosts() {
  try {
    const res  = await fetch('./data/posts.json');
    const data = await res.json();
    return data.posts.filter(p => p.published);
  } catch {
    return [];
  }
}

// ── FORMAT DATE ───────────────────────────────────────────
function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

// ── CATEGORY COLOR ────────────────────────────────────────
function catColor(cat) {
  const map = { Training: '#E8440A', Nutrition: '#22c55e', 'Client Stories': '#3b82f6' };
  return map[cat] || '#9AA0A8';
}

// ── HTML ESCAPE (for safe interpolation) ──────────────────
function esc(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// ═══════════════════════════════════════
// BLOG LISTING PAGE (blog.html)
// ═══════════════════════════════════════
const featuredWrap = document.getElementById('featuredWrap');
const postGrid     = document.getElementById('postGrid');
const blogEmpty    = document.getElementById('blogEmpty');
const filterBtns   = document.querySelectorAll('.blog-filter__btn');

if (featuredWrap || postGrid) {
  let allPosts     = [];
  let activeFilter = 'all';

  // Check if URL has category param
  const urlCat = new URLSearchParams(window.location.search).get('cat');
  if (urlCat) activeFilter = urlCat;

  loadPosts().then(posts => {
    allPosts = posts;
    renderListing(allPosts, activeFilter);

    // Set active filter button
    filterBtns.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.cat === activeFilter);
    });
  });

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      activeFilter = btn.dataset.cat;
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderListing(allPosts, activeFilter);
    });
  });
}

function renderListing(posts, filter) {
  const filtered = filter === 'all' ? posts : posts.filter(p => p.category === filter);

  if (filtered.length === 0) {
    if (featuredWrap) featuredWrap.innerHTML = '';
    if (postGrid)     postGrid.innerHTML     = '';
    if (blogEmpty)    blogEmpty.style.display = '';
    return;
  }

  if (blogEmpty) blogEmpty.style.display = 'none';

  // Featured post — first featured flag, otherwise newest by date, otherwise first
  let featured = filtered.find(p => p.featured);
  if (!featured) {
    featured = [...filtered].sort((a, b) => new Date(b.date) - new Date(a.date))[0];
  }
  const rest = filtered.filter(p => p.id !== featured.id);

  if (featuredWrap) {
    featuredWrap.innerHTML = `
      <a href="post.html?id=${encodeURIComponent(featured.id)}" class="featured-post">
        <div class="featured-post__image">
          <img src="${esc(featured.image)}" alt="${esc(featured.title)}" loading="lazy"/>
          <div class="featured-post__overlay"></div>
        </div>
        <div class="featured-post__content">
          <div class="featured-post__meta">
            <span class="post-cat" style="--cat-color:${catColor(featured.category)}">${esc(featured.category)}</span>
            <span class="featured-post__sep">·</span>
            <span class="featured-post__date">${formatDate(featured.date)}</span>
            <span class="featured-post__sep">·</span>
            <span class="featured-post__read">${esc(featured.readTime)}</span>
          </div>
          <h2 class="featured-post__title">${esc(featured.title)}</h2>
          <p class="featured-post__excerpt">${esc(featured.excerpt)}</p>
          <span class="featured-post__cta">Read Article →</span>
        </div>
      </a>
    `;
  }

  if (postGrid) {
    postGrid.innerHTML = rest.map(post => `
      <a href="post.html?id=${encodeURIComponent(post.id)}" class="post-card">
        <div class="post-card__image">
          <img src="${esc(post.image)}" alt="${esc(post.title)}" loading="lazy"/>
        </div>
        <div class="post-card__body">
          <div class="post-card__meta">
            <span class="post-cat" style="--cat-color:${catColor(post.category)}">${esc(post.category)}</span>
            <span class="post-card__read">${esc(post.readTime)}</span>
          </div>
          <h3 class="post-card__title">${esc(post.title)}</h3>
          <p class="post-card__excerpt">${esc(post.excerpt)}</p>
          <div class="post-card__footer">
            <span class="post-card__date">${formatDate(post.date)}</span>
            <span class="post-card__arrow">→</span>
          </div>
        </div>
      </a>
    `).join('');
  }
}

// ═══════════════════════════════════════
// SINGLE POST PAGE (post.html)
// ═══════════════════════════════════════
const postContent = document.getElementById('postContent');
const relatedGrid = document.getElementById('relatedGrid');

if (postContent) {
  const postId = new URLSearchParams(window.location.search).get('id');

  loadPosts().then(posts => {
    const post = posts.find(p => p.id === postId);
    if (!post) {
      postContent.innerHTML = '<p class="post-body">Post not found. <a href="blog.html" class="text-orange">Back to blog</a></p>';
      return;
    }

    // Update page title and meta
    document.title = `${post.title} — ODU Active`;

    // Populate hero
    const heroImg = document.getElementById('postHeroImg');
    if (heroImg) { heroImg.src = post.image; heroImg.alt = post.title; }

    const postCatEl = document.getElementById('postCat');
    if (postCatEl) {
      postCatEl.textContent = post.category;
      postCatEl.style.setProperty('--cat-color', catColor(post.category));
    }

    const dateEl = document.getElementById('postDate');
    if (dateEl) dateEl.textContent = formatDate(post.date);

    const readEl = document.getElementById('postRead');
    if (readEl) readEl.textContent = post.readTime;

    const titleEl = document.getElementById('postTitle');
    if (titleEl) titleEl.textContent = post.title;

    // Render content blocks
    postContent.innerHTML = post.content.map(renderBlock).join('');

    // Related posts — same category, not this post
    if (relatedGrid) {
      const related = posts.filter(p => p.id !== post.id && p.category === post.category).slice(0, 3);
      if (related.length === 0) {
        const others = posts.filter(p => p.id !== post.id).slice(0, 3);
        renderRelated(others);
      } else {
        renderRelated(related);
      }
    }
  });
}

// ── RENDER A SINGLE CONTENT BLOCK ─────────────────────────
function renderBlock(block) {
  switch (block.type) {

    // Italic hero opener — sits right under the title in the article body
    case 'lead':
      return `<p class="post-lead">${esc(block.text)}</p>`;

    // Standard paragraph — preserves <em>, <strong> if present in source
    case 'paragraph':
      return `<p class="post-body">${block.text}</p>`;

    // H2 heading
    case 'heading':
      return `<h2 class="post-heading">${esc(block.text)}</h2>`;

    // Numbered factor block (Article 1 — "Factor 01" through "Factor 07")
    case 'factor': {
      const paras = (block.paragraphs || []).map(p => `<p class="post-body">${esc(p)}</p>`).join('');
      return `
        <section class="post-factor">
          <span class="post-factor__num">Factor ${esc(block.number)}</span>
          <h2 class="post-factor__title">${esc(block.title)}</h2>
          ${paras}
        </section>
      `;
    }

    // Pull quote with orange left border
    case 'quote':
    case 'blockquote':
      return `<blockquote class="post-quote">${esc(block.text)}</blockquote>`;

    // Bulleted list
    case 'list': {
      const items = (block.items || []).map(i => `<li>${esc(i)}</li>`).join('');
      return `<ul class="post-list">${items}</ul>`;
    }

    // 2 or 3-up stat row (Article 2 — metabolism, disease)
    case 'stat-row': {
      const stats = (block.stats || []).map(s => `
        <div class="post-stat">
          <div class="post-stat__value">${esc(s.value)}</div>
          <div class="post-stat__label">${esc(s.label)}</div>
        </div>
      `).join('');
      return `<div class="post-stat-row" data-count="${(block.stats || []).length}">${stats}</div>`;
    }

    // Responsive YouTube embed
    case 'video': {
      const id    = encodeURIComponent(block.youtubeId || '');
      const title = esc(block.title || 'Embedded video');
      return `
        <div class="post-video">
          <div class="post-video__frame">
            <iframe
              src="https://www.youtube.com/embed/${id}?rel=0&modestbranding=1"
              title="${title}"
              loading="lazy"
              frameborder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerpolicy="strict-origin-when-cross-origin"
              allowfullscreen></iframe>
          </div>
        </div>
      `;
    }

    // Horizontal rule
    case 'divider':
      return `<hr class="post-divider"/>`;

    // Branded CTA block — eyebrow, headline, body, button
    case 'cta': {
      const eyebrow  = block.eyebrow  ? `<span class="post-cta-block__eyebrow">${esc(block.eyebrow)}</span>` : '';
      const headline = block.headline ? `<h3 class="post-cta-block__headline">${esc(block.headline)}</h3>` : '';
      const text     = block.text     ? `<p>${esc(block.text)}</p>` : '';
      const link     = esc(block.link  || 'booking.html');
      const label    = esc(block.label || 'Learn More');
      return `
        <div class="post-cta-block">
          ${eyebrow}
          ${headline}
          ${text}
          <a href="${link}" class="btn btn--primary">${label}</a>
        </div>
      `;
    }

    default:
      return '';
  }
}

function renderRelated(posts) {
  if (!relatedGrid) return;
  relatedGrid.innerHTML = posts.map(post => `
    <a href="post.html?id=${encodeURIComponent(post.id)}" class="post-card reveal">
      <div class="post-card__image">
        <img src="${esc(post.image)}" alt="${esc(post.title)}" loading="lazy"/>
      </div>
      <div class="post-card__body">
        <div class="post-card__meta">
          <span class="post-cat" style="--cat-color:${catColor(post.category)}">${esc(post.category)}</span>
          <span class="post-card__read">${esc(post.readTime)}</span>
        </div>
        <h3 class="post-card__title">${esc(post.title)}</h3>
        <p class="post-card__excerpt">${esc(post.excerpt)}</p>
        <div class="post-card__footer">
          <span class="post-card__date">${formatDate(post.date)}</span>
          <span class="post-card__arrow">→</span>
        </div>
      </div>
    </a>
  `).join('');
}