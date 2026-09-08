// js/components/header.js

import { AppStore } from '../data/appStore.js';
import { businesses } from '../data/businesses.js';
import { categories } from '../data/categories.js'; 

export function renderHeader() {
  const activeUserId = AppStore.getActiveUserId();
  
  const optionsHtml = businesses.map(biz => {
    const isSelected = biz.id === activeUserId ? 'selected' : '';
    let roleText = 'خریدار';
    if (biz.roles && biz.roles.includes('buyer') && biz.roles.includes('supplier')) {
      roleText = 'خریدار + فروشنده';
    } else if (biz.roles && biz.roles.includes('supplier')) {
      roleText = 'فروشنده';
    }
    
    const tierText = biz.subscriptionTier === 'free' ? '[رایگان]' : '[پریمیوم]';

    return `<option value="${biz.id}" ${isSelected}>${biz.name} ${tierText}</option>`;
  }).join('');

  const categoryLinksHtml = categories.filter(c => c.status === 'active').map(cat => `
    <a href="products.html?category=${cat.id}" style="display: flex; align-items: center; padding: 12px 20px; color: #475569; text-decoration: none; font-size: 0.95rem; border-bottom: 1px solid #f1f5f9; transition: 0.2s;" onmouseover="this.style.backgroundColor='#f8fafc'; this.style.color='var(--color-primary)'; this.style.paddingRight='25px';" onmouseout="this.style.backgroundColor='transparent'; this.style.color='#475569'; this.style.paddingRight='20px';">
      <span style="margin-left: 8px; display: inline-flex;">${cat.icon}</span> ${cat.name}
    </a>
  `).join('');

  setTimeout(() => {
    const switcher = document.getElementById('demo-account-switcher');
    if (switcher) {
      switcher.addEventListener('change', (e) => {
        AppStore.setActiveUserId(e.target.value);
        window.location.reload();
      });
    }
  }, 0);

  return `
    <style>
      .nav-dropdown { position: relative; padding: 10px 0; }
      .dropdown-content {
        position: absolute;
        top: 100%;
        right: -50px;
        background: white;
        min-width: 300px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.08);
        border-radius: 12px;
        border: 1px solid #e2e8f0;
        opacity: 0;
        visibility: hidden;
        transform: translateY(10px);
        transition: all 0.3s ease;
        z-index: 1000;
        overflow: hidden;
      }
      .nav-dropdown:hover .dropdown-content {
        opacity: 1;
        visibility: visible;
        transform: translateY(0);
      }
    </style>

    <header style="background: white; box-shadow: 0 4px 15px rgba(0,0,0,0.03); position: sticky; top: 0; z-index: 1000; border-bottom: 1px solid #e2e8f0;">
      <!-- 🌟 آپدیت: تقسیم‌بندی هدر به ۳ بخش مساوی با Flexbox -->
      <div class="container" style="display: flex; align-items: center; height: 85px;">
        
        <!-- بخش راست: لوگو -->
        <div style="flex: 1; display: flex; justify-content: flex-start; align-items: center;">
          <a href="index.html" style="display: flex; align-items: center; gap: 12px; text-decoration: none;">
            <div style="background: linear-gradient(135deg, var(--color-primary), #1e3a8a); color: white; width: 48px; height: 48px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 1.4rem; box-shadow: 0 4px 6px rgba(37, 99, 235, 0.2);">TC</div>
            <span style="font-size: 1.5rem; font-weight: 900; color: #0f172a; letter-spacing: -0.5px;">TradeCore <span style="color: var(--color-primary);">B2B</span></span>
          </a>
        </div>

        <!-- بخش وسط: فهرست و لینک‌ها -->
        <nav style="flex: 2; display: flex; justify-content: center; gap: 2.5rem; align-items: center;">
          <a href="index.html" style="color: #475569; font-weight: 600; font-size: 0.95rem; text-decoration: none; transition: 0.2s;" onmouseover="this.style.color='var(--color-primary)'" onmouseout="this.style.color='#475569'">صفحه اصلی</a>
          
          <div class="nav-dropdown">
            <a href="products.html?category=all" style="color: #475569; font-weight: 600; font-size: 0.95rem; text-decoration: none; display: flex; align-items: center; gap: 5px;" onmouseover="this.style.color='var(--color-primary)'" onmouseout="this.style.color='#475569'">محصولات و خدمات ▾</a>
            <div class="dropdown-content">
              <a href="products.html?category=all" style="display: flex; align-items: center; padding: 15px 20px; color: var(--color-primary); text-decoration: none; font-size: 1rem; border-bottom: 2px solid #f1f5f9; font-weight: bold; background: #f8fafc;">
                <span style="margin-left: 8px; display: inline-flex;"><svg width="25" height="25" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg></span> نمایش تمامی آیتم‌ها
              </a>
              ${categoryLinksHtml}
            </div>
          </div>

          <a href="suppliers.html" style="color: #475569; font-weight: 600; font-size: 0.95rem; text-decoration: none; transition: 0.2s;" onmouseover="this.style.color='var(--color-primary)'" onmouseout="this.style.color='#475569'">شبکه تأمین و خدمات</a>
          <a href="about.html" style="color: #475569; font-weight: 600; font-size: 0.95rem; text-decoration: none; transition: 0.2s;" onmouseover="this.style.color='var(--color-primary)'" onmouseout="this.style.color='#475569'">درباره ما</a>
        </nav>

        <!-- بخش چپ: دکمه‌های ورود و سوئیچر اکانت -->
        <div style="flex: 1; display: flex; justify-content: flex-end; align-items: center; gap: 10px;">
          <a href="buyer-panel.html" class="btn btn-primary" style="display: inline-flex; align-items: center; justify-content: center; gap: 6px; padding: 8px 16px; font-size: 0.85rem;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg> داشبورد خریدار
          </a>
          <a href="seller-panel.html" class="btn btn-primary" style="display: inline-flex; align-items: center; justify-content: center; gap: 6px; padding: 8px 16px; font-size: 0.85rem;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect><path d="M9 22v-4h6v4"></path><path d="M8 6h.01"></path><path d="M16 6h.01"></path><path d="M12 6h.01"></path><path d="M12 10h.01"></path><path d="M12 14h.01"></path><path d="M16 10h.01"></path><path d="M16 14h.01"></path><path d="M8 10h.01"></path><path d="M8 14h.01"></path></svg> داشبورد فروشنده
          </a>
          <div style="width: 1px; height: 35px; background-color: #e2e8f0; margin: 0 5px;"></div>
          <div style="display: flex; align-items: center; background: #f8fafc; border: 1px solid #cbd5e1; border-radius: var(--radius-md); padding: 6px 12px; box-shadow: inset 0 1px 2px rgba(0,0,0,0.02); transition: all 0.2s ease;" onmouseover="this.style.borderColor='var(--color-primary)'" onmouseout="this.style.borderColor='#cbd5e1'">
            <span style="font-size: 0.75rem; color: #64748b; font-weight: 600; margin-left: 8px;">اکانت نمایشی:</span>
            <select id="demo-account-switcher" style="border: none; background: transparent; font-family: inherit; font-size: 0.85rem; font-weight: 700; color: var(--color-primary); outline: none; cursor: pointer; max-width: 20px;">
              ${optionsHtml}
            </select>
          </div>
        </div>

      </div>
    </header>
  `;
}