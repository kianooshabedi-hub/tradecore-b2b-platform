// js/pages/products.js

import { renderHeader } from '../components/header.js';
import { renderFooter } from '../components/footer.js';
import { ProductService } from '../services/productService.js';
import { CategoryService } from '../services/categoryService.js';

document.addEventListener('DOMContentLoaded', async () => {
    const headerElement = document.querySelector('header') || document.getElementById('app-header');
    if(headerElement) headerElement.innerHTML = renderHeader();
    
    const footerElement = document.querySelector('footer') || document.getElementById('app-footer');
    if(footerElement) footerElement.innerHTML = renderFooter();

    // خوندن آیدی دسته‌بندی از URL
    const urlParams = new URLSearchParams(window.location.search);
    const categoryId = urlParams.get('category') || 'all';

    const titleEl = document.getElementById('page-title');
    const descEl = document.getElementById('page-desc');
    const gridEl = document.getElementById('products-grid');

    // تنظیم عنوان صفحه
    if (categoryId === 'all') {
        titleEl.textContent = '📦 تمام محصولات صنعتی';
        descEl.textContent = 'جستجو و استعلام مستقیم از بین تمامی محصولات موجود در شبکه تأمین‌کنندگان TradeCore.';
    } else {
        const category = await CategoryService.getCategoryById(categoryId);
        if (category) {
            titleEl.innerHTML = `${category.icon} ${category.name}`;
            descEl.textContent = category.description;
        } else {
            titleEl.textContent = 'دسته‌بندی نامشخص';
            descEl.textContent = 'این دسته‌بندی وجود ندارد یا حذف شده است.';
        }
    }

    // گرفتن و رندر محصولات همون دسته
    const products = await ProductService.getProductsByCategoryId(categoryId);
    renderProductCards(products, gridEl);
});

// تابع رندر کارت‌ها (مشابه صفحه اصلی)
function renderProductCards(products, container) {
    if (products.length === 0) {
        container.innerHTML = '<div style="text-align: center; padding: 3rem; width: 100%; color: #ef4444; font-weight: bold; font-size: 1.2rem; background: white; border-radius: 12px; border: 1px dashed #ef4444;">هیچ محصولی در این دسته‌بندی یافت نشد.</div>';
        return;
    }

    container.innerHTML = products.map(product => `
        <div class="product-card" data-id="${product.id}">
          <div class="product-image-wrapper">
            <a href="product.html?id=${product.id}">
              <img src="${product.image}" alt="${product.name}" class="product-image" loading="lazy">
            </a>
            <span class="product-badge">${product.categoryName}</span>
          </div>
          <div class="product-details">
            <a href="product.html?id=${product.id}">
              <h3 class="product-title">${product.name}</h3>
            </a>
            <p class="product-desc">${product.shortDescription}</p>
            <div class="product-supplier" style="font-size: 0.8rem; color: var(--color-primary); margin-top: 5px; display: flex; align-items: center; gap: 5px;">
              🏢 <span style="font-weight: 600;">${product.supplierName}</span>
              ${product.supplierStatus === 'verified' ? '<span title="شرکت تایید شده" style="color: #10b981;">✔️</span>' : ''}
            </div>
            <div class="product-meta">
              <span class="product-country">📍 ${product.country}</span>
              <span class="product-price ${product.priceType === 'rfq' ? 'price-rfq' : ''}">${product.priceRange}</span>
            </div>
          </div>
          <div class="product-actions">
            <button class="btn btn-primary btn-full" onclick="window.location.href='product.html?id=${product.id}&openRfq=true'">درخواست قیمت (RFQ)</button>
          </div>
        </div>
    `).join('');
}