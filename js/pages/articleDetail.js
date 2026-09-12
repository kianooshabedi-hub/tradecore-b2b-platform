// js/pages/articleDetail.js

import { renderHeader } from '../components/header.js';
import { renderFooter } from '../components/footer.js';
import { ArticleService } from '../services/articleService.js';

document.addEventListener('DOMContentLoaded', async () => {
  document.getElementById('app-header').innerHTML = renderHeader();
  document.getElementById('app-footer').innerHTML = renderFooter();

  const urlParams = new URLSearchParams(window.location.search);
  const articleId = urlParams.get('id');

  if (!articleId) {
    document.getElementById('article-detail-container').innerHTML = '<div style="text-align:center; padding: 3rem;">مقاله‌ای انتخاب نشده است.</div>';
    return;
  }

  const art = await ArticleService.getArticleById(articleId);
  if (!art) {
    document.getElementById('article-detail-container').innerHTML = '<div style="text-align:center; padding: 3rem; color:#ef4444;">مقاله در دسترس نیست.</div>';
    return;
  }

  renderDetail(art);
});

function renderDetail(art) {
  const container = document.getElementById('article-detail-container');

  const relatedProdsHtml = art.relatedProducts?.length > 0 ? `
    <div style="background: white; border-radius: 12px; padding: 1.5rem; border: 1px solid var(--color-border); margin-top: 2rem;">
      <h3 style="font-size: 1.15rem; margin-bottom: 1rem; color: #0f172a;">محصولات مرتبط با این مقاله</h3>
      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 1rem;">
        ${art.relatedProducts.map(p => `
          <div style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 0.8rem; display: flex; gap: 12px; align-items: center;">
            <img src="${p.image}" style="width: 55px; height: 55px; border-radius: 6px; object-fit: cover; border: 1px solid #cbd5e1;">
            <div>
              <a href="product.html?id=${p.id}" onclick="window.trackRelatedProduct('${p.id}')" style="font-weight: 600; font-size: 0.9rem; color: var(--color-primary); text-decoration: none; display: block; line-height: 1.3;">${p.name}</a>
              <span style="font-size: 0.75rem; color: #64748b;">${p.brand || ''}</span>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  ` : '';

  container.innerHTML = `
    <div style="max-width: 900px; margin: 0 auto;">
      <div style="background: white; border-radius: 16px; border: 1px solid var(--color-border); overflow: hidden; padding: 2.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.02);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; font-size: 0.85rem; color: #64748b;">
          <span style="background: #eff6ff; color: var(--color-primary); padding: 4px 14px; border-radius: 20px; font-weight: bold;">${art.category ? art.category.name : ''}</span>
          <div style="display: flex; gap: 15px;">
            <span>تاریخ: <strong dir="ltr">${art.publishedAt || art.createdAt}</strong></span>
            <span>بازدید: <strong style="color: var(--color-primary);">${art.views}</strong></span>
          </div>
        </div>

        <h1 style="font-size: 1.95rem; color: #0f172a; margin-bottom: 1.5rem; line-height: 1.45; font-weight: 800;">${art.title}</h1>

        <div style="display: flex; align-items: center; justify-content: space-between; padding: 1rem 0; border-top: 1px solid #f1f5f9; border-bottom: 1px solid #f1f5f9; margin-bottom: 2rem;">
          <div style="display: flex; align-items: center; gap: 12px;">
            <img src="${art.company?.logo || 'images/default-logo.png'}" style="width: 48px; height: 48px; border-radius: 50%; object-fit: cover; border: 1px solid #e2e8f0;">
            <div>
              <div style="font-weight: 700; color: #1e293b; font-size: 1rem;">${art.company?.name || ''}</div>
              <div style="font-size: 0.8rem; color: #64748b;">${art.company?.industry || ''}</div>
            </div>
          </div>
          <a href="business.html?id=${art.companyId}" onclick="window.trackRelatedCompany('${art.companyId}')" class="btn btn-outline" style="font-size: 0.85rem; padding: 6px 14px;">مشاهده پروفایل شرکت</a>
        </div>

        ${art.coverImage ? `
        <div style="border-radius: 12px; overflow: hidden; margin-bottom: 2rem; max-height: 420px; background: #f8fafc; text-align: center;">
          <img src="${art.coverImage}" style="max-width: 100%; max-height: 420px; object-fit: cover; border-radius: 8px;">
        </div>` : ''}

        <div style="font-size: 1.05rem; line-height: 2.1; color: #334155; margin-bottom: 2rem;">
          ${art.content}
        </div>

        <div style="display: flex; flex-wrap: wrap; gap: 8px; border-top: 1px solid #f1f5f9; padding-top: 1.5rem;">
          ${(art.tags || []).map(t => `<span style="background: #f1f5f9; color: #475569; padding: 4px 12px; border-radius: 6px; font-size: 0.85rem;"># ${t}</span>`).join('')}
        </div>
      </div>
      ${relatedProdsHtml}
    </div>
  `;
}

window.trackRelatedProduct = (prodId) => ArticleService.trackEvent('Related Product Clicked', { productId: prodId });
window.trackRelatedCompany = (compId) => ArticleService.trackEvent('Related Company Clicked', { companyId: compId });