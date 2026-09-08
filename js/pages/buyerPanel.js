// js/pages/buyerPanel.js

import { BuyerService } from '../services/buyerService.js';
import { AppStore } from '../data/appStore.js';
import { ProductService } from '../services/productService.js';
import { businesses } from '../data/businesses.js';
import { CategoryService } from '../services/categoryService.js'; 

let currentProfile = null;
let currentSummary = null;

let hasViewedPitches = false;

document.addEventListener('DOMContentLoaded', () => {
  initBuyerPanel();
});

window.showUpgradePaywall = (featureName) => {
    const modalHtml = `
      <div id="paywall-modal" class="modal-overlay" style="z-index: 9999;">
        <div class="modal-content" style="text-align: center; padding: 2rem;">
          <div style="background: #fdf4ff; width: 80px; height: 80px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1.5rem;">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#d946ef" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
          </div>
          <h2 style="font-size: 1.5rem; margin-bottom: 1rem; color: #1e293b;">دسترسی ویژه (Premium)</h2>
          <p style="color: #64748b; margin-bottom: 2rem; font-size: 1rem; line-height: 1.6;">
            شما در حال حاضر از <strong>اکانت رایگان</strong> استفاده می‌کنید و به سقف مجاز <strong>${featureName}</strong> رسیده‌اید. برای استفاده نامحدود و دسترسی به اطلاعات تماس شرکت‌ها، حساب خود را ارتقا دهید.
          </p>
          <button class="btn btn-primary btn-full" style="background: #d946ef; border-color: #d946ef; margin-bottom: 10px;" onclick="alert('انتقال به درگاه پرداخت در نسخه اصلی انجام می‌شود.')">مشاهده پلن‌ها و ارتقا اکانت</button>
          <button class="btn btn-outline btn-full" onclick="document.getElementById('paywall-modal').remove()">فعلاً نه، بازگشت</button>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
};

function updateSidebarBadges() {
    if(!currentSummary) return;

    const pitchesTab = document.querySelector('.panel-nav a[data-tab="pitches"]');
    if(!pitchesTab) return;

    if (hasViewedPitches) {
        const existingBadge = pitchesTab.querySelector('.nav-badge');
        if (existingBadge) existingBadge.style.display = 'none';
        return;
    }

    const totalNew = currentSummary.servicePitchesCount || 0;

    let badge = pitchesTab.querySelector('.nav-badge');
    if(!badge) {
        badge = document.createElement('span');
        badge.className = 'nav-badge';
        badge.style.cssText = 'background-color: #8b5cf6; color: white; border-radius: 50%; min-width: 22px; height: 22px; display: inline-flex; align-items: center; justify-content: center; font-size: 0.75rem; margin-right: auto; font-weight: bold; box-shadow: 0 2px 4px rgba(139, 92, 246, 0.3);';
        
        pitchesTab.style.display = 'flex';
        pitchesTab.style.alignItems = 'center';
        pitchesTab.appendChild(badge);
    }

    if(totalNew > 0) {
        badge.textContent = totalNew;
        badge.style.display = 'inline-flex';
    } else {
        badge.style.display = 'none';
    }
}

async function initBuyerPanel() {
  currentProfile = await BuyerService.getProfile();
  if (currentProfile) document.getElementById('top-user-name').innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: text-bottom; margin-left: 6px;"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg> ${currentProfile.name} (خریدار)`;
  
  currentSummary = await BuyerService.getDashboardSummary();
  updateSidebarBadges();
  loadDashboardTab();

  const navLinks = document.querySelectorAll('.panel-nav a');
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      navLinks.forEach(l => l.classList.remove('active'));
      const targetLink = e.target.closest('a');
      if(targetLink) targetLink.classList.add('active');
      
      const tab = targetLink ? targetLink.getAttribute('data-tab') : null;
      if (tab === 'dashboard') loadDashboardTab();
      else if (tab === 'rfqs') loadRfqsTab();
      else if (tab === 'tenders') loadTendersTab(); 
      else if (tab === 'pitches') {
          hasViewedPitches = true; 
          updateSidebarBadges();
          loadPitchesTab();
      }
      else if (tab === 'saved-products') loadFavoritesTab('products');
      else if (tab === 'saved-businesses') loadFavoritesTab('businesses');
      else if (tab === 'settings') loadProfileTab(); 
    });
  });
}

function loadDashboardTab() {
  const content = document.getElementById('panel-content');
  const profileStatus = AppStore.getProfileCompletionStatus(); 

  const tasksHtml = profileStatus.missingTasks.length > 0 
    ? `<ul style="margin-top: 10px; font-size: 0.85rem; color: #ef4444; padding-right: 20px;">
        ${profileStatus.missingTasks.map(task => `<li>${task}</li>`).join('')}
       </ul>`
    : `<p style="margin-top: 10px; font-size: 0.9rem; color: #10b981;"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: text-bottom; margin-left: 4px;"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg> پروفایل شما کامل است!</p>`;

  content.innerHTML = `
    <h1 style="font-size: 1.8rem; margin-bottom: 1.5rem;">خلاصه فعالیت‌های خرید شما</h1>
    
    <div style="background: white; border: 1px solid var(--color-border); border-radius: 12px; padding: 1.5rem; margin-bottom: 2rem; display: flex; align-items: center; gap: 2rem; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
      <div style="flex-shrink: 0; text-align: center;">
        <div style="width: 80px; height: 80px; border-radius: 50%; background: conic-gradient(var(--color-primary) ${profileStatus.percentage}%, #e2e8f0 0); display: flex; align-items: center; justify-content: center;">
          <div style="width: 65px; height: 65px; background: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 1.2rem; color: var(--color-primary);">
            ${profileStatus.percentage}%
          </div>
        </div>
      </div>
      <div>
        <h3 style="margin-bottom: 5px;">وضعیت تکمیل پروفایل شرکت</h3>
        <p style="color: var(--color-text-muted); font-size: 0.9rem;">برای دسترسی بهتر به امکانات و اعتمادسازی، پروفایل خود را کامل کنید.</p>
        ${tasksHtml}
      </div>
      <div style="margin-right: auto;">
        <button class="btn btn-primary" onclick="document.querySelector('[data-tab=\\'settings\\']').click()">تکمیل پروفایل</button>
      </div>
    </div>

    <div class="panel-stats-grid">
      <div class="stat-card" style="border-bottom: 4px solid var(--color-primary);">
        <h3>استعلام‌های مستقیم</h3>
        <div class="stat-value" style="color: var(--color-primary);">${currentSummary.rfqsCount}</div>
      </div>
      <div class="stat-card" style="border-bottom: 4px solid #10b981;">
        <h3>مناقصات عمومی</h3>
        <div class="stat-value" style="color: #10b981;">${currentSummary.tendersCount || 0}</div>
      </div>
      <div class="stat-card" style="border-bottom: 4px solid #f59e0b;">
        <h3>پیشنهادات دریافت شده</h3>
        <div class="stat-value" style="color: #f59e0b;">${currentSummary.proposalsCount || 0}</div>
      </div>
      <div class="stat-card" style="border-bottom: 4px solid #ef4444;">
        <h3>محصولات نشان‌شده</h3>
        <div class="stat-value" style="color: #ef4444;">${AppStore.getFavProducts().length}</div>
      </div>
    </div>
  `;
}

function loadRfqsTab() {
  const content = document.getElementById('panel-content');
  content.innerHTML = `
    <h2 style="font-size: 1.5rem; margin-bottom: 1.5rem;"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: bottom; margin-left: 8px;"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg> استعلام‌های ارسالی (مستقیم)</h2>
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
          ${currentSummary.rfqs.length > 0 ? currentSummary.rfqs.map(rfq => {
            let statusHtml = '';
            if (rfq.status === 'pending') statusHtml = '<span class="status-badge status-pending"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-left: 4px;"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 15 15"></polyline></svg> در انتظار پاسخ</span>';
            else if (rfq.status === 'replied') statusHtml = '<span class="status-badge status-replied">پاسخ داده شده</span>';
            else if (rfq.status === 'in_negotiation') statusHtml = '<span class="status-badge" style="background:#e0e7ff; color:#4338ca;">در حال مذاکره</span>';
            
            return `
            <tr>
              <td style="font-weight: 600;">${rfq.productName}</td>
              <td style="color: var(--color-primary);">${rfq.supplierName}</td>
              <td style="color: var(--color-text-muted);">${rfq.date}</td>
              <td>${statusHtml}</td>
              <td>
                <button class="btn btn-outline" style="padding: 4px 8px; font-size: 0.8rem;" onclick="openViewModal('${rfq.id}')">
                  مشاهده پرونده
                </button>
              </td>
            </tr>
          `}).join('') : '<tr><td colspan="5" style="text-align:center;">درخواستی ثبت نشده است</td></tr>'}
        </tbody>
      </table>
    </div>
  `;
}

window.loadTendersTab = async () => {
    const content = document.getElementById('panel-content');
    content.innerHTML = '<div style="text-align: center; padding: 3rem;">در حال دریافت اطلاعات...</div>';
    
    const tenders = await BuyerService.getBuyerTenders();
    
    content.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
        <h2 style="font-size: 1.5rem;"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: bottom; margin-left: 8px;"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle></svg> درخواست‌های مناقصه‌ای (عمومی)</h2>
        <button class="btn btn-primary" onclick="openTenderModal()" style="display: flex; align-items: center; gap: 6px;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg> ثبت مناقصه جدید
        </button>
      </div>

      <div class="panel-table-container">
        <table class="panel-table">
          <thead>
            <tr>
              <th>عنوان درخواست</th>
              <th>مقدار</th>
              <th>تاریخ ثبت</th>
              <th>پیشنهادات</th>
              <th>وضعیت</th>
              <th>عملیات</th>
            </tr>
          </thead>
          <tbody>
            ${tenders.length > 0 ? tenders.map(t => `
              <tr>
                <td style="font-weight: 600;">${t.title}</td>
                <td>${t.quantity}</td>
                <td style="color: var(--color-text-muted);">${t.date}</td>
                <td style="font-weight: bold; color: ${t.proposals.length > 0 ? '#10b981' : '#94a3b8'};">${t.proposals.length} پیشنهاد</td>
                <td>
                  <span class="status-badge" style="background: ${t.status === 'active' ? '#dbeafe' : (t.status === 'in_negotiation' ? '#e0e7ff' : '#f1f5f9')}; color: ${t.status === 'active' ? '#2563eb' : (t.status === 'in_negotiation' ? '#4338ca' : '#64748b')};">
                    ${t.status === 'active' ? 'در جریان' : (t.status === 'in_negotiation' ? 'در حال مذاکره' : 'بسته شده')}
                  </span>
                </td>
                <td>
                  <button class="btn btn-primary" style="padding: 4px 8px; font-size: 0.8rem;" onclick="viewProposals('${t.id}')">بررسی پرونده</button>
                  ${t.status === 'active' ? `<button class="btn btn-outline" style="padding: 4px 8px; font-size: 0.8rem;" onclick='openTenderModal(${JSON.stringify(t)})'>ویرایش</button>` : ''}
                  <button class="btn btn-outline" style="padding: 4px 8px; font-size: 0.8rem; color: #ef4444; border-color: #ef4444;" onclick="deleteTender('${t.id}')">حذف</button>
                </td>
              </tr>
            `).join('') : '<tr><td colspan="6" style="text-align:center;">مناقصه‌ای ثبت نکرده‌اید</td></tr>'}
          </tbody>
        </table>
      </div>
    `;
};

window.loadPitchesTab = async () => {
    const content = document.getElementById('panel-content');
    content.innerHTML = '<div style="text-align: center; padding: 3rem;">در حال بارگذاری پیشنهادات...</div>';
    
    const pitches = await BuyerService.getIncomingServicePitches();
    
    content.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
        <h2 style="font-size: 1.5rem;"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: bottom; margin-left: 8px;"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg> پیشنهادات خدمات جانبی دریافت شده</h2>
      </div>

      <div class="panel-table-container">
        <table class="panel-table">
          <thead>
            <tr>
              <th>ارائه‌دهنده خدمات</th>
              <th>مربوط به معامله</th>
              <th>نوع خدمات پیشنهادی</th>
              <th>تاریخ</th>
              <th>عملیات</th>
            </tr>
          </thead>
          <tbody>
            ${pitches.length > 0 ? pitches.map(p => `
              <tr>
                <td style="font-weight: 600; color: var(--color-primary);">${p.supplierName}</td>
                <td>${p.dealTitle}</td>
                <td><span style="background: #fdf4ff; color: #a21caf; padding: 2px 8px; border-radius: 12px; font-size: 0.8rem; font-weight: bold; border: 1px solid #f5d0fe;">${p.type}</span></td>
                <td style="color: var(--color-text-muted);">${p.date}</td>
                <td>
                  <button class="btn btn-primary" style="padding: 4px 8px; font-size: 0.8rem; background-color: #8b5cf6; border-color: #8b5cf6;" onclick="viewPitchDetail('${p.id}', '${p.supplierName}', '${p.message}')">بررسی و مذاکره</button>
                </td>
              </tr>
            `).join('') : '<tr><td colspan="5" style="text-align:center;">هیچ پیشنهاد خدماتی برای معاملات شما ارسال نشده است.</td></tr>'}
          </tbody>
        </table>
      </div>
    `;
};

window.viewPitchDetail = (pitchId, supplierName, message) => {
    const canViewContact = AppStore.checkFeatureAccess('view_contact');

    const modalHtml = `
      <div id="view-pitch-modal" class="modal-overlay">
        <div class="modal-content">
          <div class="modal-header">
            <h3>پیشنهاد همکاری از: ${supplierName}</h3>
            <button class="btn-close" onclick="document.getElementById('view-pitch-modal').remove()"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button>
          </div>
          <div class="modal-body">
            <div style="background: #f8fafc; padding: 1.5rem; border-radius: 8px; border: 1px solid var(--color-border); margin-bottom: 1.5rem;">
                <p style="color: var(--color-text-main); line-height: 1.6; font-size: 0.95rem; margin:0;">${message || 'بدون متن'}</p>
            </div>
            
            <div style="border-top: 1px dashed var(--color-border); padding-top: 1rem;">
              <p style="font-size: 0.85rem; color: var(--color-text-muted); text-align: center; margin-bottom: 1rem;">اطلاعات تماس جهت مذاکره در خصوص خدمات:</p>
              <div style="display: flex; gap: 10px; justify-content: center;">
                <button class="btn btn-primary" style="flex: 1; padding: 8px; font-size: 0.9rem;" onclick="${canViewContact ? "alert('سیستم چت امن به زودی فعال می‌شود.')" : "showUpgradePaywall('ارسال پیام خصوصی')"}"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-left: 4px;"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg> چت مستقیم</button>
                <button class="btn btn-outline" style="flex: 1; padding: 8px; font-size: 0.9rem;" onclick="${canViewContact ? "alert('ایمیل شرکت: info@serviceprovider.com')" : "showUpgradePaywall('مشاهده ایمیل شرکت‌ها')"}"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-left: 4px;"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg> ایمیل</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
};

window.addTenderCatRow = () => {
    const container = document.getElementById('t-cat-container');
    const firstSelectHtml = container.querySelector('.tender-cat-select').innerHTML; 
    const row = document.createElement('div');
    row.className = 'cat-row';
    row.style = "display: flex; gap: 10px; margin-bottom: 10px;";
    row.innerHTML = `
        <select class="form-input tender-cat-select" style="flex: 1;">
            ${firstSelectHtml}
        </select>
        <button class="btn btn-outline" style="color:#ef4444; border-color:#ef4444; padding:0 15px; display: inline-flex; align-items: center; justify-content: center;" onclick="this.parentElement.remove()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
    `;
    container.appendChild(row);
};

window.openTenderModal = async (existingData = null) => {
    const categories = await CategoryService.getAllCategories();
    
    const selectedCats = existingData ? (Array.isArray(existingData.categoryId) ? existingData.categoryId : [existingData.categoryId]) : [''];

    let catRowsHtml = '';
    selectedCats.forEach((catId, index) => {
        const optionsHtml = categories.map(c => `<option value="${c.id}" ${catId === c.id ? 'selected' : ''}>${c.name}</option>`).join('');
        catRowsHtml += `
            <div class="cat-row" style="display: flex; gap: 10px; margin-bottom: 10px;">
                <select class="form-input tender-cat-select" style="flex: 1;">
                    ${optionsHtml}
                </select>
                ${index === 0 ? 
                    `<button disabled class="btn btn-outline" style="opacity:0.5; padding:0 15px; cursor:not-allowed; display: inline-flex; align-items: center; justify-content: center;"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button>` : 
                    `<button class="btn btn-outline" style="color:#ef4444; border-color:#ef4444; padding:0 15px; display: inline-flex; align-items: center; justify-content: center;" onclick="this.parentElement.remove()"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button>`
                }
            </div>
        `;
    });

    const modalHtml = `
      <div id="tender-modal" class="modal-overlay">
        <div class="modal-content">
          <div class="modal-header">
            <h3>${existingData ? 'ویرایش مناقصه' : 'ثبت درخواست مناقصه جدید'}</h3>
            <button class="btn-close" onclick="document.getElementById('tender-modal').remove()"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button>
          </div>
          <div class="modal-body" style="max-height: 80vh; overflow-y: auto;">
            <input type="hidden" id="t-id" value="${existingData ? existingData.id : ''}">
            
            <label style="font-weight: 600; display:block; margin-bottom:5px;">عنوان درخواست *</label>
            <input type="text" id="t-title" class="form-input" value="${existingData ? existingData.title : ''}" style="margin-bottom: 15px;">
            
            <label style="font-weight: 600; display:block; margin-bottom:5px;">دسته‌بندی‌های مرتبط *</label>
            <div id="t-cat-container">
                ${catRowsHtml}
            </div>
            <button class="btn btn-outline" style="margin-bottom: 15px; border-style: dashed; width: 100%; display: inline-flex; align-items: center; justify-content: center; gap: 6px;" onclick="addTenderCatRow()">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg> افزودن دسته‌بندی دیگر
            </button>
            
            <label style="font-weight: 600; display:block; margin-bottom:5px;">مقدار مورد نیاز *</label>
            <input type="text" id="t-qty" class="form-input" value="${existingData ? existingData.quantity : ''}" style="margin-bottom: 15px;">
            
            <label style="font-weight: 600; display:block; margin-bottom:5px;">توضیحات تکمیلی و شرایط</label>
            <textarea id="t-desc" class="form-input" rows="4">${existingData ? existingData.description : ''}</textarea>
            
            <button class="btn btn-primary btn-full" style="margin-top: 1.5rem;" onclick="saveTender(event)">${existingData ? 'ذخیره تغییرات' : 'انتشار مناقصه'}</button>
          </div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
};

window.saveTender = async (event) => {
    const catSelects = document.querySelectorAll('.tender-cat-select');
    const selectedCategories = Array.from(catSelects).map(select => select.value).filter(val => val);
    const uniqueCategories = [...new Set(selectedCategories)]; 

    const data = {
        id: document.getElementById('t-id').value,
        title: document.getElementById('t-title').value,
        categoryId: uniqueCategories, 
        quantity: document.getElementById('t-qty').value,
        description: document.getElementById('t-desc').value
    };

    if(!data.title || !data.quantity || uniqueCategories.length === 0) return;
    
    event.target.textContent = 'در حال ذخیره...';
    event.target.disabled = true;
    
    await BuyerService.submitTender(data);
    currentSummary = await BuyerService.getDashboardSummary(); 
    document.getElementById('tender-modal').remove();
    loadTendersTab();
};

window.deleteTender = async (id) => {
    if(confirm('آیا از حذف این درخواست مطمئن هستید؟')) {
        await BuyerService.deleteTender(id);
        currentSummary = await BuyerService.getDashboardSummary(); 
        loadTendersTab();
    }
};

window.acceptProposal = async (tenderId, proposalId, btn) => {
    btn.textContent = 'در حال پردازش...';
    btn.disabled = true;
    await BuyerService.acceptTenderProposal(tenderId, proposalId);
    document.getElementById('props-modal').remove();
    currentSummary = await BuyerService.getDashboardSummary();
    loadTendersTab();
    alert('مذاکره با موفقیت شروع شد. پیمانکاران خدماتی مطلع خواهند شد.');
};

window.viewProposals = async (tenderId) => {
    const tenders = await BuyerService.getBuyerTenders();
    const tender = tenders.find(t => t.id === tenderId);
    const isNegotiating = tender.status === 'in_negotiation';
    
    const proposalsHtml = tender.proposals.length === 0 ? '<p style="text-align:center; color:gray; padding: 2rem 0;">هنوز پیشنهادی ارسال نشده است.</p>' : 
    tender.proposals.map(p => `
        <div style="background: #f8fafc; padding: 1rem; border-radius: 8px; margin-bottom: 1rem; border: 1px solid var(--color-border);">
            <div style="display:flex; justify-content:space-between; margin-bottom:10px;">
                <strong style="color:var(--color-primary);">${businesses.find(b=>b.id===p.supplierId)?.name || 'فروشنده'}</strong>
                <span style="font-size:0.8rem; color:gray;">${p.date}</span>
            </div>
            <p style="margin-bottom: 10px; font-size: 0.95rem;">${p.message}</p>
            <div style="background: white; padding: 8px; border-radius: 4px; display:inline-block; font-weight:bold; color:#10b981; border: 1px solid #a7f3d0;">
                مبلغ پیشنهادی: ${p.price}
            </div>
            ${!isNegotiating ? `<button class="btn btn-primary" style="margin-top:10px; width:100%; padding: 6px;" onclick="acceptProposal('${tender.id}', '${p.id}', this)">شروع مذاکره (تایید پیشنهاد)</button>` : ''}
        </div>
    `).join('');

    const modalHtml = `
      <div id="props-modal" class="modal-overlay">
        <div class="modal-content">
          <div class="modal-header">
            <h3>پرونده پیشنهادات: ${tender.title}</h3>
            <button class="btn-close" onclick="document.getElementById('props-modal').remove()"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button>
          </div>
          <div class="modal-body" style="max-height: 400px; overflow-y: auto;">
            ${isNegotiating ? '<div style="background:#e0e7ff; color:#4338ca; padding:10px; text-align:center; border-radius:8px; margin-bottom:15px; font-size:0.9rem; font-weight:bold;">این مناقصه در مرحله مذاکره قرار دارد</div>' : ''}
            ${proposalsHtml}
          </div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
};

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
      <h2 style="font-size: 1.5rem; margin-bottom: 1.5rem;"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: bottom; margin-left: 8px;"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg> محصولات ذخیره شده (${favoriteProducts.length})</h2>
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
      <h2 style="font-size: 1.5rem; margin-bottom: 1.5rem;"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: bottom; margin-left: 8px;"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect><path d="M9 22v-4h6v4"></path><path d="M8 6h.01"></path><path d="M16 6h.01"></path><path d="M12 6h.01"></path><path d="M12 10h.01"></path><path d="M12 14h.01"></path><path d="M16 10h.01"></path><path d="M16 14h.01"></path><path d="M8 10h.01"></path><path d="M8 14h.01"></path></svg> تأمین‌کنندگان نشان‌شده (${favoriteBusinesses.length})</h2>
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

window.startRfqNegotiation = async (rfqId, btn) => {
    btn.textContent = 'در حال پردازش...';
    btn.disabled = true;
    await BuyerService.startNegotiationForRfq(rfqId);
    document.getElementById('view-modal').remove();
    currentSummary = await BuyerService.getDashboardSummary();
    loadRfqsTab();
};

window.openViewModal = (rfqId) => {
  const rfq = currentSummary.rfqs.find(r => r.id === rfqId);
  if (!rfq) return;

  const isReplied = rfq.status === 'replied' || rfq.status === 'in_negotiation';
  const isNegotiating = rfq.status === 'in_negotiation';

  const canViewContact = AppStore.checkFeatureAccess('view_contact');

  const modalHtml = `
    <div id="view-modal" class="modal-overlay">
      <div class="modal-content">
        <div class="modal-header">
          <h3>جزئیات استعلام برای: ${rfq.productName}</h3>
          <button class="btn-close" onclick="document.getElementById('view-modal').remove()"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button>
        </div>
        <div class="modal-body">
          ${isNegotiating ? '<div style="background:#e0e7ff; color:#4338ca; padding:10px; text-align:center; border-radius:8px; margin-bottom:15px; font-size:0.9rem; font-weight:bold;">این درخواست در مرحله مذاکره قرار دارد</div>' : ''}
          
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
              ${!isNegotiating ? `
                <button class="btn btn-primary btn-full" style="padding: 10px; font-size: 0.95rem; margin-bottom: 10px;" onclick="startRfqNegotiation('${rfq.id}', this)">
                  تایید پاسخ و شروع مذاکره
                </button>
              ` : `
                <p style="font-size: 0.85rem; color: var(--color-text-muted); text-align: center; margin-bottom: 1rem;">اطلاعات تماس تأمین‌کننده جهت ادامه مذاکره:</p>
                <div style="display: flex; gap: 10px; justify-content: center;">
                  <button class="btn btn-primary" style="flex: 1; padding: 8px; font-size: 0.9rem;" onclick="${canViewContact ? "alert('سیستم چت امن به زودی فعال می‌شود.')" : "showUpgradePaywall('ارسال پیام خصوصی')"}"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-left: 4px;"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg> چت مستقیم</button>
                  <button class="btn btn-outline" style="flex: 1; padding: 8px; font-size: 0.9rem;" onclick="${canViewContact ? "alert('ایمیل شرکت: info@company.com')" : "showUpgradePaywall('مشاهده ایمیل شرکت‌ها')"}"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-left: 4px;"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg> ایمیل</button>
                  <button class="btn btn-outline" style="flex: 1; padding: 8px; font-size: 0.9rem;" onclick="${canViewContact ? "alert('تلفن تماس: 021-0000000')" : "showUpgradePaywall('مشاهده شماره تلفن')"}"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-left: 4px;"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg> تماس</button>
                </div>
              </div>
            `}
          ` : `
            <div style="text-align: center; padding: 1rem; color: var(--color-text-muted); font-size: 0.9rem; border: 1px dashed var(--color-border); border-radius: var(--radius-md);">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-left: 4px;"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 15 15"></polyline></svg> شرکت ${rfq.supplierName} هنوز پاسخی ارسال نکرده است.
            </div>
          `}
        </div>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', modalHtml);
};

window.currentProfileStep = 1;

window.showProfileStep = (step) => {
  document.querySelectorAll('.profile-step-content').forEach(el => el.style.display = 'none');
  document.getElementById(`step-${step}`).style.display = 'block';

  document.querySelectorAll('.step-indicator').forEach((el, index) => {
    if (index + 1 < step) {
      el.className = 'step-indicator step-completed';
      el.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-left: 4px;"><polyline points="20 6 9 17 4 12"></polyline></svg> ${el.dataset.title}`;
    } else if (index + 1 === step) {
      el.className = 'step-indicator step-active';
      el.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-left: 4px;"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1 0-2.83 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg> ${el.dataset.title}`;
    } else {
      el.className = 'step-indicator step-pending';
      el.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-left: 4px;"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 15 15"></polyline></svg> ${el.dataset.title}`;
    }
  });
  window.currentProfileStep = step;
};

window.nextProfileStep = () => {
  if(window.currentProfileStep < 3) window.showProfileStep(window.currentProfileStep + 1);
};
window.prevProfileStep = () => {
  if(window.currentProfileStep > 1) window.showProfileStep(window.currentProfileStep - 1);
};

window.toggleServiceFields = () => {
    const isChecked = document.getElementById('role-service').checked;
    document.getElementById('service-types-container').style.display = isChecked ? 'block' : 'none';
};

function loadProfileTab() {
  const content = document.getElementById('panel-content');
  const roles = currentProfile.roles || ['buyer', 'supplier'];
  
  const isBuyer = roles.includes('buyer') ? 'checked' : '';
  const isSupplier = roles.includes('supplier') ? 'checked' : '';
  const isService = roles.includes('service_provider') ? 'checked' : '';

  const style = `
    <style>
      .step-container { display: flex; justify-content: space-between; margin-bottom: 2rem; background: var(--color-surface); padding: 10px; border-radius: 8px; border: 1px solid var(--color-border); }
      .step-indicator { flex: 1; text-align: center; padding: 10px; font-weight: 600; font-size: 0.9rem; transition: 0.3s; color: #94a3b8; border-bottom: 3px solid transparent; }
      .step-active { color: var(--color-primary); border-bottom-color: var(--color-primary); }
      .step-completed { color: #10b981; border-bottom-color: #10b981; }
      .profile-step-content { display: none; animation: fadeIn 0.4s ease-in-out; }
      .checkbox-group { display: flex; gap: 15px; margin-top: 5px; }
      .checkbox-card { border: 1px solid var(--color-border); padding: 10px 15px; border-radius: 8px; display: flex; align-items: center; gap: 10px; cursor: pointer; transition: 0.2s; }
      .checkbox-card:hover { border-color: var(--color-primary); background: #f8fafc; }
      @keyframes fadeIn { from {opacity: 0; transform: translateY(5px);} to {opacity: 1; transform: translateY(0);} }
    </style>
  `;

  content.innerHTML = style + `
    <h2 style="font-size: 1.5rem; margin-bottom: 1.5rem;"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: bottom; margin-left: 8px;"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg> پروفایل تجاری و هویتی شرکت</h2>
    
    <div class="step-container">
      <div class="step-indicator" data-title="اطلاعات پایه">اطلاعات پایه</div>
      <div class="step-indicator" data-title="تماس و آدرس">تماس و آدرس</div>
      <div class="step-indicator" data-title="ساختار فعالیت">ساختار فعالیت</div>
    </div>

    <div style="background: white; padding: 2.5rem; border-radius: 12px; border: 1px solid var(--color-border); box-shadow: 0 4px 6px rgba(0,0,0,0.02);">
      
      <div id="step-1" class="profile-step-content">
        <h3 style="margin-bottom: 1.5rem; color: var(--color-text-main);">۱. اطلاعات هویتی و ثبت شرکت</h3>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem;">
          <div><label style="font-weight: 600; display:block; margin-bottom:5px;">نام رسمی شرکت *</label><input type="text" class="form-input" value="${currentProfile.name || ''}"></div>
          <div><label style="font-weight: 600; display:block; margin-bottom:5px;">نام انگلیسی (برای صادرات)</label><input type="text" class="form-input" value="${currentProfile.englishName || ''}"></div>
          <div><label style="font-weight: 600; display:block; margin-bottom:5px;">نام تجاری (Brand)</label><input type="text" class="form-input" value="${currentProfile.brand || ''}"></div>
          <div><label style="font-weight: 600; display:block; margin-bottom:5px;">سال تأسیس</label><input type="number" class="form-input" value="${currentProfile.foundedYear || ''}"></div>
          <div style="grid-column: 1 / -1;"><label style="font-weight: 600; display:block; margin-bottom:5px;">معرفی کامل شرکت (درباره ما)</label><textarea class="form-input" rows="4">${currentProfile.description || ''}</textarea></div>
          <div style="grid-column: 1 / -1;"><label style="font-weight: 600; display:block; margin-bottom:5px;">لوگوی شرکت</label><button class="btn btn-outline" style="width: 200px; display: inline-flex; align-items: center; justify-content: center; gap: 6px;"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg> آپلود تصویر جدید</button></div>
        </div>
        <div style="text-align: left; margin-top: 2rem;">
          <button class="btn btn-primary" style="padding: 10px 30px; display: inline-flex; align-items: center; gap: 6px;" onclick="nextProfileStep()">مرحله بعد <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg></button>
        </div>
      </div>

      <div id="step-2" class="profile-step-content">
        <h3 style="margin-bottom: 1.5rem; color: var(--color-text-main);">۲. اطلاعات ارتباطی و موقعیت استقرار</h3>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem;">
          <div><label style="font-weight: 600; display:block; margin-bottom:5px;">کشور</label><input type="text" class="form-input" value="${currentProfile.country || 'ایران'}"></div>
          <div><label style="font-weight: 600; display:block; margin-bottom:5px;">استان / شهر</label><input type="text" class="form-input" value="${currentProfile.city || ''}"></div>
          <div style="grid-column: 1 / -1;"><label style="font-weight: 600; display:block; margin-bottom:5px;">آدرس دقیق دفتر مرکزی</label><input type="text" class="form-input" value="${currentProfile.address || ''}"></div>
          <div><label style="font-weight: 600; display:block; margin-bottom:5px;">ایمیل سازمانی</label><input type="email" class="form-input" value="${currentProfile.email || ''}"></div>
          <div><label style="font-weight: 600; display:block; margin-bottom:5px;">تلفن ثابت (با کد)</label><input type="text" class="form-input" value="${currentProfile.phone || ''}" dir="ltr"></div>
          <div><label style="font-weight: 600; display:block; margin-bottom:5px;">وب‌سایت رسمی</label><input type="url" class="form-input" value="${currentProfile.website || ''}" dir="ltr"></div>
          <div><label style="font-weight: 600; display:block; margin-bottom:5px;">شماره واتساپ شرکت</label><input type="text" class="form-input" value="${currentProfile.contact?.whatsapp || ''}" dir="ltr"></div>
        </div>
        <div style="display: flex; justify-content: space-between; margin-top: 2rem;">
          <button class="btn btn-outline" style="padding: 10px 30px; display: inline-flex; align-items: center; gap: 6px;" onclick="prevProfileStep()"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg> مرحله قبل</button>
          <button class="btn btn-primary" style="padding: 10px 30px; display: inline-flex; align-items: center; gap: 6px;" onclick="nextProfileStep()">مرحله بعد <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg></button>
        </div>
      </div>

      <div id="step-3" class="profile-step-content">
        <h3 style="margin-bottom: 1.5rem; color: var(--color-text-main);">۳. ماهیت فعالیت و نقش‌ها در TradeCore</h3>
        
        <div style="margin-bottom: 2rem; background: #f8fafc; padding: 1.5rem; border-radius: 8px; border: 1px dashed var(--color-primary);">
          <label style="font-weight: bold; font-size: 1.1rem; display:block; margin-bottom:10px; color: var(--color-primary);">نقش‌های شما در پلتفرم (می‌توانید چند مورد را انتخاب کنید)</label>
          <div class="checkbox-group" style="flex-wrap: wrap;">
            <label class="checkbox-card"><input type="checkbox" id="role-buyer" ${isBuyer}> خریدار (ارسال RFQ / ثبت مناقصه)</label>
            <label class="checkbox-card"><input type="checkbox" id="role-supplier" ${isSupplier}> تأمین‌کننده کالا (فروش محصولات)</label>
            <label class="checkbox-card"><input type="checkbox" id="role-service" ${isService} onchange="toggleServiceFields()"> ارائه‌دهنده خدمات صنعتی/تجاری</label>
          </div>
        </div>

        <div id="service-types-container" style="display: ${isService ? 'block' : 'none'}; margin-bottom: 2rem; padding: 1.5rem; border-radius: 8px; background: #fff; border: 1px solid #e2e8f0; box-shadow: inset 0 2px 4px rgba(0,0,0,0.02);">
          <label style="font-weight: 600; display:block; margin-bottom:10px;">حوزه تخصصی خدمات شما (امکان انتخاب چند مورد)</label>
          <div style="display: flex; flex-wrap: wrap; gap: 10px;">
            <label class="checkbox-card" style="padding: 5px 10px; font-size: 0.9rem;"><input type="checkbox"> حمل‌ونقل و لجستیک بین‌المللی</label>
            <label class="checkbox-card" style="padding: 5px 10px; font-size: 0.9rem;"><input type="checkbox"> لجستیک داخلی</label>
            <label class="checkbox-card" style="padding: 5px 10px; font-size: 0.9rem;"><input type="checkbox"> بیمه باربری و مسئولیت</label>
            <label class="checkbox-card" style="padding: 5px 10px; font-size: 0.9rem;"><input type="checkbox"> بازرسی کیفی (PSI)</label>
            <label class="checkbox-card" style="padding: 5px 10px; font-size: 0.9rem;"><input type="checkbox"> ترخیص و خدمات گمرکی</label>
            <label class="checkbox-card" style="padding: 5px 10px; font-size: 0.9rem;"><input type="checkbox"> پیمانکاری اجرایی (EPC)</label>
            <label class="checkbox-card" style="padding: 5px 10px; font-size: 0.9rem;"><input type="checkbox"> طراحی و مهندسی</label>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr; gap: 1.5rem;">
          <div><label style="font-weight: 600; display:block; margin-bottom:5px;">صنعت اصلی فعالیت (دسته مادر)</label><input type="text" class="form-input" value="${currentProfile.industry || ''}"></div>
        </div>

        <div style="display: flex; justify-content: space-between; margin-top: 2rem; border-top: 1px solid var(--color-border); padding-top: 1.5rem;">
          <button class="btn btn-outline" style="padding: 10px 30px; display: inline-flex; align-items: center; gap: 6px;" onclick="prevProfileStep()"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg> مرحله قبل</button>
          <button class="btn btn-primary" style="padding: 10px 40px; background: #10b981; border-color: #10b981; display: inline-flex; align-items: center; gap: 6px;" onclick="alert('پروفایل کسب‌وکار شما با موفقیت به‌روزرسانی شد.')"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg> ذخیره نهایی پروفایل</button>
        </div>
      </div>
    </div>
  `;

  setTimeout(() => window.showProfileStep(1), 0);
}