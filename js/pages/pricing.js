// js/pages/pricing.js

import { renderHeader } from '../components/header.js';
import { renderFooter } from '../components/footer.js';
import { AppStore } from '../data/appStore.js';

document.addEventListener('DOMContentLoaded', () => {
    const headerElement = document.getElementById('main-header');
    if (headerElement) headerElement.innerHTML = renderHeader();

    const footerElement = document.getElementById('app-footer');
    if (footerElement) footerElement.innerHTML = renderFooter();

    renderPricingPage();
});

function renderPricingPage() {
    // گرفتن اطلاعات کاربر فعلی برای نمایش "پلن فعلی شما"
    const currentProfile = AppStore.getActiveUserProfile();
    const currentTier = currentProfile ? currentProfile.subscriptionTier : 'free';

    // 🌟 ساختار منعطف پلن‌ها (آماده برای جایگزینی با API بک‌اند در آینده)
    const plans = [
        {
            id: 'free',
            name: 'رایگان (Free)',
            price: '۰',
            period: 'همیشه',
            description: 'مناسب برای آشنایی با پلتفرم و ارزیابی اولیه خریداران.',
            features: [
                { text: 'ثبت حداکثر ۱۰ محصول/خدمت', included: true },
                { text: 'ارسال ۵ پیام یا استعلام در ماه', included: true },
                { text: 'مشاهده اطلاعات تماس شرکت‌ها', included: false },
                { text: 'دسترسی به رادار هوشمند معاملات', included: false },
                { text: 'پشتیبانی اختصاصی', included: false }
            ],
            buttonText: currentTier === 'free' ? 'پلن فعلی شما' : 'شروع رایگان',
            isPopular: false
        },
        {
            id: 'basic',
            name: 'پایه (Basic)',
            price: '۴۹۰,۰۰۰',
            period: 'ماهیانه',
            description: 'برای کسب‌وکارهای در حال رشد و نیازمند ارتباط مستقیم.',
            features: [
                { text: 'ثبت حداکثر ۵۰ محصول/خدمت', included: true },
                { text: 'ارسال ۵۰ پیام یا استعلام در ماه', included: true },
                { text: 'مشاهده اطلاعات تماس شرکت‌ها', included: true },
                { text: 'دسترسی به رادار هوشمند معاملات', included: false },
                { text: 'پشتیبانی اختصاصی', included: false }
            ],
            buttonText: currentTier === 'basic' ? 'پلن فعلی شما' : 'خرید اشتراک پایه',
            isPopular: false
        },
        {
            id: 'pro',
            name: 'حرفه‌ای (Pro)',
            price: '۱,۴۹۰,۰۰۰',
            period: 'ماهیانه',
            description: 'پیشنهاد ویژه برای توسعه بازار و شکار فرصت‌های پیمانکاری.',
            features: [
                { text: 'ثبت حداکثر ۲۰۰ محصول/خدمت', included: true },
                { text: 'ارسال ۵۰۰ پیام در ماه', included: true },
                { text: 'مشاهده اطلاعات تماس شرکت‌ها', included: true },
                { text: 'دسترسی به رادار هوشمند معاملات', included: true },
                { text: 'پشتیبانی تیکتینگ سریع', included: true }
            ],
            buttonText: currentTier === 'pro' ? 'پلن فعلی شما' : 'خرید اشتراک حرفه‌ای',
            isPopular: true // این ویژگی باعث هایلایت شدن کارت در UI می‌شود
        },
        {
            id: 'enterprise',
            name: 'سازمانی (Enterprise)',
            price: 'تماس بگیرید',
            period: 'سالیانه',
            description: 'برای هلدینگ‌ها و شرکت‌های نیازمند ظرفیت نامحدود.',
            features: [
                { text: 'ثبت نامحدود محصول/خدمت', included: true },
                { text: 'ارسال نامحدود پیام و پروپوزال', included: true },
                { text: 'مشاهده اطلاعات تماس شرکت‌ها', included: true },
                { text: 'دسترسی کامل به رادار معاملات', included: true },
                { text: 'مدیر حساب اختصاصی (Account Manager)', included: true }
            ],
            buttonText: currentTier === 'enterprise' ? 'پلن فعلی شما' : 'ارتباط با واحد فروش',
            isPopular: false
        }
    ];

    // تولید کدهای HTML برای چک‌مارک‌ها
    const iconCheck = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="margin-left: 8px;"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
    const iconCross = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-left: 8px;"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`;

    const cardsHtml = plans.map(plan => {
        const isActivePlan = currentTier === plan.id;
        
        // استایل‌دهی کارت ویژه (Pro)
        const cardStyle = plan.isPopular 
            ? 'background: white; border: 2px solid var(--color-primary); box-shadow: 0 20px 25px -5px rgba(30, 64, 175, 0.1); transform: scale(1.02);' 
            : 'background: white; border: 1px solid var(--color-border); box-shadow: 0 4px 6px rgba(0,0,0,0.02);';
        
        const badgeHtml = plan.isPopular 
            ? `<div style="position: absolute; top: -14px; left: 50%; transform: translateX(-50%); background: var(--color-primary); color: white; padding: 4px 16px; border-radius: 20px; font-size: 0.8rem; font-weight: bold; white-space: nowrap;">پیشنهاد ویژه</div>` 
            : '';

        const buttonClass = isActivePlan 
            ? 'btn-outline' 
            : (plan.isPopular ? 'btn-primary' : 'btn-outline');
            
        const buttonDisabled = isActivePlan ? 'disabled style="opacity: 0.7; cursor: not-allowed;"' : '';

        const featuresHtml = plan.features.map(f => `
            <li style="display: flex; align-items: center; margin-bottom: 12px; color: ${f.included ? 'var(--color-text-main)' : '#94a3b8'}; font-size: 0.95rem;">
                ${f.included ? iconCheck : iconCross} ${f.text}
            </li>
        `).join('');

        return `
            <div style="position: relative; border-radius: 16px; padding: 2rem; display: flex; flex-direction: column; ${cardStyle}">
                ${badgeHtml}
                <div style="text-align: center; margin-bottom: 2rem; border-bottom: 1px solid var(--color-border); padding-bottom: 1.5rem;">
                    <h3 style="font-size: 1.3rem; color: var(--color-text-main); margin-bottom: 10px;">${plan.name}</h3>
                    <p style="color: var(--color-text-muted); font-size: 0.9rem; min-height: 45px;">${plan.description}</p>
                    <div style="margin-top: 1.5rem;">
                        <span style="font-size: 2.2rem; font-weight: 900; color: var(--color-text-main);">${plan.price}</span>
                        ${plan.price !== 'تماس بگیرید' ? `<span style="color: var(--color-text-muted); font-size: 0.9rem;">تومان / ${plan.period}</span>` : ''}
                    </div>
                </div>
                
                <ul style="flex-grow: 1; padding: 0; margin: 0 0 2rem 0; list-style: none;">
                    ${featuresHtml}
                </ul>
                
                <div style="margin-top: auto;">
                    <button class="btn ${buttonClass} btn-full" ${buttonDisabled} onclick="handleUpgradeClick('${plan.id}', '${plan.name}')">
                        ${plan.buttonText}
                    </button>
                </div>
            </div>
        `;
    }).join('');

    const contentHtml = `
        <div class="container">
            <div style="text-align: center; margin-bottom: 4rem;">
                <h1 style="font-size: 2.5rem; color: #0f172a; margin-bottom: 1rem; font-weight: 900;">ارتقای کسب‌وکار با امکانات پریمیوم</h1>
                <p style="color: #64748b; font-size: 1.1rem; max-width: 600px; margin: 0 auto;">پلن مناسب با اندازه و نیازهای شرکت خود را انتخاب کنید. امکان تغییر یا لغو اشتراک در هر زمان وجود دارد.</p>
            </div>
            
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 1.5rem; align-items: stretch;">
                ${cardsHtml}
            </div>

            <!-- بخش سوالات متداول (FAQ) به عنوان ارزش افزوده صفحه -->
            <div style="margin-top: 6rem; max-width: 800px; margin-left: auto; margin-right: auto;">
                <h2 style="text-align: center; font-size: 1.8rem; margin-bottom: 2rem;">سوالات متداول</h2>
                
                <div style="background: white; border: 1px solid var(--color-border); border-radius: 8px; margin-bottom: 1rem; padding: 1.5rem;">
                    <h4 style="margin-bottom: 10px; color: var(--color-text-main);">آیا برای ارتقای پلن محدودیت زمانی وجود دارد؟</h4>
                    <p style="color: var(--color-text-muted); font-size: 0.95rem; margin: 0;">خیر، شما می‌توانید در هر زمان از دوره اشتراک خود، پلن خود را به سطوح بالاتر (Basic یا Pro) ارتقا دهید. هزینه پرداختی قبلی شما روی پلن جدید محاسبه کسر خواهد شد.</p>
                </div>

                <div style="background: white; border: 1px solid var(--color-border); border-radius: 8px; margin-bottom: 1rem; padding: 1.5rem;">
                    <h4 style="margin-bottom: 10px; color: var(--color-text-main);">منظور از "رادار هوشمند معاملات" در پلن Pro چیست؟</h4>
                    <p style="color: var(--color-text-muted); font-size: 0.95rem; margin: 0;">رادار معاملات ابزاری اختصاصی برای شرکت‌های ارائه‌دهنده خدمات (مانند لجستیک و بیمه) است که اجازه می‌دهد معاملات در حال انجامِ بین خریداران و فروشندگان را مشاهده کرده و برای آن‌ها پیشنهاد همکاری ارسال کنند.</p>
                </div>
            </div>
        </div>
    `;

    const container = document.getElementById('pricing-container');
    if (container) container.innerHTML = contentHtml;
}

// 🌟 اکسپورت کردن تابع برای استفاده در دکمه‌ها
window.handleUpgradeClick = (planId, planName) => {
    // در نسخه واقعی اینجا کاربر به درگاه پرداخت یا صفحه صدور پیش‌فاکتور هدایت می‌شود
    if (planId === 'enterprise') {
        alert(`درخواست مشاوره برای پلن ${planName} ثبت شد. کارشناسان ما به زودی با شما تماس خواهند گرفت.`);
    } else {
        alert(`در نسخه نهایی، شما برای خرید اشتراک "${planName}" به درگاه امن بانکی هدایت می‌شوید.`);
    }
};