// js/pages/sellerPanel.js
import { AppStore } from '../data/appStore.js'; // 👈 این خط باید اضافه بشه
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
  const profileStatus = AppStore.getProfileCompletionStatus(); 

  const tasksHtml = profileStatus.missingTasks.length > 0 
    ? `<ul style="margin-top: 10px; font-size: 0.85rem; color: #ef4444; padding-right: 20px;">
        ${profileStatus.missingTasks.map(task => `<li>${task}</li>`).join('')}
       </ul>`
    : `<p style="margin-top: 10px; font-size: 0.9rem; color: #10b981;">🎉 پروفایل شرکت شما کامل است!</p>`;

  content.innerHTML = `
    <h1 style="font-size: 1.8rem; margin-bottom: 1.5rem;">خلاصه وضعیت فروشگاه شما</h1>
    
    <!-- 🌟 ویجت درصد تکمیل پروفایل (مخصوص فروشنده) -->
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
        <p style="color: var(--color-text-muted); font-size: 0.9rem;">برای جذب خریداران بیشتر و اعتمادسازی، اطلاعات شرکت و محصولات خود را کامل کنید.</p>
        ${tasksHtml}
      </div>
      <div style="margin-right: auto;">
        <!-- دکمه اتصال به تب پروفایل فروشنده -->
        <button class="btn btn-primary" onclick="document.querySelector('[data-tab=\\'company-profile\\']').click()">تکمیل پروفایل</button>
      </div>
    </div>

    <!-- آمارهای اختصاصی فروشگاه -->
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
      <button class="btn btn-primary" onclick="loadAddProductForm()">+ افزودن محصول جدید</button>
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

// ==========================================
// 🌟 سیستم فرم چند مرحله‌ای ثبت محصول جدید
// ==========================================

window.currentProdStep = 1;

window.showProdStep = (step) => {
  document.querySelectorAll('.prod-step-content').forEach(el => el.style.display = 'none');
  document.getElementById(`prod-step-${step}`).style.display = 'block';

  document.querySelectorAll('.prod-step-indicator').forEach((el, index) => {
    if (index + 1 < step) {
      el.className = 'step-indicator prod-step-indicator step-completed';
      el.innerHTML = `✔️ ${el.dataset.title}`;
    } else if (index + 1 === step) {
      el.className = 'step-indicator prod-step-indicator step-active';
      el.innerHTML = `📦 ${el.dataset.title}`;
    } else {
      el.className = 'step-indicator prod-step-indicator step-pending';
      el.innerHTML = `⏳ ${el.dataset.title}`;
    }
  });
  window.currentProdStep = step;
};

window.nextProdStep = () => { if(currentProdStep < 5) showProdStep(currentProdStep + 1); };
window.prevProdStep = () => { if(currentProdStep > 1) showProdStep(currentProdStep - 1); };

// اضافه کردن سطر داینامیک برای مشخصات فنی
window.addTechSpecRow = () => {
  const container = document.getElementById('tech-specs-container');
  const row = document.createElement('div');
  row.style = "display: flex; gap: 10px; margin-bottom: 10px;";
  row.innerHTML = `
    <input type="text" class="form-input" placeholder="ویژگی (مثلاً جنس، ولتاژ)" style="flex:1;">
    <input type="text" class="form-input" placeholder="مقدار (مثلاً مس، 220V)" style="flex:2;">
    <button class="btn btn-outline" style="color:#ef4444; border-color:#ef4444; padding:0 15px;" onclick="this.parentElement.remove()">✖</button>
  `;
  container.appendChild(row);
};

// تابع اصلی رندر کردن فرم محصول
window.loadAddProductForm = () => {
  const content = document.getElementById('panel-content');
  
  content.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
      <h2 style="font-size: 1.5rem;">📦 ثبت محصول جدید</h2>
      <button class="btn btn-outline" onclick="loadProductsTab()">✖ انصراف و بازگشت</button>
    </div>
    
    <!-- نوار پیشرفت -->
    <div class="step-container" style="display: flex; justify-content: space-between; margin-bottom: 2rem; background: var(--color-surface); padding: 10px; border-radius: 8px; border: 1px solid var(--color-border);">
      <div class="step-indicator prod-step-indicator" data-title="پایه">پایه</div>
      <div class="step-indicator prod-step-indicator" data-title="توضیحات">توضیحات</div>
      <div class="step-indicator prod-step-indicator" data-title="فنی">فنی</div>
      <div class="step-indicator prod-step-indicator" data-title="گواهی‌ها">گواهی‌ها</div>
      <div class="step-indicator prod-step-indicator" data-title="تجاری">تجاری</div>
    </div>

    <div style="background: white; padding: 2rem; border-radius: 12px; border: 1px solid var(--color-border); box-shadow: 0 4px 6px rgba(0,0,0,0.02);">
      
      <!-- 🟢 گام ۱: اطلاعات پایه -->
      <div id="prod-step-1" class="prod-step-content">
        <h3 style="margin-bottom: 1.5rem;">۱. اطلاعات پایه محصول</h3>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem;">
          <div><label style="font-weight: 600; display:block; margin-bottom:5px;">نام محصول *</label><input type="text" class="form-input" placeholder="مثال: روغن موتور تمام سنتتیک"></div>
          <div><label style="font-weight: 600; display:block; margin-bottom:5px;">نام انگلیسی</label><input type="text" class="form-input" placeholder="Full Synthetic Motor Oil"></div>
          <div><label style="font-weight: 600; display:block; margin-bottom:5px;">دسته‌بندی اصلی</label><select class="form-input"><option>روانکارها</option><option>برق و الکترونیک</option></select></div>
          <div><label style="font-weight: 600; display:block; margin-bottom:5px;">برند</label><input type="text" class="form-input"></div>
          <div><label style="font-weight: 600; display:block; margin-bottom:5px;">کد محصول / مدل</label><input type="text" class="form-input"></div>
          <div><label style="font-weight: 600; display:block; margin-bottom:5px;">کشور سازنده</label><input type="text" class="form-input" value="ایران"></div>
          <div style="grid-column: 1 / -1;"><label style="font-weight: 600; display:block; margin-bottom:5px;">تصویر اصلی محصول</label><button class="btn btn-outline" style="width:100%;">📸 انتخاب تصویر</button></div>
        </div>
        <div style="text-align: left; margin-top: 2rem;"><button class="btn btn-primary" style="padding: 10px 30px;" onclick="nextProdStep()">مرحله بعد ➔</button></div>
      </div>

      <!-- 🟢 گام ۲: توضیحات -->
      <div id="prod-step-2" class="prod-step-content">
        <h3 style="margin-bottom: 1.5rem;">۲. توضیحات و معرفی</h3>
        <div style="display: grid; grid-template-columns: 1fr; gap: 1.5rem;">
          <div><label style="font-weight: 600; display:block; margin-bottom:5px;">توضیح کوتاه (نمایش در لیست‌ها)</label><textarea class="form-input" rows="2"></textarea></div>
          <div><label style="font-weight: 600; display:block; margin-bottom:5px;">توضیح کامل محصول</label><textarea class="form-input" rows="5"></textarea></div>
          <div><label style="font-weight: 600; display:block; margin-bottom:5px;">کاربردهای اصلی</label><input type="text" class="form-input" placeholder="صنایع سنگین، خودروسازی، ..."></div>
        </div>
        <div style="display: flex; justify-content: space-between; margin-top: 2rem;">
          <button class="btn btn-outline" onclick="prevProdStep()">🡨 مرحله قبل</button>
          <button class="btn btn-primary" onclick="nextProdStep()">مرحله بعد ➔</button>
        </div>
      </div>

      <!-- 🟢 گام ۳: مشخصات فنی (داینامیک) -->
      <div id="prod-step-3" class="prod-step-content">
        <h3 style="margin-bottom: 1.5rem;">۳. مشخصات فنی تخصصی</h3>
        <p style="font-size: 0.9rem; color: var(--color-text-muted); margin-bottom: 15px;">ویژگی‌های فنی محصول را بر اساس نوع آن (مثلاً ولتاژ برای تجهیزات برقی یا گرانروی برای روانکارها) اضافه کنید.</p>
        
        <div id="tech-specs-container">
          <!-- سطرهای مشخصات اینجا اضافه میشن -->
          <div style="display: flex; gap: 10px; margin-bottom: 10px;">
            <input type="text" class="form-input" placeholder="ویژگی (مثلاً جنس)" style="flex:1;">
            <input type="text" class="form-input" placeholder="مقدار (مثلاً مس)" style="flex:2;">
            <button class="btn btn-outline" style="color:#ef4444; border-color:#ef4444; padding:0 15px;" onclick="this.parentElement.remove()">✖</button>
          </div>
        </div>
        
        <button class="btn btn-outline" style="margin-top: 10px; border-style: dashed; width: 100%;" onclick="addTechSpecRow()">+ افزودن ویژگی جدید</button>

        <div style="display: flex; justify-content: space-between; margin-top: 2rem;">
          <button class="btn btn-outline" onclick="prevProdStep()">🡨 مرحله قبل</button>
          <button class="btn btn-primary" onclick="nextProdStep()">مرحله بعد ➔</button>
        </div>
      </div>

      <!-- 🟢 گام ۴: گواهینامه‌ها -->
      <div id="prod-step-4" class="prod-step-content">
        <h3 style="margin-bottom: 1.5rem;">۴. استانداردها و مدارک</h3>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem;">
          <div><label style="font-weight: 600; display:block; margin-bottom:5px;">نام استاندارد / گواهی</label><input type="text" class="form-input" placeholder="مثال: ISO 9001 یا API SN"></div>
          <div><label style="font-weight: 600; display:block; margin-bottom:5px;">سازمان صادرکننده</label><input type="text" class="form-input"></div>
          <div><label style="font-weight: 600; display:block; margin-bottom:5px;">تاریخ انقضا</label><input type="date" class="form-input"></div>
          <div><label style="font-weight: 600; display:block; margin-bottom:5px;">فایل ضمیمه</label><button class="btn btn-outline" style="width:100%;">📎 آپلود گواهی/کاتالوگ</button></div>
        </div>
        <div style="display: flex; justify-content: space-between; margin-top: 2rem;">
          <button class="btn btn-outline" onclick="prevProdStep()">🡨 مرحله قبل</button>
          <button class="btn btn-primary" onclick="nextProdStep()">مرحله بعد ➔</button>
        </div>
      </div>

      <!-- 🟢 گام ۵: اطلاعات تجاری و ثبت -->
      <div id="prod-step-5" class="prod-step-content">
        <h3 style="margin-bottom: 1.5rem;">۵. اطلاعات تجاری</h3>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem;">
          <div><label style="font-weight: 600; display:block; margin-bottom:5px;">نوع قیمت‌گذاری</label><select class="form-input"><option>قابل مذاکره (پیش‌فرض)</option><option>قیمت ثابت</option></select></div>
          <div><label style="font-weight: 600; display:block; margin-bottom:5px;">حداقل مقدار سفارش (MOQ)</label><div style="display:flex; gap:10px;"><input type="number" class="form-input" style="flex:2;"><select class="form-input" style="flex:1;"><option>عدد</option><option>تن</option><option>بشکه</option></select></div></div>
          <div><label style="font-weight: 600; display:block; margin-bottom:5px;">زمان آماده‌سازی</label><input type="text" class="form-input" placeholder="مثلاً: 14 روز کاری"></div>
          <div><label style="font-weight: 600; display:block; margin-bottom:5px;">نوع بسته‌بندی</label><input type="text" class="form-input"></div>
          <div style="grid-column: 1 / -1;"><label style="font-weight: 600; display:block; margin-bottom:5px;">شرایط پرداخت و تحویل</label><textarea class="form-input" rows="2" placeholder="EXW, FOB, LC, T/T ..."></textarea></div>
        </div>
        
        <div style="display: flex; justify-content: space-between; margin-top: 2rem; border-top: 1px solid var(--color-border); padding-top: 1.5rem;">
          <button class="btn btn-outline" onclick="prevProdStep()">🡨 مرحله قبل</button>
          <div style="display:flex; gap:10px;">
            <button class="btn btn-outline" onclick="alert('محصول به عنوان پیش‌نویس ذخیره شد.'); loadProductsTab();">💾 ذخیره پیش‌نویس</button>
            <button class="btn btn-primary" style="background:#10b981; border-color:#10b981;" onclick="alert('محصول با موفقیت در سیستم ثبت و منتشر شد.'); loadProductsTab();">✔️ ثبت و انتشار محصول</button>
          </div>
        </div>
      </div>

    </div>
  `;
  setTimeout(() => window.showProdStep(1), 0);
};