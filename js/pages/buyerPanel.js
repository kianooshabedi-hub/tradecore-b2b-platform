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
  const profileStatus = AppStore.getProfileCompletionStatus(); // دریافت درصد تکمیل

  // تولید لیست کارهای ناقص
  const tasksHtml = profileStatus.missingTasks.length > 0 
    ? `<ul style="margin-top: 10px; font-size: 0.85rem; color: #ef4444; padding-right: 20px;">
        ${profileStatus.missingTasks.map(task => `<li>${task}</li>`).join('')}
       </ul>`
    : `<p style="margin-top: 10px; font-size: 0.9rem; color: #10b981;">🎉 پروفایل شما کامل است!</p>`;

  content.innerHTML = `
    <h1 style="font-size: 1.8rem; margin-bottom: 1.5rem;">خلاصه فعالیت‌های خرید شما</h1>
    
    <!-- 🌟 ویجت جدید درصد تکمیل پروفایل -->
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

// توابع سراسری برای مدیریت فرم چندمرحله‌ای
window.currentProfileStep = 1;

window.showProfileStep = (step) => {
  // پنهان کردن تمام مراحل
  document.querySelectorAll('.profile-step-content').forEach(el => el.style.display = 'none');
  // نمایش مرحله فعلی
  document.getElementById(`step-${step}`).style.display = 'block';

  // آپدیت کردن ظاهر نوار پیشرفت (Progress Bar)
  document.querySelectorAll('.step-indicator').forEach((el, index) => {
    if (index + 1 < step) {
      el.className = 'step-indicator step-completed';
      el.innerHTML = `✔️ ${el.dataset.title}`;
    } else if (index + 1 === step) {
      el.className = 'step-indicator step-active';
      el.innerHTML = `⚙️ ${el.dataset.title}`;
    } else {
      el.className = 'step-indicator step-pending';
      el.innerHTML = `⏳ ${el.dataset.title}`;
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

// 🌟 تابع جدید و ارتقا یافته لود پروفایل
function loadProfileTab() {
  const content = document.getElementById('panel-content');
  
  // بررسی نقش‌های فعلی کاربر از دیتابیس
  const roles = currentProfile.roles || ['buyer', 'supplier'];
  const isBuyer = roles.includes('buyer') ? 'checked' : '';
  const isSupplier = roles.includes('supplier') ? 'checked' : '';

  // استایل‌های اختصاصی فرم چندمرحله‌ای
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
    <h2 style="font-size: 1.5rem; margin-bottom: 1.5rem;">⚙️ تکمیل پروفایل جامع شرکت</h2>
    
    <!-- نوار پیشرفت مراحل -->
    <div class="step-container">
      <div class="step-indicator" data-title="اطلاعات پایه">اطلاعات پایه</div>
      <div class="step-indicator" data-title="تماس و آدرس">تماس و آدرس</div>
      <div class="step-indicator" data-title="فعالیت و نقش‌ها">فعالیت و نقش‌ها</div>
    </div>

    <div style="background: white; padding: 2.5rem; border-radius: 12px; border: 1px solid var(--color-border); box-shadow: 0 4px 6px rgba(0,0,0,0.02);">
      
      <!-- 🟢 مرحله اول: اطلاعات پایه -->
      <div id="step-1" class="profile-step-content">
        <h3 style="margin-bottom: 1.5rem; color: var(--color-text-main);">۱. اطلاعات هویتی شرکت</h3>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem;">
          <div><label style="font-weight: 600; display:block; margin-bottom:5px;">نام رسمی شرکت *</label><input type="text" class="form-input" value="${currentProfile.name || ''}"></div>
          <div><label style="font-weight: 600; display:block; margin-bottom:5px;">نام انگلیسی (برای صادرات)</label><input type="text" class="form-input" value="${currentProfile.englishName || ''}"></div>
          <div><label style="font-weight: 600; display:block; margin-bottom:5px;">نام تجاری (Brand)</label><input type="text" class="form-input" value="${currentProfile.brand || ''}"></div>
          <div><label style="font-weight: 600; display:block; margin-bottom:5px;">سال تأسیس</label><input type="number" class="form-input" value="${currentProfile.foundedYear || ''}"></div>
          <div style="grid-column: 1 / -1;"><label style="font-weight: 600; display:block; margin-bottom:5px;">معرفی کامل شرکت (درباره ما)</label><textarea class="form-input" rows="4" placeholder="شرکت ما از سال...">${currentProfile.description || ''}</textarea></div>
          <div style="grid-column: 1 / -1;"><label style="font-weight: 600; display:block; margin-bottom:5px;">لوگوی شرکت</label><button class="btn btn-outline" style="width: 200px;">📸 آپلود تصویر جدید</button></div>
        </div>
        <div style="text-align: left; margin-top: 2rem;">
          <button class="btn btn-primary" style="padding: 10px 30px;" onclick="nextProfileStep()">مرحله بعد ➔</button>
        </div>
      </div>

      <!-- 🟢 مرحله دوم: تماس و آدرس -->
      <div id="step-2" class="profile-step-content">
        <h3 style="margin-bottom: 1.5rem; color: var(--color-text-main);">۲. اطلاعات ارتباطی و موقعیت</h3>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem;">
          <div><label style="font-weight: 600; display:block; margin-bottom:5px;">کشور</label><input type="text" class="form-input" value="${currentProfile.country || 'ایران'}"></div>
          <div><label style="font-weight: 600; display:block; margin-bottom:5px;">استان / شهر</label><input type="text" class="form-input" value="${currentProfile.city || ''}"></div>
          <div style="grid-column: 1 / -1;"><label style="font-weight: 600; display:block; margin-bottom:5px;">آدرس دقیق</label><input type="text" class="form-input" value="${currentProfile.address || ''}"></div>
          <div><label style="font-weight: 600; display:block; margin-bottom:5px;">ایمیل سازمانی</label><input type="email" class="form-input" value="${currentProfile.email || ''}"></div>
          <div><label style="font-weight: 600; display:block; margin-bottom:5px;">تلفن ثابت (با کد)</label><input type="text" class="form-input" value="${currentProfile.phone || ''}" dir="ltr"></div>
          <div><label style="font-weight: 600; display:block; margin-bottom:5px;">وب‌سایت</label><input type="url" class="form-input" value="${currentProfile.website || ''}" dir="ltr" placeholder="https://"></div>
          <div><label style="font-weight: 600; display:block; margin-bottom:5px;">واتساپ شرکت</label><input type="text" class="form-input" value="${currentProfile.contact?.whatsapp || ''}" dir="ltr"></div>
        </div>
        <div style="display: flex; justify-content: space-between; margin-top: 2rem;">
          <button class="btn btn-outline" style="padding: 10px 30px;" onclick="prevProfileStep()">🡨 مرحله قبل</button>
          <button class="btn btn-primary" style="padding: 10px 30px;" onclick="nextProfileStep()">مرحله بعد ➔</button>
        </div>
      </div>

      <!-- 🟢 مرحله سوم: نوع فعالیت و نقش‌ها -->
      <div id="step-3" class="profile-step-content">
        <h3 style="margin-bottom: 1.5rem; color: var(--color-text-main);">۳. نوع فعالیت و دسترسی‌ها</h3>
        
        <div style="margin-bottom: 2rem; background: #f8fafc; padding: 1.5rem; border-radius: 8px; border: 1px dashed var(--color-primary);">
          <label style="font-weight: bold; font-size: 1.1rem; display:block; margin-bottom:10px; color: var(--color-primary);">قابلیت‌های حساب کاربری (نقش‌ها)</label>
          <p style="font-size: 0.9rem; color: var(--color-text-muted); margin-bottom: 15px;">با انتخاب هر دو گزینه، با یک ورود به هر دو پنل خریدار و تأمین‌کننده دسترسی خواهید داشت.</p>
          <div class="checkbox-group">
            <label class="checkbox-card"><input type="checkbox" id="role-buyer" ${isBuyer}> من یک خریدار هستم (ارسال RFQ)</label>
            <label class="checkbox-card"><input type="checkbox" id="role-supplier" ${isSupplier}> من یک تأمین‌کننده هستم (فروش محصول)</label>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr; gap: 1.5rem;">
          <div>
            <label style="font-weight: 600; display:block; margin-bottom:10px;">نوع فعالیت شرکت (امکان انتخاب چند مورد)</label>
            <div style="display: flex; flex-wrap: wrap; gap: 10px;">
              <label class="checkbox-card" style="padding: 5px 10px; font-size: 0.9rem;"><input type="checkbox" checked> تولیدکننده</label>
              <label class="checkbox-card" style="padding: 5px 10px; font-size: 0.9rem;"><input type="checkbox"> تأمین‌کننده / عمده‌فروش</label>
              <label class="checkbox-card" style="padding: 5px 10px; font-size: 0.9rem;"><input type="checkbox"> صادرکننده / واردکننده</label>
              <label class="checkbox-card" style="padding: 5px 10px; font-size: 0.9rem;"><input type="checkbox"> شرکت بازرگانی</label>
            </div>
          </div>
          <div><label style="font-weight: 600; display:block; margin-bottom:5px;">صنعت اصلی فعالیت</label><input type="text" class="form-input" value="${currentProfile.industry || ''}"></div>
        </div>

        <div style="display: flex; justify-content: space-between; margin-top: 2rem; border-top: 1px solid var(--color-border); padding-top: 1.5rem;">
          <button class="btn btn-outline" style="padding: 10px 30px;" onclick="prevProfileStep()">🡨 مرحله قبل</button>
          <button class="btn btn-primary" style="padding: 10px 40px; background: #10b981; border-color: #10b981;" onclick="alert('پروفایل شرکت و دسترسی‌های شما با موفقیت ذخیره شد!')">✔️ ذخیره نهایی پروفایل</button>
        </div>
      </div>
    </div>
  `;

  // راه‌اندازی اولیه و نمایش گام ۱
  setTimeout(() => window.showProfileStep(1), 0);
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