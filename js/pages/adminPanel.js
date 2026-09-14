// js/pages/adminPanel.js

import { AdminService } from '../services/adminService.js';
import { AppStore } from '../data/appStore.js';
import { AdminStore } from '../data/adminStore.js'; 
import { businesses } from '../data/businesses.js';
import { products } from '../data/products.js';
import { categories } from '../data/categories.js';
import { ArticleService } from '../services/articleService.js'; 
import { SupportService } from '../services/supportService.js'; 
import { ReviewService } from '../services/reviewService.js';
import { FeaturedContentService } from '../services/featuredContentService.js'; 

// متغیر سراسری برای نگهداری وضعیت فیلتر جدول شرکت‌ها
window.adminCompanyFilter = 'all';

document.addEventListener('DOMContentLoaded', () => {
    initAdminPanel();
});

function initAdminPanel() {
    if (!AdminService.verifyAdminAccess()) {
        alert('عدم دسترسی! شما مجوز ورود به این بخش را ندارید.');
        window.location.href = 'index.html';
        return;
    }

    const adminMenu = document.querySelector('.admin-menu');
    
    // حذف اتوماتیک تب قدیمی "تأیید شرکت‌ها" از HTML بدون نیاز به دستکاری فایل HTML
    const oldApprovalsTab = document.querySelector('[data-tab="approvals"]');
    if (oldApprovalsTab) oldApprovalsTab.remove();
    
    // تزریق تب پشتیبانی
    if (adminMenu && !document.querySelector('[data-tab="support"]')) {
        const auditLink = document.querySelector('[data-tab="audit"]');
        if(auditLink) {
            const supportHtml = `<a href="#" data-tab="support"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg> پشتیبانی کاربران</a>`;
            auditLink.insertAdjacentHTML('beforebegin', supportHtml);
        }
    }

    // تزریق تب مدیریت نظرات
    if (adminMenu && !document.querySelector('[data-tab="reviews"]')) {
        const supportLink = document.querySelector('[data-tab="support"]');
        const reviewsHtml = `<a href="#" data-tab="reviews"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg> مدیریت نظرات</a>`;
        if (supportLink) supportLink.insertAdjacentHTML('afterend', reviewsHtml);
        else adminMenu.insertAdjacentHTML('beforeend', reviewsHtml);
    }

    // تزریق تب جایگاه‌های ویژه (Featured)
    if (adminMenu && !document.querySelector('[data-tab="featured"]')) {
        const productsLink = document.querySelector('[data-tab="products"]');
        const featuredHtml = `<a href="#" data-tab="featured"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg> مارکتینگ و جایگاه ویژه</a>`;
        if (productsLink) productsLink.insertAdjacentHTML('beforebegin', featuredHtml);
    }

    loadTab('dashboard');
    setupGlobalSearch(); 
    setupAdminNotifications(); 

    const navLinks = document.querySelectorAll('.admin-sidebar a');
    navLinks.forEach(link => {
        if(link.getAttribute('href') === 'index.html') return; 
        link.addEventListener('click', (e) => {
            e.preventDefault();
            navLinks.forEach(l => l.classList.remove('active'));
            e.currentTarget.classList.add('active');
            
            const tab = e.currentTarget.getAttribute('data-tab');
            loadTab(tab);
        });
    });
}

function setupAdminNotifications() {
    const bell = document.querySelector('.admin-bell');
    if(!bell) return;
    
    bell.removeAttribute('onclick');
    
    const dropdownHtml = `
        <div id="admin-notif-dropdown" style="display: none; position: absolute; top: 140%; left: -10px; width: 340px; background: white; border: 1px solid #e2e8f0; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.15); z-index: 10000; flex-direction: column; overflow: hidden; cursor: default;">
            <div style="padding: 15px; border-bottom: 1px solid #e2e8f0; background: #f8fafc; font-weight: bold; color: #0f172a; text-align: right;">
                آخرین فعالیت‌های سیستم
            </div>
            <div id="admin-notif-list" style="max-height: 300px; overflow-y: auto;"></div>
            <div style="padding: 10px; text-align: center; border-top: 1px solid #e2e8f0; background: #f8fafc;">
                <a href="#" style="font-size: 0.85rem; color: var(--color-primary); text-decoration: none; font-weight: bold;" onclick="document.querySelector('[data-tab=\\'audit\\']').click(); document.getElementById('admin-notif-dropdown').style.display='none'; return false;">مشاهده همه لاگ‌ها</a>
            </div>
        </div>
    `;
    bell.insertAdjacentHTML('beforeend', dropdownHtml);

    bell.addEventListener('click', (e) => {
        const drop = document.getElementById('admin-notif-dropdown');
        if(drop.style.display === 'flex') {
            drop.style.display = 'none';
        } else {
            drop.style.display = 'flex';
            const logs = AdminStore.getAuditLogs().slice(0, 5);
            const list = document.getElementById('admin-notif-list');
            if(logs.length === 0) {
                list.innerHTML = '<div style="padding: 20px; text-align: center; color: #64748b; font-size: 0.85rem;">اعلان جدیدی وجود ندارد.</div>';
            } else {
                list.innerHTML = logs.map(log => `
                    <div style="padding: 12px 15px; border-bottom: 1px solid #f1f5f9; text-align: right; transition: 0.2s;" onmouseover="this.style.backgroundColor='#f8fafc'" onmouseout="this.style.backgroundColor='transparent'">
                        <div style="font-size: 0.85rem; font-weight: 600; color: #1e293b; margin-bottom: 4px;">${log.action}</div>
                        <div style="font-size: 0.8rem; color: #64748b; line-height: 1.4;">${log.description}</div>
                        <div style="font-size: 0.7rem; color: #94a3b8; margin-top: 5px;" dir="ltr">${new Date(log.timestamp).toLocaleTimeString('fa-IR')}</div>
                    </div>
                `).join('');
            }
            const badge = bell.querySelector('.admin-bell-badge');
            if(badge) badge.style.display = 'none';
        }
    });

    document.addEventListener('click', (e) => {
        const drop = document.getElementById('admin-notif-dropdown');
        if(drop && drop.style.display === 'flex' && !bell.contains(e.target)) drop.style.display = 'none';
    });
}

function setupGlobalSearch() {
    const searchInput = document.querySelector('.admin-search input');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();
            const tableRows = document.querySelectorAll('.panel-table tbody tr');
            tableRows.forEach(row => {
                if(row.cells.length <= 1) return; 
                const rowText = row.textContent.toLowerCase();
                row.style.display = rowText.includes(query) ? '' : 'none';
            });
        });
    }
}

// 🌟 اضافه کردن این خط برای دسترسی کلیک‌های HTML به تابع لود تب‌ها 🌟
window.loadTab = loadTab;

async function loadTab(tabName) {
    const contentDiv = document.getElementById('admin-content');
    contentDiv.innerHTML = '<div style="text-align: center; padding: 4rem; color: #64748b;">در حال پردازش داده‌ها...</div>';

    const searchInput = document.querySelector('.admin-search input');
    if(searchInput) searchInput.value = ''; 

    // بروزرسانی رنگ تب فعال در منو
    document.querySelectorAll('.admin-sidebar a').forEach(a => a.classList.remove('active'));
    const targetLink = document.querySelector(`[data-tab="${tabName}"]`);
    if(targetLink) targetLink.classList.add('active');

    if (tabName === 'dashboard') await renderDashboard(contentDiv);
    else if (tabName === 'companies') await renderCompanies(contentDiv);
    else if (tabName === 'products') await renderProducts(contentDiv);
    else if (tabName === 'categories') await renderCategories(contentDiv);
    else if (tabName === 'articles') await renderAdminArticles(contentDiv); 
    else if (tabName === 'transactions') await renderTransactions(contentDiv);
    else if (tabName === 'subscriptions') await renderSubscriptions(contentDiv);
    else if (tabName === 'audit') await renderAuditLog(contentDiv);
    else if (tabName === 'settings') await renderSettings(contentDiv);
    else if (tabName === 'support') await renderSupportTickets(contentDiv); 
    else if (tabName === 'reviews') await renderReviewsManagement(contentDiv);
    else if (tabName === 'featured') await renderFeaturedManagement(contentDiv);
}

// ==========================================
// 🌟 داشبورد با کارت‌های قابل کلیک
// ==========================================
async function renderDashboard(container) {
    const stats = await AdminService.getDashboardStats();
    container.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
            <h1 style="font-size: 1.8rem; color: #0f172a; font-weight: 800;">داشبورد کلان پلتفرم</h1>
            <button class="btn btn-primary" style="background: #0f172a; border-color: #0f172a;" onclick="alert('خروجی گزارش CSV در حال تولید...')"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-left: 6px;"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg> دانلود گزارش (CSV)</button>
        </div>
        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.5rem; margin-bottom: 2rem;">
            
            <div class="stat-card" style="cursor: pointer; transition: 0.2s;" onmouseover="this.style.transform='translateY(-5px)'" onmouseout="this.style.transform='translateY(0)'" onclick="window.loadTab('companies')">
                <div class="stat-icon" style="background: #e0f2fe; color: #0284c7;"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg></div>
                <div><h3 style="font-size: 0.85rem; color: #64748b; text-transform: uppercase;">کل شرکت‌ها</h3><div style="font-size: 1.8rem; font-weight: 800; color: #0f172a;">${stats.companies.total}</div></div>
            </div>
            
            <div class="stat-card" style="cursor: pointer; transition: 0.2s;" onmouseover="this.style.transform='translateY(-5px)'" onmouseout="this.style.transform='translateY(0)'" onclick="window.loadTab('products')">
                <div class="stat-icon" style="background: #fef3c7; color: #d97706;"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path></svg></div>
                <div><h3 style="font-size: 0.85rem; color: #64748b; text-transform: uppercase;">محصولات فعال</h3><div style="font-size: 1.8rem; font-weight: 800; color: #0f172a;">${stats.products.active}</div></div>
            </div>
            
            <div class="stat-card" style="cursor: pointer; transition: 0.2s;" onmouseover="this.style.transform='translateY(-5px)'" onmouseout="this.style.transform='translateY(0)'" onclick="window.loadTab('transactions')">
                <div class="stat-icon" style="background: #d1fae5; color: #059669;"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"></polyline></svg></div>
                <div><h3 style="font-size: 0.85rem; color: #64748b; text-transform: uppercase;">معاملات در جریان</h3><div style="font-size: 1.8rem; font-weight: 800; color: #0f172a;">${stats.transactions.activeDeals}</div></div>
            </div>
            
            <div class="stat-card" style="cursor: pointer; transition: 0.2s;" onmouseover="this.style.transform='translateY(-5px)'" onmouseout="this.style.transform='translateY(0)'" onclick="window.loadTab('subscriptions')">
                <div class="stat-icon" style="background: #fdf4ff; color: #c026d3;"><svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg></div>
                <div><h3 style="font-size: 0.85rem; color: #64748b; text-transform: uppercase;">اکانت‌های پریمیوم</h3><div style="font-size: 1.8rem; font-weight: 800; color: #0f172a;">${stats.system.activeSubscriptions}</div></div>
            </div>
            
        </div>
    `;
}
window.setAdminCompanyFilter = (val) => {
    window.adminCompanyFilter = val;
    loadTab('companies');
};

// ==========================================
// 🌟 سیستم یکپارچه مدیریت شرکت‌ها
// ==========================================
async function renderCompanies(container) {
    let allCompanies = await AdminService.getAllCompanies();
    
    // فیلتر سافت دیلیت‌ها (محذف شده‌ها)
    allCompanies = allCompanies.filter(c => c.status !== 'deleted');

    // اعمال فیلتر بالای صفحه
    if (window.adminCompanyFilter !== 'all') {
        allCompanies = allCompanies.filter(c => c.status === window.adminCompanyFilter);
    }

    container.innerHTML = `
        <div class="admin-table-wrapper">
            <div class="admin-table-toolbar" style="flex-wrap: wrap; gap: 15px; background: white;">
                <h2 style="font-size: 1.2rem; color: #0f172a; margin: 0;">لیست یکپارچه و بررسی صلاحیت شرکت‌ها</h2>
                
                <div style="display: flex; gap: 10px; background: #f1f5f9; padding: 4px; border-radius: 8px;">
                    <button class="btn ${window.adminCompanyFilter === 'all' ? 'btn-primary' : 'btn-outline'}" style="padding: 4px 12px; font-size: 0.85rem; border: none; box-shadow: none;" onclick="window.setAdminCompanyFilter('all')">همه</button>
                    <button class="btn ${window.adminCompanyFilter === 'pending' ? 'btn-primary' : 'btn-outline'}" style="padding: 4px 12px; font-size: 0.85rem; border: none; box-shadow: none;" onclick="window.setAdminCompanyFilter('pending')">در انتظار</button>
                    <button class="btn ${window.adminCompanyFilter === 'verified' ? 'btn-primary' : 'btn-outline'}" style="padding: 4px 12px; font-size: 0.85rem; border: none; box-shadow: none;" onclick="window.setAdminCompanyFilter('verified')">تایید شده</button>
                    <button class="btn ${window.adminCompanyFilter === 'suspended' ? 'btn-primary' : 'btn-outline'}" style="padding: 4px 12px; font-size: 0.85rem; border: none; box-shadow: none;" onclick="window.setAdminCompanyFilter('suspended')">تعلیق شده</button>
                    <button class="btn ${window.adminCompanyFilter === 'rejected' ? 'btn-primary' : 'btn-outline'}" style="padding: 4px 12px; font-size: 0.85rem; border: none; box-shadow: none;" onclick="window.setAdminCompanyFilter('rejected')">عدم تایید</button>
                </div>
            </div>
            <table class="panel-table">
                <thead>
                    <tr>
                        <th>نام شرکت و برند</th>
                        <th>صنعت اصلی</th>
                        <th>سطح دسترسی (Role)</th>
                        <th>وضعیت</th>
                        <th>عملیات مدیریتی</th>
                    </tr>
                </thead>
                <tbody>
                    ${allCompanies.length > 0 ? allCompanies.map(biz => {
                        let statusBadge = '';
                        if (biz.status === 'verified') statusBadge = '<span class="badge-success" style="padding: 2px 8px; border-radius: 4px;">تایید شده</span>';
                        else if (biz.status === 'pending') statusBadge = '<span class="badge-warning" style="padding: 2px 8px; border-radius: 4px;">در انتظار بررسی</span>';
                        else if (biz.status === 'suspended') statusBadge = '<span class="badge-warning" style="background:#ffedd5; color:#ea580c; padding: 2px 8px; border-radius: 4px;">تعلیق شده</span>';
                        else if (biz.status === 'rejected') statusBadge = `<span class="badge-danger" style="padding: 2px 8px; border-radius: 4px;" title="${biz.rejectionReason || ''}">عدم تایید</span>`;

                        let roleText = [];
                        if(biz.roles.includes('buyer')) roleText.push('خریدار');
                        if(biz.roles.includes('supplier')) roleText.push('تأمین‌کننده');
                        if(biz.roles.includes('service_provider')) roleText.push('خدمات');
                        
                        // ساختار هوشمند دکمه‌ها بر اساس وضعیت
                        let actionsHtml = `<div style="display: flex; gap: 5px; flex-wrap: wrap; justify-content: flex-end;">`;
                        
                        if (biz.status === 'pending' || biz.status === 'rejected') {
                            actionsHtml += `<button class="btn btn-primary" style="padding: 4px 8px; font-size: 0.75rem; background: #10b981; border-color: #10b981;" onclick="confirmAdminAction('approve_company', '${biz.id}')">تایید</button>`;
                            actionsHtml += `<button class="btn btn-outline" style="padding: 4px 8px; font-size: 0.75rem; color: #ef4444; border-color: #ef4444;" onclick="confirmAdminAction('reject_company', '${biz.id}')">عدم تایید</button>`;
                        } else if (biz.status === 'verified') {
                            actionsHtml += `<button class="btn btn-outline" style="padding: 4px 8px; font-size: 0.75rem; color: #ea580c; border-color: #ea580c;" onclick="confirmAdminAction('suspend_company', '${biz.id}')">تعلیق</button>`;
                        } else if (biz.status === 'suspended') {
                            actionsHtml += `<button class="btn btn-primary" style="padding: 4px 8px; font-size: 0.75rem; background: #10b981; border-color: #10b981;" onclick="confirmAdminAction('approve_company', '${biz.id}')">رفع تعلیق</button>`;
                            actionsHtml += `<button class="btn btn-outline" style="padding: 4px 8px; font-size: 0.75rem; color: #ef4444; border-color: #ef4444;" onclick="confirmAdminAction('delete_company', '${biz.id}')">حذف دائم</button>`;
                        }
                        actionsHtml += `<a href="business.html?id=${biz.id}" target="_blank" class="btn btn-outline" style="padding: 4px 8px; font-size: 0.75rem; text-decoration: none;">پروفایل</a></div>`;

                        return `
                        <tr>
                            <td>
                                <div style="font-weight: 700; color: #1e293b;">${biz.name}</div>
                                <div style="font-size: 0.8rem; color: #64748b;">${biz.email || 'ثبت نشده'}</div>
                            </td>
                            <td style="color: #475569; font-size: 0.9rem;">${biz.industry}</td>
                            <td><span style="background: #f1f5f9; padding: 2px 8px; border-radius: 4px; font-size: 0.8rem;">${roleText.join('، ')}</span></td>
                            <td>${statusBadge}</td>
                            <td>${actionsHtml}</td>
                        </tr>
                        `;
                    }).join('') : `<tr><td colspan="5" style="text-align: center; padding: 2rem; color:#64748b;">موردی در این وضعیت یافت نشد.</td></tr>`}
                </tbody>
            </table>
        </div>
    `;
}

// ==========================================
// 🌟 داشبورد مالی و لایسنس‌ها (Subscriptions)
// ==========================================
async function renderSubscriptions(container) {
    // داده‌های نمایشی برای داشبورد مالی بر اساس شرکت‌های ثبت شده در سیستم
    const activeSubs = businesses.filter(b => b.subscriptionTier !== 'free');
    const subsData = activeSubs.map(b => ({
        id: b.id, 
        name: b.name, 
        tier: b.subscriptionTier,
        date: "1402/10/15", 
        expiry: "1403/10/15",
        price: b.subscriptionTier === 'pro' ? '۱,۴۹۰,۰۰۰' : (b.subscriptionTier === 'basic' ? '۴۹۰,۰۰۰' : 'توافقی')
    }));

    container.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
            <h2 style="font-size: 1.5rem; color: #0f172a; font-weight: 800;">مدیریت مالی و اشتراک‌ها</h2>
            <button class="btn btn-primary" onclick="alert('اتصال به درگاه بانکی در فاز نهایی انجام می‌پذیرد.')">تنظیمات درگاه</button>
        </div>
        
        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.5rem; margin-bottom: 2rem;">
            <div class="stat-card" style="border-left: 4px solid #10b981;">
                <div><h3 style="font-size: 0.85rem; color: #64748b;">درآمد ماهانه (تومان)</h3><div style="font-size: 1.5rem; font-weight: 900; color: #10b981;">۱۲,۴۵۰,۰۰۰</div></div>
            </div>
            <div class="stat-card" style="border-left: 4px solid #3b82f6;">
                <div><h3 style="font-size: 0.85rem; color: #64748b;">پلن پایه (Basic)</h3><div style="font-size: 1.8rem; font-weight: 900; color: #3b82f6;">${businesses.filter(b=>b.subscriptionTier==='basic').length}</div></div>
            </div>
            <div class="stat-card" style="border-left: 4px solid #8b5cf6;">
                <div><h3 style="font-size: 0.85rem; color: #64748b;">پلن حرفه‌ای (Pro)</h3><div style="font-size: 1.8rem; font-weight: 900; color: #8b5cf6;">${businesses.filter(b=>b.subscriptionTier==='pro').length}</div></div>
            </div>
            <div class="stat-card" style="border-left: 4px solid #0f172a;">
                <div><h3 style="font-size: 0.85rem; color: #64748b;">سازمانی (Enterprise)</h3><div style="font-size: 1.8rem; font-weight: 900; color: #0f172a;">${businesses.filter(b=>b.subscriptionTier==='enterprise').length}</div></div>
            </div>
        </div>

        <div class="admin-table-wrapper">
            <div class="admin-table-toolbar">
                <h3 style="margin: 0; font-size: 1.1rem;">لیست اشتراک‌های فعال (کاربران پریمیوم)</h3>
                <span style="font-size: 0.8rem; color: #64748b;">برای تغییر دستی لایسنس کاربران، از منوی "ویرایش پروفایل" اقدام کنید.</span>
            </div>
            <table class="panel-table">
                <thead>
                    <tr>
                        <th>شرکت / کاربر</th>
                        <th>نوع پلن</th>
                        <th>مبلغ پرداختی</th>
                        <th>تاریخ شروع</th>
                        <th>تاریخ انقضا</th>
                        <th>وضعیت تراکنش</th>
                    </tr>
                </thead>
                <tbody>
                    ${subsData.length > 0 ? subsData.map(s => `
                        <tr>
                            <td style="font-weight: 600; color: var(--color-primary);">${s.name}</td>
                            <td><span style="background:#f3e8ff; color:#7e22ce; padding:4px 10px; border-radius:12px; font-weight:bold; text-transform:uppercase; font-size:0.8rem;">${s.tier}</span></td>
                            <td style="font-weight:bold; color:#334155;">${s.price} ${s.price !== 'توافقی' ? 'تومان' : ''}</td>
                            <td style="color:#64748b;" dir="ltr">${s.date}</td>
                            <td style="color:#ef4444; font-weight:bold;" dir="ltr">${s.expiry}</td>
                            <td><span class="badge-success" style="padding: 2px 8px; border-radius: 4px; font-size: 0.8rem;">موفق</span></td>
                        </tr>
                    `).join('') : '<tr><td colspan="6" style="text-align:center; padding: 2rem;">اشتراک فعالی در سیستم وجود ندارد.</td></tr>'}
                </tbody>
            </table>
        </div>
    `;
}

let currentAction = null;

// هندلینگ هوشمند مودال تایید برای تمام سناریوهای مدیریتی
window.confirmAdminAction = (actionType, entityId) => {
    const modal = document.getElementById('admin-modal');
    const title = document.getElementById('modal-title');
    const desc = document.getElementById('modal-desc');
    const input = document.getElementById('modal-input');
    const icon = document.getElementById('modal-icon');
    
    currentAction = { type: actionType, id: entityId };
    input.style.display = 'none';
    input.value = '';

    if (actionType === 'approve_company') {
        icon.innerHTML = `<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin: 0 auto;"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`;
        title.textContent = 'تایید هویت و انتشار';
        desc.textContent = `آیا از تایید نهایی این شرکت و نمایش آن در پلتفرم اطمینان دارید؟`;
    } 
    else if (actionType === 'suspend_company') {
        icon.innerHTML = `<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ea580c" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin: 0 auto;"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`;
        title.textContent = 'تعلیق موقت فعالیت شرکت';
        desc.textContent = `لطفاً دلیل تعلیق را جهت اطلاع کاربر و ثبت در لاگ وارد کنید.`;
        input.style.display = 'block';
        input.placeholder = 'دلیل تعلیق شرکت...';
    }
    else if (actionType === 'reject_company') {
        icon.innerHTML = `<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin: 0 auto;"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>`;
        title.textContent = 'عدم تایید (رد صلاحیت)';
        desc.textContent = `دلیل عدم تایید مدارک و هویت شرکت را برای اطلاع کاربر بنویسید.`;
        input.style.display = 'block';
        input.placeholder = 'دلیل رد صلاحیت...';
    }
    else if (actionType === 'delete_company') {
        icon.innerHTML = `<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin: 0 auto;"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>`;
        title.textContent = 'حذف دائمی شرکت';
        desc.textContent = `اخطار: این عملیات شرکت را به صورت کامل از پایگاه داده پنهان می‌کند و غیرقابل بازگشت است.`;
    }
    else if (actionType === 'suspend_product') {
        icon.innerHTML = `<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin: 0 auto;"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`;
        title.textContent = 'غیرفعال‌سازی محصول';
        desc.textContent = `آیا از غیرفعال کردن این محصول اطمینان دارید؟ محصول از لیست‌ها پنهان خواهد شد.`;
    }
    else if (actionType === 'activate_product') {
        icon.innerHTML = `<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin: 0 auto;"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`;
        title.textContent = 'فعال‌سازی محصول';
        desc.textContent = `آیا از تایید و انتشار این محصول در پلتفرم اطمینان دارید؟`;
    }

    modal.classList.add('show');
};

window.closeAdminModal = () => {
    document.getElementById('admin-modal').classList.remove('show');
    currentAction = null;
};

document.getElementById('modal-confirm-btn').addEventListener('click', async () => {
    if(!currentAction) return;

    const btn = document.getElementById('modal-confirm-btn');
    const originalText = btn.textContent;
    btn.textContent = 'در حال پردازش...';
    btn.disabled = true;

    const reason = document.getElementById('modal-input').value;

    if (currentAction.type === 'approve_company') {
        await AdminService.changeCompanyStatus(currentAction.id, 'verified');
        loadTab('companies');
    } 
    else if (currentAction.type === 'suspend_company') {
        if(!reason) { alert('وارد کردن دلیل تعلیق الزامی است.'); btn.textContent = originalText; btn.disabled = false; return; }
        await AdminService.changeCompanyStatus(currentAction.id, 'suspended', reason);
        loadTab('companies');
    }
    else if (currentAction.type === 'reject_company') {
        if(!reason) { alert('وارد کردن دلیل عدم تایید الزامی است.'); btn.textContent = originalText; btn.disabled = false; return; }
        await AdminService.changeCompanyStatus(currentAction.id, 'rejected', reason);
        loadTab('companies');
    }
    else if (currentAction.type === 'delete_company') {
        await AdminService.changeCompanyStatus(currentAction.id, 'deleted'); // استفاده از مکانیزم Soft Delete
        loadTab('companies');
    }
    else if (currentAction.type === 'suspend_product') {
        await AdminService.changeProductStatus(currentAction.id, 'suspended');
        loadTab('products');
    }
    else if (currentAction.type === 'activate_product') {
        await AdminService.changeProductStatus(currentAction.id, 'active');
        loadTab('products');
    }

    window.closeAdminModal();
    btn.textContent = originalText;
    btn.disabled = false;
});

// ==========================================
// 🌟 بقیه ماژول‌ها بدون تغییر دست نخورده باقی ماندند
// ==========================================

async function renderProducts(container) {
    let allProducts = await AdminService.getAllProducts();
    container.innerHTML = `
        <div class="admin-table-wrapper">
            <div class="admin-table-toolbar">
                <h2 style="font-size: 1.2rem; color: #0f172a; margin: 0;">نظارت بر محصولات و خدمات</h2>
            </div>
            <table class="panel-table">
                <thead>
                    <tr>
                        <th>تصویر</th>
                        <th>نام محصول / کد</th>
                        <th>فروشنده مالک</th>
                        <th>دسته‌بندی</th>
                        <th>وضعیت</th>
                        <th>عملیات</th>
                    </tr>
                </thead>
                <tbody>
                    ${allProducts.map(prod => {
                        let statusBadge = prod.status === 'active' ? '<span class="badge-success" style="padding: 2px 8px; border-radius: 4px;">منتشر شده</span>' : 
                                          (prod.status === 'suspended' ? '<span class="badge-warning" style="padding: 2px 8px; border-radius: 4px;">غیرفعال</span>' : 
                                          '<span class="badge-gray" style="padding: 2px 8px; border-radius: 4px;">در انتظار</span>');
                        let actionBtn = prod.status === 'active' 
                            ? `<button class="btn btn-outline" style="padding: 4px 8px; font-size: 0.75rem; color: #f59e0b; border-color: #f59e0b;" onclick="confirmAdminAction('suspend_product', '${prod.id}')">غیرفعال کردن</button>`
                            : `<button class="btn btn-primary" style="padding: 4px 8px; font-size: 0.75rem; background: #10b981; border-color: #10b981;" onclick="confirmAdminAction('activate_product', '${prod.id}')">فعال کردن</button>`;
                        return `
                        <tr>
                            <td><img src="${prod.image}" style="width: 40px; height: 40px; border-radius: 6px; object-fit: cover;"></td>
                            <td>
                                <div style="font-weight: 600; color: #1e293b;">${prod.name}</div>
                                <div style="font-size: 0.8rem; color: #64748b;">${prod.brand || 'بدون برند'}</div>
                            </td>
                            <td style="font-weight: bold; color: var(--color-primary); font-size: 0.9rem;">${prod.supplierName}</td>
                            <td style="color: #475569; font-size: 0.85rem;">${prod.categoryName || 'مشخص نشده'}</td>
                            <td>${statusBadge}</td>
                            <td>
                                ${actionBtn}
                                <a href="product.html?id=${prod.id}" target="_blank" class="btn btn-outline" style="padding: 4px 8px; font-size: 0.75rem; text-decoration: none;">مشاهده</a>
                            </td>
                        </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        </div>
    `;
}

window.openCategoryModal = (catId = null) => {
    let cat = null;
    if (catId) cat = categories.find(c => c.id === catId);
    const modalHtml = `
        <div id="cat-modal" class="modal-overlay" style="z-index: 10000;">
            <div class="modal-content">
                <div class="modal-header">
                    <h3>${cat ? 'ویرایش دسته‌بندی' : 'افزودن دسته‌بندی جدید'}</h3>
                    <button class="btn-close" onclick="document.getElementById('cat-modal').remove()"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button>
                </div>
                <div class="modal-body" style="text-align: right;">
                    <input type="hidden" id="cat-id" value="${cat ? cat.id : ''}">
                    <label style="font-weight: bold; margin-bottom:5px; display:block;">نام دسته‌بندی *</label>
                    <input type="text" id="cat-name" class="form-input" value="${cat ? cat.name : ''}" style="margin-bottom:15px;">
                    <label style="font-weight: bold; margin-bottom:5px; display:block;">توضیحات</label>
                    <textarea id="cat-desc" class="form-input" rows="3" style="margin-bottom:15px;">${cat ? cat.description : ''}</textarea>
                    <label style="font-weight: bold; margin-bottom:5px; display:block;">کد SVG آیکون (اختیاری)</label>
                    <textarea id="cat-icon" class="form-input" rows="2" style="margin-bottom:15px;" dir="ltr">${cat ? cat.icon : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle></svg>'}</textarea>
                    <button class="btn btn-primary btn-full" onclick="saveCategoryFunc(event)">${cat ? 'ذخیره تغییرات' : 'ایجاد دسته‌بندی'}</button>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
};

window.saveCategoryFunc = (e) => {
    const id = document.getElementById('cat-id').value;
    const name = document.getElementById('cat-name').value;
    const desc = document.getElementById('cat-desc').value;
    const icon = document.getElementById('cat-icon').value;
    if(!name) { alert('نام دسته‌بندی الزامی است'); return; }
    e.target.textContent = 'در حال ذخیره...';
    e.target.disabled = true;
    if(id) {
        const cat = categories.find(c => c.id === id);
        if(cat) { cat.name = name; cat.description = desc; cat.icon = icon; }
        AdminStore.addAuditLog('EDIT_CATEGORY', 'Category', id, `دسته‌بندی ${name} ویرایش شد`);
    } else {
        const newId = 'cat-' + Math.floor(Math.random() * 10000);
        categories.push({ id: newId, name: name, description: desc, icon: icon, status: 'active' });
        AdminStore.addAuditLog('ADD_CATEGORY', 'Category', newId, `دسته‌بندی جدید ${name} اضافه شد`);
    }
    document.getElementById('cat-modal').remove();
    loadTab('categories');
};

async function renderCategories(container) {
    container.innerHTML = `
        <div class="admin-table-wrapper">
            <div class="admin-table-toolbar">
                <h2 style="font-size: 1.2rem; color: #0f172a; margin: 0;">مدیریت دسته‌بندی‌های سایت</h2>
                <button class="btn btn-primary" style="padding: 6px 12px; font-size: 0.85rem;" onclick="openCategoryModal()">+ افزودن دسته جدید</button>
            </div>
            <table class="panel-table">
                <thead>
                    <tr>
                        <th>آیکون</th>
                        <th>شناسه (Slug)</th>
                        <th>عنوان دسته‌بندی</th>
                        <th>وضعیت</th>
                        <th>عملیات</th>
                    </tr>
                </thead>
                <tbody>
                    ${categories.map(cat => `
                        <tr>
                            <td><span style="background: #f1f5f9; padding: 5px; border-radius: 6px; display: inline-flex;">${cat.icon}</span></td>
                            <td style="font-family: monospace; color: #64748b;">${cat.id}</td>
                            <td style="font-weight: bold; color: #1e293b;">${cat.name}</td>
                            <td><span class="badge-success" style="padding: 2px 8px; border-radius: 4px; font-size: 0.8rem;">فعال</span></td>
                            <td><button class="btn btn-outline" style="padding: 4px 12px; font-size: 0.8rem;" onclick="openCategoryModal('${cat.id}')">ویرایش</button></td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

async function renderAdminArticles(container) {
  const articles = await ArticleService.getAllForAdmin();
  container.innerHTML = `
    <div class="admin-table-wrapper">
      <div class="admin-table-toolbar">
        <h2 style="font-size: 1.2rem; color: #0f172a; margin: 0;">بررسی و انتشار مقالات تخصصی</h2>
      </div>
      <table class="panel-table">
        <thead>
          <tr>
            <th>عنوان مقاله</th>
            <th>شرکت نویسنده</th>
            <th>تاریخ ثبت</th>
            <th>وضعیت</th>
            <th>عملیات</th>
          </tr>
        </thead>
        <tbody>
          ${articles.length > 0 ? articles.map(art => {
            let statusBadge = art.status === 'published' ? '<span class="badge-success" style="padding: 2px 8px; border-radius: 4px;">منتشرشده</span>' :
                              art.status === 'pending' ? '<span class="badge-warning" style="padding: 2px 8px; border-radius: 4px;">در انتظار بررسی</span>' :
                              art.status === 'rejected' ? '<span class="badge-danger" style="padding: 2px 8px; border-radius: 4px;">ردشده</span>' :
                              '<span class="badge-gray" style="padding: 2px 8px; border-radius: 4px;">پیش‌نویس</span>';
            return `
              <tr>
                <td style="font-weight: 600; max-width: 250px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${art.title}</td>
                <td style="color: var(--color-primary); font-weight: bold;">${art.companyName}</td>
                <td style="color: #64748b;" dir="ltr">${art.createdAt}</td>
                <td>${statusBadge}</td>
                <td>
                  <div style="display: flex; gap: 6px;">
                    ${art.status === 'pending' || art.status === 'rejected' ? `<button class="btn btn-primary" style="padding: 4px 8px; font-size: 0.75rem; background:#10b981; border-color:#10b981;" onclick="adminApproveArticle('${art.id}')">تأیید و انتشار</button>` : ''}
                    ${art.status === 'pending' || art.status === 'published' ? `<button class="btn btn-outline" style="padding: 4px 8px; font-size: 0.75rem; color:#ef4444; border-color:#ef4444;" onclick="adminRejectArticlePrompt('${art.id}')">رد مقاله</button>` : ''}
                    <a href="article-detail.html?id=${art.id}" target="_blank" class="btn btn-outline" style="padding: 4px 8px; font-size: 0.75rem; text-decoration:none;">مشاهده</a>
                  </div>
                </td>
              </tr>
            `;
          }).join('') : '<tr><td colspan="5" style="text-align: center; padding: 2rem;">مقاله‌ای یافت نشد.</td></tr>'}
        </tbody>
      </table>
    </div>
  `;
}

window.adminApproveArticle = async (id) => {
  await ArticleService.updateStatusByAdmin(id, 'published');
  document.querySelector('[data-tab="articles"]').click();
};

window.adminRejectArticlePrompt = async (id) => {
  const reason = prompt('دلیل رد مقاله را جهت اطلاع شرکت وارد کنید:');
  if (reason && reason.trim()) {
    await ArticleService.updateStatusByAdmin(id, 'rejected', reason.trim());
    document.querySelector('[data-tab="articles"]').click();
  }
};

async function renderTransactions(container) {
    const allRfqs = AppStore.getAllRfqs();
    const allDeals = AppStore.getAllDeals();
    container.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
          <h2 style="font-size: 1.5rem; color: #0f172a;">ردیابی تراکنش‌ها و معاملات باز</h2>
      </div>
      <div class="admin-table-wrapper">
        <div class="admin-table-toolbar" style="background: #f8fafc;"><strong style="color:#0f172a;">معاملات در جریان (Deals)</strong></div>
        <table class="panel-table">
          <thead>
            <tr><th>شناسه</th><th>خریدار</th><th>تأمین‌کننده</th><th>موضوع</th><th>تاریخ</th><th>وضعیت</th></tr>
          </thead>
          <tbody>
            ${allDeals.length > 0 ? allDeals.map(d => {
                const b = businesses.find(x => x.id === d.buyerId);
                const s = businesses.find(x => x.id === d.mainSupplierId);
                return `
                <tr>
                    <td style="font-family: monospace; color: #64748b;">#${d.id.toUpperCase()}</td>
                    <td style="font-weight: 600; color: var(--color-primary);">${b ? b.name : ''}</td>
                    <td style="font-weight: 600; color: #1e293b;">${s ? s.name : ''}</td>
                    <td>${d.title}</td>
                    <td style="color: #64748b; font-size: 0.85rem;" dir="ltr">${d.date.split(',')[0]}</td>
                    <td><span class="badge-success" style="background:#e0f2fe; color:#0284c7; padding:2px 8px; border-radius:4px; font-size:0.8rem;">در حال مذاکره</span></td>
                </tr>`;
            }).join('') : '<tr><td colspan="6" style="text-align:center;">معامله‌ای ثبت نشده</td></tr>'}
          </tbody>
        </table>
      </div>
      <br>
      <div class="admin-table-wrapper">
        <div class="admin-table-toolbar" style="background: #f8fafc;"><strong style="color:#0f172a;">درخواست‌های خرید (RFQs)</strong></div>
        <table class="panel-table">
          <thead>
            <tr><th>شناسه</th><th>ارسال کننده</th><th>دریافت کننده</th><th>محصول</th><th>زمان ثبت</th><th>وضعیت</th></tr>
          </thead>
          <tbody>
            ${allRfqs.length > 0 ? allRfqs.map(rfq => {
                const buyer = businesses.find(b => b.id === rfq.buyerId);
                const supplier = businesses.find(b => b.id === rfq.supplierId);
                let statusText = rfq.status === 'pending' ? '<span class="badge-warning" style="padding:2px 8px; border-radius:4px; font-size:0.8rem;">در انتظار پاسخ</span>' : (rfq.status === 'replied' ? '<span class="badge-success" style="padding:2px 8px; border-radius:4px; font-size:0.8rem;">پاسخ داده شده</span>' : '<span style="color:#4338ca; background:#e0e7ff; padding:2px 8px; border-radius:4px; font-size:0.8rem;">در حال مذاکره</span>');
                return `
                  <tr>
                      <td style="font-family: monospace; color: #64748b;">#${rfq.id.toUpperCase()}</td>
                      <td style="font-weight: 600; color: #3b82f6;">${buyer ? buyer.name : 'نامشخص'}</td>
                      <td style="font-weight: 600; color: #1e293b;">${supplier ? supplier.name : 'نامشخص'}</td>
                      <td>استعلام کالا</td>
                      <td style="color: #64748b; font-size: 0.85rem;" dir="ltr">${rfq.date}</td>
                      <td>${statusText}</td>
                  </tr>`;
            }).join('') : '<tr><td colspan="6" style="text-align:center; padding:2rem;">تراکنشی ثبت نشده است.</td></tr>'}
          </tbody>
        </table>
      </div>
    `;
}

// ==========================================
// 🌟 سیستم تنظیمات پلتفرم (Platform Settings) 🌟
// ==========================================

// متغیرهای مدیریت وضعیت (State) در تنظیمات
window.originalSettings = {};
window.currentSettings = {};
window.activeSettingsTab = 'general';

window.switchSettingsTab = (tabId) => {
    window.activeSettingsTab = tabId;
    document.querySelectorAll('.settings-nav-item').forEach(el => el.classList.remove('active'));
    document.querySelector(`[data-set-tab="${tabId}"]`).classList.add('active');
    
    document.querySelectorAll('.settings-pane').forEach(el => {
        el.style.display = 'none';
        el.classList.remove('active');
    });
    const activePane = document.getElementById(`pane-${tabId}`);
    if(activePane) {
        activePane.style.display = 'block';
        // تاخیر کوچک برای اعمال انیمیشن
        setTimeout(() => activePane.classList.add('active'), 10);
    }
};

window.handleSettingChange = (key, val) => {
    window.currentSettings[key] = val;
    checkUnsavedChanges();
};

function checkUnsavedChanges() {
    const hasChanges = JSON.stringify(window.originalSettings) !== JSON.stringify(window.currentSettings);
    const saveBar = document.getElementById('settings-save-bar');
    if(saveBar) {
        saveBar.style.display = hasChanges ? 'flex' : 'none';
    }
}

window.discardAdminSettings = () => {
    // کپی عمیق (Deep Copy) از اطلاعات اولیه
    window.currentSettings = JSON.parse(JSON.stringify(window.originalSettings));
    // کلیک روی تب منوی اصلی برای ری‌رندر شدن صفحه
    document.querySelector('[data-tab="settings"]').click();
};

window.saveAdminSettings = async () => {
    const btn = document.getElementById('btn-save-settings');
    btn.textContent = 'در حال ذخیره...';
    btn.disabled = true;
    
    await AdminService.savePlatformSettings(window.currentSettings);
    
    window.originalSettings = JSON.parse(JSON.stringify(window.currentSettings));
    checkUnsavedChanges();
    
    btn.textContent = 'ذخیره تغییرات سیستم';
    btn.disabled = false;
    
    // یک نوتیفیکیشن ساده و سریع
    const saveBar = document.getElementById('settings-save-bar');
    saveBar.innerHTML = `<div style="color:#10b981; font-weight:bold; width:100%; text-align:center;"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: bottom; margin-left: 8px;"><polyline points="20 6 9 17 4 12"></polyline></svg> تنظیمات پلتفرم با موفقیت ذخیره و اعمال شد.</div>`;
    saveBar.style.display = 'flex';
    setTimeout(() => { saveBar.style.display = 'none'; }, 2500);
};

// تابع کمکی برای رندر دکمه‌های روشن/خاموش (Toggle)
function renderToggle(label, desc, key) {
    const isChecked = window.currentSettings[key];
    return `
        <div class="setting-row">
            <div class="setting-info">
                <strong>${label}</strong>
                <p>${desc}</p>
            </div>
            <label class="custom-toggle">
                <input type="checkbox" ${isChecked ? 'checked' : ''} onchange="window.handleSettingChange('${key}', this.checked)">
                <span class="toggle-slider"></span>
            </label>
        </div>
    `;
}

// تابع کمکی برای رندر فیلدهای متنی/عددی
function renderInput(label, desc, key, type = 'text', width = '250px', dir = 'auto') {
    const val = window.currentSettings[key];
    return `
        <div class="setting-row">
            <div class="setting-info">
                <strong>${label}</strong>
                <p>${desc}</p>
            </div>
            <div style="width: ${width};">
                <input type="${type}" class="form-input" style="padding: 8px 12px; font-size: 0.9rem;" dir="${dir}" value="${val}" oninput="window.handleSettingChange('${key}', ${type === 'number' ? 'Number(this.value)' : 'this.value'})">
            </div>
        </div>
    `;
}

// تابع اصلی رندر تنظیمات
async function renderSettings(container) {
    // دریافت تنظیمات از سرویس
    const rawSettings = await AdminService.getPlatformSettings();
    window.originalSettings = JSON.parse(JSON.stringify(rawSettings));
    window.currentSettings = JSON.parse(JSON.stringify(rawSettings));

    const styles = `
        <style>
            .settings-container { display: flex; gap: 2rem; align-items: flex-start; max-width: 1100px; margin: 0 auto; }
            .settings-sidebar { width: 260px; flex-shrink: 0; background: white; border: 1px solid var(--color-border); border-radius: 12px; padding: 1rem 0; box-shadow: 0 2px 4px rgba(0,0,0,0.02); position: sticky; top: 20px; }
            .settings-nav-item { display: flex; align-items: center; gap: 10px; padding: 12px 20px; color: #475569; text-decoration: none; font-size: 0.95rem; border-right: 3px solid transparent; cursor: pointer; transition: 0.2s; font-weight: 500;}
            .settings-nav-item:hover { background: #f8fafc; color: var(--color-primary); }
            .settings-nav-item.active { background: #eff6ff; color: var(--color-primary); border-right-color: var(--color-primary); font-weight: 700; }
            .settings-content { flex-grow: 1; min-width: 0; background: white; border: 1px solid var(--color-border); border-radius: 12px; padding: 2rem; box-shadow: 0 2px 4px rgba(0,0,0,0.02); margin-bottom: 80px; }
            .settings-pane { display: none; opacity: 0; transition: opacity 0.3s ease; }
            .settings-pane.active { display: block; opacity: 1; }
            .setting-row { display: flex; justify-content: space-between; align-items: center; padding: 1.2rem 0; border-bottom: 1px dashed #e2e8f0; gap: 2rem;}
            .setting-row:last-child { border-bottom: none; padding-bottom: 0; }
            .setting-row:first-child { padding-top: 0; }
            .setting-info { flex: 1; }
            .setting-info strong { color: #0f172a; display: block; margin-bottom: 4px; font-size: 0.95rem; }
            .setting-info p { color: #64748b; font-size: 0.85rem; margin: 0; line-height: 1.5; }
            
            /* Custom Toggle CSS */
            .custom-toggle { position: relative; display: inline-block; width: 44px; height: 24px; flex-shrink: 0;}
            .custom-toggle input { opacity: 0; width: 0; height: 0; }
            .toggle-slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #cbd5e1; transition: .3s; border-radius: 24px; }
            .toggle-slider:before { position: absolute; content: ""; height: 18px; width: 18px; left: 3px; bottom: 3px; background-color: white; transition: .3s; border-radius: 50%; box-shadow: 0 2px 4px rgba(0,0,0,0.1);}
            .custom-toggle input:checked + .toggle-slider { background-color: #10b981; }
            .custom-toggle input:checked + .toggle-slider:before { transform: translateX(20px); }
            
            /* Save Bar Animation */
            @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
        </style>
    `;

    container.innerHTML = styles + `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; max-width: 1100px; margin-left: auto; margin-right: auto;">
            <div>
                <h2 style="font-size: 1.5rem; color: #0f172a; margin-bottom: 5px;">پیکربندی و تنظیمات پلتفرم</h2>
                <p style="color: #64748b; font-size: 0.95rem; margin: 0;">مدیریت رفتار کلان سیستم، قوانین دسترسی و ماژول‌های فعال</p>
            </div>
        </div>

        <div class="settings-container">
            <!-- منوی داخلی تنظیمات -->
            <aside class="settings-sidebar">
                <div class="settings-nav-item active" data-set-tab="general" onclick="window.switchSettingsTab('general')">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1 0-2.83 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
                    تنظیمات عمومی
                </div>
                <div class="settings-nav-item" data-set-tab="users" onclick="window.switchSettingsTab('users')">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                    کاربران و شرکت‌ها
                </div>
                <div class="settings-nav-item" data-set-tab="marketplace" onclick="window.switchSettingsTab('marketplace')">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
                    تنظیمات مارکت‌پلیس
                </div>
                <div class="settings-nav-item" data-set-tab="rfq" onclick="window.switchSettingsTab('rfq')">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
                    ارتباطات و RFQ
                </div>
                <div class="settings-nav-item" data-set-tab="billing" onclick="window.switchSettingsTab('billing')">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                    اشتراک و پرداخت
                </div>
                <div class="settings-nav-item" data-set-tab="security" onclick="window.switchSettingsTab('security')">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                    امنیت سیستم
                </div>
            </aside>

            <!-- محتوای تنظیمات -->
            <div class="settings-content">
                
                <!-- Tab 1: General -->
                <div id="pane-general" class="settings-pane active">
                    <h3 style="margin-bottom: 2rem; color: #1e293b;">عمومی و اطلاعات پایه</h3>
                    ${renderInput('نام پلتفرم', 'عنوان اصلی سایت که در مرورگر و ایمیل‌ها نمایش داده می‌شود.', 'platformName')}
                    ${renderInput('ایمیل اصلی سیستم', 'ایمیلی که فرم‌های تماس و نوتیفیکیشن‌ها از آن ارسال می‌شوند.', 'contactEmail', 'email', '250px', 'ltr')}
                    ${renderInput('شماره پشتیبانی', 'شماره تماس اصلی جهت نمایش در فوتر و بخش تماس با ما.', 'contactPhone', 'text', '250px', 'ltr')}
                    
                    <div class="setting-row">
                        <div class="setting-info">
                            <strong>زبان پیش‌فرض</strong>
                            <p>زبان اصلی رابط کاربری برای کاربرانی که تازه وارد سایت می‌شوند.</p>
                        </div>
                        <div style="width: 250px;">
                            <select class="form-input" style="padding: 8px 12px; font-size: 0.9rem;" onchange="window.handleSettingChange('defaultLang', this.value)">
                                <option value="fa" ${window.currentSettings.defaultLang === 'fa' ? 'selected' : ''}>فارسی (Persian)</option>
                                <option value="en" ${window.currentSettings.defaultLang === 'en' ? 'selected' : ''}>انگلیسی (English)</option>
                            </select>
                        </div>
                    </div>

                    <div class="setting-row">
                        <div class="setting-info">
                            <strong>واحد پول پایگاه داده</strong>
                            <p>واحد پیش‌فرض برای قیمت‌گذاری پلن‌ها و نمایش‌های مالی سیستم.</p>
                        </div>
                        <div style="width: 250px;">
                            <select class="form-input" style="padding: 8px 12px; font-size: 0.9rem; font-family: monospace;" dir="ltr" onchange="window.handleSettingChange('currency', this.value)">
                                <option value="IRR" ${window.currentSettings.currency === 'IRR' ? 'selected' : ''}>IRR (Rial)</option>
                                <option value="USD" ${window.currentSettings.currency === 'USD' ? 'selected' : ''}>USD ($)</option>
                                <option value="EUR" ${window.currentSettings.currency === 'EUR' ? 'selected' : ''}>EUR (€)</option>
                            </select>
                        </div>
                    </div>
                    
                    ${renderToggle('حالت تعمیر و نگهداری (Maintenance Mode)', 'با فعال‌سازی این گزینه، پلتفرم از دسترس کاربران خارج شده و پیام «در حال به‌روزرسانی» نمایش داده می‌شود.', 'maintenanceMode')}
                </div>

                <!-- Tab 2: Users & Companies -->
                <div id="pane-users" class="settings-pane">
                    <h3 style="margin-bottom: 2rem; color: #1e293b;">مدیریت کاربران و شرکت‌ها</h3>
                    ${renderToggle('فعال بودن ثبت‌نام (Sign Up)', 'کاربران و شرکت‌های جدید اجازه ثبت‌نام در پلتفرم را داشته باشند.', 'allowNewRegistrations')}
                    ${renderToggle('امکان ثبت‌نام خریدار (Buyer)', 'اشخاص حقوقی بتوانند اکانت خریدار ایجاد کنند.', 'allowBuyerReg')}
                    ${renderToggle('امکان ثبت‌نام تأمین‌کننده (Supplier)', 'شرکت‌ها بتوانند به عنوان فروشنده ثبت‌نام کنند.', 'allowSupplierReg')}
                    ${renderToggle('نیاز به تأیید ادمین برای شرکت‌ها', 'شرکت‌های جدید پس از ثبت‌نام مخفی بمانند تا مدیر آن‌ها را احراز هویت کند.', 'requireCompanyApproval')}
                    ${renderToggle('نیاز به تأیید محصول (Moderation)', 'محصولات پس از ثبت توسط فروشنده، وارد وضعیت بررسی شوند و بلافاصله منتشر نشوند.', 'requireProductApproval')}
                </div>

                <!-- Tab 3: Marketplace -->
                <div id="pane-marketplace" class="settings-pane">
                    <h3 style="margin-bottom: 2rem; color: #1e293b;">مارکت‌پلیس و کاتالوگ</h3>
                    ${renderToggle('فعال بودن مارکت‌پلیس', 'روشن بودن بخش محصولات و ویترین‌های عمومی (در صورت خاموش بودن پلتفرم به یک CRM داخلی تبدیل می‌شود).', 'marketplaceEnabled')}
                    ${renderToggle('نمایش عمومی محصولات', 'کاربران بدون لاگین (Guest) بتوانند محصولات را ببینند.', 'publicProducts')}
                    ${renderToggle('نمایش عمومی شرکت‌ها', 'پروفایل و آدرس شرکت‌ها برای کاربران مهمان قابل مشاهده باشد.', 'publicCompanies')}
                    ${renderToggle('موتور جستجوی سراسری', 'روشن بودن نوار جستجوی هوشمند در هدر سایت.', 'searchEnabled')}
                    ${renderToggle('بخش ویژه (Featured)', 'فعال بودن سیستم اسپانسری و نمایش کارت‌های ویژه در صفحه اصلی.', 'featuredEnabled')}
                </div>

                <!-- Tab 4: RFQ & Comms -->
                <div id="pane-rfq" class="settings-pane">
                    <h3 style="margin-bottom: 2rem; color: #1e293b;">ارتباطات، مناقصات و RFQ</h3>
                    ${renderToggle('فعال بودن سیستم RFQ', 'خریداران بتوانند درخواست‌های قیمت (استعلام) برای محصولات ثبت کنند.', 'rfqEnabled')}
                    ${renderToggle('استعلام چندگانه (Multi-Supplier RFQ)', 'خریدار بتواند یک استعلام را همزمان برای لیست کوتاه (Shortlist) خود بفرستد.', 'multiSupplierRfq')}
                    ${renderToggle('سیستم پیام‌رسان (Chat)', 'فعال بودن گفتگوی زنده و مستقیم بین خریدار و فروشنده.', 'messagingEnabled')}
                    ${renderToggle('اعلان‌های سیستمی (Notifications)', 'ارسال نوتیفیکیشن‌های درون‌برنامه‌ای در صورت وقوع رویدادهای مهم.', 'systemNotifications')}
                </div>

                <!-- Tab 5: Billing & Subscriptions -->
                <div id="pane-billing" class="settings-pane">
                    <h3 style="margin-bottom: 2rem; color: #1e293b;">اشتراک، لایسنس و پرداخت</h3>
                    ${renderToggle('سیستم اشتراک (Subscriptions)', 'فعال بودن پکیج‌ها و تعرفه‌های کاربری (Basic, Pro و غیره).', 'subSystemEnabled')}
                    ${renderToggle('دیوار پرداخت (Paywall)', 'محدود کردن امکانات پلتفرم (مثل مشاهده اطلاعات تماس) برای کاربران رایگان.', 'paywallEnabled')}
                    ${renderToggle('درگاه پرداخت آنلاین', 'امکان خرید و تمدید خودکار اشتراک از طریق درگاه‌های بانکی متصل.', 'onlinePayments')}
                    ${renderToggle('دوره آزمایشی (Trial)', 'ارائه اشتراک رایگان به کاربران جدید در بدو ورود.', 'trialEnabled')}
                    ${renderInput('مدت زمان Trial (روز)', 'تعداد روزهایی که حساب پریمیوم به صورت تستی برای ثبت‌نام‌های جدید فعال می‌ماند.', 'trialDuration', 'number', '120px', 'ltr')}
                </div>

                <!-- Tab 6: Security -->
                <div id="pane-security" class="settings-pane">
                    <h3 style="margin-bottom: 2rem; color: #1e293b;">امنیت و دسترسی</h3>
                    ${renderToggle('تأیید اجباری ایمیل', 'کاربران بدون کلیک روی لینک ارسالی ایمیل نتوانند وارد سیستم شوند.', 'emailVerification')}
                    ${renderToggle('تأیید اجباری پیامک (OTP)', 'ورود و ثبت‌نام فقط از طریق کد تایید موبایل انجام شود.', 'phoneVerification')}
                    ${renderToggle('ورود دو مرحله‌ای (2FA)', 'امکان فعال‌سازی امنیت دو مرحله‌ای برای مدیران سازمان‌ها.', 'twoFactorAuth')}
                    ${renderInput('عمر Session (ساعت)', 'مدت زمانی که کاربر لاگین می‌ماند (قبل از اینکه به اجبار خارج شود).', 'sessionDuration', 'number', '120px', 'ltr')}
                    ${renderInput('محدودیت تلاش ناموفق', 'تعداد باری که کاربر می‌تواند رمز عبور را اشتباه بزند تا اکانتش موقتاً قفل شود.', 'maxFailedLogins', 'number', '120px', 'ltr')}
                </div>

            </div>
        </div>

        <!-- نوار شناور ذخیره تغییرات -->
        <div id="settings-save-bar" style="display: none; position: fixed; bottom: 0; left: 0; width: 100%; background: white; padding: 1.2rem 2rem; box-shadow: 0 -5px 20px rgba(0,0,0,0.05); z-index: 1000; border-top: 1px solid var(--color-border); justify-content: space-between; align-items: center; animation: slideUp 0.3s ease;">
            <div style="display:flex; align-items:center; gap:10px;">
                <span style="background: #fef3c7; color: #d97706; padding: 6px 12px; border-radius: 8px; font-size: 0.85rem; font-weight: bold;">تغییرات ذخیره نشده</span>
                <span style="color: #64748b; font-size: 0.9rem;">برای اعمال تنظیمات جدید در سیستم روی دکمه ذخیره کلیک کنید.</span>
            </div>
            <div style="display: flex; gap: 10px;">
                <button class="btn btn-outline" style="color: #ef4444; border-color: #ef4444;" onclick="window.discardAdminSettings()">بازگردانی تغییرات</button>
                <button id="btn-save-settings" class="btn btn-primary" style="background: #10b981; border-color: #10b981;" onclick="window.saveAdminSettings()">ذخیره تغییرات سیستم</button>
            </div>
        </div>
    `;
    
    // اطمینان از اینکه تب اولیه درست نمایش داده می‌شود
    window.switchSettingsTab(window.activeSettingsTab);
}

async function renderAuditLog(container) {
    const logs = await AdminService.getActivityLogs();
    container.innerHTML = `
        <div style="margin-bottom: 1.5rem; background: #e0f2fe; border-left: 4px solid #0284c7; padding: 1rem; border-radius: 8px;">
            <strong style="color: #0284c7;">تذکر امنیتی:</strong> تمامی عملیات‌های انجام شده توسط مدیران سیستم در این بخش ثبت و غیرقابل حذف می‌باشند.
        </div>
        <div class="admin-table-wrapper">
            <table class="panel-table">
                <thead>
                    <tr>
                        <th style="width: 150px;">تاریخ و زمان</th>
                        <th>Admin ID</th>
                        <th>نوع عملیات (Action)</th>
                        <th>موجودیت (Entity)</th>
                        <th>شرح جزئیات</th>
                    </tr>
                </thead>
                <tbody>
                    ${logs.map(log => {
                        const dateObj = new Date(log.timestamp);
                        const timeString = dateObj.toLocaleTimeString('fa-IR');
                        const dateString = dateObj.toLocaleDateString('fa-IR');
                        return `
                        <tr>
                            <td style="font-size: 0.85rem; color: #64748b;" dir="ltr">${dateString} - ${timeString}</td>
                            <td style="font-weight: bold; font-family: monospace; color: #0f172a;">${log.adminId}</td>
                            <td><span style="background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-size: 0.8rem; font-family: monospace;">${log.action}</span></td>
                            <td style="color: #3b82f6; font-size: 0.9rem;">${log.entityType} [${log.entityId}]</td>
                            <td style="color: #475569; font-size: 0.9rem;">${log.description}</td>
                        </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        </div>
    `;
}

async function renderFeaturedManagement(container) {
    const featuredComps = await FeaturedContentService.getFeaturedCompanies();
    const featuredProds = await FeaturedContentService.getFeaturedProducts();

    const compOptions = businesses.map(b => `<option value="${b.id}">${b.name}</option>`).join('');
    const prodOptions = products.map(p => {
        const s = businesses.find(b => b.id === p.supplierId);
        return `<option value="${p.id}">${p.name} | شرکت: ${s ? s.name : ''}</option>`;
    }).join('');

    container.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
            <h2 style="font-size: 1.5rem;">مدیریت مارکتینگ و جایگاه‌های صفحه اصلی</h2>
        </div>
        
        <div style="background: #eff6ff; border: 1px dashed #3b82f6; padding: 1rem; border-radius: 8px; margin-bottom: 2rem; font-size: 0.95rem; color: #1e40af;">
            <strong>حالت آزاد (Unlimited):</strong> در حال حاضر محدودیت سهمیه‌ها برای تست شما برداشته شده است. می‌توانید هر تعداد شرکت و محصول که مایلید اضافه کنید. از <strong>کادر جستجو</strong> برای پیدا کردن سریع استفاده کنید.
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem;">
            
            <!-- شرکت‌های ویژه -->
            <div style="background: white; border: 1px solid var(--color-border); border-radius: 12px; padding: 1.5rem; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
                <h3 style="margin-bottom: 1rem; border-bottom: 2px solid #f1f5f9; padding-bottom: 10px; display: flex; justify-content: space-between;">
                    <span>شرکت‌های ویژه (اسپانسر)</span>
                    <span style="font-size: 0.85rem; color: #64748b; background: #f1f5f9; padding: 2px 8px; border-radius: 20px;">${featuredComps.length} مورد</span>
                </h3>
                
                <div style="margin-bottom: 1.5rem; background: #f8fafc; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0;">
                    <label style="display:block; font-size:0.85rem; font-weight:bold; margin-bottom:8px; color:#475569;">جستجوی سریع نام شرکت:</label>
                    <input type="text" class="form-input" style="margin-bottom: 10px; border-color: #93c5fd;" placeholder="تایپ کنید تا لیست زیر فیلتر شود..." onkeyup="window.filterAdminSelect('comp', this.value)">
                    <div style="display: flex; gap: 10px;">
                        <select id="feat-comp-select" class="form-input" style="flex: 1;">
                            <option value="">ابتدا یک شرکت را انتخاب کنید...</option>
                            ${compOptions}
                        </select>
                        <button class="btn btn-primary" onclick="window.adminAddFeaturedComp()">افزودن</button>
                    </div>
                </div>

                <div style="max-height: 400px; overflow-y: auto; padding-right: 5px;">
                    ${featuredComps.length > 0 ? featuredComps.map(c => `
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; border: 1px solid #e2e8f0; border-radius: 8px; margin-bottom: 10px;">
                            <div style="display: flex; align-items: center; gap: 10px;">
                                <img src="${c.logo}" style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover; border: 1px solid #cbd5e1;">
                                <div>
                                    <div style="font-weight: 600; font-size: 0.95rem;">${c.name}</div>
                                </div>
                            </div>
                            <button class="btn btn-outline" style="padding: 4px 8px; font-size: 0.75rem; color: #ef4444; border-color: #ef4444;" onclick="window.adminRemoveFeaturedComp('${c.id}')">حذف</button>
                        </div>
                    `).join('') : '<div style="text-align:center; color:#94a3b8; padding: 2rem;">شرکتی اضافه نشده است.</div>'}
                </div>
            </div>

            <!-- محصولات ویژه -->
            <div style="background: white; border: 1px solid var(--color-border); border-radius: 12px; padding: 1.5rem; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
                <h3 style="margin-bottom: 1rem; border-bottom: 2px solid #f1f5f9; padding-bottom: 10px; display: flex; justify-content: space-between;">
                    <span>محصولات ویژه (ویترین)</span>
                    <span style="font-size: 0.85rem; color: #64748b; background: #f1f5f9; padding: 2px 8px; border-radius: 20px;">${featuredProds.length} مورد</span>
                </h3>
                
                <div style="margin-bottom: 1.5rem; background: #f8fafc; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0;">
                    <label style="display:block; font-size:0.85rem; font-weight:bold; margin-bottom:8px; color:#475569;">جستجوی سریع نام محصول:</label>
                    <input type="text" class="form-input" style="margin-bottom: 10px; border-color: #93c5fd;" placeholder="تایپ کنید تا لیست زیر فیلتر شود..." onkeyup="window.filterAdminSelect('prod', this.value)">
                    <div style="display: flex; gap: 10px;">
                        <select id="feat-prod-select" class="form-input" style="flex: 1;">
                            <option value="">ابتدا محصول را انتخاب کنید...</option>
                            ${prodOptions}
                        </select>
                        <button class="btn btn-primary" onclick="window.adminAddFeaturedProd()">افزودن</button>
                    </div>
                </div>

                <div style="max-height: 400px; overflow-y: auto; padding-right: 5px;">
                    ${featuredProds.length > 0 ? featuredProds.map(p => `
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; border: 1px solid #e2e8f0; border-radius: 8px; margin-bottom: 10px;">
                            <div style="display: flex; align-items: center; gap: 10px;">
                                <img src="${p.image}" style="width: 40px; height: 40px; border-radius: 6px; object-fit: cover; border: 1px solid #cbd5e1;">
                                <div>
                                    <div style="font-weight: 600; font-size: 0.95rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 180px;">${p.name}</div>
                                    <div style="font-size: 0.75rem; color: #64748b;">شرکت: ${p.supplierName}</div>
                                </div>
                            </div>
                            <button class="btn btn-outline" style="padding: 4px 8px; font-size: 0.75rem; color: #ef4444; border-color: #ef4444;" onclick="window.adminRemoveFeaturedProd('${p.id}')">حذف</button>
                        </div>
                    `).join('') : '<div style="text-align:center; color:#94a3b8; padding: 2rem;">محصولی اضافه نشده است.</div>'}
                </div>
            </div>

        </div>
    `;
}

window.filterAdminSelect = (type, query) => {
    const q = query.toLowerCase().trim();
    if (type === 'comp') {
        const select = document.getElementById('feat-comp-select');
        const filtered = businesses.filter(b => b.name.toLowerCase().includes(q));
        select.innerHTML = '<option value="">انتخاب شرکت...</option>' + filtered.map(b => `<option value="${b.id}">${b.name}</option>`).join('');
    } else {
        const select = document.getElementById('feat-prod-select');
        const filtered = products.filter(p => p.name.toLowerCase().includes(q));
        select.innerHTML = '<option value="">انتخاب محصول...</option>' + filtered.map(p => {
            const s = businesses.find(b => b.id === p.supplierId);
            return `<option value="${p.id}">${p.name} | شرکت: ${s ? s.name : ''}</option>`;
        }).join('');
    }
};

window.adminAddFeaturedComp = async () => {
    const id = document.getElementById('feat-comp-select').value;
    if (!id) return;
    try {
        await FeaturedContentService.addFeaturedCompany(id);
        loadTab('featured');
    } catch (error) { alert(error.message); }
};

window.adminRemoveFeaturedComp = async (id) => {
    if (confirm('حذف شرکت از جایگاه ویژه؟')) {
        await FeaturedContentService.removeFeaturedCompany(id);
        loadTab('featured');
    }
};

window.adminAddFeaturedProd = async () => {
    const id = document.getElementById('feat-prod-select').value;
    if (!id) return;
    try {
        await FeaturedContentService.addFeaturedProduct(id);
        loadTab('featured');
    } catch (error) { alert(error.message); }
};

window.adminRemoveFeaturedProd = async (id) => {
    if (confirm('حذف محصول از جایگاه ویژه؟')) {
        await FeaturedContentService.removeFeaturedProduct(id);
        loadTab('featured');
    }
};

async function renderReviewsManagement(container) {
    const allReviews = await ReviewService.getAllReviewsAdmin();
    container.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
            <h2 style="font-size: 1.5rem;">مدیریت نظرات و امتیازات سیستم (${allReviews.length})</h2>
        </div>
        <div class="admin-table-wrapper">
            <table class="panel-table" style="width: 100%;">
                <thead style="background: #f8fafc;">
                    <tr>
                        <th style="padding: 1rem;">نویسنده</th>
                        <th style="padding: 1rem;">محل ثبت (کالا/شرکت)</th>
                        <th style="padding: 1rem;">امتیاز</th>
                        <th style="padding: 1rem; width: 30%;">متن نظر</th>
                        <th style="padding: 1rem;">وضعیت</th>
                        <th style="padding: 1rem;">عملیات</th>
                    </tr>
                </thead>
                <tbody>
                    ${allReviews.length > 0 ? allReviews.map(r => {
                        let badgeHtml = '';
                        if (r.status === 'pending') badgeHtml = '<span style="background:#fef3c7; color:#d97706; padding: 4px 8px; border-radius: 6px; font-size: 0.8rem; font-weight: bold;">در انتظار تایید</span>';
                        else if (r.status === 'approved') badgeHtml = '<span style="background:#d1fae5; color:#059669; padding: 4px 8px; border-radius: 6px; font-size: 0.8rem; font-weight: bold;">تایید شده</span>';
                        else if (r.status === 'rejected') badgeHtml = `<span style="background:#fef2f2; color:#dc2626; padding: 4px 8px; border-radius: 6px; font-size: 0.8rem; font-weight: bold;" title="${r.rejectionReason}">رد شده</span>`;

                        const stars = '★'.repeat(r.rating) + '☆'.repeat(5 - r.rating);
                        const targetLabel = r.targetType === 'product' ? 'محصول' : 'پروفایل شرکت';

                        return `
                            <tr style="border-bottom: 1px solid #f1f5f9;">
                                <td style="padding: 1rem; font-weight: 600; color: #1e293b;">${r.userName}</td>
                                <td style="padding: 1rem; font-size: 0.85rem; color: #64748b;">
                                    <span style="background: #f1f5f9; padding: 2px 6px; border-radius: 4px; margin-bottom: 4px; display: inline-block;">${targetLabel}</span><br>
                                    <span dir="ltr">ID: ${r.targetId}</span>
                                </td>
                                <td style="padding: 1rem; color: #f59e0b; font-size: 1.1rem; letter-spacing: 1px;">${stars}</td>
                                <td style="padding: 1rem;">
                                    <strong style="display:block; font-size: 0.9rem; color: #0f172a; margin-bottom: 4px;">${r.title}</strong>
                                    <p style="margin: 0; font-size: 0.85rem; color: #475569; line-height: 1.5; max-height: 60px; overflow: hidden; text-overflow: ellipsis;">${r.comment}</p>
                                </td>
                                <td style="padding: 1rem;">${badgeHtml}</td>
                                <td style="padding: 1rem;">
                                    <div style="display: flex; gap: 6px; align-items: center; flex-wrap: wrap;">
                                        ${r.status === 'pending' || r.status === 'rejected' ? `<button class="btn btn-outline" style="padding: 4px 10px; font-size: 0.75rem; border-color: #10b981; color: #10b981;" onclick="window.approveReviewFunc('${r.id}')">تایید و انتشار</button>` : ''}
                                        ${r.status === 'pending' || r.status === 'approved' ? `<button class="btn btn-outline" style="padding: 4px 10px; font-size: 0.75rem; border-color: #f59e0b; color: #f59e0b;" onclick="window.openRejectReviewModal('${r.id}')">رد نظر</button>` : ''}
                                        <button class="btn btn-outline" style="padding: 4px 10px; font-size: 0.75rem; border-color: #ef4444; color: #ef4444;" onclick="window.deleteReviewAdminFunc('${r.id}')">حذف</button>
                                    </div>
                                </td>
                            </tr>
                        `;
                    }).join('') : '<tr><td colspan="6" style="text-align: center; padding: 3rem; color: #64748b;">هیچ نظری در سیستم ثبت نشده است.</td></tr>'}
                </tbody>
            </table>
        </div>
    `;
}

window.approveReviewFunc = async (id) => {
    try {
        await ReviewService.updateReviewStatus(id, 'approved', null);
        loadTab('reviews');
    } catch (error) { alert(error.message); }
};

window.openRejectReviewModal = (id) => {
    const modalHtml = `
        <div id="reject-review-modal" class="modal-overlay" style="z-index: 9999;">
            <div class="modal-content" style="max-width: 400px;">
                <div class="modal-header">
                    <h3>رد کردن نظر (غیرفعال‌سازی)</h3>
                    <button class="btn-close" onclick="document.getElementById('reject-review-modal').remove()">✕</button>
                </div>
                <div class="modal-body" style="text-align: right;">
                    <p style="font-size: 0.9rem; color: #64748b; margin-bottom: 1rem;">لطفاً دلیل رد این نظر را بنویسید. این دلیل به کاربر نمایش داده می‌شود تا بتواند نظر خود را ویرایش کند.</p>
                    <textarea id="reject-reason-input" class="form-input" rows="3" placeholder="مثلاً: استفاده از کلمات نامناسب یا عدم ارتباط با محصول..."></textarea>
                    <div style="display: flex; gap: 10px; margin-top: 1.5rem;">
                        <button class="btn btn-outline" style="flex: 1;" onclick="document.getElementById('reject-review-modal').remove()">انصراف</button>
                        <button class="btn btn-primary" style="flex: 1; background: #dc2626; border-color: #dc2626;" onclick="window.submitRejectReview('${id}')">تایید و رد نظر</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
};

window.submitRejectReview = async (id) => {
    const reason = document.getElementById('reject-reason-input').value.trim();
    if (!reason) return alert('وارد کردن دلیل رد الزامی است.');
    try {
        await ReviewService.updateReviewStatus(id, 'rejected', reason);
        document.getElementById('reject-review-modal').remove();
        loadTab('reviews');
    } catch (error) { alert(error.message); }
};

window.deleteReviewAdminFunc = async (id) => {
    if (confirm('آیا از حذف دائم و بدون بازگشت این نظر اطمینان دارید؟')) {
        try {
            await ReviewService.deleteReview(id);
            loadTab('reviews');
        } catch (error) { alert(error.message); }
    }
};

// ==========================================
// 🌟 مدیریت تیکت‌های پشتیبانی در پنل ادمین
// ==========================================
async function renderSupportTickets(container) {
    const tickets = await SupportService.getAllTicketsForAdmin();
    container.innerHTML = `
        <div class="admin-table-wrapper">
            <div class="admin-table-toolbar">
                <h2 style="font-size: 1.2rem; color: #0f172a; margin: 0;">پشتیبانی و تیکت‌های کاربران</h2>
            </div>
            <table class="panel-table">
                <thead>
                    <tr>
                        <th>کد پیگیری</th>
                        <th>کاربر / شرکت</th>
                        <th>موضوع</th>
                        <th>تاریخ بروزرسانی</th>
                        <th>وضعیت</th>
                        <th>عملیات</th>
                    </tr>
                </thead>
                <tbody>
                    ${tickets.length > 0 ? tickets.map(t => {
                        let badge = t.status === 'open' ? '<span class="status-badge" style="background:#fef3c7; color:#d97706;">در انتظار ادمین</span>' :
                                    t.status === 'replied' ? '<span class="status-badge" style="background:#d1fae5; color:#059669;">پاسخ داده شده</span>' :
                                    '<span class="status-badge" style="background:#f1f5f9; color:#475569;">بسته شده</span>';
                        return `
                            <tr>
                                <td style="font-family: monospace; color:#64748b; font-size:0.85rem;">#${t.id.split('-')[1]}</td>
                                <td style="font-weight: 600; color: var(--color-primary);">${t.companyName}</td>
                                <td>${t.subject}</td>
                                <td style="color: #64748b;" dir="ltr">${new Date(t.updatedAt).toLocaleDateString('fa-IR')}</td>
                                <td>${badge}</td>
                                <td>
                                    <button class="btn btn-outline" style="padding: 4px 8px; font-size: 0.8rem;" onclick="window.openAdminTicketModal('${t.id}')">مشاهده و پاسخ</button>
                                </td>
                            </tr>
                        `;
                    }).join('') : '<tr><td colspan="6" style="text-align: center; padding: 2rem;">تیکتی برای نمایش وجود ندارد.</td></tr>'}
                </tbody>
            </table>
        </div>
    `;
}

window.openAdminTicketModal = async (ticketId) => {
    const tickets = await SupportService.getAllTicketsForAdmin();
    const tkt = tickets.find(t => t.id === ticketId);
    if(!tkt) return;

    const msgsHtml = tkt.messages.map(m => {
        const isAdmin = m.sender === 'admin';
        return `
            <div style="display: flex; justify-content: ${isAdmin ? 'flex-end' : 'flex-start'}; margin-bottom: 15px;">
                <div style="max-width: 85%; background: ${isAdmin ? '#f8fafc' : '#eff6ff'}; border: 1px solid ${isAdmin ? '#e2e8f0' : '#bfdbfe'}; padding: 10px 15px; border-radius: 8px;">
                    <div style="font-size: 0.75rem; color: #64748b; margin-bottom: 5px; font-weight: bold;">${isAdmin ? 'شما (ادمین)' : tkt.companyName}</div>
                    <p style="margin: 0 0 5px 0; font-size: 0.95rem; line-height: 1.6; color: #1e293b;">${m.text}</p>
                    <span style="font-size: 0.7rem; color: #94a3b8; display: block; text-align: ${isAdmin ? 'right' : 'left'};" dir="ltr">${m.date}</span>
                </div>
            </div>
        `;
    }).join('');

    const modalHtml = `
        <div id="admin-view-ticket-modal" class="modal-overlay" style="z-index: 9999;">
            <div class="modal-content" style="max-width: 600px; width: 95%;">
                <div class="modal-header">
                    <div>
                        <h3 style="margin: 0; font-size: 1.1rem;">تیکت شرکت: ${tkt.companyName}</h3>
                        <span style="font-size: 0.8rem; color: #64748b;">موضوع: ${tkt.subject}</span>
                    </div>
                    <button class="btn-close" onclick="document.getElementById('admin-view-ticket-modal').remove()">✕</button>
                </div>
                <div class="modal-body" style="padding: 0; background: #fdfdfd; text-align:right;">
                    <div style="padding: 20px; max-height: 400px; min-height: 200px; overflow-y: auto;" id="admin-ticket-chat-area">
                        ${msgsHtml}
                    </div>
                    ${tkt.status !== 'closed' ? `
                    <div style="padding: 15px 20px; border-top: 1px solid var(--color-border); background: white;">
                        <textarea id="admin-ticket-reply-msg" class="form-input" rows="3" placeholder="پاسخ خود را به کاربر بنویسید..." style="margin-bottom: 10px;"></textarea>
                        <div style="display:flex; gap:10px;">
                            <button class="btn btn-outline" style="flex:1; color:#ef4444; border-color:#ef4444;" onclick="window.adminCloseTicket('${tkt.id}')">بستن تیکت</button>
                            <button class="btn btn-primary" style="flex:2;" onclick="window.adminReplyTicket('${tkt.id}', event)">ارسال پاسخ به کاربر</button>
                        </div>
                    </div>
                    ` : `
                    <div style="padding: 15px; text-align: center; background: #f1f5f9; color: #64748b; font-size: 0.9rem; border-top: 1px solid var(--color-border);">
                        این تیکت بسته شده است.
                    </div>
                    `}
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    const area = document.getElementById('admin-ticket-chat-area');
    area.scrollTop = area.scrollHeight;
};

window.adminReplyTicket = async (ticketId, event) => {
    const msg = document.getElementById('admin-ticket-reply-msg').value.trim();
    if(!msg) return;
    event.target.textContent = 'در حال ارسال...';
    event.target.disabled = true;
    await SupportService.addReply(ticketId, msg, true);
    document.getElementById('admin-view-ticket-modal').remove();
    window.openAdminTicketModal(ticketId);
    window.loadTab('support');
};

window.adminCloseTicket = async (ticketId) => {
    if(confirm('آیا از بستن این تیکت اطمینان دارید؟ کاربر دیگر قادر به پاسخگویی نخواهد بود.')) {
        await SupportService.closeTicket(ticketId);
        document.getElementById('admin-view-ticket-modal').remove();
        window.loadTab('support');
    }
};