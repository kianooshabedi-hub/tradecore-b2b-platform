// js/pages/suppliers.js

import { renderHeader } from '../components/header.js';
import { businesses } from '../data/businesses.js';
import { AppStore } from '../data/appStore.js';

let compareList = [];

document.addEventListener('DOMContentLoaded', () => {
    const headerElement = document.querySelector('header') || document.getElementById('main-header');
    if (headerElement) headerElement.innerHTML = renderHeader();

    renderSuppliersPage();
});

function renderSuppliersPage() {
    const suppliers = businesses.filter(b => !b.roles || b.roles.includes('supplier'));
    const shortlist = AppStore.getSupplierShortlist();

    const locIcon = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-left: 4px; vertical-align: middle;"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>`;
    const starIcon = `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-left: 4px; vertical-align: middle;"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>`;
    const listIcon = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-left: 4px; vertical-align: middle;"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>`;

    const content = `
        <div class="container" style="margin-top: 4rem; margin-bottom: 8rem; position: relative;">
            <div style="text-align: center; margin-bottom: 4rem;">
                <h1 style="font-size: 2.2rem; color: #0f172a; margin-bottom: 1rem;">شبکه تأمین‌کنندگان معتبر TradeCore</h1>
                <p style="color: #64748b; font-size: 1.1rem; max-width: 600px; margin: 0 auto;">بدون واسطه با برترین تولیدکنندگان و تأمین‌کنندگان صنعتی در ارتباط باشید، آن‌ها را در لیست کوتاه (Shortlist) قرار دهید و مستقیماً مقایسه کنید.</p>
            </div>

            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 2rem;">
                ${suppliers.map(biz => {
                    const isShortlisted = shortlist.includes(biz.id);
                    return `
                    <div style="background: white; border: 1px solid #e2e8f0; border-radius: 16px; padding: 2rem; transition: transform 0.3s, box-shadow 0.3s; box-shadow: 0 4px 6px rgba(0,0,0,0.02); text-align: center;" onmouseover="this.style.transform='translateY(-5px)'; this.style.boxShadow='0 12px 20px rgba(0,0,0,0.08)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 6px rgba(0,0,0,0.02)'">
                        
                        <!-- چک‌باکس مقایسه -->
                        <div style="text-align: right; margin-bottom: -20px; position: relative; z-index: 10;">
                            <label style="display: inline-flex; align-items: center; gap: 8px; font-size: 0.85rem; color: #64748b; cursor: pointer;">
                                <input type="checkbox" onchange="toggleCompare('${biz.id}', this.checked)" style="width: 16px; height: 16px; cursor: pointer;">
                                مقایسه
                            </label>
                        </div>

                        <img src="${biz.logo || 'images/default-logo.png'}" alt="${biz.name}" style="width: 90px; height: 90px; border-radius: 50%; object-fit: cover; border: 3px solid #f1f5f9; margin-bottom: 1rem; display: inline-block;">
                        <h3 style="font-size: 1.3rem; margin-bottom: 5px; color: #1e293b;">${biz.name}</h3>
                        <p style="font-size: 0.9rem; color: var(--color-primary); font-weight: 600; margin-bottom: 15px;">${biz.industry || 'صنعت عمومی'}</p>
                        
                        <div style="display: flex; justify-content: center; gap: 10px; margin-bottom: 2rem; font-size: 0.85rem; color: #475569;">
                            <span style="display: inline-flex; align-items: center; background: #f8fafc; border: 1px solid #e2e8f0; padding: 4px 12px; border-radius: 20px;">${locIcon} ${biz.city || 'ایران'}</span>
                            ${biz.status === 'verified' ? `<span style="display: inline-flex; align-items: center; background: #f8fafc; border: 1px solid #e2e8f0; padding: 4px 12px; border-radius: 20px; color: #10b981;">${starIcon} تأیید شده</span>` : ''}
                        </div>
                        
                        <div style="display: flex; gap: 10px;">
                            <a href="business.html?id=${biz.id}" class="btn btn-primary" style="flex: 1; padding: 10px; font-weight: 600;">پروفایل</a>
                            <button class="btn btn-outline" style="flex: 1; padding: 10px; font-weight: 600; border-color: ${isShortlisted ? '#38bdf8' : '#cbd5e1'}; color: ${isShortlisted ? '#0284c7' : '#475569'}; background: ${isShortlisted ? '#f0f9ff' : 'transparent'};" onclick="toggleShortlistFunc('${biz.id}', this)">
                                ${listIcon} ${isShortlisted ? 'در Shortlist' : 'Shortlist'}
                            </button>
                        </div>
                    </div>
                `}).join('')}
            </div>

            <!-- نوار شناور مقایسه (مخفی در ابتدا) -->
            <div id="compare-bar" style="display: none; position: fixed; bottom: 0; left: 0; width: 100%; background: white; padding: 1.5rem 2rem; box-shadow: 0 -10px 25px rgba(0,0,0,0.1); z-index: 1000; border-top: 1px solid var(--color-border); align-items: center; justify-content: space-between; animation: slideUp 0.3s ease-out;">
                <div style="display: flex; align-items: center; gap: 15px;">
                    <div style="background: #eff6ff; color: var(--color-primary); width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 1.2rem;" id="compare-count">0</div>
                    <div>
                        <h4 style="margin: 0; color: #0f172a; font-size: 1.1rem;">شرکت انتخاب شده برای مقایسه</h4>
                        <p style="margin: 0; font-size: 0.85rem; color: #64748b;">حداکثر ۵ شرکت را می‌توانید مقایسه کنید.</p>
                    </div>
                </div>
                <div style="display: flex; gap: 15px;">
                    <button class="btn btn-outline" style="color: #ef4444; border-color: #ef4444;" onclick="clearCompare()">انصراف</button>
                    <button class="btn btn-primary" style="padding: 10px 30px; font-size: 1rem;" onclick="openCompareModal()">مقایسه اطلاعات</button>
                </div>
            </div>
        </div>
        <style>
            @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
        </style>
    `;

    const container = document.getElementById('suppliers-container') || document.querySelector('main');
    if (container) container.innerHTML = content;
}

window.toggleShortlistFunc = (bizId, btn) => {
    const result = AppStore.toggleShortlist(bizId);
    if (result.error) {
        alert(result.error);
        return;
    }
    
    const listIcon = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-left: 4px; vertical-align: middle;"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>`;
    
    if (result.added) {
        btn.innerHTML = listIcon + ' در Shortlist';
        btn.style.borderColor = '#38bdf8';
        btn.style.color = '#0284c7';
        btn.style.background = '#f0f9ff';
    } else {
        btn.innerHTML = listIcon + ' Shortlist';
        btn.style.borderColor = '#cbd5e1';
        btn.style.color = '#475569';
        btn.style.background = 'transparent';
    }
};

window.toggleCompare = (bizId, isChecked) => {
    if (isChecked) {
        if (compareList.length >= 5) {
            alert('حداکثر ۵ تأمین‌کننده قابل انتخاب است.');
            event.target.checked = false;
            return;
        }
        if (!compareList.includes(bizId)) compareList.push(bizId);
    } else {
        compareList = compareList.filter(id => id !== bizId);
    }
    updateCompareBar();
};

window.clearCompare = () => {
    compareList = [];
    document.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);
    updateCompareBar();
};

function updateCompareBar() {
    const bar = document.getElementById('compare-bar');
    const countSpan = document.getElementById('compare-count');
    
    if (compareList.length > 0) {
        bar.style.display = 'flex';
        countSpan.textContent = compareList.length;
    } else {
        bar.style.display = 'none';
    }
}

window.openCompareModal = () => {
    if (compareList.length < 2) {
        alert('برای مقایسه، حداقل ۲ تأمین‌کننده را انتخاب کنید.');
        return;
    }

    const selectedBizs = compareList.map(id => businesses.find(b => b.id === id));
    
    let headersHtml = '<th>پارامتر مقایسه</th>';
    let logosHtml = '<td><strong>نمایه شرکت</strong></td>';
    let countryHtml = '<td style="font-weight: 600; color: #475569;">کشور/شهر</td>';
    let industryHtml = '<td style="font-weight: 600; color: #475569;">صنعت فعالیت</td>';
    let verifyHtml = '<td style="font-weight: 600; color: #475569;">وضعیت تأیید</td>';
    let tierHtml = '<td style="font-weight: 600; color: #475569;">سطح اشتراک</td>';
    let estHtml = '<td style="font-weight: 600; color: #475569;">سال تأسیس</td>';
    let actHtml = '<td><strong>عملیات</strong></td>';

    selectedBizs.forEach(biz => {
        headersHtml += `<th style="text-align: center; color: var(--color-primary); font-size: 1.1rem; width: ${100/selectedBizs.length}%">${biz.name}</th>`;
        logosHtml += `<td style="text-align: center;"><img src="${biz.logo}" style="width: 60px; height: 60px; border-radius: 8px; object-fit: cover; border: 1px solid #e2e8f0;"></td>`;
        countryHtml += `<td style="text-align: center;">${biz.country} - ${biz.city}</td>`;
        industryHtml += `<td style="text-align: center;">${biz.industry}</td>`;
        verifyHtml += `<td style="text-align: center;">${biz.status === 'verified' ? '<span style="color:#10b981; font-weight:bold;">تأیید شده</span>' : '<span style="color:#f59e0b;">در انتظار</span>'}</td>`;
        tierHtml += `<td style="text-align: center; text-transform: uppercase; font-weight: bold; color: #8b5cf6;">${biz.subscriptionTier}</td>`;
        estHtml += `<td style="text-align: center;">${biz.joinDate || 'نامشخص'}</td>`;
        actHtml += `<td style="text-align: center;"><a href="business.html?id=${biz.id}" class="btn btn-primary" style="padding: 6px 12px; font-size: 0.85rem;">مشاهده پروفایل</a></td>`;
    });

    const modalHtml = `
        <div id="compare-modal" class="modal-overlay" style="align-items: flex-start; padding-top: 5vh; overflow-y: auto;">
            <div class="modal-content" style="max-width: 90%; width: 1200px;">
                <div class="modal-header">
                    <h3 style="font-size: 1.3rem;">مقایسه تأمین‌کنندگان</h3>
                    <button class="btn-close" onclick="document.getElementById('compare-modal').remove()"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button>
                </div>
                <div class="modal-body" style="overflow-x: auto; padding: 2rem;">
                    <table class="panel-table" style="width: 100%; border: 1px solid #e2e8f0;">
                        <thead>
                            <tr style="background: #f8fafc;">${headersHtml}</tr>
                        </thead>
                        <tbody>
                            <tr>${logosHtml}</tr>
                            <tr>${countryHtml}</tr>
                            <tr>${industryHtml}</tr>
                            <tr>${verifyHtml}</tr>
                            <tr>${tierHtml}</tr>
                            <tr>${estHtml}</tr>
                            <tr style="background: #f8fafc;">${actHtml}</tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
};