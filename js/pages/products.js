// js/pages/products.js

import { renderHeader } from '../components/header.js';
import { renderFooter } from '../components/footer.js';
import { ProductService } from '../services/productService.js';
import { CategoryService } from '../services/categoryService.js';
import { AppStore } from '../data/appStore.js';

document.addEventListener('DOMContentLoaded', async () => {
    const headerElement = document.querySelector('header') || document.getElementById('app-header');
    if(headerElement) headerElement.innerHTML = renderHeader();
    
    const footerElement = document.querySelector('footer') || document.getElementById('app-footer');
    if(footerElement) footerElement.innerHTML = renderFooter();

    const urlParams = new URLSearchParams(window.location.search);
    const categoryId = urlParams.get('category') || 'all';

    const titleEl = document.getElementById('page-title');
    const descEl = document.getElementById('page-desc');
    const gridEl = document.getElementById('products-grid');

    if (categoryId === 'all') {
        titleEl.innerHTML = `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: bottom; margin-left: 8px;"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg> تمام محصولات صنعتی`;
        descEl.textContent = 'جستجو و استعلام مستقیم از بین تمامی محصولات موجود در شبکه تأمین‌کنندگان TradeCore.';
    } else {
        const category = await CategoryService.getCategoryById(categoryId);
        if (category) {
            titleEl.innerHTML = `<span style="vertical-align: middle;">${category.icon}</span> ${category.name}`;
            descEl.textContent = category.description;
        } else {
            titleEl.textContent = 'دسته‌بندی نامشخص';
            descEl.textContent = 'این دسته‌بندی وجود ندارد یا حذف شده است.';
        }
    }

    const products = await ProductService.getProductsByCategoryId(categoryId);
    renderProductCards(products, gridEl);
});

// 🌟 تابع اختصاصی مقایسه با محدودیت 5 محصول
window.toggleProdCompare = (id, btn, event) => {
    event.preventDefault(); 
    event.stopPropagation();
    
    const currentList = AppStore.getFavProducts();
    const isCurrentlyAdded = currentList.includes(id);
    
    // کنترل محدودیت 5 تایی (اگر آیتم جدید است و لیست پر است)
    if (!isCurrentlyAdded && currentList.length >= 5) {
        alert('حداکثر ۵ محصول برای مقایسه همزمان قابل انتخاب است. جهت مقایسه محصولات جدید، لطفاً موارد قبلی را از لیست خود در داشبورد حذف کنید.');
        return;
    }

    AppStore.toggleFavProduct(id);
    const isAdded = AppStore.getFavProducts().includes(id);
    
    if (isAdded) {
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
        btn.style.color = '#475569';
        btn.style.borderColor = '#cbd5e1';
        btn.innerHTML = '+ افزودن به لیست مقایسه';
    }
};

function renderProduct(product, supplier, isFavorite) {
  let specsHtml = '';
  if (product.specifications) {
      specsHtml = Object.entries(product.specifications).map(([key, value]) => `
          <div style="display: flex; justify-content: space-between; padding: 15px; border-bottom: 1px solid #e2e8f0;">
              <span style="font-weight: 600; color: #475569;">${key}:</span>
              <span style="color: #64748b; text-align: left;" dir="ltr">${value}</span>
          </div>
      `).join('');
  }

  // بررسی اینکه آیا این محصول در حال حاضر در لیست مقایسه هست یا نه
  const compareList = window.AppStore.getFavProducts();
  const isCompared = compareList.includes(product.id);

  const content = `
      <div class="container" style="margin-top: 3rem; margin-bottom: 3rem;">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 3rem; align-items: start;">
              
              <div style="background: white; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); padding: 2rem; display: flex; justify-content: center;">
                  <img src="${product.image}" alt="${product.name}" style="max-width: 100%; max-height: 450px; object-fit: contain; border-radius: 8px;">
              </div>

              <div>
                  <h1 style="font-size: 2.2rem; margin-bottom: 1rem; color: #1e293b;">${product.name}</h1>
                  
                  <div style="display: flex; gap: 10px; margin-bottom: 1.5rem; align-items: center;">
                      <span style="background: #eff6ff; color: #2563eb; padding: 5px 12px; border-radius: 20px; font-size: 0.9rem; font-weight: bold;">برند: ${product.brand || 'عمومی'}</span>
                      <span style="background: #f1f5f9; color: #64748b; padding: 5px 12px; border-radius: 20px; font-size: 0.9rem;">${product.country || 'ایران'}</span>
                      
                      <!-- 🌟 این همون دکمه مقایسه‌ست که به HTML اضافه شد و به تابع متصل شد 🌟 -->
                      <button onclick="window.toggleSingleProdCompare(this)" style="background: ${isCompared ? '#1e293b' : 'rgba(255,255,255,0.9)'}; color: ${isCompared ? '#fff' : '#475569'}; border: 1px solid ${isCompared ? '#1e293b' : '#cbd5e1'}; padding: 5px 12px; border-radius: 20px; font-size: 0.9rem; font-weight: bold; cursor: pointer; transition: 0.3s; margin-right: auto;">
                          ${isCompared ? '✓ حذف از لیست مقایسه' : '+ افزودن به لیست مقایسه'}
                      </button>
                  </div>
                  
                  <p style="color: #475569; line-height: 1.8; font-size: 1.05rem; margin-bottom: 2rem;">
                      ${product.shortDescription || 'توضیحات کوتاه برای این محصول ثبت نشده است.'}
                  </p>

                  <div style="background: white; padding: 1.5rem; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); border: 1px solid #e2e8f0; margin-bottom: 2rem;">
                      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; border-bottom: 1px solid #e2e8f0; padding-bottom: 1rem;">
                          <div style="display: flex; align-items: center; gap: 15px;">
                              <img src="${supplier.logo || 'images/default-logo.png'}" style="width: 50px; height: 50px; border-radius: 8px; object-fit: cover; border: 1px solid #cbd5e1;">
                              <div>
                                  <h3 style="font-size: 1.1rem; color: #0f172a; margin-bottom: 5px;">${supplier.name}</h3>
                                  <p style="font-size: 0.85rem; color: #64748b; display: flex; align-items: center;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-left: 4px;"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg> ${supplier.city || 'ایران'}</p>
                              </div>
                          </div>
                          <a href="business.html?id=${supplier.id}" class="btn btn-outline" style="font-size: 0.85rem; padding: 6px 12px;">پروفایل شرکت</a>
                      </div>
                      
                      <div id="rfq-section" style="display: flex; gap: 10px; margin-bottom: 10px;">
                          <button id="btn-open-rfq-modal" class="btn btn-primary" style="flex: 2; padding: 12px; font-size: 1rem;" onclick="openMultiRfqModal()">درخواست خرید (RFQ) و استعلام</button>
                          <button class="btn btn-outline" style="flex: 1; padding: 12px; font-size: 0.95rem; display: flex; align-items: center; justify-content: center; gap: 6px; color: var(--color-primary); border-color: var(--color-primary);" onclick="startDirectChat('${supplier.id}', '${supplier.name}')">
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg> چت مستقیم
                          </button>
                      </div>

                      <button id="btn-favorite-product" class="btn btn-outline btn-full" style="font-weight: bold; transition: all 0.3s ease; border-color: ${isFavorite ? '#eab308' : '#cbd5e1'}; color: ${isFavorite ? '#eab308' : '#475569'}; background: ${isFavorite ? '#fefce8' : 'transparent'}; display: flex; justify-content: center; align-items: center;" onclick="toggleFavoriteProduct(this)">
                          ${isFavorite ? '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-left: 6px;"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg> در علاقه‌مندی‌ها ذخیره شد' : '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-left: 6px;"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg> افزودن به علاقه‌مندی‌ها'}
                      </button>
                  </div>

                  <h3 style="margin-bottom: 1rem; color: #1e293b; font-size: 1.2rem;">مشخصات فنی</h3>
                  <div style="background: white; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
                      ${specsHtml || '<p style="padding: 1rem; color: #64748b;">مشخصاتی ثبت نشده است.</p>'}
                  </div>
              </div>
          </div>
      </div>
  `;

  const container = document.getElementById('product-detail-container') || document.querySelector('main');
  if(container) container.innerHTML = content;
}