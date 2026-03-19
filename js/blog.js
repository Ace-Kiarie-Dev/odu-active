/* ============================================================
   ODU ACTIVE — BLOG.JS
   Powers blog.html (listing) and post.html (single post)
   Built by Nesture
   ============================================================ */

'use strict';

const INLINE_POSTS = null; // will be replaced by fetch

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

  // Featured post — first featured flag or first post
  const featured = filtered.find(p => p.featured) || filtered[0];
  const rest     = filtered.filter(p => p.id !== featured.id);

  if (featuredWrap) {
    featuredWrap.innerHTML = `
      <a href="post.html?id=${featured.id}" class="featured-post">
        <div class="featured-post__image">
          <img src="${featured.image}" alt="${featured.title}" loading="lazy"/>
          <div class="featured-post__overlay"></div>
        </div>
        <div class="featured-post__content">
          <div class="featured-post__meta">
            <span class="post-cat" style="--cat-color:${catColor(featured.category)}">${featured.category}</span>
            <span class="featured-post__sep">·</span>
            <span class="featured-post__date">${formatDate(featured.date)}</span>
            <span class="featured-post__sep">·</span>
            <span class="featured-post__read">${featured.readTime}</span>
          </div>
          <h2 class="featured-post__title">${featured.title}</h2>
          <p class="featured-post__excerpt">${featured.excerpt}</p>
          <span class="featured-post__cta">Read Article →</span>
        </div>
      </a>
    `;
  }

  if (postGrid) {
    postGrid.innerHTML = rest.map(post => `
      <a href="post.html?id=${post.id}" class="post-card">
        <div class="post-card__image">
          <img src="${post.image}" alt="${post.title}" loading="lazy"/>
        </div>
        <div class="post-card__body">
          <div class="post-card__meta">
            <span class="post-cat" style="--cat-color:${catColor(post.category)}">${post.category}</span>
            <span class="post-card__read">${post.readTime}</span>
          </div>
          <h3 class="post-card__title">${post.title}</h3>
          <p class="post-card__excerpt">${post.excerpt}</p>
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
      postContent.innerHTML = '<p class="text-silver">Post not found. <a href="blog.html" class="text-orange">Back to blog</a></p>';
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
    postContent.innerHTML = post.content.map(block => {
      switch (block.type) {
        case 'paragraph':
          return `<p class="post-body">${block.text}</p>`;
        case 'heading':
          return `<h2 class="post-heading">${block.text}</h2>`;
        case 'blockquote':
          return `<blockquote class="post-quote">${block.text}</blockquote>`;
        case 'list':
          return `<ul class="post-list">${block.items.map(i => `<li>${i}</li>`).join('')}</ul>`;
        case 'cta':
          return `
            <div class="post-cta-block">
              <p>${block.text}</p>
              <a href="${block.link}" class="btn btn--primary">${block.label}</a>
            </div>
          `;
        default:
          return '';
      }
    }).join('');

    // Related posts — same category, not this post
    if (relatedGrid) {
      const related = posts.filter(p => p.id !== post.id && p.category === post.category).slice(0, 3);
      if (related.length === 0) {
        // Fall back to any other posts
        const others = posts.filter(p => p.id !== post.id).slice(0, 3);
        renderRelated(others);
      } else {
        renderRelated(related);
      }
    }
  });
}

function renderRelated(posts) {
  if (!relatedGrid) return;
  relatedGrid.innerHTML = posts.map(post => `
    <a href="post.html?id=${post.id}" class="post-card reveal">
      <div class="post-card__image">
        <img src="${post.image}" alt="${post.title}" loading="lazy"/>
      </div>
      <div class="post-card__body">
        <div class="post-card__meta">
          <span class="post-cat" style="--cat-color:${catColor(post.category)}">${post.category}</span>
          <span class="post-card__read">${post.readTime}</span>
        </div>
        <h3 class="post-card__title">${post.title}</h3>
        <p class="post-card__excerpt">${post.excerpt}</p>
        <div class="post-card__footer">
          <span class="post-card__date">${formatDate(post.date)}</span>
          <span class="post-card__arrow">→</span>
        </div>
      </div>
    </a>
  `).join('');
}
