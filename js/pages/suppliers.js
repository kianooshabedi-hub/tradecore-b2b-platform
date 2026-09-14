// js/pages/suppliers.js

import { renderHeader } from '../components/header.js';
import { businesses } from '../data/businesses.js';
import { AppStore } from '../data/appStore.js';

document.addEventListener('DOMContentLoaded', () => {
    const headerElement = document.querySelector('header') || document.getElementById('main-header');
    if (headerElement) headerElement.innerHTML = renderHeader();

    window.renderSuppliersPage();
});

// 🌟 دکمه مقایسه با اعمال محدودیت 5 عددی شرکت‌ها
window.toggleSupCompare = (bizId, btn, event) => {
    if(event) { event.preventDefault(); event.stopPropagation(); }
    
    const currentList = AppStore.getSupplierShortlist();
    const isCurrentlyAdded = currentList.includes(bizId);

    // کنترل محدودیت 5 تایی (اگر آیتم جدید است و لیست پر است)
    if (!isCurrentlyAdded && currentList.length >= 5) {
        alert('حداکثر ۵ شرکت برای مقایسه همزمان قابل انتخاب است. جهت مقایسه موارد جدید، لطفاً موارد قبلی را از لیست خود در داشبورد حذف کنید.');
        return;
    }

    const result = AppStore.toggleShortlist(bizId);
    if (result.error) {
        alert(result.error);
        return;
    }

    if (result.added) {
        btn.classList.remove('btn-outline');
        btn.classList.add('btn-primary');
        btn.style.backgroundColor = '#1e293b';
        btn.style.borderColor = '#1e293b';
        btn.style.color = '#fff';
        btn.innerHTML = '✓ حذف از لیست مقایسه';
    } else {
        btn.classList.remove('btn-primary');
        btn.classList.add('btn-outline');
        btn.style.backgroundColor = 'rgba(255,255,255,0.9)';
        btn.style.borderColor = '#cbd5e1';
        btn.style.color = '#475569';
        btn.innerHTML = '+ افزودن به لیست مقایسه';
    }
};

window.renderSuppliersPage = () => {
    const suppliers = businesses.filter(b => !b.roles || b.roles.includes('supplier'));
    const shortlist = AppStore.getSupplierShortlist() || [];

    const locIcon = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-left: 4px; vertical-align: middle;"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>`;
    const starIcon = `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-left: 4px; vertical-align: middle;"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>`;

    const content = `
        <div class="container" style="margin-top: 4rem; margin-bottom: 4rem; position: relative;">
            <div style="text-align: center; margin-bottom: 4rem;">
                <h1 style="font-size: 2.2rem; color: #0f172a; margin-bottom: 1rem;">شبکه تأمین‌کنندگان معتبر TradeCore</h1>
                <p style="color: #64748b; font-size: 1.1rem; max-width: 600px; margin: 0 auto;">بدون واسطه با برترین تولیدکنندگان و تأمین‌کنندگان در ارتباط باشید و آن‌ها را به لیست مقایسه پنل خود اضافه کنید.</p>
            </div>

            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 2rem;">
                ${suppliers.map(biz => {
                    const isShortlisted = shortlist.includes(biz.id);
                    
                    const compareBtnHtml = isShortlisted 
                        ? `<button class="btn btn-primary" style="position: absolute; top: 15px; left: 15px; padding: 4px 10px; font-size: 0.75rem; background: #1e293b; border-color: #1e293b; color: #fff; z-index: 10;" onclick="window.toggleSupCompare('${biz.id}', this, event)">✓ حذف از لیست مقایسه</button>`
                        : `<button class="btn btn-outline" style="position: absolute; top: 15px; left: 15px; padding: 4px 10px; font-size: 0.75rem; color: #475569; border-color: #cbd5e1; background: rgba(255,255,255,0.9); z-index: 10;" onclick="window.toggleSupCompare('${biz.id}', this, event)">+ افزودن به لیست مقایسه</button>`;

                    return `
                    <div style="background: white; border: 1px solid #e2e8f0; border-radius: 16px; padding: 2rem; position: relative; transition: transform 0.3s, box-shadow 0.3s; box-shadow: 0 4px 6px rgba(0,0,0,0.02); text-align: center;" onmouseover="this.style.transform='translateY(-5px)'; this.style.boxShadow='0 12px 20px rgba(0,0,0,0.08)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 6px rgba(0,0,0,0.02)'">
                        
                        ${compareBtnHtml}

                        <img src="${biz.logo || 'images/default-logo.png'}" alt="${biz.name}" style="width: 90px; height: 90px; border-radius: 50%; object-fit: cover; border: 3px solid #f1f5f9; margin-bottom: 1rem; display: inline-block;">
                        <h3 style="font-size: 1.3rem; margin-bottom: 5px; color: #1e293b;">${biz.name}</h3>
                        <p style="font-size: 0.9rem; color: var(--color-primary); font-weight: 600; margin-bottom: 15px;">${biz.industry || 'صنعت عمومی'}</p>
                        
                        <div style="display: flex; justify-content: center; gap: 10px; margin-bottom: 2rem; font-size: 0.85rem; color: #475569;">
                            <span style="display: inline-flex; align-items: center; background: #f8fafc; border: 1px solid #e2e8f0; padding: 4px 12px; border-radius: 20px;">${locIcon} ${biz.city || 'ایران'}</span>
                            ${biz.status === 'verified' ? `<span style="display: inline-flex; align-items: center; background: #f8fafc; border: 1px solid #e2e8f0; padding: 4px 12px; border-radius: 20px; color: #10b981;">${starIcon} تأیید شده</span>` : ''}
                        </div>
                        
                        <div style="display: flex; gap: 10px;">
                            <a href="business.html?id=${biz.id}" class="btn btn-primary btn-full" style="padding: 10px; font-weight: 600;">پروفایل شرکت</a>
                        </div>
                    </div>
                `}).join('')}
            </div>
        </div>
    `;

    const container = document.getElementById('suppliers-container') || document.querySelector('main');
    if (container) container.innerHTML = content;
}