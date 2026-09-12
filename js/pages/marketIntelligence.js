// js/pages/marketIntelligence.js

import { renderHeader } from '../components/header.js';
import { renderFooter } from '../components/footer.js';
import { AnalyticsService } from '../services/analyticsService.js';
import { CategoryService } from '../services/categoryService.js';

// نگهداری وضعیت فعلی فیلترهای داشبورد
window.miState = {
    category: 'all',
    dateRange: 'all' // می‌تواند عدد (7, 30) یا آبجکت {from, to} باشد
};

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const headerEl = document.getElementById('app-header');
        const footerEl = document.getElementById('app-footer');
        if (headerEl) headerEl.innerHTML = renderHeader();
        if (footerEl) footerEl.innerHTML = renderFooter();

        await initFilterDropdown();
        await loadDashboardData();

    } catch (error) {
        console.error("Market Intelligence Error:", error);
        document.getElementById('market-dashboard-container').innerHTML = `
            <div style="background: #fef2f2; border: 1px solid #f87171; color: #991b1b; padding: 2rem; border-radius: 12px; text-align: right;">
                <h3 style="margin-bottom: 10px;">خطا در دریافت اطلاعات بازار</h3>
                <p>دلیل خطا: <strong>${error.message}</strong></p>
            </div>
        `;
    }
});

// پر کردن منوی کشویی صنایع
async function initFilterDropdown() {
    const filterSelect = document.getElementById('industry-filter');
    if (!filterSelect) return;
    
    const categories = await CategoryService.getAllCategories();
    
    let optionsHtml = '<option value="all">نمایش کل بازار (همه صنایع)</option>';
    categories.forEach(cat => {
        optionsHtml += `<option value="${cat.id}">${cat.name}</option>`;
    });
    
    filterSelect.innerHTML = optionsHtml;
}

// توابع متصل به دکمه‌های HTML
window.changeMarketCategory = (categoryId) => {
    window.miState.category = categoryId;
    loadDashboardData();
};

window.changeMarketDateFilter = (days, btn) => {
    const buttons = btn.parentElement.querySelectorAll('button:not(#mi-custom-date-container button)');
    buttons.forEach(b => {
        b.classList.remove('btn-primary');
        b.classList.add('btn-outline');
    });
    btn.classList.remove('btn-outline');
    btn.classList.add('btn-primary');
    
    const container = document.getElementById('mi-custom-date-container');
    if (days === 'custom') {
        container.style.display = 'flex';
    } else {
        container.style.display = 'none';
        window.miState.dateRange = days;
        loadDashboardData();
    }
};

window.applyMarketCustomDate = () => {
    const fromDate = document.getElementById('mi-date-from').value;
    const toDate = document.getElementById('mi-date-to').value;
    if(!fromDate || !toDate) return alert('لطفاً هر دو تاریخ شروع و پایان را مشخص کنید.');
    window.miState.dateRange = { from: fromDate, to: toDate };
    loadDashboardData();
};

// تابع اصلی برای رندر و آپدیت باکس‌ها
async function loadDashboardData() {
    const container = document.getElementById('market-dashboard-container');
    container.innerHTML = '<div style="text-align:center; padding: 3rem; color:#64748b;">در حال محاسبه مجدد داده‌ها...</div>';

    const { category, dateRange } = window.miState;

    // ارسال مقادیر فیلتر به سرویس
    const overview = await AnalyticsService.getMarketOverview(category, dateRange);
    const trending = await AnalyticsService.getTrendingSearches(category, dateRange);
    const opportunities = await AnalyticsService.getMarketOpportunities(category, dateRange);
    const demandByCountry = await AnalyticsService.getDemandByCountry(category, dateRange);

    const hasData = overview.totalSearches > 0 || overview.totalProductViews > 0 || overview.totalRfqs > 0;

    if (!hasData) {
        container.innerHTML = `
            <div style="background: white; border: 1px solid var(--color-border); color: #64748b; padding: 5rem 2rem; text-align: center; border-radius: 16px;">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom: 1.5rem;"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
                <h3 style="margin-bottom: 10px; color: #334155; font-size: 1.3rem;">داده‌ای یافت نشد</h3>
                <p style="font-size: 1rem; max-width: 500px; margin: 0 auto; line-height: 1.6;">در بازه زمانی و یا صنعت انتخابی شما، هیچ فعالیتی در پلتفرم ثبت نشده است. لطفاً فیلترهای خود را تغییر دهید.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = `
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1.5rem; margin-bottom: 2rem;">
            <div class="mi-stat-card">
                <div>
                    <p style="font-size: 0.85rem; color: #64748b; margin-bottom: 5px; font-weight: bold;">حجم جستجوهای بازار</p>
                    <h3 style="font-size: 1.8rem; color: #0f172a; margin: 0;">${overview.totalSearches}</h3>
                </div>
                <div style="background: #f1f5f9; padding: 12px; border-radius: 50%;"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#475569" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg></div>
            </div>
            <div class="mi-stat-card">
                <div>
                    <p style="font-size: 0.85rem; color: #64748b; margin-bottom: 5px; font-weight: bold;">بازدید محصولات (تقاضا)</p>
                    <h3 style="font-size: 1.8rem; color: #0f172a; margin: 0;">${overview.totalProductViews}</h3>
                </div>
                <div style="background: #eff6ff; padding: 12px; border-radius: 50%;"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg></div>
            </div>
            <div class="mi-stat-card">
                <div>
                    <p style="font-size: 0.85rem; color: #64748b; margin-bottom: 5px; font-weight: bold;">درخواست‌های خرید (RFQ)</p>
                    <h3 style="font-size: 1.8rem; color: #0f172a; margin: 0;">${overview.totalRfqs}</h3>
                </div>
                <div style="background: #ecfdf5; padding: 12px; border-radius: 50%;"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg></div>
            </div>
            <div class="mi-stat-card">
                <div>
                    <p style="font-size: 0.85rem; color: #64748b; margin-bottom: 5px; font-weight: bold;">تنوع بازارهای هدف</p>
                    <h3 style="font-size: 1.8rem; color: #0f172a; margin: 0;">${overview.activeCountriesCount}</h3>
                </div>
                <div style="background: #fdf4ff; padding: 12px; border-radius: 50%;"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#d946ef" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg></div>
            </div>
        </div>

        <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 2rem;">
            <div class="mi-section">
                <h2 style="font-size: 1.3rem; margin-bottom: 1.5rem; color: #1e293b; border-bottom: 2px solid #f1f5f9; padding-bottom: 10px;">
                    تحلیل فرصت‌ها و اشباع بازار ${category !== 'all' ? '(مختص این صنعت)' : ''}
                </h2>
                ${renderOppTable(opportunities)}
            </div>

            <div>
                <div class="mi-section">
                    <h2 style="font-size: 1.2rem; margin-bottom: 1.5rem; color: #1e293b;">کلمات کلیدی داغ (Trending)</h2>
                    ${trending.length === 0 ? '<div style="text-align:center; color:#94a3b8; font-size:0.9rem;">داده‌ای منطبق با فیلتر یافت نشد</div>' : renderTrendingList(trending)}
                </div>

                <div class="mi-section">
                    <h2 style="font-size: 1.2rem; margin-bottom: 1.5rem; color: #1e293b;">نقشه تقاضا (کشورها)</h2>
                    ${demandByCountry.length === 0 ? '<div style="text-align:center; color:#94a3b8; font-size:0.9rem;">داده صادراتی یافت نشد</div>' : renderCountryList(demandByCountry)}
                </div>
            </div>
        </div>
    `;
}

// ======================= توابع رندر جداول =======================
function renderOppTable(opportunities) {
    const activeOpp = opportunities.filter(o => o.supply > 0 || o.demandScore > 0);
    if (activeOpp.length === 0) return '<div style="text-align:center; padding: 2rem; color:#94a3b8;">داده‌ای برای تحلیل یافت نشد.</div>';
    const maxDemand = Math.max(...activeOpp.map(o => o.demandScore));

    return `
        <table class="panel-table" style="width: 100%; border: none;">
            <thead>
                <tr>
                    <th style="background: transparent; border-bottom: 2px solid #e2e8f0; padding-bottom: 15px;">گروه صنعتی / دسته‌بندی</th>
                    <th style="background: transparent; border-bottom: 2px solid #e2e8f0; padding-bottom: 15px; text-align: center;">حجم عرضه</th>
                    <th style="background: transparent; border-bottom: 2px solid #e2e8f0; padding-bottom: 15px;">شاخص تقاضا</th>
                    <th style="background: transparent; border-bottom: 2px solid #e2e8f0; padding-bottom: 15px;">وضعیت فرصت</th>
                </tr>
            </thead>
            <tbody>
                ${activeOpp.map(opp => {
                    const progressPercent = maxDemand > 0 ? (opp.demandScore / maxDemand) * 100 : 0;
                    return `
                    <tr>
                        <td style="font-weight: 600; color: #1e293b;">${opp.categoryName}</td>
                        <td style="text-align: center; font-weight: bold; color: #64748b;">${opp.supply}</td>
                        <td style="width: 35%;">
                            <div style="display: flex; align-items: center; gap: 10px;">
                                <span style="font-weight: bold; color: #0f172a; min-width: 25px;">${opp.demandScore}</span>
                                <div class="progress-bar-bg">
                                    <div class="progress-bar-fill" style="width: ${progressPercent}%; background-color: ${opp.color};"></div>
                                </div>
                            </div>
                        </td>
                        <td>
                            <span style="display: inline-block; padding: 4px 10px; border-radius: 6px; font-size: 0.8rem; font-weight: 600; border: 1px solid ${opp.color}; color: ${opp.color}; background-color: ${opp.color}15;">
                                ${opp.statusLabel}
                            </span>
                        </td>
                    </tr>
                `}).join('')}
            </tbody>
        </table>
    `;
}

function renderTrendingList(trending) {
    const maxSearch = trending[0].count;
    return trending.map((item, index) => {
        const percent = (item.count / maxSearch) * 100;
        return `
        <div style="margin-bottom: 15px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 6px; font-size: 0.95rem;">
                <span style="font-weight: 600; color: #334155;">
                    <span style="color:#94a3b8; margin-left:5px;">#${index+1}</span> ${item.keyword}
                </span>
                <span style="font-weight: bold; color: var(--color-primary);">${item.count} بار</span>
            </div>
            <div class="progress-bar-bg" style="height: 6px;">
                <div class="progress-bar-fill" style="width: ${percent}%; background-color: var(--color-primary);"></div>
            </div>
        </div>
    `}).join('');
}

function renderCountryList(countries) {
    return countries.map(item => `
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid #f1f5f9;">
            <div style="display: flex; align-items: center; gap: 10px;">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                <span style="font-weight: 600; color: #1e293b; font-size: 0.95rem;">${item.country}</span>
            </div>
            <span style="background: #fdf4ff; color: #d946ef; padding: 4px 12px; border-radius: 12px; font-size: 0.85rem; font-weight: bold;">
                ${item.score}
            </span>
        </div>
    `).join('');
}