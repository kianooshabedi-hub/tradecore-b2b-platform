// js/pages/sellerPanel.js

import { SellerService } from '../services/sellerService.js';
import { ProductService } from '../services/productService.js';

let currentProfile = null;
let currentSummary = null;
let currentProductPage = 1; // برای صفحه‌بندی

document.addEventListener('DOMContentLoaded', () => {
  initSellerPanel();
});

async function initSellerPanel() {
  currentProfile = await SellerService.getProfile();
  if (currentProfile) document.getElementById('top-user-name').innerHTML = `🏢 ${currentProfile.name} (تأمین‌کننده)`;
  
  currentSummary = await SellerService.getDashboardSummary();
  loadDashboardTab();

  const navLinks = document.querySelectorAll('.panel-nav a');
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      navLinks.forEach(l => l.classList.remove('active'));
      e.target.classList.add('active');
      
      const tab = e.target.getAttribute('data-tab');
      if (tab === 'dashboard') loadDashboardTab();
      else if (tab === 'inbox') loadInboxTab();
      else if (tab === 'my-products') loadProductsTab();
      else if (tab === 'company-profile') loadProfileTab();
    });
  });
}

function loadDashboardTab() {
  const content = document.getElementById('panel-content');
  content.innerHTML = `
    <h1 style="font-size: 1.8rem; margin-bottom: 1.5rem;">خلاصه وضعیت فروشگاه شما</h1>
    <div class="panel-stats-grid">
      <div class="stat-card" style="border-bottom: 4px solid var(--color-secondary);">
        <h3>پیام‌های جدید (Leads)</h3>
        <div class="stat-value text-accent">${currentSummary.newRfqsCount}</div>
      </div>
      <div class="stat-card" style="border-bottom: 4px solid var(--color-primary);">
        <h3>محصولات فعال</h3>
        <div class="stat-value" style="color: var(--color-primary);">${currentSummary.productsCount}</div>
      </div>
      <div class="stat-card" style="border-bottom: 4px solid #10b981;">
        <h3>بازدید پروفایل (ماهانه)</h3>
        <div class="stat-value" style="color: #10b981;">${currentSummary.profileViews}</div>
      </div>
    </div>
  `;
}

function loadInboxTab() {
  const content = document.getElementById('panel-content');
  content.innerHTML = `
    <h2 style="font-size: 1.5rem; margin-bottom: 1.5rem;">📥 صندوق پیام‌ها (Leads)</h2>
    <div class="panel-table-container">
      <table class="panel-table">
        <thead>
          <tr>
            <th>خریدار</th>
            <th>محصول</th>
            <th>تاریخ</th>
            <th>وضعیت</th>
            <th>عملیات</th>
          </tr>
        </thead>
        <tbody>
          ${currentSummary.rfqs.length > 0 ? currentSummary.rfqs.map(rfq => `
            <tr>
              <td style="color: var(--color-primary); font-weight: 600;">${rfq.buyerName}</td>
              <td>${rfq.productName}</td>
              <td style="color: var(--color-text-muted);">${rfq.date}</td>
              <td><span class="status-badge status-${rfq.status}">${rfq.status === 'pending' ? '🔴 نیاز به پاسخ' : 'پاسخ داده شده'}</span></td>
              <td>
                <button class="btn btn-primary" style="padding: 4px 12px; font-size: 0.8rem;" onclick="openReplyModal('${rfq.id}')">
                  ${rfq.status === 'pending' ? 'خواندن و پاسخ' : 'مشاهده پاسخ'}
                </button>
              </td>
            </tr>
          `).join('') : '<tr><td colspan="5" style="text-align:center;">پیام جدیدی ندارید</td></tr>'}
        </tbody>
      </table>
    </div>
  `;
}

window.changeProductPage = (page) => {
  currentProductPage = page;
  loadProductsTab();
};

async function loadProductsTab() {
  const content = document.getElementById('panel-content');
  content.innerHTML = '<div style="text-align: center; padding: 3rem;">در حال دریافت اطلاعات...</div>';
  const myProducts = await ProductService.getProductsBySupplierId(currentProfile.id);

  // صفحه‌بندی (۱۰ تایی)
  const itemsPerPage = 10;
  const totalPages = Math.ceil(myProducts.length / itemsPerPage);
  const start = (currentProductPage - 1) * itemsPerPage;
  const paginatedProducts = myProducts.slice(start, start + itemsPerPage);

  let paginationHTML = '';
  if (totalPages > 1) {
    paginationHTML = '<div style="display: flex; justify-content: center; gap: 8px; margin-top: 1.5rem;">';
    for (let i = 1; i <= totalPages; i++) {
      paginationHTML += `<button class="btn ${i === currentProductPage ? 'btn-primary' : 'btn-outline'}" style="padding: 5px 12px;" onclick="changeProductPage(${i})">${i}</button>`;
    }
    paginationHTML += '</div>';
  }

  content.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
      <h2 style="font-size: 1.5rem;">📦 مدیریت محصولات (${myProducts.length})</h2>
      <button class="btn btn-primary">+ افزودن محصول جدید</button>
    </div>
    <div class="panel-table-container">
      <table class="panel-table">
        <thead>
          <tr>
            <th>تصویر</th>
            <th>نام محصول</th>
            <th>دسته‌بندی</th>
            <th>عملیات</th>
          </tr>
        </thead>
        <tbody>
          ${paginatedProducts.map(p => `
            <tr>
              <td><img src="${p.image}" style="width: 40px; height: 40px; border-radius: 4px; object-fit: cover;"></td>
              <td style="font-weight: 600;">${p.name}</td>
              <td style="color: var(--color-text-muted);">${p.categoryName || 'دسته‌بندی'}</td>
              <td>
                <button class="btn btn-outline" style="padding: 4px 8px; font-size: 0.8rem;">✏️ ویرایش</button>
                <button class="btn btn-outline" style="padding: 4px 8px; font-size: 0.8rem; color: #ef4444; border-color: #ef4444; margin-right: 5px;">🗑️ حذف</button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
    ${paginationHTML}
  `;
}

function loadProfileTab() {
  const content = document.getElementById('panel-content');
  content.innerHTML = `
    <h2 style="font-size: 1.5rem; margin-bottom: 1.5rem;">🏢 ویرایش پروفایل شرکت</h2>
    <div style="background: var(--color-surface); padding: 2rem; border-radius: var(--radius-lg); border: 1px solid var(--color-border); max-width: 800px;">
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem;">
        <div><label style="font-weight: 600; display:block; margin-bottom:5px;">نام شرکت</label><input type="text" class="form-input" value="${currentProfile.name}"></div>
        <div><label style="font-weight: 600; display:block; margin-bottom:5px;">نام انگلیسی (Brand)</label><input type="text" class="form-input" value="${currentProfile.englishName || ''}"></div>
        <div><label style="font-weight: 600; display:block; margin-bottom:5px;">ایمیل سازمانی</label><input type="email" class="form-input" value="${currentProfile.email || ''}"></div>
        <div><label style="font-weight: 600; display:block; margin-bottom:5px;">شماره تماس</label><input type="text" class="form-input" value="${currentProfile.phone || ''}" dir="ltr"></div>
        <div style="grid-column: 1 / -1;"><label style="font-weight: 600; display:block; margin-bottom:5px;">درباره شرکت (معرفی)</label><textarea class="form-input" rows="5">${currentProfile.description || ''}</textarea></div>
        <div><label style="font-weight: 600; display:block; margin-bottom:5px;">صنعت فعالیت</label><input type="text" class="form-input" value="${currentProfile.industry || ''}"></div>
        <div><label style="font-weight: 600; display:block; margin-bottom:5px;">آپلود لوگو</label><button class="btn btn-outline btn-full">انتخاب فایل...</button></div>
      </div>
      <button class="btn btn-primary" style="margin-top: 2rem; width: 200px;">ذخیره تغییرات</button>
    </div>
  `;
}

window.openReplyModal = (rfqId) => {
  const rfq = currentSummary.rfqs.find(r => r.id === rfqId);
  if (!rfq) return;
  const isReplied = rfq.status === 'replied';

  const modalHtml = `
    <div id="reply-modal" class="modal-overlay">
      <div class="modal-content">
        <div class="modal-header">
          <h3>استعلام از: ${rfq.buyerName}</h3>
          <button class="btn-close" onclick="document.getElementById('reply-modal').remove()">✖</button>
        </div>
        <div class="modal-body">
          <div style="background: #f8fafc; padding: 1rem; border-radius: var(--radius-md); margin-bottom: 1rem; border: 1px solid var(--color-border);">
            <span style="font-size: 0.8rem; color: var(--color-text-muted);">پیام خریدار (${rfq.date}):</span>
            <p style="margin-top: 0.5rem; line-height: 1.6;">${rfq.message}</p>
          </div>
          ${isReplied ? `
            <div style="background: #eff6ff; padding: 1rem; border-radius: var(--radius-md); border: 1px solid #bfdbfe;">
              <span style="font-size: 0.8rem; color: var(--color-primary);">پاسخ شما (${rfq.replyDate}):</span>
              <p style="margin-top: 0.5rem; line-height: 1.6; color: var(--color-text-main);">${rfq.reply}</p>
            </div>
          ` : `
            <label style="font-size: 0.9rem; font-weight: 600; display: block; margin-bottom: 0.5rem;">پاسخ شما:</label>
            <textarea id="reply-message" rows="4" class="form-input" placeholder="قیمت و شرایط را بنویسید..."></textarea>
            <button class="btn btn-primary btn-full" style="margin-top: 1rem;" onclick="submitRfqReply('${rfq.id}', event)">ارسال پاسخ</button>
          `}
        </div>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', modalHtml);
};

window.submitRfqReply = async (rfqId, event) => {
  const msg = document.getElementById('reply-message').value;
  if (!msg.trim()) { alert('پاسخ نمی‌تواند خالی باشد.'); return; }
  event.target.textContent = 'در حال ارسال...';
  event.target.disabled = true;
  await SellerService.replyToRfq(rfqId, msg);
  document.getElementById('reply-modal').remove();
  currentSummary = await SellerService.getDashboardSummary();
  loadInboxTab();
};