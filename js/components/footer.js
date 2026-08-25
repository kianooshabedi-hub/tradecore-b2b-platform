// js/components/footer.js

export function renderFooter() {
  return `
    <div class="container footer-container">
      <div class="footer-grid">
        <div class="footer-about">
          <h3>TradeCore B2B</h3>
          <p>پلتفرم جامع ارتباط بی‌واسطه خریداران و تولیدکنندگان در سطح جهانی. ما تجارت بین‌المللی را ساده، امن و هوشمند می‌کنیم.</p>
        </div>
        
        <div class="footer-links">
          <h4>دسترسی سریع</h4>
          <ul>
            <li><a href="about.html">درباره ما</a></li>
            <li><a href="seller-panel.html">ثبت شرکت</a></li>
            <li><a href="products.html?category=all">درخواست قیمت (RFQ)</a></li>
          </ul>
        </div>

        <div class="footer-contact">
          <h4>پشتیبانی</h4>
          <p><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-left: 6px;"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg> support@tradecore.local</p>
          <p><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-left: 6px;"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg> ۰۲۱-۱۲۳۴۵۶۷۸</p>
        </div>
      </div>
    </div>
    <div class="footer-bottom">
      <p>&copy; 2026 TradeCore B2B. تمامی حقوق محفوظ است.</p>
    </div>
  `;
}