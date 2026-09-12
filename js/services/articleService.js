// js/services/articleService.js

import { ArticleStore } from '../data/articleStore.js';
import { businesses } from '../data/businesses.js';
import { categories } from '../data/categories.js';
import { products } from '../data/products.js';
import { AdminStore } from '../data/adminStore.js';

const ANALYTICS_KEY = 'tradecore_analytics_events';

export const ArticleService = {
  // ---- سیستم Analytics ----
  trackEvent: (eventName, details = {}) => {
    const logs = JSON.parse(localStorage.getItem(ANALYTICS_KEY) || '[]');
    logs.push({ event: eventName, details, timestamp: new Date().toISOString() });
    localStorage.setItem(ANALYTICS_KEY, JSON.stringify(logs.slice(-500)));
  },

  // ---- مقالات عمومی (Public) ----
  getPublishedArticles: async (categoryId = null, query = '') => {
    await new Promise(r => setTimeout(r, 100)); // شبیه‌سازی API
    let list = ArticleStore.getArticles().filter(a => a.status === 'published');
    
    if (categoryId && categoryId !== 'all') list = list.filter(a => a.categoryId === categoryId);
    if (query && query.trim() !== '') {
      const q = query.toLowerCase().trim();
      list = list.filter(a => a.title.toLowerCase().includes(q) || a.tags.some(t => t.toLowerCase().includes(q)));
    }
    
    return list.map(art => {
      const comp = businesses.find(b => b.id === art.companyId);
      const cat = categories.find(c => c.id === art.categoryId);
      return { 
          ...art, 
          companyName: comp?.name || 'نامشخص', 
          companyLogo: comp?.logo || 'images/default-logo.png',
          categoryName: cat?.name || 'بدون دسته'
      };
    });
  },

  getArticleById: async (articleId) => {
    await new Promise(r => setTimeout(r, 100));
    const all = ArticleStore.getArticles();
    const art = all.find(a => a.id === articleId);
    if (!art) return null;

    // ثبت رویداد بازدید
    ArticleService.trackEvent('Article Viewed', { articleId: art.id, title: art.title });
    
    // افزایش بازدید
    art.views = (art.views || 0) + 1;
    ArticleStore.saveArticles(all);

    const comp = businesses.find(b => b.id === art.companyId);
    const cat = categories.find(c => c.id === art.categoryId);
    const relatedProds = products.filter(p => art.relatedProductIds?.includes(p.id));

    return { 
        ...art, 
        company: comp || null, 
        category: cat || null,
        relatedProducts: relatedProds 
    };
  },

  // ---- پنل شرکت (Seller Panel) ----
  getCompanyArticles: async (companyId, onlyPublished = false) => {
    await new Promise(r => setTimeout(r, 100));
    let list = ArticleStore.getArticles().filter(a => a.companyId === companyId);
    if(onlyPublished) list = list.filter(a => a.status === 'published');
    return list;
  },

  saveArticle: async (articleData, companyId) => {
    await new Promise(r => setTimeout(r, 150));
    const all = ArticleStore.getArticles();
    const now = new Date().toLocaleDateString('fa-IR');

    if (articleData.id) {
      const index = all.findIndex(a => a.id === articleData.id && a.companyId === companyId);
      if (index !== -1) {
        all[index] = { 
          ...all[index], ...articleData, 
          slug: articleData.title.toLowerCase().replace(/[^a-zA-Z0-9آ-ی]/g, '-'),
          status: articleData.submitForReview ? 'pending' : (articleData.status || 'draft'),
          updatedAt: now 
        };
        ArticleStore.saveArticles(all);
        return all[index];
      }
    } else {
      const newArticle = {
        id: "art-" + Date.now(),
        slug: articleData.title.toLowerCase().replace(/[^a-zA-Z0-9آ-ی]/g, '-'),
        title: articleData.title,
        excerpt: articleData.excerpt || '',
        content: articleData.content || '',
        coverImage: articleData.coverImage || 'images/default-logo.png',
        companyId: companyId,
        authorId: companyId,
        categoryId: articleData.categoryId || '',
        tags: articleData.tags || [],
        relatedProductIds: articleData.relatedProductIds || [],
        status: articleData.submitForReview ? 'pending' : 'draft',
        rejectionReason: '',
        views: 0,
        createdAt: now,
        updatedAt: now,
        publishedAt: null
      };
      all.unshift(newArticle);
      ArticleStore.saveArticles(all);
      return newArticle;
    }
  },

  deleteArticle: async (articleId, companyId) => {
    const all = ArticleStore.getArticles();
    const filtered = all.filter(a => !(a.id === articleId && a.companyId === companyId));
    ArticleStore.saveArticles(filtered);
    return true;
  },

  // ---- پنل مدیریت (Admin Panel) ----
  getAllForAdmin: async (statusFilter = 'all') => {
    await new Promise(r => setTimeout(r, 100));
    let list = ArticleStore.getArticles();
    if (statusFilter !== 'all') list = list.filter(a => a.status === statusFilter);
    
    return list.map(art => {
      const comp = businesses.find(b => b.id === art.companyId);
      return { ...art, companyName: comp?.name || 'نامشخص' };
    });
  },

  updateStatusByAdmin: async (articleId, newStatus, reason = '') => {
    const all = ArticleStore.getArticles();
    const art = all.find(a => a.id === articleId);
    if (!art) return false;

    const now = new Date().toLocaleDateString('fa-IR');
    art.status = newStatus;
    art.updatedAt = now;
    
    if (newStatus === 'published') {
      art.publishedAt = now;
      art.rejectionReason = '';
    } else if (newStatus === 'rejected') {
      art.rejectionReason = reason;
    }

    ArticleStore.saveArticles(all);
    AdminStore.addAuditLog('UPDATE_ARTICLE_STATUS', 'Article', articleId, `وضعیت مقاله به ${newStatus} تغییر یافت.`);
    return true;
  }
};