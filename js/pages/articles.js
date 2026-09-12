// js/pages/articles.js

import { renderHeader } from '../components/header.js';
import { renderFooter } from '../components/footer.js';
import { ArticleService } from '../services/articleService.js';

document.addEventListener('DOMContentLoaded', async () => {
  document.getElementById('app-header').innerHTML = renderHeader();
  document.getElementById('app-footer').innerHTML = renderFooter();

  await loadArticles();

  const searchBtn = document.getElementById('article-search-btn');
  const searchInput = document.getElementById('article-search-input');
  
  searchBtn?.addEventListener('click', () => loadArticles(searchInput.value));
  searchInput?.addEventListener('keypress', (e) => { if (e.key === 'Enter') loadArticles(searchInput.value); });
});

async function loadArticles(searchQuery = '') {
  const container = document.getElementById('articles-grid');
  const list = await ArticleService.getPublishedArticles(null, searchQuery);

  if (list.length === 0) {
    container.innerHTML = `<div style="text-align: center; padding: 3rem; grid-column: 1 / -1; background: white; border-radius: 12px; border: 1px dashed var(--color-border); color: #64748b;">مقاله‌ای یافت نشد.</div>`;
    return;
  }

  container.innerHTML = list.map(art => `
    <article class="product-card" style="display: flex; flex-direction: column;">
      <div class="product-image-wrapper" style="height: 180px;">
        <img src="${art.coverImage || 'images/default-logo.png'}" alt="${art.title}" class="product-image">
        <span class="product-badge" style="background: rgba(15, 23, 42, 0.85); color: white;">${art.categoryName}</span>
      </div>
      <div class="product-details" style="display: flex; flex-direction: column; flex-grow: 1;">
        <h3 class="product-title" style="white-space: normal; line-height: 1.4; height: 2.8rem; overflow: hidden;">
          <a href="article-detail.html?id=${art.id}" onclick="window.trackArtClick('${art.id}')" style="color: #0f172a;">${art.title}</a>
        </h3>
        <p class="product-desc" style="font-size: 0.85rem; margin-bottom: 1rem;">${art.excerpt}</p>
        <div style="margin-top: auto; padding-top: 0.8rem; border-top: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: center; font-size: 0.8rem; color: #64748b;">
          <div style="display: flex; align-items: center; gap: 6px;">
            <img src="${art.companyLogo || 'images/default-logo.png'}" style="width: 24px; height: 24px; border-radius: 50%; object-fit: cover; border: 1px solid #e2e8f0;">
            <span style="font-weight: 600;">${art.companyName}</span>
          </div>
          <span dir="ltr">${art.publishedAt}</span>
        </div>
      </div>
      <div class="product-actions">
        <a href="article-detail.html?id=${art.id}" onclick="window.trackArtClick('${art.id}')" class="btn btn-primary btn-full" style="font-size: 0.85rem;">مطالعه کامل مقاله</a>
      </div>
    </article>
  `).join('');
}

window.trackArtClick = (id) => { ArticleService.trackEvent('Article Clicked', { articleId: id }); };