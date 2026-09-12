// js/pages/search.js

import { renderHeader } from '../components/header.js';
import { renderFooter } from '../components/footer.js';
import { SearchService } from '../services/searchService.js';
import { CategoryService } from '../services/categoryService.js';
import { AnalyticsService } from '../services/analyticsService.js';

// وضعیت (State) فعلی جستجو
const searchState = {
    query: '',
    filters: {
        category: 'all',
        supplier: 'all',
        country: 'all'
    },
    sort: 'relevance'
};

document.addEventListener('DOMContentLoaded', async () => {
    // 1. رندر هدر و فوتر
    document.getElementById('app-header').innerHTML = renderHeader();
    document.getElementById('app-footer').innerHTML = renderFooter();

    // 2. خواندن پارامترهای URL
    const urlParams = new URLSearchParams(window.location.search);
    const q = urlParams.get('q');
    const cat = urlParams.get('category');

    if (q) searchState.query = q;
    if (cat) searchState.filters.category = cat;

    // اتصال توابع به Window برای فراخوانی از HTML
    window.SearchAPI = {
        changeSort: (val) => {
            searchState.sort = val;
            AnalyticsService.trackInteraction('Search Sort Changed', 'Search', searchState.query, null, { sort: val });
            executeSearch();
        },
        changeFilter: (type, val) => {
            searchState.filters[type] = val;
            AnalyticsService.trackInteraction('Search Filter Used', 'Search', searchState.query, null, { filterType: type, value: val });
            executeSearch();
        },
        clearFilters: () => {
            searchState.filters = { category: 'all', supplier: 'all', country: 'all' };
            searchState.query = '';
            // پاک کردن URL و جستجوی مجدد
            window.history.pushState({}, '', 'search.html');
            executeSearch();
        }
    };

    // 3. اجرای جستجوی اولیه
    await executeSearch();
});

async function executeSearch() {
    const container = document.getElementById('search-results-container');
    const titleEl = document.getElementById('search-page-title');
    const metaEl = document.getElementById('search-page-meta');
    
    container.innerHTML = '<div style="text-align: center; padding: 5rem; color: #64748b;">در حال دریافت نتایج...</div>';

    // تنظیم هدر صفحه
    if (searchState.query) {
        titleEl.textContent = `نتایج جستجو برای: «${searchState.query}»`;
    } else if (searchState.filters.category !== 'all') {
        const catObj = await CategoryService.getCategoryById(searchState.filters.category);
        titleEl.textContent = catObj ? `محصولات دسته‌بندی: ${catObj.name}` : 'تمام محصولات';
    } else {
        titleEl.textContent = 'جستجوی پیشرفته در تمام سیستم';
    }

    // دریافت نتایج از SearchService
    const results = await SearchService.search(searchState.query, searchState.filters, searchState.sort);
    
    metaEl.textContent = `${results.totalResults} نتیجه یافت شد`;

    // 🌟 مدیریت Empty State (تعداد نتایج = 0)
    if (results.totalResults === 0) {
        AnalyticsService.trackInteraction('Zero Result Search', 'Search', searchState.query, searchState.filters.category);
        
        container.innerHTML = `
            <div style="background: white; border: 1px dashed #cbd5e1; border-radius: 16px; padding: 5rem 2rem; text-align: center;">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom: 1.5rem;"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                <h2 style="font-size: 1.5rem; color: #1e293b; margin-bottom: 10px;">هیچ نتیجه‌ای یافت نشد!</h2>
                <p style="color: #64748b; font-size: 1rem; margin-bottom: 2rem;">برای عبارت <strong style="color:#0f172a;">"${searchState.query}"</strong> با فیلترهای فعلی، مورد منطبقی پیدا نکردیم.</p>
                
                <div style="display: flex; gap: 15px; justify-content: center;">
                    <button class="btn btn-primary" onclick="window.SearchAPI.clearFilters()">پاک کردن فیلترها و جستجوی مجدد</button>
                    <a href="products.html?category=all" class="btn btn-outline" style="text-decoration:none;">مشاهده کل محصولات</a>
                </div>
                
                <div style="margin-top: 3rem; text-align: right; background: #f8fafc; padding: 1.5rem; border-radius: 12px; display: inline-block; text-align: right;">
                    <strong style="display:block; margin-bottom: 10px; color:#334155;">پیشنهادات برای جستجوی بهتر:</strong>
                    <ul style="list-style: disc; margin-right: 20px; color: #475569; font-size: 0.9rem; line-height: 1.8;">
                        <li>املای کلمات را بررسی کنید.</li>
                        <li>از کلمات کلیدی عمومی‌تر و کوتاه‌تر استفاده کنید (مثلاً "روغن" به جای "روغن موتور فلان").</li>
                        <li>اگر فیلتر خاصی اعمال کرده‌اید (مثل کشور یا تأمین‌کننده)، آن را حذف کنید.</li>
                    </ul>
                </div>
            </div>
        `;
        // رندر فیلترهای سایدبار حتی در زمان خالی بودن
        await renderSidebarFilters([], true);
        return;
    }

    // 🌟 رندر نتایج موفق 🌟
    let contentHtml = '';

    // 1. نمایش شرکت‌های منطبق (فقط اگر سرچ متنی باشد و شرکتی پیدا شود)
    if (results.companies.length > 0) {
        contentHtml += `
            <div style="margin-bottom: 2.5rem;">
                <h3 style="font-size: 1.1rem; color: #1e293b; margin-bottom: 1rem; border-bottom: 2px solid #f1f5f9; padding-bottom: 10px;">تأمین‌کنندگان و شرکت‌های مرتبط</h3>
                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 15px;">
                    ${results.companies.map(biz => `
                        <a href="business.html?id=${biz.id}" class="company-result-card" style="text-decoration: none;" onclick="AnalyticsService.trackInteraction('Search Result Clicked', 'Company', '${biz.id}')">
                            <img src="${biz.logo}" style="width: 50px; height: 50px; border-radius: 8px; border: 1px solid #e2e8f0; object-fit: cover;">
                            <div>
                                <h4 style="margin: 0 0 4px 0; color: var(--color-primary); font-size: 1rem;">${biz.name}</h4>
                                <span style="font-size: 0.8rem; color: #64748b; background: #f1f5f9; padding: 2px 8px; border-radius: 12px;">${biz.industry}</span>
                            </div>
                        </a>
                    `).join('')}
                </div>
            </div>
        `;
    }

    // 2. نمایش محصولات
    if (results.products.length > 0) {
        contentHtml += `
            <div>
                <h3 style="font-size: 1.1rem; color: #1e293b; margin-bottom: 1rem; border-bottom: 2px solid #f1f5f9; padding-bottom: 10px;">محصولات یافت شده</h3>
                <div class="grid-container" style="grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));">
                    ${results.products.map(product => `
                        <div class="product-card">
                            <div class="product-image-wrapper" style="height: 180px;">
                                <a href="product.html?id=${product.id}" onclick="AnalyticsService.trackInteraction('Search Result Clicked', 'Product', '${product.id}')">
                                    <img src="${product.image}" alt="${product.name}" class="product-image" loading="lazy">
                                </a>
                                <span class="product-badge">${product.categoryName}</span>
                            </div>
                            <div class="product-details" style="padding: 1rem;">
                                <a href="product.html?id=${product.id}" style="text-decoration: none;" onclick="AnalyticsService.trackInteraction('Search Result Clicked', 'Product', '${product.id}')">
                                    <h3 class="product-title" style="font-size: 0.95rem; margin-bottom: 5px;">${product.name}</h3>
                                </a>
                                <div style="font-size: 0.8rem; color: #64748b; margin-bottom: 10px;">${product.brand || 'بدون برند'}</div>
                                <div style="margin-top: auto; display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #f1f5f9; padding-top: 10px;">
                                    <span style="font-size: 0.8rem; font-weight: 600; color: var(--color-primary);">${product.supplierName}</span>
                                    <span style="font-size: 0.8rem; color: #475569;">${product.country}</span>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    container.innerHTML = contentHtml;

    // 4. استخراج و رندر فیلترهای داینامیک از روی نتایج
    // برای اینکه فیلترها بر اساس سرچ کاربر پر شوند، جستجوی بدون فیلتر را شبیه‌سازی می‌کنیم
    const baseResults = await SearchService.search(searchState.query, {}, 'relevance');
    await renderSidebarFilters(baseResults.products);
}

async function renderSidebarFilters(availableProducts, isEmpty = false) {
    const sidebar = document.getElementById('filters-sidebar');
    if (!sidebar) return;

    // دریافت دسته‌بندی‌های کلی سیستم
    const allCategories = await CategoryService.getAllCategories();
    
    // استخراج فیلترهای داینامیک از محصولاتی که با این کوئری همخوانی دارند
    const filtersData = await SearchService.getAvailableFilters(availableProducts);

    let html = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
            <h3 style="margin: 0; font-size: 1.1rem; color: #0f172a;">فیلتر نتایج</h3>
            ${searchState.query || searchState.filters.category !== 'all' || searchState.filters.supplier !== 'all' ? 
                `<button style="background:none; border:none; color: #ef4444; font-size: 0.8rem; cursor: pointer; font-family: inherit; font-weight: bold;" onclick="window.SearchAPI.clearFilters()">حذف فیلترها ✕</button>` : ''}
        </div>
    `;

    // فیلتر ۱: دسته‌بندی‌ها
    html += `
        <div class="filter-section">
            <div class="filter-title">دسته‌بندی (Category)</div>
            <select class="filter-select" onchange="window.SearchAPI.changeFilter('category', this.value)">
                <option value="all">همه دسته‌بندی‌ها</option>
                ${allCategories.map(c => `<option value="${c.id}" ${searchState.filters.category === c.id ? 'selected' : ''}>${c.name}</option>`).join('')}
            </select>
        </div>
    `;

    // فیلتر ۲: تأمین‌کنندگان (بر اساس نتایج موجود)
    if (!isEmpty && filtersData.suppliers.length > 0) {
        html += `
            <div class="filter-section">
                <div class="filter-title">تأمین‌کننده (Supplier)</div>
                <select class="filter-select" onchange="window.SearchAPI.changeFilter('supplier', this.value)">
                    <option value="all">همه تأمین‌کنندگان</option>
                    ${filtersData.suppliers.map(s => `<option value="${s.id}" ${searchState.filters.supplier === s.id ? 'selected' : ''}>${s.name}</option>`).join('')}
                </select>
            </div>
        `;
    }

    // فیلتر ۳: کشور سازنده (بر اساس نتایج موجود)
    if (!isEmpty && filtersData.countries.length > 0) {
        html += `
            <div class="filter-section">
                <div class="filter-title">کشور مبدأ (Country)</div>
                <select class="filter-select" onchange="window.SearchAPI.changeFilter('country', this.value)">
                    <option value="all">همه کشورها</option>
                    ${filtersData.countries.map(c => `<option value="${c}" ${searchState.filters.country === c ? 'selected' : ''}>${c}</option>`).join('')}
                </select>
            </div>
        `;
    }

    sidebar.innerHTML = html;
}