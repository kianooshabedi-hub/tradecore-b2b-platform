// js/components/header.js

import { AppStore } from '../data/appStore.js';
import { businesses } from '../data/businesses.js';
import { categories } from '../data/categories.js'; 
import { SearchService } from '../services/searchService.js';
import { AnalyticsService } from '../services/analyticsService.js';

export function renderHeader() {
  const activeUserId = AppStore.getActiveUserId();
  const activeUser = businesses.find(b => b.id === activeUserId);
  const currentTier = activeUser ? (activeUser.subscriptionTier || 'free') : 'free';
  
  const tierNames = { free: 'رایگان', basic: 'پایه', pro: 'حرفه‌ای', enterprise: 'سازمانی' };
  
  const optionsHtml = businesses.map(biz => {
    const isSelected = biz.id === activeUserId ? 'selected' : '';
    const tierText = biz.subscriptionTier === 'free' ? '[رایگان]' : '[پریمیوم]';
    return `<option value="${biz.id}" ${isSelected}>${biz.name} ${tierText}</option>`;
  }).join('');

  const categoryLinksHtml = categories.filter(c => c.status === 'active').map(cat => `
    <a href="search.html?category=${cat.id}" style="display: flex; align-items: center; padding: 12px 20px; color: #475569; text-decoration: none; font-size: 0.95rem; border-bottom: 1px solid #f1f5f9; transition: 0.2s;" onmouseover="this.style.backgroundColor='#f8fafc'; this.style.color='var(--color-primary)'; this.style.paddingRight='25px';" onmouseout="this.style.backgroundColor='transparent'; this.style.color='#475569'; this.style.paddingRight='20px';">
      <span style="margin-left: 8px; display: inline-flex;">${cat.icon}</span> ${cat.name}
    </a>
  `).join('');

  // سیستم پیشنهادات زنده (با عکس محصولات و لوگوی شرکت‌ها، اما بدون آیکون‌های اضافه)
  setTimeout(() => {
    const searchInput = document.getElementById('global-search-input');
    const suggestBox = document.getElementById('global-search-suggestions');
    const searchForm = document.getElementById('global-search-form');
    
    if (searchInput && suggestBox) {
        let debounceTimer;
        
        searchInput.addEventListener('input', (e) => {
            clearTimeout(debounceTimer);
            const query = e.target.value;
            
            if (query.trim().length < 2) {
                suggestBox.style.display = 'none';
                return;
            }

            debounceTimer = setTimeout(async () => {
                suggestBox.innerHTML = '<div style="padding: 15px; text-align: center; color: #94a3b8; font-size: 0.85rem;">در حال جستجو...</div>';
                suggestBox.style.display = 'block';
                
                const results = await SearchService.getSuggestions(query);
                
                let html = '';
                
                // رندر دسته‌بندی‌ها (فقط متن)
                if (results.categories.length > 0) {
                    html += `<div style="padding: 8px 15px; background: #f8fafc; font-size: 0.75rem; font-weight: bold; color: #64748b;">دسته‌بندی‌های مرتبط</div>`;
                    results.categories.forEach(c => {
                        html += `<a href="search.html?category=${c.id}" class="suggest-item" onclick="window.trackSuggestClick('category', '${c.id}')">${c.name}</a>`;
                    });
                }
                
                // رندر شرکت‌ها (همراه با لوگو واقعی شرکت)
                if (results.companies.length > 0) {
                    html += `<div style="padding: 8px 15px; background: #f8fafc; font-size: 0.75rem; font-weight: bold; color: #64748b;">شرکت‌ها و تأمین‌کنندگان</div>`;
                    results.companies.forEach(b => {
                        html += `<a href="business.html?id=${b.id}" class="suggest-item" onclick="window.trackSuggestClick('company', '${b.id}')">
                            <img src="${b.logo || 'images/default-logo.png'}" style="width: 24px; height: 24px; border-radius: 4px; border: 1px solid #e2e8f0; object-fit: cover; margin-left: 8px; flex-shrink: 0;">
                            <span style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${b.name}</span>
                        </a>`;
                    });
                }

                // رندر محصولات (همراه با تصویر واقعی محصول)
                if (results.products.length > 0) {
                    html += `<div style="padding: 8px 15px; background: #f8fafc; font-size: 0.75rem; font-weight: bold; color: #64748b;">محصولات</div>`;
                    results.products.forEach(p => {
                        html += `<a href="product.html?id=${p.id}" class="suggest-item" onclick="window.trackSuggestClick('product', '${p.id}')">
                            <img src="${p.image}" style="width: 24px; height: 24px; border-radius: 4px; border: 1px solid #e2e8f0; object-fit: cover; margin-left: 8px; flex-shrink: 0;">
                            <span style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${p.name}</span>
                        </a>`;
                    });
                }

                if (!html) {
                    html = `<div style="padding: 15px; text-align: center; color: #94a3b8; font-size: 0.85rem;">نتیجه‌ای یافت نشد.</div>`;
                }

                html += `<div style="padding: 10px; border-top: 1px solid #e2e8f0; text-align: center;"><button type="submit" style="background:none; border:none; color:var(--color-primary); font-family:inherit; font-weight:bold; font-size:0.85rem; cursor:pointer;">جستجوی کامل برای «${query}» ➔</button></div>`;
                suggestBox.innerHTML = html;
            }, 300);
        });

        document.addEventListener('click', (e) => {
            if (!searchForm.contains(e.target)) suggestBox.style.display = 'none';
        });

        searchForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const query = searchInput.value.trim();
            if (query) {
                AnalyticsService.trackSearch(query, 0, 'header');
                window.location.href = `search.html?q=${encodeURIComponent(query)}`;
            }
        });
    }

    const switcher = document.getElementById('demo-account-switcher');
    if (switcher) {
      switcher.addEventListener('change', (e) => {
        AppStore.setActiveUserId(e.target.value);
        window.location.reload();
      });
    }
  }, 0);

  window.trackSuggestClick = (type, id) => {
      AnalyticsService.trackInteraction('Search Suggestion Clicked', type, id);
  };

  let subscriptionHtml = currentTier === 'free' 
    ? `<a href="pricing.html" class="btn-upgrade-free">ارتقا به ویژه</a>`
    : `<a href="pricing.html" class="btn-upgrade-pro">اشتراک: ${tierNames[currentTier] || 'پریمیوم'}</a>`;

  return `
    <style>
      .nav-dropdown { position: relative; padding: 10px 0; }
      .dropdown-content { position: absolute; top: 100%; right: 0; background: white; min-width: 300px; box-shadow: 0 10px 30px rgba(0,0,0,0.08); border-radius: 12px; border: 1px solid #e2e8f0; opacity: 0; visibility: hidden; transform: translateY(10px); transition: all 0.3s ease; z-index: 1000; overflow: hidden; }
      .nav-dropdown:hover .dropdown-content { opacity: 1; visibility: visible; transform: translateY(0); }
      
      .btn-upgrade-free { display: inline-flex; align-items: center; justify-content: center; gap: 6px; padding: 0 14px; height: 36px; font-size: 0.85rem; font-weight: 700; border-radius: 8px; white-space: nowrap; text-decoration: none; background: linear-gradient(135deg, #f59e0b, #d97706); color: white; box-shadow: 0 2px 4px rgba(245, 158, 11, 0.2); transition: 0.2s; }
      .btn-upgrade-free:hover { transform: translateY(-1px); box-shadow: 0 4px 6px rgba(245, 158, 11, 0.3); }
      .btn-upgrade-pro { display: inline-flex; align-items: center; justify-content: center; gap: 6px; padding: 0 14px; height: 36px; font-size: 0.85rem; font-weight: 700; border-radius: 8px; white-space: nowrap; text-decoration: none; background-color: #fdf4ff; color: #c026d3; border: 1px solid #f0abfc; box-shadow: 0 2px 4px rgba(192, 38, 211, 0.1); }
      
      .header-search { position: relative; flex: 1; max-width: 280px; min-width: 180px; margin: 0 10px; display: none; }
      @media (min-width: 992px) { .header-search { display: block; } }
      .header-search input { width: 100%; padding: 8px 15px 8px 35px; border-radius: 20px; border: 1px solid #cbd5e1; background: #f8fafc; font-family: inherit; font-size: 0.85rem; outline: none; transition: 0.2s; }
      .header-search input:focus { border-color: var(--color-primary); background: white; box-shadow: 0 0 0 3px rgba(37,99,235,0.1); }
      .header-search svg { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #94a3b8; pointer-events: none; }
      
      .suggest-box { position: absolute; top: 110%; left: 0; right: 0; background: white; border: 1px solid #e2e8f0; border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); overflow: hidden; display: none; z-index: 1001; }
      /* استایل‌های suggest-item مرتب‌تر شد تا با عکس‌ها همخوانی داشته باشد */
      .suggest-item { display: flex; align-items: center; padding: 10px 15px; color: #334155; text-decoration: none; font-size: 0.85rem; border-bottom: 1px solid #f1f5f9; transition: 0.2s; }
      .suggest-item:hover { background: #eff6ff; color: var(--color-primary); }
    </style>

    <header id="app-header" style="background-color: var(--color-surface); border-bottom: 1px solid var(--color-border); position: sticky; top: 0; z-index: 1000; box-shadow: 0 2px 10px rgba(0,0,0,0.02);">
      <div class="container header-container" style="display: flex; justify-content: space-between; align-items: center; height: 70px; flex-wrap: nowrap; overflow: visible; gap: 10px;">
        
        <div class="logo" style="display: flex; align-items: center; flex-shrink: 0;">
          <a href="index.html" style="display: flex; align-items: center; gap: 8px; text-decoration: none;">
            <div style="background: linear-gradient(135deg, var(--color-primary), #1e3a8a); color: white; width: 34px; height: 34px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 1rem;">TC</div>
            <span style="font-size: 1.3rem; font-weight: 900; color: #0f172a; letter-spacing: -0.5px;">TradeCore</span>
          </a>
        </div>

        <nav class="main-nav" style="display: flex; justify-content: center; align-items: center; overflow: visible; flex-shrink: 0;">
          <ul style="display: flex; gap: 1.2rem; list-style: none; margin: 0; padding: 0; align-items: center;">
            <li><a href="index.html" style="font-weight: 600; color: var(--color-text-main); text-decoration: none; font-size: 0.9rem; transition: 0.2s;" onmouseover="this.style.color='var(--color-primary)'" onmouseout="this.style.color='var(--color-text-main)'">صفحه اصلی</a></li>
            <li class="nav-dropdown">
              <a href="search.html" style="font-weight: 600; color: var(--color-text-main); text-decoration: none; display: flex; align-items: center; gap: 4px; font-size: 0.9rem; transition: 0.2s;" onmouseover="this.style.color='var(--color-primary)'" onmouseout="this.style.color='var(--color-text-main)'">محصولات ▾</a>
              <div class="dropdown-content">
                <a href="search.html" style="display: flex; align-items: center; padding: 12px 20px; color: var(--color-primary); text-decoration: none; font-size: 0.95rem; border-bottom: 2px solid #f1f5f9; font-weight: bold; background: #f8fafc;">
                  <span style="margin-left: 8px; display: inline-flex;"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path></svg></span> جستجوی پیشرفته
                </a>
                ${categoryLinksHtml}
              </div>
            </li>
            <li><a href="articles.html" style="font-weight: 600; color: var(--color-text-main); text-decoration: none; font-size: 0.9rem; transition: 0.2s;" onmouseover="this.style.color='var(--color-primary)'" onmouseout="this.style.color='var(--color-text-main)'">مقالات</a></li>
            <li><a href="suppliers.html" style="font-weight: 600; color: var(--color-text-main); text-decoration: none; font-size: 0.9rem; transition: 0.2s;" onmouseover="this.style.color='var(--color-primary)'" onmouseout="this.style.color='var(--color-text-main)'">شبکه تأمین</a></li>
            <li><a href="about.html" style="font-weight: 600; color: var(--color-text-main); text-decoration: none; font-size: 0.9rem; transition: 0.2s;" onmouseover="this.style.color='var(--color-primary)'" onmouseout="this.style.color='var(--color-text-main)'">درباره ما</a></li>
          </ul>
        </nav>

        <div class="header-search">
            <form id="global-search-form" style="position: relative;">
                <input type="text" id="global-search-input" placeholder="جستجوی محصول، برند..." autocomplete="off">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                <div id="global-search-suggestions" class="suggest-box"></div>
            </form>
        </div>

        <div class="header-actions" style="display: flex; align-items: center; gap: 8px; flex-shrink: 0;">
          <a href="buyer-panel.html" class="btn btn-primary" style="padding: 0 12px; height: 34px; font-size: 0.8rem;">پنل خریدار</a>
          <a href="seller-panel.html" class="btn btn-primary" style="padding: 0 12px; height: 34px; font-size: 0.8rem;">پنل فروشنده</a>
          
          <div style="width: 1px; height: 20px; background-color: var(--color-border); margin: 0 2px;"></div>
          
          <div style="display: inline-flex; align-items: center; background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 0 8px; height: 34px;">
            <select id="demo-account-switcher" style="border: none; background: transparent; font-family: inherit; font-size: 0.8rem; font-weight: 700; color: var(--color-primary); outline: none; cursor: pointer; max-width: 40px;">
              ${optionsHtml}
            </select>
          </div>
          ${subscriptionHtml}
        </div>

      </div>
    </header>
  `;
}