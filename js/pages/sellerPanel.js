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
    link.addEventListener('click', (e) => {
      e.preventDefault();
      navLinks.forEach(l => l.classList.remove('active'));
      const targetLink = e.target.closest('a');
      if(targetLink) targetLink.classList.add('active');
      
      const tab = targetLink ? targetLink.getAttribute('data-tab') : null;
      if (tab === 'inbox') { hasViewedInbox = true; updateSidebarBadges(); loadInboxTab(); }
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
    content.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
        <h2 style="font-size: 1.5rem;">مرکز اعلان‌ها</h2>
        <button class="btn btn-outline" style="padding: 6px 12px; font-size: 0.85rem;" onclick="alert('همه اعلان‌ها خوانده شدند')">علامت همه به عنوان خوانده شده</button>
      </div>
      <div style="background: white; border-radius: 12px; border: 1px solid var(--color-border); overflow: hidden;">
        ${notifs.length > 0 ? notifs.map(n => `
            <div style="padding: 1.2rem 1.5rem; border-bottom: 1px solid #f1f5f9; display: flex; align-items: center; gap: 15px; background: ${n.isRead ? 'white' : '#f8fafc'};">
                <div style="width: 10px; height: 10px; border-radius: 50%; background: ${n.isRead ? 'transparent' : '#3b82f6'};"></div>
                <div>
                    <div style="font-weight: 600; color: #1e293b; margin-bottom: 4px;">${n.title}</div>
                    <div style="font-size: 0.8rem; color: #64748b;" dir="ltr">${n.date}</div>
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

  const isServiceProvider = currentProfile.roles.includes('service_provider');
  const isFreeTier = currentProfile.subscriptionTier === 'free';

  const itemsPerPage = 10;
  let displayItems = [];
  let totalPages = 1;
  let currentPage = 1;

  if (currentInboxTab === 'direct') {
      const rfqs = currentSummary.rfqs;
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
          paginationHTML += `<button class="btn ${i === currentPage ? 'btn-primary' : 'btn-outline'}" style="padding: 5px 12px;" onclick="changeInboxPage(${i})">${i}</button>`;
      }
      paginationHTML += '</div>';
  }

  const tabButtonsHtml = `
    <div style="display: flex; gap: 10px; margin-bottom: 1.5rem; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px;">
        <button class="btn ${currentInboxTab === 'direct' ? 'btn-primary' : 'btn-outline'}" style="border: none; box-shadow: none;" onclick="switchInboxTab('direct')">استعلام‌ها و پیام‌ها</button>
        <button class="btn ${currentInboxTab === 'tenders' ? 'btn-primary' : 'btn-outline'}" style="border: none; box-shadow: none;" onclick="switchInboxTab('tenders')">فرصت‌های پیمانکاری و مناقصات</button>
        ${isServiceProvider ? `<button class="btn ${currentInboxTab === 'radar' ? 'btn-primary' : 'btn-outline'}" style="border: none; box-shadow: none;" onclick="switchInboxTab('radar')">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-left: 4px; vertical-align: middle;"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
            رادار معاملات (فرصت خدمات)
        </button>` : ''}
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
                    <button class="btn btn-primary" style="padding: 4px 12px; font-size: 0.8rem;" onclick="openReplyModal('${rfq.id}')">
                      ${rfq.status === 'pending' ? 'خواندن و پاسخ' : 'مشاهده پرونده'}
                    </button>
                  </td>
                </tr>
              `).join('') : '<tr><td colspan="5" style="text-align:center;">پیام مستقیم جدیدی ندارید</td></tr>'}
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
                        `<button class="btn btn-outline" style="padding: 4px 12px; font-size: 0.8rem;" onclick='openViewMyProposalModal(${JSON.stringify(t).replace(/"/g, '&quot;')})'>مشاهده پیشنهاد من</button>` : 
                        `<button class="btn btn-primary" style="padding: 4px 12px; font-size: 0.8rem; background-color: #10b981; border-color: #10b981;" onclick="${AppStore.checkFeatureAccess('send_message') ? `openSubmitProposalModal(${JSON.stringify(t).replace(/"/g, '&quot;')})` : `showUpgradePaywall('ارسال پروپوزال مناقصه')`}">ارسال پیشنهاد / اعلام آمادگی</button>`
                    }
                  </td>
                </tr>
              `}).join('') : '<tr><td colspan="6" style="text-align:center;">فرصت مرتبطی یافت نشد</td></tr>'}
            </tbody>
          </table>
        </div>
      `;
  } else {
      tableHtml = `
        <div class="panel-table-container" style="position: relative;">
          ${isFreeTier && displayItems.length > 0 ? `
            <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 10; display: flex; flex-direction: column; align-items: center; justify-content: center; background: rgba(255,255,255,0.7); backdrop-filter: blur(4px);">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#d946ef" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom: 10px;"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
              <h3 style="color: #1e293b; margin-bottom: 5px;">دسترسی محدود</h3>
              <p style="color: #475569; font-size: 0.9rem; margin-bottom: 15px;">برای مشاهده نام شرکت‌های در حال مذاکره و ارسال پیشنهاد خدمات، اشتراک خود را ارتقا دهید.</p>
              <button class="btn btn-primary" style="background:#d946ef; border-color:#d946ef;" onclick="showUpgradePaywall('رادار هوشمند معاملات')">ارتقا به نسخه Premium</button>
            </div>
          ` : ''}

          <table class="panel-table">
            <thead>
              <tr>
                <th>طرفین معامله (خریدار - فروشنده)</th>
                <th>موضوع معامله (کالا/پروژه)</th>
                <th>حجم / مقیاس</th>
                <th style="white-space: nowrap; width: 140px;">وضعیت</th>
                <th>عملیات خدمات</th>
              </tr>
            </thead>
            <tbody>
              ${displayItems.length > 0 ? displayItems.map(deal => {
                const hasPitched = deal.pitches && deal.pitches.some(p => p.supplierId === currentProfile.id);
                return `
                <tr style="${isFreeTier ? 'filter: blur(2px); user-select: none;' : ''}">
                  <td>
                    <div style="display:flex; align-items:center; gap:8px;">
                      <span style="font-weight:600; color:var(--color-primary);">${deal.buyerName}</span>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                      <span style="font-weight:600; color:#334155;">${deal.supplierName}</span>
                    </div>
                  </td>
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
                        `<button class="btn btn-outline" style="padding: 4px 12px; font-size: 0.8rem;" onclick="viewMyPitch('${deal.id}')">مشاهده پیشنهاد من</button>` : 
                        `<button class="btn btn-primary" style="padding: 4px 12px; font-size: 0.8rem; background-color: #8b5cf6; border-color: #8b5cf6;" onclick="${isFreeTier ? '' : `openPitchModal('${deal.id}')`}">ارسال پیشنهاد (Pitch)</button>`
                    }
                  </td>
                </tr>
              `}).join('') : '<tr><td colspan="5" style="text-align:center;">در حال حاضر معامله فعالی در رادار وجود ندارد</td></tr>'}
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
                <button class="btn btn-outline" style="padding: 4px 8px; font-size: 0.8rem; display: inline-flex; align-items: center; justify-content: center; gap: 4px;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg> ویرایش</button>
                <button class="btn btn-outline" style="padding: 4px 8px; font-size: 0.8rem; color: #ef4444; border-color: #ef4444; margin-right: 5px; display: inline-flex; align-items: center; justify-content: center; gap: 4px;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg> حذف</button>
              </td>
            </tr>
          `).join('') : '<tr><td colspan="5" style="text-align:center;">محصولی برای نمایش وجود ندارد</td></tr>'}
        </tbody>
      </table>
    </div>
    ${paginationHTML}
  `;
}

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
            <button class="btn btn-outline" onclick="loadProductsTab()">انصراف و بازگشت</button>
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

window.loadAddItemForm = (type) => {
  currentAddingItemType = type;
  const isService = type === 'service';
  const content = document.getElementById('panel-content');
  
  content.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
      <h2 style="font-size: 1.5rem;"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: bottom; margin-left: 8px;"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg> ${isService ? 'ثبت خدمات جدید' : 'ثبت کالای جدید'}</h2>
      <button class="btn btn-outline" onclick="loadProductsTab()" style="display: inline-flex; align-items: center; gap: 6px;"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg> انصراف و بازگشت</button>
    </div>
    
    <div class="step-container" style="display: flex; justify-content: space-between; margin-bottom: 2rem; background: var(--color-surface); padding: 10px; border-radius: 8px; border: 1px solid var(--color-border);">
      <div class="step-indicator prod-step-indicator" data-title="پایه">پایه</div>
      <div class="step-indicator prod-step-indicator" data-title="شرح کامل">شرح کامل</div>
      <div class="step-indicator prod-step-indicator" data-title="${isService ? 'ویژگی‌های سرویس' : 'فنی'}">${isService ? 'ویژگی‌های سرویس' : 'فنی'}</div>
      <div class="step-indicator prod-step-indicator" data-title="مجوزها">مجوزها</div>
      <div class="step-indicator prod-step-indicator" data-title="قرارداد و مالی">قرارداد و مالی</div>
    </div>

    <div style="background: white; padding: 2rem; border-radius: 12px; border: 1px solid var(--color-border); box-shadow: 0 4px 6px rgba(0,0,0,0.02);">
      
      <div id="prod-step-1" class="prod-step-content">
        <h3 style="margin-bottom: 1.5rem;">۱. اطلاعات پایه ${isService ? 'خدمات' : 'محصول'}</h3>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem;">
          <div><label style="font-weight: 600; display:block; margin-bottom:5px;">عنوان ${isService ? 'خدمات' : 'محصول'} *</label><input type="text" class="form-input"></div>
          <div><label style="font-weight: 600; display:block; margin-bottom:5px;">عنوان انگلیسی</label><input type="text" class="form-input"></div>
          <div><label style="font-weight: 600; display:block; margin-bottom:5px;">دسته‌بندی مرتبط</label><select class="form-input"><option>روانکارها</option><option>برق و الکترونیک</option><option>لجستیک و حمل</option><option>بیمه و بازرسی</option><option>خدمات اجرای پروژه‌ها</option></select></div>
          
          ${isService ? `
            <div><label style="font-weight: 600; display:block; margin-bottom:5px;">محدوده جغرافیایی تحت پوشش</label><input type="text" class="form-input"></div>
            <div style="grid-column: 1 / -1;"><label style="font-weight: 600; display:block; margin-bottom:5px;">بنر یا تصویر نماینده خدمات</label><button class="btn btn-outline" style="width:100%; display: inline-flex; align-items: center; justify-content: center; gap: 6px;"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg> آپلود بنر/تصویر</button></div>
          ` : `
            <div><label style="font-weight: 600; display:block; margin-bottom:5px;">برند</label><input type="text" class="form-input"></div>
            <div><label style="font-weight: 600; display:block; margin-bottom:5px;">کد محصول / مدل</label><input type="text" class="form-input"></div>
            <div><label style="font-weight: 600; display:block; margin-bottom:5px;">کشور سازنده</label><input type="text" class="form-input"></div>
            <div style="grid-column: 1 / -1;"><label style="font-weight: 600; display:block; margin-bottom:5px;">تصویر اصلی محصول</label><button class="btn btn-outline" style="width:100%; display: inline-flex; align-items: center; justify-content: center; gap: 6px;"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg> انتخاب تصویر</button></div>
          `}
          
        </div>
        <div style="text-align: left; margin-top: 2rem;"><button class="btn btn-primary" style="padding: 10px 30px; display: inline-flex; align-items: center; gap: 6px;" onclick="window.nextProdStep()">مرحله بعد <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg></button></div>
      </div>

      <div id="prod-step-2" class="prod-step-content">
        <h3 style="margin-bottom: 1.5rem;">۲. توضیحات و معرفی</h3>
        <div style="display: grid; grid-template-columns: 1fr; gap: 1.5rem;">
          <div><label style="font-weight: 600; display:block; margin-bottom:5px;">شرح کوتاه (نمایش در لیست‌ها)</label><textarea class="form-input" rows="2"></textarea></div>
          <div><label style="font-weight: 600; display:block; margin-bottom:5px;">شرح کامل و جزئیات</label><textarea class="form-input" rows="5"></textarea></div>
          <div><label style="font-weight: 600; display:block; margin-bottom:5px;">کاربردهای اصلی و صنایع هدف</label><input type="text" class="form-input"></div>
        </div>
        <div style="display: flex; justify-content: space-between; margin-top: 2rem;">
          <button class="btn btn-outline" style="display: inline-flex; align-items: center; gap: 6px;" onclick="window.prevProdStep()"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg> مرحله قبل</button>
          <button class="btn btn-primary" style="display: inline-flex; align-items: center; gap: 6px;" onclick="window.nextProdStep()">مرحله بعد <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg></button>
        </div>
      </div>

      <div id="prod-step-3" class="prod-step-content">
        <h3 style="margin-bottom: 1.5rem;">۳. ${isService ? 'ویژگی‌ها و پارامترهای سرویس' : 'مشخصات فنی تخصصی'}</h3>
        <div id="tech-specs-container">
          <div style="display: flex; gap: 10px; margin-bottom: 10px;">
            <input type="text" class="form-input" style="flex:1;">
            <input type="text" class="form-input" style="flex:2;">
            <button class="btn btn-outline" style="color:#ef4444; border-color:#ef4444; padding:0 15px; display: inline-flex; align-items: center; justify-content: center;" onclick="this.parentElement.remove()"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button>
          </div>
        </div>
        
        <button class="btn btn-outline" style="margin-top: 10px; border-style: dashed; width: 100%; display: inline-flex; align-items: center; justify-content: center; gap: 6px;" onclick="window.addTechSpecRow()"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg> افزودن پارامتر جدید</button>

        <div style="display: flex; justify-content: space-between; margin-top: 2rem;">
          <button class="btn btn-outline" style="display: inline-flex; align-items: center; gap: 6px;" onclick="window.prevProdStep()"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 5"></polyline></svg> مرحله قبل</button>
          <button class="btn btn-primary" style="display: inline-flex; align-items: center; gap: 6px;" onclick="window.nextProdStep()">مرحله بعد <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg></button>
        </div>
      </div>

      <div id="prod-step-4" class="prod-step-content">
        <h3 style="margin-bottom: 1.5rem;">۴. مجوزها و گواهینامه‌های اعتباری</h3>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem;">
          <div><label style="font-weight: 600; display:block; margin-bottom:5px;">نام مجوز / استاندارد</label><input type="text" class="form-input"></div>
          <div><label style="font-weight: 600; display:block; margin-bottom:5px;">نهاد صادرکننده</label><input type="text" class="form-input"></div>
          <div><label style="font-weight: 600; display:block; margin-bottom:5px;">تاریخ انقضا</label><input type="date" class="form-input"></div>
          <div><label style="font-weight: 600; display:block; margin-bottom:5px;">سند ضمیمه</label><button class="btn btn-outline" style="width:100%; display: inline-flex; align-items: center; justify-content: center; gap: 6px;"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path></svg> آپلود فایل</button></div>
        </div>
        <div style="display: flex; justify-content: space-between; margin-top: 2rem;">
          <button class="btn btn-outline" style="display: inline-flex; align-items: center; gap: 6px;" onclick="window.prevProdStep()"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 5"></polyline></svg> مرحله قبل</button>
          <button class="btn btn-primary" style="display: inline-flex; align-items: center; gap: 6px;" onclick="window.nextProdStep()">مرحله بعد <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg></button>
        </div>
      </div>

      <div id="prod-step-5" class="prod-step-content">
        <h3 style="margin-bottom: 1.5rem;">۵. اطلاعات تجاری و قرارداد</h3>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem;">
          
          ${isService ? `
            <div><label style="font-weight: 600; display:block; margin-bottom:5px;">مدل قیمت‌گذاری</label><select class="form-input"><option>قراردادی (پروژه‌ای)</option><option>ساعتی / روزمزد</option><option>برآورد پس از کارشناسی</option></select></div>
            <div><label style="font-weight: 600; display:block; margin-bottom:5px;">زمان‌بندی میانگین اجرا (SLA)</label><input type="text" class="form-input"></div>
            <div style="grid-column: 1 / -1;"><label style="font-weight: 600; display:block; margin-bottom:5px;">شرایط پرداخت و تسویه حساب</label><textarea class="form-input" rows="3"></textarea></div>
          ` : `
            <div><label style="font-weight: 600; display:block; margin-bottom:5px;">مدل قیمت‌گذاری</label><select class="form-input"><option>استعلامی (قابل مذاکره)</option><option>قیمت ثابت</option></select></div>
            <div><label style="font-weight: 600; display:block; margin-bottom:5px;">حداقل میزان سفارش (MOQ)</label><div style="display:flex; gap:10px;"><input type="number" class="form-input" style="flex:2;"><select class="form-input" style="flex:1;"><option>عدد</option><option>تن</option><option>بشکه</option><option>دستگاه</option></select></div></div>
            <div><label style="font-weight: 600; display:block; margin-bottom:5px;">زمان‌بندی تحویل کالا</label><input type="text" class="form-input"></div>
            <div><label style="font-weight: 600; display:block; margin-bottom:5px;">نوع بسته‌بندی پالت/بار</label><input type="text" class="form-input"></div>
            <div style="grid-column: 1 / -1;"><label style="font-weight: 600; display:block; margin-bottom:5px;">شرایط پرداخت و ارسال</label><textarea class="form-input" rows="3"></textarea></div>
          `}
          
        </div>
        
        <div style="display: flex; justify-content: space-between; margin-top: 2rem; border-top: 1px solid var(--color-border); padding-top: 1.5rem;">
          <button class="btn btn-outline" style="display: inline-flex; align-items: center; gap: 6px;" onclick="window.prevProdStep()"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 5"></polyline></svg> مرحله قبل</button>
          <div style="display:flex; gap:10px;">
            <button class="btn btn-outline" style="display: inline-flex; align-items: center; gap: 6px;" onclick="alert('آیتم به عنوان پیش‌نویس ذخیره شد.'); window.loadProductsTab();"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg> ذخیره پیش‌نویس</button>
            <button class="btn btn-primary" style="background:#10b981; border-color:#10b981; display: inline-flex; align-items: center; gap: 6px;" onclick="alert('آیتم جدید با موفقیت در سیستم ثبت و منتشر شد.'); window.loadProductsTab();"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg> انتشار در پلتفرم</button>
          </div>
        </div>
      </div>

    </div>
  `;
  setTimeout(() => window.showProdStep(1), 0);
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
// 8. PROFILE (پروفایل شرکت)
// ==========================================
window.loadProfileTab = () => {
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
          <button class="btn btn-primary" style="padding: 10px 30px; display: inline-flex; align-items: center; gap: 6px;" onclick="window.nextProfileStep()">مرحله بعد <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg></button>
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
          <button class="btn btn-outline" style="padding: 10px 30px; display: inline-flex; align-items: center; gap: 6px;" onclick="window.prevProfileStep()"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg> مرحله قبل</button>
          <button class="btn btn-primary" style="padding: 10px 30px; display: inline-flex; align-items: center; gap: 6px;" onclick="window.nextProfileStep()">مرحله بعد <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg></button>
        </div>
      </div>

      <div id="step-3" class="profile-step-content">
        <h3 style="margin-bottom: 1.5rem; color: var(--color-text-main);">۳. ماهیت فعالیت و نقش‌ها در TradeCore</h3>
        
        <div style="margin-bottom: 2rem; background: #f8fafc; padding: 1.5rem; border-radius: 8px; border: 1px dashed var(--color-primary);">
          <label style="font-weight: bold; font-size: 1.1rem; display:block; margin-bottom:10px; color: var(--color-primary);">نقش‌های شما در پلتفرم (می‌توانید چند مورد را انتخاب کنید)</label>
          <div class="checkbox-group" style="flex-wrap: wrap;">
            <label class="checkbox-card"><input type="checkbox" id="role-buyer" ${isBuyer}> خریدار (ارسال RFQ / ثبت مناقصه)</label>
            <label class="checkbox-card"><input type="checkbox" id="role-supplier" ${isSupplier}> تأمین‌کننده کالا (فروش محصولات)</label>
            <label class="checkbox-card"><input type="checkbox" id="role-service" ${isService} onchange="window.toggleServiceFields()"> ارائه‌دهنده خدمات صنعتی/تجاری</label>
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
          <button class="btn btn-outline" style="padding: 10px 30px; display: inline-flex; align-items: center; gap: 6px;" onclick="window.prevProfileStep()"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg> مرحله قبل</button>
          <button class="btn btn-primary" style="padding: 10px 40px; background: #10b981; border-color: #10b981; display: inline-flex; align-items: center; gap: 6px;" onclick="alert('پروفایل کسب‌وکار شما با موفقیت به‌روزرسانی شد.')"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg> ذخیره نهایی پروفایل</button>
        </div>
      </div>
    </div>
  `;

  setTimeout(() => window.showProfileStep(1), 0);
};

window.currentProfileStep = 1;
window.showProfileStep = (step) => {
  document.querySelectorAll('.profile-step-content').forEach(el => el.style.display = 'none');
  const targetEl = document.getElementById(`step-${step}`);
  if (targetEl) targetEl.style.display = 'block';

  document.querySelectorAll('.step-indicator').forEach((el, index) => {
    if(!el.classList.contains('prod-step-indicator')) {
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
    }
  });
  window.currentProfileStep = step;
};

window.nextProfileStep = () => { if(window.currentProfileStep < 3) window.showProfileStep(window.currentProfileStep + 1); };
window.prevProfileStep = () => { if(window.currentProfileStep > 1) window.showProfileStep(window.currentProfileStep - 1); };

window.toggleServiceFields = () => {
    const isChecked = document.getElementById('role-service').checked;
    const container = document.getElementById('service-types-container');
    if(container) container.style.display = isChecked ? 'block' : 'none';
};

// ==========================================
// 🌟 9. تب آمار و بازدیدهای فروشنده (Analytics + Line Chart) 🌟
// ==========================================

window.sellerAnalyticsState = {
  dateRange: 30, // پیش‌فرض 30 روزه برای نمایش بهتر نمودار
  sort: 'views_desc'
};

window.changeSellerAnalyticsDate = (days, btn) => {
  const buttons = btn.parentElement.querySelectorAll('button:not(#sa-custom-date-container button)');
  buttons.forEach(b => {
      b.classList.remove('btn-primary');
      b.classList.add('btn-outline');
  });
  btn.classList.remove('btn-outline');
  btn.classList.add('btn-primary');

  const customContainer = document.getElementById('sa-custom-date-container');
  if (days === 'custom') {
      customContainer.style.display = 'flex';
  } else {
      customContainer.style.display = 'none';
      window.sellerAnalyticsState.dateRange = days;
      window.loadAnalyticsTabData();
  }
};

window.applySellerCustomDate = () => {
  const fromDate = document.getElementById('sa-date-from').value;
  const toDate = document.getElementById('sa-date-to').value;
  if(!fromDate || !toDate) return alert('لطفاً هر دو تاریخ شروع و پایان را مشخص کنید.');
  window.sellerAnalyticsState.dateRange = { from: fromDate, to: toDate };
  window.loadAnalyticsTabData();
};

window.changeSellerAnalyticsSort = (sortVal) => {
  window.sellerAnalyticsState.sort = sortVal;
  window.loadAnalyticsTabData();
};

// تابع رسم نمودار خطی SVG (بدون نیاز به کتابخانه خارجی)
function generateSVGChart(data) {
    if(!data || data.length < 2) return `<div style="text-align:center; padding: 3rem; color: #94a3b8; font-size: 0.9rem;">برای رسم نمودار روند، به اطلاعات بیش از یک روز نیاز است.</div>`;
    
    const width = 800;
    const height = 220;
    const padding = 40;
    const maxVal = Math.max(...data.map(d => d.value), 5); // حداقل محور Y برابر 5
    
    const stepX = (width - padding * 2) / (data.length - 1);
    
    let points = '';
    let elements = '';
    
    data.forEach((d, i) => {
        const x = padding + (i * stepX);
        const y = height - padding - ((d.value / maxVal) * (height - padding * 2));
        points += `${x},${y} `;
        
        elements += `
            <circle cx="${x}" cy="${y}" r="4" fill="white" stroke="var(--color-primary)" stroke-width="2" />
            <text x="${x}" y="${y - 12}" font-size="12" fill="#1e293b" font-weight="bold" text-anchor="middle" font-family="inherit">${d.value}</text>
            <text x="${x}" y="${height - 10}" font-size="11" fill="#64748b" text-anchor="middle" font-family="inherit">${d.label}</text>
        `;
    });

    const polygonPoints = `${padding},${height - padding} ${points} ${padding + (data.length - 1) * stepX},${height - padding}`;

    return `
        <svg viewBox="0 0 ${width} ${height}" style="width: 100%; height: auto; display: block; overflow: visible;">
            <defs>
                <linearGradient id="chartBg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="var(--color-primary)" stop-opacity="0.15"/>
                    <stop offset="100%" stop-color="var(--color-primary)" stop-opacity="0"/>
                </linearGradient>
            </defs>
            <polyline points="${points}" fill="none" stroke="var(--color-primary)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
            <polygon points="${polygonPoints}" fill="url(#chartBg)" />
            ${elements}
        </svg>
    `;
}

window.loadAnalyticsTab = async function() {
  const content = document.getElementById('panel-content');
  
  content.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
          <h2 style="font-size: 1.5rem;"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: bottom; margin-left: 8px;"><path d="M18 20V10"></path><path d="M12 20V4"></path><path d="M6 20v-6"></path></svg> آمار و بازدیدهای من</h2>
      </div>
      
      <!-- دکمه‌های فیلتر زمان -->
      <div style="display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 2rem; align-items: center; padding-bottom: 1.5rem; border-bottom: 2px solid #e2e8f0;">
          <button class="btn btn-outline" style="padding: 6px 15px; font-size: 0.85rem; border-radius: 20px;" onclick="window.changeSellerAnalyticsDate(7, this)">۷ روز گذشته</button>
          <button class="btn btn-outline" style="padding: 6px 15px; font-size: 0.85rem; border-radius: 20px;" onclick="window.changeSellerAnalyticsDate(15, this)">۱۵ روز گذشته</button>
          <button class="btn btn-primary" style="padding: 6px 15px; font-size: 0.85rem; border-radius: 20px;" onclick="window.changeSellerAnalyticsDate(30, this)">۳۰ روز گذشته</button>
          <button class="btn btn-outline" style="padding: 6px 15px; font-size: 0.85rem; border-radius: 20px;" onclick="window.changeSellerAnalyticsDate(60, this)">۶۰ روز گذشته</button>
          <button class="btn btn-outline" style="padding: 6px 15px; font-size: 0.85rem; border-radius: 20px;" onclick="window.changeSellerAnalyticsDate(120, this)">۱۲۰ روز گذشته</button>
          <button class="btn btn-outline" style="padding: 6px 15px; font-size: 0.85rem; border-radius: 20px;" onclick="window.changeSellerAnalyticsDate(360, this)">۳۶۰ روز گذشته</button>
          <button class="btn btn-outline" style="padding: 6px 15px; font-size: 0.85rem; border-radius: 20px;" onclick="window.changeSellerAnalyticsDate('all', this)">کل زمان</button>
          <button class="btn btn-outline" style="padding: 6px 15px; font-size: 0.85rem; border-radius: 20px;" onclick="window.changeSellerAnalyticsDate('custom', this)">زمان‌دهی دستی</button>
          
          <div id="sa-custom-date-container" style="display: none; align-items: center; gap: 12px; margin-right: auto; background: white; padding: 6px 16px; border-radius: 30px; border: 1px solid var(--color-border);">
             <div style="display: flex; align-items: center; gap: 8px;">
                 <span style="font-size: 0.8rem; color: #64748b;">از:</span>
                 <input type="date" id="sa-date-from" style="border: none; outline: none; background: transparent; font-size: 0.85rem; font-family: inherit; color: #1e293b; cursor: pointer;">
             </div>
             <div style="width: 1px; height: 15px; background: #cbd5e1;"></div>
             <div style="display: flex; align-items: center; gap: 8px;">
                 <span style="font-size: 0.8rem; color: #64748b;">تا:</span>
                 <input type="date" id="sa-date-to" style="border: none; outline: none; background: transparent; font-size: 0.85rem; font-family: inherit; color: #1e293b; cursor: pointer;">
             </div>
             <button class="btn btn-primary" style="padding: 4px 16px; font-size: 0.85rem; border-radius: 20px;" onclick="window.applySellerCustomDate()">تأیید</button>
          </div>
      </div>

      <div id="sa-data-container">
          <div style="text-align: center; padding: 3rem; color: #64748b;">در حال محاسبه آمار...</div>
      </div>
  `;

  await window.loadAnalyticsTabData();
};

window.loadAnalyticsTabData = async function() {
  const container = document.getElementById('sa-data-container');
  if(!container) return;
  
  container.innerHTML = '<div style="text-align: center; padding: 3rem; color: #64748b;">در حال محاسبه مجدد آمار...</div>';

  const stats = await SellerService.getSellerAnalytics(window.sellerAnalyticsState.dateRange);

  if (stats.totalViews === 0 && (!stats.products || stats.products.length === 0)) {
    container.innerHTML = `
        <div style="background: #f8fafc; border: 2px dashed #cbd5e1; color: #64748b; padding: 4rem 2rem; text-align: center; border-radius: 16px; margin-bottom: 2rem;">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom: 1rem;"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
            <h3 style="margin-bottom: 10px; color: #334155; font-size: 1.2rem;">هنوز آماری برای نمایش وجود ندارد</h3>
            <p style="font-size: 0.95rem; margin: 0; max-width: 500px; margin: 0 auto;">اطلاعات بازدید واقعی پروفایل و محصولات شما در اینجا نمایش داده خواهد شد. (بازدیدهای خودتان محاسبه نمی‌شود)</p>
        </div>
    `;
    return;
  }

  let sortedProducts = [...stats.products];
  if (window.sellerAnalyticsState.sort === 'views_asc') sortedProducts.sort((a,b) => a.views - b.views);
  if (window.sellerAnalyticsState.sort === 'saves_desc') sortedProducts.sort((a,b) => b.saves - a.saves);

  let itemsHtml = sortedProducts.map(p => `
      <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 15px 10px; font-weight: 600; color: #1e293b; font-size: 0.9rem;">${p.name}</td>
          <td style="padding: 15px 10px; text-align: center; font-weight: bold; color: var(--color-primary); font-size: 1.1rem;">${p.views}</td>
          <td style="padding: 15px 10px; text-align: center; color: #f59e0b; font-weight: bold;">${p.saves}</td>
      </tr>
  `).join('');

  if(sortedProducts.length === 0) {
      itemsHtml = '<tr><td colspan="3" style="text-align:center; padding: 2rem; color: #64748b;">محصولی برای نمایش آمار یافت نشد.</td></tr>';
  }

  container.innerHTML = `
      <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 1.5rem; margin-bottom: 1.5rem;">
          
          <!-- باکس نمودار خطی -->
          <div style="background: white; border: 1px solid var(--color-border); border-radius: 12px; padding: 1.5rem; box-shadow: 0 2px 4px rgba(0,0,0,0.02); display: flex; flex-direction: column;">
              <h3 style="font-size: 1.1rem; color: #0f172a; margin-bottom: 1.5rem; border-bottom: 2px solid #f1f5f9; padding-bottom: 10px;">نمودار روند بازدید کل</h3>
              <div style="flex-grow: 1; display: flex; align-items: center; justify-content: center; padding-top: 10px;">
                  ${generateSVGChart(stats.chartData)}
              </div>
          </div>

          <!-- باکس‌های آماری راست -->
          <div style="display: flex; flex-direction: column; gap: 1.5rem;">
              <div style="background: white; border: 1px solid var(--color-border); border-radius: 12px; padding: 2rem; box-shadow: 0 2px 4px rgba(0,0,0,0.02); text-align: center; flex: 1; display: flex; flex-direction: column; justify-content: center;">
                  <h3 style="font-size: 1.1rem; color: #64748b; margin-bottom: 1rem;">مجموع بازدید در بازه انتخابی</h3>
                  <div style="font-size: 4rem; font-weight: 900; color: var(--color-primary); line-height: 1; margin-bottom: 1rem;">${stats.totalViews}</div>
                  <p style="color: #10b981; font-size: 0.85rem; margin: 0; display: flex; align-items: center; justify-content: center; gap: 5px; background: #ecfdf5; padding: 5px; border-radius: 6px;">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline><polyline points="16 7 22 7 22 13"></polyline></svg>
                      داده‌های واقعی بر اساس تعامل خریداران
                  </p>
              </div>

              <div style="background: white; border: 1px solid var(--color-border); border-radius: 12px; padding: 1.5rem; box-shadow: 0 2px 4px rgba(0,0,0,0.02); text-align: center; display: flex; justify-content: space-between; align-items: center;">
                  <h3 style="font-size: 1rem; color: #64748b; margin: 0;">بازدید مستقیم پروفایل</h3>
                  <div style="font-size: 1.8rem; font-weight: 800; color: #0f172a;">${stats.totalProfileViews} <span style="font-size: 0.9rem; color: #94a3b8; font-weight: normal;">مرتبه</span></div>
              </div>
          </div>
      </div>

      <!-- جدول محصولات -->
      <div style="background: white; border: 1px solid var(--color-border); border-radius: 12px; padding: 1.5rem; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; border-bottom: 2px solid #f1f5f9; padding-bottom: 10px;">
              <h3 style="font-size: 1.1rem; color: #0f172a; margin: 0;">آمار بازدید آیتم‌ها</h3>
              <select class="form-input" style="width: auto; padding: 4px 12px; font-size: 0.85rem; border-radius: 20px; background-color: #f8fafc;" onchange="window.changeSellerAnalyticsSort(this.value)">
                  <option value="views_desc" ${window.sellerAnalyticsState.sort === 'views_desc' ? 'selected' : ''}>بیشترین بازدید</option>
                  <option value="views_asc" ${window.sellerAnalyticsState.sort === 'views_asc' ? 'selected' : ''}>کمترین بازدید</option>
                  <option value="saves_desc" ${window.sellerAnalyticsState.sort === 'saves_desc' ? 'selected' : ''}>بیشترین دفعات نشان‌کردن</option>
              </select>
          </div>
          <div style="max-height: 400px; overflow-y: auto;">
              <table class="panel-table" style="width: 100%; border: none;">
                  <thead style="position: sticky; top: 0; background: white; z-index: 1;">
                      <tr>
                          <th style="padding-bottom: 10px; border-bottom: 2px solid #e2e8f0; background: white;">عنوان آیتم (کالا/خدمات)</th>
                          <th style="padding-bottom: 10px; border-bottom: 2px solid #e2e8f0; background: white; text-align: center;">تعداد بازدید</th>
                          <th style="padding-bottom: 10px; border-bottom: 2px solid #e2e8f0; background: white; text-align: center;">دفعات ذخیره</th>
                      </tr>
                  </thead>
                  <tbody>
                      ${itemsHtml}
                  </tbody>
              </table>
          </div>
      </div>
      
      <!-- 🌟 بنر ورود به تحلیل بازار در انتهای تب با لینک به صفحه جدید 🌟 -->
      <div style="background: linear-gradient(135deg, #1e3a8a, #3b82f6); border-radius: 12px; padding: 2rem; color: white; display: flex; justify-content: space-between; align-items: center; margin-top: 2rem; box-shadow: 0 10px 15px -3px rgba(59, 130, 246, 0.3);">
          <div>
              <h2 style="color: white; font-size: 1.4rem; margin-bottom: 0.5rem; display: flex; align-items: center; gap: 8px;">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
                  تحلیل و هوش بازار (Market Intelligence)
              </h2>
              <p style="color: #bfdbfe; font-size: 0.95rem; margin: 0;">با بررسی رفتار خریداران در کل پلتفرم، تقاضای بازار، رقبا و فرصت‌های صادراتی را کشف کنید.</p>
          </div>
          <a href="market-intelligence.html" target="_blank" class="btn" style="background: white; color: #1e40af; font-weight: bold; padding: 10px 24px; border-radius: 8px; text-decoration: none;">
              ورود به رادار بازار
          </a>
      </div>
  `;
};