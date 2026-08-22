// js/pages/buyerPanel.js

import { BuyerService } from '../services/buyerService.js';
import { AppStore } from '../data/appStore.js';
import { ProductService } from '../services/productService.js';
import { businesses } from '../data/businesses.js';

let currentProfile = null;
let currentSummary = null;

document.addEventListener('DOMContentLoaded', () => {
  initBuyerPanel();
});

async function initBuyerPanel() {
  currentProfile = await BuyerService.getProfile();
  if (currentProfile) document.getElementById('top-user-name').innerHTML = `👤 ${currentProfile.name} (خریدار)`;
  
  currentSummary = await BuyerService.getDashboardSummary();
  loadDashboardTab();

  const navLinks = document.querySelectorAll('.panel-nav a');
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      navLinks.forEach(l => l.classList.remove('active'));
      e.target.classList.add('active');
      
      const tab = e.target.getAttribute('data-tab');
      if (tab === 'dashboard') loadDashboardTab();
      else if (tab === 'rfqs') loadRfqsTab();
      else if (tab === 'saved-products') loadFavoritesTab('products');
      else if (tab === 'saved-businesses') loadFavoritesTab('businesses');
      else if (tab === 'settings') loadProfileTab(); 
    });
  });
}

function loadDashboardTab() {
  const content = document.getElementById('panel-content');
  content.innerHTML = `
    <h1 style="font-size: 1.8rem; margin-bottom: 1.5rem;">خلاصه فعالیت‌های خرید شما</h1>
    <div class="panel-stats-grid">
      <div class="stat-card">
        <h3>درخواست‌های ارسالی (RFQ)</h3>
        <div class="stat-value text-accent">${currentSummary.rfqsCount}</div>
      </div>
      <div class="stat-card">
        <h3>محصولات ذخیره شده</h3>
        <div class="stat-value" style="color: #ef4444;">${AppStore.getFavProducts().length}</div>
      </div>
    </div>
  `;
}

function loadRfqsTab() {
  const content = document.getElementById('panel-content');
  content.innerHTML = `
    <h2 style="font-size: 1.5rem; margin-bottom: 1.5rem;">✉️ استعلام‌های ارسالی</h2>
    <div class="panel-table-container">
      <table class="panel-table">
        <thead>
          <tr>
            <th>محصول درخواستی</th>
            <th>ارسال شده به</th>
            <th>تاریخ</th>
            <th>وضعیت</th>
            <th>عملیات</th>
          </tr>
        </thead>
        <tbody>
          ${currentSummary.rfqs.length > 0 ? currentSummary.rfqs.map(rfq => `
            <tr>
              <td style="font-weight: 600;">${rfq.productName}</td>
              <td style="color: var(--color-primary);">${rfq.supplierName}</td>
              <td style="color: var(--color-text-muted);">${rfq.date}</td>
              <td><span class="status-badge status-${rfq.status}">${rfq.status === 'pending' ? '⏳ در انتظار پاسخ' : 'پاسخ داده شده'}</span></td>
              <td>
                <button class="btn btn-outline" style="padding: 4px 8px; font-size: 0.8rem;" onclick="openViewModal('${rfq.id}')">
                  ${rfq.status === 'pending' ? 'مشاهده درخواست' : 'خواندن جواب'}
                </button>
              </td>
            </tr>
          `).join('') : '<tr><td colspan="5" style="text-align:center;">درخواستی ثبت نشده است</td></tr>'}
        </tbody>
      </table>
    </div>
  `;
}

async function loadFavoritesTab(type) {
  const content = document.getElementById('panel-content');
  content.innerHTML = '<div style="text-align: center; padding: 3rem;">در حال دریافت اطلاعات...</div>';

  if (type === 'products') {
    const favIds = AppStore.getFavProducts();
    
    const favoriteProducts = [];
    for(let id of favIds) {
        const p = await ProductService.getProductById(id);
        if(p) favoriteProducts.push(p);
    }

    content.innerHTML = `
      <h2 style="font-size: 1.5rem; margin-bottom: 1.5rem;">⭐ محصولات ذخیره شده (${favoriteProducts.length})</h2>
      ${favoriteProducts.length === 0 ? `
        <div style="background: var(--color-surface); padding: 3rem; border-radius: 8px; border: 1px dashed var(--color-border); text-align: center;">
          <p style="color: var(--color-text-muted);">هنوز محصولی را نشان نکرده‌اید.</p>
        </div>
      ` : `
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 1.5rem;">
            ${favoriteProducts.map(p => `
                <div style="background: white; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
                    <img src="${p.image}" alt="${p.name}" style="width: 100%; height: 140px; object-fit: cover;">
                    <div style="padding: 1rem;">
                        <h4 style="font-size: 0.95rem; margin-bottom: 10px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${p.name}</h4>
                        <a href="product.html?id=${p.id}" class="btn btn-outline btn-full" style="font-size: 0.8rem; padding: 6px;">مشاهده و استعلام</a>
                    </div>
                </div>
            `).join('')}
        </div>
      `}
    `;
  } else {
    const favIds = AppStore.getFavBusinesses();
    
    const favoriteBusinesses = favIds.map(id => businesses.find(b => b.id === id)).filter(Boolean);

    content.innerHTML = `
      <h2 style="font-size: 1.5rem; margin-bottom: 1.5rem;">🏢 تأمین‌کنندگان نشان‌شده (${favoriteBusinesses.length})</h2>
      ${favoriteBusinesses.length === 0 ? `
        <div style="background: var(--color-surface); padding: 3rem; border-radius: 8px; border: 1px dashed var(--color-border); text-align: center;">
          <p style="color: var(--color-text-muted);">هنوز شرکتی را نشان نکرده‌اید.</p>
        </div>
      ` : `
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1.5rem;">
            ${favoriteBusinesses.map(b => `
                <div style="background: white; border: 1px solid #e2e8f0; border-radius: 8px; padding: 1.5rem; display: flex; align-items: center; gap: 15px; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
                    <img src="${b.logo}" style="width: 60px; height: 60px; border-radius: 8px; border: 1px solid #e2e8f0; object-fit: cover;">
                    <div>
                        <h4 style="font-size: 1rem; margin-bottom: 5px;">${b.name}</h4>
                        <a href="business.html?id=${b.id}" style="font-size: 0.85rem; color: var(--color-primary); font-weight: bold;">مشاهده پروفایل ➔</a>
                    </div>
                </div>
            `).join('')}
        </div>
      `}
    `;
  }
}

function loadProfileTab() {
  const content = document.getElementById('panel-content');
  content.innerHTML = `
    <h2 style="font-size: 1.5rem; margin-bottom: 1.5rem;">⚙️ تنظیمات پروفایل شرکت</h2>
    <div style="background: var(--color-surface); padding: 2rem; border-radius: var(--radius-lg); border: 1px solid var(--color-border); max-width: 800px;">
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem;">
        <div><label style="font-weight: 600; display:block; margin-bottom:5px;">نام شرکت</label><input type="text" class="form-input" value="${currentProfile.name}"></div>
        <div><label style="font-weight: 600; display:block; margin-bottom:5px;">نام انگلیسی (Brand)</label><input type="text" class="form-input" value="${currentProfile.englishName || ''}"></div>
        <div><label style="font-weight: 600; display:block; margin-bottom:5px;">ایمیل سازمانی</label><input type="email" class="form-input" value="${currentProfile.email || ''}"></div>
        <div><label style="font-weight: 600; display:block; margin-bottom:5px;">شماره تماس</label><input type="text" class="form-input" value="${currentProfile.phone || ''}" dir="ltr"></div>
        <div style="grid-column: 1 / -1;"><label style="font-weight: 600; display:block; margin-bottom:5px;">درباره شرکت (معرفی)</label><textarea class="form-input" rows="5">${currentProfile.description || ''}</textarea></div>
      </div>
      <button class="btn btn-primary" style="margin-top: 2rem; width: 200px;">ذخیره تغییرات</button>
    </div>
  `;
}

// این همون تابعیه که جا مونده بود!
window.openViewModal = (rfqId) => {
  const rfq = currentSummary.rfqs.find(r => r.id === rfqId);
  if (!rfq) return;

  const isReplied = rfq.status === 'replied';

  const modalHtml = `
    <div id="view-modal" class="modal-overlay">
      <div class="modal-content">
        <div class="modal-header">
          <h3>جزئیات استعلام برای: ${rfq.productName}</h3>
          <button class="btn-close" onclick="document.getElementById('view-modal').remove()">✖</button>
        </div>
        <div class="modal-body">
          <div style="background: #f8fafc; padding: 1rem; border-radius: var(--radius-md); margin-bottom: 1rem; border: 1px solid var(--color-border);">
            <span style="font-size: 0.8rem; color: var(--color-text-muted);">پیام ارسالی شما (${rfq.date}):</span>
            <p style="margin-top: 0.5rem; line-height: 1.6;">${rfq.message}</p>
          </div>

          ${isReplied ? `
            <div style="background: #ecfdf5; padding: 1rem; border-radius: var(--radius-md); border: 1px solid #a7f3d0;">
              <span style="font-size: 0.8rem; color: #059669;">پاسخ ${rfq.supplierName} (${rfq.replyDate}):</span>
              <p style="margin-top: 0.5rem; line-height: 1.6; color: var(--color-text-main);">${rfq.reply}</p>
            </div>
            
            <div style="margin-top: 1.5rem; border-top: 1px dashed var(--color-border); padding-top: 1rem;">
              <p style="font-size: 0.85rem; color: var(--color-text-muted); text-align: center; margin-bottom: 1rem;">برای ادامه مذاکره از راه‌های زیر استفاده کنید:</p>
              <div style="display: flex; gap: 10px; justify-content: center;">
                <button class="btn btn-primary" style="flex: 1; padding: 8px; font-size: 0.9rem;" onclick="alert('قابلیت ارسال پیام جدید / چت به زودی متصل می‌شود.')">💬 پیام جدید</button>
                <button class="btn btn-outline" style="flex: 1; padding: 8px; font-size: 0.9rem;" onclick="alert('قابلیت ارسال ایمیل مستقیم به زودی متصل می‌شود.')">✉️ ایمیل</button>
                <button class="btn btn-outline" style="flex: 1; padding: 8px; font-size: 0.9rem;" onclick="alert('شماره تلفن تأمین‌کننده به زودی نمایش داده می‌شود.')">📞 تماس تلفنی</button>
              </div>
            </div>
          ` : `
            <div style="text-align: center; padding: 1rem; color: var(--color-text-muted); font-size: 0.9rem; border: 1px dashed var(--color-border); border-radius: var(--radius-md);">
              ⏳ شرکت ${rfq.supplierName} هنوز پاسخی ارسال نکرده است.
            </div>
          `}
        </div>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', modalHtml);
};