// js/pages/sellerPanel.js

import { AppStore } from '../data/appStore.js';
import { SellerService } from '../services/sellerService.js';
import { ProductService } from '../services/productService.js';
import { MessageService } from '../services/messageService.js';
import { businesses } from '../data/businesses.js'; 
import { ArticleService } from '../services/articleService.js'; 
import { CategoryService } from '../services/categoryService.js'; 
import { SupportService } from '../services/supportService.js';

let currentProfile = null;
let currentSummary = null;
let currentProductPage = 1;
let currentInboxTab = 'direct'; 
let currentDirectPage = 1;
let currentTenderPage = 1;
let currentRadarPage = 1; 
let currentAnalyticsSort = 'views_desc'; 
let currentActiveChatId = null; 
let currentAddingItemType = 'goods'; 
let hasViewedInbox = false; 

document.addEventListener('DOMContentLoaded', () => {
  initSellerPanel();
});

window.showUpgradePaywall = (featureName) => {
    const modalHtml = `
      <div id="paywall-modal" class="modal-overlay" style="z-index: 9999;">
        <div class="modal-content" style="text-align: center; padding: 2rem;">
          <div style="background: #fdf4ff; width: 80px; height: 80px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1.5rem;">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#d946ef" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
          </div>
          <h2 style="font-size: 1.5rem; margin-bottom: 1rem; color: #1e293b;">ارتقای اکانت به نسخه Premium</h2>
          <p style="color: #64748b; margin-bottom: 2rem; font-size: 1rem; line-height: 1.6;">
            شما برای استفاده از امکان <strong>${featureName}</strong> نیاز به ارتقاء اشتراک خود دارید. با تهیه پکیج پریمیوم، به لیست خریداران واقعی متصل شوید و فروش خود را چند برابر کنید.
          </p>
          <button class="btn btn-primary btn-full" style="background: #d946ef; border-color: #d946ef; margin-bottom: 10px;" onclick="alert('انتقال به درگاه پرداخت در نسخه نهایی')">انتخاب پکیج و پرداخت</button>
          <button class="btn btn-outline btn-full" onclick="document.getElementById('paywall-modal').remove()">بازگشت</button>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
};

function injectMissingTabs() {
    const navUl = document.querySelector('.panel-nav ul');
    if(navUl && !document.querySelector('[data-tab="messages"]')) {
        const inboxLi = document.querySelector('[data-tab="inbox"]').parentElement;
        const newTabsHtml = `
            <li><a href="#" data-tab="deals"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: text-bottom; margin-left: 6px;"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg> معاملات من</a></li>
            <li><a href="#" data-tab="messages"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: text-bottom; margin-left: 6px;"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg> پیام‌ها و چت‌ها</a></li>
            <li><a href="#" data-tab="notifications"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: text-bottom; margin-left: 6px;"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg> مرکز اعلان‌ها</a></li>
        `;
        inboxLi.insertAdjacentHTML('afterend', newTabsHtml);
    }

    if(navUl && !document.querySelector('[data-tab="support"]')) {
        const settingsLi = document.querySelector('[data-tab="company-profile"]').parentElement;
        const supportHtml = `
            <li><a href="#" data-tab="support"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: text-bottom; margin-left: 6px;"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg> پشتیبانی و تیکت</a></li>
        `;
        settingsLi.insertAdjacentHTML('beforebegin', supportHtml);
    }
}

function updateSidebarBadges() {
    if(!currentSummary) return;
    const inboxTab = document.querySelector('.panel-nav a[data-tab="inbox"]');
    if(!inboxTab) return;

    if (hasViewedInbox) {
        const existingBadge = inboxTab.querySelector('.nav-badge');
        if (existingBadge) existingBadge.style.display = 'none';
        return;
    }

    const totalNew = (currentSummary.newRfqsCount || 0) + (currentSummary.newDealsCount || 0);
    let badge = inboxTab.querySelector('.nav-badge');
    
    if(!badge) {
        badge = document.createElement('span');
        badge.className = 'nav-badge';
        badge.style.cssText = 'background-color: #8b5cf6; color: white; border-radius: 50%; min-width: 22px; height: 22px; display: inline-flex; align-items: center; justify-content: center; font-size: 0.75rem; margin-right: auto; font-weight: bold; box-shadow: 0 2px 4px rgba(139, 92, 246, 0.3);';
        inboxTab.style.display = 'flex';
        inboxTab.style.alignItems = 'center';
        inboxTab.appendChild(badge);
    }

    if(totalNew > 0) {
        badge.textContent = totalNew;
        badge.style.display = 'inline-flex';
    } else {
        badge.style.display = 'none';
    }
}

async function initSellerPanel() {
  injectMissingTabs();
  currentProfile = await SellerService.getProfile();
  if (currentProfile) document.getElementById('top-user-name').innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: text-bottom; margin-left: 6px;"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect><path d="M9 22v-4h6v4"></path><path d="M8 6h.01"></path><path d="M16 6h.01"></path><path d="M12 6h.01"></path><path d="M12 10h.01"></path><path d="M12 14h.01"></path><path d="M16 10h.01"></path><path d="M16 14h.01"></path><path d="M8 10h.01"></path><path d="M8 14h.01"></path></svg> ${currentProfile.name} (پنل تأمین)`;
  
  currentSummary = await SellerService.getDashboardSummary();
  updateSidebarBadges(); 
  loadDashboardTab();

  const navLinks = document.querySelectorAll('.panel-nav a');
  navLinks.forEach(link => {
    link.addEventListener('click', async (e) => {
      e.preventDefault();
      navLinks.forEach(l => l.classList.remove('active'));
      const targetLink = e.target.closest('a');
      if(targetLink) targetLink.classList.add('active');
      
      const tab = targetLink ? targetLink.getAttribute('data-tab') : null;
      if (tab === 'inbox') { 
          hasViewedInbox = true; 
          SellerService.markInboxAsRead(); // 🌟 خوانده شدن پیام‌ها ثبت شد
          currentSummary.newRfqsCount = 0; 
          currentSummary.newDealsCount = 0;
          updateSidebarBadges(); 
          loadInboxTab(); 
      }
      else if (tab === 'dashboard') loadDashboardTab();
      else if (tab === 'my-products') loadProductsTab();
      else if (tab === 'my-articles') loadMyArticlesTab(); 
      else if (tab === 'analytics') loadAnalyticsTab(); 
      else if (tab === 'company-profile') loadProfileTab();
      else if (tab === 'messages') loadMessagesTab();
      else if (tab === 'deals') loadDealsTab();
      else if (tab === 'notifications') loadNotificationsTab();
      else if (tab === 'support') loadSupportTab(); 
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
                    <input type="text" id="ticket-subject" class="form-input" style="margin-bottom: 15px;" placeholder="مثلاً: مشکل در تأیید محصول یا ارتقای پلن">
                    
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

function loadDashboardTab() {
  const content = document.getElementById('panel-content');
  const profileStatus = AppStore.getProfileCompletionStatus(); 
  const tasksHtml = profileStatus.missingTasks.length > 0 
    ? `<ul style="margin-top: 10px; font-size: 0.85rem; color: #ef4444; padding-right: 20px;">
        ${profileStatus.missingTasks.map(task => `<li>${task}</li>`).join('')}
       </ul>`
    : `<p style="margin-top: 10px; font-size: 0.9rem; color: #10b981;"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: text-bottom; margin-left: 4px;"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg> پروفایل شرکت شما کامل است!</p>`;

  content.innerHTML = `
    <h1 style="font-size: 1.8rem; margin-bottom: 1.5rem;">خلاصه وضعیت کسب‌وکار شما</h1>
    
    <div style="background: white; border: 1px solid var(--color-border); border-radius: 12px; padding: 1.5rem; margin-bottom: 2rem; display: flex; align-items: center; gap: 2rem; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
      <div style="flex-shrink: 0; text-align: center;">
        <div style="width: 80px; height: 80px; border-radius: 50%; background: conic-gradient(var(--color-primary) ${profileStatus.percentage}%, #e2e8f0 0); display: flex; align-items: center; justify-content: center;">
          <div style="width: 65px; height: 65px; background: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 1.2rem; color: var(--color-primary);">${profileStatus.percentage}%</div>
        </div>
      </div>
      <div>
        <h3 style="margin-bottom: 5px;">وضعیت تکمیل پروفایل تجاری</h3>
        <p style="color: var(--color-text-muted); font-size: 0.9rem;">تکمیل پروفایل به خریداران کمک می‌کند اعتماد بیشتری به محصولات و خدمات شما داشته باشند.</p>
        ${tasksHtml}
      </div>
      <div style="margin-right: auto;">
        <button class="btn btn-primary" onclick="document.querySelector('[data-tab=\\'company-profile\\']').click()">تکمیل پروفایل</button>
      </div>
    </div>

    <div class="panel-stats-grid">
      <div class="stat-card" style="border-bottom: 4px solid var(--color-secondary);">
        <h3>درخواست‌های جدید (Leads)</h3>
        <div class="stat-value text-accent">${currentSummary.newRfqsCount}</div>
      </div>
      <div class="stat-card" style="border-bottom: 4px solid #10b981;">
        <h3>پیشنهادات ارسالی (مناقصات)</h3>
        <div class="stat-value" style="color: #10b981;">${currentSummary.sentProposalsCount || 0}</div>
      </div>
      <div class="stat-card" style="border-bottom: 4px solid #8b5cf6;">
        <h3>آیتم‌های فعال (کالا / خدمات)</h3>
        <div class="stat-value" style="color: #8b5cf6;">${currentSummary.productsCount}</div>
      </div>
      <div class="stat-card" style="border-bottom: 4px solid var(--color-primary);">
        <h3>بازدید پروفایل (بازه فعلی)</h3>
        <div class="stat-value" style="color: var(--color-primary);">${currentSummary.profileViews}</div>
      </div>
    </div>
  `;
}

function loadDealsTab() {
    const content = document.getElementById('panel-content');
    const myDeals = AppStore.getAllDeals().filter(d => d.mainSupplierId === AppStore.getActiveUserId() || (d.pitches && d.pitches.some(p => p.supplierId === AppStore.getActiveUserId())));

    content.innerHTML = `
      <h2 style="font-size: 1.5rem; margin-bottom: 1.5rem;">معاملات و تأمین‌های در جریان</h2>
      <div class="panel-table-container">
        <table class="panel-table">
          <thead>
            <tr>
              <th>شناسه معامله</th>
              <th>خریدار (مشتری)</th>
              <th>موضوع / کالا</th>
              <th>تاریخ ثبت</th>
              <th>وضعیت</th>
              <th>عملیات</th>
            </tr>
          </thead>
          <tbody>
            ${myDeals.length > 0 ? myDeals.map(d => `
              <tr>
                <td style="font-family: monospace; color:#64748b;">#${d.id.toUpperCase()}</td>
                <td style="font-weight: 600; color: var(--color-primary);">${businesses.find(b=>b.id===d.buyerId)?.name || 'نامشخص'}</td>
                <td>${d.title}</td>
                <td style="color: var(--color-text-muted);" dir="ltr">${d.date.split(',')[0]}</td>
                <td><span class="status-badge" style="background:#e0e7ff; color:#4338ca;">در حال مذاکره</span></td>
                <td>
                  <button class="btn btn-outline" style="padding: 4px 8px; font-size: 0.8rem;" onclick="document.querySelector('[data-tab=\\'messages\\']').click()">ورود به مذاکره</button>
                </td>
              </tr>
            `).join('') : '<tr><td colspan="6" style="text-align:center;">معامله‌ای ثبت نشده است</td></tr>'}
          </tbody>
        </table>
      </div>
    `;
}

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
          
          // 🌟 تبدیل هوشمند لینک به اکشنِ کلیک روی تب‌های سایدبار 🌟
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
  
  // 🌟 ۳. رفع مشکل سین نشدن پیام‌ها: تغییر وضعیت پیام‌ها به خوانده شده در دیتابیس
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

  // گرفتن دیتای پردازش شده پس از آپدیت
  const convs = await MessageService.getMyConversations();
  const conv = convs.find(c => c.id === convId);
  if(!conv) return;

  // آپدیت ظاهر سایدبار چت‌ها (تغییر رنگ بک‌گراند و حذف بج قرمز)
  document.querySelectorAll('#chat-sidebar > div').forEach(item => {
      item.style.backgroundColor = 'white';
      if(item.getAttribute('onclick').includes(convId)) {
          item.style.backgroundColor = '#eff6ff';
          // حذف ویژوال بج قرمز پیام‌های نخوانده
          const unreadBadge = item.querySelector('span[style*="background: #ef4444"]');
          if (unreadBadge) unreadBadge.remove();
      }
  });

  // 🌟 ۱. رفع مشکل مشاهده پروفایل: پیدا کردن آیدی طرف مقابل برای لینک واقعی
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
          <!-- تبدیل به لینک واقعی برای پروفایل شرکت -->
          <a href="business.html?id=${otherUserId}" target="_blank" class="btn btn-outline" style="padding: 6px 12px; font-size: 0.85rem; text-decoration: none;">مشاهده پروفایل</a>
      </div>
      
      <div id="chat-messages-area" style="flex: 1; padding: 20px; overflow-y: auto; background: #f8fafc;">
          ${messagesHtml || '<div style="text-align: center; color: #94a3b8; margin-top: 2rem;">اولین پیام خود را ارسال کنید...</div>'}
      </div>
      
      <div style="padding: 15px 20px; background: white; border-top: 1px solid var(--color-border); display: flex; gap: 10px; align-items: center;">
          <!-- 🌟 ۲. رفع مشکل آپلود فایل: اتصال دکمه به input file مخفی -->
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

window.switchInboxTab = (tab) => {
    currentInboxTab = tab;
    loadInboxTab();
};

window.changeInboxPage = (page) => {
    if (currentInboxTab === 'direct') currentDirectPage = page;
    else if (currentInboxTab === 'tenders') currentTenderPage = page;
    else currentRadarPage = page;
    loadInboxTab();
};

window.loadInboxTab = async () => {
  const content = document.getElementById('panel-content');
  const relevantTenders = await SellerService.getRelevantTenders();
  const serviceDeals = await SellerService.getServiceOpportunities();

  const itemsPerPage = 10;
  let displayItems = [];
  let totalPages = 1;
  let currentPage = 1;

  if (currentInboxTab === 'direct') {
      const rfqs = currentSummary.rfqs || [];
      totalPages = Math.ceil(rfqs.length / itemsPerPage) || 1;
      currentPage = currentDirectPage;
      const start = (currentPage - 1) * itemsPerPage;
      displayItems = rfqs.slice(start, start + itemsPerPage);
  } else if (currentInboxTab === 'tenders') {
      totalPages = Math.ceil(relevantTenders.length / itemsPerPage) || 1;
      currentPage = currentTenderPage;
      const start = (currentPage - 1) * itemsPerPage;
      displayItems = relevantTenders.slice(start, start + itemsPerPage);
  } else if (currentInboxTab === 'radar') {
      totalPages = Math.ceil(serviceDeals.length / itemsPerPage) || 1;
      currentPage = currentRadarPage;
      const start = (currentPage - 1) * itemsPerPage;
      displayItems = serviceDeals.slice(start, start + itemsPerPage);
  }

  let paginationHTML = '';
  if (totalPages > 1) {
      paginationHTML = '<div style="display: flex; justify-content: center; gap: 8px; margin-top: 1.5rem;">';
      for (let i = 1; i <= totalPages; i++) {
          paginationHTML += `<button class="btn ${i === currentPage ? 'btn-primary' : 'btn-outline'}" style="padding: 5px 12px;" onclick="window.changeInboxPage(${i})">${i}</button>`;
      }
      paginationHTML += '</div>';
  }

  // 🌟 اسامی دقیق تب‌ها و نمایش دائمی رادار
  const tabButtonsHtml = `
    <div style="display: flex; gap: 10px; margin-bottom: 1.5rem; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px;">
        <button class="btn ${currentInboxTab === 'direct' ? 'btn-primary' : 'btn-outline'}" style="border: none; box-shadow: none;" onclick="window.switchInboxTab('direct')">استعلام‌ها</button>
        <button class="btn ${currentInboxTab === 'tenders' ? 'btn-primary' : 'btn-outline'}" style="border: none; box-shadow: none;" onclick="window.switchInboxTab('tenders')">مناقصات</button>
        <button class="btn ${currentInboxTab === 'radar' ? 'btn-primary' : 'btn-outline'}" style="border: none; box-shadow: none;" onclick="window.switchInboxTab('radar')">رادار معاملات و خدمات</button>
    </div>
  `;

  let tableHtml = '';
  if (currentInboxTab === 'direct') {
      tableHtml = `
        <div class="panel-table-container">
          <table class="panel-table">
            <thead>
              <tr>
                <th>درخواست‌دهنده</th>
                <th>مورد درخواست</th>
                <th>تاریخ</th>
                <th style="white-space: nowrap; width: 140px;">وضعیت</th>
                <th>عملیات</th>
              </tr>
            </thead>
            <tbody>
              ${displayItems.length > 0 ? displayItems.map(rfq => `
                <tr>
                  <td style="color: var(--color-primary); font-weight: 600;">${rfq.buyerName}</td>
                  <td>${rfq.productName}</td>
                  <td style="color: var(--color-text-muted);">${rfq.date}</td>
                  <td style="white-space: nowrap;">
                    <span class="status-badge status-${rfq.status}" style="display: inline-block; white-space: nowrap;">
                      ${rfq.status === 'pending' ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-left: 4px;"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg> نیاز به پاسخ' : (rfq.status === 'in_negotiation' ? 'در حال مذاکره' : 'پاسخ داده شده')}
                    </span>
                  </td>
                  <td>
                    <button class="btn btn-primary" style="padding: 4px 12px; font-size: 0.8rem;" onclick="window.openReplyModal('${rfq.id}')">
                      ${rfq.status === 'pending' ? 'خواندن و پاسخ' : 'مشاهده پرونده'}
                    </button>
                  </td>
                </tr>
              `).join('') : '<tr><td colspan="5" style="text-align:center; padding: 2rem; color: #64748b;">استعلام یا پیام جدیدی در این بخش وجود ندارد.</td></tr>'}
            </tbody>
          </table>
        </div>
      `;
  } else if (currentInboxTab === 'tenders') {
      tableHtml = `
        <div class="panel-table-container">
          <table class="panel-table">
            <thead>
              <tr>
                <th>درخواست‌دهنده</th>
                <th>عنوان مناقصه / پروژه</th>
                <th>مقیاس / مقدار</th>
                <th>تاریخ ثبت</th>
                <th style="white-space: nowrap; width: 140px;">وضعیت شما</th>
                <th>عملیات</th>
              </tr>
            </thead>
            <tbody>
              ${displayItems.length > 0 ? displayItems.map(t => {
                const hasProposed = t.proposals && t.proposals.some(p => p.supplierId === currentProfile.id);
                return `
                <tr>
                  <td style="color: var(--color-primary); font-weight: 600;">${t.buyerName}</td>
                  <td style="font-weight:bold;">${t.title}</td>
                  <td>${t.quantity}</td>
                  <td style="color: var(--color-text-muted);">${t.date}</td>
                  <td style="white-space: nowrap;">
                    ${hasProposed ? 
                        `<span class="status-badge" style="background: #d1fae5; color: #059669; display: inline-block; white-space: nowrap;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-left: 4px;"><polyline points="20 6 9 17 4 12"></polyline></svg> ارسال شده</span>` : 
                        `<span class="status-badge" style="background: #fef3c7; color: #d97706; display: inline-block; white-space: nowrap;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-left: 4px;"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg> در انتظار اقدام</span>`
                    }
                  </td>
                  <td>
                    ${hasProposed ? 
                        `<button class="btn btn-outline" style="padding: 4px 12px; font-size: 0.8rem;" onclick='window.openViewMyProposalModal(${JSON.stringify(t).replace(/"/g, '&quot;')})'>مشاهده پیشنهاد من</button>` : 
                        `<button class="btn btn-primary" style="padding: 4px 12px; font-size: 0.8rem; background-color: #10b981; border-color: #10b981;" onclick="window.openSubmitProposalModal(${JSON.stringify(t).replace(/"/g, '&quot;')})">ارسال پیشنهاد / اعلام آمادگی</button>`
                    }
                  </td>
                </tr>
              `}).join('') : '<tr><td colspan="6" style="text-align:center; padding: 2rem; color: #64748b;">مناقصه جدیدی برای نمایش وجود ندارد.</td></tr>'}
            </tbody>
          </table>
        </div>
      `;
  } else {
      // 🌟 Radar Tab: تمامی محدودیت‌ها پاک شد و فروشنده کاملاً مخفی شد
      tableHtml = `
        <div class="panel-table-container">
          <table class="panel-table">
            <thead>
              <tr>
                <th>مشتری (خریدار)</th>
                <th>موضوع معامله (کالا/پروژه)</th>
                <th>حجم / مقیاس</th>
                <th style="white-space: nowrap; width: 140px;">وضعیت شما</th>
                <th>عملیات خدمات</th>
              </tr>
            </thead>
            <tbody>
              ${displayItems.length > 0 ? displayItems.map(deal => {
                const hasPitched = deal.pitches && deal.pitches.some(p => p.supplierId === currentProfile.id);
                return `
                <tr>
                  <td style="font-weight:600; color:var(--color-primary);">${deal.buyerName}</td>
                  <td style="font-weight:bold;">${deal.title}</td>
                  <td>${deal.quantity || 'توافقی'}</td>
                  <td style="white-space: nowrap;">
                    ${hasPitched ? 
                        `<span class="status-badge" style="background: #d1fae5; color: #059669; display: inline-block; white-space: nowrap;">پیشنهاد ارسال شد</span>` : 
                        `<span class="status-badge" style="background: #fef3c7; color: #d97706; display: inline-block; white-space: nowrap;">فرصت جدید</span>`
                    }
                  </td>
                  <td>
                    ${hasPitched ? 
                        `<button class="btn btn-outline" style="padding: 4px 12px; font-size: 0.8rem;" onclick="window.viewMyPitch('${deal.id}')">مشاهده پیشنهاد من</button>` : 
                        `<button class="btn btn-primary" style="padding: 4px 12px; font-size: 0.8rem; background-color: #8b5cf6; border-color: #8b5cf6;" onclick="window.openPitchModal('${deal.id}')">ارسال پیشنهاد (Pitch)</button>`
                    }
                  </td>
                </tr>
              `}).join('') : '<tr><td colspan="5" style="text-align:center; padding: 2rem; color: #64748b;">فرصتی برای خدمات/معاملات در جریان یافت نشد.</td></tr>'}
            </tbody>
          </table>
        </div>
      `;
  }

  content.innerHTML = `
    <h2 style="font-size: 1.5rem; margin-bottom: 1.5rem;"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: bottom; margin-left: 8px;"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"></polyline><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"></path></svg> صندوق پیام‌ها (Leads)</h2>
    ${tabButtonsHtml}
    ${tableHtml}
    ${paginationHTML}
  `;
};

window.openReplyModal = (rfqId) => {
  const rfq = currentSummary.rfqs.find(r => r.id === rfqId);
  if (!rfq) return;
  const isReplied = rfq.status === 'replied' || rfq.status === 'in_negotiation';
  const isNegotiating = rfq.status === 'in_negotiation';

  const modalHtml = `
    <div id="reply-modal" class="modal-overlay">
      <div class="modal-content">
        <div class="modal-header">
          <h3>استعلام از: ${rfq.buyerName}</h3>
          <button class="btn-close" onclick="document.getElementById('reply-modal').remove()"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button>
        </div>
        <div class="modal-body">
          ${isNegotiating ? '<div style="background:#e0e7ff; color:#4338ca; padding:10px; text-align:center; border-radius:8px; margin-bottom:15px; font-size:0.9rem; font-weight:bold;">شما و خریدار در مرحله مذاکره هستید</div>' : ''}
          
          <div style="background: #f8fafc; padding: 1rem; border-radius: var(--radius-md); margin-bottom: 1rem; border: 1px solid var(--color-border);">
            <span style="font-size: 0.8rem; color: var(--color-text-muted);">پیام درخواست‌دهنده (${rfq.date}):</span>
            <p style="margin-top: 0.5rem; line-height: 1.6;">${rfq.message}</p>
          </div>
          ${isReplied ? `
            <div style="background: #eff6ff; padding: 1rem; border-radius: var(--radius-md); border: 1px solid #bfdbfe;">
              <span style="font-size: 0.8rem; color: var(--color-primary);">پاسخ شما (${rfq.replyDate}):</span>
              <p style="margin-top: 0.5rem; line-height: 1.6; color: var(--color-text-main);">${rfq.reply}</p>
            </div>
            ${isNegotiating ? `
              <div style="margin-top: 1.5rem; border-top: 1px dashed var(--color-border); padding-top: 1rem;">
                <button class="btn btn-primary btn-full" onclick="document.getElementById('reply-modal').remove(); document.querySelector('[data-tab=\\'messages\\']').click();">ورود به چت روم مذاکره</button>
              </div>
            ` : ''}
          ` : `
            <label style="font-size: 0.9rem; font-weight: 600; display: block; margin-bottom: 0.5rem;">پاسخ شما و ارسال پیش‌فاکتور (قیمت پیشنهادی):</label>
            <textarea id="reply-message" rows="4" class="form-input"></textarea>
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
  if (!msg.trim()) return;
  event.target.textContent = 'در حال ارسال...';
  event.target.disabled = true;
  await SellerService.replyToRfq(rfqId, msg);
  document.getElementById('reply-modal').remove();
  currentSummary = await SellerService.getDashboardSummary();
  loadInboxTab();
};

window.openSubmitProposalModal = (tender) => {
    const modalHtml = `
      <div id="proposal-modal" class="modal-overlay">
        <div class="modal-content">
          <div class="modal-header">
            <h3>اعلام آمادگی برای: ${tender.title}</h3>
            <button class="btn-close" onclick="document.getElementById('proposal-modal').remove()"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button>
          </div>
          <div class="modal-body">
            <div id="prop-form-content">
                <div style="background: #f8fafc; padding: 1rem; border-radius: 8px; margin-bottom: 15px; font-size: 0.9rem; line-height: 1.6; border: 1px solid var(--color-border);">
                    <strong>مقیاس درخواست:</strong> ${tender.quantity} <br>
                    <strong>توضیحات کارفرما:</strong> ${tender.description || 'ندارد'}
                </div>
                <label style="font-weight: 600; display:block; margin-bottom:5px;">مبلغ پیشنهادی / برآورد شما *</label>
                <input type="text" id="prop-price" class="form-input" style="margin-bottom: 15px;">
                <label style="font-weight: 600; display:block; margin-bottom:5px;">شرح پروپوزال و شرایط اجرا</label>
                <textarea id="prop-msg" class="form-input" rows="4"></textarea>
                <button class="btn btn-primary btn-full" style="margin-top: 1.5rem; background:#10b981; border-color:#10b981;" onclick="submitProposalFunc('${tender.id}', event)">ارسال پیشنهاد به کارفرما</button>
            </div>
          </div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
};

window.submitProposalFunc = async (tenderId, event) => {
    const price = document.getElementById('prop-price').value;
    const msg = document.getElementById('prop-msg').value;
    if(!price) return;
    
    event.target.textContent = 'در حال ارسال...';
    event.target.disabled = true;

    await SellerService.submitProposal(tenderId, msg, price);
    currentSummary = await SellerService.getDashboardSummary(); 
    updateSidebarBadges();
    
    const modalBody = document.querySelector('#proposal-modal .modal-body');
    modalBody.innerHTML = `
        <div style="background: #ecfdf5; padding: 2.5rem 1rem; border-radius: 8px; border: 1px dashed #10b981; text-align: center;">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom: 1rem;"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
            <h3 style="color: #059669; margin-bottom: 0.5rem;">پیشنهاد با موفقیت ارسال شد!</h3>
            <p style="color: #047857; font-size: 0.9rem; margin-bottom: 1.5rem;">پروپوزال شما برای کارفرما ارسال گردید. می‌توانید وضعیت آن را از جدول پیگیری کنید.</p>
            <button class="btn btn-primary" onclick="document.getElementById('proposal-modal').remove(); loadInboxTab();">متوجه شدم</button>
        </div>
    `;
};

window.openViewMyProposalModal = (tender) => {
    const myProp = tender.proposals.find(p => p.supplierId === currentProfile.id);
    if(!myProp) return;

    const isNegotiating = tender.status === 'in_negotiation';
    const modalHtml = `
      <div id="view-prop-modal" class="modal-overlay">
        <div class="modal-content">
          <div class="modal-header">
            <h3>پیشنهاد ارسال‌شده برای: ${tender.title}</h3>
            <button class="btn-close" onclick="document.getElementById('view-prop-modal').remove()"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button>
          </div>
          <div class="modal-body">
            ${isNegotiating ? '<div style="background:#e0e7ff; color:#4338ca; padding:10px; text-align:center; border-radius:8px; margin-bottom:15px; font-size:0.9rem; font-weight:bold;">این مناقصه در مرحله مذاکره قرار دارد</div>' : ''}
            <div style="background: #f8fafc; padding: 1rem; border-radius: 8px; margin-bottom: 15px; font-size: 0.9rem; line-height: 1.6; border: 1px solid var(--color-border);">
                <strong style="color: var(--color-text-muted);">جزئیات درخواست کارفرما:</strong><br>
                <span style="display:inline-block; margin-top:5px;">مقیاس: ${tender.quantity}</span> <br>
                <span>توضیحات: ${tender.description || 'ندارد'}</span>
            </div>
            <div style="background: #eff6ff; padding: 1.5rem; border-radius: 8px; border: 1px solid #bfdbfe;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 15px;">
                    <h4 style="color: var(--color-primary); margin:0;">پروپوزال شما</h4>
                    <span style="font-size: 0.8rem; color: #60a5fa;">${myProp.date}</span>
                </div>
                <div style="background: white; padding: 8px 12px; border-radius: 4px; display:inline-block; font-weight:bold; color:#10b981; border: 1px solid #a7f3d0; margin-bottom: 15px;">
                    مبلغ پیشنهادی: ${myProp.price}
                </div>
                <p style="color: var(--color-text-main); line-height: 1.6; font-size: 0.95rem; margin:0;">${myProp.message || '<span style="color:gray;">بدون شرح تکمیلی</span>'}</p>
            </div>
            ${isNegotiating ? `
              <div style="margin-top: 1.5rem; border-top: 1px dashed var(--color-border); padding-top: 1rem;">
                <button class="btn btn-primary btn-full" onclick="document.getElementById('view-prop-modal').remove(); document.querySelector('[data-tab=\\'messages\\']').click();">ورود به چت روم مذاکره</button>
              </div>
            ` : ''}
          </div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
};

window.viewMyPitch = async (dealId) => {
    const deals = AppStore.getAllDeals();
    const deal = deals.find(d => d.id === dealId);
    if(!deal) return;
    
    const myPitch = deal.pitches.find(p => p.supplierId === currentProfile.id);
    if(!myPitch) return;

    const modalHtml = `
      <div id="view-pitch-modal" class="modal-overlay">
        <div class="modal-content">
          <div class="modal-header">
            <h3>پیشنهاد خدمات ارسال شده برای معامله</h3>
            <button class="btn-close" onclick="document.getElementById('view-pitch-modal').remove()"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button>
          </div>
          <div class="modal-body">
            <div style="background: #f8fafc; padding: 1rem; border-radius: 8px; margin-bottom: 15px; font-size: 0.9rem; line-height: 1.6; border: 1px solid var(--color-border);">
                <strong style="color: var(--color-text-muted);">جزئیات معامله:</strong><br>
                <span>موضوع: ${deal.title}</span> <br>
                <span>حجم/مقیاس: ${deal.quantity || 'توافقی'}</span>
            </div>
            
            <div style="background: #eff6ff; padding: 1.5rem; border-radius: 8px; border: 1px solid #bfdbfe;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 15px;">
                    <h4 style="color: var(--color-primary); margin:0;">پروپوزال شما (${myPitch.type})</h4>
                    <span style="font-size: 0.8rem; color: #60a5fa;">${myPitch.date}</span>
                </div>
                <p style="color: var(--color-text-main); line-height: 1.6; font-size: 0.95rem; margin:0;">${myPitch.message || '<span style="color:gray;">بدون شرح تکمیلی</span>'}</p>
            </div>
          </div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
};

window.openPitchModal = (dealId) => {
    const modalHtml = `
      <div id="pitch-modal" class="modal-overlay">
        <div class="modal-content">
          <div class="modal-header">
            <h3>ارسال پیشنهاد خدمات (Pitch)</h3>
            <button class="btn-close" onclick="document.getElementById('pitch-modal').remove()"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button>
          </div>
          <div class="modal-body">
            <input type="hidden" id="pitch-deal-id" value="${dealId}">
            <div style="background: #fdf4ff; padding: 1rem; border-radius: 8px; margin-bottom: 15px; border: 1px dashed #d946ef;">
                <strong style="color: #a21caf; font-size: 0.9rem;">نکته:</strong> <span style="font-size: 0.85rem; color: #475569;">پیام شما با نشان ویژه "خدمات جانبی" مستقیماً برای طرفین معامله ارسال خواهد شد.</span>
            </div>
            <label style="font-weight: 600; display:block; margin-bottom:5px;">نوع خدمات پیشنهادی شما</label>
            <select id="pitch-type" class="form-input" style="margin-bottom: 15px;">
                <option>حمل و نقل / لجستیک</option>
                <option>بیمه باربری / مسئولیت</option>
                <option>ترخیص گمرکی</option>
                <option>بازرسی کیفیت (PSI)</option>
                <option>خدمات حقوقی قرارداد</option>
            </select>
            <label style="font-weight: 600; display:block; margin-bottom:5px;">متن پروپوزال و تعرفه حدودی</label>
            <textarea id="pitch-msg" class="form-input" rows="4"></textarea>
            <button class="btn btn-primary btn-full" style="margin-top: 1.5rem; background:#8b5cf6; border-color:#8b5cf6;" onclick="submitPitchFunc(event)">ارسال به میز مذاکره</button>
          </div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
};

window.submitPitchFunc = async (event) => {
    const msg = document.getElementById('pitch-msg').value;
    const type = document.getElementById('pitch-type').value;
    const dealId = document.getElementById('pitch-deal-id').value;
    if(!msg) return;
    
    event.target.textContent = 'در حال ارسال...';
    event.target.disabled = true;

    await SellerService.submitServicePitch(dealId, type, msg);
    
    currentSummary = await SellerService.getDashboardSummary(); 
    updateSidebarBadges(); 

    const modalBody = document.querySelector('#pitch-modal .modal-body');
    modalBody.innerHTML = `
        <div style="background: #f5f3ff; padding: 2.5rem 1rem; border-radius: 8px; border: 1px dashed #8b5cf6; text-align: center;">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom: 1rem;"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
            <h3 style="color: #6d28d9; margin-bottom: 0.5rem;">پروپوزال خدمات با موفقیت ارسال شد!</h3>
            <p style="color: #4c1d95; font-size: 0.9rem; margin-bottom: 1.5rem;">طرفین معامله پیشنهاد شما را بررسی کرده و در صورت نیاز با شما تماس خواهند گرفت.</p>
            <button class="btn btn-primary" style="background:#8b5cf6; border-color:#8b5cf6;" onclick="document.getElementById('pitch-modal').remove(); loadInboxTab();">بازگشت</button>
        </div>
    `;
};

window.changeProductPage = (page) => {
  currentProductPage = page;
  loadProductsTab();
};

async function loadProductsTab() {
  const content = document.getElementById('panel-content');
  content.innerHTML = '<div style="text-align: center; padding: 3rem;">در حال دریافت اطلاعات...</div>';
  const myProducts = await ProductService.getProductsBySupplierId(currentProfile.id);

  const itemsPerPage = 10;
  const totalPages = Math.ceil(myProducts.length / itemsPerPage);
  const start = (currentProductPage - 1) * itemsPerPage;
  const paginatedProducts = myProducts.slice(start, start + itemsPerPage);

  let paginationHTML = '';
  if (totalPages > 1) {
    paginationHTML = '<div style="display: flex; justify-content: center; gap: 8px; margin-top: 1.5rem;">';
    for (let i = 1; i <= totalPages; i++) {
      paginationHTML += `<button class="btn ${i === currentProductPage ? 'btn-primary' : 'btn-outline'}" style="padding: 5px 12px;" onclick="window.changeProductPage(${i})">${i}</button>`;
    }
    paginationHTML += '</div>';
  }

  content.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
      <h2 style="font-size: 1.5rem;"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: bottom; margin-left: 8px;"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg> مدیریت کالا و خدمات (${myProducts.length})</h2>
      <button class="btn btn-primary" onclick="window.loadItemTypeSelection()" style="display: inline-flex; align-items: center; justify-content: center; gap: 6px;"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg> ثبت آیتم جدید</button>
    </div>
    <div class="panel-table-container">
      <table class="panel-table">
        <thead>
          <tr>
            <th>نمایه</th>
            <th>عنوان آیتم</th>
            <th>نوع</th>
            <th>دسته‌بندی</th>
            <th>عملیات</th>
          </tr>
        </thead>
        <tbody>
          ${paginatedProducts.length > 0 ? paginatedProducts.map(p => `
            <tr>
              <td><img src="${p.image}" style="width: 40px; height: 40px; border-radius: 4px; object-fit: cover;"></td>
              <td style="font-weight: 600;">${p.name}</td>
              <td><span style="background: #f1f5f9; padding: 2px 8px; border-radius: 12px; font-size: 0.8rem; color: #475569;">${p.itemType === 'service' ? 'خدمات' : 'کالا'}</span></td>
              <td style="color: var(--color-text-muted);">${p.categoryName || 'دسته‌بندی'}</td>
              <td>
                <button class="btn btn-outline" style="padding: 4px 8px; font-size: 0.8rem; display: inline-flex; align-items: center; justify-content: center; gap: 4px;" onclick="window.editProductFunc('${p.id}')"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg> ویرایش</button>
                <button class="btn btn-outline" style="padding: 4px 8px; font-size: 0.8rem; color: #ef4444; border-color: #ef4444; margin-right: 5px; display: inline-flex; align-items: center; justify-content: center; gap: 4px;" onclick="window.deleteProductFunc('${p.id}')"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg> حذف</button>
              </td>
            </tr>
          `).join('') : '<tr><td colspan="5" style="text-align:center;">محصولی برای نمایش وجود ندارد</td></tr>'}
        </tbody>
      </table>
    </div>
    ${paginationHTML}
  `;
}

// 🌟 توابع جدید حذف و ویرایش سریع 🌟
window.deleteProductFunc = async (productId) => {
    if(confirm('آیا از حذف دائم این آیتم اطمینان دارید؟')) {
        await ProductService.deleteProduct(productId);
        loadProductsTab();
    }
};

window.editProductFunc = async (productId) => {
    const prod = await ProductService.getProductById(productId);
    if (!prod) return;
    
    // باز کردن فرم ثبت آیتم جدید با تغییرات ظاهری (برای ویرایش)
    window.loadAddItemForm(prod.itemType || 'goods');
    
    // استفاده از تایم اوت برای اطمینان از رندر شدن DOM
    setTimeout(() => {
        const headerTitle = document.querySelector('#panel-content h2');
        if (headerTitle) headerTitle.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: bottom; margin-left: 8px;"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg> ویرایش: ${prod.name}`;
        
        const inputsStep1 = document.querySelectorAll('#prod-step-1 .form-input');
        if(inputsStep1.length > 0) inputsStep1[0].value = prod.name;
        
        const inputsStep2 = document.querySelectorAll('#prod-step-2 .form-input');
        if(inputsStep2.length > 0) inputsStep2[0].value = prod.shortDescription || '';
        
        // تغییر دکمه ذخیره در تب آخر (مرحله ۵)
        const saveBtnGroup = document.querySelector('#prod-step-5 .btn-primary').parentElement;
        if (saveBtnGroup) {
            saveBtnGroup.innerHTML = `
                <button class="btn btn-outline" style="display: inline-flex; align-items: center; gap: 6px;" onclick="loadProductsTab()">لغو ویرایش</button>
                <button class="btn btn-primary" style="background:#10b981; border-color:#10b981; display: inline-flex; align-items: center; gap: 6px;" onclick="window.saveEditedProduct('${prod.id}')"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg> ثبت تغییرات</button>
            `;
        }
    }, 50);
};

window.saveEditedProduct = async (productId) => {
    const inputsStep1 = document.querySelectorAll('#prod-step-1 .form-input');
    const inputsStep2 = document.querySelectorAll('#prod-step-2 .form-input');
    
    const newName = inputsStep1.length > 0 ? inputsStep1[0].value : '';
    const newShortDesc = inputsStep2.length > 0 ? inputsStep2[0].value : '';
    
    if (!newName) {
        alert('لطفاً عنوان را وارد کنید.');
        return;
    }

    const btn = event.target.closest('button');
    const origText = btn.innerHTML;
    btn.textContent = 'در حال ذخیره...';
    btn.disabled = true;

    await ProductService.updateProductMinimal(productId, { name: newName, shortDescription: newShortDesc });
    
    alert('تغییرات محصول با موفقیت ذخیره شد.');
    loadProductsTab();
};

// 🌟 اضافه کردن این خط برای دسترسی دکمه‌های بازگشت به تابع لود محصولات 🌟
window.loadProductsTab = loadProductsTab;

window.loadItemTypeSelection = () => {
    const canAddItem = AppStore.checkFeatureAccess('add_item');
    if (!canAddItem) {
        window.showUpgradePaywall('ثبت نامحدود محصول/خدمات');
        return;
    }

    const content = document.getElementById('panel-content');
    content.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
            <h2 style="font-size: 1.5rem;">انتخاب نوع آیتم</h2>
            <!-- 🌟 اصلاح دکمه بازگشت در اینجا 🌟 -->
            <button class="btn btn-outline" onclick="window.loadProductsTab()">انصراف و بازگشت</button>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; max-width: 800px; margin: 0 auto; padding-top: 2rem;">
            
            <div style="background: white; border: 2px solid var(--color-border); border-radius: 16px; padding: 3rem 2rem; text-align: center; cursor: pointer; transition: 0.3s;" onmouseover="this.style.borderColor='var(--color-primary)'; this.style.transform='translateY(-5px)';" onmouseout="this.style.borderColor='var(--color-border)'; this.style.transform='translateY(0)';" onclick="window.loadAddItemForm('goods')">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom: 1rem;"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
                <h3 style="font-size: 1.3rem; margin-bottom: 10px; color: var(--color-text-main);">ثبت کالای فیزیکی</h3>
                <p style="color: var(--color-text-muted); font-size: 0.9rem;">قطعات، مواد اولیه، تجهیزات، ماشین‌آلات و هر نوع محصول قابل ارسال</p>
            </div>
            
            <div style="background: white; border: 2px solid var(--color-border); border-radius: 16px; padding: 3rem 2rem; text-align: center; cursor: pointer; transition: 0.3s;" onmouseover="this.style.borderColor='var(--color-secondary)'; this.style.transform='translateY(-5px)';" onmouseout="this.style.borderColor='var(--color-border)'; this.style.transform='translateY(0)';" onclick="window.loadAddItemForm('service')">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--color-secondary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom: 1rem;"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                <h3 style="font-size: 1.3rem; margin-bottom: 10px; color: var(--color-text-main);">ثبت خدمات تجاری / پروژه‌ای</h3>
                <p style="color: var(--color-text-muted); font-size: 0.9rem;">لجستیک، بیمه، ترخیص گمرکی، پیمانکاری، طراحی و اجرای پروژه‌ها</p>
            </div>

        </div>
    `;
};

window.currentProdStep = 1;

window.showProdStep = (step) => {
  document.querySelectorAll('.prod-step-content').forEach(el => el.style.display = 'none');
  const targetEl = document.getElementById(`prod-step-${step}`);
  if (targetEl) targetEl.style.display = 'block';

  document.querySelectorAll('.step-indicator').forEach((el, index) => {
    if(!el.classList.contains('prod-step-indicator')) return;
    if (index + 1 < step) {
      el.className = 'step-indicator prod-step-indicator step-completed';
      el.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-left: 4px;"><polyline points="20 6 9 17 4 12"></polyline></svg> ${el.dataset.title}`;
    } else if (index + 1 === step) {
      el.className = 'step-indicator prod-step-indicator step-active';
      el.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-left: 4px;"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg> ${el.dataset.title}`;
    } else {
      el.className = 'step-indicator prod-step-indicator step-pending';
      el.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-left: 4px;"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 15 15"></polyline></svg> ${el.dataset.title}`;
    }
  });
  window.currentProdStep = step;
};

window.nextProdStep = () => { if(window.currentProdStep < 5) window.showProdStep(window.currentProdStep + 1); };
window.prevProdStep = () => { if(window.currentProdStep > 1) window.showProdStep(window.currentProdStep - 1); };

window.addTechSpecRow = () => {
  const container = document.getElementById('tech-specs-container');
  const row = document.createElement('div');
  row.style = "display: flex; gap: 10px; margin-bottom: 10px;";
  row.innerHTML = `
    <input type="text" class="form-input" style="flex:1;">
    <input type="text" class="form-input" style="flex:2;">
    <button class="btn btn-outline" style="color:#ef4444; border-color:#ef4444; padding:0 15px; display: inline-flex; align-items: center; justify-content: center;" onclick="this.parentElement.remove()"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button>
  `;
  container.appendChild(row);
};
// ==========================================
// 🌟 سیستم پیشرفته ثبت کالا و خدمات (Wizard)
// ==========================================

window.currentProdStep = 1;
window.currentAddingItemType = 'goods';

window.loadAddItemForm = (type) => {
  window.currentAddingItemType = type;
  const isService = type === 'service';
  const content = document.getElementById('panel-content');
  
  content.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
      <h2 style="font-size: 1.5rem;"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: bottom; margin-left: 8px;"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg> ${isService ? 'ثبت خدمات B2B جدید' : 'ثبت کالای صنعتی جدید'}</h2>
      <button class="btn btn-outline" onclick="window.loadProductsTab()" style="display: inline-flex; align-items: center; gap: 6px;"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg> انصراف و بازگشت</button>
    </div>
    
    <div style="display: flex; justify-content: space-between; margin-bottom: 2rem; background: white; padding: 10px; border-radius: 8px; border: 1px solid var(--color-border);">
      <div class="step-indicator prod-step-indicator" style="flex: 1; text-align: center; padding: 12px 10px; font-weight: 600; font-size: 0.95rem; color: #94a3b8; cursor: pointer; transition: 0.3s;" data-title="پایه">پایه</div>
      <div class="step-indicator prod-step-indicator" style="flex: 1; text-align: center; padding: 12px 10px; font-weight: 600; font-size: 0.95rem; color: #94a3b8; cursor: pointer; transition: 0.3s;" data-title="معرفی و مدیا">معرفی و مدیا</div>
      <div class="step-indicator prod-step-indicator" style="flex: 1; text-align: center; padding: 12px 10px; font-weight: 600; font-size: 0.95rem; color: #94a3b8; cursor: pointer; transition: 0.3s;" data-title="${isService ? 'ویژگی‌های سرویس' : 'مشخصات فنی'}">${isService ? 'ویژگی‌های سرویس' : 'مشخصات فنی'}</div>
      <div class="step-indicator prod-step-indicator" style="flex: 1; text-align: center; padding: 12px 10px; font-weight: 600; font-size: 0.95rem; color: #94a3b8; cursor: pointer; transition: 0.3s;" data-title="مجوزها">مجوزها</div>
      <div class="step-indicator prod-step-indicator" style="flex: 1; text-align: center; padding: 12px 10px; font-weight: 600; font-size: 0.95rem; color: #94a3b8; cursor: pointer; transition: 0.3s;" data-title="تجاری و مالی">تجاری و مالی</div>
    </div>

    <div style="background: white; padding: 2rem; border-radius: 12px; border: 1px solid var(--color-border); box-shadow: 0 4px 6px rgba(0,0,0,0.02);">
      
      <!-- STEP 1: Base Info -->
      <div id="prod-step-1" class="prod-step-content" style="display: none;">
        <h3 style="margin-bottom: 1.5rem; color: var(--color-primary);">۱. اطلاعات پایه ${isService ? 'خدمات' : 'محصول'}</h3>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem;">
          <div><label style="font-weight: 600; display:block; margin-bottom:5px;">نام ${isService ? 'خدمات' : 'محصول'} (فارسی) *</label><input type="text" id="item-name" class="form-input" placeholder="مثال: موتور الکتریکی سه فاز..."></div>
          <div><label style="font-weight: 600; display:block; margin-bottom:5px;">نام انگلیسی (English Name)</label><input type="text" id="item-en-name" class="form-input" dir="ltr" placeholder="3-Phase Electric Motor..."></div>
          <div><label style="font-weight: 600; display:block; margin-bottom:5px;">دسته‌بندی اصلی *</label>
            <select id="item-category" class="form-input">
              <option value="">انتخاب کنید...</option>
              <option value="cat_machinery">ماشین‌آلات و تجهیزات</option>
              <option value="cat_materials">مواد اولیه و شیمیایی</option>
              <option value="cat_electrical">برق و الکترونیک</option>
              <option value="cat_logistics">خدمات لجستیک و حمل</option>
            </select>
          </div>
          <div><label style="font-weight: 600; display:block; margin-bottom:5px;">زیردسته</label><input type="text" id="item-subcategory" class="form-input" placeholder="مثال: الکتروموتورها"></div>
          
          ${isService ? `
            <div><label style="font-weight: 600; display:block; margin-bottom:5px;">محدوده جغرافیایی ارائه خدمت</label><input type="text" id="item-geo" class="form-input" placeholder="ایران، خاورمیانه، جهانی..."></div>
            <div><label style="font-weight: 600; display:block; margin-bottom:5px;">نوع ارائه خدمت</label>
                <select id="item-service-type" class="form-input">
                    <option value="remote">آنلاین / ریموت</option>
                    <option value="onsite">حضوری در سایت مشتری</option>
                    <option value="hybrid">ترکیبی</option>
                </select>
            </div>
            <div style="grid-column: 1 / -1;"><label style="font-weight: 600; display:block; margin-bottom:5px;">صنایع قابل ارائه خدمت (با کاما جدا کنید)</label><input type="text" id="item-industries" class="form-input" placeholder="نفت و گاز، پتروشیمی، فولاد..."></div>
          ` : `
            <div><label style="font-weight: 600; display:block; margin-bottom:5px;">برند</label><input type="text" id="item-brand" class="form-input" placeholder="نام برند تجاری"></div>
            <div><label style="font-weight: 600; display:block; margin-bottom:5px;">مدل / شماره فنی (Part Number)</label><input type="text" id="item-model" class="form-input" dir="ltr"></div>
            <div><label style="font-weight: 600; display:block; margin-bottom:5px;">کد محصول / SKU</label><input type="text" id="item-sku" class="form-input" dir="ltr"></div>
            <div><label style="font-weight: 600; display:block; margin-bottom:5px;">کشور سازنده (Origin)</label><input type="text" id="item-origin" class="form-input" placeholder="ایران، چین، آلمان..."></div>
            <div style="grid-column: 1 / -1;"><label style="font-weight: 600; display:block; margin-bottom:5px;">وضعیت تأمین/تولید محصول</label>
                <select id="item-status" class="form-input">
                    <option value="current">تولید فعلی (موجود یا در خط تولید)</option>
                    <option value="custom">تولید سفارشی (ساخت پس از سفارش)</option>
                    <option value="import">وارداتی</option>
                    <option value="other">سایر موارد</option>
                </select>
            </div>
          `}
        </div>
        <div style="text-align: left; margin-top: 2rem;"><button class="btn btn-primary" style="padding: 10px 30px;" onclick="window.nextProdStep()">مرحله بعد ➔</button></div>
      </div>

      <!-- STEP 2: Media & Intro -->
      <div id="prod-step-2" class="prod-step-content" style="display: none;">
        <h3 style="margin-bottom: 1.5rem; color: var(--color-primary);">۲. معرفی، سئو و رسانه</h3>
        <div style="display: grid; grid-template-columns: 1fr; gap: 1.5rem;">
          <div><label style="font-weight: 600; display:block; margin-bottom:5px;">توضیح کوتاه (نمایش در کارت‌ها - مکس ۱۵۰ کاراکتر)</label><textarea id="item-short-desc" class="form-input" rows="2"></textarea></div>
          <div><label style="font-weight: 600; display:block; margin-bottom:5px;">توضیح کامل و جزئیات</label><textarea id="item-full-desc" class="form-input" rows="5"></textarea></div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem;">
              <div><label style="font-weight: 600; display:block; margin-bottom:5px;">مزیت‌های اصلی (با کاما جدا کنید)</label><input type="text" id="item-advantages" class="form-input" placeholder="گارانتی ۵ ساله, راندمان بالا..."></div>
              <div><label style="font-weight: 600; display:block; margin-bottom:5px;">کلمات کلیدی جستجو (سئو)</label><input type="text" id="item-keywords" class="form-input" placeholder="الکتروموتور, موتور سه فاز, ضد انفجار..."></div>
          </div>
          <div style="padding: 1.5rem; border: 1px dashed var(--color-border); border-radius: 8px; background: #f8fafc; margin-top: 10px;">
              <h4 style="margin-bottom: 15px; font-size: 1rem;">پیوست‌های رسانه‌ای</h4>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem;">
                  <div><label style="font-weight: 600; display:block; margin-bottom:5px;">تصاویر (اصلی و گالری)</label><button class="btn btn-outline" style="width: 100%;"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-left:5px; vertical-align:middle;"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg> انتخاب تصاویر (حداکثر ۵)</button></div>
                  <div><label style="font-weight: 600; display:block; margin-bottom:5px;">ویدئو معرفی (اختیاری)</label><button class="btn btn-outline" style="width: 100%;">آپلود ویدئو (MP4)</button></div>
                  <div style="grid-column: 1/-1;"><label style="font-weight: 600; display:block; margin-bottom:5px;">کاتالوگ / دیتاشیت فنی</label><button class="btn btn-outline" style="width: 100%; border-color: #8b5cf6; color: #8b5cf6;">آپلود فایل PDF</button></div>
              </div>
          </div>
        </div>
        <div style="display: flex; justify-content: space-between; margin-top: 2rem;">
          <button class="btn btn-outline" style="padding: 10px 30px;" onclick="window.prevProdStep()">➔ مرحله قبل</button>
          <button class="btn btn-primary" style="padding: 10px 30px;" onclick="window.nextProdStep()">مرحله بعد ➔</button>
        </div>
      </div>

      <!-- STEP 3: Technical Specifications -->
      <div id="prod-step-3" class="prod-step-content" style="display: none;">
        <h3 style="margin-bottom: 1.5rem; color: var(--color-primary);">۳. ${isService ? 'ویژگی‌های کلیدی سرویس' : 'مشخصات فنی تخصصی'}</h3>
        <p style="color: #64748b; font-size: 0.9rem; margin-bottom: 1.5rem;">وارد کردن مشخصات فنی دقیق، امکان مقایسه محصول شما با رقبا را برای خریداران فراهم می‌کند.</p>
        
        <div style="background: #f1f5f9; padding: 10px; border-radius: 8px; margin-bottom: 15px; display: grid; grid-template-columns: 2fr 2fr 1.5fr 80px; gap: 10px; font-weight: bold; font-size: 0.85rem; color: #475569;">
            <div>نام مشخصه / ویژگی</div>
            <div>مقدار</div>
            <div>واحد اندازه‌گیری</div>
            <div style="text-align:center;">عملیات</div>
        </div>

        <div id="tech-specs-container">
            <!-- ردیف‌های داینامیک اینجا اضافه می‌شوند -->
        </div>
        
        <div style="display: flex; gap: 10px; margin-top: 20px;">
            <button class="btn btn-outline" style="flex: 1; border-style: dashed; border-color: var(--color-primary); color: var(--color-primary);" onclick="window.addSpecRow('standard')">+ افزودن مشخصه استاندارد (پیش‌فرض سیستم)</button>
            <button class="btn btn-outline" style="flex: 1; border-style: dashed; border-color: #8b5cf6; color: #8b5cf6;" onclick="window.addSpecRow('custom')">+ افزودن مشخصه سفارشی (جدید)</button>
        </div>

        <div style="display: flex; justify-content: space-between; margin-top: 2.5rem; border-top: 1px solid var(--color-border); padding-top: 1.5rem;">
          <button class="btn btn-outline" style="padding: 10px 30px;" onclick="window.prevProdStep()">➔ مرحله قبل</button>
          <button class="btn btn-primary" style="padding: 10px 30px;" onclick="window.nextProdStep()">مرحله بعد ➔</button>
        </div>
      </div>

      <!-- STEP 4: Certifications -->
      <div id="prod-step-4" class="prod-step-content" style="display: none;">
        <h3 style="margin-bottom: 1.5rem; color: var(--color-primary);">۴. مجوزها و استانداردهای کیفی</h3>
        <p style="color: #64748b; font-size: 0.9rem; margin-bottom: 1.5rem;">گواهینامه‌های مرتبط با این آیتم را جهت اعتمادسازی بیشتر بارگذاری کنید.</p>
        
        <div id="certs-container">
           <!-- ردیف‌های مجوز داینامیک -->
        </div>

        <button class="btn btn-outline" style="margin-top: 10px; border-style: dashed; width: 100%; display: inline-flex; align-items: center; justify-content: center; gap: 6px;" onclick="window.addCertRow()">+ افزودن گواهینامه / استاندارد جدید</button>

        <div style="display: flex; justify-content: space-between; margin-top: 2.5rem; border-top: 1px solid var(--color-border); padding-top: 1.5rem;">
          <button class="btn btn-outline" style="padding: 10px 30px;" onclick="window.prevProdStep()">➔ مرحله قبل</button>
          <button class="btn btn-primary" style="padding: 10px 30px;" onclick="window.nextProdStep()">مرحله بعد ➔</button>
        </div>
      </div>

      <!-- STEP 5: Commercial & Financial -->
      <div id="prod-step-5" class="prod-step-content" style="display: none;">
        <h3 style="margin-bottom: 1.5rem; color: var(--color-primary);">۵. اطلاعات تجاری، شرایط مالی و ارسال</h3>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem;">
          
          ${isService ? `
            <div><label style="font-weight: 600; display:block; margin-bottom:5px;">مدل قیمت‌گذاری *</label>
                <select id="comm-price-type" class="form-input">
                    <option value="hourly">ساعتی</option>
                    <option value="daily">روزانه</option>
                    <option value="project">پروژه‌ای (مقطوع)</option>
                    <option value="negotiable">توافقی</option>
                    <option value="rfq">فقط بر اساس استعلام (RFQ)</option>
                </select>
            </div>
            <div><label style="font-weight: 600; display:block; margin-bottom:5px;">حداقل حجم سفارش / پروژه</label><input type="text" id="comm-moq" class="form-input" placeholder="مثال: حداقل ۱۰۰ ساعت یا ۱ هکتار"></div>
            <div><label style="font-weight: 600; display:block; margin-bottom:5px;">زمان اجرای معمول (Lead Time)</label><input type="text" id="comm-lead-time" class="form-input" placeholder="مثال: بین ۱ تا ۳ ماه"></div>
            <div><label style="font-weight: 600; display:block; margin-bottom:5px;">ظرفیت اجرای همزمان</label><input type="text" id="comm-capacity" class="form-input" placeholder="مثال: ۳ پروژه در ماه"></div>
          ` : `
            <div><label style="font-weight: 600; display:block; margin-bottom:5px;">نوع قیمت‌گذاری *</label>
                <select id="comm-price-type" class="form-input">
                    <option value="fixed">قیمت ثابت مشخص</option>
                    <option value="negotiable">قابل مذاکره</option>
                    <option value="rfq" selected>فقط بر اساس استعلام (RFQ)</option>
                </select>
            </div>
            <div><label style="font-weight: 600; display:block; margin-bottom:5px;">حداقل مقدار سفارش (MOQ)</label><input type="text" id="comm-moq" class="form-input" placeholder="مثال: ۱۰۰ کیلوگرم"></div>
            <div><label style="font-weight: 600; display:block; margin-bottom:5px;">واحد فروش / شمارش</label><input type="text" id="comm-sales-unit" class="form-input" placeholder="مثال: پالت، بشکه، عدد..."></div>
            <div><label style="font-weight: 600; display:block; margin-bottom:5px;">ظرفیت تأمین ماهانه</label><input type="text" id="comm-capacity" class="form-input" placeholder="مثال: ۵۰۰۰ تن"></div>
            <div><label style="font-weight: 600; display:block; margin-bottom:5px;">زمان آماده‌سازی / ارسال (Lead Time)</label><input type="text" id="comm-lead-time" class="form-input" placeholder="مثال: ۱۴ روز کاری"></div>
            <div><label style="font-weight: 600; display:block; margin-bottom:5px;">نوع بسته‌بندی</label><input type="text" id="comm-packaging" class="form-input" placeholder="مثال: جامبوبگ ۱ تنی"></div>
          `}
          
          <div style="grid-column: 1 / -1;"><label style="font-weight: 600; display:block; margin-bottom:5px;">شرایط پرداخت مورد قبول</label><input type="text" id="comm-pay-terms" class="form-input" placeholder="مثال: 50% پیش‌پرداخت، LC، نقدی..."></div>
          <div style="grid-column: 1 / -1;"><label style="font-weight: 600; display:block; margin-bottom:5px;">شرایط تحویل / پوشش دهی</label><input type="text" id="comm-delivery" class="form-input" placeholder="مثال: تحویل درب کارخانه (EXW)، FOB بندر عباس..."></div>
          
        </div>
        
        <div style="display: flex; justify-content: space-between; margin-top: 2.5rem; border-top: 1px solid var(--color-border); padding-top: 1.5rem;">
          <button class="btn btn-outline" style="padding: 10px 30px;" onclick="window.prevProdStep()">➔ مرحله قبل</button>
          <div style="display:flex; gap:10px;">
            <button class="btn btn-outline" onclick="window.submitNewItem(false)">ذخیره پیش‌نویس</button>
            <button class="btn btn-primary" style="background:#10b981; border-color:#10b981; padding: 10px 30px;" onclick="window.submitNewItem(true)"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-left: 6px; vertical-align: bottom;"><polyline points="20 6 9 17 4 12"></polyline></svg> ثبت نهایی و انتشار</button>
          </div>
        </div>
      </div>

    </div>
  `;
  
  setTimeout(() => {
      window.showProdStep(1);
      if(!isService) window.addSpecRow('standard');
  }, 0);
};

// 🌟 HTML واحدها برای سلکت‌باکس
const getUnitsHtml = () => `
    <optgroup label="طول و ابعاد">
      <option value="u_mm|میلی‌متر">میلی‌متر</option>
      <option value="u_cm|سانتی‌متر">سانتی‌متر</option>
      <option value="u_m|متر">متر</option>
      <option value="u_in|اینچ">اینچ</option>
    </optgroup>
    <optgroup label="وزن و جرم">
      <option value="u_g|گرم">گرم</option>
      <option value="u_kg|کیلوگرم">کیلوگرم</option>
      <option value="u_t|تن">تن</option>
      <option value="u_lb|پوند">پوند</option>
    </optgroup>
    <optgroup label="حجم">
      <option value="u_ml|میلی‌لیتر">میلی‌لیتر</option>
      <option value="u_l|لیتر">لیتر</option>
      <option value="u_m3|متر مکعب">متر مکعب</option>
    </optgroup>
    <optgroup label="الکتریکی">
      <option value="u_v|ولت">ولت</option>
      <option value="u_kv|کیلوولت">کیلوولت</option>
      <option value="u_a|آمپر">آمپر</option>
      <option value="u_w|وات">وات</option>
      <option value="u_kw|کیلووات">کیلووات</option>
    </optgroup>
    <optgroup label="سایر">
      <option value="u_bar|بار (فشار)">بار (فشار)</option>
      <option value="u_pa|پاسکال">پاسکال</option>
      <option value="u_c|درجه سانتی‌گراد">درجه سانتی‌گراد</option>
      <option value="u_none|بدون واحد" selected>بدون واحد / متنی</option>
    </optgroup>
`;

// 🌟 ویژگی‌های پیش‌فرض دمو بر اساس دسته
const getStandardAttrsHtml = () => `
    <option value="">انتخاب ویژگی...</option>
    <option value="attr_material|جنس / متریال">جنس / متریال</option>
    <option value="attr_length|طول">طول</option>
    <option value="attr_width|عرض">عرض</option>
    <option value="attr_height|ارتفاع">ارتفاع</option>
    <option value="attr_weight|وزن">وزن</option>
    <option value="attr_density|چگالی">چگالی</option>
    <option value="attr_voltage|ولتاژ">ولتاژ</option>
    <option value="attr_power|توان">توان</option>
    <option value="attr_capacity|ظرفیت">ظرفیت</option>
    <option value="attr_pressure|فشار">فشار</option>
    <option value="attr_temp|دما کارکرد">دما کارکرد</option>
    <option value="attr_grade|گرید / کلاس">گرید / کلاس</option>
    <option value="attr_viscosity|ویسکوزیته">ویسکوزیته</option>
    <option value="attr_color|رنگ">رنگ</option>
    <option value="attr_purity|درجه خلوص">درجه خلوص</option>
`;

window.addSpecRow = (type) => {
    const container = document.getElementById('tech-specs-container');
    const isCustom = type === 'custom';
    
    const row = document.createElement('div');
    row.className = 'spec-row';
    row.style = "display: grid; grid-template-columns: 2fr 2fr 1.5fr 80px; gap: 10px; margin-bottom: 10px; align-items: start;";
    
    const nameInput = isCustom 
        ? `<input type="text" class="form-input spec-name" placeholder="نام مشخصه سفارشی...">` 
        : `<select class="form-input spec-name">${getStandardAttrsHtml()}</select>`;

    row.innerHTML = `
        <input type="hidden" class="spec-is-custom" value="${isCustom}">
        ${nameInput}
        <input type="text" class="form-input spec-val" placeholder="مقدار (مثلاً 220)">
        <select class="form-input spec-unit">${getUnitsHtml()}</select>
        <button class="btn btn-outline" style="color:#ef4444; border-color:#ef4444; padding:0; height: 42px;" onclick="this.parentElement.remove()">حذف</button>
    `;
    container.appendChild(row);
};

window.addCertRow = () => {
    const container = document.getElementById('certs-container');
    const row = document.createElement('div');
    row.className = 'cert-row';
    row.style = "background: #f8fafc; border: 1px solid var(--color-border); border-radius: 8px; padding: 15px; margin-bottom: 15px; position: relative;";
    row.innerHTML = `
        <button class="btn-close" style="position:absolute; top:15px; left:15px; background:white; border:1px solid #e2e8f0; border-radius:50%; width:24px; height:24px; display:flex; align-items:center; justify-content:center; cursor:pointer; color:#ef4444;" onclick="this.parentElement.remove()">✕</button>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom:0;">
            <div><label style="font-weight: 600; display:block; margin-bottom:5px;">نام استاندارد / گواهینامه</label><input type="text" class="form-input cert-name" placeholder="مثال: ISO 9001"></div>
            <div><label style="font-weight: 600; display:block; margin-bottom:5px;">شماره گواهینامه</label><input type="text" class="form-input cert-no"></div>
            <div><label style="font-weight: 600; display:block; margin-bottom:5px;">نهاد صادرکننده</label><input type="text" class="form-input cert-issuer"></div>
            <div><label style="font-weight: 600; display:block; margin-bottom:5px;">تاریخ انقضا</label><input type="date" class="form-input cert-expiry"></div>
        </div>
    `;
    container.appendChild(row);
};

window.showProdStep = (step) => {
  document.querySelectorAll('.prod-step-content').forEach(el => el.style.display = 'none');
  const targetEl = document.getElementById(`prod-step-${step}`);
  if (targetEl) targetEl.style.display = 'block';

  document.querySelectorAll('.step-indicator').forEach((el, index) => {
    if(!el.classList.contains('prod-step-indicator')) return;
    if (index + 1 < step) {
      el.style.color = '#10b981';
      el.style.borderBottom = '3px solid #10b981';
      el.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-left: 4px;"><polyline points="20 6 9 17 4 12"></polyline></svg> ${el.dataset.title}`;
    } else if (index + 1 === step) {
      el.style.color = 'var(--color-primary)';
      el.style.borderBottom = '3px solid var(--color-primary)';
      el.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-left: 4px;"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg> ${el.dataset.title}`;
    } else {
      el.style.color = '#94a3b8';
      el.style.borderBottom = '3px solid transparent';
      el.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-left: 4px;"><circle cx="12" cy="12" r="10"></circle></svg> ${el.dataset.title}`;
    }
  });
  window.currentProdStep = step;
};

window.nextProdStep = () => { if(window.currentProdStep < 5) window.showProdStep(window.currentProdStep + 1); };
window.prevProdStep = () => { if(window.currentProdStep > 1) window.showProdStep(window.currentProdStep - 1); };

// 🌟 استخراج و سابمیت اطلاعات ساختاریافته به سیستم
window.submitNewItem = async (isPublished) => {
    const isService = window.currentAddingItemType === 'service';
    
    // جمع‌آوری اطلاعات پایه
    const name = document.getElementById('item-name').value;
    const category = document.getElementById('item-category').value;
    
    if (!name || (!isService && !category)) {
        alert('لطفاً فیلدهای ستاره‌دار در مرحله اول را پر کنید.');
        window.showProdStep(1);
        return;
    }

    // استخراج مشخصات فنی ساختاریافته (مهمترین بخش معماری جدید)
    const technicalAttributes = [];
    document.querySelectorAll('.spec-row').forEach(row => {
        const isCustom = row.querySelector('.spec-is-custom').value === 'true';
        const nameVal = row.querySelector('.spec-name').value; // custom: string, standard: "id|name"
        const val = row.querySelector('.spec-val').value;
        const unitVal = row.querySelector('.spec-unit').value; // "id|name"

        if (nameVal && val) {
            const unitParts = unitVal.split('|');
            let attrId, attrName;
            
            if (isCustom) {
                attrId = 'custom_' + Math.random().toString(36).substr(2, 9);
                attrName = nameVal;
            } else {
                const nameParts = nameVal.split('|');
                attrId = nameParts[0];
                attrName = nameParts[1] || nameParts[0];
            }

            technicalAttributes.push({
                attributeId: attrId,
                attributeName: attrName,
                value: val,
                unitId: unitParts[0],
                unitName: unitParts[1] || '',
                isCustom: isCustom
            });
        }
    });

    // استخراج گواهینامه‌ها
    const certifications = [];
    document.querySelectorAll('.cert-row').forEach(row => {
        const cName = row.querySelector('.cert-name').value;
        if (cName) {
            certifications.push({
                name: cName,
                number: row.querySelector('.cert-no').value,
                issuer: row.querySelector('.cert-issuer').value,
                expiry: row.querySelector('.cert-expiry').value
            });
        }
    });

    // ساخت Payload نهایی
    const payload = {
        itemType: window.currentAddingItemType,
        status: isPublished ? 'active' : 'draft',
        name: name,
        englishName: document.getElementById('item-en-name').value,
        categoryId: category,
        subcategory: document.getElementById('item-subcategory').value,
        
        // فیلدهای کالا
        brand: !isService ? document.getElementById('item-brand').value : null,
        model: !isService ? document.getElementById('item-model').value : null,
        sku: !isService ? document.getElementById('item-sku').value : null,
        origin: !isService ? document.getElementById('item-origin').value : null,
        productionStatus: !isService ? document.getElementById('item-status').value : null,
        
        // فیلدهای خدمات
        geoCoverage: isService ? document.getElementById('item-geo').value : null,
        serviceType: isService ? document.getElementById('item-service-type').value : null,
        industries: isService ? document.getElementById('item-industries').value : null,
        
        // معرفی و مدیا
        shortDescription: document.getElementById('item-short-desc').value,
        fullDescription: document.getElementById('item-full-desc').value,
        advantages: document.getElementById('item-advantages').value,
        keywords: document.getElementById('item-keywords').value,
        
        // مشخصات فنی و گواهی‌ها
        technicalAttributes: technicalAttributes,
        certifications: certifications,
        
        // تجاری و مالی
        priceType: document.getElementById('comm-price-type').value,
        moq: document.getElementById('comm-moq').value,
        leadTime: document.getElementById('comm-lead-time').value,
        paymentTerms: document.getElementById('comm-pay-terms').value,
        deliveryTerms: document.getElementById('comm-delivery').value,
        
        salesUnit: !isService ? document.getElementById('comm-sales-unit').value : null,
        supplyCapacity: !isService ? document.getElementById('comm-capacity').value : null,
        packaging: !isService ? document.getElementById('comm-packaging').value : null,
        executionCapacity: isService ? document.getElementById('comm-capacity').value : null,
    };

    // در اینجا Payload کامل و استاندارد به سرویس فرستاده می‌شود
    console.log("Structured Product Payload:", payload);
    
    // شبیه‌سازی فراخوانی ProductService (بدون نیاز به بک‌اند واقعی)
    // await ProductService.addProduct(payload);
    
    alert(isPublished ? 'آیتم جدید با موفقیت در سیستم ثبت و منتشر شد.' : 'آیتم به عنوان پیش‌نویس ذخیره شد.');
    window.loadProductsTab();
};
// ==========================================
// 7. ARTICLES (مدیریت مقالات)
// ==========================================
async function loadMyArticlesTab() {
  const content = document.getElementById('panel-content');
  content.innerHTML = '<div style="text-align: center; padding: 3rem;">در حال دریافت مقالات...</div>';
  
  const myArticles = await ArticleService.getCompanyArticles(currentProfile.id);

  content.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
      <h2 style="font-size: 1.5rem;"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: bottom; margin-left: 8px;"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg> مدیریت مقالات تخصصی شرکت (${myArticles.length})</h2>
      <button class="btn btn-primary" onclick="window.openArticleEditModal()">+ نگارش مقاله جدید</button>
    </div>

    <div class="panel-table-container">
      <table class="panel-table">
        <thead>
          <tr>
            <th>عنوان مقاله</th>
            <th>تاریخ ثبت</th>
            <th>وضعیت انتشار</th>
            <th>بازدید</th>
            <th>عملیات</th>
          </tr>
        </thead>
        <tbody>
          ${myArticles.length > 0 ? myArticles.map(art => {
            let badge = art.status === 'published' ? '<span class="status-badge" style="background:#d1fae5; color:#059669;">منتشرشده</span>' :
                        art.status === 'pending' ? '<span class="status-badge" style="background:#fef3c7; color:#d97706;">در انتظار بررسی</span>' :
                        art.status === 'rejected' ? `<span class="status-badge" style="background:#fee2e2; color:#dc2626;" title="${art.rejectionReason}">رد شده</span>` :
                        '<span class="status-badge" style="background:#f1f5f9; color:#475569;">پیش‌نویس</span>';

            return `
              <tr>
                <td style="font-weight: 600; max-width:250px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${art.title}</td>
                <td style="color: #64748b;" dir="ltr">${art.createdAt}</td>
                <td>${badge}</td>
                <td style="font-weight:bold; color:var(--color-primary);">${art.views || 0}</td>
                <td>
                  <button class="btn btn-outline" style="padding: 4px 8px; font-size: 0.8rem;" onclick="window.openArticleEditModal('${art.id}')">ویرایش</button>
                  <button class="btn btn-outline" style="padding: 4px 8px; font-size: 0.8rem; color:#ef4444; border-color:#ef4444;" onclick="window.deleteArticleFunc('${art.id}')">حذف</button>
                  ${art.status === 'published' ? `<a href="article-detail.html?id=${art.id}" target="_blank" class="btn btn-outline" style="padding: 4px 8px; font-size: 0.8rem; text-decoration:none;">مشاهده</a>` : ''}
                </td>
              </tr>
            `;
          }).join('') : '<tr><td colspan="5" style="text-align: center; padding: 2rem;">هنوز مقاله‌ای ثبت نکرده‌اید.</td></tr>'}
        </tbody>
      </table>
    </div>
  `;
}

window.openArticleEditModal = async (artId = null) => {
  let art = null;
  if (artId) {
    const myArts = await ArticleService.getCompanyArticles(currentProfile.id);
    art = myArts.find(a => a.id === artId);
  }
  const cats = await CategoryService.getAllCategories();
  const myProds = await ProductService.getProductsBySupplierId(currentProfile.id);

  const modalHtml = `
    <div id="art-edit-modal" class="modal-overlay" style="z-index: 10000; align-items: flex-start; padding-top: 4vh; overflow-y: auto;">
      <div class="modal-content" style="max-width: 800px; width: 95%;">
        <div class="modal-header">
          <h3>${art ? 'ویرایش مقاله' : 'نگارش مقاله تخصصی'}</h3>
          <button class="btn-close" onclick="document.getElementById('art-edit-modal').remove()">✕</button>
        </div>
        <div class="modal-body" style="max-height: 80vh; overflow-y: auto; text-align: right;">
          ${art && art.status === 'rejected' && art.rejectionReason ? `
            <div style="background:#fef2f2; border: 1px solid #fecaca; color:#b91c1c; padding: 10px 15px; border-radius: 8px; margin-bottom: 1rem; font-size: 0.9rem;">
              <strong>دلیل رد توسط مدیر:</strong> ${art.rejectionReason}
            </div>
          ` : ''}

          <input type="hidden" id="art-form-id" value="${art ? art.id : ''}">
          <input type="hidden" id="art-form-cover-hidden" value="${art ? art.coverImage : ''}">
          
          <label style="font-weight: 600; display:block; margin-bottom: 5px;">عنوان مقاله *</label>
          <input type="text" id="art-form-title" class="form-input" value="${art ? art.title : ''}" style="margin-bottom: 15px;">
          
          <label style="font-weight: 600; display:block; margin-bottom: 5px;">تصویر اصلی مقاله (Cover) *</label>
          <div style="border: 2px dashed #cbd5e1; border-radius: 8px; padding: 1.5rem; text-align: center; background: #f8fafc; cursor: pointer; margin-bottom: 15px; transition: 0.3s;" onmouseover="this.style.borderColor='var(--color-primary)'" onmouseout="this.style.borderColor='#cbd5e1'" onclick="document.getElementById('art-form-cover-input').click()">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom: 10px;"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
              <div id="art-cover-name" style="font-size: 0.9rem; color: #64748b; font-weight: 600;">${art && art.coverImage ? 'تصویر قبلاً انتخاب شده (برای تغییر کلیک کنید)' : 'برای انتخاب تصویر کلیک کنید (JPG, PNG)'}</div>
              <input type="file" id="art-form-cover-input" accept="image/*" style="display: none;" onchange="document.getElementById('art-cover-name').textContent = this.files[0].name; document.getElementById('art-cover-name').style.color='var(--color-primary)';">
          </div>

          <label style="font-weight: 600; display:block; margin-bottom: 5px;">دسته‌بندی موضوعی</label>
          <select id="art-form-cat" class="form-input" style="margin-bottom: 15px;">
            ${cats.map(c => `<option value="${c.id}" ${art && art.categoryId === c.id ? 'selected' : ''}>${c.name}</option>`).join('')}
          </select>

          <label style="font-weight: 600; display:block; margin-bottom: 5px;">خلاصه مقاله (جهت نمایش در کارت‌ها) *</label>
          <textarea id="art-form-excerpt" class="form-input" rows="2" style="margin-bottom: 15px;">${art ? art.excerpt : ''}</textarea>

          <label style="font-weight: 600; display:block; margin-bottom: 5px;">متن کامل مقاله *</label>
          <div style="border: 1px solid var(--color-border); border-radius: 8px; overflow: hidden; margin-bottom: 15px;">
              <div style="background: #f1f5f9; padding: 8px 12px; border-bottom: 1px solid var(--color-border); display: flex; gap: 10px;">
                  <button class="btn btn-outline" style="padding: 4px 8px; border:none; background:transparent;" title="پررنگ (Bold)"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2"><path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"></path><path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"></path></svg></button>
                  <button class="btn btn-outline" style="padding: 4px 8px; border:none; background:transparent;" title="افزودن عکس درون متن"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg></button>
                  <button class="btn btn-outline" style="padding: 4px 8px; border:none; background:transparent;" title="افزودن لینک"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg></button>
              </div>
              <textarea id="art-form-content" class="form-input" rows="8" style="border:none; border-radius:0; resize:vertical; box-shadow:none;" placeholder="متن کامل خود را بنویسید (شبیه‌سازی ادیتور)...">${art ? art.content : ''}</textarea>
          </div>

          <label style="font-weight: 600; display:block; margin-bottom: 5px;">برچسب‌ها (با کاما جدا کنید)</label>
          <input type="text" id="art-form-tags" class="form-input" placeholder="مثلا: صنعتی, نگهداری, CNC" value="${art && art.tags ? art.tags.join(', ') : ''}" style="margin-bottom: 15px;">

          <label style="font-weight: 600; display:block; margin-bottom: 5px;">اتصال به محصولات (تیک بزنید)</label>
          <div style="max-height: 140px; overflow-y: auto; border: 1px solid var(--color-border); border-radius: 8px; padding: 10px; background: #f8fafc; margin-bottom: 20px;">
             ${myProds.length > 0 ? myProds.map(p => `
               <label style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px; cursor: pointer; padding: 5px; border-radius: 6px; transition: 0.2s;" onmouseover="this.style.background='white'" onmouseout="this.style.background='transparent'">
                 <input type="checkbox" class="art-prod-cb" value="${p.id}" ${art && art.relatedProductIds && art.relatedProductIds.includes(p.id) ? 'checked' : ''} style="width: 16px; height: 16px;">
                 <img src="${p.image}" style="width:30px; height:30px; border-radius:4px; object-fit:cover; border: 1px solid #e2e8f0;">
                 <span style="font-size: 0.9rem; color: #1e293b; font-weight: 500;">${p.name}</span>
               </label>
             `).join('') : '<span style="color: #64748b; font-size: 0.85rem;">محصولی برای اتصال یافت نشد.</span>'}
          </div>

          <div style="display: flex; gap: 10px; justify-content: flex-end; border-top: 1px solid var(--color-border); padding-top: 1rem;">
            <button class="btn btn-outline" onclick="window.submitArticleForm(false)">ذخیره پیش‌نویس</button>
            <button class="btn btn-primary" style="background:#10b981; border-color:#10b981;" onclick="window.submitArticleForm(true)">ارسال برای بررسی مدیر</button>
          </div>
        </div>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', modalHtml);
};

window.submitArticleForm = async (submitForReview) => {
  const id = document.getElementById('art-form-id').value;
  const title = document.getElementById('art-form-title').value.trim();
  const categoryId = document.getElementById('art-form-cat').value;
  const excerpt = document.getElementById('art-form-excerpt').value.trim();
  const content = document.getElementById('art-form-content').value.trim();
  const tags = document.getElementById('art-form-tags').value.split(',').map(t => t.trim()).filter(Boolean);
  
  const prodCheckboxes = document.querySelectorAll('.art-prod-cb:checked');
  const relatedProductIds = Array.from(prodCheckboxes).map(cb => cb.value);

  const coverInput = document.getElementById('art-form-cover-input');
  const hiddenCover = document.getElementById('art-form-cover-hidden').value;
  let coverImage = hiddenCover; 
  if (coverInput.files && coverInput.files.length > 0) coverImage = URL.createObjectURL(coverInput.files[0]);

  if (!title || !content || !excerpt) {
    alert('لطفاً عنوان، خلاصه و متن کامل مقاله را پر کنید.');
    return;
  }

  const btn = event.target;
  btn.textContent = 'در حال ذخیره...';
  btn.disabled = true;

  await ArticleService.saveArticle({
    id, title, categoryId, excerpt, content, tags, relatedProductIds, submitForReview, coverImage
  }, currentProfile.id);

  document.getElementById('art-edit-modal').remove();
  alert(submitForReview ? 'مقاله شما با موفقیت برای مدیریت ارسال شد.' : 'مقاله به صورت پیش‌نویس ذخیره شد.');
  loadMyArticlesTab();
};

window.deleteArticleFunc = async (id) => {
  if (confirm('آیا از حذف دائم این مقاله اطمینان دارید؟')) {
    await ArticleService.deleteArticle(id, currentProfile.id);
    loadMyArticlesTab();
  }
};
// ==========================================
// 🌟 8. PROFILE (پروفایل تجاری جامع B2B) 🌟
// ==========================================

window.loadProfileTab = () => {
  const content = document.getElementById('panel-content');
  const p = currentProfile || {};
  const roles = p.roles || ['buyer', 'supplier'];
  const bizTypes = p.businessTypes || [];
  
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
            <p style="color: #64748b; font-size: 0.95rem; margin: 0;">پروفایل کامل‌تر = جلب اعتماد بیشتر خریداران و رتبه بهتر در جستجوها.</p>
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
                <div><label class="prof-label">سمت شخص رابط</label><input type="text" id="p-cp-title" class="prof-input" value="${p.contact?.title || ''}" placeholder="مدیر فروش، کارشناس صادرات..."></div>
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
                <label class="checkbox-card" style="background: white;"><input type="checkbox" id="role-service" class="cb-role" value="service_provider" ${isRole('service_provider')}> ارائه‌دهنده خدمات صنعتی</label>
            </div>
        </div>

        <div class="prof-card">
            <h4 class="prof-card-title"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg> توانمندی‌های تولید و تأمین</h4>
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
                <div style="grid-column: 1 / -1;"><label class="prof-label">محصولات / خدمات اصلی (با کاما جدا کنید)</label><input type="text" id="p-main-prods" class="prof-input" value="${p.mainProducts || ''}" placeholder="مثال: روغن موتور، گریس، روانکار صنعتی..."></div>
                <div><label class="prof-label">ظرفیت تولید / تأمین (ماهانه/سالانه)</label><input type="text" id="p-capacity" class="prof-input" value="${p.capacity || ''}" placeholder="مثال: 5000 تن در ماه"></div>
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
                    <textarea id="p-awards" class="prof-input" rows="2" placeholder="عضو اتاق بازرگانی، صادرکننده نمونه سال...">${p.awards || ''}</textarea>
                </div>
            </div>
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 2rem; border-top: 1px solid var(--color-border); padding-top: 1.5rem;">
          <button class="btn btn-outline" style="padding: 10px 30px;" onclick="window.showProfileStep(2)">➔ مرحله قبل</button>
          <button class="btn btn-primary" style="padding: 10px 40px; background: #10b981; border-color: #10b981; font-size: 1.05rem;" onclick="window.submitSellerProfile(event)">
             <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-left: 6px;"><polyline points="20 6 9 17 4 12"></polyline></svg> ذخیره و بروزرسانی نهایی پروفایل
          </button>
        </div>
    </div>
  `;

  setTimeout(() => window.showProfileStep(1), 0);
};

// 🌟 تابع جمع‌آوری اطلاعات و ارسال به سرویس
window.submitSellerProfile = async (event) => {
    const btn = event.target.closest('button');
    const originalText = btn.innerHTML;
    btn.innerHTML = 'در حال ذخیره‌سازی...';
    btn.disabled = true;

    // جمع آوری نقش‌ها و نوع کسب‌وکار
    const roles = Array.from(document.querySelectorAll('.cb-role:checked')).map(cb => cb.value);
    const businessTypes = Array.from(document.querySelectorAll('.cb-biz-type:checked')).map(cb => cb.value);

    // تبدیل کاما به آرایه برای گواهینامه‌ها
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
        await window.SellerService.updateProfile(profileData);
        alert('پروفایل کسب‌وکار شما با موفقیت بروزرسانی شد.');
        
        // رفرش محلی برای آپدیت هدر و دیتاها
        currentProfile = await window.SellerService.getProfile();
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
      targetEl.offsetHeight; // trigger reflow
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