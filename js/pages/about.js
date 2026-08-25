// js/pages/about.js

import { renderHeader } from '../components/header.js';

document.addEventListener('DOMContentLoaded', () => {
    const headerElement = document.querySelector('header') || document.getElementById('main-header');
    if (headerElement) headerElement.innerHTML = renderHeader();

    renderAboutPage();
});

function renderAboutPage() {
    const content = `
        <div class="container" style="margin-top: 4rem; margin-bottom: 6rem; line-height: 1.8;">
            <div style="background: white; border-radius: 24px; padding: 4rem; box-shadow: 0 20px 40px rgba(0,0,0,0.04); border: 1px solid #e2e8f0; text-align: center;">
                
                <h1 style="font-size: 3rem; color: #0f172a; margin-bottom: 1.5rem; font-weight: 900; letter-spacing: -1px;">
                    آینده تجارت صنعتی با <span style="color: var(--color-primary);">TradeCore</span>
                </h1>
                
                <p style="font-size: 1.2rem; color: #475569; max-width: 800px; margin: 0 auto 4rem;">
                    پلتفرم جامع تجارت الکترونیک B2B؛ جایی که برترین تولیدکنندگان، تأمین‌کنندگان و خریداران عمده، بدون واسطه و در یک بستر امن با یکدیگر تجارت می‌کنند.
                </p>
                
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 2rem; text-align: right; margin-top: 3rem;">
                    <div style="padding: 2.5rem; background: #f8fafc; border-radius: 16px; border: 1px solid #e2e8f0; transition: 0.3s;" onmouseover="this.style.borderColor='var(--color-primary)'" onmouseout="this.style.borderColor='#e2e8f0'">
                        <div style="margin-bottom: 1.5rem; display: flex;">
                            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                        </div>
                        <h3 style="font-size: 1.3rem; color: #1e293b; margin-bottom: 10px;">ارتباط بی‌واسطه</h3>
                        <p style="font-size: 0.95rem; color: #64748b;">مستقیماً با تولیدکنندگان وارد مذاکره شوید، درخواست استعلام (RFQ) ارسال کنید و بهترین قیمت را دریافت نمایید.</p>
                    </div>
                    
                    <div style="padding: 2.5rem; background: #f8fafc; border-radius: 16px; border: 1px solid #e2e8f0; transition: 0.3s;" onmouseover="this.style.borderColor='var(--color-primary)'" onmouseout="this.style.borderColor='#e2e8f0'">
                        <div style="margin-bottom: 1.5rem; display: flex;">
                            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                        </div>
                        <h3 style="font-size: 1.3rem; color: #1e293b; margin-bottom: 10px;">امنیت و اعتبارسنجی</h3>
                        <p style="font-size: 0.95rem; color: #64748b;">تمامی شرکت‌های فعال در پلتفرم از نظر هویتی و مدارک تجاری بررسی شده‌اند تا تجارتی امن را تجربه کنید.</p>
                    </div>
                    
                    <div style="padding: 2.5rem; background: #f8fafc; border-radius: 16px; border: 1px solid #e2e8f0; transition: 0.3s;" onmouseover="this.style.borderColor='var(--color-primary)'" onmouseout="this.style.borderColor='#e2e8f0'">
                        <div style="margin-bottom: 1.5rem; display: flex;">
                            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
                        </div>
                        <h3 style="font-size: 1.3rem; color: #1e293b; margin-bottom: 10px;">توسعه صادرات</h3>
                        <p style="font-size: 0.95rem; color: #64748b;">با ایجاد یک پروفایل حرفه‌ای و دوزبانه، محصولات خود را به خریداران داخلی و خارجی معرفی کنید.</p>
                    </div>
                </div>

                <div style="margin-top: 5rem; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 4rem;">
                    <h2 style="font-size: 2rem; color: #0f172a; margin-bottom: 1rem; font-weight: 800;">همین حالا شبکه تجاری خود را گسترش دهید</h2>
                    <p style="color: #64748b; margin-bottom: 2.5rem; font-size: 1.1rem;">پیوستن به TradeCore رایگان است.</p>
                    <div style="display: flex; gap: 15px; justify-content: center;">
                        <a href="buyer-panel.html" class="btn btn-primary" style="padding: 12px 30px; font-size: 1.1rem;">ورود خریداران</a>
                        <a href="seller-panel.html" class="btn btn-primary" style="padding: 12px 30px; font-size: 1.1rem;">ثبت شرکت به عنوان تأمین‌کننده</a>
                    </div>
                </div>

            </div>
        </div>
    `;

    const container = document.getElementById('about-container') || document.querySelector('main');
    if (container) container.innerHTML = content;
}