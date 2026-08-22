// js/components/header.js

export function renderHeader() {
  return `
    <div class="container" style="display: flex; justify-content: space-between; align-items: center; height: 100%;">
      <div class="logo">
        <a href="index.html">TradeCore <span class="text-accent">B2B</span></a>
      </div>
      
      <div style="display: flex; gap: var(--space-md); align-items: center;">
        <!-- دکمه‌ها رو تغییر دادیم تا تابع سوئیچ اکانت رو صدا بزنن -->
        <button class="btn btn-outline" onclick="openAccountSwitcher('buyer-panel.html')">پنل خریدار</button>
        <button class="btn btn-primary" onclick="openAccountSwitcher('seller-panel.html')">پنل تأمین‌کننده</button>
      </div>
    </div>
  `;
}

// اضافه کردن توابع گلوبال برای تغییر حساب کاربری
window.openAccountSwitcher = (targetPage) => {
  const modalHtml = `
    <div id="account-switcher-modal" class="modal-overlay">
      <div class="modal-content" style="max-width: 400px; text-align: center;">
        <div class="modal-header">
          <h3>ورود به پنل به عنوان...</h3>
          <button class="btn-close" onclick="document.getElementById('account-switcher-modal').remove()">✖</button>
        </div>
        <div class="modal-body" style="display: flex; flex-direction: column; gap: 15px;">
          <button class="btn btn-outline" onclick="switchAccount('biz-1', '${targetPage}')">🏭 شرکت صنایع بسته‌بندی پویا نگار</button>
          <button class="btn btn-outline" onclick="switchAccount('biz-2', '${targetPage}')">⚓ شرکت اورین روان (PAGO)</button>
          <button class="btn btn-outline" onclick="switchAccount('biz-3', '${targetPage}')">⚙️ آرین پترو ایده (API)</button>
        </div>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', modalHtml);
};

window.switchAccount = (bizId, targetPage) => {
  localStorage.setItem('tradecore_active_user', bizId);
  window.location.href = targetPage;
};