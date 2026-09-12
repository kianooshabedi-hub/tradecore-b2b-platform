// js/pages/buyerPanel.js

import { BuyerService } from '../services/buyerService.js';
import { AppStore } from '../data/appStore.js';
import { ProductService } from '../services/productService.js';
import { businesses } from '../data/businesses.js';
import { CategoryService } from '../services/categoryService.js'; 
import { MessageService } from '../services/messageService.js';
import { SupportService } from '../services/supportService.js'; // 🌟 اضافه شدن سرویس پشتیبانی

let currentProfile = null;
let currentSummary = null;
let currentActiveChatId = null;
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

function injectMissingTabs() {
    const navUl = document.querySelector('.panel-nav ul');
    if(navUl && !document.querySelector('[data-tab="messages"]')) {
        const savedProductsLi = document.querySelector('[data-tab="saved-products"]').parentElement;
        const newTabsHtml = `
            <li><a href="#" data-tab="deals"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: text-bottom; margin-left: 6px;"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg> معاملات من</a></li>
            <li><a href="#" data-tab="messages"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: text-bottom; margin-left: 6px;"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg> پیام‌ها و چت‌ها</a></li>
            <li><a href="#" data-tab="shortlist"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: text-bottom; margin-left: 6px;"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg> لیست کوتاه مقایسه</a></li>
            <li><a href="#" data-tab="notifications"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: text-bottom; margin-left: 6px;"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg> مرکز اعلان‌ها</a></li>
        `;
        savedProductsLi.insertAdjacentHTML('beforebegin', newTabsHtml);
    }

    // 🌟 اضافه کردن اتوماتیک تب پشتیبانی
    if(navUl && !document.querySelector('[data-tab="support"]')) {
        const settingsLi = document.querySelector('[data-tab="settings"]').parentElement;
        const supportHtml = `
            <li><a href="#" data-tab="support"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: text-bottom; margin-left: 6px;"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg> پشتیبانی و تیکت</a></li>
        `;
        settingsLi.insertAdjacentHTML('beforebegin', supportHtml);
    }
}

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
  injectMissingTabs();
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
      else if (tab === 'deals') loadDealsTab();
      else if (tab === 'messages') loadMessagesTab();
      else if (tab === 'shortlist') loadShortlistTab();
      else if (tab === 'saved-products') loadFavoritesTab('products');
      else if (tab === 'saved-businesses') loadFavoritesTab('businesses');
      else if (tab === 'notifications') loadNotificationsTab();
      else if (tab === 'support') loadSupportTab(); // 🌟 رویداد تب پشتیبانی
      else if (tab === 'settings') loadProfileTab(); 
    });
  });

  const pendingChat = localStorage.getItem('tradecore_open_chat');
  if (pendingChat) {
      localStorage.removeItem('tradecore_open_chat');
      setTimeout(() => {
          const msgTab = document.querySelector('[data-tab="messages"]');
          if (msgTab) {
              msgTab.click(); 
              setTimeout(() => window.openChatView(pendingChat), 300); 
          }
      }, 100);
  }
}

// ==========================================
// 🌟 Tabs Rendering Functions
// ==========================================

function loadDashboardTab() {
  const content = document.getElementById('panel-content');
  const profileStatus = AppStore.getProfileCompletionStatus(); 
  const tasksHtml = profileStatus.missingTasks.length > 0 
    ? `<ul style="margin-top: 10px; font-size: 0.85rem; color: #ef4444; padding-right: 20px;">
        ${profileStatus.missingTasks.map(task => `<li>${task}</li>`).join('')}
       </ul>`
    : `<p style="margin-top: 10px; font-size: 0.9rem; color: #10b981;"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: text-bottom; margin-left: 4px;"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg> پروفایل شما کامل است!</p>`;

  const dealsCount = AppStore.getAllDeals().filter(d => d.buyerId === AppStore.getActiveUserId()).length;

  content.innerHTML = `
    <h1 style="font-size: 1.8rem; margin-bottom: 1.5rem;">خلاصه فعالیت‌های خرید شما</h1>
    <div style="background: white; border: 1px solid var(--color-border); border-radius: 12px; padding: 1.5rem; margin-bottom: 2rem; display: flex; align-items: center; gap: 2rem; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
      <div style="flex-shrink: 0; text-align: center;">
        <div style="width: 80px; height: 80px; border-radius: 50%; background: conic-gradient(var(--color-primary) ${profileStatus.percentage}%, #e2e8f0 0); display: flex; align-items: center; justify-content: center;">
          <div style="width: 65px; height: 65px; background: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 1.2rem; color: var(--color-primary);">${profileStatus.percentage}%</div>
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
        <h3>معاملات در جریان</h3>
        <div class="stat-value" style="color: #f59e0b;">${dealsCount}</div>
      </div>
      <div class="stat-card" style="border-bottom: 4px solid #8b5cf6;">
        <h3>لیست کوتاه تأمین‌کنندگان</h3>
        <div class="stat-value" style="color: #8b5cf6;">${AppStore.getSupplierShortlist().length}</div>
      </div>
    </div>
  `;
}

// ==========================================
// 🌟 توابع ماژول پشتیبانی (Support System)
// ==========================================

window.loadSupportTab = async () => {
    const content = document.getElementById('panel-content');
    content.innerHTML = '<div style="text-align: center; padding: 3rem;">در حال دریافت سوابق تیکت‌ها...</div>';
    
    const tickets = await SupportService.getUserTickets(AppStore.getActiveUserId());
    
    content.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
            <h2 style="font-size: 1.5rem;"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: bottom; margin-left: 8px;"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg> سیستم پشتیبانی و تیکت‌ها</h2>
            <button class="btn btn-primary" onclick="openNewTicketModal()">+ ثبت تیکت جدید</button>
        </div>
        <div class="panel-table-container">
            <table class="panel-table">
                <thead>
                    <tr>
                        <th>شناسه</th>
                        <th>موضوع تیکت</th>
                        <th>آخرین بروزرسانی</th>
                        <th>وضعیت</th>
                        <th>عملیات</th>
                    </tr>
                </thead>
                <tbody>
                    ${tickets.length > 0 ? tickets.map(t => {
                        let badge = t.status === 'open' ? '<span class="status-badge" style="background:#fef3c7; color:#d97706;">در انتظار پاسخ</span>' :
                                    t.status === 'replied' ? '<span class="status-badge" style="background:#d1fae5; color:#059669;">پاسخ پشتیبانی</span>' :
                                    '<span class="status-badge" style="background:#f1f5f9; color:#475569;">بسته شده</span>';
                        return `
                            <tr>
                                <td style="font-family: monospace; color:#64748b; font-size:0.85rem;">#${t.id.split('-')[1]}</td>
                                <td style="font-weight: 600;">${t.subject}</td>
                                <td style="color: var(--color-text-muted);" dir="ltr">${new Date(t.updatedAt).toLocaleDateString('fa-IR')}</td>
                                <td>${badge}</td>
                                <td>
                                    <button class="btn btn-outline" style="padding: 4px 8px; font-size: 0.8rem;" onclick="openTicketViewModal('${t.id}')">مشاهده گفتگو</button>
                                </td>
                            </tr>
                        `;
                    }).join('') : '<tr><td colspan="5" style="text-align:center; padding:2rem;">هیچ تیکت پشتیبانی ثبت نکرده‌اید.</td></tr>'}
                </tbody>
            </table>
        </div>
    `;
};

window.openNewTicketModal = () => {
    const modalHtml = `
        <div id="new-ticket-modal" class="modal-overlay" style="z-index: 9999;">
            <div class="modal-content">
                <div class="modal-header">
                    <h3>ارسال تیکت جدید به پشتیبانی TradeCore</h3>
                    <button class="btn-close" onclick="document.getElementById('new-ticket-modal').remove()">✕</button>
                </div>
                <div class="modal-body" style="text-align:right;">
                    <label style="font-weight: 600; display:block; margin-bottom:5px;">موضوع تیکت *</label>
                    <input type="text" id="ticket-subject" class="form-input" style="margin-bottom: 15px;" placeholder="مثلاً: مشکل در ثبت سفارش یا ارتقای پلن">
                    
                    <label style="font-weight: 600; display:block; margin-bottom:5px;">متن پیام *</label>
                    <textarea id="ticket-message" class="form-input" rows="5" style="margin-bottom: 15px;" placeholder="پیام و توضیحات خود را کامل بنویسید..."></textarea>
                    
                    <button class="btn btn-primary btn-full" onclick="submitNewTicket(event)">ثبت و ارسال تیکت</button>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
};

window.submitNewTicket = async (event) => {
    const subject = document.getElementById('ticket-subject').value.trim();
    const message = document.getElementById('ticket-message').value.trim();
    if(!subject || !message) return alert('لطفاً موضوع و متن پیام را به صورت کامل وارد کنید.');

    event.target.textContent = 'در حال ارسال...';
    event.target.disabled = true;

    await SupportService.createTicket(AppStore.getActiveUserId(), subject, message);
    document.getElementById('new-ticket-modal').remove();
    loadSupportTab();
};

window.openTicketViewModal = async (ticketId) => {
    const tickets = await SupportService.getUserTickets(AppStore.getActiveUserId());
    const tkt = tickets.find(t => t.id === ticketId);
    if(!tkt) return;

    const msgsHtml = tkt.messages.map(m => {
        const isMe = m.sender === 'user';
        return `
            <div style="display: flex; justify-content: ${isMe ? 'flex-start' : 'flex-end'}; margin-bottom: 15px;">
                <div style="max-width: 85%; background: ${isMe ? '#eff6ff' : '#f8fafc'}; border: 1px solid ${isMe ? '#bfdbfe' : '#e2e8f0'}; padding: 10px 15px; border-radius: 8px;">
                    <div style="font-size: 0.75rem; color: #64748b; margin-bottom: 5px; font-weight: bold;">${isMe ? 'شما' : 'تیم پشتیبانی TradeCore'}</div>
                    <p style="margin: 0 0 5px 0; font-size: 0.95rem; line-height: 1.6; color: #1e293b;">${m.text}</p>
                    <span style="font-size: 0.7rem; color: #94a3b8; display: block; text-align: ${isMe ? 'left' : 'right'};" dir="ltr">${m.date}</span>
                </div>
            </div>
        `;
    }).join('');

    const modalHtml = `
        <div id="view-ticket-modal" class="modal-overlay" style="z-index: 9999;">
            <div class="modal-content" style="max-width: 600px; width: 95%;">
                <div class="modal-header">
                    <div>
                        <h3 style="margin: 0; font-size: 1.1rem;">موضوع: ${tkt.subject}</h3>
                        <span style="font-size: 0.8rem; color: #64748b;">وضعیت تیکت: ${tkt.status === 'closed' ? 'بسته شده' : 'باز'}</span>
                    </div>
                    <button class="btn-close" onclick="document.getElementById('view-ticket-modal').remove()">✕</button>
                </div>
                <div class="modal-body" style="padding: 0; background: #fdfdfd; text-align:right;">
                    <div style="padding: 20px; max-height: 400px; min-height: 200px; overflow-y: auto;" id="ticket-chat-area">
                        ${msgsHtml}
                    </div>
                    ${tkt.status !== 'closed' ? `
                    <div style="padding: 15px 20px; border-top: 1px solid var(--color-border); background: white;">
                        <textarea id="ticket-reply-msg" class="form-input" rows="2" placeholder="پاسخ جدید خود را بنویسید..." style="margin-bottom: 10px;"></textarea>
                        <button class="btn btn-primary btn-full" onclick="replyTicketFunc('${tkt.id}', event)">ارسال پاسخ</button>
                    </div>
                    ` : `
                    <div style="padding: 15px; text-align: center; background: #f1f5f9; color: #64748b; font-size: 0.9rem; border-top: 1px solid var(--color-border);">
                        این تیکت بسته شده است و امکان ارسال پیام جدید وجود ندارد. در صورت نیاز تیکت جدید ثبت کنید.
                    </div>
                    `}
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    const area = document.getElementById('ticket-chat-area');
    area.scrollTop = area.scrollHeight;
};

window.replyTicketFunc = async (ticketId, event) => {
    const msg = document.getElementById('ticket-reply-msg').value.trim();
    if(!msg) return;

    event.target.textContent = 'در حال ارسال...';
    event.target.disabled = true;

    await SupportService.addReply(ticketId, msg, false);
    document.getElementById('view-ticket-modal').remove();
    openTicketViewModal(ticketId);
    loadSupportTab();
};

// ==========================================
// بقیه توابع (مانند قبل دست نخورده باقی ماندند)
// ==========================================

function loadDealsTab() {
    const content = document.getElementById('panel-content');
    const myDeals = AppStore.getAllDeals().filter(d => d.buyerId === AppStore.getActiveUserId());

    content.innerHTML = `
      <h2 style="font-size: 1.5rem; margin-bottom: 1.5rem;">معاملات و توافقات من</h2>
      <div class="panel-table-container">
        <table class="panel-table">
          <thead>
            <tr>
              <th>شناسه معامله</th>
              <th>تأمین‌کننده</th>
              <th>موضوع / کالا</th>
              <th>تاریخ ثبت</th>
              <th>وضعیت</th>
              <th>عملیات</th>
            </tr>
          </thead>
          <tbody>
            ${myDeals.length > 0 ? myDeals.map(d => {
              const sup = businesses.find(b => b.id === d.mainSupplierId);
              return `
              <tr>
                <td style="font-family: monospace; color:#64748b;">#${d.id.toUpperCase()}</td>
                <td style="font-weight: 600; color: var(--color-primary);">${sup ? sup.name : 'نامشخص'}</td>
                <td>${d.title}</td>
                <td style="color: var(--color-text-muted);" dir="ltr">${d.date.split(',')[0]}</td>
                <td><span class="status-badge" style="background:#e0e7ff; color:#4338ca;">در حال مذاکره</span></td>
                <td>
                  <button class="btn btn-outline" style="padding: 4px 8px; font-size: 0.8rem;" onclick="document.querySelector('[data-tab=\\'messages\\']').click()">چت و پیگیری</button>
                </td>
              </tr>
            `}).join('') : '<tr><td colspan="6" style="text-align:center;">معامله‌ای ثبت نشده است</td></tr>'}
          </tbody>
        </table>
      </div>
    `;
}

function loadShortlistTab() {
    const content = document.getElementById('panel-content');
    const slIds = AppStore.getSupplierShortlist();
    const slBizs = slIds.map(id => businesses.find(b => b.id === id)).filter(Boolean);

    content.innerHTML = `
      <h2 style="font-size: 1.5rem; margin-bottom: 1.5rem;">لیست کوتاه مقایسه (Shortlist)</h2>
      <p style="color: #64748b; margin-bottom: 2rem;">شما می‌توانید هنگام ثبت RFQ برای یک محصول، استعلام را مستقیماً برای شرکت‌های این لیست نیز پیامک کنید.</p>
      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1.5rem;">
          ${slBizs.length > 0 ? slBizs.map(b => `
              <div style="background: white; border: 1px solid #e2e8f0; border-radius: 8px; padding: 1.5rem; display: flex; align-items: center; gap: 15px; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
                  <img src="${b.logo}" style="width: 60px; height: 60px; border-radius: 8px; border: 1px solid #e2e8f0; object-fit: cover;">
                  <div>
                      <h4 style="font-size: 1rem; margin-bottom: 5px;">${b.name}</h4>
                      <div style="display:flex; gap:10px;">
                          <a href="business.html?id=${b.id}" style="font-size: 0.85rem; color: var(--color-primary); font-weight: bold;">مشاهده پروفایل</a>
                          <span style="font-size: 0.85rem; color: #ef4444; cursor: pointer;" onclick="AppStore.toggleShortlist('${b.id}'); document.querySelector('[data-tab=\\'shortlist\\']').click();">حذف از لیست</span>
                      </div>
                  </div>
              </div>
          `).join('') : '<div style="grid-column: 1/-1; text-align:center; padding: 2rem; background:white; border-radius:8px; border:1px dashed #cbd5e1;">لیست کوتاه شما خالی است. از طریق شبکه تأمین‌کنندگان شرکت‌ها را اضافه کنید.</div>'}
      </div>
    `;
}

function loadNotificationsTab() {
    const content = document.getElementById('panel-content');
    const notifs = AppStore.getUserNotifications(AppStore.getActiveUserId());

    content.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
        <h2 style="font-size: 1.5rem;">مرکز اعلان‌ها</h2>
        <button class="btn btn-outline" style="padding: 6px 12px; font-size: 0.85rem;" onclick="alert('همه اعلان‌ها خوانده شدند')">علامت همه به عنوان خوانده شده</button>
      </div>
      <div style="background: white; border-radius: 12px; border: 1px solid var(--color-border); overflow: hidden;">
        ${notifs.length > 0 ? notifs.map(n => `
            <div style="padding: 1.2rem 1.5rem; border-bottom: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: center; background: ${n.isRead ? 'white' : '#f8fafc'};">
                <div style="display: flex; align-items: center; gap: 15px;">
                    <div style="width: 10px; height: 10px; border-radius: 50%; background: ${n.isRead ? 'transparent' : '#3b82f6'};"></div>
                    <div>
                        <div style="font-weight: 600; color: #1e293b; margin-bottom: 4px;">${n.title}</div>
                        <div style="font-size: 0.8rem; color: #64748b;" dir="ltr">${n.date}</div>
                    </div>
                </div>
            </div>
        `).join('') : '<div style="padding: 3rem; text-align: center; color: #64748b;">هیچ اعلانی ندارید.</div>'}
      </div>
    `;
}

async function loadMessagesTab() {
    const content = document.getElementById('panel-content');
    content.innerHTML = '<div style="text-align: center; padding: 3rem;">در حال همگام‌سازی چت‌ها...</div>';

    const convs = await MessageService.getMyConversations();

    let sidebarHtml = convs.map(c => `
        <div style="padding: 15px; border-bottom: 1px solid #e2e8f0; cursor: pointer; background: ${currentActiveChatId === c.id ? '#eff6ff' : 'white'}; transition: 0.2s;" onclick="openChatView('${c.id}')" onmouseover="this.style.backgroundColor='#f8fafc'" onmouseout="this.style.backgroundColor='${currentActiveChatId === c.id ? '#eff6ff' : 'white'}'">
            <div style="display: flex; gap: 10px; align-items: center;">
                <img src="${c.otherUserLogo}" style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover; border: 1px solid #cbd5e1;">
                <div style="flex: 1; overflow: hidden;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <strong style="font-size: 0.95rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: #0f172a;">${c.otherUserName}</strong>
                        ${c.unreadCount > 0 ? `<span style="background: #ef4444; color: white; border-radius: 50%; width: 18px; height: 18px; font-size: 0.7rem; display: flex; justify-content: center; align-items: center;">${c.unreadCount}</span>` : ''}
                    </div>
                    <div style="font-size: 0.8rem; color: #64748b; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-top: 4px;">${c.subject}</div>
                </div>
            </div>
        </div>
    `).join('');

    if(!sidebarHtml) sidebarHtml = '<div style="padding: 20px; text-align: center; color: #94a3b8; font-size: 0.9rem;">هنوز گفتگویی ایجاد نشده است.</div>';

    content.innerHTML = `
        <h2 style="font-size: 1.5rem; margin-bottom: 1.5rem;">پیام‌ها و مذاکرات دمو</h2>
        <div style="display: flex; height: calc(100vh - 220px); min-height: 500px; border: 1px solid var(--color-border); border-radius: 12px; background: white; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.02);">
            
            <div style="width: 320px; border-left: 1px solid var(--color-border); background: #f8fafc; display: flex; flex-direction: column;">
                <div style="padding: 15px; background: white; border-bottom: 1px solid var(--color-border);">
                    <input type="text" class="form-input" placeholder="جستجو در چت‌ها..." style="padding: 8px; font-size: 0.85rem; border-radius: 20px; background: #f1f5f9;">
                </div>
                <div style="flex: 1; overflow-y: auto;" id="chat-sidebar">
                    ${sidebarHtml}
                </div>
            </div>

            <div id="chat-body-container" style="flex: 1; display: flex; flex-direction: column; background: #fdfdfd;">
                <div style="flex: 1; display: flex; align-items: center; justify-content: center; color: #94a3b8; flex-direction: column; gap: 10px;">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#e2e8f0" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
                    برای مشاهده پیام‌ها، یک گفتگو را انتخاب کنید
                </div>
            </div>
        </div>
    `;

    if (!currentActiveChatId && convs.length > 0) {
        currentActiveChatId = convs[0].id;
    }
    if (currentActiveChatId) window.openChatView(currentActiveChatId);
}

window.openChatView = async (convId) => {
    currentActiveChatId = convId;
    const convs = await MessageService.getMyConversations();
    const conv = convs.find(c => c.id === convId);
    if(!conv) return;

    document.querySelectorAll('#chat-sidebar > div').forEach(item => item.style.backgroundColor = 'white');
    event?.currentTarget && (event.currentTarget.style.backgroundColor = '#eff6ff');

    const userId = AppStore.getActiveUserId();

    const messagesHtml = conv.messages.map(m => {
        const isMe = m.senderId === userId;
        const time = new Date(m.timestamp).toLocaleTimeString('fa-IR', {hour: '2-digit', minute:'2-digit'});
        return `
            <div style="display: flex; justify-content: ${isMe ? 'flex-start' : 'flex-end'}; margin-bottom: 15px;">
                <div style="max-width: 70%; background: ${isMe ? '#e0f2fe' : 'white'}; border: 1px solid ${isMe ? '#bae6fd' : '#e2e8f0'}; padding: 10px 15px; border-radius: ${isMe ? '12px 12px 0 12px' : '12px 12px 12px 0'}; box-shadow: 0 1px 2px rgba(0,0,0,0.02);">
                    <p style="margin: 0 0 5px 0; color: #1e293b; font-size: 0.95rem; line-height: 1.5;">${m.text}</p>
                    <span style="font-size: 0.7rem; color: #94a3b8; display: block; text-align: ${isMe ? 'left' : 'right'};">${time}</span>
                </div>
            </div>
        `;
    }).join('');

    const chatContainer = document.getElementById('chat-body-container');
    chatContainer.innerHTML = `
        <div style="padding: 15px 20px; background: white; border-bottom: 1px solid var(--color-border); display: flex; justify-content: space-between; align-items: center;">
            <div style="display: flex; align-items: center; gap: 15px;">
                <img src="${conv.otherUserLogo}" style="width: 45px; height: 45px; border-radius: 50%; object-fit: cover; border: 1px solid #cbd5e1;">
                <div>
                    <h3 style="margin: 0; font-size: 1.1rem; color: #0f172a;">${conv.otherUserName}</h3>
                    <span style="font-size: 0.85rem; color: var(--color-primary); font-weight: 600;">${conv.subject}</span>
                </div>
            </div>
            <button class="btn btn-outline" style="padding: 6px 12px; font-size: 0.85rem;" onclick="alert('پروفایل شرکت در تب جدید باز می‌شود')">مشاهده پروفایل</button>
        </div>
        
        <div id="chat-messages-area" style="flex: 1; padding: 20px; overflow-y: auto; background: #f8fafc;">
            ${messagesHtml || '<div style="text-align: center; color: #94a3b8; margin-top: 2rem;">اولین پیام خود را ارسال کنید...</div>'}
        </div>
        
        <div style="padding: 15px 20px; background: white; border-top: 1px solid var(--color-border); display: flex; gap: 10px;">
            <button class="btn btn-outline" style="padding: 0 15px; border-color: #cbd5e1; color: #64748b;" title="ارسال فایل ضمیمه"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path></svg></button>
            <input type="text" id="chat-input-msg" class="form-input" style="flex: 1; border-radius: 24px; padding-right: 20px;" placeholder="پیام خود را بنویسید..." onkeypress="if(event.key === 'Enter') sendDemoMessage('${conv.id}')">
            <button class="btn btn-primary" style="border-radius: 24px; padding: 0 20px;" onclick="sendDemoMessage('${conv.id}')"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-left: 6px;"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg> ارسال</button>
        </div>
    `;

    const area = document.getElementById('chat-messages-area');
    area.scrollTop = area.scrollHeight;
};

window.sendDemoMessage = async (convId) => {
    const input = document.getElementById('chat-input-msg');
    const text = input.value.trim();
    if (!text) return;
    
    input.value = '';
    await MessageService.sendMessage(convId, text);
    window.openChatView(convId); 
};

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
            if (rfq.status === 'pending') statusHtml = '<span class="status-badge status-pending">در انتظار پاسخ</span>';
            else if (rfq.status === 'replied') statusHtml = '<span class="status-badge status-replied">پاسخ داده شده</span>';
            else if (rfq.status === 'in_negotiation') statusHtml = '<span class="status-badge" style="background:#e0e7ff; color:#4338ca;">در حال مذاکره</span>';
            
            return `
            <tr>
              <td style="font-weight: 600;">${rfq.productName}</td>
              <td style="color: var(--color-primary);">${rfq.supplierName}</td>
              <td style="color: var(--color-text-muted);">${rfq.date}</td>
              <td>${statusHtml}</td>
              <td>
                <button class="btn btn-outline" style="padding: 4px 8px; font-size: 0.8rem;" onclick="openViewModal('${rfq.id}')">مشاهده پرونده</button>
              </td>
            </tr>
          `}).join('') : '<tr><td colspan="5" style="text-align:center;">درخواستی ثبت نشده است</td></tr>'}
        </tbody>
      </table>
    </div>
  `;
}

window.startRfqNegotiation = async (rfqId, btn) => {
    btn.textContent = 'در حال ایجاد معامله...';
    btn.disabled = true;
    await BuyerService.startNegotiationForRfq(rfqId);
    document.getElementById('view-modal').remove();
    currentSummary = await BuyerService.getDashboardSummary();
    alert('معامله با موفقیت ایجاد شد و چت روم مذاکره فعال گردید.');
    document.querySelector('[data-tab="messages"]').click();
};

window.openViewModal = (rfqId) => {
  const rfq = currentSummary.rfqs.find(r => r.id === rfqId);
  if (!rfq) return;

  const isReplied = rfq.status === 'replied' || rfq.status === 'in_negotiation';
  const isNegotiating = rfq.status === 'in_negotiation';

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
                  تایید پاسخ و ایجاد میز مذاکره (چت)
                </button>
              ` : `
                <button class="btn btn-primary btn-full" style="padding: 10px; font-size: 0.95rem;" onclick="document.getElementById('view-modal').remove(); document.querySelector('[data-tab=\\'messages\\']').click();">
                  ورود به چت روم مذاکره
                </button>
              `}
            </div>
          ` : `
            <div style="text-align: center; padding: 1rem; color: var(--color-text-muted); font-size: 0.9rem; border: 1px dashed var(--color-border); border-radius: var(--radius-md);">
              شرکت ${rfq.supplierName} هنوز پاسخی ارسال نکرده است.
            </div>
          `}
        </div>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', modalHtml);
};

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
                  ${t.status === 'active' ? `<button class="btn btn-outline" style="padding: 4px 8px; font-size: 0.8rem;" onclick='openTenderModal(${JSON.stringify(t).replace(/"/g, '&quot;')})'>ویرایش</button>` : ''}
                  <button class="btn btn-outline" style="padding: 4px 8px; font-size: 0.8rem; color: #ef4444; border-color: #ef4444;" onclick="deleteTender('${t.id}')">حذف</button>
                </td>
              </tr>
            `).join('') : '<tr><td colspan="6" style="text-align:center;">مناقصه‌ای ثبت نکرده‌اید</td></tr>'}
          </tbody>
        </table>
      </div>
    `;
};

window.openTenderModal = async (existingData = null) => {
    const categories = await CategoryService.getAllCategories();
    const selectedCats = existingData ? (Array.isArray(existingData.categoryId) ? existingData.categoryId : [existingData.categoryId]) : [''];

    let catRowsHtml = '';
    selectedCats.forEach((catId, index) => {
        const optionsHtml = categories.map(c => `<option value="${c.id}" ${catId === c.id ? 'selected' : ''}>${c.name}</option>`).join('');
        catRowsHtml += `
            <div class="cat-row" style="display: flex; gap: 10px; margin-bottom: 10px;">
                <select class="form-input tender-cat-select" style="flex: 1;">${optionsHtml}</select>
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
            <div id="t-cat-container">${catRowsHtml}</div>
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

window.addTenderCatRow = () => {
    const container = document.getElementById('t-cat-container');
    const firstSelectHtml = container.querySelector('.tender-cat-select').innerHTML; 
    const row = document.createElement('div');
    row.className = 'cat-row';
    row.style = "display: flex; gap: 10px; margin-bottom: 10px;";
    row.innerHTML = `
        <select class="form-input tender-cat-select" style="flex: 1;">${firstSelectHtml}</select>
        <button class="btn btn-outline" style="color:#ef4444; border-color:#ef4444; padding:0 15px; display: inline-flex; align-items: center; justify-content: center;" onclick="this.parentElement.remove()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
    `;
    container.appendChild(row);
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

window.acceptProposal = async (tenderId, proposalId, btn) => {
    btn.textContent = 'در حال پردازش...';
    btn.disabled = true;
    await BuyerService.acceptTenderProposal(tenderId, proposalId);
    document.getElementById('props-modal').remove();
    currentSummary = await BuyerService.getDashboardSummary();
    loadTendersTab();
    alert('مذاکره با موفقیت شروع شد. پیمانکاران خدماتی مطلع خواهند شد.');
    document.querySelector('[data-tab="messages"]').click();
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

window.nextProfileStep = () => { if(window.currentProfileStep < 3) window.showProfileStep(window.currentProfileStep + 1); };
window.prevProfileStep = () => { if(window.currentProfileStep > 1) window.showProfileStep(window.currentProfileStep - 1); };

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
    <h2 style="font-size: 1.5rem; margin-bottom: 1.5rem;"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: bottom; margin-left: 8px;"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1 0-2.83 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg> پروفایل تجاری و هویتی شرکت</h2>
    
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