// js/pages/auth.js

import { AppStore } from '../data/appStore.js';
import { businesses } from '../data/businesses.js';

document.addEventListener('DOMContentLoaded', () => {
    initAuth();
});

function initAuth() {
    // منطق جابجایی بین تب‌های ورود و ثبت‌نام
    const tabs = document.querySelectorAll('.auth-tab');
    const forms = document.querySelectorAll('.auth-form');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            forms.forEach(f => f.classList.remove('active'));
            
            tab.classList.add('active');
            const targetId = tab.getAttribute('data-target') + '-form';
            document.getElementById(targetId).classList.add('active');
        });
    });

    // پر کردن لیست اکانت‌های نمایشی (برای دسترسی سریع در دمو)
    const demoSelect = document.getElementById('demo-login-select');
    if (demoSelect) {
        demoSelect.innerHTML = businesses.map(biz => {
            const tierText = biz.subscriptionTier === 'free' ? '[رایگان]' : '[پریمیوم]';
            return `<option value="${biz.id}">${biz.name} ${tierText}</option>`;
        }).join('');
    }

    // هندل کردن دکمه ورود سریع (دمو)
    const btnDemoLogin = document.getElementById('btn-demo-login');
    if (btnDemoLogin) {
        btnDemoLogin.addEventListener('click', () => {
            const selectedId = demoSelect.value;
            AppStore.setActiveUserId(selectedId); // تنظیم شناسه کاربر فعال در لوکال استوریج
            window.location.href = 'index.html'; // انتقال به صفحه اصلی
        });
    }

    // هندل کردن فرم ورود اصلی (در نسخه MVP فقط حالت نمایشی دارد)
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const identifier = document.getElementById('login-identifier').value;
            const password = document.getElementById('login-password').value;

            if (!identifier || !password) {
                alert('لطفاً ایمیل و رمز عبور را وارد کنید.');
                return;
            }

            // در نسخه واقعی اینجا درخواست به API ارسال می‌شود (Fetch/Axios)
            alert('در نسخه دمو، لطفاً از منوی "ورود سریع" استفاده کنید. پردازش امنیتی رمز عبور در نسخه بک‌اند انجام خواهد شد.');
        });
    }

    // هندل کردن فرم ثبت‌نام شرکت جدید
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const company = document.getElementById('reg-company').value;
            const email = document.getElementById('reg-email').value;
            const phone = document.getElementById('reg-phone').value;
            const password = document.getElementById('reg-password').value;
            
            if(!company || !email || !password || !phone) {
                alert('لطفاً تمامی فیلدها را به دقت تکمیل کنید.');
                return;
            }

            // استخراج نقش‌های انتخابی
            const roles = [];
            if(document.getElementById('reg-role-buyer').checked) roles.push('buyer');
            if(document.getElementById('reg-role-supplier').checked) roles.push('supplier');
            if(document.getElementById('reg-role-service').checked) roles.push('service_provider');

            if (roles.length === 0) {
                alert('باید حداقل یک نقش (خریدار، تأمین‌کننده یا خدمات) را انتخاب کنید.');
                return;
            }

            // شبیه‌سازی ارسال درخواست به سرور
            const submitBtn = registerForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'در حال اعتبارسنجی و ساخت حساب...';
            submitBtn.disabled = true;

            setTimeout(() => {
                // پاک کردن فرم پس از تایید
                registerForm.reset();
                
                alert('اطلاعات با موفقیت ثبت شد! در نسخه نهایی، پس از اعتبارسنجی ایمیل و شماره موبایل، مستقیماً وارد پنل خواهید شد.');
                
                // بازگشت به حالت اولیه
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
                
                // سوئیچ خودکار به تب لاگین برای ادامه مسیر در دمو
                document.querySelector('.auth-tab[data-target="login"]').click();
            }, 1200);
        });
    }
}