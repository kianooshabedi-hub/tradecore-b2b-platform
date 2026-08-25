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
          <p>📧 support@tradecore.local</p>
          <p>📞 ۰۲۱-۱۲۳۴۵۶۷۸</p>
        </div>
      </div>
    </div>
    <div class="footer-bottom">
      <p>&copy; 2026 TradeCore B2B. تمامی حقوق محفوظ است.</p>
    </div>
  `;
}