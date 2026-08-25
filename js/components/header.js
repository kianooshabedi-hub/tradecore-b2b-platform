// js/components/header.js

import { AppStore } from '../data/appStore.js';
import { businesses } from '../data/businesses.js';
import { categories } from '../data/categories.js'; // 👈 وارد کردن دسته‌بندی‌ها

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
    return `<option value="${biz.id}" ${isSelected}>${biz.name} (${roleText})</option>`;
  }).join('');

  // 🌟 ساخت لینک‌های دراپ‌داون از روی دیتابیس
  const categoryLinksHtml = categories.filter(c => c.status === 'active').map(cat => `
    <a href="products.html?category=${cat.id}" style="display: block; padding: 12px 20px; color: #475569; text-decoration: none; font-size: 0.95rem; border-bottom: 1px solid #f1f5f9; transition: 0.2s;" onmouseover="this.style.backgroundColor='#f8fafc'; this.style.color='var(--color-primary)'; this.style.paddingRight='25px';" onmouseout="this.style.backgroundColor='transparent'; this.style.color='#475569'; this.style.paddingRight='20px';">
      <span style="margin-left: 8px;">${cat.icon}</span> ${cat.name}
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
      /* استایل اختصاصی برای منوی کشویی محصولات */
      .nav-dropdown { position: relative; padding: 10px 0; }
      .dropdown-content {
        position: absolute;
        top: 100%;
        right: 0;
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
      <div class="container" style="display: flex; justify-content: space-between; align-items: center; height: 85px;">
        
        <div style="display: flex; align-items: center;">
          <a href="index.html" style="display: flex; align-items: center; gap: 12px; text-decoration: none;">
            <div style="background: linear-gradient(135deg, var(--color-primary), #1e3a8a); color: white; width: 48px; height: 48px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 1.4rem; box-shadow: 0 4px 6px rgba(37, 99, 235, 0.2);">TC</div>
            <span style="font-size: 1.5rem; font-weight: 900; color: #0f172a; letter-spacing: -0.5px;">TradeCore <span style="color: var(--color-primary);">B2B</span></span>
          </a>
        </div>

        <nav style="display: flex; gap: 2.5rem; align-items: center;">
          <a href="index.html" style="color: #475569; font-weight: 600; font-size: 0.95rem; text-decoration: none; transition: 0.2s;" onmouseover="this.style.color='var(--color-primary)'" onmouseout="this.style.color='#475569'">صفحه اصلی</a>
          
          <!-- 🌟 دراپ‌داون محصولات 🌟 -->
          <div class="nav-dropdown">
            <a href="products.html?category=all" style="color: #475569; font-weight: 600; font-size: 0.95rem; text-decoration: none; display: flex; align-items: center; gap: 5px;" onmouseover="this.style.color='var(--color-primary)'" onmouseout="this.style.color='#475569'">محصولات ▾</a>
            <div class="dropdown-content">
              <a href="products.html?category=all" style="display: block; padding: 15px 20px; color: var(--color-primary); text-decoration: none; font-size: 1rem; border-bottom: 2px solid #f1f5f9; font-weight: bold; background: #f8fafc;">📦 مشاهده تمامی محصولات</a>
              ${categoryLinksHtml}
            </div>
          </div>

          <a href="suppliers.html" style="color: #475569; font-weight: 600; font-size: 0.95rem; text-decoration: none; transition: 0.2s;" onmouseover="this.style.color='var(--color-primary)'" onmouseout="this.style.color='#475569'">تأمین‌کنندگان</a>
          <a href="about.html" style="color: #475569; font-weight: 600; font-size: 0.95rem; text-decoration: none; transition: 0.2s;" onmouseover="this.style.color='var(--color-primary)'" onmouseout="this.style.color='#475569'">درباره ما</a>
        </nav>

        <div style="display: flex; align-items: center; gap: 10px;">
          <a href="buyer-panel.html" class="btn btn-primary" style="padding: 8px 16px; font-size: 0.85rem;">👤 پنل خریدار</a>
          <a href="seller-panel.html" class="btn btn-primary" style="padding: 8px 16px; font-size: 0.85rem;">🏢 پنل فروشنده</a>
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