// js/pages/buyerPanel.js

import { BuyerService } from '../services/buyerService.js';
import { AppStore } from '../data/appStore.js';
import { ProductService } from '../services/productService.js';
import { businesses } from '../data/businesses.js';
import { CategoryService } from '../services/categoryService.js'; 
import { MessageService } from '../services/messageService.js';
import { SupportService } from '../services/supportService.js';
import { products } from '../data/products.js';

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
  if(!navUl) return;

  if(!document.querySelector('[data-tab="messages"]')) {
      const savedProductsLi = document.querySelector('[data-tab="saved-products"]');
      const insertTarget = savedProductsLi ? savedProductsLi.parentElement : navUl.lastElementChild;
      const newTabsHtml = `
          <li><a href="#" data-tab="deals"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: text-bottom; margin-left: 6px;"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg> معاملات من</a></li>
          <li><a href="#" data-tab="messages"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: text-bottom; margin-left: 6px;"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg> پیام‌ها و چت‌ها</a></li>
          <li><a href="#" data-tab="shortlist"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: text-bottom; margin-left: 6px;"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg> لیست کوتاه مقایسه</a></li>
          <li><a href="#" data-tab="notifications"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: text-bottom; margin-left: 6px;"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg> مرکز اعلان‌ها</a></li>
      `;
      if (insertTarget) insertTarget.insertAdjacentHTML('beforebegin', newTabsHtml);
  }

  if(!document.querySelector('[data-tab="support"]')) {
      const profileTab = navUl.querySelector('[data-tab="company-profile"]');
      const supportHtml = `<li><a href="#" data-tab="support"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: text-bottom; margin-left: 6px;"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg> پشتیبانی و تیکت</a></li>`;
      if (profileTab && profileTab.parentElement) profileTab.parentElement.insertAdjacentHTML('beforebegin', supportHtml);
      else navUl.insertAdjacentHTML('beforeend', supportHtml);
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
// 🌟 توابع پل ارتباطی برای حل مشکل فراخوانی ماژولار 🌟
function loadTendersTab() { window.loadTendersTab(); }
function loadPitchesTab() { window.loadPitchesTab(); }
function loadFavoritesTab(type) { window.loadFavoritesTab(type); }
function loadSupportTab() { window.loadSupportTab(); }
function loadProfileTab() { window.loadProfileTab(); }
function openTicketViewModal(id) { window.openTicketViewModal(id); }
// 🌟 تابع متمرکز برای باز کردن و نمایش تب پروفایل
window.openCompanyProfile = () => {
  const profileLink = document.querySelector(
    '.panel-nav a[data-tab="company-profile"]'
  );

  document
    .querySelectorAll('.panel-nav a')
    .forEach(link => link.classList.remove('active'));

  if (profileLink) {
    profileLink.classList.add('active');
  }

  if (typeof window.loadProfileTab === 'function') {
    window.loadProfileTab();
  } else {
    console.error('loadProfileTab هنوز در دسترس نیست.');
  }
};

async function initBuyerPanel() {
  injectMissingTabs();

  try {
      currentProfile = await BuyerService.getProfile();
  } catch (error) {
      console.error('خطا در دریافت پروفایل خریدار:', error);
      currentProfile = {};
  }

  if (currentProfile && currentProfile.name) {
      const userName = document.getElementById('top-user-name');
      if (userName) {
          userName.innerHTML = `
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: text-bottom; margin-left: 6px;">
                  <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
              </svg>
              ${currentProfile.name} (خریدار)
          `;
      }
  }

  try {
      currentSummary = await BuyerService.getDashboardSummary();
  } catch (error) {
      console.error('خطا در دریافت خلاصه داشبورد:', error);
      currentSummary = { rfqsCount: 0, rfqs: [], tendersCount: 0, proposalsCount: 0, servicePitchesCount: 0 };
  }

  updateSidebarBadges();
  loadDashboardTab();

  const navLinks = document.querySelectorAll('.panel-nav a');
  navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
          e.preventDefault();
          navLinks.forEach(l => l.classList.remove('active'));
          
          const targetLink = e.currentTarget;
          targetLink.classList.add('active');
          
          const tab = targetLink.getAttribute('data-tab');
          
          if (tab === 'dashboard') loadDashboardTab();
          else if (tab === 'rfqs') loadRfqsTab();
          else if (tab === 'tenders') window.loadTendersTab(); 
          else if (tab === 'pitches') {
              hasViewedPitches = true; 
              updateSidebarBadges();
              window.loadPitchesTab();
          }
          else if (tab === 'deals') loadDealsTab();
          else if (tab === 'messages') loadMessagesTab();
          else if (tab === 'shortlist') loadShortlistTab();
          else if (tab === 'saved-products') window.loadFavoritesTab('products');
          else if (tab === 'saved-businesses') window.loadFavoritesTab('businesses');
          else if (tab === 'notifications') loadNotificationsTab();
          else if (tab === 'support') window.loadSupportTab(); 
          else if (tab === 'company-profile') window.loadProfileTab(); 
      });
  });

  const pendingChat = localStorage.getItem('tradecore_open_chat');
  if (pendingChat) {
      localStorage.removeItem('tradecore_open_chat');
      setTimeout(() => {
          const msgTab = document.querySelector('[data-tab="messages"]');
          if (msgTab) {
              msgTab.click(); 
              setTimeout(() => {
                  if (typeof window.openChatView === 'function') window.openChatView(pendingChat);
              }, 300); 
          }
      }, 100);
  }
}

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
        <!-- 🌟 دکمه استاندارد و هماهنگ با تب سایدبار -->
        <button class="btn btn-primary" onclick="document.querySelector('[data-tab=\\'company-profile\\']').click()">تکمیل پروفایل</button>
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
                <div style="display: flex; gap: 5px;">
                  <button class="btn btn-outline" style="padding: 4px 8px; font-size: 0.8rem; flex: 1;" onclick="document.querySelector('[data-tab=\\'messages\\']').click()">چت</button>
                  <button class="btn btn-outline" style="padding: 4px 8px; font-size: 0.8rem; flex: 1; border-color: #10b981; color: #10b981;" onclick="showContactInfoOnly('${d.mainSupplierId}')">تماس</button>
                </div>
              </td>
            </tr>
          `}).join('') : '<tr><td colspan="6" style="text-align:center;">معامله‌ای ثبت نشده است</td></tr>'}
        </tbody>
      </table>
    </div>
  `;
}

// ==========================================
// 🌟 سیستم پیشرفته مقایسه (شرکت‌ها و محصولات)
// ==========================================

window.currentCompareTab = 'companies'; // تب پیش‌فرض

window.switchCompareTab = (tab) => {
    window.currentCompareTab = tab;
    window.loadShortlistTab();
};

window.removeFromCompare = (type, id) => {
    if (type === 'companies') {
        AppStore.toggleShortlist(id);
    } else {
        AppStore.toggleFavProduct(id);
    }
    window.loadShortlistTab();
};

window.exportCompareCSV = (type) => {
    let csvContent = "\uFEFF"; // برای پشتیبانی از فارسی در اکسل (BOM)
    
    if (type === 'companies') {
        const slIds = AppStore.getSupplierShortlist();
        const bizs = slIds.map(id => businesses.find(b => b.id === id)).filter(Boolean);
        
        csvContent += "نام شرکت,کشور,شهر,صنعت فعالیت,وضعیت تأیید,سطح اشتراک,سال تأسیس\n";
        bizs.forEach(b => {
            csvContent += `"${b.name || '-'}","${b.country || '-'}","${b.city || '-'}","${b.industry || '-'}","${b.status === 'verified' ? 'تأیید شده' : 'در انتظار'}","${b.subscriptionTier ? b.subscriptionTier.toUpperCase() : 'FREE'}","${b.foundedYear || '-'}"\n`;
        });
    } else {
        const favIds = AppStore.getFavProducts();
        const prods = products.filter(p => favIds.includes(p.id));
        
        // استخراج تمام ویژگی‌های فنی موجود
        const allSpecs = new Set();
        prods.forEach(p => {
            if (p.technicalAttributes) p.technicalAttributes.forEach(attr => allSpecs.add(attr.attributeName));
        });
        const specsArray = Array.from(allSpecs);
        
        csvContent += "نام محصول,دسته‌بندی,نوع تأمین," + specsArray.join(",") + "\n";
        
        prods.forEach(p => {
            let row = `"${p.name || '-'}","${p.categoryName || '-'}","${p.productionStatus || '-'} যতটা",`;
            let specVals = specsArray.map(specName => {
                const attr = p.technicalAttributes?.find(a => a.attributeName === specName);
                return attr ? `"${attr.value} ${attr.unitName}"` : '"-"';
            });
            csvContent += row + specVals.join(",") + "\n";
        });
    }

    // ایجاد لینک دانلود
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `compare_${type}_${new Date().getTime()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

window.loadShortlistTab = () => {
    const content = document.getElementById('panel-content');
    
    // دریافت داده‌های مقایسه (با استفاده از توابع لیست کوتاه و علاقه‌مندی‌های قبلی)
    const slIds = AppStore.getSupplierShortlist();
    const slBizs = slIds.map(id => businesses.find(b => b.id === id)).filter(Boolean);
    
    const favIds = AppStore.getFavProducts();
    const favProds = products.filter(p => favIds.includes(p.id));

    const isComp = window.currentCompareTab === 'companies';
    const items = isComp ? slBizs : favProds;
    const isOverLimit = items.length > 5;

    // استایل‌های جدول مقایسه (ردیف‌های یک در میان، ستون ثابت و ...)
    const styles = `
        <style>
            .compare-table { width: 100%; border-collapse: collapse; background: white; border-radius: 12px; overflow: hidden; border: 1px solid var(--color-border); box-shadow: 0 4px 6px rgba(0,0,0,0.02); text-align: center; }
            .compare-table th, .compare-table td { border: 1px solid var(--color-border); padding: 15px; }
            .compare-table th { background: #f8fafc; font-weight: bold; color: #0f172a; }
            .compare-table tr:nth-child(even) td { background: #f8fafc; }
            .compare-param-col { font-weight: bold; background: white; color: #475569; width: 150px; text-align: right !important; border-left: 2px solid #e2e8f0 !important; }
            .compare-item-header { min-width: 160px; max-width: 200px; }
            .compare-item-img { width: 60px; height: 60px; border-radius: 8px; object-fit: cover; margin-bottom: 10px; border: 1px solid #e2e8f0; }
            .remove-compare-btn { font-size: 0.75rem; color: #ef4444; cursor: pointer; margin-top: 10px; display: inline-flex; align-items: center; gap: 4px; border: 1px solid #fca5a5; padding: 4px 8px; border-radius: 4px; background: #fef2f2; transition: 0.2s;}
            .remove-compare-btn:hover { background: #ef4444; color: white; }
        </style>
    `;

    // تب‌های انتخاب نوع مقایسه
    const tabsHtml = `
        <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 2rem;">
            <div>
                <h2 style="font-size: 1.6rem; color: #0f172a; margin-bottom: 5px;">مرکز مقایسه و ارزیابی</h2>
                <p style="color: #64748b; font-size: 0.95rem; margin: 0;">مقایسه دقیق تأمین‌کنندگان و مشخصات فنی محصولات.</p>
            </div>
            <div style="display: flex; gap: 10px; background: #f1f5f9; padding: 5px; border-radius: 8px;">
                <button class="btn ${isComp ? 'btn-primary' : 'btn-outline'}" style="border:none; padding: 8px 16px;" onclick="window.switchCompareTab('companies')">مقایسه تأمین‌کنندگان (${slBizs.length})</button>
                <button class="btn ${!isComp ? 'btn-primary' : 'btn-outline'}" style="border:none; padding: 8px 16px;" onclick="window.switchCompareTab('products')">مقایسه محصولات (${favProds.length})</button>
            </div>
        </div>
    `;

    // اگر لیست خالی است
    if (items.length === 0) {
        content.innerHTML = styles + tabsHtml + `
            <div style="text-align:center; padding: 4rem; background:white; border-radius:12px; border:1px dashed #cbd5e1; color:#64748b;">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-bottom:1rem; opacity:0.5;"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="3" x2="9" y2="21"></line></svg>
                <p style="font-size: 1.1rem; font-weight: bold; color: #475569;">لیست مقایسه شما خالی است.</p>
                <p style="font-size: 0.9rem;">با کلیک روی دکمه "افزودن به مقایسه" در صفحات سیستم، موارد را به اینجا اضافه کنید.</p>
            </div>
        `;
        return;
    }

    // اگر بیش از ۵ مورد است، نمایش دکمه خروجی CSV و توقف رندر جدول
    if (isOverLimit) {
        content.innerHTML = styles + tabsHtml + `
            <div style="text-align:center; padding: 4rem; background:#eff6ff; border-radius:12px; border:2px dashed #3b82f6;">
                <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="1.5" style="margin-bottom:1rem;"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                <h3 style="font-size: 1.3rem; color: #1e40af; margin-bottom: 10px;">بیش از ۵ مورد انتخاب شده است</h3>
                <p style="font-size: 1rem; color: #1e3a8a; margin-bottom: 2rem;">برای حفظ کیفیت و خوانایی مقایسه در صفحه نمایش، حداکثر ۵ مورد قابل رویت است. شما ${items.length} مورد را انتخاب کرده‌اید. لطفاً خروجی اکسل (CSV) دریافت کنید.</p>
                <div style="display:flex; justify-content:center; gap:10px;">
                    <button class="btn btn-primary" style="font-size: 1.1rem; padding: 12px 30px; display:flex; align-items:center; gap:8px;" onclick="window.exportCompareCSV('${window.currentCompareTab}')">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="8" y1="13" x2="16" y2="13"></line><line x1="8" y1="17" x2="16" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg> دانلود فایل اکسل مقایسه
                    </button>
                </div>
            </div>
            
            <div style="margin-top: 2rem; display: flex; flex-wrap: wrap; gap: 10px;">
                <p style="width: 100%; font-weight: bold; margin-bottom: 10px;">مدیریت لیست (${items.length}):</p>
                ${items.map(item => `
                    <div style="background: white; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px; display: flex; align-items: center; gap: 10px;">
                        <span style="font-size:0.9rem; font-weight:600;">${item.name}</span>
                        <button style="border:none; background:transparent; color:#ef4444; cursor:pointer;" onclick="window.removeFromCompare('${window.currentCompareTab}', '${item.id}')">✕</button>
                    </div>
                `).join('')}
            </div>
        `;
        return;
    }

    // تولید هدرهای جدول (نمایه و نام شرکت/محصول)
    const headerRow = `
        <tr>
            <th class="compare-param-col">پارامتر مقایسه</th>
            ${items.map(item => `
                <th class="compare-item-header">
                    <img src="${item.logo || item.image}" class="compare-item-img">
                    <div style="font-size: 1rem; color: var(--color-primary);">${item.name}</div>
                    <div class="remove-compare-btn" onclick="window.removeFromCompare('${window.currentCompareTab}', '${item.id}')">✕ حذف از لیست</div>
                </th>
            `).join('')}
        </tr>
    `;

    let tableRows = '';

    // منطق مقایسه شرکت‌ها
    if (isComp) {
        const params = [
            { label: 'کشور / شهر', key: b => `${b.country || '-'} / ${b.city || '-'}` },
            { label: 'صنعت فعالیت', key: b => b.industry || '-' },
            { label: 'وضعیت تأیید', key: b => b.status === 'verified' ? '<span style="color:#10b981; font-weight:bold;">تأیید شده</span>' : '<span style="color:#f59e0b;">در انتظار</span>' },
            { label: 'سطح اشتراک', key: b => b.subscriptionTier ? `<span style="color:#8b5cf6; font-weight:bold;">${b.subscriptionTier.toUpperCase()}</span>` : 'FREE' },
            { label: 'سال تأسیس', key: b => b.foundedYear || '-' },
            { label: 'تعداد پرسنل', key: b => b.employees || '-' },
            { label: 'نوع تولید/تأمین', key: b => b.productionType || '-' }
        ];

        tableRows = params.map(p => `
            <tr>
                <td class="compare-param-col">${p.label}</td>
                ${items.map(b => `<td>${p.key(b)}</td>`).join('')}
            </tr>
        `).join('');
    } 
    // منطق پیچیده مقایسه محصولات (استخراج ویژگی‌های مشترک و غیرمشترک)
    else {
        // ۱. ردیف‌های ثابت محصول
        const baseParams = [
            { label: 'دسته‌بندی', key: p => p.categoryName || '-' },
            { label: 'برند', key: p => p.brand || '-' },
            { label: 'کد/مدل', key: p => p.model || '-' },
            { label: 'وضعیت تأمین', key: p => p.productionStatus || '-' }
        ];
        
        tableRows += baseParams.map(p => `
            <tr>
                <td class="compare-param-col">${p.label}</td>
                ${items.map(prod => `<td>${p.key(prod)}</td>`).join('')}
            </tr>
        `).join('');

        // ۲. استخراج تمام Attribute های فنی موجود در محصولات انتخاب شده
        const allSpecsMap = new Map(); // کلید: نام ویژگی، مقدار: تعداد تکرار در محصولات
        
        items.forEach(prod => {
            if (prod.technicalAttributes) {
                prod.technicalAttributes.forEach(attr => {
                    const count = allSpecsMap.get(attr.attributeName) || 0;
                    allSpecsMap.set(attr.attributeName, count + 1);
                });
            }
        });

        // جدا کردن ویژگی‌های مشترک (در همه محصولات هست) از ویژگی‌های غیر مشترک
        const sharedSpecs = [];
        const uniqueSpecs = [];
        
        allSpecsMap.forEach((count, name) => {
            if (count === items.length) sharedSpecs.push(name);
            else uniqueSpecs.push(name);
        });

        // ترکیب آن‌ها (اول مشترک‌ها، بعد غیرمشترک‌ها)
        const sortedSpecs = [...sharedSpecs, ...uniqueSpecs];

        if (sortedSpecs.length > 0) {
            tableRows += `<tr><td colspan="${items.length + 1}" style="background:#f1f5f9; color:#475569; font-weight:bold; font-size:0.9rem;">مشخصات فنی و تخصصی</td></tr>`;
            
            tableRows += sortedSpecs.map(specName => `
                <tr>
                    <td class="compare-param-col">${specName}</td>
                    ${items.map(prod => {
                        const attr = prod.technicalAttributes?.find(a => a.attributeName === specName);
                        if (attr) {
                            return `<td style="font-weight:600; color:#1e293b;">${attr.value} <span style="font-size:0.8rem; color:#64748b;">${attr.unitName || ''}</span></td>`;
                        }
                        // اگر محصول این ویژگی را نداشت:
                        return `<td style="color:#cbd5e1; font-size:1.2rem;">-</td>`;
                    }).join('')}
                </tr>
            `).join('');
        }
    }

    // دکمه خروجی اکسل در صورت تمایل کاربر (حتی زیر ۵ مورد)
    const exportBtnRow = `
        <div style="text-align:left; margin-top: 1.5rem;">
            <button class="btn btn-outline" style="display:inline-flex; align-items:center; gap:6px;" onclick="window.exportCompareCSV('${window.currentCompareTab}')">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="8" y1="13" x2="16" y2="13"></line><line x1="8" y1="17" x2="16" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg> خروجی اکسل (CSV)
            </button>
        </div>
    `;

    // رندر نهایی
    content.innerHTML = styles + tabsHtml + `
        <div style="overflow-x: auto;">
            <table class="compare-table">
                ${headerRow}
                <tbody>
                    ${tableRows}
                </tbody>
            </table>
        </div>
        ${exportBtnRow}
    `;
};

function loadNotificationsTab() {
  const content = document.getElementById('panel-content');
  const notifs = AppStore.getUserNotifications(AppStore.getActiveUserId());

  const icons = {
      info: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`,
      success: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`,
      alert: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`,
      message: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>`
  };

  const styles = `
      <style>
          .notif-card { display: flex; align-items: flex-start; gap: 1.2rem; padding: 1.5rem; border-bottom: 1px solid var(--color-border); transition: 0.2s; background: white; }
          .notif-card:hover { background: #f8fafc; }
          .notif-card.unread { background: #f0f9ff; border-right: 4px solid var(--color-primary); padding-right: calc(1.5rem - 4px); }
          .notif-card:last-child { border-bottom: none; }
          .notif-icon { width: 46px; height: 46px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
          .notif-icon.info { background: #e2e8f0; color: #475569; }
          .notif-icon.success { background: #d1fae5; color: #059669; }
          .notif-icon.alert { background: #fee2e2; color: #dc2626; }
          .notif-icon.message { background: #dbeafe; color: #2563eb; }
          .notif-content { flex-grow: 1; min-width: 0; text-align: right; }
          .notif-title { font-weight: 700; font-size: 1.05rem; color: #0f172a; margin-bottom: 8px; line-height: 1.6; word-wrap: break-word; }
          .notif-time { font-size: 0.8rem; color: #64748b; display: inline-flex; align-items: center; gap: 6px; background: #f1f5f9; padding: 4px 12px; border-radius: 20px; font-family: monospace; }
          .notif-new-badge { background: var(--color-primary); color: white; font-size: 0.7rem; padding: 2px 8px; border-radius: 12px; font-weight: bold; margin-right: 8px; vertical-align: baseline; }
      </style>
  `;

  content.innerHTML = styles + `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
      <h2 style="font-size: 1.5rem;"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: bottom; margin-left: 8px;"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg> مرکز اعلان‌ها</h2>
      ${notifs.length > 0 ? `<button class="btn btn-outline" style="padding: 6px 12px; font-size: 0.85rem;" onclick="alert('تمام اعلان‌ها به عنوان خوانده‌شده علامت‌گذاری شدند.'); loadNotificationsTab();">✔ علامت خوانده شده</button>` : ''}
    </div>
    
    <div style="background: white; border-radius: 12px; border: 1px solid var(--color-border); box-shadow: 0 4px 6px rgba(0,0,0,0.02); overflow: hidden;">
      ${notifs.length > 0 ? notifs.map(n => {
          const typeClass = n.type || 'info';
          const icon = icons[typeClass] || icons.info;
          
          const targetTab = (n.link && n.link !== '#') ? n.link.replace('#', '') : '';
          const clickAction = targetTab ? `const t = document.querySelector('[data-tab=\\'${targetTab}\\']'); if(t) t.click(); else alert('بخش مورد نظر در این پنل یافت نشد.');` : '';

          return `
          <div class="notif-card ${n.isRead ? '' : 'unread'}">
              <div class="notif-icon ${typeClass}">${icon}</div>
              <div class="notif-content">
                  <div class="notif-title" dir="auto">${n.title} ${!n.isRead ? '<span class="notif-new-badge">جدید</span>' : ''}</div>
                  <div class="notif-time" dir="ltr">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                      ${n.date}
                  </div>
              </div>
              ${targetTab ? `<button class="btn btn-outline" style="padding: 6px 12px; font-size: 0.8rem; flex-shrink: 0;" onclick="${clickAction}">بررسی</button>` : ''}
          </div>
      `}).join('') : `
          <div style="padding: 5rem 2rem; text-align: center; color: #64748b;">
              <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom: 1rem;"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
              <h3 style="font-size: 1.1rem; color: #475569; margin-bottom: 5px;">هیچ اعلانی ندارید</h3>
              <p style="font-size: 0.95rem;">تمام رویدادهای مهم حساب کاربری شما در اینجا نمایش داده خواهند شد.</p>
          </div>
      `}
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
    
    const userId = AppStore.getActiveUserId();
    
    const rawConvs = AppStore.getAllConversations();
    const rawConv = rawConvs.find(c => c.id === convId);
    let hasUnread = false;

    if (rawConv) {
        rawConv.messages.forEach(m => {
            if (m.senderId !== userId && !m.isRead) {
                m.isRead = true;
                hasUnread = true;
            }
        });
        if (hasUnread) {
            AppStore.saveConversations(rawConvs);
        }
    }

    const convs = await MessageService.getMyConversations();
    const conv = convs.find(c => c.id === convId);
    if(!conv) return;

    document.querySelectorAll('#chat-sidebar > div').forEach(item => {
        item.style.backgroundColor = 'white';
        if(item.getAttribute('onclick').includes(convId)) {
            item.style.backgroundColor = '#eff6ff';
            const unreadBadge = item.querySelector('span[style*="background: #ef4444"]');
            if (unreadBadge) unreadBadge.remove();
        }
    });

    const otherUserId = conv.participants.find(p => p !== userId);

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
            <a href="business.html?id=${otherUserId}" target="_blank" class="btn btn-outline" style="padding: 6px 12px; font-size: 0.85rem; text-decoration: none;">مشاهده پروفایل</a>
        </div>
        
        <div id="chat-messages-area" style="flex: 1; padding: 20px; overflow-y: auto; background: #f8fafc;">
            ${messagesHtml || '<div style="text-align: center; color: #94a3b8; margin-top: 2rem;">اولین پیام خود را ارسال کنید...</div>'}
        </div>
        
        <div style="padding: 15px 20px; background: white; border-top: 1px solid var(--color-border); display: flex; gap: 10px; align-items: center;">
            <button class="btn btn-outline" style="padding: 0 15px; height: 40px; border-color: #cbd5e1; color: #64748b;" title="ارسال فایل ضمیمه" onclick="document.getElementById('chat-file-input').click()">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path></svg>
            </button>
            <input type="file" id="chat-file-input" style="display: none;" onchange="if(this.files.length) alert('فایل «' + this.files[0].name + '» آماده ارسال است. (آپلود واقعی در بک‌اند انجام می‌شود)')">
            
            <input type="text" id="chat-input-msg" class="form-input" style="flex: 1; border-radius: 24px; padding-right: 20px; height: 40px; margin: 0;" placeholder="پیام خود را بنویسید..." onkeypress="if(event.key === 'Enter') sendDemoMessage('${conv.id}')">
            <button class="btn btn-primary" style="border-radius: 24px; padding: 0 20px; height: 40px;" onclick="sendDemoMessage('${conv.id}')">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-left: 6px;"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg> ارسال
            </button>
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
                <button class="btn btn-primary btn-full" style="padding: 10px; font-size: 0.95rem; margin-bottom: 10px;" onclick="openAcceptRfqModal('${rfq.id}', '${rfq.supplierId}')">
                  تایید پاسخ و ایجاد میز مذاکره (چت)
                </button>
              ` : `
                <div style="display: flex; gap: 10px;">
                    <button class="btn btn-primary" style="flex: 1; padding: 10px; font-size: 0.95rem;" onclick="document.getElementById('view-modal').remove(); document.querySelector('[data-tab=\\'messages\\']').click();">
                      ورود به چت روم
                    </button>
                    <button class="btn btn-outline" style="flex: 1; padding: 10px; font-size: 0.95rem; border-color: #10b981; color: #10b981;" onclick="showContactInfoOnly('${rfq.supplierId}')">
                      اطلاعات تماس
                    </button>
                </div>
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

window.openAcceptRfqModal = (rfqId, supplierId) => {
    const supplier = businesses.find(b => b.id === supplierId);
    const modalHtml = `
      <div id="accept-rfq-modal" class="modal-overlay" style="z-index: 10001;">
        <div class="modal-content" style="max-width: 450px;">
          <div class="modal-header">
            <h3>نحوه ارتباط با ${supplier ? supplier.name : 'فروشنده'}</h3>
            <button class="btn-close" onclick="document.getElementById('accept-rfq-modal').remove()">✕</button>
          </div>
          <div class="modal-body" style="text-align: center; padding: 2rem;">
            <p style="margin-bottom: 2rem; color: #475569;">با انتخاب روش ارتباط، پاسخ استعلام تایید شده و میز مذاکره ایجاد می‌شود.</p>
            
            <div id="contact-info-box-rfq" style="display: none; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 1.5rem; margin-bottom: 1.5rem; text-align: right;">
                <div style="margin-bottom: 10px;"><strong>شماره تماس:</strong> <span dir="ltr">${supplier?.phone || 'ثبت نشده'}</span></div>
                <div style="margin-bottom: 10px;"><strong>واتساپ:</strong> <span dir="ltr">${supplier?.contact?.whatsapp || 'ثبت نشده'}</span></div>
                <div><strong>ایمیل:</strong> <span dir="ltr">${supplier?.email || 'ثبت نشده'}</span></div>
            </div>

            <div style="display: flex; gap: 10px; flex-direction: column;" id="accept-action-buttons-rfq">
                <button class="btn btn-primary btn-full" style="padding: 12px; font-size: 1rem;" onclick="confirmAcceptRfq('${rfqId}', 'chat', this)">
                    💬 چت آنلاین (در پلتفرم)
                </button>
                <button class="btn btn-outline btn-full" style="padding: 12px; font-size: 1rem;" onclick="confirmAcceptRfq('${rfqId}', 'contact', this)">
                    📞 اطلاعات تماس (ایمیل و واتساپ)
                </button>
            </div>
          </div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
};

window.confirmAcceptRfq = async (rfqId, method, btn) => {
    btn.disabled = true;
    const originalText = btn.innerHTML;
    btn.innerHTML = 'در حال پردازش...';

    const result = await BuyerService.startNegotiationForRfq(rfqId);
    currentSummary = await BuyerService.getDashboardSummary();
    document.getElementById('view-modal')?.remove();
    loadRfqsTab(); 

    if (method === 'chat') {
        document.getElementById('accept-rfq-modal').remove();
        document.querySelector('[data-tab="messages"]').click();
        
        setTimeout(() => {
            if(result && result.convId) window.openChatView(result.convId);
        }, 150);
    } else {
        btn.innerHTML = originalText;
        document.getElementById('accept-action-buttons-rfq').style.display = 'none';
        document.getElementById('contact-info-box-rfq').style.display = 'block';
        document.getElementById('contact-info-box-rfq').insertAdjacentHTML('afterend', `<button class="btn btn-primary btn-full" style="margin-top: 1rem;" onclick="document.getElementById('accept-rfq-modal').remove()">متوجه شدم، بستن</button>`);
    }
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
                  ${t.status === 'active' && t.proposals.length === 0 ? `<button class="btn btn-outline" style="padding: 4px 8px; font-size: 0.8rem;" onclick='openTenderModal(${JSON.stringify(t).replace(/"/g, '&quot;')})'>ویرایش</button>` : ''}
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
          ${p.status !== 'accepted' 
              ? `<button class="btn btn-primary" style="margin-top:10px; width:100%; padding: 6px;" onclick="openAcceptProposalModal('${tender.id}', '${p.id}', '${p.supplierId}')">شروع مذاکره (تایید پیشنهاد)</button>` 
              : `<div style="margin-top:10px; display:flex; gap:10px;">
                   <div style="flex:1; color:#10b981; font-weight:bold; text-align:center; background: #ecfdf5; padding: 6px; border-radius: 4px; border: 1px dashed #a7f3d0;">پذیرفته شده</div>
                   <button class="btn btn-outline" style="flex:1; padding: 6px; font-size: 0.85rem; border-color:#10b981; color:#10b981;" onclick="showContactInfoOnly('${p.supplierId}')">اطلاعات تماس</button>
                 </div>`
          }
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
          ${proposalsHtml}
        </div>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', modalHtml);
};

window.openAcceptProposalModal = (tenderId, proposalId, supplierId) => {
    const supplier = businesses.find(b => b.id === supplierId);
    const modalHtml = `
      <div id="accept-modal" class="modal-overlay" style="z-index: 10001;">
        <div class="modal-content" style="max-width: 450px;">
          <div class="modal-header">
            <h3>نحوه ارتباط با ${supplier ? supplier.name : 'فروشنده'}</h3>
            <button class="btn-close" onclick="document.getElementById('accept-modal').remove()">✕</button>
          </div>
          <div class="modal-body" style="text-align: center; padding: 2rem;">
            <p style="margin-bottom: 2rem; color: #475569;">با انتخاب روش ارتباط، این پیشنهاد تایید شده و مذاکره رسماً آغاز می‌شود.</p>
            
            <div id="contact-info-box" style="display: none; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 1.5rem; margin-bottom: 1.5rem; text-align: right;">
                <div style="margin-bottom: 10px;"><strong>شماره تماس:</strong> <span dir="ltr">${supplier?.phone || 'ثبت نشده'}</span></div>
                <div style="margin-bottom: 10px;"><strong>واتساپ:</strong> <span dir="ltr">${supplier?.contact?.whatsapp || 'ثبت نشده'}</span></div>
                <div><strong>ایمیل:</strong> <span dir="ltr">${supplier?.email || 'ثبت نشده'}</span></div>
            </div>

            <div style="display: flex; gap: 10px; flex-direction: column;" id="accept-action-buttons">
                <button class="btn btn-primary btn-full" style="padding: 12px; font-size: 1rem;" onclick="confirmAcceptProposal('${tenderId}', '${proposalId}', 'chat', this)">
                    💬 چت آنلاین (در پلتفرم)
                </button>
                <button class="btn btn-outline btn-full" style="padding: 12px; font-size: 1rem;" onclick="confirmAcceptProposal('${tenderId}', '${proposalId}', 'contact', this)">
                    📞 اطلاعات تماس (ایمیل و واتساپ)
                </button>
            </div>
          </div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
};

window.confirmAcceptProposal = async (tenderId, proposalId, method, btn) => {
    btn.disabled = true;
    const originalText = btn.innerHTML;
    btn.innerHTML = 'در حال پردازش...';

    const result = await BuyerService.acceptTenderProposal(tenderId, proposalId); 
    currentSummary = await BuyerService.getDashboardSummary();
    
    document.getElementById('props-modal')?.remove();
    loadTendersTab(); 

    if (method === 'chat') {
        document.getElementById('accept-modal').remove();
        document.querySelector('[data-tab="messages"]').click();
        setTimeout(() => {
            if(result && result.convId) window.openChatView(result.convId);
        }, 150);
    } else {
        btn.innerHTML = originalText;
        document.getElementById('accept-action-buttons').style.display = 'none';
        document.getElementById('contact-info-box').style.display = 'block';
        document.getElementById('contact-info-box').insertAdjacentHTML('afterend', `<button class="btn btn-primary btn-full" style="margin-top: 1rem;" onclick="document.getElementById('accept-modal').remove()">متوجه شدم، بستن</button>`);
    }
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
                  <button class="btn btn-primary" style="padding: 4px 8px; font-size: 0.8rem; background-color: #8b5cf6; border-color: #8b5cf6;" onclick="viewPitchDetail('${p.id}', '${p.dealId}')">بررسی و مذاکره</button>
                </td>
              </tr>
            `).join('') : '<tr><td colspan="5" style="text-align:center;">هیچ پیشنهاد خدماتی برای معاملات شما ارسال نشده است.</td></tr>'}
          </tbody>
        </table>
      </div>
    `;
};

window.viewPitchDetail = (pitchId, dealId) => {
    const deals = AppStore.getAllDeals();
    const deal = deals.find(d => d.id === dealId);
    const pitch = deal?.pitches.find(p => p.id === pitchId);
    if (!pitch || !deal) return;

    const supplier = businesses.find(b => b.id === pitch.supplierId);

    const modalHtml = `
      <div id="view-pitch-modal" class="modal-overlay" style="z-index: 10001;">
        <div class="modal-content" style="max-width: 450px;">
          <div class="modal-header">
            <h3>پیشنهاد همکاری از: ${supplier ? supplier.name : 'فروشنده'}</h3>
            <button class="btn-close" onclick="document.getElementById('view-pitch-modal').remove()">✕</button>
          </div>
          <div class="modal-body" style="text-align: center; padding: 2rem;">
            
            <div style="background: #f8fafc; padding: 1.5rem; border-radius: 8px; border: 1px solid var(--color-border); margin-bottom: 1.5rem;">
                <p style="color: var(--color-text-main); line-height: 1.6; font-size: 0.95rem; margin:0; text-align: right;">${pitch.message || 'بدون متن'}</p>
            </div>

            <p style="margin-bottom: 2rem; color: #475569;">چگونه مایلید با این شرکت ارتباط برقرار کنید؟</p>
            
            <div id="contact-info-box-pitch" style="display: none; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 1.5rem; margin-bottom: 1.5rem; text-align: right;">
                <div style="margin-bottom: 10px;"><strong>شماره تماس:</strong> <span dir="ltr">${supplier?.phone || 'ثبت نشده'}</span></div>
                <div style="margin-bottom: 10px;"><strong>واتساپ:</strong> <span dir="ltr">${supplier?.contact?.whatsapp || 'ثبت نشده'}</span></div>
                <div><strong>ایمیل:</strong> <span dir="ltr">${supplier?.email || 'ثبت نشده'}</span></div>
            </div>

            <div style="display: flex; gap: 10px; flex-direction: column;" id="accept-action-buttons-pitch">
                <button class="btn btn-primary btn-full" style="padding: 12px; font-size: 1rem; background-color: #8b5cf6; border-color: #8b5cf6;" onclick="confirmAcceptPitch('${deal.id}', '${supplier.id}', 'chat', this)">
                    💬 چت آنلاین (در پلتفرم)
                </button>
                <button class="btn btn-outline btn-full" style="padding: 12px; font-size: 1rem;" onclick="confirmAcceptPitch('${deal.id}', '${supplier.id}', 'contact', this)">
                    📞 اطلاعات تماس (ایمیل و واتساپ)
                </button>
            </div>
          </div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
};

window.confirmAcceptPitch = async (dealId, supplierId, method, btn) => {
    btn.disabled = true;
    const originalText = btn.innerHTML;
    btn.innerHTML = 'در حال پردازش...';

    const deals = AppStore.getAllDeals();
    const deal = deals.find(d => d.id === dealId);

    if (method === 'chat') {
        document.getElementById('view-pitch-modal').remove();
        document.querySelector('[data-tab="messages"]').click();
        
        const conv = await MessageService.createConversation([AppStore.getActiveUserId(), supplierId], `مذاکره خدمات: ${deal ? deal.title : ''}`, dealId);
        
        setTimeout(() => {
            if(conv && conv.id) window.openChatView(conv.id);
        }, 150);
    } else {
        btn.innerHTML = originalText;
        document.getElementById('accept-action-buttons-pitch').style.display = 'none';
        document.getElementById('contact-info-box-pitch').style.display = 'block';
        document.getElementById('contact-info-box-pitch').insertAdjacentHTML('afterend', `<button class="btn btn-primary btn-full" style="margin-top: 1rem; background-color: #8b5cf6; border-color: #8b5cf6;" onclick="document.getElementById('view-pitch-modal').remove()">متوجه شدم، بستن</button>`);
    }
};

window.loadFavoritesTab = async (type) => {
  const content = document.getElementById('panel-content');
  content.innerHTML = '<div style="text-align: center; padding: 3rem;">در حال بارگذاری...</div>';
  
  if (type === 'products') {
      const favIds = AppStore.getFavProducts();
      const favProducts = products.filter(p => favIds.includes(p.id));
      
      content.innerHTML = `
          <h2 style="font-size: 1.5rem; margin-bottom: 1.5rem;">محصولات ذخیره شده (${favProducts.length})</h2>
          <div class="grid-container" style="grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));">
              ${favProducts.length > 0 ? favProducts.map(p => `
                  <div class="product-card" style="box-shadow: 0 2px 4px rgba(0,0,0,0.02); display: flex; flex-direction: column;">
                      <div class="product-image-wrapper" style="height: 140px; flex-shrink: 0;">
                          <a href="product.html?id=${p.id}"><img src="${p.image}" class="product-image" loading="lazy"></a>
                      </div>
                      <div class="product-details" style="padding: 1rem; flex-grow: 1; display: flex; flex-direction: column;">
                          <a href="product.html?id=${p.id}" style="text-decoration: none;"><h3 class="product-title" style="font-size: 0.95rem;">${p.name}</h3></a>
                          <div style="margin-top: auto; padding-top: 10px;">
                              <button class="btn btn-outline btn-full" style="padding: 6px; font-size: 0.8rem; color: #ef4444; border-color: #ef4444;" onclick="AppStore.toggleFavProduct('${p.id}'); window.loadFavoritesTab('products');">حذف از لیست</button>
                          </div>
                      </div>
                  </div>
              `).join('') : '<div style="grid-column: 1/-1; text-align:center; padding:3rem; background:white; border-radius:12px; border:1px solid var(--color-border); color:#64748b;">هیچ محصولی ذخیره نشده است.</div>'}
          </div>
      `;
  } else if (type === 'businesses') {
      const favIds = AppStore.getFavBusinesses();
      const favBizs = businesses.filter(b => favIds.includes(b.id));
      
      content.innerHTML = `
          <h2 style="font-size: 1.5rem; margin-bottom: 1.5rem;">تأمین‌کنندگان نشان‌شده (${favBizs.length})</h2>
          <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1.5rem;">
              ${favBizs.length > 0 ? favBizs.map(b => `
                  <div style="background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 1.5rem; display: flex; align-items: center; gap: 15px;">
                      <img src="${b.logo}" style="width: 60px; height: 60px; border-radius: 50%; object-fit: cover; border: 1px solid #e2e8f0;">
                      <div style="flex-grow: 1;">
                          <h4 style="font-size: 1rem; margin-bottom: 5px; color: #0f172a;">${b.name}</h4>
                          <div style="display:flex; gap:10px; margin-top: 10px;">
                              <a href="business.html?id=${b.id}" target="_blank" class="btn btn-primary" style="padding: 4px 10px; font-size: 0.8rem;">پروفایل</a>
                              <button class="btn btn-outline" style="padding: 4px 10px; font-size: 0.8rem; color: #ef4444; border-color: #ef4444;" onclick="AppStore.toggleFavBusiness('${b.id}'); window.loadFavoritesTab('businesses');">حذف</button>
                          </div>
                      </div>
                  </div>
              `).join('') : '<div style="grid-column: 1/-1; text-align:center; padding:3rem; background:white; border-radius:12px; border:1px solid var(--color-border); color:#64748b;">تأمین‌کننده‌ای نشان نشده است.</div>'}
          </div>
      `;
  }
};
// ==========================================
// 🌟 مدیریت تنظیمات پروفایل (Profile Settings) 🌟
// ==========================================

window.loadProfileTab = () => {
  const content = document.getElementById('panel-content');
  const p = currentProfile || {};
  const roles = p.roles || ['buyer', 'supplier'];
  const bizTypes = p.businessTypes || [];
  const isService = roles.includes('service_provider');

  
  // توابع کمکی برای تیک‌خوردن چک‌باکس‌ها
  const isRole = (r) => roles.includes(r) ? 'checked' : '';
  const isType = (t) => bizTypes.includes(t) ? 'checked' : '';

  // محاسبه درصد تکمیل پروفایل
  const requiredFields = [p.name, p.englishName, p.industry, p.description, p.country, p.city, p.address, p.phone, p.email, p.contact?.person, p.targetMarkets];
  const filledFields = requiredFields.filter(f => f && String(f).trim() !== '').length;
  const completionRate = Math.round((filledFields / requiredFields.length) * 100) || 0;

  const style = `
    <style>
      .step-container { display: flex; justify-content: space-between; margin-bottom: 2rem; background: white; padding: 10px; border-radius: 12px; border: 1px solid var(--color-border); box-shadow: 0 2px 4px rgba(0,0,0,0.02); }
      .step-indicator { flex: 1; text-align: center; padding: 12px 10px; font-weight: 600; font-size: 0.95rem; transition: 0.3s; color: #94a3b8; border-bottom: 3px solid transparent; cursor: pointer; }
      .step-active { color: var(--color-primary); border-bottom-color: var(--color-primary); }
      .step-completed { color: #10b981; border-bottom-color: #10b981; }
      .profile-step-content { display: none; animation: fadeIn 0.3s ease-in-out; }
      
      .prof-card { background: white; border: 1px solid var(--color-border); border-radius: 12px; padding: 1.5rem; margin-bottom: 1.5rem; box-shadow: 0 2px 4px rgba(0,0,0,0.02); }
      .prof-card-title { font-size: 1.1rem; color: #0f172a; margin-bottom: 1.2rem; border-bottom: 2px solid #f1f5f9; padding-bottom: 8px; display: flex; align-items: center; gap: 8px; }
      
      .checkbox-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 10px; }
      .checkbox-card { border: 1px solid var(--color-border); padding: 10px 12px; border-radius: 8px; display: flex; align-items: center; gap: 10px; cursor: pointer; transition: 0.2s; background: #f8fafc; font-size: 0.9rem; color: #334155; }
      .checkbox-card:hover { border-color: var(--color-primary); background: #eff6ff; }
      .checkbox-card input { width: 16px; height: 16px; accent-color: var(--color-primary); cursor: pointer; }
      
      .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
      .form-grid.full { grid-template-columns: 1fr; }
      
      .prof-label { font-weight: 600; display: block; margin-bottom: 6px; color: #1e293b; font-size: 0.9rem; }
      .prof-input { width: 100%; padding: 10px 12px; border: 1px solid #cbd5e1; border-radius: 8px; font-family: inherit; font-size: 0.95rem; outline: none; transition: 0.2s; background: white; }
      .prof-input:focus { border-color: var(--color-primary); box-shadow: 0 0 0 3px rgba(37,99,235,0.1); }
      
      .completion-bar-bg { width: 100%; height: 8px; background: #e2e8f0; border-radius: 10px; overflow: hidden; margin-top: 10px; }
      .completion-bar-fill { height: 100%; background: ${completionRate >= 80 ? '#10b981' : (completionRate >= 50 ? '#f59e0b' : '#ef4444')}; transition: width 1s ease; }
      
      @keyframes fadeIn { from {opacity: 0; transform: translateY(5px);} to {opacity: 1; transform: translateY(0);} }
      @media (max-width: 768px) { .form-grid { grid-template-columns: 1fr; } }
    </style>
  `;

  content.innerHTML = style + `
    <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 15px;">
        <div>
            <h2 style="font-size: 1.6rem; color: #0f172a; margin-bottom: 5px;"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: bottom; margin-left: 8px;"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect><path d="M9 22v-4h6v4"></path></svg> ویرایش پروفایل تجاری شرکت</h2>
            <p style="color: #64748b; font-size: 0.95rem; margin: 0;">پروفایل کامل‌تر = جلب اعتماد بیشتر فروشندگان هنگام شرکت در مناقصات.</p>
        </div>
        <div style="background: white; border: 1px solid var(--color-border); padding: 12px 20px; border-radius: 12px; min-width: 250px; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
            <div style="display: flex; justify-content: space-between; font-size: 0.9rem; font-weight: bold; color: #1e293b;">
                <span>وضعیت تکمیل پروفایل</span>
                <span style="color: ${completionRate >= 80 ? '#10b981' : '#f59e0b'};">${completionRate}٪</span>
            </div>
            <div class="completion-bar-bg"><div class="completion-bar-fill" style="width: ${completionRate}%;"></div></div>
        </div>
    </div>
    
    <div class="step-container">
      <div class="step-indicator" id="ind-1" onclick="window.showProfileStep(1)" data-title="اطلاعات هویتی و ثبتی">۱. اطلاعات هویتی و ثبتی</div>
      <div class="step-indicator" id="ind-2" onclick="window.showProfileStep(2)" data-title="اطلاعات تماس و موقعیت">۲. اطلاعات تماس و موقعیت</div>
      <div class="step-indicator" id="ind-3" onclick="window.showProfileStep(3)" data-title="توانمندی‌ها و بازار">۳. توانمندی‌ها و بازار</div>
    </div>

    <!-- ======================= -->
    <!-- STEP 1: Identity        -->
    <!-- ======================= -->
    <div id="step-1" class="profile-step-content">
        
        <div class="prof-card">
            <h4 class="prof-card-title"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg> هویت اصلی</h4>
            <div class="form-grid">
                <div><label class="prof-label">نام رسمی شرکت *</label><input type="text" id="p-name" class="prof-input" value="${p.name || ''}" placeholder="شرکت تولیدی..."></div>
                <div><label class="prof-label">نام انگلیسی شرکت *</label><input type="text" id="p-en-name" class="prof-input" value="${p.englishName || ''}" dir="ltr" placeholder="Company Ltd."></div>
                <div><label class="prof-label">نام تجاری / برند</label><input type="text" id="p-brand" class="prof-input" value="${p.brand || ''}"></div>
                <div><label class="prof-label">سال تأسیس</label><input type="number" id="p-year" class="prof-input" value="${p.foundedYear || ''}" dir="ltr"></div>
            </div>
        </div>

        <div class="prof-card">
            <h4 class="prof-card-title"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg> اطلاعات ثبتی و قانونی</h4>
            <div class="form-grid">
                <div><label class="prof-label">شماره ثبت</label><input type="text" id="p-reg-no" class="prof-input" value="${p.registrationNumber || ''}" dir="ltr"></div>
                <div><label class="prof-label">شناسه ملی / شناسه تجاری</label><input type="text" id="p-nat-id" class="prof-input" value="${p.nationalId || ''}" dir="ltr"></div>
                <div><label class="prof-label">کد اقتصادی</label><input type="text" id="p-eco-code" class="prof-input" value="${p.economicCode || ''}" dir="ltr"></div>
                <div><label class="prof-label">صنعت / صنایع اصلی فعالیت</label><input type="text" id="p-industry" class="prof-input" value="${p.industry || ''}" placeholder="مثلاً: پتروشیمی، فلزات..."></div>
            </div>
        </div>

        <div class="prof-card">
            <h4 class="prof-card-title"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="3" x2="9" y2="21"></line></svg> نوع کسب‌وکار (Business Type)</h4>
            <div class="checkbox-grid">
                <label class="checkbox-card"><input type="checkbox" class="cb-biz-type" value="Manufacturer" ${isType('Manufacturer')}> تولیدکننده (Manufacturer)</label>
                <label class="checkbox-card"><input type="checkbox" class="cb-biz-type" value="Supplier" ${isType('Supplier')}> تأمین‌کننده (Supplier)</label>
                <label class="checkbox-card"><input type="checkbox" class="cb-biz-type" value="Wholesaler" ${isType('Wholesaler')}> عمده‌فروش (Wholesaler)</label>
                <label class="checkbox-card"><input type="checkbox" class="cb-biz-type" value="Distributor" ${isType('Distributor')}> توزیع‌کننده (Distributor)</label>
                <label class="checkbox-card"><input type="checkbox" class="cb-biz-type" value="Importer" ${isType('Importer')}> واردکننده (Importer)</label>
                <label class="checkbox-card"><input type="checkbox" class="cb-biz-type" value="Exporter" ${isType('Exporter')}> صادرکننده (Exporter)</label>
                <label class="checkbox-card"><input type="checkbox" class="cb-biz-type" value="Service Provider" ${isType('Service Provider')}> خدمات (Service Provider)</label>
            </div>
        </div>

        <div class="prof-card">
            <h4 class="prof-card-title"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg> معرفی و مدیا</h4>
            <div class="form-grid full">
                <div>
                    <label class="prof-label">معرفی کوتاه (شعار یا خلاصه فعالیت)</label>
                    <input type="text" id="p-short-desc" class="prof-input" value="${p.shortDescription || ''}" placeholder="جمله‌ای کوتاه که در کارت شرکت نمایش داده می‌شود.">
                </div>
                <div>
                    <label class="prof-label">درباره ما (معرفی کامل شرکت)</label>
                    <textarea id="p-desc" class="prof-input" rows="5" placeholder="تاریخچه، توانمندی‌ها و اهداف شرکت را بنویسید...">${p.description || ''}</textarea>
                </div>
                <div class="form-grid">
                    <div>
                        <label class="prof-label">لوگوی شرکت</label>
                        <button class="btn btn-outline btn-full"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-left:5px;"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg> آپلود لوگو (JPG/PNG)</button>
                    </div>
                    <div>
                        <label class="prof-label">تصاویر کارخانه / دفتر / گالری</label>
                        <button class="btn btn-outline btn-full"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-left:5px;"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg> آپلود تصاویر (حداکثر ۵)</button>
                    </div>
                </div>
            </div>
        </div>

        <div style="text-align: left;">
          <button class="btn btn-primary" style="padding: 10px 40px;" onclick="window.showProfileStep(2)">مرحله بعد ➔</button>
        </div>
    </div>

    <!-- ======================= -->
    <!-- STEP 2: Contact         -->
    <!-- ======================= -->
    <div id="step-2" class="profile-step-content">
        
        <div class="prof-card">
            <h4 class="prof-card-title"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg> آدرس و موقعیت</h4>
            <div class="form-grid">
                <div><label class="prof-label">کشور *</label><input type="text" id="p-country" class="prof-input" value="${p.country || 'ایران'}"></div>
                <div><label class="prof-label">استان / شهر *</label><input type="text" id="p-city" class="prof-input" value="${p.city || ''}"></div>
                <div style="grid-column: 1 / -1;"><label class="prof-label">آدرس دقیق دفتر مرکزی *</label><input type="text" id="p-address" class="prof-input" value="${p.address || ''}"></div>
                <div style="grid-column: 1 / -1;"><label class="prof-label">آدرس کارخانه / انبار (در صورت وجود)</label><input type="text" id="p-factory-addr" class="prof-input" value="${p.factoryAddress || ''}"></div>
            </div>
        </div>

        <div class="prof-card">
            <h4 class="prof-card-title"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg> راه‌های ارتباطی</h4>
            <div class="form-grid">
                <div><label class="prof-label">تلفن ثابت (با کد) *</label><input type="text" id="p-phone" class="prof-input" value="${p.phone || ''}" dir="ltr"></div>
                <div><label class="prof-label">ایمیل سازمانی *</label><input type="email" id="p-email" class="prof-input" value="${p.email || ''}" dir="ltr"></div>
                <div><label class="prof-label">وب‌سایت رسمی</label><input type="url" id="p-web" class="prof-input" value="${p.website || ''}" dir="ltr"></div>
                <div><label class="prof-label">شماره واتساپ (تجاری)</label><input type="text" id="p-wa" class="prof-input" value="${p.contact?.whatsapp || ''}" dir="ltr"></div>
            </div>
        </div>

        <div class="prof-card">
            <h4 class="prof-card-title"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg> شخص رابط تجاری (Contact Person)</h4>
            <div class="form-grid">
                <div><label class="prof-label">نام و نام خانوادگی رابط</label><input type="text" id="p-cp-name" class="prof-input" value="${p.contact?.person || ''}"></div>
                <div><label class="prof-label">سمت شخص رابط</label><input type="text" id="p-cp-title" class="prof-input" value="${p.contact?.title || ''}" placeholder="مدیر فروش، کارشناس خرید..."></div>
                <div><label class="prof-label">شماره موبایل رابط</label><input type="text" id="p-cp-phone" class="prof-input" value="${p.contact?.personPhone || ''}" dir="ltr"></div>
                <div><label class="prof-label">ایمیل مستقیم رابط</label><input type="email" id="p-cp-email" class="prof-input" value="${p.contact?.personEmail || ''}" dir="ltr"></div>
            </div>
        </div>

        <div style="display: flex; justify-content: space-between;">
          <button class="btn btn-outline" style="padding: 10px 30px;" onclick="window.showProfileStep(1)">➔ مرحله قبل</button>
          <button class="btn btn-primary" style="padding: 10px 40px;" onclick="window.showProfileStep(3)">مرحله بعد ➔</button>
        </div>
    </div>

    <!-- ======================= -->
    <!-- STEP 3: Capabilities    -->
    <!-- ======================= -->
    <div id="step-3" class="profile-step-content">
        
        <div class="prof-card" style="border-color: var(--color-primary); background: #f8fafc;">
            <h4 class="prof-card-title" style="border-bottom-color: #cbd5e1;"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg> نقش شما در TradeCore</h4>
            <div class="checkbox-grid">
                <label class="checkbox-card" style="background: white;"><input type="checkbox" id="role-buyer" class="cb-role" value="buyer" ${isRole('buyer')}> خریدار (ارسال RFQ / مناقصه)</label>
                <label class="checkbox-card" style="background: white;"><input type="checkbox" id="role-supplier" class="cb-role" value="supplier" ${isRole('supplier')}> تأمین‌کننده (فروش کالا)</label>
                <label class="checkbox-card" style="background: white;"><input type="checkbox" id="role-service" class="cb-role" value="service_provider" ${isRole('service_provider')} onchange="window.toggleServiceFields()"> ارائه‌دهنده خدمات صنعتی</label>
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

        <div class="prof-card">
            <h4 class="prof-card-title"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg> توانمندی‌های خرید و تأمین</h4>
            <div class="form-grid">
                <div>
                    <label class="prof-label">تعداد کارکنان</label>
                    <select id="p-employees" class="prof-input">
                        <option value="">انتخاب کنید...</option>
                        <option value="1-10" ${p.employees === '1-10' ? 'selected' : ''}>۱ تا ۱۰ نفر</option>
                        <option value="11-50" ${p.employees === '11-50' ? 'selected' : ''}>۱۱ تا ۵۰ نفر</option>
                        <option value="51-200" ${p.employees === '51-200' ? 'selected' : ''}>۵۱ تا ۲۰۰ نفر</option>
                        <option value="201-500" ${p.employees === '201-500' ? 'selected' : ''}>۲۰۱ تا ۵۰۰ نفر</option>
                        <option value="500+" ${p.employees === '500+' ? 'selected' : ''}>بیش از ۵۰۰ نفر</option>
                    </select>
                </div>
                <div>
                    <label class="prof-label">نوع تولید / عرضه</label>
                    <select id="p-prod-type" class="prof-input">
                        <option value="">انتخاب کنید...</option>
                        <option value="Domestic" ${p.productionType === 'Domestic' ? 'selected' : ''}>تولید داخلی (کامل)</option>
                        <option value="Assembly" ${p.productionType === 'Assembly' ? 'selected' : ''}>مونتاژ</option>
                        <option value="Import" ${p.productionType === 'Import' ? 'selected' : ''}>واردات و فروش</option>
                        <option value="Distribution" ${p.productionType === 'Distribution' ? 'selected' : ''}>توزیع منطقه‌ای</option>
                    </select>
                </div>
                <div style="grid-column: 1 / -1;"><label class="prof-label">نیازهای اصلی خرید / محصولات تولیدی</label><input type="text" id="p-main-prods" class="prof-input" value="${p.mainProducts || ''}" placeholder="مثال: قطعات فولادی، روانکارهای صنعتی..."></div>
                <div><label class="prof-label">ظرفیت تولید / خرید (ماهانه/سالانه)</label><input type="text" id="p-capacity" class="prof-input" value="${p.capacity || ''}" placeholder="مثال: 5000 تن در ماه"></div>
                <div><label class="prof-label">حداقل سفارش معمول (MOQ)</label><input type="text" id="p-moq" class="prof-input" value="${p.moq || ''}" placeholder="مثال: 1 پالت یا 100 عدد"></div>
            </div>
            
            <div style="display: flex; gap: 20px; margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px dashed #e2e8f0;">
                <label class="checkbox-card" style="flex: 1; justify-content: center; font-weight: bold;"><input type="checkbox" id="p-oem" ${p.oem ? 'checked' : ''}> امکان تولید با برند مشتری (OEM)</label>
                <label class="checkbox-card" style="flex: 1; justify-content: center; font-weight: bold;"><input type="checkbox" id="p-odm" ${p.odm ? 'checked' : ''}> امکان طراحی و تولید سفارشی (ODM)</label>
            </div>
        </div>

        <div class="prof-card">
            <h4 class="prof-card-title"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg> بازارها و شرایط تجاری</h4>
            <div class="form-grid">
                <div style="grid-column: 1 / -1;"><label class="prof-label">بازارهای هدف اصلی</label><input type="text" id="p-target-markets" class="prof-input" value="${p.targetMarkets || ''}" placeholder="خاورمیانه، اروپا، آفریقا..."></div>
                <div><label class="prof-label">کشورهای صادراتی اصلی</label><input type="text" id="p-export" class="prof-input" value="${p.exportCountries || ''}" placeholder="عراق، ترکیه، امارات..."></div>
                <div><label class="prof-label">کشورهای وارداتی (تأمین مواد)</label><input type="text" id="p-import" class="prof-input" value="${p.importCountries || ''}" placeholder="چین، آلمان..."></div>
                <div><label class="prof-label">شرایط پرداخت مورد قبول</label><input type="text" id="p-pay-terms" class="prof-input" value="${p.paymentTerms || ''}" placeholder="نقدی، LC، اعتباری..."></div>
                <div><label class="prof-label">شرایط تحویل معمول (Incoterms)</label><input type="text" id="p-delivery" class="prof-input" value="${p.deliveryTerms || ''}" placeholder="FOB, CIF, EXW..."></div>
            </div>
        </div>

        <div class="prof-card">
            <h4 class="prof-card-title"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg> استانداردها و گواهینامه‌ها</h4>
            <div class="form-grid full">
                <div>
                    <label class="prof-label">استانداردها و گواهینامه‌های کیفی (با کاما جدا کنید)</label>
                    <input type="text" id="p-certs" class="prof-input" value="${p.certifications ? p.certifications.join(', ') : ''}" placeholder="ISO 9001, CE, FDA, API...">
                </div>
                <div>
                    <label class="prof-label">عضویت‌ها و افتخارات (سندیکا، انجمن، و...)</label>
                    <textarea id="p-awards" class="prof-input" rows="2" placeholder="عضو اتاق بازرگانی، تولیدکننده نمونه سال...">${p.awards || ''}</textarea>
                </div>
            </div>
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 2rem; border-top: 1px solid var(--color-border); padding-top: 1.5rem;">
          <button class="btn btn-outline" style="padding: 10px 30px;" onclick="window.showProfileStep(2)">➔ مرحله قبل</button>
          <button class="btn btn-primary" style="padding: 10px 40px; background: #10b981; border-color: #10b981; font-size: 1.05rem;" onclick="window.submitProfile(event)">
             <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-left: 6px;"><polyline points="20 6 9 17 4 12"></polyline></svg> ذخیره و بروزرسانی نهایی پروفایل
          </button>
        </div>
    </div>
  `;

  setTimeout(() => window.showProfileStep(1), 0);
};

// 🌟 تابع ذخیره‌سازی اطلاعات خریدار
window.submitProfile = async (event) => {
  const btn = event.target.closest('button');
  const originalText = btn.innerHTML;
  btn.innerHTML = 'در حال ذخیره‌سازی...';
  btn.disabled = true;

  const roles = Array.from(document.querySelectorAll('.cb-role:checked')).map(cb => cb.value);
  const businessTypes = Array.from(document.querySelectorAll('.cb-biz-type:checked')).map(cb => cb.value);
  const certsRaw = document.getElementById('p-certs').value;
  const certifications = certsRaw ? certsRaw.split(',').map(s => s.trim()).filter(Boolean) : [];

  const profileData = {
      name: document.getElementById('p-name').value,
      englishName: document.getElementById('p-en-name').value,
      brand: document.getElementById('p-brand').value,
      foundedYear: document.getElementById('p-year').value,
      registrationNumber: document.getElementById('p-reg-no').value,
      nationalId: document.getElementById('p-nat-id').value,
      economicCode: document.getElementById('p-eco-code').value,
      industry: document.getElementById('p-industry').value,
      businessTypes: businessTypes,
      shortDescription: document.getElementById('p-short-desc').value,
      description: document.getElementById('p-desc').value,
      
      country: document.getElementById('p-country').value,
      city: document.getElementById('p-city').value,
      address: document.getElementById('p-address').value,
      factoryAddress: document.getElementById('p-factory-addr').value,
      phone: document.getElementById('p-phone').value,
      email: document.getElementById('p-email').value,
      website: document.getElementById('p-web').value,
      contact: {
          whatsapp: document.getElementById('p-wa').value,
          person: document.getElementById('p-cp-name').value,
          title: document.getElementById('p-cp-title').value,
          personPhone: document.getElementById('p-cp-phone').value,
          personEmail: document.getElementById('p-cp-email').value,
      },
      
      roles: roles,
      employees: document.getElementById('p-employees').value,
      productionType: document.getElementById('p-prod-type').value,
      mainProducts: document.getElementById('p-main-prods').value,
      capacity: document.getElementById('p-capacity').value,
      oem: document.getElementById('p-oem').checked,
      odm: document.getElementById('p-odm').checked,
      targetMarkets: document.getElementById('p-target-markets').value,
      exportCountries: document.getElementById('p-export').value,
      importCountries: document.getElementById('p-import').value,
      paymentTerms: document.getElementById('p-pay-terms').value,
      deliveryTerms: document.getElementById('p-delivery').value,
      
      certifications: certifications,
      awards: document.getElementById('p-awards').value
  };

  try {
      // 🌟 استفاده مستقیم از ماژول BuyerService بدون دخالت window
      await BuyerService.updateProfile(profileData);
      alert('پروفایل تجاری شما با موفقیت بروزرسانی شد.');
      
      currentProfile = await BuyerService.getProfile();
      window.loadProfileTab();
  } catch (error) {
      alert(error.message || 'خطا در ذخیره‌سازی اطلاعات.');
      btn.innerHTML = originalText;
      btn.disabled = false;
  }
};
window.showProfileStep = (step) => {
  document.querySelectorAll('.profile-step-content').forEach(el => el.style.display = 'none');
  const targetEl = document.getElementById(`step-${step}`);
  if (targetEl) {
      targetEl.style.display = 'block';
      targetEl.style.animation = 'none';
      targetEl.offsetHeight; 
      targetEl.style.animation = null; 
  }

  document.querySelectorAll('.step-indicator').forEach((el, index) => {
    if(!el.classList.contains('prod-step-indicator')) {
        if (index + 1 < step) {
          el.className = 'step-indicator step-completed';
          el.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-left: 6px;"><polyline points="20 6 9 17 4 12"></polyline></svg> ${el.dataset.title}`;
        } else if (index + 1 === step) {
          el.className = 'step-indicator step-active';
          el.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-left: 6px;"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1 0-2.83 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg> ${el.dataset.title}`;
        } else {
          el.className = 'step-indicator step-pending';
          el.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-left: 6px;"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 15 15"></polyline></svg> ${el.dataset.title}`;
        }
    }
  });
};

window.nextProfileStep = () => { if(window.currentProfileStep < 3) window.showProfileStep(window.currentProfileStep + 1); };
window.prevProfileStep = () => { if(window.currentProfileStep > 1) window.showProfileStep(window.currentProfileStep - 1); };

window.toggleServiceFields = () => {
    const isChecked = document.getElementById('role-service').checked;
    const container = document.getElementById('service-types-container');
    if (container) container.style.display = isChecked ? 'block' : 'none';
};