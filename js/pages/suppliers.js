// js/pages/suppliers.js

import { renderHeader } from '../components/header.js';
import { businesses } from '../data/businesses.js';

document.addEventListener('DOMContentLoaded', () => {
    // رندر کردن هدر
    const headerElement = document.querySelector('header') || document.getElementById('main-header');
    if (headerElement) headerElement.innerHTML = renderHeader();

    renderSuppliersPage();
});

function renderSuppliersPage() {
    // فیلتر کردن شرکت‌هایی که نقش تأمین‌کننده دارند
    const suppliers = businesses.filter(b => !b.roles || b.roles.includes('supplier'));

    const content = `
        <div class="container" style="margin-top: 4rem; margin-bottom: 6rem;">
            <div style="text-align: center; margin-bottom: 4rem;">
                <h1 style="font-size: 2.2rem; color: #0f172a; margin-bottom: 1rem;">شبکه تأمین‌کنندگان معتبر TradeCore</h1>
                <p style="color: #64748b; font-size: 1.1rem; max-width: 600px; margin: 0 auto;">بدون واسطه با برترین تولیدکنندگان و تأمین‌کنندگان صنعتی در ارتباط باشید و مستقیماً استعلام قیمت بگیرید.</p>
            </div>

            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 2rem;">
                ${suppliers.map(biz => `
                    <div style="background: white; border: 1px solid #e2e8f0; border-radius: 16px; padding: 2rem; transition: transform 0.3s, box-shadow 0.3s; box-shadow: 0 4px 6px rgba(0,0,0,0.02); text-align: center;" onmouseover="this.style.transform='translateY(-5px)'; this.style.boxShadow='0 12px 20px rgba(0,0,0,0.08)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 6px rgba(0,0,0,0.02)'">
                        <img src="${biz.logo || 'images/default-logo.png'}" alt="${biz.name}" style="width: 90px; height: 90px; border-radius: 50%; object-fit: cover; border: 3px solid #f1f5f9; margin-bottom: 1rem; display: inline-block;">
                        <h3 style="font-size: 1.3rem; margin-bottom: 5px; color: #1e293b;">${biz.name}</h3>
                        <p style="font-size: 0.9rem; color: var(--color-primary); font-weight: 600; margin-bottom: 15px;">${biz.industry || 'صنعت عمومی'}</p>
                        
                        <div style="display: flex; justify-content: center; gap: 10px; margin-bottom: 2rem; font-size: 0.85rem; color: #475569;">
                            <span style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 4px 12px; border-radius: 20px;">📍 ${biz.city || 'ایران'}</span>
                            <span style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 4px 12px; border-radius: 20px;">⭐ تأیید شده</span>
                        </div>
                        
                        <a href="business.html?id=${biz.id}" class="btn btn-outline btn-full" style="padding: 10px; font-weight: 600; border-color: #cbd5e1;">مشاهده پروفایل و محصولات</a>
                    </div>
                `).join('')}
            </div>
        </div>
    `;

    const container = document.getElementById('suppliers-container') || document.querySelector('main');
    if (container) container.innerHTML = content;
}